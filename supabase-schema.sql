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

-- ============================================================
-- SINCRONIZAÇÃO EM NUVEM (progresso do jogador)
-- ============================================================
create table if not exists public.saves (
  player_id   text primary key,
  name        text,
  turma       text,
  data        text not null,           -- progresso (base64 do JSON)
  updated_at  timestamptz not null default now()
);
alter table public.saves enable row level security;

drop policy if exists "saves_select" on public.saves;
create policy "saves_select" on public.saves for select using (true);
drop policy if exists "saves_insert" on public.saves;
create policy "saves_insert" on public.saves for insert with check (true);
drop policy if exists "saves_update" on public.saves;
create policy "saves_update" on public.saves for update using (true) with check (true);

drop trigger if exists saves_touch on public.saves;
create trigger saves_touch before update on public.saves
  for each row execute function public.touch_updated_at();

-- ============================================================
-- MURAL DA TURMA (dúvidas / recados)
-- ============================================================
create table if not exists public.mural (
  id          bigint generated always as identity primary key,
  turma       text not null default 'Mandic 5º sem',
  name        text,
  topic       text,
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists mural_turma_id_idx on public.mural (turma, id desc);
alter table public.mural enable row level security;

drop policy if exists "mural_select" on public.mural;
create policy "mural_select" on public.mural for select using (true);
drop policy if exists "mural_insert" on public.mural;
create policy "mural_insert" on public.mural for insert with check (true);
