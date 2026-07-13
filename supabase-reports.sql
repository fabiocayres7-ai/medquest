-- ============================================================
-- MedQuest 5 — Reportar erro em questões
-- Cole no SQL Editor do Supabase e clique em "Run".
-- (Os relatos aparecem na tabela public.reports — veja em Table Editor.)
-- ============================================================
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  question_id text,
  reason      text,
  name        text,
  turma       text,
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists "rp_sel" on public.reports;
create policy "rp_sel" on public.reports for select using (true);
drop policy if exists "rp_ins" on public.reports;
create policy "rp_ins" on public.reports for insert with check (true);
