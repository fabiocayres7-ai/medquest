/* ============================================================
   MedQuest 5 — Configuração
   ------------------------------------------------------------
   O app funciona 100% offline (modo local) sem mexer aqui.
   O RANKING ONLINE já vem ligado no modo "github" (usa o
   próprio repositório + GitHub Actions — não precisa de conta
   em nenhum outro serviço).
   ============================================================ */

window.MEDQUEST_CONFIG = {
  // Nome da turma/grupo (aparece no ranking e separa os grupos)
  TURMA: "Mandic 5º sem",

  // Datas das provas (contagem regressiva na tela inicial). Ajuste quando saírem as datas oficiais.
  EXAMS: { N1: "2026-09-28", N2: "2026-12-01" },

  // Provedor do ranking: "github" | "supabase" | "local"
  RANKING_PROVIDER: "github",

  // --- Modo GitHub (padrão) ---
  // Dono e nome do repositório onde o app está publicado.
  GH_OWNER: "fabiocayres7-ai",
  GH_REPO:  "medquest",

  // --- Modo Supabase (alternativa; deixe vazio se usar o GitHub) ---
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
};
