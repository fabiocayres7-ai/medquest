-- ============================================================
-- MedQuest 5 — Desafios da turma
-- Cole no SQL Editor do Supabase e clique em "Run".
-- ============================================================
create table if not exists public.challenges (
  id             text primary key,
  turma          text not null default 'Mandic 5º sem',
  title          text,
  question_ids   text not null,        -- JSON com os ids das questões
  created_by     text,
  created_by_name text,
  created_at     timestamptz not null default now(),
  ends_at        timestamptz
);
create index if not exists challenges_turma_idx on public.challenges (turma, created_at desc);
alter table public.challenges enable row level security;
drop policy if exists "ch_sel" on public.challenges;
create policy "ch_sel" on public.challenges for select using (true);
drop policy if exists "ch_ins" on public.challenges;
create policy "ch_ins" on public.challenges for insert with check (true);

create table if not exists public.challenge_scores (
  challenge_id text not null,
  player_id    text not null,
  name         text,
  correct      integer not null default 0,
  total        integer not null default 0,
  created_at   timestamptz not null default now(),
  primary key (challenge_id, player_id)
);
alter table public.challenge_scores enable row level security;
drop policy if exists "cs_sel" on public.challenge_scores;
create policy "cs_sel" on public.challenge_scores for select using (true);
drop policy if exists "cs_ins" on public.challenge_scores;
create policy "cs_ins" on public.challenge_scores for insert with check (true);
drop policy if exists "cs_upd" on public.challenge_scores;
create policy "cs_upd" on public.challenge_scores for update using (true) with check (true);
