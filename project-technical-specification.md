# Full-Stack Job Application Automation Platform — Technical Specification

---

## ⚠️ Implementation Notes (Read Before Starting)

### Razorpay — Deferred
Razorpay integration is **not active yet** — the API keys are not available at this time. Do the following:
- Build all subscription-related UI, database fields, and API route scaffolding as planned
- Replace actual Razorpay payment calls with a **mock/stub** that simulates a successful payment
- The stub should set `subscriptionPlan: "basic"` on the user record and return a fake `subscriptionId`
- When Razorpay keys become available, swap out only the payment-processing logic — no structural changes needed

### Database — MongoDB Atlas
- Use the **shared MongoDB Atlas cloud database directly** (no local MongoDB needed)
- Database name: **`applypilot`**
- The connection string will be provided via `.env` (see Section 13)
- Collections to create: `users`, `profiles`, `applications`, `jobs`, `companies_queue`

### Credentials
All credentials (MongoDB URI, SMTP, Google OAuth, Gemini API key, JWT secret) are provided in the attached `.env` file. Copy them as-is into your local `.env` / `.env.local` files. Do **not** commit these to version control — ensure `.env` is in `.gitignore`.

> ⚠️ **Note**: The credentials file was not received at time of writing. Once provided, paste values directly into the `.env` template in Section 13.

### Local-First Development
**Always develop and test locally before any deployment.** The workflow is:
1. Run Node.js backend locally (`npm run dev` or `node index.js`)
2. Run Next.js frontend locally (`npm run dev`)
3. Connect both to the live MongoDB Atlas `applypilot` database
4. Test every feature end-to-end locally before pushing to EC2
5. Only deploy to AWS EC2 after local tests pass

### AWS EC2 Deployment (When Ready)
When deploying the Node.js backend to AWS EC2:
- Use **PM2** as the process manager
- Setup commands:
  ```bash
  npm install -g pm2
  pm2 start index.js --name "applypilot-api"
  pm2 startup   # auto-restart on server reboot
  pm2 save
  ```
- Monitor logs: `pm2 logs applypilot-api`
- Restart after updates: `pm2 restart applypilot-api`
- The Python service should also be managed via PM2 or a separate systemd service

---

## 1. Project Overview

This document outlines the complete architecture and feature set for an AI-powered job application automation platform. The system migrates from a monolithic Next.js frontend into a multi-service architecture:

- **Frontend**: Next.js (existing, already built)
- **Backend API Layer**: Node.js (Express/Fastify) — handles auth, user management, subscriptions, and API orchestration
- **AI/Automation Service**: Python — handles job scraping, resume parsing, and automated job applications
- **Database**: MongoDB Atlas (shared across services)

---

## 2. Authentication System

### 2.1 Existing: Google OAuth
Google OAuth login is already implemented and working. Do not modify.

### 2.2 New: Email + Password Authentication

Implement a standard email/password sign-up and login flow:

- **Sign-up form fields**: Email address, Password
- On sign-up, send a **verification email** to the user's registered address before activating the account
- Email credentials (SMTP config, sender address) will be provided via `.env.local` or a shared environment config file
- Use JWT tokens for session management (see Section 9 — Middleware)

---

## 3. Architecture Migration: Next.js → Node.js Backend

All API calls that are currently handled inside Next.js (API routes, server actions, etc.) must be migrated to a standalone **Node.js backend service**.

The Node.js service will expose RESTful API endpoints consumed by the Next.js frontend. The Python service will share the same MongoDB Atlas database and communicate with the Node.js layer via internal APIs as needed.

**High-level service responsibilities:**

| Service | Responsibility |
|---|---|
| Next.js | UI rendering, routing, client-side logic |
| Node.js | Auth, user profiles, subscriptions, job listings API, admin routes |
| Python | Resume parsing, AI enrichment, job scraping, automated applications, cron jobs |

---

## 4. User Profile System

### 4.1 Profile Data Model

After onboarding, a detailed user profile must be built and stored in MongoDB. The profile must include (at minimum) the following fields:

**Personal Information**
- Full name
- Mobile number
- Current city/state of residence
- LinkedIn profile URL
- GitHub profile URL

**Professional Information**
- Years of experience
- Current job title / target job title
- Skills (array)
- Work experience (array of: company, role, start date, end date, description)
- Projects (array of: title, tech stack, description, URL)
- Education (array of: institution, degree, graduation year)

**Visa & Immigration Details**
- Visa type (H1B / OPT / STEM OPT / Green Card / Citizen / Other)
- Visa expiry date (if applicable)
- Work authorization status

**Automation Credentials (Optional)**
- LinkedIn email and password — *marked as optional but recommended*
  - Display message: *"Recommended — we use your LinkedIn credentials to apply to jobs on your behalf."*
- Gmail email and password — *optional*
  - Display message: *"Optional — provide your Gmail credentials so we can apply to roles that require Gmail-based authentication."*

> **Security Note**: Store all credentials encrypted at rest. Never log or expose them.

**Resume**
- Uploaded resume file reference (S3/cloud storage URL)
- Parsed resume data (structured JSON, filled by AI)

**Account Flags**
- `isEmailVerified`: boolean
- `isProfileComplete`: boolean
- `isAdminApproved`: boolean
- `subscriptionPlan`: enum — `none | basic | pro | elite`
- `subscriptionId`: Razorpay subscription reference

---

## 5. Resume Upload & AI-Powered Profile Enrichment

### 5.1 Resume Upload Flow

1. User uploads their resume (PDF/DOCX) via the onboarding form
2. Frontend shows a **"Processing your resume..."** loading state
3. Resume is sent to the **Node.js backend**
4. Node.js performs a token/size check:
   - Ensure the resume is within the AI model's context window limits before sending
   - If too large, extract text via OCR first, then truncate/summarize as needed
5. Node.js sends the resume content to **Gemini AI** in multiple structured API calls (one per profile section)

### 5.2 Gemini AI Parsing Strategy

Split profile enrichment into **5 separate Gemini API calls**, one per section, to stay within context limits and improve accuracy:

| Call # | Section | Expected Output |
|---|---|---|
| 1 | Personal Info | Name, phone, location, LinkedIn, GitHub |
| 2 | Work Experience | Array of jobs with dates, roles, descriptions |
| 3 | Skills & Tech Stack | Array of skills |
| 4 | Projects | Array of project entries |
| 5 | Education & Visa | Degrees, institutions, visa/work auth status |

Each call should return structured JSON in a pre-defined schema so the frontend can dynamically render and auto-fill form fields.

### 5.3 Post-Parsing: Show Empty Fields to User

After AI parsing completes:
- Auto-fill all form fields where data was successfully extracted
- **Identify all fields that are still empty or missing**
- Display only those empty/missing fields to the user for manual completion
- On submission, merge user-filled data with AI-extracted data and save the complete profile

---

## 6. Onboarding Flow (Step-by-Step)

```
1. User signs up (email/password or Google)
2. Email verification (email/password users only)
3. User sees subscription plans page (cannot skip)
4. User purchases a plan via Razorpay
5. Resume upload screen
6. Resume is processed → form auto-fills
7. User fills remaining empty fields
8. User sees "Profile submitted for review" screen
9. Admin reviews and approves the profile
10. User gains full access to dashboard
```

---

## 7. Subscription Plans & Feature Gating

### 7.1 Plans

Three subscription tiers. **Razorpay is mocked for now** — build the UI and DB fields, but use a stub that auto-approves payment. Swap in real Razorpay calls when keys are available:

| Plan | Label |
|---|---|
| Free / No Plan | `none` |
| Basic | `basic` |
| Pro | `pro` |
| Elite | `elite` |

### 7.2 Feature Access Matrix

| Feature | No Plan | Basic | Pro | Elite |
|---|---|---|---|---|
| Dashboard (view only, blurred) | ✅ | — | — | — |
| Dashboard (full access) | ❌ | ✅ | ✅ | ✅ |
| Job listings & filtering | ❌ | ✅ | ✅ | ✅ |
| Automated job applications | ❌ | ✅ | ✅ | ✅ |
| Job filtering by visa type | ❌ | ✅ | ✅ | ✅ |
| LinkedIn Profile Makeover | ❌ | ❌ | ✅ | ✅ |
| Custom company targeting | ❌ | ❌ | ✅ | ✅ |

### 7.3 No-Plan Paywall Behavior

When a user is logged in but has **no active subscription**:

- The dashboard is **visible but blurred** behind a semi-transparent overlay (do NOT use a dismissible modal)
- All stats show as `0` (e.g., "0 Applications", "0 Jobs Matched")
- The overlay spans the **full width and height** of the content area — no close/dismiss button
- The overlay displays a CTA: *"Purchase a plan to unlock your dashboard"* with a link to the plans page
- The user **can still navigate** using the left sidebar — only the content area is overlaid
- Locked premium features (e.g., LinkedIn Makeover) show a "Pro Plan Required" label/lock icon instead of being hidden

---

## 8. Dashboard

### 8.1 Layout

- **Left sidebar**: navigation between dashboard sections
- **Main content area**: dynamic content per section

### 8.2 Dashboard Sections & Metrics

**Applications Overview**
- Total applications submitted
- Applications by status (Applied, In Review, Rejected, Interview)
- Applications filtered by visa type:
  - STEM OPT
  - H1B
  - Green Card

**Job Filters & Saved Filters**
- User-defined job search filters (role, location, visa type, remote/onsite, etc.)
- Saved filter presets

**Job Listings (Master Portal)**
- Browse all jobs relevant to the user's profile and job role targets
- Search functionality (user can search beyond matched jobs)
- Filter jobs by:
  - Visa sponsorship type (Green Card / H1B / STEM OPT / No sponsorship)
  - Job type (Full-time, Contract, etc.)
  - Remote/Hybrid/Onsite
- Each job card shows: company name, role title, location, visa type tag, apply button
- Data source: populated by the Python service; show placeholder/empty state with dummy data until live

**Custom Company Targeting**
- User can type in a company name and add it to their personal "target companies" list
- Submitted companies are sent for admin review
- After review, the automation service will attempt to apply to open roles at those companies

**LinkedIn Profile Makeover** *(Pro/Elite only)*
- Request form for manual LinkedIn profile review and improvement
- Shows lock icon + upgrade prompt for Basic users

**Analytics**
- Applications submitted over time (chart)
- Response rate (replied vs. no reply)
- Email follow-up tracking (see Section 11 — Cron Jobs)

---

## 9. Middleware & Security

### 9.1 JWT Auth Middleware

- All protected routes require a valid JWT token in the `Authorization: Bearer <token>` header
- Middleware must validate: token signature, expiry, and that the user exists in the database
- Attach the decoded user object to `req.user` for downstream handlers

### 9.2 Role-Based Access Control

Two roles: `user` and `admin`

- All `/admin/*` routes are protected by an `isAdmin` middleware guard
- Attempting to access admin routes as a regular user returns `403 Forbidden`

### 9.3 Subscription Guard Middleware

- Certain routes (e.g., triggering job applications, LinkedIn makeover) require an active subscription
- Middleware checks `user.subscriptionPlan !== 'none'` before allowing access
- Return appropriate error code (`402 Payment Required`) with a message directing the user to subscribe

---

## 10. Admin Portal

Admin users have access to a protected admin dashboard with the following capabilities:

- **User Management**: View all registered users, their profile completion status, and their subscription tier
- **Profile Approval**: Review submitted user profiles and approve/reject them
  - Approved → sets `isAdminApproved: true`, user gains dashboard access
  - Rejected → user is notified and prompted to update their profile
- **Subscription Management**: Manually upgrade or change a user's subscription plan (for support cases)
- **Job Listings Management**: Add, edit, or remove job listings from the master portal
- **Application Logs**: View all job applications submitted per user
- **Company Review Queue**: Review custom company names submitted by users, approve for targeting

---

## 11. Python Automation Service

### 11.1 Responsibilities

- Runs independently, connects to the **same MongoDB Atlas cluster**
- Picks up approved user profiles from the database
- Reads each user's:
  - Target job roles and preferences
  - Visa type and work authorization
  - LinkedIn/Gmail credentials (if provided)
- Searches for matching job listings
- Applies to jobs automatically on behalf of the user
- Writes application records back to MongoDB (company, role, date applied, status)

### 11.2 Application Record Schema (MongoDB Collection: `applications`)

```json
{
  "userId": "ObjectId",
  "company": "string",
  "role": "string",
  "jobUrl": "string",
  "visaType": "H1B | STEM OPT | Green Card | None",
  "appliedAt": "ISODate",
  "status": "applied | replied | rejected | interview",
  "source": "linkedin | email | company_site",
  "emailReplied": false
}
```

### 11.3 Cron Job — Email Follow-Up Tracker

- A scheduled cron job runs against the user's Gmail account (if credentials provided)
- Checks whether any employers have replied to application emails
- Updates `emailReplied: true` in the application record if a reply thread is found
- This data feeds the Analytics dashboard (response rate tracking)

### 11.4 Node.js ↔ Python API Contract

The Node.js service exposes internal API endpoints that the Python service and the frontend use to read/write application data:

- `GET /api/applications/:userId` — fetch all applications for a user
- `POST /api/applications` — log a new application (called by Python service)
- `PATCH /api/applications/:id` — update application status

---

## 12. Job Listings — Master Portal Data

- Jobs are stored in a MongoDB collection: `jobs`
- The Python service populates this collection by scraping or fetching job data
- **For initial development**: Insert dummy/seed job data so the frontend can be built and tested
- Each job document schema:

```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "remote": true,
  "visaSponsorship": "H1B | STEM OPT | Green Card | None",
  "jobType": "Full-time | Contract | Part-time",
  "applyUrl": "string",
  "postedAt": "ISODate",
  "tags": ["array", "of", "skills"]
}
```

---

## 13. Environment Configuration

All secrets and credentials must be stored in `.env` / `.env.local` and **never committed to version control**. Add `.env` to `.gitignore` immediately.

### Local Development Setup

```bash
# 1. Clone and install
npm install

# 2. Copy env template and fill in values from the provided credentials file
cp .env.example .env

# 3. Run locally
npm run dev          # Next.js frontend — http://localhost:3000
node index.js        # Node.js backend  — http://localhost:5000

# 4. Verify MongoDB Atlas connection on startup
# You should see: "Connected to MongoDB Atlas — applypilot"
```

### Required Environment Variables

```env
# MongoDB Atlas — use the provided connection string
# Database name is always: applypilot
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/applypilot

# JWT
JWT_SECRET=<from credentials file>
JWT_EXPIRY=7d

# Email / SMTP (from credentials file)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# Google OAuth (from credentials file)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Razorpay — LEAVE EMPTY for now, mock is used instead
# Uncomment and fill when keys are available
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=

# Gemini AI (from credentials file)
GEMINI_API_KEY=

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:5000   # local dev
# NEXT_PUBLIC_API_URL=https://your-ec2-ip   # production

# Node environment
NODE_ENV=development
```

> **Credentials file**: Copy all values from the attached `.env` file directly into the above template. Do not modify key names.

---

## 14. Local Testing Checklist

Before deploying to EC2, verify each of the following works locally:

**Auth**
- [ ] Sign up with email + password → verification email received
- [ ] Click email verification link → account activated
- [ ] Login with verified account → JWT returned
- [ ] Google OAuth login → works as before

**Onboarding**
- [ ] Subscription mock → clicking "Subscribe" sets plan to `basic` without Razorpay
- [ ] Resume upload → processing spinner shown
- [ ] Gemini API returns structured data → form auto-fills
- [ ] Empty fields highlighted → user can fill and submit
- [ ] Profile saved to MongoDB Atlas `applypilot.profiles`

**Dashboard**
- [ ] Unsubscribed user → full-width blurred overlay, no dismiss button
- [ ] Subscribed user → dashboard loads with real (or zero) data
- [ ] LinkedIn Makeover → locked for basic users, visible for pro/elite

**Admin**
- [ ] Admin login → can access `/admin` routes
- [ ] Regular user → blocked from `/admin` routes with 403

**Jobs**
- [ ] Seed dummy job data → visible in master portal
- [ ] Filters work (visa type, job type, remote)

---

---

## 15. Node.js API Endpoints Summary

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register with email + password |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/verify-email` | Verify email via token link |
| POST | `/api/auth/google` | Google OAuth callback handler |

### User Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/:userId` | Get user profile |
| PUT | `/api/profile/:userId` | Update user profile |
| POST | `/api/profile/resume` | Upload resume, trigger AI parsing |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/subscriptions/create` | Create Razorpay order |
| POST | `/api/subscriptions/verify` | Verify payment and activate plan |
| GET | `/api/subscriptions/:userId` | Get subscription details |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List jobs (with filters: visa, type, remote) |
| GET | `/api/jobs/search` | Search jobs by query |
| POST | `/api/jobs/apply` | Submit manual apply request |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/applications/:userId` | Get all applications for user |
| POST | `/api/applications` | Log new application |
| PATCH | `/api/applications/:id` | Update application status |

### Admin *(protected)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/:id/approve` | Approve user profile |
| PATCH | `/api/admin/users/:id/subscription` | Change subscription plan |
| GET | `/api/admin/applications` | View all application logs |
| GET | `/api/admin/companies/queue` | View pending custom company requests |
| PATCH | `/api/admin/companies/:id/approve` | Approve a company for targeting |
