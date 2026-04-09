# Ceduverse — Functional Design Document

**Version:** 1.0
**Date:** April 7, 2026
**Status:** Production

---

## 1. Executive Summary

Ceduverse is a comprehensive educational and business ecosystem designed for vocational training, corporate compliance (STPS/DC3), cooperative membership management, and AI-powered instruction in Mexico. The platform combines a Learning Management System (LMS), a CRM with DENUE intelligence, a financial simulator for cooperative contributions, AI-powered digital twins for instructors, and an integrated e-commerce store.

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI |
| Routing (Client) | Wouter |
| State Management | TanStack React Query v5 |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase-hosted) |
| ORM | Drizzle ORM |
| Authentication | Custom JWT + OTP (Email/Phone) |
| Build Tool | esbuild (server), Vite (client) |
| Deployment | Replit (Autoscale) |

### 2.2 Architecture Pattern

The application follows a full-stack monorepo pattern:

```
client/           → React SPA (Vite)
server/           → Express API server
shared/           → Shared TypeScript types and schema (Drizzle)
dist/             → Production bundle (self-contained CJS)
```

### 2.3 Server Bootstrap

The server uses a sequential bootstrap pattern:
1. Register middleware (JSON parsing, URL encoding, CORS)
2. Mount health check endpoint (`/__health`)
3. Mount static file serving (uploads, audio cache)
4. Initialize authentication (JWT + OTP)
5. Register request logging middleware
6. Serve static frontend assets (production only)
7. Register all API routes
8. Mount error handler and SPA catch-all
9. Bind to port and begin accepting connections
10. Run background seeds and periodic sync tasks

### 2.4 Production Build

The production build creates a fully self-contained bundle:
- **Client:** Vite produces optimized static files in `dist/public/`
- **Server:** esbuild bundles all server code and dependencies into a single `dist/index.cjs` (6.5 MB), eliminating the need for `node_modules` at runtime
- **Startup safety:** The bundle includes crash handlers (`uncaughtException`, `unhandledRejection`) embedded via esbuild banner

---

## 3. User Roles and Access Control

### 3.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|-------------|
| `socio_estudiante` | Standard learner/member | Courses, certifications, dashboard |
| `socio_instructor` | Content creator with Digital Twin | Course management, AI tools, commissions |
| `socio_comercial` (Partner) | Affiliate/sales representative | Referral tracking, CRM, commissions |
| `empresa` | Corporate account | Team management, employee training |
| `empresa_rh` | Corporate HR role | Employee management, SAM requests |
| `director` | Regional leadership | Oversight, commission overrides |
| `admin` | Platform administrator | Full management panel |
| `superadmin` | Global administrator | All admin capabilities + system config |

### 3.2 Authentication Flow

1. User enters email on login page
2. System generates 6-digit OTP and sends via Resend email service
3. User enters OTP within 10-minute window (max 3 attempts)
4. Server validates OTP, creates/updates user record, issues JWT (7-day expiry)
5. Demo accounts bypass OTP for development/demo purposes
6. New users are redirected to onboarding (`/welcome`)
7. Users with pending terms must accept before proceeding (modal gate)

### 3.3 Role-Based Middleware

The server enforces access control through middleware functions:
- `requireAuth` — Authenticated user required
- `requireAdmin` — Admin or superadmin role
- `requireSuperadmin` — Superadmin only
- `requirePartner` — Partner (socio_comercial) role
- `requireInstructor` — Instructor role
- `requireOrgAdmin` — Organization administrator
- `checkPendingTerms` — Blocks if terms not accepted

---

## 4. Core Modules

### 4.1 Learning Management System (LMS)

#### 4.1.1 Course Types
- **Academy Courses:** Legacy courses synced from an external Academy API on a 6-hour interval. Cached locally in `academy_courses_cache` and `academy_curriculum_cache` tables.
- **Studio Courses:** Interactive courses created within the platform with modules, quizzes, and AI-generated content.

#### 4.1.2 Virtual Classroom (Aula Virtual)
- Student-facing interface for consuming course content
- Progress tracking per module and course
- Quiz system with multiple-choice questions, attempts tracking, and pass/fail scoring
- Certificate request system (Diploma, DC3/STPS, SEP)

#### 4.1.3 Course Structure
```
Course
├── Modules (ordered sections)
│   └── Content (HTML, video, audio)
├── Quizzes
│   └── Questions (multiple choice)
└── Metadata (instructor, duration, category, STPS compliance)
```

#### 4.1.4 Academy Sync
- Background service (`server/academy-sync.ts`) syncs courses every 6 hours
- Batch processing (100 courses per page)
- Handles auth failures gracefully (stops retrying on auth error)
- Tracks sync status (in-progress, last sync time, course count)

### 4.2 AI Engine

#### 4.2.1 AI Content Generation
- **OpenAI GPT-4o:** Generates personalized course content including HTML lectures, mind maps, quizzes, and class scripts
- **OpenAI TTS (tts-1-hd):** Converts class scripts to MP3 audio using the "onyx" voice
- **Anthropic Claude:** Powers the interactive AI Tutor with concise, conversational responses

#### 4.2.2 Digital Twin / Instructor Avatar
- **HeyGen Integration:** Creates AI video avatars of instructors
- Video generation from scripts
- Voice cloning for personalized audio
- **Daily.co Integration:** Provides virtual meeting rooms for live avatar sessions
- **Live Avatar Sessions:** Real-time streaming interaction between students and AI instructor avatars

### 4.3 CRM & DENUE Intelligence

#### 4.3.1 Prospect Management
- Business prospect database enriched with INEGI/DENUE data (Mexico's official business directory)
- Over 6 million business records in `empresas_prospectos`
- Contact management (`contactos_prospectos`)
- Interaction tracking (`interacciones_prospectos`)
- Data enrichment records (`enriquecimiento`)

#### 4.3.2 SAT 69-B Integration
- Import of SAT 69-B tax compliance list (14,000+ records)
- Cross-referencing prospects with EFOS (non-compliant taxpayers)
- Automated matching and flagging (`is_efos` field)

#### 4.3.3 Lead Management
- Lead capture and tracking
- Pipeline status management
- Partner assignment

### 4.4 Financial Simulator

#### 4.4.1 Hybrid Contribution System
- Dedicated route module (`server/financiero-routes.ts`)
- ROI calculations for cooperative contribution scenarios
- Company payment tracking (`company_payments`)
- Wallet management (`company_wallets`, `wallet_transactions`)
- Dispersion management (`dispersions`)
- Monthly contribution tracking (`monthly_contributions`)
- Partner commission calculations (`partner_commissions`)
- Contribution audit logging (`contribution_audit_log`)

### 4.5 E-Commerce Store

#### 4.5.1 Product Catalog
- Physical products (e.g., "Vault Kits" — crypto security hardware)
- Stock management with warehouse tracking
- Product variants and pricing in MXN

#### 4.5.2 Checkout & Payments
- **MercadoPago Integration:** Payment processing with checkout preferences and webhooks
- Order management (creation, status tracking, payment verification)
- Referral code discounts via `store_referral_codes`

#### 4.5.3 Shipping
- **Envia.com Integration:** Shipping quote generation and logistics
- Weight-based shipping calculations

### 4.6 Invoicing

#### 4.6.1 Facturapi Integration
- Mexican tax invoice generation (CFDI)
- Customer management
- PDF and XML download capabilities
- Invoice tracking in `invoices` table

### 4.7 Cooperative & Legal Compliance

#### 4.7.1 Membership Management
- Cooperative membership tracking (`cooperative_memberships`)
- Admission workflow with approval tracking
- Membership number generation (sequential)
- "Kit Cooperativista" PDF generation and email delivery

#### 4.7.2 Terms & Conditions
- Versioned terms management (`terms_versions`)
- User acceptance tracking (`user_terms_acceptances`)
- Modal gate that blocks navigation until terms are accepted
- Migration system for existing users when new terms are published

#### 4.7.3 Insurance Plans
- Multiple insurance plan tiers
- Per-employee pricing
- Enrollment tracking

### 4.8 Team & Organization Management

#### 4.8.1 Teams
- Company-level team creation with plan assignment
- Employee invitation system (email-based)
- RFC and fiscal data tracking
- Fee percentage configuration

#### 4.8.2 SAM Requests (Social Security)
- Request submission by team members
- Review workflow with approval/rejection
- Partner notification system

#### 4.8.3 Organizational Objectives
- Goal setting at organization level (`org_objectives`)
- Individual objective tracking (`user_objectives`)

### 4.9 Achievements & Certifications

#### 4.9.1 Achievement System
- Predefined achievements seeded at startup
- Categories: STPS compliance, onboarding milestones, graduation
- Blockchain contract address support for future NFT certification

#### 4.9.2 Certificate Requests
- Three certificate types: Diploma, DC3 (STPS), SEP
- Request workflow with status tracking
- Linked to course completion and achievement records

---

## 5. Frontend Architecture

### 5.1 Page Structure

#### Public Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Main marketing page with feature sections |
| `/empresas` | Empresas | Enterprise-focused landing |
| `/socios` | SociosLanding | Partner/instructor landing |
| `/auth` | AuthPage | Login and registration (OTP) |
| `/tienda` | TiendaPage | Product storefront |
| `/blog` | BlogPage | Blog listing |
| `/blog/:slug` | BlogPostPage | Individual article |
| `/vcard/:slug` | VCardPage | Digital business cards |
| `/terminos` | Legal | Terms of service |
| `/privacidad` | Legal | Privacy policy |
| `/cookies` | Legal | Cookie policy |

#### Authenticated Pages
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Main user hub with role-based sidebar |
| `/welcome` | Onboarding | New user setup wizard |
| `/academy` | AcademyPage | Course library browser |
| `/academy/:id` | AcademyCourse | Course detail and enrollment |
| `/aula-virtual` | AulaVirtual | Virtual classroom index |
| `/aula-virtual/:slug` | CursoVirtual | Interactive course viewer |
| `/tutor-ia` | StudioPage | AI Tutor interface |
| `/tutor-ia/:slug` | StudioCoursePage | Course-specific AI tutor |
| `/mensajes` | ThreadListView | Support messaging |
| `/mensajes/:threadId` | ThreadDetailView | Conversation thread |

#### Role-Specific Dashboards
| Route | Page | Roles |
|-------|------|-------|
| `/admin` | AdminPanel | admin, superadmin |
| `/admin/crm` | CrmDashboard | admin, superadmin |
| `/admin/financiero` | AdminFinanciero | admin, superadmin |
| `/instructor` | InstructorDashboard | socio_instructor |
| `/instructor/acreditacion` | InstructorAcreditacion | Any (upgrade path) |
| `/partner` | PartnerDashboard | socio_comercial |

### 5.2 Admin Panel Sub-Tabs
The admin panel uses internal tab navigation:
- `overview` — Platform statistics
- `usuarios` — User management
- `empresas` — Company management
- `cursos` — Course administration
- `certificados` — Certificate requests
- `instructores` — Instructor management
- `pagos` — Payment tracking
- `facturacion` — Invoice management
- `denue` — DENUE data browser
- `blog` — Blog content management
- `tienda` — Store administration
- `roles` — Role management
- `logs` — System logs

### 5.3 Navigation Components
- **Dynamic Sidebar:** Adapts navigation items based on user role
- **Terms Modal Gate:** Intercepts navigation if terms acceptance is pending
- **Auth Guard:** Redirects unauthenticated users to `/auth`

---

## 6. External Integrations

| Service | Purpose | Server Module |
|---------|---------|--------------|
| **Supabase** | PostgreSQL database hosting | `server/db.ts` |
| **OpenAI** | Course content generation, TTS audio | `server/ai-engine.ts`, `server/audio-generator.ts` |
| **Anthropic (Claude)** | AI Tutor conversational responses | `server/services/tutor-ai.ts` |
| **HeyGen** | Digital twin video generation, avatar creation | `server/services/heygen.ts` |
| **Daily.co** | Virtual meeting rooms for live sessions | `server/services/daily.ts` |
| **MercadoPago** | Payment processing (store checkout) | `server/store-routes.ts` |
| **Facturapi** | Mexican tax invoice generation (CFDI) | `server/services/facturapi.ts` |
| **Envia.com** | Shipping quotes and logistics | `server/store-routes.ts` |
| **Resend** | Transactional email (OTP, invitations, PDFs) | `server/email.ts` |
| **Cloudflare R2** | File storage (recordings, assets) | `server/services/r2-storage.ts` |

---

## 7. Database Schema Overview

### 7.1 Core Tables (32+ tables)

#### Identity & Access
- `users` — Core user accounts (email, password)
- `accounts` — Extended user data (role, referral code, account type)
- `profiles` — User profile information (name, location, interests)

#### Courses & Learning
- `courses` — Course catalog with metadata
- `course_modules` — Ordered content sections per course
- `course_quizzes` — Assessment definitions
- `quiz_questions` — Individual quiz questions
- `quiz_attempts` — Student quiz attempt records
- `course_users` — Course enrollments and progress
- `academy_courses_cache` — Synced external course data
- `academy_curriculum_cache` — Synced curriculum data
- `studio_courses` — Interactive course definitions

#### Teams & Organizations
- `teams` — Company/organization groups
- `team_users` — Team membership
- `employee_invitations` — Pending invitations
- `sam_requests` — Social security requests
- `org_objectives` / `user_objectives` — Goal tracking

#### CRM & Prospecting
- `empresas_prospectos` — Business prospect records (6M+)
- `contactos_prospectos` — Business contacts
- `enriquecimiento` — Data enrichment records
- `interacciones_prospectos` — Interaction log
- `leads` — Lead tracking
- `sat_69b` — SAT tax compliance list (14K+)

#### Financial
- `company_payments` — Payment records
- `company_wallets` — Wallet balances
- `wallet_transactions` — Transaction history
- `dispersions` — Fund distributions
- `partner_commissions` — Commission records
- `monthly_contributions` — Recurring contributions
- `contribution_audit_log` — Audit trail

#### Commerce
- `store_products` — Product catalog
- `store_stock` — Inventory tracking
- `store_orders` — Customer orders
- `store_order_items` — Order line items
- `store_referral_codes` — Discount codes

#### Certificates & Achievements
- `achievements` — Achievement definitions
- `achievement_users` — User achievement records
- `certificate_requests` — Certificate request workflow

#### Insurance & Cooperative
- `insurance_plans` — Plan definitions
- `insurance_enrollments` — User enrollments
- `cooperative_memberships` — Membership records

#### System
- `global_config` — Platform configuration
- `role_change_log` — Role change audit trail
- `api_keys` / `api_request_logs` — API access management
- `user_terms_acceptances` — Terms compliance
- `terms_versions` — Terms version history

---

## 8. Background Services

### 8.1 Startup Seeds
The server runs sequential seed operations at startup:
1. Role migration (ensures all accounts have updated roles)
2. Course seeding (STPS achievements, categories)
3. Module and quiz seeding
4. Superadmin account verification
5. Studio course catalog seeding (49 courses)
6. Onboarding course seeding (7 courses)
7. Instructor course linking
8. Blog post seeding
9. Terms version seeding
10. Insurance plan seeding
11. API key seeding
12. Global config seeding
13. Store product seeding

### 8.2 Periodic Services
- **Academy Sync:** Every 6 hours, syncs external course catalog (988 courses)
- **Prospect Import:** One-time import of CSV prospect data (skips if threshold met)
- **SAT 69-B Import:** One-time import of tax compliance data
- **EFOS Matching:** Cross-references prospects with non-compliant taxpayer list

---

## 9. Resilience & Production Safeguards

| Feature | Implementation |
|---------|---------------|
| Graceful Shutdown | SIGINT/SIGTERM handlers close DB pool cleanly |
| Crash Handlers | uncaughtException/unhandledRejection log and exit |
| Error Boundaries | All seed/background tasks wrapped in `.catch()` |
| Startup Safety | Bootstrap pattern — fails fast before binding port |
| DB Pool Hardening | Connection timeouts (10s), idle timeouts (30s), error handler |
| Health Endpoint | `/__health` returns uptime and status |
| Self-Contained Bundle | No external `node_modules` dependency in production |
| Request Logging | All `/api` requests logged with method, path, status, duration |

---

## 10. Environment Configuration

### 10.1 Required Environment Variables

| Variable | Environment | Purpose |
|----------|------------|---------|
| `DATABASE_URL` | Secret | PostgreSQL connection string |
| `SESSION_SECRET` | Secret | JWT signing key |
| `SUPABASE_URL` | Shared | Supabase project URL |
| `SUPABASE_ANON_KEY` | Secret | Supabase anonymous key |
| `VITE_SUPABASE_URL` | Shared | Frontend Supabase URL |
| `PORT` | Shared/Production | Server port (default: 5000) |
| `NODE_ENV` | Production | Set to "production" in deploy |

### 10.2 Optional Integration Keys
- `OPENAI_API_KEY` — AI content generation
- `ANTHROPIC_API_KEY` — AI Tutor
- `HEYGEN_API_KEY` — Digital Twin video
- `MERCADOPAGO_ACCESS_TOKEN` — Payment processing
- `RESEND_API_KEY` — Email delivery
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` — File storage
- `FACTURAPI_KEY` — Invoice generation
- `DAILY_API_KEY` — Video meetings

---

## 11. Deployment

### 11.1 Build Process
```bash
npm run build
# 1. Vite builds frontend → dist/public/
# 2. esbuild bundles server → dist/index.cjs (self-contained)
```

### 11.2 Production Execution
```bash
node dist/index.cjs
# Server starts on PORT (default 5000)
# Serves static files from dist/public/
# All API routes available at /api/*
```

### 11.3 Deployment Target
- **Type:** Autoscale (scales based on traffic)
- **Platform:** Replit
- **Domain:** `.replit.app` (or custom domain)

---

*End of Functional Design Document*
