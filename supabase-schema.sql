-- ============================================================
-- MedQuest 5 — Esquema do ranking online (Supabase / PostgreSQL)
-- Cole tudo isto no SQL Editor do Supabase e clique em "Run".
-- ============================================================

create table if not exists public.leaderboard (
  player_id   text primary key,
  name        text not null,
  turma       text not null default 'Mandic 5º sem',
  xp          integer not null default 0,
  level       integer not null default 1,
  streak      integer not null default 0,
  answered    integer not null default 0,
  accuracy    integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- Índice para ordenar o ranking rápido
create index if not exists leaderboard_turma_xp_idx
  on public.leaderboard (turma, xp desc);

-- Habilita segurança em nível de linha
alter table public.leaderboard enable row level security;

-- Políticas permissivas (placar público de turma; sem dados sensíveis).
-- Qualquer um pode LER o ranking:
drop policy if exists "leaderboard_select" on public.leaderboard;
create policy "leaderboard_select" on public.leaderboard
  for select using (true);

-- Qualquer um pode INSERIR o próprio registro:
drop policy if exists "leaderboard_insert" on public.leaderboard;
create policy "leaderboard_insert" on public.leaderboard
  for insert with check (true);

-- Qualquer um pode ATUALIZAR (o app faz upsert do próprio player_id):
drop policy if exists "leaderboard_update" on public.leaderboard;
create policy "leaderboard_update" on public.leaderboard
  for update using (true) with check (true);

-- Atualiza updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists leaderboard_touch on public.leaderboard;
create trigger leaderboard_touch before update on public.leaderboard
  for each row execute function public.touch_updated_at();
