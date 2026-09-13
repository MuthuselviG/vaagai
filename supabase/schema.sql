-- TNPSC Portal locked schema
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  language text not null check (language in ('tamil', 'english')),
  exam_type text not null check (exam_type in ('group4', 'group2', 'tnusrb', 'tet', 'school')),
  class int,
  is_paid boolean not null default false,
  paid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  lang text not null check (lang in ('en', 'ta')),
  options jsonb not null,
  correct_option text not null,
  class int,
  subject text not null,
  chapter text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  is_group4 boolean not null default false,
  is_group2 boolean not null default false,
  is_tnusrb boolean not null default false,
  is_tet boolean not null default false,
  is_school boolean not null default false,
  source text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  original_version jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  exam_type text not null check (exam_type in ('group4', 'group2', 'tnusrb', 'tet', 'school')),
  class int,
  subject text not null,
  chapter text not null,
  session_type text not null check (session_type in ('practice', 'mock_full', 'mock_pyq')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_questions int not null,
  correct_count int not null default 0,
  last_question_index int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.test_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option text not null,
  is_correct boolean not null,
  time_spent_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.chapter_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  class int,
  subject text not null,
  chapter text not null,
  tests_taken int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_filter
  on public.questions (status, lang, class, subject, chapter);

create index if not exists idx_test_sessions_user
  on public.test_sessions (user_id, updated_at desc);

create index if not exists idx_test_responses_session
  on public.test_responses (session_id);

create index if not exists idx_test_responses_question
  on public.test_responses (question_id);

create index if not exists idx_chapter_usage_user
  on public.chapter_usage (user_id, class, subject, chapter);
