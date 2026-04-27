# TNPSC Portal

Fresh monorepo scaffold for the TNPSC practice platform.

## Apps

- `frontend`: Next.js (TypeScript, App Router)
- `backend`: Express (TypeScript)
- `supabase`: SQL schema and helper queries

## Quick Start

1. Install dependencies:
   - `cd frontend && npm install`
   - `cd ../backend && npm install`
2. Copy env examples:
   - `frontend/.env.example` -> `frontend/.env.local`
   - `backend/.env.example` -> `backend/.env`
3. Run apps:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && npm run dev`

## Notes

- OTP provider integration is left as a pluggable service (no 2Factor code added).
- Razorpay and Supabase keys are env-driven.
- DB schema is in `supabase/schema.sql`.
- Run `supabase/session_consistency.sql` after the base schema to enable immutable question order per test session.
