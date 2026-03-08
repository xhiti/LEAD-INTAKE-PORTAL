'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { classifySubmission, generateStatusChangeNote } from '@/lib/ai/service'
import { logAction } from '@/lib/actions/audit'

const submissionSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    business_name: z.string().min(2, 'Business Name is required'),
    industry: z.string().min(1, 'Industry is required'),
    help_request: z.string().min(10, 'Please provide more details on how we can help'),
})

export type SubmissionFormData = z.infer<typeof submissionSchema> & {
    ai_prefetched?: {
        summary: string
        category: string
        confidence_score: number
        model_used: string
    }
}

export async function createInternalSubmissionAction(data: SubmissionFormData, userId: string) {
    try {
        const validated = submissionSchema.parse(data)
        const serviceClient = await createServiceClient()

        let aiResult;
        if (data.ai_prefetched && data.ai_prefetched.summary) {
            aiResult = {
                summary: data.ai_prefetched.summary,
                category: data.ai_prefetched.category,
                confidence_score: data.ai_prefetched.confidence_score,
                model_used: data.ai_prefetched.model_used,
            }
        } else {
            aiResult = await classifySubmission(validated.help_request, 'gemini')
        }

        const { error, data: submission } = await (serviceClient as any)
            .from('submissions')
            .insert({
                submitted_by: userId,
                name: validated.name,
                email: validated.email,
                business_name: validated.business_name,
                industry: validated.industry,
                help_request: validated.help_request,
                ai_summary: aiResult.summary,
                ai_category: aiResult.category,
                ai_confidence_score: aiResult.confidence_score,
                ai_model_used: aiResult.model_used,
                ai_processed_at: new Date().toISOString(),
                status: 'new',
                priority: 'medium',
            })
            .select('id')
            .single()

        if (error) {
            console.error('Failed to create internal submission:', error)
            return { error: error.message }
        }

        try {
            const { data: admins } = await (serviceClient as any)
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'moderator'])

            if (admins && admins.length > 0) {
                const notifications = admins.map((admin: { id: string }) => ({
                    user_id: admin.id,
                    type: 'new_submission',
                    title: `New Submission: ${validated.name}`,
                    body: `${validated.name} from ${validated.business_name} just submitted a new lead.`,
                    data: {
                        submission_id: submission.id,
                        business_name: validated.business_name,
                        category: aiResult.category
                    },
                    action_url: `/en/submissions/${submission.id}`,
                }))

                await (serviceClient as any).from('notifications').insert(notifications)
            }
        } catch (notifyError) {
            console.error('Failed to send new submission notifications:', notifyError)
        }

        await logAction({
            userId,
            action: 'CREATE',
            entityType: 'submission',
            entityId: submission.id,
            newData: { ...validated, ai_summary: aiResult.summary, ai_category: aiResult.category }
        })

        return { success: true, id: submission.id }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: 'Unknown server error occurred.' }
    }
}

export async function updateSubmissionAction(
    id: string,
    data: SubmissionFormData,
    userId: string
) {
    try {
        const validated = submissionSchema.parse(data)
        const serviceClient = await createServiceClient()

        const { data: existing, error: fetchError } = await (serviceClient as any)
            .from('submissions')
            .select('help_request, ai_summary, ai_category, ai_confidence_score, ai_model_used, ai_processed_at')
            .eq('id', id)
            .maybeSingle()

        if (fetchError) {
            console.error('[DEBUG] Fetch existing error:', fetchError)
            return { error: fetchError.message }
        }

        if (!existing) {
            return { error: 'Submission not found' }
        }

        let aiResult = {
            summary: existing?.ai_summary || null,
            category: existing?.ai_category || null,
            confidence_score: existing?.ai_confidence_score || null,
            model_used: existing?.ai_model_used || null,
        }
        let aiProcessedAt = existing?.ai_processed_at || null

        const helpRequestChanged = validated.help_request.trim() !== (existing?.help_request || '').trim()
        const hasPrefetched = !!(data.ai_prefetched && data.ai_prefetched.summary)

        if (hasPrefetched) {
            aiResult = {
                summary: data.ai_prefetched!.summary,
                category: data.ai_prefetched!.category,
                confidence_score: data.ai_prefetched!.confidence_score,
                model_used: data.ai_prefetched!.model_used,
            }
            if (helpRequestChanged || !aiProcessedAt) {
                aiProcessedAt = new Date().toISOString()
            }
        } else if (helpRequestChanged) {
            const newAi = await classifySubmission(validated.help_request, 'gemini')
            aiResult = {
                summary: newAi.summary,
                category: newAi.category,
                confidence_score: newAi.confidence_score,
                model_used: newAi.model_used,
            }
            aiProcessedAt = new Date().toISOString()
        }

        const updatePayload = {
            name: validated.name,
            email: validated.email,
            business_name: validated.business_name,
            industry: validated.industry,
            help_request: validated.help_request,
            ai_summary: aiResult.summary,
            ai_category: aiResult.category,
            ai_confidence_score: aiResult.confidence_score,
            ai_model_used: aiResult.model_used,
            ai_processed_at: aiProcessedAt,
            updated_at: new Date().toISOString(),
        }

        const { error, data: submission } = await (serviceClient as any)
            .from('submissions')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        await logAction({
            userId,
            action: 'UPDATE',
            entityType: 'submission',
            entityId: id,
            oldData: existing,
            newData: updatePayload
        })

        return { success: true, data: submission }
    } catch (error) {
        console.error('Update submission error:', error)
        return { error: error instanceof Error ? error.message : 'Failed to update submission' }
    }
}

export async function deleteSubmissionAction(id: string) {
    try {
        const serviceClient = await createServiceClient()

        const { error } = await (serviceClient as any)
            .from('submissions')
            .update({
                is_deleted: true,
                is_active: false,
                deleted_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error

        await logAction({
            action: 'DELETE',
            entityType: 'submission',
            entityId: id,
            newData: { is_deleted: true, is_active: false }
        })

        return { success: true }
    } catch (error) {
        console.error('Delete submission error:', error)
        return { error: error instanceof Error ? error.message : 'Failed to delete submission' }
    }
}

export async function getSubmissionsForExportAction(filters: {
    searchName?: string;
    searchSurname?: string;
    searchCompany?: string;
    status?: string;
    category?: string;
    industry?: string;
    priority?: string;
    fromDate?: string;
    toDate?: string;
}, isAdmin: boolean, userId: string) {
    try {
        const serviceClient = await createServiceClient()
        let query = (serviceClient as any)
            .from('submissions')
            .select('*')
            .eq('is_active', true)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })

        if (!isAdmin) {
            query = query.eq('submitted_by', userId)
        }

        if (filters.searchName) {
            query = query.ilike('name', `%${filters.searchName}%`)
        }
        if (filters.searchSurname) {
            query = query.ilike('name', `%${filters.searchSurname}%`)
        }
        if (filters.searchCompany) {
            query = query.ilike('business_name', `%${filters.searchCompany}%`)
        }
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }
        if (filters.category && filters.category !== 'all') {
            query = query.eq('ai_category', filters.category)
        }
        if (filters.industry && filters.industry !== 'all') {
            query = query.eq('industry', filters.industry)
        }
        if (filters.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority)
        }
        if (filters.fromDate) {
            query = query.gte('created_at', filters.fromDate)
        }
        if (filters.toDate) {
            const endOfDay = new Date(filters.toDate)
            endOfDay.setHours(23, 59, 59, 999)
            query = query.lte('created_at', endOfDay.toISOString())
        }

        const { data, error } = await query

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('Export fetch error:', error)
        return { error: 'Failed to fetch data for export' }
    }
}

export async function updateSubmissionStatusAction(
    id: string,
    data: {
        status?: string;
        priority?: string;
        note?: string;
    },
    userId: string
) {
    try {
        const serviceClient = await createServiceClient()

        const { data: current } = await (serviceClient as any)
            .from('submissions')
            .select('status, priority')
            .eq('id', id)
            .single()

        if (!current) throw new Error('Submission not found')

        const hasStatusChanged = data.status && data.status !== current.status
        const hasPriorityChanged = data.priority && data.priority !== current.priority

        if (hasStatusChanged || hasPriorityChanged || data.note) {
            let noteToLog = data.note || null

            if (hasStatusChanged && !data.note) {
                const { data: subData } = await (serviceClient as any)
                    .from('submissions')
                    .select('name, business_name, help_request, ai_summary')
                    .eq('id', id)
                    .single()

                if (subData) {
                    noteToLog = await generateStatusChangeNote(subData, current.status, data.status!)
                }
            }

            const { error: updateError } = await (serviceClient as any)
                .from('submissions')
                .update({
                    status: data.status || current.status,
                    priority: data.priority || current.priority,
                    notes: noteToLog,
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (updateError) throw updateError

            const { error: historyError } = await (serviceClient as any)
                .from('submission_history')
                .insert({
                    submission_id: id,
                    changed_by: userId,
                    old_status: hasStatusChanged ? current.status : null,
                    new_status: hasStatusChanged ? data.status : null,
                    old_priority: hasPriorityChanged ? current.priority : null,
                    new_priority: hasPriorityChanged ? data.priority : null,
                    note: noteToLog,
                })

            if (historyError) {
                console.error('History logging failed:', historyError)
            }

            try {
                const { data: admins } = await (serviceClient as any)
                    .from('profiles')
                    .select('id')
                    .in('role', ['admin', 'moderator'])

                if (admins && admins.length > 0) {
                    const { data: sub } = await (serviceClient as any)
                        .from('submissions')
                        .select('name, business_name')
                        .eq('id', id)
                        .single()

                    if (sub) {
                        const notifications = admins.map((admin: { id: string }) => ({
                            user_id: admin.id,
                            type: 'submission_status_changed',
                            title: `Status Updated: ${sub.name}`,
                            body: `${sub.name} (${sub.business_name}) status changed from ${current.status} to ${data.status || current.status}.`,
                            data: {
                                submission_id: id,
                                old_status: current.status,
                                new_status: data.status || current.status,
                                business_name: sub.business_name
                            },
                            action_url: `/en/submissions/${id}`,
                        }))

                        await (serviceClient as any)
                            .from('notifications')
                            .insert(notifications)
                    }
                }
            } catch (notifyError) {
                console.error('Failed to send admin notifications:', notifyError)
            }

            await logAction({
                userId,
                action: 'UPDATE',
                entityType: 'submission',
                entityId: id,
                oldData: { status: current.status, priority: current.priority },
                newData: { status: data.status || current.status, priority: data.priority || current.priority, notes: noteToLog }
            })
        }

        return { success: true }
    } catch (error) {
        console.error('Status update error:', error)
        return { error: error instanceof Error ? error.message : 'Failed to update status' }
    }
}

export async function getSubmissionHistoryAction(submissionId: string) {
    try {
        const serviceClient = await createServiceClient()
        const { data, error } = await (serviceClient as any)
            .from('submission_history')
            .select(`
                *,
                profiles:changed_by (
                    name,
                    surname,
                    role
                )
            `)
            .eq('submission_id', submissionId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('History fetch error:', error)
        return { error: 'Failed to fetch history' }
    }
}
