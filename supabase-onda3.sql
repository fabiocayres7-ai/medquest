-- ============================================================
-- MedQuest 5 — Onda 3: Ranking por matéria + Reações/Melhor resposta
-- Cole no SQL Editor do Supabase e clique em "Run".
-- ============================================================

-- (#6) acertos por matéria no ranking
alter table public.leaderboard add column if not exists by_disc text;

-- (#7) melhor resposta de uma dúvida
alter table public.mural add column if not exists best_reply_id bigint;

-- (#7) curtidas (👍) nas respostas
create table if not exists public.reply_reactions (
  reply_id   bigint not null,
  player_id  text not null,
  created_at timestamptz not null default now(),
  primary key (reply_id, player_id)
);
alter table public.reply_reactions enable row level security;
drop policy if exists "rr_sel" on public.reply_reactions;
create policy "rr_sel" on public.reply_reactions for select using (true);
drop policy if exists "rr_ins" on public.reply_reactions;
create policy "rr_ins" on public.reply_reactions for insert with check (true);
drop policy if exists "rr_del" on public.reply_reactions;
create policy "rr_del" on public.reply_reactions for delete using (true);
