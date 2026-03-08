import { NextResponse } from 'next/server'
import { z } from 'zod'
import { classifySubmission } from '@/lib/ai/service'
import { extractRequestInfo } from '@/lib/audit'

const analyzeSchema = z.object({
    text: z.string().min(20).max(5000),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = analyzeSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid text provided', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { text } = parsed.data
        const aiResult = await classifySubmission(text, 'groq')

        return NextResponse.json({
            summary: aiResult.summary,
            category: aiResult.category,
            confidence_score: aiResult.confidence_score,
            model_used: aiResult.model_used,
        })
    } catch (error) {
        console.error('Analyze API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
