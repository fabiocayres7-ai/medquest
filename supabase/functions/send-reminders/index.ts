// MedQuest 5 — Edge Function: envia lembretes push (app fechado)
// Deploy no Supabase (Edge Functions). Requer os secrets: VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT.
// Chamada por um cron a cada hora (ver supabase-push.sql).
import webpush from "npm:web-push@3.6.7";

Deno.serve(async (_req) => {
  const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const VPUB     = Deno.env.get("VAPID_PUBLIC")!;
  const VPRIV    = Deno.env.get("VAPID_PRIVATE")!;
  const SUBJ     = Deno.env.get("VAPID_SUBJECT") || "mailto:medquest@exemplo.com";

  webpush.setVapidDetails(SUBJ, VPUB, VPRIV);

  // hora atual (fuso de São Paulo), formato "HH"
  const curHour = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" })
    .format(new Date()).padStart(2, "0");

  const authHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
  const res = await fetch(`${SUPA_URL}/rest/v1/push_subs?select=player_id,sub,time`, { headers: authHeaders });
  const subs = await res.json();

  const payload = JSON.stringify({
    title: "MedQuest 5",
    body: "Hora de estudar! Faça a questão do dia e mantenha o streak 🎯🔥",
    url: "./",
  });

  let sent = 0, removed = 0;
  for (const s of subs) {
    const t = (s.time || "19:00");
    if (t.slice(0, 2) !== curHour) continue;
    try {
      await webpush.sendNotification(JSON.parse(s.sub), payload);
      sent++;
    } catch (e) {
      const code = (e && (e as any).statusCode) || 0;
      if (code === 404 || code === 410) {
        await fetch(`${SUPA_URL}/rest/v1/push_subs?player_id=eq.${encodeURIComponent(s.player_id)}`, { method: "DELETE", headers: authHeaders });
        removed++;
      }
    }
  }
  return new Response(JSON.stringify({ ok: true, hour: curHour, sent, removed }), { headers: { "Content-Type": "application/json" } });
});
