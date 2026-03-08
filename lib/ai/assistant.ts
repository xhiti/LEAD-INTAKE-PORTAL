export interface QuickAction {
    id: string
    label: string
    prompt: string
    icon: string
}

export const SUBMISSION_QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'summarize-new',
        label: 'Review new submissions',
        prompt: 'Summarize all my new submissions and tell me which ones I should attend to first.',
        icon: 'inbox',
    },
    {
        id: 'in-progress',
        label: 'What\'s in progress?',
        prompt: 'Which submissions are currently in progress and what do they need next?',
        icon: 'zap',
    },
    {
        id: 'stats-overview',
        label: 'Submission stats',
        prompt: 'Give me an overview of my submission statistics: counts by status, industry breakdown, and recent trends.',
        icon: 'bar-chart',
    },
    {
        id: 'industry-breakdown',
        label: 'Industry breakdown',
        prompt: 'What industries are most represented in my submissions? Which ones have the best close rates?',
        icon: 'building',
    },
    {
        id: 'closed-analysis',
        label: 'Closed & archived',
        prompt: 'Analyze my closed and archived submissions. What patterns do you notice in the ones that were closed successfully?',
        icon: 'check-circle',
    },
    {
        id: 'suggestions',
        label: 'What should I focus on?',
        prompt: 'Based on all my submissions, what should I prioritize this week to maximize conversions?',
        icon: 'target',
    },
]

export function buildSubmissionContext(submissions: any[], userName: string): string {
    const now = new Date()

    const byStatus: Record<string, number> = {}
    const byIndustry: Record<string, number> = {}

    for (const s of submissions) {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1
        if (s.industry) byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1
    }

    const recent = submissions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(s => `- "${s.name}" (${s.business_name}) — Status: ${s.status}, Industry: ${s.industry}${s.ai_category ? `, Category: ${s.ai_category}` : ''}`)
        .join('\n')

    const statusSummary = Object.entries(byStatus)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')

    const industryTop = Object.entries(byIndustry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, v]) => `${k} (${v})`)
        .join(', ')

    return `You are an intelligent AI assistant embedded in a lead intake portal called LEAD-INTAKE-PORTAL.
The user's name is ${userName}.

## Submission Context
Total submissions: ${submissions.length}
Status breakdown: ${statusSummary || 'none'}
Top industries: ${industryTop || 'none'}

## 5 Most Recent Submissions
${recent || 'No submissions yet.'}

## Your Role
- Be a helpful, professional business assistant
- Answer questions about the user's submissions concretely
- Provide strategic insights on leads, industries, and follow-up actions
- Use data from the context above to give specific, actionable advice
- Keep responses clear and well formatted with markdown when it helps
- You may also answer general business or lead management questions`
}
