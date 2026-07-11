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

## 🏆 Ranking com os colegas

### Modo GitHub (padrão) — online, sem cadastro em nada
Já vem **ligado e funcionando**. Usa o próprio repositório + GitHub Actions como servidor do placar.

Como cada colega participa:
1. Abre o link do app e joga.
2. Na aba **Ranking**, toca em **📤 Publicar minha pontuação**.
3. Abre uma página do GitHub já preenchida — é só clicar no botão verde **Submit new issue** (precisa estar logado no GitHub).
4. Em ~1 minuto um robô (GitHub Actions) atualiza o placar e todo mundo vê. É só tocar em **🔄 Atualizar ranking**.

> Ver o ranking **não** exige nada; só **publicar** a própria pontuação precisa de conta no GitHub (gratuita).
> Funciona porque o placar fica em `leaderboard.json`, atualizado automaticamente pelo workflow em `.github/workflows/leaderboard.yml`.

### Modo local (offline) — código de jogador
Sempre disponível como alternativa: cada um copia seu **código** (aba Ranking) e cola o do colega. Bom para quem não tem GitHub.

### Modo Supabase (opcional) — ranking 100% automático
Se preferir que a pontuação suba sozinha (sem clicar em "Publicar"), dá para usar o Supabase:
1. Crie conta em https://supabase.com → **New project**.
2. Em **SQL Editor**, cole [`supabase-schema.sql`](supabase-schema.sql) e **Run**.
3. Em **Project Settings → API**, copie a **URL** e a **anon key**.
4. Em `js/config.js`, mude `RANKING_PROVIDER: "supabase"` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
5. Commit/push. Todos da mesma **TURMA** entram no placar automaticamente.

> Segurança: é um placar de turma (baixo risco), sem dados sensíveis.

---

## ✍️ Adicionar suas próprias questões e flashcards
Edite `js/content.js` — é só copiar um bloco e trocar os campos.
Guia detalhado em [`COMO-ADICIONAR-QUESTOES.md`](COMO-ADICIONAR-QUESTOES.md).

Quanto mais questões vocês adicionarem (cada colega pode contribuir!), melhor o app fica.
Dica: dividam as disciplinas entre o grupo e cada um cria 10 questões da sua parte.

---

## 🎮 O que já vem pronto
- **91 questões** de raciocínio clínico estilo prova de residência (vinheta + explicação do porquê de cada alternativa; mais da metade em nível "desafio") e **61 flashcards**, nas 8 disciplinas.
- **Plano de Estudos**: marque cada tema conforme estuda — **as questões só caem dos temas marcados**. 82 temas mapeados ao conteúdo real do semestre.
- **Resumos**: aba com resumos objetivos por tema (vá adicionando os seus em `js/content.js`).
- **Imagens**: módulo de reconhecimento visual (patologia/radiologia) — bate o olho nos achados e diz o diagnóstico. Traz esquemas originais e aceita suas próprias imagens.
- **Modo Prova** cronometrado (com revisão ao final), **Refazer erros**, **Questões marcadas** (⭐) e **pontos fracos** por tema.
- **Duelo**: desafie um colega pelas mesmas questões (por código) e veja quem vence.
- **Pomodoro** integrado (25/5) com avisos de foco/descanso e XP por sessão.
- **Gráfico de evolução** (XP e % de acerto por dia) e **anotações pessoais** por tema.
- **Ranking semanal** além do total, com meta da semana.
- **12 níveis** com curva exigente: Calouro → Interno → Plantonista → Residente R1/R2 → Preceptor → Especialista → Chefe de Equipe → Professor → Livre-Docente → Notório Saber → **Lenda da Mandic** (35 000 XP).
- **XP** por acerto (mais para questões difíceis) e por revisão de flashcard; **bônus de streak**.
- **13 conquistas com 5 patamares cada** (🥉 Bronze → 🥈 Prata → 🥇 Ouro → 🏆 Platina → 💠 Diamante) — 65 patamares para colecionar.
- **Streak diário**, **missões diárias**, **barras de progresso por disciplina**.
- **Liberação por semana** (cronograma): quando você preencher o cronograma das aulas, o conteúdo abre semana a semana com **estudo pré-aula** por aula.
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
