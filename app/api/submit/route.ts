import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { classifySubmission } from '@/lib/ai/service'
import { logAudit, extractRequestInfo } from '@/lib/audit'
import type { Database } from '@/lib/supabase/database.types'

const submitSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  business_name: z.string().min(2).max(200),
  industry: z.string().min(1).max(100),
  help_request: z.string().min(20).max(5000),
  ai_prefetched: z.object({
    summary: z.string(),
    category: z.string(),
    confidence_score: z.number(),
    model_used: z.string()
  }).optional()
})

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = submitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const { ip, userAgent } = extractRequestInfo(request)

    let aiResult;
    if (data.ai_prefetched && data.ai_prefetched.summary) {
      aiResult = {
        summary: data.ai_prefetched.summary,
        category: data.ai_prefetched.category,
        confidence_score: data.ai_prefetched.confidence_score,
        model_used: data.ai_prefetched.model_used,
        raw_response: { note: 'Prefetched by client UI' }
      }
    } else {
      aiResult = await classifySubmission(data.help_request, 'gemini')
    }

    const supabase = getServiceClient()

    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        name: data.name,
        email: data.email,
        business_name: data.business_name,
        industry: data.industry,
        help_request: data.help_request,
        ai_summary: aiResult.summary,
        ai_category: aiResult.category,
        ai_confidence_score: aiResult.confidence_score,
        ai_model_used: aiResult.model_used,
        ai_processed_at: new Date().toISOString(),
        ai_raw_response: aiResult.raw_response as Record<string, unknown>,
        status: 'new',
        priority: 'medium',
      } as any)
      .select('id, ai_category, ai_summary, ai_model_used')
      .single()

    if (insertError) {
      console.error('Submission insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'moderator'])
      .eq('is_active', true)
      .eq('is_deleted', false)

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'new_submission' as const,
        title: 'New Submission',
        body: `${data.name} from ${data.business_name} submitted a new request (${aiResult.category})`,
        data: {
          submission_id: submission.id,
          name: data.name,
          business_name: data.business_name,
          ai_category: aiResult.category,
        },
        action_url: `/dashboard/submissions?id=${submission.id}`,
        channel: 'in_app' as const,
      }))

      await supabase.from('notifications').insert(notifications)

      const { data: pushPrefs } = await supabase
        .from('notification_preferences')
        .select('user_id, push_subscription, push_new_submission')
        .in('user_id', admins.map(a => a.id))
        .eq('push_enabled', true)
        .eq('push_new_submission', true)

      if (pushPrefs && pushPrefs.length > 0) {
        for (const pref of pushPrefs) {
          if (pref.push_subscription) {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: pref.push_subscription,
                title: 'New Submission',
                body: `${data.name} from ${data.business_name}`,
                url: `/dashboard/submissions?id=${submission.id}`,
              }),
            }).catch(console.error)
          }
        }
      }
    }

    await logAudit({
      action: 'submission.create',
      entityType: 'submission',
      entityId: submission.id,
      newData: { name: data.name, email: data.email, business_name: data.business_name, industry: data.industry },
      metadata: { ai_category: aiResult.category, ai_model: aiResult.model_used },
      ipAddress: ip,
      userAgent,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Submit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
