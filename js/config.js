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
  // "supabase" = automático em tempo real (sobe sozinho, sem clicar em Publicar).
  RANKING_PROVIDER: "supabase",

  // --- Modo GitHub (padrão do ranking) ---
  GH_OWNER: "fabiocayres7-ai",
  GH_REPO:  "medquest",

  // --- Supabase (usado pela Nuvem: sincronização de progresso + Mural da turma) ---
  // A "publishable key" é pública por design (pode ficar aqui).
  SUPABASE_URL: "https://lotcwyrktmfsbuvngyom.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_zz7hmJXoonFqYaiacIuLUQ_SeRwuqcb",

  // Chave PÚBLICA VAPID (push web). A privada fica só no Supabase (secret), nunca aqui.
  VAPID_PUBLIC: "BO-WBVhunfIYOihk_ooZ05YjU2aIeeLUaBeBHhukEzW_0tJelNAx5KIy2mdWXeV1OwRRIE5iEQbONZUpJGhU9Ug",
};
