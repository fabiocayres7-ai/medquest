# 🩺 MedQuest 5 — Estudos Gamificados (5º semestre · Mandic)

App de estudos com **questões de raciocínio clínico**, **flashcards com repetição espaçada**,
**XP, níveis, streak, conquistas e missões**, e **ranking com os colegas**.
Roda 100% no navegador — sem instalar nada.

![feito com HTML/CSS/JS puro](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-6d8bff)

---

## ▶️ Como rodar

### Opção A — Rápido (no seu PC)
Só abrir o arquivo `index.html` no navegador (duplo clique). Funciona offline, com progresso salvo no próprio navegador.

### Opção B — Publicar para a turma (GitHub Pages) — recomendado
Assim cada colega acessa por um link e todos podem competir no ranking.

1. Crie uma conta em https://github.com (se não tiver).
2. Crie um repositório novo, ex.: `medquest`.
3. Faça upload de **todo o conteúdo desta pasta** (`index.html`, `css/`, `js/`).
   - Pelo site: botão **Add file → Upload files** → arraste os arquivos → **Commit**.
   - Ou por git:
     ```bash
     git init
     git add .
     git commit -m "MedQuest 5"
     git branch -M main
     git remote add origin https://github.com/SEU_USUARIO/medquest.git
     git push -u origin main
     ```
4. No repositório: **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save**.
5. Em ~1 minuto o app estará em `https://SEU_USUARIO.github.io/medquest/`. Envie o link para os colegas. 🎉

---

## 🏆 Ranking com os colegas — dois modos

### Modo local (padrão, zero configuração)
Cada um tem um **código de jogador** (aba **Ranking**). Vocês trocam os códigos (WhatsApp, etc.)
e colam o do colega no app — todos aparecem no mesmo ranking. Simples, mas manual (atualiza quando trocam os códigos).

### Modo online (ranking automático e ao vivo) — via Supabase (grátis)
Placar compartilhado que atualiza sozinho. Passo a passo:

1. Crie conta em https://supabase.com → **New project** (guarde a senha).
2. No projeto, abra **SQL Editor**, cole o conteúdo de [`supabase-schema.sql`](supabase-schema.sql) e clique **Run**.
3. Vá em **Project Settings → API** e copie:
   - **Project URL** (ex.: `https://abcd.supabase.co`)
   - **anon public key**
4. Abra `js/config.js` e preencha:
   ```js
   SUPABASE_URL: "https://abcd.supabase.co",
   SUPABASE_ANON_KEY: "sua-anon-key",
   ```
5. Faça o commit/upload de novo. Pronto — todos que usarem o mesmo link e a mesma **TURMA** entram no ranking automático.

> Segurança: é um placar de turma (baixo risco). A chave `anon` é pública por design. Não coloque dados sensíveis.

---

## ✍️ Adicionar suas próprias questões e flashcards
Edite `js/content.js` — é só copiar um bloco e trocar os campos.
Guia detalhado em [`COMO-ADICIONAR-QUESTOES.md`](COMO-ADICIONAR-QUESTOES.md).

Quanto mais questões vocês adicionarem (cada colega pode contribuir!), melhor o app fica.
Dica: dividam as disciplinas entre o grupo e cada um cria 10 questões da sua parte.

---

## 🎮 O que já vem pronto
- **39 questões** de raciocínio clínico (com vinheta + explicação do porquê de cada alternativa) e **47 flashcards**, nas 8 disciplinas do semestre.
- **Níveis:** Calouro → Interno → Plantonista → Residente → Preceptor → Especialista → Chefe de Equipe → Professor → Livre-Docente → **Lenda da Mandic**.
- **XP** por acerto (mais para questões difíceis) e por revisão de flashcard; **bônus de streak**.
- **Streak diário**, **missões diárias**, **12 conquistas**, **barras de progresso por disciplina**.
- **Flashcards** com algoritmo de repetição espaçada **SM-2** (estilo Anki).
- **Simulado** cronometrável e **desafio rápido**.

## 🗂️ Estrutura
```
medquest/
├── index.html          # abre isto
├── css/style.css       # visual
├── js/
│   ├── config.js       # sua turma + Supabase (opcional)
│   ├── content.js      # QUESTÕES e FLASHCARDS (edite aqui)
│   └── app.js          # lógica do jogo
├── supabase-schema.sql # banco do ranking online (opcional)
├── COMO-ADICIONAR-QUESTOES.md
└── README.md
```

Bons estudos e que vença o melhor plantonista! 🔥
