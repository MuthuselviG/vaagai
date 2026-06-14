# MCQ Palagu — Project Context for Claude Code

## HARD RULES — Never Break These

- **NEVER run INSERT, UPDATE, or DELETE on Supabase without explicit user approval.** Always show the query first and wait for the user to say "go ahead" or similar before executing. SELECT queries are fine.
- **NEVER modify existing SEO routes' URLs, slugs, or canonical paths without explicit user approval.** Content/feature changes (e.g. the PDF download fix applied to both May and June 2026 CA pages) are fine once approved — don't restructure routes.
- **Before any code change, state a short plan and get explicit user approval first.** Don't write or edit code until the user says go ahead.

## What This App Is

**MCQ Palagu** (`mcqpalagu.in`) is a bilingual (Tamil + English) MCQ practice platform for Tamil Nadu government exam aspirants — TNPSC Group 2, Group 4, TET, TNUSRB. Built under the repo name `vaagai`.

**Content volume:** 6,400+ Samacheer Kalvi questions (Class 6–10) + 1,800+ PYQ (2012–2025) + ~30 auto-generated current affairs questions/day + expert-created packs.

**Admin email:** muthu.111.44@gmail.com (gates the `/admin-fun-panrom` dashboard)

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 15 (App Router, TypeScript, React 19) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase OAuth (Google) |
| AI | Google Gemini 2.5-flash (question generation & extraction) |
| Deployment | Vercel (frontend), Supabase Cloud (DB) |
| Automation | GitHub Actions (daily current affairs cron at 2 AM IST) |
| Analytics | Vercel Analytics + Google Analytics |

---

## Project Structure

```
vaagai/
├── frontend/               # Next.js app (deploy target)
│   ├── app/                # App Router pages & API routes
│   ├── components/         # Shared React components
│   ├── lib/                # DB queries, tokens, session, utils
│   ├── public/             # Static assets (logo, OG image)
│   └── scripts/            # current-affairs.ts (cron script)
├── supabase/               # schema.sql, session_consistency.sql
└── .github/workflows/      # current-affairs.yml (nightly cron)
```

---

## All Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — featured packs, current affairs promo, creator CTA |
| `/subjects` | Practice hub — browse subjects, chapters, levels, PYQ years |
| `/practice/[subject]/[chapter]` | MCQ session with timer, flag, explanation reveal |
| `/mock` | Mock test landing — year selection |
| `/mock/[year]` | Full 200-question mock (3 hours) |
| `/mock/[year]/result` | Results and review |
| `/pyq/[group]/[year]` | PYQ paper selector |
| `/current-affairs` | Daily CA — calendar view, last 7 days, monthly drill |
| `/tnpsc-study-materials` | Study material hub (SEO-optimized server pages) |
| `/tnpsc-study-materials/current-affairs/[month]` | CA by month |
| `/tnpsc-study-materials/current-affairs/[month]/[unit]` | CA unit detail |
| `/experts` | Browse verified creators & study buddies |
| `/experts/[slug]` | Creator profile |
| `/experts/[slug]/[packId]` | Expert pack detail |
| `/creator` | Creator dashboard — manage packs, upload questions |
| `/login` | Google OAuth login |
| `/onboarding` | New user setup — name, exam target, taluk |
| `/score` | User score history |
| `/auth/callback` | OAuth redirect handler |
| `/admin-fun-panrom` | Admin dashboard (email-gated) |

---

## Key Components

- **AppShell.tsx** — Root layout, bottom nav, auth state, language toggle, creator verification
- **BottomNav.tsx** — Tab bar (Home, Practice, Study, Experts, Scores)
- **QuestionText.tsx** — Renders MCQs: Assertion-Reason, Match the List, Multi-statement, regular formats
- **LangToggle.tsx / HomeLangToggle.tsx** — Tamil/English toggle (syncs to localStorage + DB)
- **HomeLoginButton.tsx** — Conditional login/profile CTA

---

## Key Lib Files

- **lib/supabase.ts** — All DB query functions (fetchChapterCounts, fetchQuestionsForLevel, fetchQuestionsForPYQ, fetchQuestionsForPack, fetchCAForUnit, createPack, publishPack, etc.)
- **lib/tokens.ts** — Design tokens (colors, shadows — used as inline styles throughout)
- **lib/constants.ts** — TAMIL_NADU_TALUKS (128 taluks for onboarding)
- **lib/session.ts** — localStorage session management (last 100 sessions)
- **lib/api.ts** — HTTP client for practice API
- **lib/slugify.ts** — URL slug generation (handles Tamil characters)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | id, phone, name, language (ta/en), exam_type, is_paid, paid_until |
| `questions` | id, question, lang, options (jsonb), correct_option, class, subject, chapter, difficulty, is_group4/2/tet/tnusrb (bool flags), source, status (draft/approved/rejected) |
| `test_sessions` | id, user_id, session_type (practice/mock_full/mock_pyq), started_at, completed_at, total_questions, correct_count |
| `test_responses` | id, session_id, question_id, selected_option, is_correct, time_spent_seconds |
| `test_session_questions` | Deterministic question ordering per session |
| `chapter_usage` | user_id, class, subject, chapter, tests_taken |
| `creators` | id, user_id, name, slug, verified, section (vazhikatti/buddies), accent_color, bio |
| `packs` | id, creator_id, name, subject, exams (jsonb), is_published, is_free |
| `current_affairs` | id, question, options, correct_option, explanation, topic, subject, published_date, lang |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only
NEXT_PUBLIC_API_BASE_URL           # defaults to http://localhost:4000
GEMINI_API_KEY                     # question generation in creator dashboard
GEMINI_API_KEY_CRON                # used by GitHub Actions cron
NEXT_PUBLIC_ENABLE_CREATOR_UPLOAD  # boolean flag for creator upload UI
CRON_SECRET                        # bearer token for cron endpoint
```

---

## Daily Current Affairs Automation

**Script:** `frontend/scripts/current-affairs.ts`
**Trigger:** GitHub Actions nightly at 2 AM IST (`current-affairs.yml`)

Pipeline:
1. Fetch latest 10 PIB press releases (scrape)
2. Generate 20 questions from PIB content via Gemini (4 batches of 5)
3. Generate 10 additional questions from Gemini's knowledge base (2 batches of 5)
4. Deduplicate vs. last 5 days, validate subject, upsert to `current_affairs`

Output: ~30 bilingual (EN + TA pair) questions/day across 7 subjects:
General Science, Geography, History, Indian National Movement, Indian Polity, Economy, Tamil Nadu History

Quality rules: ≥60% TN-specific, no profanity/religious hatred, dedup against recent questions.

---

## Language & UX Patterns

- Language preference stored in `localStorage` key `mcqpalagu_lang` and synced to `users.language`
- Domain: `vaagai.vercel.app` permanently redirects to `mcqpalagu.in` (configured in next.config.mjs)
- Auth flow: Google OAuth → `/auth/callback` → `/onboarding` (first time, if `exam_target` not set) → `/subjects`
  - A `users` row is created at `/auth/callback` on first login (before onboarding). `/onboarding` then `update`s that row (name, exam_target, taluk, role) rather than inserting.
- Fonts: Inter (English) + Noto Sans Tamil (Tamil) from Google Fonts
- Styling: Inline styles using tokens from `lib/tokens.ts` (no CSS framework)

---

## Login Redirects

- Any link/redirect to `/login` **must** include `?redirect=<encoded path>` so the user returns to where they came from after signing in — except the homepage login CTA (`app/page.tsx`, `HomeLoginButton.tsx`), which intentionally defaults to `/subjects`.
- `/login` passes `redirect` through to `/auth/callback?redirect=...`, which passes it to `/onboarding?redirect=...` (if onboarding is needed) and finally `router.push(redirect || "/subjects")`.

---

## Creator Features

- Upload modes: text paste, image upload, PDF upload
- Gemini extracts/generates MCQs from any format, validates correctness
- Pack management: create, publish, archive, edit
- Creator profiles with verified badge, accent color, social links (YouTube, Instagram, Telegram)
- Sections: `vazhikatti` (experts/teachers) vs `buddies` (study buddies)

---

## Development Notes

- Run frontend: `cd frontend && npm run dev` (port 3000)
- Build: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`
- All Supabase changes: edit `supabase/schema.sql` and apply via Supabase MCP or CLI
- No separate backend server — all API logic is in Next.js API routes under `frontend/app/api/`
- Before merging a PR: wait for the user to do local/manual testing first. If local testing isn't possible in this environment, ensure the `test` CI check passes, then push/merge.
- Keep chat replies short — state what changed/what's happening, skip narrating reasoning or routine status checks (e.g. "PR is open, CI is running").
