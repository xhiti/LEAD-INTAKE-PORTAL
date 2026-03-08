<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.18-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.15-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

<h1 align="center">Lead Intake Portal</h1>

<p align="center">
  <strong>An AI-powered, production-grade Smart Lead Intake & CRM system</strong><br/>
  Built with Next.js 16, Supabase, and multi-model AI — automatically categorizes business leads, routes them to the right team, and manages the entire workflow with real-time notifications and comprehensive audit logging.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-ai-models">AI Models</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-cicd-pipeline">CI/CD</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-security">Security</a>
</p>

---

## ✨ Features

### 🤖 AI-Powered Lead Classification
- **Multi-model fallback engine** — Gemini 1.5 Flash → Groq LLaMA 3.1 → GLM-4 Flash
- Automatically categorizes every submission into: `Automation`, `Website`, `AI Integration`, `SEO`, `Custom Software`, or `Other`
- Returns a confidence score (0–1) and a professional summary for each lead
- AI-generated status change notes when leads move through the pipeline
- **AI Assistant** — context-aware chatbot that analyzes all your submissions and provides strategic business insights

### 🔐 Authentication & Authorization
- **Email/Password** registration with instant email verification
- **Google OAuth** (one-click Google Sign-In via Supabase Auth)
- **Role-based access control (RBAC)** with 4 roles:

  | Role | Permissions |
  |------|-------------|
  | **Admin** | Full access — manage users, industries, submissions, view audit logs |
  | **Moderator** | Manage submissions, industries, view all submissions & kanban board |
  | **User** | Submit leads, view own submissions, access AI assistant & analytics |
  | **Viewer** | Read-only access to dashboard, calendar, and profile |

- **Middleware-level route protection** — unauthorized users are redirected to login
- **Row Level Security (RLS)** on every Supabase table as a second layer

### 📊 Dashboard & Analytics
- **KPI Cards** — total submissions, pending count, resolved count with animated counters
- **Time-series charts** — submission trends over configurable time periods (7d / 30d / 90d / 1y)
- **Status distribution** pie chart + **Category breakdown** bar chart + **Industry breakdown** chart
- **Recent submissions** quick-access table
- **Registered users over time** chart (admin-only)
- Period selector for filtering all analytics by date range

### 📝 Submission Management
- **Register Submission** — multi-step form with validation (Zod + react-hook-form) and real-time AI classification
- **My Submissions** — personal submissions list with search, filter, and sort
- **All Submissions** (Admin/Moderator) — full management table with inline status/priority updates
- **Submission Detail** — complete view with AI results, status history timeline, notes, and edit capabilities
- **Kanban Board** — drag-and-drop board (powered by dnd-kit) with columns: New → Reviewed → In Progress → Closed → Archived
- **Calendar View** — monthly/weekly calendar of submissions by date
- **Submission History** — full timeline of every status & priority change with AI-generated notes
- **Export** — download submissions data

### 🔔 Notifications
- **In-app real-time notifications** via Supabase Realtime (live updates without refresh)
- **Web Push notifications** via Service Worker + VAPID keys
- **Email notifications** via Resend (transactional emails)
- **Granular notification preferences** — per-channel toggles for each notification type
- **Do Not Disturb** mode with configurable quiet hours
- Notification types: `new_submission`, `submission_reviewed`, `status_changed`, `system_alert`, `account_update`, `welcome`, `role_changed`, `mention`

### 👤 Profile & Account Management
- **Profile form** — name, surname, email, phone, gender, bio, company, job title, timezone
- **Avatar upload** — direct to Supabase Storage with image preview
- **Appearance settings** — light / dark / system theme toggle
- **Active sessions** — view all login sessions with device, browser, OS, IP, and login time; revoke any session
- **New device detection** — email alert when logging in from a new browser/IP
- **Account danger zone** — deactivate or permanently delete account

### 🏭 Industry Management (Admin)
- **CRUD operations** — add, edit, soft-delete industries
- **Searchable & filterable** table with active/inactive status badges
- Industries dynamically populate the submission form dropdown

### 📋 Audit Logging
- **Immutable audit trail** for every action: `LOGIN`, `CREATE`, `UPDATE`, `DELETE`
- Captures: user, action, entity type/ID, old data, new data, IP address, user agent
- **Admin audit log viewer** with search, filters, pagination, and expandable detail modals

### 🌍 Internationalization (i18n)
- Full translations in **4 languages**: English, French, Spanish, Albanian
- Locale-prefixed routing (`/en/dashboard`, `/fr/dashboard`, etc.)
- Powered by `next-intl` with `localePrefix: 'always'`

### 🖤 Public Intake Form
- Beautiful, responsive public-facing lead submission form
- No authentication required — anyone can submit a lead
- Real-time AI processing with loading states and result display

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14.2.18 (App Router) | Server/client components, API routes, middleware |
| **Language** | TypeScript 5.6.3 | Type safety across the entire codebase |
| **Database** | Supabase (PostgreSQL) | Relational data, RLS, realtime subscriptions |
| **Auth** | Supabase Auth | Email/password, Google OAuth, session management |
| **Storage** | Supabase Storage | Avatar uploads (public `avatars` bucket) |
| **AI — Primary** | Google Gemini 1.5 Flash (@google/generative-ai 0.21.0) | Lead classification + assistant chat |
| **AI — Fallback 1** | Groq (LLaMA 3.1 8B) (groq-sdk 0.8.0) | Fallback classifier + status notes generation |
| **AI — Fallback 2** | GLM-4 Flash (Zhipu AI) | Secondary fallback via REST API |
| **Styling** | Tailwind CSS 3.4.15 | Utility-first responsive design |
| **UI Components** | Radix UI (shadcn/ui) | Accessible, composable primitives |
| **Forms** | react-hook-form 7.53 + Zod 3.23 | Schema-validated form handling |
| **Charts** | Recharts 2.13.3 | Interactive data visualization |
| **Drag & Drop** | dnd-kit 6.3 | Kanban board interactions |
| **Animations** | Framer Motion 12.35 | Page transitions, micro-animations |
| **Email** | Resend 6.9.3 | Transactional email delivery |
| **Push** | Web Push 3.6.7 + Service Worker | Browser push notifications |
| **i18n** | next-intl 3.22.0 | Locale-based routing & translation |
| **Theme** | next-themes 0.4.3 | Dark/light/system mode |
| **Hosting** | Vercel | Edge deployment, serverless functions |

---

## 🤖 AI Models

The portal uses a **multi-model fallback architecture** for maximum reliability:

```
┌─────────────────────────────────────────────────────────┐
│                    Incoming Lead                         │
│              "I need website automation"                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │    Gemini 1.5 Flash    │ ◀── Primary (Google AI)
        │   GEMINI_API_KEY set?  │
        └─────────┬──────────────┘
                  │ fail / key missing
                  ▼
        ┌────────────────────────┐
        │   Groq LLaMA 3.1 8B   │ ◀── Fallback 1 (Groq Cloud)
        │    GROQ_API_KEY set?   │
        └─────────┬──────────────┘
                  │ fail / key missing
                  ▼
        ┌────────────────────────┐
        │      GLM-4 Flash       │ ◀── Fallback 2 (Zhipu AI)
        │    GLM_API_KEY set?    │
        └─────────┬──────────────┘
                  │ all models fail
                  ▼
        ┌────────────────────────┐
        │   Safe Fallback        │ → category: "Other"
        │   confidence: 0        │ → summary: "Awaiting manual review"
        └────────────────────────┘
```

### Classification Output
Every AI model returns a structured JSON response:
```json
{
  "summary": "Client needs a custom CRM automation for their real estate business",
  "category": "Automation",
  "confidence": 0.92
}
```

### AI Assistant
A context-aware chatbot (powered by Groq) that:
- Ingests all your submission data as context
- Provides strategic business insights and lead prioritization advice
- Offers quick action buttons: Review new submissions, In-progress check, Stats overview, Industry breakdown, Closed analysis, Focus suggestions

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and **npm**
- A **Supabase** project ([supabase.com](https://supabase.com))
- At least one AI API key (Gemini, Groq, or GLM)
- A **Resend** account for transactional email (optional but recommended)

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/lead-intake-portal.git
cd lead-intake-portal
npm install
```

### 2. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `GEMINI_API_KEY` | ⚡ | Google Gemini API key — [ai.google.dev](https://ai.google.dev) |
| `GROQ_API_KEY` | ⚡ | Groq API key — [console.groq.com](https://console.groq.com) |
| `GLM_API_KEY` | ⚡ | Zhipu AI key — [open.bigmodel.cn](https://open.bigmodel.cn) |
| `RESEND_API_KEY` | 📧 | Resend API key — [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | 📧 | Sender email address for transactional emails |
| `RESEND_FROM_NAME` | 📧 | Sender display name |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` for dev, your domain for prod |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 🔔 | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | 🔔 | VAPID private key |
| `VAPID_EMAIL` | 🔔 | mailto:you@domain.com |

> ✅ = Required  •  ⚡ = At least one AI key required  •  📧 = For email features  •  🔔 = For push notifications

### 3. Generate VAPID Keys (for Web Push)

```bash
npx web-push generate-vapid-keys
```

Copy the output into your `.env.local`.

### 4. Supabase Setup

#### Run Migrations
Execute the SQL files **in order** in your [Supabase SQL Editor](https://app.supabase.com/project/_/sql):

```
supabase/migrations/00_helpers.sql            → Utility functions (handle_updated_at)
supabase/migrations/01_profiles.sql           → User profiles table + RLS
supabase/migrations/02_auth_sessions.sql      → Login session tracking + RLS
supabase/migrations/03_submissions.sql        → Lead submissions table + indexes + RLS
supabase/migrations/04_notifications.sql      → Notifications + Realtime + RLS
supabase/migrations/05_notification_preferences.sql → Per-user notification settings
supabase/migrations/05_submission_history.sql  → Status/priority change history
supabase/migrations/06_audit_logs.sql         → Immutable audit trail + RLS
supabase/migrations/07_rpc_functions.sql      → RPC helper functions
supabase/migrations/08_fix_rls_recursion.sql  → RLS recursion fix
supabase/migrations/09_google_oauth_profiles.sql → Google OAuth profile handling
supabase/migrations/10_profile_status.sql     → Profile status fields
supabase/migrations/11_industries.sql         → Industries table + seed data
supabase/migrations/12_fix_submissions_constraints.sql → Submission constraint updates
```

Or with **Supabase CLI**:
```bash
supabase db push
```

#### Create Storage Bucket
1. Go to **Supabase → Storage**
2. Create a bucket named `avatars`
3. Set it to **Public** (for read access)
4. Add policy: authenticated users can upload/update their own files

#### Enable Realtime
In **Supabase → Database → Replication**, enable Realtime for:
- `notifications` table
- `submissions` table

#### Enable Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com) → Create OAuth 2.0 credentials
2. Add Supabase callback: `https://<project>.supabase.co/auth/v1/callback`
3. In **Supabase → Authentication → Providers → Google**, add Client ID + Secret

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be auto-redirected to `/en`.

### 6. Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server with hot reload |
| Build | `npm run build` | Create optimized production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint checks |
| Type Check | `npm run type-check` | Run TypeScript compiler check |

---

## 🗄️ Database Schema

The application uses **8 core tables** with Row Level Security (RLS) on all tables:

```
┌──────────────────────────────────────────────────────────────────┐
│                         auth.users                                │
│               (managed by Supabase Auth)                          │
└──────────┬───────────────────────────────────────────────────────┘
           │ 1:1
           ▼
┌──────────────────────┐     ┌────────────────────────────┐
│      profiles        │     │     auth_sessions           │
│  (user metadata)     │──1:N──│  (login tracking)          │
└──────────┬───────────┘     └────────────────────────────┘
           │
      ┌────┴────────────┬──────────────┬───────────────┐
      │ 1:N             │ 1:N          │ 1:1           │ 1:N
      ▼                 ▼              ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌───────────────┐ ┌──────────────┐
│ submissions  │ │notifications│ │notification_  │ │ audit_logs   │
│ (leads)      │ │ (in-app)    │ │preferences    │ │ (immutable)  │
└──────┬───────┘ └─────────────┘ └───────────────┘ └──────────────┘
       │ 1:N
       ▼
┌──────────────────┐         ┌────────────────┐
│submission_history│         │   industries   │
│(status changes)  │         │ (lookup table) │
└──────────────────┘         └────────────────┘
```

### Table Details

| Table | Rows | Key Columns | RLS |
|-------|------|-------------|-----|
| `profiles` | Per user | `name`, `surname`, `email`, `role`, `avatar_url`, `locale`, `theme`, `status` | Users: own row; Admins: all |
| `auth_sessions` | Per login | `user_id`, `ip_address`, `browser`, `os`, `device_type`, `provider` | Users: own; Admins: all |
| `submissions` | Lead data | `name`, `email`, `business_name`, `industry`, `help_request`, `ai_*`, `status`, `priority` | Users: own; Admin/Mod: all; Anyone: insert |
| `submission_history` | Changes | `submission_id`, `old_status`, `new_status`, `old_priority`, `new_priority`, `note` | Admin/Mod: all; Users: own submissions |
| `notifications` | Alerts | `user_id`, `type`, `title`, `body`, `is_read`, `channel` | Users: own only |
| `notification_preferences` | Settings | `user_id`, `in_app_*`, `push_*`, `email_*`, `dnd_*` | Users: own only |
| `audit_logs` | Actions | `user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address` | Admins only |
| `industries` | Lookup | `code`, `title`, `description`, `order_index`, `is_active` | Anyone: read active; Admins: manage |

---

## 🔄 CI/CD Pipeline

The project includes **3 GitHub Actions workflows** for a complete CI/CD pipeline:

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│               Developer pushes code                      │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
  Push to branch /               Push to main
  Open Pull Request               (merge)
        │                             │
        ▼                             ▼
┌───────────────────┐     ┌──────────────────────┐
│   CI Pipeline     │     │ Production Pipeline  │
│  (ci.yml)         │     │ (production.yml)     │
│                   │     │                      │
│ ✅ ESLint         │     │ 🛡️ Pre-flight:       │
│ ✅ TypeScript     │     │   ✅ Lint             │
│ ✅ Next.js Build  │     │   ✅ Type-check       │
└───────┬───────────┘     │   ✅ Build            │
        │ (on PR only)    │                      │
        ▼                 │ 🚀 Deploy:           │
┌───────────────────┐     │   Vercel --prod      │
│ Preview Pipeline  │     │                      │
│ (preview.yml)     │     │ 💚 Health check      │
│                   │     │ 📢 Notification      │
│ 🔮 Vercel preview │     └──────────────────────┘
│ 💬 PR comment     │
│    with URL       │
└───────────────────┘
```

### Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `.github/workflows/ci.yml` | Push to `main`/`develop`/`staging` + PRs | Lint → Type-check → Build |
| `.github/workflows/preview.yml` | Pull requests to `main`/`develop` | Vercel preview deployment + PR comment with URL |
| `.github/workflows/production.yml` | Push to `main` | Pre-flight → Vercel production deploy → Health check |

### Required GitHub Secrets

Configure these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token ([vercel.com/account/tokens](https://vercel.com/account/tokens)) |
| `VERCEL_ORG_ID` | Your Vercel team/org ID (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID (from `.vercel/project.json`) |
| `PRODUCTION_URL` | *(Optional)* Your production URL for health checks |

### How to Get Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project (follow the prompts)
vercel link

# The IDs are now in .vercel/project.json
cat .vercel/project.json
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push** your repository to GitHub
2. **Import** the project at [vercel.com/new](https://vercel.com/new)
3. **Add all environment variables** in Vercel → Settings → Environment Variables
4. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://leads.yourdomain.com`)
5. **Update Supabase Auth redirect URLs**:
   - Go to Supabase → Authentication → URL Configuration
   - Add `https://your-domain.com/auth/callback` to Allowed Redirect URLs
   - Add `https://your-domain.com` to Site URL
6. **Deploy** — Vercel automatically builds and deploys on every push to `main`

### Post-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Supabase redirect URLs are updated for production domain
- [ ] Google OAuth redirect URI updated in Google Cloud Console
- [ ] VAPID keys regenerated for production
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] Supabase Realtime enabled for `notifications` and `submissions` tables
- [ ] Storage bucket `avatars` exists and has correct policies
- [ ] Test email delivery (Resend domain verified or sandbox mode)

---

## 📂 Project Structure

```
lead-intake-portal/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline (lint, type-check, build)
│       ├── preview.yml               # Vercel preview deployment on PRs
│       └── production.yml            # Vercel production deployment on main
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx            # Auth pages layout (split-screen)
│   │   │   ├── login/page.tsx        # Email/password + Google login
│   │   │   ├── register/page.tsx     # User registration form
│   │   │   ├── forgot-password/      # Password reset request
│   │   │   └── reset-password/       # Password reset form
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar + topbar + auth guard)
│   │   │   ├── dashboard/page.tsx    # Main dashboard with KPIs & charts
│   │   │   ├── analytics/page.tsx    # Analytics page with detailed charts
│   │   │   ├── submissions/
│   │   │   │   ├── page.tsx          # All submissions (admin view)
│   │   │   │   ├── new/page.tsx      # Register new submission form
│   │   │   │   ├── my/page.tsx       # My submissions list
│   │   │   │   ├── [id]/page.tsx     # Submission detail & management
│   │   │   │   ├── calendar/page.tsx # Calendar view of submissions
│   │   │   │   └── kanban/page.tsx   # Kanban board view
│   │   │   ├── assistant/page.tsx    # AI Assistant chat interface
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Profile settings
│   │   │   │   ├── notifications/    # Notification preferences
│   │   │   │   ├── sessions/         # Active sessions manager
│   │   │   │   └── settings/         # Appearance & account settings
│   │   │   └── admin/
│   │   │       ├── users/page.tsx    # User management (admin)
│   │   │       ├── industries/       # Industry CRUD (admin)
│   │   │       └── logs/page.tsx     # Audit logs viewer (admin)
│   │   ├── layout.tsx                # Root locale layout (i18n + fonts + theme)
│   │   └── page.tsx                  # Public intake form redirect
│   ├── api/
│   │   ├── submit/route.ts           # AI classification + DB insert
│   │   ├── analyze/route.ts          # AI analysis endpoint
│   │   ├── ai-assistant/route.ts     # AI assistant streaming endpoint
│   │   ├── push/route.ts             # Web push notification sender
│   │   └── notifications/route.ts    # Mark-as-read endpoint
│   ├── auth/callback/route.ts        # OAuth callback handler
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Root redirect → /en
├── components/
│   ├── dashboard/
│   │   ├── dashboard-view.tsx        # Main dashboard with charts & KPIs
│   │   ├── dashboard-charts.tsx      # Chart components
│   │   ├── submissions-table.tsx     # Data table for submissions
│   │   ├── submission-management.tsx # Submission detail & status management
│   │   ├── submission-form.tsx       # New submission form
│   │   ├── submission-drawer.tsx     # Slide-over submission details
│   │   ├── submission-history.tsx    # Status change timeline
│   │   ├── submissions-kanban.tsx    # Kanban board component
│   │   ├── submissions-calendar.tsx  # Calendar view component
│   │   ├── kanban-card.tsx           # Individual kanban card
│   │   ├── kanban-column.tsx         # Kanban column with drop zone
│   │   ├── ai-assistant.tsx          # AI chat interface
│   │   ├── profile-form.tsx          # Profile edit form
│   │   ├── sessions-table.tsx        # Active sessions table
│   │   ├── session-details-modal.tsx # Session detail popup
│   │   ├── sessions-tab.tsx          # Sessions tab wrapper
│   │   ├── notification-prefs.tsx    # Notification preference toggles
│   │   ├── notifications-list.tsx    # Notification list with actions
│   │   ├── appearance-card.tsx       # Theme toggle card
│   │   ├── account-danger-zone.tsx   # Deactivate/delete account
│   │   ├── calendar-views.tsx        # Monthly/weekly calendar
│   │   ├── period-selector.tsx       # Time period filter
│   │   └── admin/
│   │       ├── users-manager.tsx     # Admin user management
│   │       ├── user-details.tsx      # User detail view
│   │       ├── industries-manager.tsx# Industry CRUD manager
│   │       ├── add-industry-button.tsx
│   │       ├── audit-logs-viewer.tsx # Audit log viewer
│   │       ├── logs-table.tsx        # Logs data table
│   │       └── log-details-modal.tsx # Log detail popup
│   ├── layout/
│   │   ├── dashboard-sidebar.tsx     # Role-aware sidebar navigation
│   │   ├── dashboard-topbar.tsx      # Top bar with user menu
│   │   ├── page-header.tsx           # Reusable page headers
│   │   └── mobile-nav.tsx            # Mobile navigation
│   ├── notifications/
│   │   ├── notification-provider.tsx # Real-time notification context
│   │   └── notification-bell.tsx     # Bell icon with unread count
│   ├── providers/
│   │   └── theme-provider.tsx        # Dark/light theme provider
│   ├── forms/                        # Reusable form components
│   ├── public-intake-form.tsx        # Public-facing lead form
│   └── ui/                           # 34 shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── service.ts                # Multi-model AI classification engine
│   │   └── assistant.ts              # AI assistant context builder
│   ├── actions/
│   │   ├── auth.ts                   # Auth server actions (register, login, sessions)
│   │   ├── submissions.ts            # Submission CRUD server actions
│   │   ├── notifications.ts          # Notification server actions
│   │   ├── industries.ts             # Industry CRUD server actions
│   │   ├── users.ts                  # User management server actions
│   │   ├── audit-logs.ts             # Audit log queries
│   │   └── audit.ts                  # Audit logging utility
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client + service client
│   │   ├── middleware.ts             # Session refresh middleware
│   │   └── database.types.ts         # Auto-generated TypeScript types
│   ├── queries/                      # Data fetching functions
│   ├── i18n/
│   │   └── request.ts               # next-intl configuration
│   ├── audit.ts                      # Audit logging helper
│   ├── email.ts                      # Resend email sender
│   ├── email-templates.ts            # HTML email templates
│   ├── export-utils.ts              # Data export utilities
│   └── utils.ts                      # Shared utilities (cn, colors, etc.)
├── messages/
│   ├── en.json                       # English translations
│   ├── fr.json                       # French translations
│   ├── es.json                       # Spanish translations
│   └── sq.json                       # Albanian translations
├── supabase/
│   └── migrations/                   # 14 SQL migration files (see Database section)
├── public/
│   └── sw.js                         # Service worker for push notifications
├── middleware.ts                      # Route protection + i18n + session refresh
├── next.config.mjs                   # Next.js config (intl, images, packages)
├── tailwind.config.ts                # Tailwind CSS configuration
├── package.json                      # Dependencies and scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 🔒 Security

### Defense in Depth

```
Request → Middleware → API Route → RLS Policy → Data
            │              │            │
            │              │            └── Supabase Row Level Security
            │              └── Server-side validation (Zod schemas)
            └── Auth check + route protection
```

| Layer | Implementation |
|-------|---------------|
| **Middleware** | Protects all `/dashboard/*`, `/profile/*`, `/submissions/*`, `/admin/*` routes |
| **RLS Policies** | Every table has fine-grained Row Level Security policies |
| **Service Role** | Server-only key — never exposed to the client bundle |
| **API Validation** | All inputs validated with Zod schemas before processing |
| **Audit Trail** | Every action logged with IP, user agent, and full data diffs |
| **Session Tracking** | All logins tracked with device fingerprinting and new-device alerts |
| **VAPID Auth** | Web push uses VAPID keys for secure message delivery |
| **CORS & Headers** | Managed by Vercel + Next.js security headers |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ using Next.js, Supabase, and AI<br/>
  <sub>Lead Intake Portal — AI-Powered Lead Management System</sub>
</p>
