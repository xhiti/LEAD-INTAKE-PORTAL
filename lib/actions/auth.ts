'use server'

import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { getVerificationEmail, getWelcomeEmail, getNewDeviceEmail } from '@/lib/email-templates'
import { logAction } from '@/lib/actions/audit'
import Bowser from 'bowser'

export async function registerUserAction(formData: {
    email: string
    password: string
    name: string
    surname: string
    locale: string
}) {
    const serviceClient = await createServiceClient()

    const { data: userData, error: createError } = await serviceClient.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
            given_name: formData.name,
            family_name: formData.surname,
        }
    })

    if (createError) {
        console.error('Failed to create user:', createError)
        return { error: createError.message }
    }

    // Pre-set profile defaults so new users start as active
    const userId = userData.user?.id
    if (userId) {
        await (serviceClient as any)
            .from('profiles')
            .upsert({
                id: userId,
                email: formData.email,
                name: formData.name,
                surname: formData.surname,
                status: 'active',
                email_verified: true,
                role: 'user',
            }, { onConflict: 'id' })
    }

    const html = getWelcomeEmail(formData.name)
    const emailResult = await sendEmail({
        to: formData.email,
        subject: 'Welcome to Lead Intake Portal!',
        html,
    })

    if (emailResult.error) {
        console.error('Welcome email failed:', emailResult.error)
        const errorMsg = typeof emailResult.error === 'string'
            ? emailResult.error
            : (emailResult.error as any).message || JSON.stringify(emailResult.error);

        if (errorMsg.includes('testing emails to your own email address')) {
            return { error: 'Sandbox Mode: Resend only allows testing registrations with your verified developer email address until you configure a custom domain.' }
        }
        return { error: `Failed to send welcome email: ${errorMsg}` }
    }

    return { success: true }
}

export async function sendWelcomeEmailAction(email: string, name: string) {
    const html = getWelcomeEmail(name)
    return await sendEmail({
        to: email,
        subject: 'Welcome to Lead Intake Portal!',
        html,
    })
}

export async function logoutAndClearSessionsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const serviceClient = await createServiceClient()
        await (serviceClient as any)
            .from('auth_sessions')
            .update({ is_active: false, logged_out_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('is_active', true)
    }
    await supabase.auth.signOut()
    return { success: true }
}

export async function trackLoginSessionAction(
    userAgent: string,
    provider: 'email' | 'google',
    passedUserId?: string,
    passedIp?: string
) {
    // Use caller-supplied IP (e.g. from Route Handler request) or fall back to headers()
    const headersList = headers()
    const ip =
        passedIp ||
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        'Unknown'

    // Resolve user — prefer the explicitly passed ID to avoid timing issues
    // where cookies aren't yet propagated right after signInWithPassword
    let userId = passedUserId
    if (!userId) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'No authenticated user found' }
        userId = user.id
    }

    const parser = Bowser.getParser(userAgent || '')
    const browser = parser.getBrowserName() || 'Unknown Browser'
    const os = parser.getOSName() || 'Unknown OS'

    let deviceType = 'desktop'
    if (parser.getPlatformType() === 'mobile') deviceType = 'mobile'
    if (parser.getPlatformType() === 'tablet') deviceType = 'tablet'

    const serviceClient = await createServiceClient()

    const { data: existingSessions, error: checkError } = await serviceClient
        .from('auth_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('ip_address', ip)
        .eq('browser', browser)
        .limit(1)

    const { error: insertError } = await (serviceClient as any)
        .from('auth_sessions')
        .insert({
            user_id: userId,
            ip_address: ip,
            user_agent: userAgent,
            device_type: deviceType,
            browser,
            os,
            provider,
            is_active: true,
            logged_in_at: new Date().toISOString(),
        })

    if (insertError) {
        console.error('Failed to log session:', insertError)
    }

    if (!checkError && existingSessions && existingSessions.length === 0) {
        const { data: profile } = await (serviceClient as any)
            .from('profiles')
            .select('name, email')
            .eq('id', userId)
            .single()

        if (profile) {
            const time = new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })
            const typedProfile = profile as { name: string; email: string }
            const html = getNewDeviceEmail(typedProfile.name, browser, os, time, ip)
            await sendEmail({
                to: typedProfile.email,
                subject: 'New Login Detected - Lead Intake Portal',
                html,
            })
        }
    }

    await logAction({
        userId,
        action: 'LOGIN',
        entityType: 'auth_session',
        metadata: { provider, browser, os, deviceType, ipAddress: ip },
    })

    return { success: true }
}

export async function deactivateAccountAction(userId: string) {
    const serviceClient = await createServiceClient()
    const { error } = await (serviceClient as any)
        .from('profiles')
        .update({ status: 'deactivated', is_active: false })
        .eq('id', userId)

    if (error) {
        console.error('Failed to deactivate account:', error)
        return { error: error.message }
    }

    await logAction({
        userId,
        action: 'UPDATE',
        entityType: 'profile',
        entityId: userId,
        newData: { status: 'deactivated', is_active: false }
    })

    return { success: true }
}

export async function deleteAccountAction(userId: string) {
    const serviceClient = await createServiceClient()

    await (serviceClient as any).from('profiles').update({ status: 'deleted', is_deleted: true, is_active: false }).eq('id', userId)

    const { error } = await serviceClient.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Failed to delete account:', error)
        return { error: error.message }
    }

    await logAction({
        userId,
        action: 'DELETE',
        entityType: 'profile',
        entityId: userId
    })

    return { success: true }
}

export async function revokeSessionAction(sessionId: string, userId: string) {
    const serviceClient = await createServiceClient()

    const { data: session } = await serviceClient
        .from('auth_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single()

    if (!session || session.user_id !== userId) {
        return { error: 'Unauthorized to revoke this session' }
    }

    const { error } = await (serviceClient as any)
        .from('auth_sessions')
        .update({ is_active: false, logged_out_at: new Date().toISOString() })
        .eq('id', sessionId)

    if (error) {
        console.error('Failed to revoke session:', error)
        return { error: error.message }
    }

    await logAction({
        userId,
        action: 'UPDATE',
        entityType: 'auth_session',
        entityId: sessionId,
        newData: { is_active: false, logged_out_at: 'now()' }
    })

    return { success: true }
}
