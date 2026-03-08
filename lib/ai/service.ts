import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

export type AIModel = 'gemini' | 'groq' | 'glm'
export const AI_CATEGORIES = [
  "Automation", "Website", "AI Integration", "SEO", "Custom Software", "Mobile App", "API Development", "UI/UX Design", "DevOps & CI/CD", "Cloud Infrastructure", "Cybersecurity", "Blockchain & Web3",
  "Logo & Branding", "Graphic Design", "Video Production", "Photography", "Motion Graphics", "Illustration", "Presentation Design",
  "Social Media Marketing", "Paid Ads / PPC", "Email Marketing", "Influencer Marketing", "Content Marketing", "Affiliate Marketing",
  "Copywriting", "Blog Writing", "Translation", "Proofreading & Editing", "Technical Writing", "Scriptwriting",
  "Business Consulting", "Financial Planning", "Accounting & Bookkeeping", "Tax Advisory", "Market Research", "Business Plan Writing", "Fundraising & Pitch Decks",
  "Contract Drafting", "Legal Consulting", "Trademark & IP", "Compliance Advisory",
  "Online Tutoring", "Corporate Training", "Course Creation", "Language Teaching", "Career Coaching",
  "Nutrition & Dietetics", "Mental Health Coaching", "Personal Training", "Medical Consulting",
  "Property Management", "Real Estate Consulting", "Interior Design", "Architecture",
  "Cleaning", "Repairs & Maintenance", "Landscaping", "Moving & Logistics", "Event Planning", "Catering",
  "Other"
] as const;

export type AICategory = typeof AI_CATEGORIES[number];

export interface AIResult {
  summary: string
  category: AICategory
  confidence_score: number
  model_used: string
  raw_response: unknown
}

const SYSTEM_PROMPT = `You are a business intake classifier.Your goal is to accurately categorize client requests into the most specific category possible.
 
Return a JSON object with exactly three fields:
- "summary": a single sentence summarizing the request professionally(max 150 chars)
  - "category": one of exactly the categories listed below.
- "confidence": a number between 0 and 1 indicating your confidence.
 
** CRITICAL INSTRUCTIONS **:
1. DO NOT default to "Other" if a more specific category fits even partially.
2. Analyze the context carefully.For example, "I need a site for my bakery" should be "Website", while "I need to rank higher on Google" should be "SEO".
3. If multiple categories apply, choose the one that represents the primary intent.
 
** VALID CATEGORIES **:
[
  "Automation", "Website", "AI Integration", "SEO", "Custom Software", "Mobile App", "API Development", "UI/UX Design", "DevOps & CI/CD", "Cloud Infrastructure", "Cybersecurity", "Blockchain & Web3",
  "Logo & Branding", "Graphic Design", "Video Production", "Photography", "Motion Graphics", "Illustration", "Presentation Design",
  "Social Media Marketing", "Paid Ads / PPC", "Email Marketing", "Influencer Marketing", "Content Marketing", "Affiliate Marketing",
  "Copywriting", "Blog Writing", "Translation", "Proofreading & Editing", "Technical Writing", "Scriptwriting",
  "Business Consulting", "Financial Planning", "Accounting & Bookkeeping", "Tax Advisory", "Market Research", "Business Plan Writing", "Fundraising & Pitch Decks",
  "Contract Drafting", "Legal Consulting", "Trademark & IP", "Compliance Advisory",
  "Online Tutoring", "Corporate Training", "Course Creation", "Language Teaching", "Career Coaching",
  "Nutrition & Dietetics", "Mental Health Coaching", "Personal Training", "Medical Consulting",
  "Property Management", "Real Estate Consulting", "Interior Design", "Architecture",
  "Cleaning", "Repairs & Maintenance", "Landscaping", "Moving & Logistics", "Event Planning", "Catering",
  "Other"
]
 
Return only valid JSON, nothing else.`

function buildPrompt(helpRequest: string): string {
  return `Client request: "${helpRequest}"\n\nReturn only valid JSON.`
}

function parseAIResponse(text: string): { summary: string; category: AICategory; confidence: number } {
  const cleaned = text.replace(/```json\n ? /g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  const validCategories = AI_CATEGORIES;
  const category = validCategories.includes(parsed.category as AICategory) ? (parsed.category as AICategory) : "Other"
  const confidence = typeof parsed.confidence === 'number'
    ? Math.min(1, Math.max(0, parsed.confidence))
    : 0.8

  return {
    summary: String(parsed.summary || '').slice(0, 300),
    category,
    confidence,
  }
}

async function classifyWithGemini(helpRequest: string): Promise<AIResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: buildPrompt(helpRequest) },
  ])

  const text = result.response.text()
  const parsed = parseAIResponse(text)

  return {
    summary: parsed.summary,
    category: parsed.category,
    confidence_score: parsed.confidence,
    model_used: 'gemini-1.5-flash',
    raw_response: result.response,
  }
}

async function classifyWithGroq(helpRequest: string): Promise<AIResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(helpRequest) },
    ],
    temperature: 0.3,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content ?? '{}'
  const parsed = parseAIResponse(text)

  return {
    summary: parsed.summary,
    category: parsed.category,
    confidence_score: parsed.confidence,
    model_used: 'groq/llama-3.1-8b-instant',
    raw_response: completion,
  }
}

async function classifyWithGLM(helpRequest: string): Promise<AIResult> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GLM_API_KEY!} `,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(helpRequest) },
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  })

  if (!response.ok) {
    throw new Error(`GLM API error: ${response.status} ${response.statusText} `)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? '{}'
  const parsed = parseAIResponse(text)

  return {
    summary: parsed.summary,
    category: parsed.category,
    confidence_score: parsed.confidence,
    model_used: 'glm-4-flash',
    raw_response: data,
  }
}

export async function classifySubmission(
  helpRequest: string,
  preferredModel: AIModel = 'gemini'
): Promise<AIResult> {
  const modelOrder: AIModel[] = [
    preferredModel,
    ...(['gemini', 'groq', 'glm'] as AIModel[]).filter(m => m !== preferredModel),
  ]

  let lastError: Error | null = null

  for (const model of modelOrder) {
    if (model === 'gemini' && !process.env.GEMINI_API_KEY) continue
    if (model === 'groq' && !process.env.GROQ_API_KEY) continue
    if (model === 'glm' && !process.env.GLM_API_KEY) continue

    try {
      switch (model) {
        case 'gemini':
          return await classifyWithGemini(helpRequest)
        case 'groq':
          return await classifyWithGroq(helpRequest)
        case 'glm':
          return await classifyWithGLM(helpRequest)
      }
    } catch (error) {
      lastError = error as Error
      console.error(`AI model ${model} failed: `, error)
    }
  }

  console.error('All AI models failed, using fallback:', lastError)
  return {
    summary: 'Client request received and awaiting manual review.',
    category: 'Other',
    confidence_score: 0,
    model_used: 'fallback',
    raw_response: { error: lastError?.message ?? 'All models failed' },
  }
}
export async function generateStatusChangeNote(
  submission: { name: string; business_name: string; help_request: string; ai_summary: string | null },
  oldStatus: string,
  newStatus: string
): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  const prompt = `
    Submission Details:
- Customer: ${submission.name}
- Business: ${submission.business_name}
- Request: ${submission.help_request}
- AI Summary: ${submission.ai_summary || 'N/A'}

    Status Transition: From "${oldStatus}" to "${newStatus}"

Task: Write a very brief, professional internal note(max 1 sentence) explaining this status update in the context of the lead's needs. 
Examples:
- "Moving to In Progress as we begin analyzing the automation requirements for Acme Corp."
  - "Marking as Reviewed after initial AI categorization of the SEO project."
    
    Return only the note text.
  `

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 100,
    })

    return completion.choices[0]?.message?.content?.trim() || `Status changed from ${oldStatus} to ${newStatus}.`
  } catch (error) {
    console.error('Failed to generate AI status note:', error)
    return `Status changed from ${oldStatus} to ${newStatus}.`
  }
}
