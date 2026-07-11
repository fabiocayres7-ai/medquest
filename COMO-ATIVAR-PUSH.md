# 🔔 Ativar notificações push (app fechado)

O app já está pronto para push. Falta você fazer 3 passos no painel do Supabase (uns 10 min).
O código do app e da função já estão prontos no repositório.

> Observação: no **iPhone**, push só funciona com o app **instalado** na tela de início (PWA). No Android/PC funciona no navegador.

## Passo 1 — Criar a tabela `push_subs`
No Supabase → **SQL Editor** → New query → cole a **PARTE 1** do arquivo `supabase-push.sql` → **Run**.

## Passo 2 — Publicar a Edge Function `send-reminders`
1. No Supabase → **Edge Functions** → **Create a new function** (ou "Deploy a new function").
2. Nome: **`send-reminders`**.
3. Cole o conteúdo de `supabase/functions/send-reminders/index.ts` (está no repositório).
4. **Desligue "Verify JWT"** (para o cron poder chamar sem login).
5. **Deploy**.
6. Ainda em Edge Functions → **Secrets** (ou Manage secrets), adicione 3 secrets:
   - `VAPID_PUBLIC` = `BO-WBVhunfIYOihk_ooZ05YjU2aIeeLUaBeBHhukEzW_0tJelNAx5KIy2mdWXeV1OwRRIE5iEQbONZUpJGhU9Ug`
   - `VAPID_PRIVATE` = *(a chave privada que te passei no chat — cole aqui, só aqui)*
   - `VAPID_SUBJECT` = `mailto:fabiocayres7@gmail.com`

> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o Supabase injeta sozinho — não precisa criar.

## Passo 3 — Agendar (cron de hora em hora)
No **SQL Editor** → cole a **PARTE 2** do `supabase-push.sql` → **Run**.
(Se der erro dizendo que `cron` não existe, vá em **Database → Extensions** e habilite **pg_cron** e **pg_net**, depois rode de novo.)

## Testar
1. No app: **Conquistas → Lembrete diário → 🔔 Ativar push (app fechado)** → aceite a permissão.
2. Para testar sem esperar a hora: no Supabase → **Edge Functions → send-reminders → Invoke** (ou "Run") — deve chegar uma notificação.

Pronto! A partir daí, todo mundo que ativar o push recebe o lembrete no horário que escolher, mesmo com o app fechado. 🔔
