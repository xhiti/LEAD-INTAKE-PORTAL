import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.')
        return { error: 'RESEND_API_KEY_MISSING' }
    }

    try {
        const defaultFrom = `${process.env.RESEND_FROM_NAME || 'Lead Intake Portal'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@predixio.co'}>`
        const { data, error } = await resend.emails.send({
            from: from || defaultFrom,
            to,
            subject,
            html,
        })

        if (error) {
            console.error('Failed to send email:', error)
            return { error }
        }

        return { data }
    } catch (error) {
        console.error('Email error:', error)
        return { error }
    }
}
