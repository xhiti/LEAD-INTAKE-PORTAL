<div align="center">
  <h3>
    <a href="./README.md">📖 README</a> &nbsp;&nbsp; | &nbsp;&nbsp; 
    <b>📑 OVERVIEW</b> &nbsp;&nbsp; | &nbsp;&nbsp; 
    <a href="./LICENSE">⚖️ LICENSE</a>
  </h3>
</div>

# 📘 OVERVIEW — Lead Intake Portal

> **Complete Application Overview**
> This document provides an exhaustive breakdown of every user flow, navigation menu, database table, action, page, and AI integration in the Lead Intake Portal. Use this as the definitive reference for understanding the entire application.

---

## Table of Contents

- [1. Application Overview](#1-application-overview)
- [2. Authentication Flows](#2-authentication-flows)
- [3. Role-Based Access Control](#3-role-based-access-control)
- [4. Navigation & Menus](#4-navigation--menus)
- [5. Pages & Features In Detail](#5-pages--features-in-detail)
- [6. Database Tables](#6-database-tables)
- [7. AI Models & Intelligence](#7-ai-models--intelligence)
- [8. Notification System](#8-notification-system)
- [9. Internationalization (i18n)](#9-internationalization-i18n)
- [10. API Routes](#10-api-routes)
- [11. CI/CD Pipeline](#11-cicd-pipeline)
- [12. Security Architecture](#12-security-architecture)
- [13. Screenshots](#13-screenshots)

---

## 1. Application Overview

The **Lead Intake Portal** is a full-stack, AI-powered CRM system designed to:

1. **Accept business lead submissions** from a public-facing form (no login required)
2. **Automatically classify** each lead using AI (category + confidence + summary)
3. **Route and manage** leads through a pipeline: New → Reviewed → In Progress → Closed → Archived
4. **Notify team members** in real-time via in-app, web push, and email notifications
5. **Provide analytics** with charts, KPIs, and AI-powered business insights
6. **Maintain a full audit trail** of every action performed in the system

### Core User Journey

```
Public User                    Authenticated User                     Admin
─────────────                  ──────────────────                     ─────
Visits /{locale}   ────────►   Logs in (email/Google)   ────────►    Manages all
Submits lead form              Views own submissions                  users, industries
Gets AI results                Uses AI assistant                      and audit logs
(no login needed)              Tracks status changes                  Reviews all
                               Manages profile                        submissions
```

---

## 2. Authentication Flows

### 2.1 Email/Password Registration

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | User visits `/{locale}/register` | Registration form is displayed |
| 2 | User fills: email, password, name, surname | Client-side validation via Zod schema |
| 3 | User clicks "Create Account" | `registerUserAction()` server action is called |
| 4 | Server creates user via Supabase Admin API | `serviceClient.auth.admin.createUser()` with `email_confirm: true` |
| 5 | Server creates profile in `profiles` table | Sets `status: 'active'`, `email_verified: true`, `role: 'user'` |
| 6 | Server sends welcome email via Resend | HTML email from `getWelcomeEmail()` template |
| 7 | User is redirected to login page | Success message displayed |

### 2.2 Email/Password Login

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | User visits `/{locale}/login` | Login form with email + password fields |
| 2 | User enters credentials and clicks "Sign In" | `supabase.auth.signInWithPassword()` called |
| 3 | On success: session tracking | `trackLoginSessionAction()` logs the session with IP, browser, OS, device type |
| 4 | New device detection | If first login from this browser/IP combo, a "New Login Detected" email is sent |
| 5 | Audit log created | `logAction({ action: 'LOGIN', entityType: 'auth_session' })` |
| 6 | Redirect to dashboard | `/{locale}/dashboard` |

### 2.3 Google OAuth Sign-In

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | User clicks "Sign in with Google" button | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| 2 | Redirect to Google Consent Screen | User sees Google account picker |
| 3 | Google redirects to Supabase callback | `https://<project>.supabase.co/auth/v1/callback` |
| 4 | Supabase redirects to app callback | `/auth/callback?code=...` |
| 5 | App exchanges code for session | `supabase.auth.exchangeCodeForSession(code)` |
| 6 | Session tracking + audit logging | Same as email login steps 3-5 |
| 7 | Profile auto-creation if missing | Dashboard layout checks for profile, creates if needed using Google metadata (`given_name`, `family_name`) |
| 8 | Redirect to dashboard | `/{locale}/dashboard` |

### 2.4 Forgot Password

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | User clicks "Forgot password?" on login page | Navigates to `/{locale}/forgot-password` |
| 2 | User enters email address | `supabase.auth.resetPasswordForEmail()` called |
| 3 | Supabase sends reset email | Link points to `/{locale}/reset-password` |
| 4 | User clicks link in email | Lands on reset password form |
| 5 | User enters new password | `supabase.auth.updateUser({ password })` |
| 6 | Redirect to login | Success message shown |

### 2.5 Logout

| Step | Action | What Happens |
|------|--------|-------------|
| 1 | User clicks avatar → "Sign Out" | `logoutAndClearSessionsAction()` called |
| 2 | All active sessions deactivated | `auth_sessions` rows updated: `is_active: false`, `logged_out_at: now()` |
| 3 | Supabase session destroyed | `supabase.auth.signOut()` |
| 4 | Redirect to login page | `/{locale}/login` |

---

## 3. Role-Based Access Control

### 3.1 Role Definitions

| Role | Level | Description |
|------|-------|------------|
| **Admin** | Highest | Full system access — manages users, industries, views audit logs, manages all submissions |
| **Moderator** | High | Can manage all submissions, industries, and view audit logs; cannot manage other users' roles |
| **User** | Standard | Can submit leads, view own submissions, use AI assistant, access analytics |
| **Viewer** | Lowest | Read-only access to dashboard, calendar, profile, and sessions |

### 3.2 Permission Matrix

| Feature | Admin | Moderator | User | Viewer |
|---------|:-----:|:---------:|:----:|:------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| Register Submission | ✅ | ✅ | ✅ | ❌ |
| View My Submissions | ✅ | ✅ | ✅ | ❌ |
| View All Submissions | ✅ | ✅ | ❌ | ❌ |
| Kanban Board | ✅ | ✅ | ❌ | ❌ |
| Calendar View | ✅ | ✅ | ✅ | ✅ |
| AI Assistant | ✅ | ✅ | ✅ | ❌ |
| Manage Submission Status/Priority | ✅ | ✅ | ❌ | ❌ |
| Profile Settings | ✅ | ✅ | ✅ | ✅ |
| Notification Preferences | ✅ | ✅ | ✅ | ✅ |
| Active Sessions | ✅ | ✅ | ✅ | ✅ |
| Appearance Settings | ✅ | ✅ | ✅ | ✅ |
| **Admin: User Management** | ✅ | ✅ | ❌ | ❌ |
| **Admin: Industry Management** | ✅ | ✅ | ❌ | ❌ |
| **Admin: Audit Logs** | ✅ | ✅ | ❌ | ❌ |

### 3.3 Where Roles Are Enforced

1. **Middleware** (`middleware.ts`) — Redirects unauthenticated users away from protected routes
2. **Dashboard Layout** (`(dashboard)/layout.tsx`) — Fetches user profile + role, passes to sidebar
3. **Sidebar Navigation** (`dashboard-sidebar.tsx`) — Each nav item has a `roles` array; items are hidden if user's role is not included
4. **Server Actions** — Each action verifies the user's role before executing
5. **RLS Policies** — Supabase Row Level Security filters data at the database level

---

## 4. Navigation & Menus

### 4.1 Sidebar Navigation

The sidebar is divided into **4 groups**, each with role-based visibility:

#### Group 1: Menu
| Item | Route | Icon | Visible To | Description |
|------|-------|------|-----------|-------------|
| **Dashboard** | `/{locale}/dashboard` | `LayoutDashboard` | All roles | Main KPI dashboard with charts |
| **Analytics** | `/{locale}/analytics` | `BarChart3` | User, Admin, Moderator | Detailed analytics with submission and user charts |

#### Group 2: Submissions
| Item | Route | Icon | Visible To | Description |
|------|-------|------|-----------|-------------|
| **Register Submission** | `/{locale}/submissions/new` | `Sparkles` | User, Admin, Moderator | AI-powered new lead form |
| **My Submissions** | `/{locale}/submissions/my` | `FileText` | User, Admin, Moderator | Personal submissions list |
| **All Submissions** | `/{locale}/submissions` | `ShieldCheck` | Admin, Moderator | Full submission management table |
| **Calendar** | `/{locale}/submissions/calendar` | `Calendar` | All roles | Monthly/weekly calendar view |
| **Kanban** | `/{locale}/submissions/kanban` | `Trello` | Admin, Moderator | Drag-and-drop pipeline board |
| **AI Assistant** | `/{locale}/assistant` | `MessageSquare` | User, Admin, Moderator | Context-aware AI chatbot |

#### Group 3: Profile
| Item | Route | Icon | Visible To | Description |
|------|-------|------|-----------|-------------|
| **Account** | `/{locale}/profile` | `User` | All roles | Profile editing form |
| **Notifications** | `/{locale}/profile/notifications` | `Bell` | All roles | Notification preferences |
| **Active Sessions** | `/{locale}/profile/sessions` | `History` | All roles | Login session management |
| **Settings** | `/{locale}/profile/settings` | `Settings` | All roles | Appearance & danger zone |

#### Group 4: Admin (Admin/Moderator only)
| Item | Route | Icon | Visible To | Description |
|------|-------|------|-----------|-------------|
| **Users** | `/{locale}/admin/users` | `Users` | Admin, Moderator | User management (roles, status) |
| **Industries** | `/{locale}/admin/industries` | `Database` | Admin, Moderator | Industry CRUD management |
| **Logs** | `/{locale}/admin/logs` | `History` | Admin, Moderator | Audit log viewer |

### 4.2 Top Bar

| Element | Description | Actions |
|---------|-------------|---------|
| **Page Title** | Dynamic based on current route | — |
| **Language Switcher** | Dropdown: EN, FR, ES, SQ | Changes locale in URL |
| **Notification Bell** | Shows unread count badge | Opens notification dropdown |
| **User Avatar** | Profile picture / initials | Opens dropdown menu |
| **User Dropdown** | Profile link, theme toggle, sign out | Navigate or sign out |

---

## 5. Pages & Features In Detail

### 5.1 Public Intake Form (`/{locale}`)

**Purpose:** Allow anyone (no login required) to submit a business lead.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Full Name | Text | Required | Contact person name |
| Email | Email | Required, valid format | Contact email address |
| Business Name | Text | Required | Company/organization name |
| Industry | Select dropdown | Required | Populated from `industries` table |
| Help Request | Textarea | Required | Detailed description of what they need |

**Flow:**
1. User fills out the form
2. Clicks "Submit"
3. Request sent to `POST /api/submit`
4. Server calls AI classification service → gets summary, category, confidence
5. Submission stored in `submissions` table with AI results
6. Notification created for admin users
7. User sees success message with AI classification results

**Actions available:** Submit form

---

### 5.2 Dashboard (`/{locale}/dashboard`)

**Purpose:** Overview of all submission activity with KPIs and charts.

**Visible to:** All roles

| Section | Content | Details |
|---------|---------|---------|
| **Period Selector** | 7 Days / 30 Days / 90 Days / 1 Year | Filters all data below by time period |
| **KPI Cards** | 4 animated stat cards | Total All Time, Total in Period, Pending, Resolved in Period |
| **Time Series Chart** | Area chart | Submissions over time for selected period |
| **Status Distribution** | Pie chart | Breakdown: New, Reviewed, In Progress, Closed, Archived |
| **Category Breakdown** | Bar chart | AI categories: Automation, Website, AI Integration, SEO, Custom Software, Other |
| **Industry Breakdown** | Bar chart | Distribution across industries |
| **Recent Submissions** | Table (5 rows) | Latest submissions with name, business, status, priority, date |
| **Users Over Time** | Line chart (admin only) | Registered user growth |

**Actions available:** Change time period, click submission to view details

---

### 5.3 Analytics (`/{locale}/analytics`)

**Purpose:** In-depth analytics and reporting with additional charts.

**Visible to:** User, Admin, Moderator

| Section | Content |
|---------|---------|
| **KPI Cards** | Total all time, period total, pending, resolved |
| **Submission Trends** | Time-series area chart |
| **Status Distribution** | Pie chart |
| **Category Breakdown** | Horizontal bar chart |
| **Industry Breakdown** | Horizontal bar chart |
| **Users Over Time** | Line chart showing registered user growth |

**Actions available:** Change time period filter, view detailed chart data

---

### 5.4 Register Submission (`/{locale}/submissions/new`)

**Purpose:** Submit a new lead with AI-powered classification.

**Visible to:** User, Admin, Moderator

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full Name | Text | ✅ | Lead's contact name |
| Email | Email | ✅ | Lead's contact email |
| Business Name | Text | ✅ | Lead's company name |
| Industry | Select | ✅ | Dropdown from industries table |
| Help Request | Textarea | ✅ | Detailed description of needs |

**Flow:**
1. User fills the form
2. Validation with Zod schema on submit
3. AI processes the request (classification + summarization)
4. Results stored in DB with AI metadata
5. Success toast with AI results displayed
6. Form resets for next submission

**Actions available:** Fill form, submit, view AI results

---

### 5.5 My Submissions (`/{locale}/submissions/my`)

**Purpose:** View and filter your own submissions.

**Visible to:** User, Admin, Moderator

| Feature | Description |
|---------|-------------|
| **Search bar** | Search by name, business name, or email |
| **Status filter** | Filter by: All, New, Reviewed, In Progress, Closed, Archived |
| **Priority filter** | Filter by: All, Low, Medium, High, Urgent |
| **Sortable table** | Columns: Name, Business, Industry, AI Category, Status, Priority, Date |
| **Result count** | Shows "X results found" |
| **Pagination** | Navigate through pages of results |

**Actions available:** Search, filter, sort, click row to view details

---

### 5.6 All Submissions (`/{locale}/submissions`) — Admin/Moderator

**Purpose:** Manage all submissions from all users.

**Visible to:** Admin, Moderator only

| Feature | Description |
|---------|-------------|
| **All features from My Submissions** | Search, filter, sort, pagination |
| **Inline status edit** | Change status directly from the table row |
| **Inline priority edit** | Change priority directly from the table row |
| **Bulk actions** | Select multiple submissions for bulk operations |
| **Submission drawer** | Slide-over panel with full submission details |
| **Export data** | Download submissions data |

**Actions available:** All My Submissions actions + edit status/priority inline, export, bulk actions

---

### 5.7 Submission Detail (`/{locale}/submissions/[id]`)

**Purpose:** Full view of a single submission with management capabilities.

**Visible to:** Owner of submission, Admin, Moderator

| Section | Content |
|---------|---------|
| **Lead Info** | Name, email, business name, industry, full help request |
| **AI Results** | Summary, category badge, confidence score, model used, processed timestamp |
| **Status & Priority** | Current status badge + priority badge |
| **Status Controls** (Admin/Mod) | Dropdown to change status (auto-generates AI note) |
| **Priority Controls** (Admin/Mod) | Dropdown to change priority |
| **Notes** | Editable notes field |
| **Submission History** | Full timeline of every status/priority change with timestamps and AI notes |

**Actions available:**
- Admin/Mod: Change status, change priority, add notes, save changes
- Users: View only (read access to their own submissions)

---

### 5.8 Kanban Board (`/{locale}/submissions/kanban`)

**Purpose:** Visual pipeline management with drag-and-drop.

**Visible to:** Admin, Moderator only

| Column | Status | Color |
|--------|--------|-------|
| **New** | `new` | Blue |
| **Reviewed** | `reviewed` | Yellow |
| **In Progress** | `in_progress` | Purple |
| **Closed** | `closed` | Green |
| **Archived** | `archived` | Gray |

**Each card shows:** Lead name, business name, industry, priority badge, AI category, date

**Actions available:** Drag card between columns (updates status), click card for details

---

### 5.9 Calendar (`/{locale}/submissions/calendar`)

**Purpose:** View submissions plotted on a calendar.

**Visible to:** All roles

| View | Description |
|------|-------------|
| **Monthly** | Full month grid with submission dots on dates |
| **Weekly** | Weekly view with more detail per day |

**Each entry shows:** Submission name, status badge

**Actions available:** Switch between monthly/weekly, navigate months, click submission to view

---

### 5.10 AI Assistant (`/{locale}/assistant`)

**Purpose:** Context-aware AI chatbot for business insights.

**Visible to:** User, Admin, Moderator

| Feature | Description |
|---------|-------------|
| **Chat interface** | Full chat window with message history |
| **Quick actions** | 6 preset prompt buttons (see below) |
| **Context-aware** | Has access to all user's submissions data |
| **Markdown rendering** | AI responses rendered with full markdown support |
| **Streaming** | Responses stream in real-time |

**Quick Action Buttons:**

| Button | What it does |
|--------|-------------|
| 📥 Review new submissions | Summarizes new submissions, prioritizes which to attend first |
| ⚡ What's in progress? | Lists in-progress submissions and what they need next |
| 📊 Submission stats | Overview of counts by status, industry breakdown, trends |
| 🏢 Industry breakdown | Most represented industries, close rates by industry |
| ✅ Closed & archived | Analyzes patterns in successfully closed submissions |
| 🎯 What should I focus on? | Prioritization advice to maximize conversions |

**Actions available:** Type message, click quick action, scroll history

---

### 5.11 Profile Settings (`/{locale}/profile`)

**Purpose:** Edit personal information and manage account.

**Visible to:** All roles

| Tab/Section | Fields | Actions |
|-------------|--------|---------|
| **Personal Info** | Name, Surname, Email (read-only), Phone, Gender, Bio, Company, Job Title, Timezone | Edit and save |
| **Avatar** | Profile picture | Upload new image (stored in Supabase Storage `avatars` bucket) |

---

### 5.12 Notification Preferences (`/{locale}/profile/notifications`)

**Purpose:** Configure notification delivery preferences.

**Visible to:** All roles

| Channel | Settings |
|---------|----------|
| **In-App** | Toggle for: New submissions, Status changes, System alerts, Account updates |
| **Web Push** | Master toggle + individual: New submissions, Status changes, System alerts |
| **Email** | Toggle for: New submissions, Status changes, Weekly digest |
| **Do Not Disturb** | Enable/disable + Start time + End time |

**Actions available:** Toggle individual settings, enable/disable push notifications

---

### 5.13 Active Sessions (`/{locale}/profile/sessions`)

**Purpose:** View and manage login sessions across devices.

**Visible to:** All roles

| Column | Data |
|--------|------|
| **Device** | Desktop, Mobile, or Tablet icon |
| **Browser** | Chrome, Firefox, Safari, Edge, etc. |
| **OS** | Windows, macOS, Linux, iOS, Android |
| **IP Address** | IPv4/IPv6 address |
| **Provider** | Email or Google |
| **Login Time** | When the session started |
| **Status** | Active (green) or Expired (gray) |

**Actions available:** View session details (modal), revoke/end individual sessions

---

### 5.14 Settings (`/{locale}/profile/settings`)

**Purpose:** Appearance settings and account danger zone.

**Visible to:** All roles

| Section | Content | Actions |
|---------|---------|---------|
| **Appearance** | Theme toggle: Light / Dark / System | Click to change theme |
| **Danger Zone** | Deactivate account, Delete account | Deactivate (reversible), Delete (permanent, requires confirmation) |

---

### 5.15 User Management (`/{locale}/admin/users`) — Admin

**Purpose:** View and manage all registered users.

**Visible to:** Admin, Moderator

| Column | Data |
|--------|------|
| **Avatar** | User profile picture or initials |
| **Name** | Full name |
| **Email** | Email address |
| **Role** | Badge: admin, moderator, user, viewer |
| **Status** | Active, Deactivated, Deleted |
| **Last Login** | When they last logged in |
| **Created** | Registration date |

**Actions available:**
- Search users by name or email
- Filter by role and status
- Click user to view full details (modal/panel)
- Change user role (dropdown)
- View user's session history

---

### 5.16 Industry Management (`/{locale}/admin/industries`) — Admin

**Purpose:** CRUD operations on submission industry categories.

**Visible to:** Admin, Moderator

| Column | Data |
|--------|------|
| **Title** | Industry display name |
| **Code** | Unique industry identifier |
| **Description** | Brief description |
| **Order** | Sort order in dropdowns |
| **Status** | Active (green) / Inactive (gray) badge |

**Actions available:**
- **Add Industry** — button in page header, opens form dialog
- **Edit Industry** — edit button on each row
- **Delete Industry** — soft-delete (sets `is_deleted: true`, `is_active: false`)
- **Search** — filter industries by title or code
- **Filter** — by active/inactive status

---

### 5.17 Audit Logs (`/{locale}/admin/logs`) — Admin

**Purpose:** Immutable audit trail of every action in the system.

**Visible to:** Admin, Moderator

| Column | Data |
|--------|------|
| **Timestamp** | When the action occurred |
| **User** | Who performed the action (avatar + name) |
| **Action** | `LOGIN`, `CREATE`, `UPDATE`, `DELETE` |
| **Entity Type** | `profile`, `submission`, `auth_session`, `industry`, `notification` |
| **Entity ID** | UUID of the affected record |
| **IP Address** | IP from which the action was performed |
| **Details** | Expandable: old data, new data, metadata, user agent |

**Actions available:**
- Search logs by user, action, or entity
- Filter by action type and entity type
- Filter by date range
- Click row to expand full detail modal (shows complete old/new data diff)
- Pagination through log entries

---

## 6. Database Tables

### 6.1 `profiles` — User Profiles

**Purpose:** Stores user metadata linked 1:1 with Supabase `auth.users`.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK, FK → auth.users) | — | Matches Supabase auth user ID |
| `name` | TEXT | — | First name |
| `surname` | TEXT | — | Last name |
| `initials` | TEXT (generated) | Auto | Uppercase first letters of name + surname |
| `full_name` | TEXT (generated) | Auto | `name || ' ' || surname` |
| `email` | TEXT (unique) | — | Email address |
| `phone` | TEXT | NULL | Phone number |
| `gender` | TEXT | NULL | `male`, `female`, `non_binary`, `prefer_not_to_say` |
| `role` | TEXT | `'user'` | `user`, `admin`, `moderator`, `viewer` |
| `avatar_url` | TEXT | NULL | URL to avatar in Supabase Storage |
| `locale` | TEXT | `'en'` | Preferred language |
| `theme` | TEXT | `'system'` | `light`, `dark`, `system` |
| `last_login` | TIMESTAMPTZ | NULL | Timestamp of last login |
| `email_verified` | BOOLEAN | FALSE | Whether email is verified |
| `phone_verified` | BOOLEAN | FALSE | Whether phone is verified |
| `onboarding_completed` | BOOLEAN | FALSE | Whether onboarding flow is done |
| `bio` | TEXT | NULL | User bio/description |
| `company` | TEXT | NULL | Company name |
| `job_title` | TEXT | NULL | Job title |
| `timezone` | TEXT | `'UTC'` | Preferred timezone |
| `is_active` | BOOLEAN | TRUE | Whether account is active |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | Row creation time |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update (auto via trigger) |

**RLS Policies:**
- Users can SELECT/UPDATE own profile
- Admins can SELECT/UPDATE all profiles

---

### 6.2 `auth_sessions` — Login Sessions

**Purpose:** Tracks every login event with device fingerprinting.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Session ID |
| `user_id` | UUID (FK → profiles) | — | Who logged in |
| `session_token` | TEXT | NULL | Session token (optional) |
| `ip_address` | INET | — | IP address of login |
| `user_agent` | TEXT | — | Browser user agent string |
| `device_type` | TEXT | — | `desktop`, `mobile`, `tablet`, `unknown` |
| `browser` | TEXT | — | Browser name (Chrome, Firefox, etc.) |
| `os` | TEXT | — | Operating system (Windows, macOS, etc.) |
| `country` | TEXT | NULL | Geo IP country |
| `city` | TEXT | NULL | Geo IP city |
| `provider` | TEXT | `'email'` | `email`, `google`, `github` |
| `is_active` | BOOLEAN | TRUE | Whether session is still active |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `logged_in_at` | TIMESTAMPTZ | NOW() | When login occurred |
| `logged_out_at` | TIMESTAMPTZ | NULL | When logout occurred |
| `expires_at` | TIMESTAMPTZ | NULL | Session expiration time |
| `created_at` | TIMESTAMPTZ | NOW() | Row creation time |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**RLS Policies:**
- Users can SELECT/UPDATE own sessions
- Admins can SELECT all sessions
- Service role can INSERT sessions

---

### 6.3 `submissions` — Lead Submissions

**Purpose:** Core table storing every business lead with AI classification results.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Submission ID |
| `submitted_by` | UUID (FK → profiles) | NULL | Who submitted (NULL for public/anon) |
| `name` | TEXT | — | Contact person name |
| `email` | TEXT | — | Contact email |
| `business_name` | TEXT | — | Company name |
| `industry` | TEXT | — | Selected industry (`Healthcare`, `Real Estate`, `Legal`, `Finance`, `Professional Services`, `Other`) |
| `help_request` | TEXT | — | Full description of what they need |
| `ai_summary` | TEXT | NULL | AI-generated one-sentence summary |
| `ai_category` | TEXT | NULL | AI classification: `Automation`, `Website`, `AI Integration`, `SEO`, `Custom Software`, `Other` |
| `ai_confidence_score` | NUMERIC(4,2) | NULL | AI confidence (0.00–1.00) |
| `ai_model_used` | TEXT | NULL | Which AI model processed this (`gemini-1.5-flash`, `groq/llama-3.1-8b-instant`, `glm-4-flash`, `fallback`) |
| `ai_processed_at` | TIMESTAMPTZ | NULL | When AI processed the submission |
| `ai_raw_response` | JSONB | NULL | Full raw API response from the AI model |
| `status` | TEXT | `'new'` | Pipeline status: `new`, `reviewed`, `in_progress`, `closed`, `archived` |
| `priority` | TEXT | `'medium'` | Priority level: `low`, `medium`, `high`, `urgent` |
| `notes` | TEXT | NULL | Internal notes from reviewers |
| `reviewed_by` | UUID (FK → profiles) | NULL | Who reviewed the submission |
| `reviewed_at` | TIMESTAMPTZ | NULL | When it was reviewed |
| `is_active` | BOOLEAN | TRUE | Active flag |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**Indexes:** `status`, `ai_category`, `industry`, `created_at DESC`, `submitted_by`

**RLS Policies:**
- Admin/Moderator: full access (ALL operations)
- Users: SELECT own submissions
- Anyone: INSERT (public form)

---

### 6.4 `submission_history` — Status Change Tracking

**Purpose:** Records every status and priority change with AI-generated notes.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | History entry ID |
| `submission_id` | UUID (FK → submissions) | — | Which submission changed |
| `changed_by` | UUID (FK → profiles) | NULL | Who made the change |
| `old_status` | TEXT | NULL | Previous status |
| `new_status` | TEXT | NULL | New status |
| `old_priority` | TEXT | NULL | Previous priority |
| `new_priority` | TEXT | NULL | New priority |
| `note` | TEXT | NULL | AI-generated or manual note about the change |
| `is_active` | BOOLEAN | TRUE | Active flag |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | When the change occurred |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**RLS Policies:**
- Admin/Moderator: SELECT all history
- Users: SELECT history of own submissions

---

### 6.5 `notifications` — In-App Notifications

**Purpose:** In-app notification system with Supabase Realtime support.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Notification ID |
| `user_id` | UUID (FK → profiles) | — | Recipient |
| `type` | TEXT | — | `new_submission`, `submission_reviewed`, `submission_status_changed`, `system_alert`, `account_update`, `welcome`, `role_changed`, `mention` |
| `title` | TEXT | — | Notification title |
| `body` | TEXT | — | Notification body text |
| `data` | JSONB | `'{}'` | Extra payload data |
| `action_url` | TEXT | NULL | URL to navigate to when clicked |
| `is_read` | BOOLEAN | FALSE | Whether user has read it |
| `read_at` | TIMESTAMPTZ | NULL | When it was read |
| `channel` | TEXT | `'in_app'` | `in_app`, `web_push`, `email` |
| `is_active` | BOOLEAN | TRUE | Active flag |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**Realtime:** Table is added to `supabase_realtime` publication for live updates.

**RLS Policies:**
- Users: SELECT/UPDATE own notifications
- Service role: INSERT

---

### 6.6 `notification_preferences` — User Notification Settings

**Purpose:** Per-user granular notification preferences.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Preference ID |
| `user_id` | UUID (FK, unique) | — | One row per user |
| `in_app_new_submission` | BOOLEAN | TRUE | In-app alerts for new submissions |
| `in_app_status_changes` | BOOLEAN | TRUE | In-app for status changes |
| `in_app_system_alerts` | BOOLEAN | TRUE | In-app for system alerts |
| `in_app_account_updates` | BOOLEAN | TRUE | In-app for account updates |
| `push_enabled` | BOOLEAN | FALSE | Master push toggle |
| `push_subscription` | JSONB | NULL | Web Push subscription object |
| `push_new_submission` | BOOLEAN | TRUE | Push for new submissions |
| `push_status_changes` | BOOLEAN | TRUE | Push for status changes |
| `push_system_alerts` | BOOLEAN | TRUE | Push for system alerts |
| `email_new_submission` | BOOLEAN | FALSE | Email for new submissions |
| `email_status_changes` | BOOLEAN | TRUE | Email for status changes |
| `email_weekly_digest` | BOOLEAN | FALSE | Weekly digest email |
| `dnd_enabled` | BOOLEAN | FALSE | Do Not Disturb toggle |
| `dnd_start_time` | TIME | NULL | DND start time |
| `dnd_end_time` | TIME | NULL | DND end time |
| `is_active` | BOOLEAN | TRUE | Active flag |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**RLS Policies:**
- Users: ALL operations on own preferences
- Service role: INSERT

---

### 6.7 `audit_logs` — Immutable Audit Trail

**Purpose:** Append-only log of every action performed in the system.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Log entry ID |
| `user_id` | UUID (FK → profiles) | NULL | Who performed the action |
| `action` | TEXT | — | `LOGIN`, `CREATE`, `UPDATE`, `DELETE` |
| `entity_type` | TEXT | — | `profile`, `submission`, `auth_session`, `industry`, `notification` |
| `entity_id` | UUID | NULL | ID of the affected entity |
| `old_data` | JSONB | NULL | Previous state of the entity |
| `new_data` | JSONB | NULL | New state of the entity |
| `metadata` | JSONB | `'{}'` | Additional context (provider, browser, OS, etc.) |
| `ip_address` | INET | NULL | IP address of the requester |
| `user_agent` | TEXT | NULL | Browser user agent string |
| `is_active` | BOOLEAN | TRUE | Active flag |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | When the action occurred |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**RLS Policies:**
- Admins: SELECT only (read-only, immutable by design)
- Service role: INSERT

---

### 6.8 `industries` — Industry Lookup Table

**Purpose:** Configurable list of industries for the submission form dropdown.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | gen_random_uuid() | Industry ID |
| `code` | TEXT (unique) | — | Machine-readable code (e.g., `Healthcare`) |
| `title` | TEXT | — | Display name (e.g., `Healthcare`) |
| `description` | TEXT | NULL | Brief description |
| `order_index` | INTEGER | 0 | Sort order in dropdowns |
| `is_active` | BOOLEAN | TRUE | Whether industry appears in forms |
| `is_deleted` | BOOLEAN | FALSE | Soft-delete flag |
| `created_at` | TIMESTAMPTZ | NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOW() | Last update time |

**Seed data:** `Healthcare (10)`, `Real Estate (20)`, `Legal (30)`, `Finance (40)`, `Professional Services (50)`, `Other (90)`

**RLS Policies:**
- Anyone: SELECT active industries
- Admins: ALL operations

---

## 7. AI Models & Intelligence

### 7.1 Lead Classification Engine (`lib/ai/service.ts`)

The portal uses a **multi-model fallback architecture**:

| Priority | Model | Provider | API Key | Speed | Use Case |
|----------|-------|----------|---------|-------|----------|
| 1 (Primary) | **Gemini 1.5 Flash** | Google AI | `GEMINI_API_KEY` | Fast | Primary classifier |
| 2 (Fallback) | **LLaMA 3.1 8B Instant** | Groq | `GROQ_API_KEY` | Very fast | Fallback + status notes |
| 3 (Fallback) | **GLM-4 Flash** | Zhipu AI | `GLM_API_KEY` | Moderate | Secondary fallback |
| 4 (Safe) | **Fallback** | None | — | Instant | Returns "Other" + 0 confidence |

**Classification Process:**
1. Client submits help request text
2. System prompt instructs AI to return JSON: `{ summary, category, confidence }`
3. Models are tried in priority order; first success wins
4. If model's key is not set, it's skipped entirely
5. If all models fail, a safe fallback is returned

**Output Categories:** `Automation`, `Website`, `AI Integration`, `SEO`, `Custom Software`, `Other`

### 7.2 AI Status Change Notes (`lib/ai/service.ts`)

When an admin/moderator changes a submission's status:
1. `generateStatusChangeNote()` is called
2. Uses **Groq (LLaMA 3.1)** to generate a brief, professional internal note
3. Note is context-aware (includes customer name, business, request, and AI summary)
4. Example: *"Moving to In Progress as we begin analyzing the automation requirements for Acme Corp."*

### 7.3 AI Assistant (`lib/ai/assistant.ts` + `app/api/ai-assistant/route.ts`)

A context-aware chatbot that:
1. Fetches all user submissions as context
2. Builds a rich system prompt with: total count, status breakdown, industry breakdown, 5 most recent submissions
3. Streams responses via Groq API
4. Supports 6 quick action prompts for common queries
5. Renders responses in full Markdown (headings, lists, tables, bold, etc.)

---

## 8. Notification System

### 8.1 Architecture

```
Action occurs (e.g., new submission)
         │
         ▼
┌──────────────────────┐
│  Check user prefs    │
│  (notification_prefs)│
└────────┬─────────────┘
         │
    ┌────┴─────┬─────────────┐
    ▼          ▼             ▼
 In-App     Web Push       Email
 (Supabase  (VAPID +       (Resend
  Realtime)  Service        API)
             Worker)
```

### 8.2 Notification Types

| Type | Trigger | Default Channel |
|------|---------|----------------|
| `new_submission` | A new lead is submitted | in_app |
| `submission_reviewed` | Submission marked as reviewed | in_app |
| `submission_status_changed` | Status changes (any transition) | in_app |
| `system_alert` | System-wide announcements | in_app |
| `account_update` | Profile or account changes | in_app |
| `welcome` | New user registration | in_app |
| `role_changed` | User's role is modified | in_app |
| `mention` | User is mentioned/tagged | in_app |

### 8.3 Channels

| Channel | Technology | Delivery |
|---------|-----------|----------|
| **In-App** | Supabase Realtime (PostgreSQL LISTEN/NOTIFY) | Instant, no page reload |
| **Web Push** | Web Push API + VAPID keys + Service Worker (`public/sw.js`) | Browser notification even when tab is closed |
| **Email** | Resend SDK | Template-based HTML emails (welcome, new device, status change) |

---

## 9. Internationalization (i18n)

### 9.1 Supported Languages

| Code | Language | Message File |
|------|----------|-------------|
| `en` | English | `messages/en.json` |
| `fr` | French | `messages/fr.json` |
| `es` | Spanish | `messages/es.json` |
| `sq` | Albanian | `messages/sq.json` |

### 9.2 How It Works

1. **Locale prefix** — all routes include locale: `/{locale}/dashboard` (e.g., `/en/dashboard`, `/fr/dashboard`)
2. **Default locale** — `en` (English)
3. **Middleware** — `next-intl` middleware handles locale detection and routing
4. **Translation keys** — all UI text uses `useTranslations('namespace')` hook
5. **User preference** — stored in `profiles.locale` column

---

## 10. API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/submit` | POST | None (public) | Receives lead form, runs AI classification, inserts into DB |
| `/api/analyze` | POST | Required | AI analysis endpoint for on-demand classification |
| `/api/ai-assistant` | POST | Required | Streams AI assistant response with submission context |
| `/api/push` | POST | Required | Sends web push notification to a specific user |
| `/api/notifications` | PATCH | Required | Marks notifications as read |
| `/auth/callback` | GET | OAuth | Handles OAuth callback, exchanges code for session |

---

## 11. CI/CD Pipeline

### 11.1 Workflow Files

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Push to `main`/`develop`/`staging` + PRs | ESLint → TypeScript type-check → Next.js build |
| **Preview** | `.github/workflows/preview.yml` | Pull requests to `main`/`develop` | Deploy preview to Vercel + comment URL on PR |
| **Production** | `.github/workflows/production.yml` | Push to `main` | Pre-flight checks → Vercel production deploy → Health check → Notify |

### 11.2 CI Pipeline Detail

```
┌─ Trigger: push/PR to main, develop, staging ─┐
│                                                │
│  Job 1: Quality Gate                           │
│  ├─ Checkout                                   │
│  ├─ Setup Node.js 20                           │
│  ├─ Cache node_modules                         │
│  ├─ npm ci (install)                           │
│  ├─ npm run lint (ESLint)                      │
│  └─ npm run type-check (TypeScript)            │
│                                                │
│  Job 2: Build Verification (needs quality)     │
│  ├─ Checkout                                   │
│  ├─ Setup Node.js 20                           │
│  ├─ Cache node_modules                         │
│  ├─ npm ci                                     │
│  ├─ npm run build (Next.js)                    │
│  └─ Report build size                          │
│                                                │
│  Job 3: PR Status (on PRs only)                │
│  └─ Summary table of all checks                │
└────────────────────────────────────────────────┘
```

### 11.3 Production Pipeline Detail

```
┌─ Trigger: push to main ──────────────────────┐
│                                               │
│  Job 1: Pre-flight Checks                     │
│  ├─ Lint + Type-check + Build                 │
│                                               │
│  Job 2: Deploy to Production (needs preflight)│
│  ├─ Vercel CLI install                        │
│  ├─ vercel pull (production env)              │
│  ├─ vercel build --prod                       │
│  ├─ vercel deploy --prod                      │
│  └─ Deployment summary                       │
│                                               │
│  Job 3: Health Check (needs deploy)           │
│  ├─ Wait 30s for propagation                  │
│  └─ HTTP status check (200/307/308 = ok)      │
│                                               │
│  Job 4: Notification (always runs)            │
│  └─ Final status report                       │
└───────────────────────────────────────────────┘
```

---

## 12. Security Architecture

### 12.1 Defense in Depth

| Layer | Technology | What It Protects |
|-------|-----------|-----------------|
| **Edge Middleware** | Next.js middleware + next-intl | Route protection, auth redirects |
| **Server Actions** | Server-side only execution | Business logic, data mutations |
| **Row Level Security** | Supabase PostgreSQL RLS | Every single table |
| **Service Role Key** | Server-only env variable | Never exposed to client |
| **Input Validation** | Zod schemas | All form inputs and API payloads |
| **Audit Logging** | `audit_logs` table | Every action with IP + user agent |
| **Session Tracking** | `auth_sessions` table | Device fingerprinting + new device alerts |
| **VAPID Authentication** | Web Push VAPID keys | Secure push notification delivery |

### 12.2 API Key Security

| Key | Location | Client-side? |
|-----|----------|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Client bundle | ✅ (safe — public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client bundle | ✅ (safe — restricted by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ❌ |
| `GEMINI_API_KEY` | Server only | ❌ |
| `GROQ_API_KEY` | Server only | ❌ |
| `GLM_API_KEY` | Server only | ❌ |
| `RESEND_API_KEY` | Server only | ❌ |
| `VAPID_PRIVATE_KEY` | Server only | ❌ |

---

## 13. Screenshots

> **📸 Screenshots will be added here.**
> Add your screenshots in this section using the following format:
>
> ```markdown
> ### Page Name
> ![Description of the screen](./screenshots/page-name.png)
> ```

### Login Page
*<!-- Add screenshot here -->*

### Register Page
*<!-- Add screenshot here -->*

### Dashboard
*<!-- Add screenshot here -->*

### Analytics
*<!-- Add screenshot here -->*

### Register Submission
*<!-- Add screenshot here -->*

### My Submissions
*<!-- Add screenshot here -->*

### All Submissions (Admin)
*<!-- Add screenshot here -->*

### Submission Detail
*<!-- Add screenshot here -->*

### Kanban Board
*<!-- Add screenshot here -->*

### Calendar View
*<!-- Add screenshot here -->*

### AI Assistant
*<!-- Add screenshot here -->*

### Profile Settings
*<!-- Add screenshot here -->*

### Notification Preferences
*<!-- Add screenshot here -->*

### Active Sessions
*<!-- Add screenshot here -->*

### Appearance & Settings
*<!-- Add screenshot here -->*

### User Management (Admin)
*<!-- Add screenshot here -->*

### Industry Management (Admin)
*<!-- Add screenshot here -->*

### Audit Logs (Admin)
*<!-- Add screenshot here -->*

### Public Intake Form
*<!-- Add screenshot here -->*

---

<p align="center">
  <sub>Lead Intake Portal — Complete Application Overview</sub><br/>
  <sub>Last updated: March 2026</sub>
</p>
