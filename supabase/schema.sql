create extension if not exists pgcrypto;

do $$
begin
  create type public.submission_priority as enum ('Low', 'Medium', 'High', 'Critical');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.submission_status as enum ('New', 'In Review', 'Closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  respondent_name text,
  respondent_role text,
  headline text not null,
  focus_area text,
  priority public.submission_priority not null default 'Medium',
  status public.submission_status not null default 'New',
  responses jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_priority_idx on public.submissions (priority);
create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_responses_gin_idx on public.submissions using gin (responses);

alter table public.submissions enable row level security;

comment on table public.submissions is 'Stores D2C initial assessment responses and dashboard summary fields.';
