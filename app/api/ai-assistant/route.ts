import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { messages, systemContext } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
        }

        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
        }

        const groq = new Groq({ apiKey })

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: systemContext + "\n\nYou are a helpful assistant for the LEAD-INTAKE-PORTAL. You have analyzed the user's submission data and are prepared to answer any questions or provide insights. Keep responses concise and professional."
                },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
            temperature: 0.7,
            max_tokens: 1024,
        })

        const responseText = response.choices[0]?.message?.content || 'No response generated'

        return NextResponse.json({ message: responseText })
    } catch (error: any) {
        console.error('AI Assistant Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process AI request' },
            { status: 500 }
        )
    }
}
