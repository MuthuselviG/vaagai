# MCQ Palagu — Project Context for Claude Code

## HARD RULES — Never Break These

- **NEVER run INSERT, UPDATE, or DELETE on Supabase without explicit user approval.** Always show the query first and wait for the user to say "go ahead" or similar before executing. SELECT queries are fine.
- **NEVER modify existing SEO routes' URLs, slugs, or canonical paths without explicit user approval.** Content/feature changes (e.g. the PDF download fix applied to both May and June 2026 CA pages) are fine once approved — don't restructure routes.
- **Before any code change, state a short plan and get explicit user approval first.** Don't write or edit code until the user says go ahead.
- **Every SEO-targeted page (study materials, PYQ analysis, current affairs, etc.) must be linked from `/tnpsc-study-materials` (the study hub).** When adding a new SEO page, add a discoverable link/card for it on the hub (both EN and TA variants) in the same change.
- **Before building any visual/UI/design change, show the user a screenshot or preview of the design and get explicit approval before writing the final code/commit.** The user is not a designer and can't evaluate a design from a text description — render it and show it first.
- **Always branch from the latest `main`.** Before starting new work, fetch and create the branch off `origin/main` (not off an old feature branch), so PRs apply cleanly without rebase conflicts.
- **Every new feature must include unit tests covering it**, added in the same change.
- **Before starting new work, check open PRs** (GitHub PR list). A fix may already exist unmerged and forgotten — that happened with the www→apex redirect (PR #28, opened June 14, sat unmerged until it was independently re-done as PR #43 on Aug 28). Check `## Decisions & Known Issues Log` below too.

## Decisions & Known Issues Log

Running log, most recent first. Every session should read this before doing SEO/infra work, so issues already investigated (fixed or deliberately left open) aren't rediscovered from scratch.

- **2026-08-29 — OPEN, root cause found, not yet fixed: site-wide outage, zero visitors.** After PR #43 (www→apex redirect in `next.config.mjs`) shipped on 2026-08-28, `mcqpalagu.in` and `www.mcqpalagu.in` started redirecting to each other — an infinite loop, confirmed directly by fetching both live URLs (each 308s to the other). Every visitor's browser fails with "too many redirects" before the page loads, which is why Vercel Web Analytics dropped to a hard 0 visitors/0 pageviews for every hour from 2026-08-28 ~08:00 UTC onward (previously 8-22/day) and serverless function logs show zero invocations in the same window — nothing gets past the redirect. Ruled out: DNS (resolves correctly to Vercel), the deployment itself (built and shipped with no errors), and deployment protection (SSO protection is on its default "excludes custom domains" setting). Cause: the Vercel project's **Domain settings** already had a dashboard-level `apex → www` redirect configured (harmless on its own, predates PR #43) which now conflicts with the new code-level `www → apex` redirect. **Fix (Vercel dashboard, not code):** Project Settings → Domains → `mcqpalagu.in` → remove/disable the "Redirect to another domain" pointing at `www.mcqpalagu.in`, so apex serves content directly and only `www` redirects (matching the canonical URL already set in `layout.tsx`). Still open as of this writing — re-verify by fetching `https://mcqpalagu.in/` and confirming it returns 200, not a redirect to www, before closing this out.
- **2026-08-28 — FIXED: www vs apex domain duplication.** `www.mcqpalagu.in` and `mcqpalagu.in` were both serving live content, no redirect. Confirmed via Search Console Coverage report ("Page with redirect" / "Redirect error" were the top issues) and indexed-page count plateaued at ~24-26 for 2 months. Fixed in `next.config.mjs` (PR #43). A prior identical fix (PR #28) existed but was never merged — closed as superseded. **Lesson: check open PRs before assuming something is unfixed.**
- **2026-08-28 — FIXED: silent user-row-creation failure on login.** `auth/callback` inserted into `public.users` without checking the error; 31 of 48 recent sign-ins (65%) had no row despite being authenticated. Fixed client-side (`upsert` + error logging in `auth/callback` and `onboarding`), and — the actual permanent fix — added a Postgres trigger (`on_auth_user_created` on `auth.users`, migration `auto_create_public_user_row_on_signup`) that creates the row at the database level regardless of the browser. Backfilled the 31 missing rows.
- **2026-08-28 — ADDED: August 2026 current affairs pages** (EN + TA + per-unit), matching the July template. DB already had the content; only page files were missing.
- **2026-08-28 — OPEN, not yet fixed: `/mock/[year]` and `/pyq/[group]/[year]` pages** (18 sitemap URLs) have no per-page `generateMetadata` — they inherit a shared parent title/canonical, so Google can't index them as distinct pages. Same bug class as the www issue. Fix pattern: mirror `/experts/[slug]/page.tsx`'s `generateMetadata`.
- **2026-08-28 — OPEN, not yet fixed: `/subjects` and `/current-affairs` fetch their real content (chapter counts, today's questions) client-side in `useEffect`.** Not a deliberate performance choice (no commit documents a reason) — just the default pattern the pages were built with. Crawlers see an empty shell on first paint. Fix pattern: server-fetch + pass to client component, like `/experts/page.tsx` does.
- **Confirmed via GA/Search Console data (Aug 2026):** archaeology/Keeladi-topic current affairs pages are the site's best organic performer (May 2026 page: 79 clicks, 1314 impressions, ~position 6). Total site organic search traffic is still very low (~130 clicks/28 days pre-fix). Worth leaning into topical/newsy content in that vein.

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
