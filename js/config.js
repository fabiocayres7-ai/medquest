/* ============================================================
   MedQuest 5 — Configuração
   ------------------------------------------------------------
   O app funciona 100% offline (modo local) sem mexer aqui.
   Para ativar o RANKING ONLINE compartilhado com a turma,
   preencha os 3 campos abaixo (veja README.md e supabase-schema.sql).
   ============================================================ */

window.MEDQUEST_CONFIG = {
  // Nome da turma/grupo (aparece no ranking e separa os grupos)
  TURMA: "Mandic 5º sem",

  // --- Ranking online (opcional) via Supabase ---
  // Deixe "" para usar somente o ranking local (código de jogador).
  SUPABASE_URL: "",        // ex.: "https://xxxx.supabase.co"
  SUPABASE_ANON_KEY: "",   // a chave "anon public" do projeto
};
