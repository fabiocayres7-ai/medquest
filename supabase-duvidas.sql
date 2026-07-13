-- ============================================================
-- MedQuest 5 — Dúvidas por matéria (fórum) + respostas
-- Cole no SQL Editor do Supabase e clique em "Run".
-- ============================================================

-- Novas colunas na tabela do mural (dúvidas)
alter table public.mural add column if not exists discipline text;
alter table public.mural add column if not exists author_id  text;
alter table public.mural add column if not exists resolved   boolean not null default false;
alter table public.mural add column if not exists kind       text not null default 'duvida';

-- Permite marcar como resolvido (update)
drop policy if exists "mu_upd" on public.mural;
create policy "mu_upd" on public.mural for update using (true) with check (true);

-- Respostas às dúvidas
create table if not exists public.mural_replies (
  id         bigint generated always as identity primary key,
  post_id    bigint not null,
  name       text,
  text       text not null,
  created_at timestamptz not null default now()
);
create index if not exists mural_replies_post_idx on public.mural_replies (post_id, id);
alter table public.mural_replies enable row level security;
drop policy if exists "mr_sel" on public.mural_replies;
create policy "mr_sel" on public.mural_replies for select using (true);
drop policy if exists "mr_ins" on public.mural_replies;
create policy "mr_ins" on public.mural_replies for insert with check (true);
