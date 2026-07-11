-- ============================================================
-- MedQuest 5 — Push (notificações com o app fechado)
-- PARTE 1: tabela de inscrições. Rode isto no SQL Editor.
-- ============================================================
create table if not exists public.push_subs (
  player_id   text primary key,
  name        text,
  turma       text,
  time        text default '19:00',    -- horário HH:MM do lembrete
  sub         text not null,           -- objeto PushSubscription (JSON)
  updated_at  timestamptz not null default now()
);
alter table public.push_subs enable row level security;

drop policy if exists "ps_sel" on public.push_subs;
create policy "ps_sel" on public.push_subs for select using (true);
drop policy if exists "ps_ins" on public.push_subs;
create policy "ps_ins" on public.push_subs for insert with check (true);
drop policy if exists "ps_upd" on public.push_subs;
create policy "ps_upd" on public.push_subs for update using (true) with check (true);
drop policy if exists "ps_del" on public.push_subs;
create policy "ps_del" on public.push_subs for delete using (true);

-- ============================================================
-- PARTE 2: agendamento (rode DEPOIS de publicar a Edge Function "send-reminders")
-- Envia os lembretes de hora em hora; a função decide quem recebe pelo horário.
-- ============================================================
create extension if not exists pg_net;
-- (o pg_cron normalmente já vem habilitado no Supabase; se não, habilite em Database → Extensions)

select cron.schedule(
  'medquest-push-hourly',
  '0 * * * *',
  $$
    select net.http_post(
      url     := 'https://lotcwyrktmfsbuvngyom.supabase.co/functions/v1/send-reminders',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);
