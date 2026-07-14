-- ============================================================
-- MedQuest 5 — Banco de imagens da turma (fotos reais de lâminas/exames)
-- Antes: no painel Storage, crie um bucket chamado "medimg" e marque como PÚBLICO.
-- Depois cole isto no SQL Editor e clique em "Run".
-- ============================================================

-- Metadados das imagens (o que é cada foto)
create table if not exists public.class_images (
  id          bigint generated always as identity primary key,
  turma       text,
  area        text,        -- Histologia / Radiologia / Semiologia / Macroscopia
  discipline  text,        -- código da matéria (ex.: pratica)
  findings    text,        -- achados (o que se vê)
  answer      text,        -- diagnóstico (resposta)
  explanation text,        -- explicação (opcional)
  path        text not null,
  name        text,        -- quem enviou
  created_at  timestamptz not null default now()
);
alter table public.class_images enable row level security;
drop policy if exists "ci_sel" on public.class_images;
create policy "ci_sel" on public.class_images for select using (true);
drop policy if exists "ci_ins" on public.class_images;
create policy "ci_ins" on public.class_images for insert with check (true);

-- Permissões do Storage no bucket 'medimg' (ler e enviar)
drop policy if exists "medimg_read" on storage.objects;
create policy "medimg_read" on storage.objects for select using (bucket_id = 'medimg');
drop policy if exists "medimg_write" on storage.objects;
create policy "medimg_write" on storage.objects for insert with check (bucket_id = 'medimg');
