import { createClient } from '@supabase/supabase-js'
import { classifySubmission } from '../lib/ai/service'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
const businessSuffixes = ["Solutions", "Systems", "Consulting", "Group", "Partners", "Inc", "Co", "Services", "Technologies", "Hub"]

const categories = [
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

const requestTemplates: Record<string, string[]> = {
    "Automation": ["I need to automate our onboarding workflow.", "Looking for Zapier integration for our CRM.", "Want to automate lead follow-ups."],
    "Website": ["Need a new landing page for my product.", "Redesigning our company website.", "Site is slow, need optimization."],
    "AI Integration": ["Want to add a chatbot to our site.", "Need an AI summary tool for our reports.", "Looking for LLM integration."],
    "SEO": ["Need to rank better for 'organic bakery'.", "Our traffic dropped, need an audit.", "Want to optimize our blog posts."],
    "Custom Software": ["Building a custom CRM from scratch.", "Need a portal for our clients to login.", "Want a custom inventory system."],
    "Mobile App": ["Building an iOS and Android app.", "Need a React Native developer.", "Developing a fitness tracking app."],
    "API Development": ["Need to build a REST API for our data.", "Looking to integrate with Stripe API.", "Building a graphql backend."],
    "UI/UX Design": ["Need a Figma mock for our new app.", "Improving the UX of our checkout flow.", "Designing a mobile-first dashboard."],
    "DevOps & CI/CD": ["Setting up GitHub Actions for our repo.", "Need to dockerize our application.", "Moving to Kubernetes."],
    "Cloud Infrastructure": ["Moving our servers to AWS.", "Setup a VPC and RDS instance.", "Need help with Azure migration."],
    "Cybersecurity": ["Need a security audit for our app.", "Setup 2FA and encryption.", "Want to protect against DDoS."],
    "Blockchain & Web3": ["Building a smart contract on Ethereum.", "Need help with a NFT marketplace.", "Web3 integration for our site."],
    "Logo & Branding": ["Need a new logo for my startup.", "Rebranding our established business.", "Want a brand style guide."],
    "Graphic Design": ["Need social media post designs.", "Looking for a flyer for our event.", "Product packaging design."],
    "Video Production": ["Need an explainer video for our app.", "Editing a corporate interview.", "Promo video for YouTube."],
    "Photography": ["Need product photos for our shop.", "Looking for professional headshots.", "Event photography for our launch."],
    "Motion Graphics": ["Adding animations to our landing page.", "Animate our logo for intros.", "Motion design for our app UI."],
    "Illustration": ["Custom icons for our platform.", "Digital illustrations for our blog.", "Characters for our brand."],
    "Presentation Design": ["Designing a pitch deck for investors.", "PowerPoint for our sales team.", "Internal report visualization."],
    "Social Media Marketing": ["Manage our Instagram and TikTok.", "Content calendar for LinkedIn.", "Growing our Facebook following."],
    "Paid Ads / PPC": ["Running Google Ads for our shop.", "Meta ads setup and management.", "LinkedIn ads for B2B leads."],
    "Email Marketing": ["Setup a Mailchimp newsletter.", "Drip campaign for new users.", "Abandoned cart email series."],
    "Influencer Marketing": ["Finding partners for our brand.", "Managing influencer campaigns.", "Sourcing brand ambassadors."],
    "Content Marketing": ["Writing a weekly blog series.", "Creating whitepapers for leads.", "Strategic content plan."],
    "Affiliate Marketing": ["Setup an affiliate program.", "Managing our network of partners.", "Tracking affiliate sales."],
    "Copywriting": ["Sales page copy for our course.", "Ad copy for our next campaign.", "Website copy that converts."],
    "Blog Writing": ["SEO optimized blog posts.", "Weekly tech news articles.", "Industry insights for our audience."],
    "Translation": ["Translate our site into Spanish.", "French translation for our docs.", "Albanian localization."],
    "Proofreading & Editing": ["Edit our 50-page ebook.", "Proofread our annual report.", "Polishing our grant proposal."],
    "Technical Writing": ["API documentation for developers.", "User manuals for our software.", "Internal technical wiki."],
    "Scriptwriting": ["Script for our YouTube channel.", "Ad script for a radio spot.", "Dialogue for our app tutorial."],
    "Business Consulting": ["Strategic planning for growth.", "Operational efficiency audit.", "Scaling our service business."],
    "Financial Planning": ["Retirement planning for owners.", "Cash flow management advice.", "Investment strategy setup."],
    "Accounting & Bookkeeping": ["Monthly bookkeeping services.", "Reconciling our bank accounts.", "Financial statement prep."],
    "Tax Advisory": ["Corporate tax planning.", "VAT/Sales tax compliance.", "Filing our annual returns."],
    "Market Research": ["Competitor analysis for our niche.", "Customer survey and feedback.", "Identifying new market gaps."],
    "Business Plan Writing": ["Writing a plan for a bank loan.", "Update our business model.", "Financial projections for VCs."],
    "Fundraising & Pitch Decks": ["Raise a Seed round.", "Refining our investor deck.", "Finding angel investors."],
    "Contract Drafting": ["Terms of service for our site.", "Privacy policy for user data.", "Client service agreement."],
    "Legal Consulting": ["General business legal advice.", "Intellectual property questions.", "Regulatory compliance help."],
    "Trademark & IP": ["Filing for a new trademark.", "Protecting our software IP.", "Copyright registration."],
    "Compliance Advisory": ["GDPR compliance for our app.", "HIPAA audit for healthcare.", "SOC2 preparation."],
    "Online Tutoring": ["Python lessons for beginners.", "Math tutoring for SATs.", "One-on-one coding coach."],
    "Corporate Training": ["Teaching our team React.", "Soft skills workshop.", "Leadership training program."],
    "Course Creation": ["Building an online academy.", "Curriculum design for a boot camp.", "Recording video lessons."],
    "Language Teaching": ["English lessons for business.", "Spanish for travelers.", "Interactive language platform."],
    "Career Coaching": ["Resume review and editing.", "Interview prep for tech roles.", "Finding a new career path."],
    "Nutrition & Dietetics": ["Custom meal plans.", "Weight loss consultation.", "Sports nutrition advice."],
    "Mental Health Coaching": ["Stress management sessions.", "Mindfulness and meditation.", "Work-life balance coach."],
    "Personal Training": ["Custom workout routine.", "Online fitness coaching.", "Weight lifting for beginners."],
    "Medical Consulting": ["Healthcare system advice.", "Patient management flow.", "Medical clinic efficiency."],
    "Property Management": ["Managing a rental building.", "Tenant screening and setup.", "Property maintenance plan."],
    "Real Estate Consulting": ["Investment property analysis.", "Market trends in the city.", "Buying our first showroom."],
    "Interior Design": ["Office space redesign.", "Home staging for a sale.", "Modern minimalist living room."],
    "Architecture": ["Blueprint for a new house.", "Renovating our old office.", "Sustainable building design."],
    "Cleaning": ["Deep cleaning for our office.", "Move-out cleaning service.", "Regular house cleaning."],
    "Repairs & Maintenance": ["Fixing a leaky roof.", "Plumbing and electrical work.", "General handyman services."],
    "Landscaping": ["Garden design and setup.", "Lawn mowing and care.", "Outdoor lighting install."],
    "Moving & Logistics": ["Local house move.", "Inter-state office relocation.", "Packing and storage help."],
    "Event Planning": ["Planning a wedding.", "Corporate conference setup.", "Birthday party coordination."],
    "Catering": ["Food for our office party.", "Wedding reception menu.", "Buffet for a conference."],
    "Other": ["I need help with something else.", "Custom request for my business.", "General inquiry about services."]
}

function getRandomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function seed() {
    console.log("🚀 Fetching industries from database...")
    const { data: dbIndustries, error: indError } = await supabase.from('industries').select('title')

    const activeIndustries = (dbIndustries && dbIndustries.length > 0)
        ? dbIndustries.map(i => i.title)
        : ["Healthcare", "Real Estate", "Legal", "Finance", "Professional Services", "Other"]

    console.log(`✅ Loaded ${activeIndustries.length} industries: ${activeIndustries.join(', ')}`)
    console.log("🚀 Starting Bulk Submission Seeding (500 items)...")

    const startDate = new Date('2026-01-01')
    const endDate = new Date()

    const BATCH_SIZE = 5;
    for (let i = 1; i <= 200; i += BATCH_SIZE) {
        const batchPromises = [];

        for (let j = 0; j < BATCH_SIZE && (i + j) <= 200; j++) {
            const currentIdx = i + j;
            batchPromises.push((async () => {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
                const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)]
                const category = categories[Math.floor(Math.random() * categories.length)]
                const industry = activeIndustries[Math.floor(Math.random() * activeIndustries.length)]

                const templates = requestTemplates[category] || ["I need help with your services."]
                const helpRequest = templates[Math.floor(Math.random() * templates.length)] + ` I am looking to improve my ${industry} business operations.`

                const createdAt = getRandomDate(startDate, endDate)
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`
                const businessName = `${lastName} ${businessSuffix}`

                try {
                    const aiResult = await classifySubmission(helpRequest, 'groq')

                    const { error } = await supabase
                        .from('submissions')
                        .insert({
                            name: `${firstName} ${lastName}`,
                            email: email,
                            business_name: businessName,
                            industry: industry,
                            help_request: helpRequest,
                            ai_summary: aiResult.summary,
                            ai_category: aiResult.category,
                            ai_confidence_score: aiResult.confidence_score,
                            ai_model_used: aiResult.model_used,
                            ai_processed_at: createdAt.toISOString(),
                            ai_raw_response: aiResult.raw_response,
                            status: 'new',
                            priority: 'medium',
                            created_at: createdAt.toISOString(),
                            updated_at: createdAt.toISOString()
                        })

                    if (error) {
                        console.error(`❌ Item ${currentIdx} failed:`, error.message)
                    } else {
                        process.stdout.write('.') // Dot for progress
                    }
                } catch (e) {
                    console.error(`❌ AI Error on item ${currentIdx}:`, e)
                }
            })());
        }

        await Promise.all(batchPromises);
        if (i % 25 === 1) {
            console.log(`\n🎉 Progress: ${Math.min(i + BATCH_SIZE - 1, 500)}/500 done!`)
        }
    }

    console.log("✨ Seeding complete!")
}

seed()
