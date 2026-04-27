-- Additional migration for deterministic per-session question order.
-- Safe to run after main schema.sql.

create table if not exists public.test_session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  sequence_index int not null check (sequence_index >= 0),
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, sequence_index),
  unique (session_id, question_id)
);

create index if not exists idx_test_session_questions_session_order
  on public.test_session_questions (session_id, sequence_index);
