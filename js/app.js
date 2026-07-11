/* ============================================================
   MedQuest 5 — App principal
   Lógica: perfil, XP/níveis, streak, conquistas, missões,
   quiz de raciocínio clínico, flashcards (SM-2) e ranking.
   ============================================================ */
(function(){
"use strict";
const { DISCIPLINES, QUESTIONS, FLASHCARDS, SYLLABUS, SUMMARIES, CRONOGRAMA, IMAGES } = window.MEDQUEST_DATA;
const CFG = window.MEDQUEST_CONFIG;
const LS_KEY = "medquest5_state_v1";

/* ---------- Níveis (curva exigente) ---------- */
const LEVELS = [
  {min:0,     t:"Calouro"},
  {min:300,   t:"Interno"},
  {min:800,   t:"Plantonista"},
  {min:1600,  t:"Residente R1"},
  {min:2800,  t:"Residente R2"},
  {min:4500,  t:"Preceptor"},
  {min:6800,  t:"Especialista"},
  {min:9800,  t:"Chefe de Equipe"},
  {min:13800, t:"Professor"},
  {min:19000, t:"Livre-Docente"},
  {min:26000, t:"Notório Saber"},
  {min:35000, t:"Lenda da Mandic"},
];
function levelInfo(xp){
  let idx=0;
  for(let i=0;i<LEVELS.length;i++){ if(xp>=LEVELS[i].min) idx=i; }
  const cur=LEVELS[idx], next=LEVELS[idx+1]||null;
  const base=cur.min, ceil=next?next.min:cur.min;
  const pct = next ? Math.min(100,Math.round((xp-base)/(ceil-base)*100)) : 100;
  return {level:idx+1, title:cur.t, pct, toNext: next? ceil-xp : 0, next};
}

/* ---------- Conquistas com NÍVEIS (Bronze → Diamante) ----------
   Cada conquista tem uma métrica e 5 patamares crescentes e difíceis.
   XP de recompensa cresce por patamar. */
const TIER_NAMES = ["Bronze","Prata","Ouro","Platina","Diamante"];
const TIER_EM    = ["🥉","🥈","🥇","🏆","💠"];
const TIER_XP    = [30, 75, 150, 300, 600];   // recompensa por patamar alcançado
function discCorrect(s,d){ return (s.byDisc[d]?.correct)||0; }
function disciplinesWith(s,n){ return Object.keys(DISCIPLINES).filter(d=>discCorrect(s,d)>=n).length; }

const ACHIEVEMENTS = [
  { id:"resp",  em:"📚", nm:"Maratonista de Questões", unit:"questões",
    metric:s=>s.stats.answered, tiers:[50,150,350,700,1200] },
  { id:"acert", em:"🎯", nm:"Diagnóstico Certeiro", unit:"acertos",
    metric:s=>s.stats.correct, tiers:[30,100,250,500,900] },
  { id:"prec",  em:"🎓", nm:"Olho Clínico", unit:"% (mín. 50 q)", isPct:true,
    metric:s=>s.stats.answered>=50? Math.round(s.stats.correct/s.stats.answered*100):0, tiers:[70,78,84,90,95] },
  { id:"streak",em:"🔥", nm:"Rotina de Plantão", unit:"dias seguidos",
    metric:s=>s.streak.best, tiers:[5,10,20,40,75] },
  { id:"dias",  em:"📅", nm:"Presença Constante", unit:"dias de estudo",
    metric:s=>s.stats.activeDays||0, tiers:[7,20,45,80,130] },
  { id:"flash", em:"🧠", nm:"Memória de Elefante", unit:"revisões",
    metric:s=>s.stats.reviews, tiers:[80,250,600,1200,2500] },
  { id:"sim",   em:"💎", nm:"Alta sem Intercorrências", unit:"simulados 100%",
    metric:s=>s.stats.perfectQuizzes||0, tiers:[1,3,7,15,30] },
  { id:"plano", em:"🗺️", nm:"Mestre do Plano", unit:"temas estudados",
    metric:s=>Object.keys(s.studied||{}).length, tiers:[10,25,45,65,82] },
  { id:"nivel", em:"👑", nm:"Ascensão", unit:"nível",
    metric:s=>levelInfo(s.xp).level, tiers:[4,6,8,10,12] },
  { id:"imuno", em:"🧬", nm:"Imunologista", unit:"acertos em MAD II",
    metric:s=>discCorrect(s,"mad"), tiers:[15,40,75,120,180] },
  { id:"pato",  em:"🔬", nm:"Patologista", unit:"acertos em Prática Clínica",
    metric:s=>discCorrect(s,"pratica"), tiers:[15,40,75,120,180] },
  { id:"pharma",em:"💊", nm:"Farmacologista", unit:"acertos em Terapêutica",
    metric:s=>discCorrect(s,"terap"), tiers:[8,20,40,70,110] },
  { id:"geral", em:"🩺", nm:"Clínico Geral", unit:"disciplinas dominadas",
    metric:s=>disciplinesWith(s,10), tiers:[2,4,6,7,8] },
];
// patamar atual alcançado (0 = nenhum, 5 = Diamante) para uma conquista
function achTier(a){ const v=a.metric(S); let t=0; for(let i=0;i<a.tiers.length;i++){ if(v>=a.tiers[i]) t=i+1; } return t; }

/* ---------- Estado ---------- */
function freshState(){
  return {
    profile:{ id:"p_"+Math.abs(hash(String(navigator.userAgent+performance.now()+"x"))).toString(36), name:"", turma:CFG.TURMA },
    xp:0,
    stats:{answered:0, correct:0, reviews:0, activeDays:0, perfectQuizzes:0, imagesSeen:0},
    studied:{},                   // {"disc::topic": true} — temas marcados como estudados
    byDisc:{},                    // {disc:{answered,correct}}
    byTopic:{},                   // {"disc::topic": {answered,correct}}
    seenQ:{},                     // {qid: {correct:bool, count}}
    errors:{},                    // {qid:true} — questões erradas ainda não recuperadas
    bookmarks:{},                 // {qid:true} — questões marcadas para revisar
    weekly:{week:"", xp:0},       // XP da semana (competição semanal)
    srs:{},                       // {cardId:{ef,interval,reps,due}}
    streak:{count:0, best:0, last:null},
    missions:{date:null, list:[]},
    ach:{},                       // {achId: patamarAlcancado} — conquistas com níveis
    badges:[],
    flags:{perfectQuiz:false},
    friends:[],                   // ranking local: [{id,name,xp,level,streak}]
    createdAt: todayStr(),
  };
}
let S = load();

function load(){
  try{ const r=JSON.parse(localStorage.getItem(LS_KEY)); if(r&&r.profile) return migrate(r);}catch(e){}
  return freshState();
}
function migrate(s){ const f=freshState(); return deepDefaults(s,f); }
function deepDefaults(o,d){ for(const k in d){ if(o[k]===undefined) o[k]=d[k]; else if(typeof d[k]==="object"&&!Array.isArray(d[k])&&d[k]) deepDefaults(o[k],d[k]); } return o; }
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(S)); }

/* ---------- Utils ---------- */
function hash(str){let h=0;for(let i=0;i<str.length;i++){h=(h<<5)-h+str.charCodeAt(i);h|=0;}return h;}
function todayStr(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/86400000);}
function weekStr(){ // semana ISO: "AAAA-Www"
  const d=new Date(); const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-day);
  const yStart=new Date(Date.UTC(t.getUTCFullYear(),0,1));
  const wk=Math.ceil(((t-yStart)/86400000+1)/7);
  return t.getUTCFullYear()+"-W"+String(wk).padStart(2,"0");
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function $(sel,el=document){return el.querySelector(sel);}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

/* ---------- XP / streak / progresso ---------- */
function addXP(n){
  S.xp+=n;
  const w=weekStr();
  if(!S.weekly || S.weekly.week!==w) S.weekly={week:w, xp:0};
  S.weekly.xp+=n;
}
function weeklyXP(){ return (S.weekly && S.weekly.week===weekStr()) ? S.weekly.xp : 0; }
function touchStreak(){
  const t=todayStr();
  if(S.streak.last===t) return;
  S.stats.activeDays=(S.stats.activeDays||0)+1;   // novo dia com atividade
  if(S.streak.last && daysBetween(S.streak.last,t)===1) S.streak.count++;
  else S.streak.count=1;
  S.streak.last=t;
  if(S.streak.count>S.streak.best) S.streak.best=S.streak.count;
}
function recordAnswer(q, correct){
  const disc=q.discipline, difficulty=q.difficulty;
  touchStreak();
  S.stats.answered++;
  if(!S.byDisc[disc]) S.byDisc[disc]={answered:0,correct:0};
  S.byDisc[disc].answered++;
  const tk=tkey(disc,q.topic);
  if(!S.byTopic[tk]) S.byTopic[tk]={answered:0,correct:0};
  S.byTopic[tk].answered++;
  // registro por questão + controle de erros
  if(!S.seenQ[q.id]) S.seenQ[q.id]={correct:false,count:0};
  S.seenQ[q.id].count++;
  if(correct){
    S.stats.correct++; S.byDisc[disc].correct++; S.byTopic[tk].correct++;
    S.seenQ[q.id].correct=true; delete S.errors[q.id];
    const gain = 8*(difficulty||1) + Math.min(10, S.streak.count); addXP(gain); return gain;
  }
  S.errors[q.id]=true;
  addXP(2); return 2;
}
function discProgress(disc){
  const total=QUESTIONS.filter(q=>q.discipline===disc).length;
  const done=Object.keys(S.seenQ).filter(id=>{const q=QUESTIONS.find(x=>x.id===id);return q&&q.discipline===disc&&S.seenQ[id].correct;}).length;
  return {done, total, pct: total? Math.round(done/total*100):0};
}

/* ---------- Plano de estudos / travamento por tema ---------- */
function tkey(disc,topic){ return disc+"::"+topic; }
function isStudied(disc,topic){ return !!S.studied[tkey(disc,topic)]; }
// Lista ordenada de temas de uma disciplina (plano + temas de questões sem plano)
function planTopics(disc){
  const seen=new Set(), out=[];
  (SYLLABUS[disc]||[]).forEach(t=>{ const k=tkey(disc,t.topic); if(!seen.has(k)){ seen.add(k); out.push({phase:t.phase, topic:t.topic}); } });
  QUESTIONS.filter(q=>q.discipline===disc).forEach(q=>{ const k=tkey(disc,q.topic); if(!seen.has(k)){ seen.add(k); out.push({phase:q.phase, topic:q.topic}); } });
  return out.map(t=>({ ...t, key:tkey(disc,t.topic),
    qCount: QUESTIONS.filter(q=>q.discipline===disc&&q.topic===t.topic).length,
    studied: isStudied(disc,t.topic) }));
}
// Questões liberadas (somente de temas estudados)
function unlockedQuestions(disc){
  return QUESTIONS.filter(q=>(!disc||q.discipline===disc) && isStudied(q.discipline,q.topic));
}
function studiedCount(){
  let s=0,t=0;
  for(const d in DISCIPLINES){ planTopics(d).forEach(x=>{ t++; if(x.studied) s++; }); }
  return {studied:s, total:t};
}
function setStudied(disc,topic,val){
  if(val && !topicReleased(disc,topic)) return false;   // conteúdo ainda não liberado
  const k=tkey(disc,topic); if(val) S.studied[k]=true; else delete S.studied[k]; save(); return true;
}

/* ---------- Cronograma (liberação por semana) ---------- */
function cronogramaActive(){ return CRONOGRAMA && CRONOGRAMA.active && Array.isArray(CRONOGRAMA.weeks) && CRONOGRAMA.weeks.length>0; }
function weekReleased(inicio){ return !inicio ? true : todayStr()>=inicio; }
function topicWeekMap(){
  const map={};
  if(!cronogramaActive()) return map;
  CRONOGRAMA.weeks.forEach(w=>{ (w.aulas||[]).forEach(a=>{ map[tkey(a.disc,a.topic)]={n:w.n, inicio:w.inicio, rotulo:w.rotulo, preAula:a.preAula}; }); });
  return map;
}
function topicReleased(disc,topic){
  if(!cronogramaActive()) return true;
  const w=topicWeekMap()[tkey(disc,topic)];
  if(!w) return true;               // tema fora do cronograma fica sempre disponível
  return weekReleased(w.inicio);
}

/* ---------- Missões diárias ---------- */
function ensureMissions(){
  const t=todayStr();
  if(S.missions.date===t) return;
  S.missions.date=t;
  S.missions.list=[
    {id:"m_q",  em:"❓", nm:"Responda 10 questões",     goal:10, cur:0, rw:30, done:false},
    {id:"m_f",  em:"🃏", nm:"Revise 15 flashcards",      goal:15, cur:0, rw:25, done:false},
    {id:"m_acc",em:"✅", nm:"Acerte 6 questões",         goal:6,  cur:0, rw:20, done:false},
  ];
  save();
}
function bumpMission(id,by=1){
  const m=S.missions.list.find(x=>x.id===id); if(!m||m.done) return;
  m.cur=Math.min(m.goal,m.cur+by);
  if(m.cur>=m.goal){ m.done=true; addXP(m.rw); toast(`Missão concluída! +${m.rw} XP 🎉`); }
}

/* ---------- Conquistas ---------- */
function checkBadges(){ // mantém o nome para não quebrar chamadas; avalia conquistas em níveis
  let up=null;
  for(const a of ACHIEVEMENTS){
    const prev=S.ach[a.id]||0, now=achTier(a);
    if(now>prev){
      // premia cada patamar novo alcançado de uma vez
      for(let i=prev;i<now;i++) addXP(TIER_XP[i]);
      S.ach[a.id]=now;
      if(!up) up={a, tier:now};
    }
  }
  if(up){ save(); showBadgeModal(up.a, up.tier); }
}
function achievementsUnlocked(){ let n=0; for(const a of ACHIEVEMENTS) n+=(S.ach[a.id]||0); return n; }
function achievementsMax(){ return ACHIEVEMENTS.length*5; }

/* ---------- SM-2 (flashcards) ---------- */
function dueCards(){
  const t=todayStr();
  const arr = FLASHCARDS.filter(c=>{ const r=S.srs[c.id]; return !r || r.due<=t; });
  // não vistos primeiro, depois por vencimento
  return arr.sort((a,b)=>{ const ra=S.srs[a.id], rb=S.srs[b.id]; if(!ra&&rb)return -1; if(ra&&!rb)return 1; return 0;});
}
function gradeCard(cardId, q){ // q: 0 again,1 hard,2 good,3 easy
  let r=S.srs[cardId]||{ef:2.5,interval:0,reps:0,due:todayStr()};
  const quality=[2,3,4,5][q];
  if(quality<3){ r.reps=0; r.interval=1; }
  else{
    r.reps++;
    if(r.reps===1) r.interval=1;
    else if(r.reps===2) r.interval=3;
    else r.interval=Math.round(r.interval*r.ef);
    r.ef=Math.max(1.3, r.ef+(0.1-(5-quality)*(0.08+(5-quality)*0.02)));
  }
  const d=new Date(); d.setDate(d.getDate()+r.interval);
  r.due=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  S.srs[cardId]=r;
  S.stats.reviews++;
  touchStreak();
  addXP(q===0?2:4);
  bumpMission("m_f",1);
  save(); checkBadges(); syncOnline();
}

/* ============================================================
   RANKING
   ============================================================ */
function myRow(){ const li=levelInfo(S.xp); return {
  id:S.profile.id, name:S.profile.name||"Eu", turma:S.profile.turma,
  xp:S.xp, weeklyXp:weeklyXP(), week:weekStr(), level:li.level, title:li.title, streak:S.streak.count,
  answered:S.stats.answered,
  accuracy:S.stats.answered? Math.round(S.stats.correct/S.stats.answered*100):0
};}
let rankMode="total"; // "total" | "semana"
function rankKey(r){ return rankMode==="semana" ? (r.weeklyXp||0) : (r.xp||0); }
function localRanking(){
  const rows=[myRow(), ...S.friends.filter(f=>f.id!==S.profile.id)];
  return rows.sort((a,b)=>rankKey(b)-rankKey(a));
}
// Código de jogador (para compartilhar sem internet)
function myCode(){ return btoa(unescape(encodeURIComponent(JSON.stringify(myRow())))); }
function importCode(code){
  try{
    const r=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if(!r.id||typeof r.xp!=="number") throw 0;
    S.friends=S.friends.filter(f=>f.id!==r.id);
    if(r.id!==S.profile.id) S.friends.push(r);
    save(); toast(`Colega "${r.name}" adicionado ao ranking!`); render();
  }catch(e){ toast("Código inválido."); }
}

/* ---- Provedores de ranking online ---- */
function provider(){
  const p=(CFG.RANKING_PROVIDER||"").toLowerCase();
  if(p==="github" && CFG.GH_OWNER && CFG.GH_REPO) return "github";
  if(p==="supabase" && CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) return "supabase";
  if(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) return "supabase";     // auto
  if(CFG.GH_OWNER && CFG.GH_REPO) return "github";                     // auto
  return "local";
}
function online(){ return provider()!=="local"; }
function pagesBase(){ return "https://"+CFG.GH_OWNER+".github.io/"+CFG.GH_REPO; }

async function syncOnline(){
  // Supabase sincroniza sozinho; GitHub usa envio manual (botão Publicar).
  if(provider()!=="supabase" || !S.profile.name) return;
  try{
    await fetch(CFG.SUPABASE_URL+"/rest/v1/leaderboard",{
      method:"POST",
      headers:{ "apikey":CFG.SUPABASE_ANON_KEY, "Authorization":"Bearer "+CFG.SUPABASE_ANON_KEY,
        "Content-Type":"application/json", "Prefer":"resolution=merge-duplicates" },
      body:JSON.stringify([{ player_id:S.profile.id, name:S.profile.name, turma:S.profile.turma,
        xp:S.xp, level:levelInfo(S.xp).level, streak:S.streak.count,
        answered:S.stats.answered,
        accuracy:S.stats.answered?Math.round(S.stats.correct/S.stats.answered*100):0 }])
    });
  }catch(e){}
}
async function fetchOnline(){
  const p=provider();
  if(p==="supabase"){
    try{
      const url=CFG.SUPABASE_URL+"/rest/v1/leaderboard?select=*&turma=eq."+encodeURIComponent(S.profile.turma)+"&order=xp.desc&limit=100";
      const res=await fetch(url,{headers:{ "apikey":CFG.SUPABASE_ANON_KEY, "Authorization":"Bearer "+CFG.SUPABASE_ANON_KEY }});
      if(!res.ok) return null;
      const data=await res.json();
      return data.map(d=>({id:d.player_id,name:d.name,xp:d.xp,level:d.level,streak:d.streak,
        answered:d.answered,accuracy:d.accuracy,title:(LEVELS[(d.level||1)-1]||LEVELS[0]).t}));
    }catch(e){ return null; }
  }
  if(p==="github"){
    try{
      const res=await fetch(pagesBase()+"/leaderboard.json?t="+Date.now(),{cache:"no-store"});
      if(!res.ok) return null;
      const j=await res.json(); const players=j.players||{}; const cw=weekStr();
      return Object.keys(players).map(id=>{ const d=players[id]; return {
        id, name:d.name, xp:d.xp||0, weeklyXp:(d.week===cw?(d.weeklyXp||0):0), level:d.level||1, streak:d.streak||0,
        answered:d.answered||0, accuracy:d.accuracy||0, turma:d.turma,
        title:(LEVELS[(d.level||1)-1]||LEVELS[0]).t }; })
        .filter(r=>!r.turma || r.turma===S.profile.turma);
    }catch(e){ return null; }
  }
  return null;
}
// Envia a pontuação abrindo uma issue pré-preenchida (GitHub Actions atualiza o placar)
function submitScoreGithub(){
  if(!S.profile.name){ toast("Defina seu nome primeiro."); return; }
  const title="score: "+S.profile.name;
  const body="MQDATA:"+myCode()+"\n\n_(Não edite este texto. Basta clicar em **Submit new issue**. O ranking atualiza em ~1 minuto.)_";
  const url="https://github.com/"+CFG.GH_OWNER+"/"+CFG.GH_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body);
  window.open(url,"_blank");
  toast("Confirme o envio no GitHub (Submit new issue) 📤");
}

/* ============================================================
   UI / RENDER
   ============================================================ */
let route="home";
let quiz=null;   // {pool, idx, correctCount, mode}
let flash=null;  // {pool, idx, flipped}
let imgd=null;   // {pool, idx, revealed, filter}

function render(){
  ensureMissions();
  stopQuizTimer();
  renderTopbar();
  const main=$("#main"); main.innerHTML="";
  main.classList.remove("view-enter"); void main.offsetWidth; main.classList.add("view-enter"); // reanima a troca de tela
  if(route==="home") viewHome(main);
  else if(route==="plan") viewPlan(main);
  else if(route==="quiz") viewQuiz(main);
  else if(route==="flash") viewFlash(main);
  else if(route==="images") viewImages(main);
  else if(route==="summaries") viewSummaries(main);
  else if(route==="rank") viewRank(main);
  else if(route==="badges") viewBadges(main);
  renderNav();
  save();
}
function go(r){ route=r; if(r==="quiz"&&!quiz) quiz=null; if(r==="flash") flash=null; render(); window.scrollTo(0,0);}

function renderTopbar(){
  const li=levelInfo(S.xp);
  const initial=(S.profile.name||"J").trim().charAt(0).toUpperCase()||"J";
  const ring=`conic-gradient(var(--accent) ${li.pct}%, var(--stroke) 0)`;
  $("#playerchip").innerHTML =
    `<span class="pc-av" style="background:${ring}"><b>${esc(initial)}</b></span>`+
    `<span class="pc-info"><span class="pc-name">${esc(S.profile.name||"Jogador")}</span>`+
    `<span class="pc-sub"><span class="lvl">Nv ${li.level}</span> · ${esc(li.title)}</span></span>`+
    `<span class="streak" title="dias seguidos">🔥 ${S.streak.count}</span>`;
  $("#xptitle").textContent = `Nível ${li.level} · ${li.title}`;
  $("#xpsub").textContent = li.next ? `${S.xp} XP · faltam ${li.toNext} para ${li.next.t}` : `${S.xp} XP · nível máximo!`;
  $("#xpfill").style.width = li.pct+"%";
}

function renderNav(){
  const items=[["home","🏠","Início"],["plan","📋","Plano"],["quiz","❓","Questões"],["flash","🃏","Flashcards"],["images","🖼️","Imagens"],["summaries","📖","Resumos"],["rank","🏆","Ranking"],["badges","🎖️","Conquistas"]];
  const nav=$("#nav"); nav.innerHTML="";
  items.forEach(([r,ic,lb])=>{
    const b=el("button",route===r?"active":"",`<span class="ic">${ic}</span><span>${lb}</span>`);
    b.onclick=()=>go(r); nav.appendChild(b);
  });
}

/* ---------- HOME ---------- */
function viewHome(m){
  // Tiles
  const acc=S.stats.answered?Math.round(S.stats.correct/S.stats.answered*100):0;
  const tiles=el("div","tiles");
  tiles.append(
    tile("🔥",S.streak.count,"dias seguidos"),
    tile("❓",S.stats.answered,"questões"),
    tile("🎯",acc+"%","de acerto"),
    tile("🃏",S.stats.reviews,"revisões"),
    tile("🎖️",achievementsUnlocked()+"/"+achievementsMax(),"patamares"),
  );
  m.appendChild(tiles);

  // Aviso: comece pelo Plano
  const sc=studiedCount();
  if(sc.studied===0){
    const banner=el("div","card mt");
    banner.style.borderColor="var(--accent)";
    banner.innerHTML=`<b>👉 Comece pelo Plano de Estudos</b>
      <p class="muted small mt">As questões só aparecem dos temas que você marcar como estudados. Marque o que já viu para liberar o treino.</p>`;
    const pb=el("button","btn block mt","📋 Abrir Plano de Estudos"); pb.onclick=()=>go("plan");
    banner.appendChild(pb); m.appendChild(banner);
  }

  // Missões
  m.appendChild(el("div","sectitle","Missões de hoje"));
  const mw=el("div");
  S.missions.list.forEach(ms=>{
    const d=el("div","mission"+(ms.done?" done":""));
    d.innerHTML=`<div class="em">${ms.em}</div><div class="info"><div class="nm">${ms.nm} ${ms.done?"✓":""}</div>
      <div class="mprog"><span style="width:${Math.round(ms.cur/ms.goal*100)}%"></span></div></div>
      <div class="rw">${ms.cur}/${ms.goal} · +${ms.rw}XP</div>`;
    mw.appendChild(d);
  });
  m.appendChild(mw);

  // Meta da semana (competição semanal com a turma)
  const wk=weeklyXP(), WGOAL=700;
  const wcard=el("div","card mt");
  wcard.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:baseline">
      <b>🗓️ Meta da semana</b><span class="muted small">${wk}/${WGOAL} XP</span></div>
    <div class="prog" style="margin-top:8px"><span style="width:${Math.min(100,Math.round(wk/WGOAL*100))}%;background:var(--grad)"></span></div>
    <div class="muted small mt">${wk>=WGOAL?"Meta batida! 🎉 Continue somando para o ranking da semana.":"XP desta semana conta no ranking semanal da turma."}</div>`;
  m.appendChild(wcard);

  // Praticar
  m.appendChild(el("div","sectitle","Praticar"));
  const acts=el("div","btnrow");
  const b1=el("button","btn","🎲 Desafio rápido"); b1.onclick=()=>startSession({source:"studied",n:10}); acts.appendChild(b1);
  const b2=el("button","btn","⏱️ Modo Prova"); b2.onclick=()=>startSession({source:"studied",n:15,exam:true,minutes:20}); acts.appendChild(b2);
  m.appendChild(acts);
  const acts2=el("div","btnrow mt");
  const ec=errorsCount(), bc=bookmarksCount();
  const b3=el("button","btn ghost",`🔁 Refazer erros${ec?` (${ec})`:""}`); b3.onclick=()=>startSession({source:"errors",n:20}); if(!ec)b3.style.opacity=".6"; acts2.appendChild(b3);
  const b4=el("button","btn ghost",`⭐ Marcadas${bc?` (${bc})`:""}`); b4.onclick=()=>startSession({source:"bookmarks",n:Math.max(bc,1)}); if(!bc)b4.style.opacity=".6"; acts2.appendChild(b4);
  m.appendChild(acts2);
  const acts3=el("div","btnrow mt");
  const b5=el("button","btn ghost","🃏 Flashcards"); b5.onclick=()=>go("flash"); acts3.appendChild(b5);
  const b6=el("button","btn ghost","🖼️ Imagens"); b6.onclick=()=>go("images"); acts3.appendChild(b6);
  m.appendChild(acts3);

  // Disciplinas
  m.appendChild(el("div","sectitle","Estudar por disciplina"));
  const grid=el("div","grid cols2");
  for(const key in DISCIPLINES){
    const d=DISCIPLINES[key], p=discProgress(key);
    const unlocked=unlockedQuestions(key).length;
    const tp=planTopics(key); const st=tp.filter(t=>t.studied).length;
    const locked = unlocked===0;
    const c=el("div","card disc"+(locked?" lockeddisc":""));
    c.style.setProperty("--dc", d.color);
    c.innerHTML=`<div class="ic">${d.icon}</div><div class="nm">${esc(d.name)}</div>
      <div class="meta">${locked?`🔒 marque temas no Plano`:`${unlocked} questões liberadas · ${st}/${tp.length} temas`}</div>
      <div class="prog"><span style="width:${p.pct}%;background:${d.color}"></span></div>`;
    c.onclick=()=> locked ? go("plan") : startQuiz(key, Math.min(unlocked,12));
    grid.appendChild(c);
  }
  m.appendChild(grid);
}
function tile(em,big,lbl){ const t=el("div","tile"); t.innerHTML=`<div class="em">${em}</div><div class="big">${big}</div><div class="lbl">${lbl}</div>`; return t;}

/* ---------- Modo semanal (cronograma) ---------- */
function renderCronograma(m){
  const info=el("div","card mt");
  info.innerHTML=`<b>📅 Cronograma das aulas</b><p class="muted small mt">O conteúdo libera a cada semana. Faça o <b>estudo pré-aula</b> antes de cada aula e marque o tema como estudado para liberar as questões.</p>`;
  m.appendChild(info);

  CRONOGRAMA.weeks.forEach(w=>{
    const released=weekReleased(w.inicio);
    const card=el("div","card mt");
    if(!released) card.style.opacity=".7";
    const dt = w.inicio ? new Date(w.inicio+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}) : "";
    card.appendChild(el("div","",`<b>${released?"📖":"🔒"} ${esc(w.rotulo||("Semana "+w.n))}</b> <span class="muted small">${released?"liberada":"libera em "+dt}</span>`));
    (w.aulas||[]).forEach(a=>{
      const d=DISCIPLINES[a.disc]; if(!d) return;
      const studied=isStudied(a.disc,a.topic);
      const qn=QUESTIONS.filter(q=>q.discipline===a.disc&&q.topic===a.topic).length;
      const row=el("div"); row.style.cssText="border-top:1px solid var(--stroke);margin-top:10px;padding-top:10px";
      row.innerHTML=`<div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" ${studied?"checked":""} ${released?"":"disabled"} style="width:20px;height:20px;accent-color:${d.color}">
          <div style="flex:1"><div style="font-weight:600">${d.icon} ${esc(a.topic)}</div>
            <div class="muted small">${esc(d.name)} · ${qn} questõe${qn!==1?"s":""}${hasSummary(a.disc,a.topic)?" · 📖 resumo":""}</div></div>
          <span class="rw" style="color:${studied?'var(--good)':'var(--muted2)'}">${studied?"estudado":""}</span></div>
        ${a.preAula?`<div class="explain" style="margin-top:8px"><span class="tag" style="color:var(--accent)">📌 Estudo pré-aula</span>${esc(a.preAula)}</div>`:""}`;
      const cb=row.querySelector("input");
      if(released) cb.onchange=()=>{ setStudied(a.disc,a.topic,cb.checked); render(); };
      card.appendChild(row);
    });
    m.appendChild(card);
  });
  m.appendChild(el("div","center muted small mt","Semanas futuras liberam automaticamente na data. 💪"));
}

/* ---------- PLANO DE ESTUDOS ---------- */
function viewPlan(m){
  const sc=studiedCount();
  const head=el("div","card");
  head.innerHTML=`<h3>📋 Plano de Estudos</h3>
    <p class="muted small">Marque cada tema conforme for estudando. <b>As questões só aparecem dos temas marcados</b> — você treina exatamente o que já viu.</p>
    <div class="prog" style="margin-top:10px"><span style="width:${sc.total?Math.round(sc.studied/sc.total*100):0}%;background:var(--accent)"></span></div>
    <div class="muted small mt">${sc.studied}/${sc.total} temas marcados como estudados</div>`;
  m.appendChild(head);

  // Modo semanal (quando o cronograma oficial estiver preenchido)
  if(cronogramaActive()){ renderCronograma(m); return; }
  else {
    const note=el("div","card mt"); note.style.borderStyle="dashed";
    note.innerHTML=`<b>📅 Liberação por semana</b>
      <p class="muted small mt">Quando os cronogramas das aulas saírem (início de agosto), o conteúdo passa a ser liberado <b>semana a semana</b>, com um <b>estudo pré-aula</b> para cada aula. Até lá, marque livremente abaixo (modo de teste).</p>`;
    m.appendChild(note);
  }

  for(const disc in DISCIPLINES){
    const d=DISCIPLINES[disc];
    const topics=planTopics(disc);
    const nStudied=topics.filter(t=>t.studied).length;
    const card=el("div","card mt");
    const header=el("div"); header.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap";
    header.innerHTML=`<b>${d.icon} ${esc(d.name)}</b><span class="muted small">${nStudied}/${topics.length}</span>`;
    card.appendChild(header);

    const allOn = nStudied===topics.length;
    const toggleAll=el("button","btn ghost sm mt", allOn?"Desmarcar todos":"✓ Marcar toda a disciplina");
    toggleAll.onclick=()=>{ topics.forEach(t=>setStudied(disc,t.topic,!allOn)); render(); };
    card.appendChild(toggleAll);

    let curPhase=null;
    topics.forEach(t=>{
      if(t.phase!==curPhase){ curPhase=t.phase; card.appendChild(el("div","small muted mt",`— ${curPhase==="N1"?"N1 (1ª prova)":"N2 (2ª prova)"} —`)); }
      const row=el("label","mission"); row.style.cursor="pointer";
      const checked=t.studied?"checked":"";
      const qlabel = t.qCount ? `${t.qCount} questõe${t.qCount>1?"s":""}` : "sem questões ainda";
      row.innerHTML=`<input type="checkbox" ${checked} style="width:20px;height:20px;accent-color:${d.color}">
        <div class="info"><div class="nm">${esc(t.topic)}</div><div class="muted small">${qlabel}${hasSummary(disc,t.topic)?" · 📖 resumo":""}</div></div>
        <div class="rw" style="color:${t.studied?'var(--good)':'var(--muted2)'}">${t.studied?"estudado":""}</div>`;
      const cb=row.querySelector("input");
      cb.onchange=()=>{ setStudied(disc,t.topic,cb.checked); render(); };
      card.appendChild(row);
    });
    m.appendChild(card);
  }

  const foot=el("div","center muted small mt","Dica: marque só o que já estudou de verdade. Conforme avança na matéria, volte aqui e libere mais temas. 💪");
  m.appendChild(foot);
}

/* ---------- RESUMOS ---------- */
function hasSummary(disc,topic){ return !!SUMMARIES[tkey(disc,topic)]; }
function viewSummaries(m){
  const total=Object.keys(DISCIPLINES).reduce((a,d)=>a+planTopics(d).length,0);
  const withS=Object.keys(SUMMARIES).length;
  const head=el("div","card");
  head.innerHTML=`<h3>📖 Resumos</h3>
    <p class="muted small">Resumos objetivos por tema. Toque para abrir. Vá adicionando os seus editando <code>js/content.js</code> (bloco <b>SUMMARIES</b>) — o guia está no COMO-ADICIONAR-QUESTOES.md.</p>
    <div class="muted small mt">${withS}/${total} temas com resumo</div>`;
  m.appendChild(head);

  for(const disc in DISCIPLINES){
    const d=DISCIPLINES[disc];
    const topics=planTopics(disc);
    const comResumo=topics.filter(t=>hasSummary(disc,t.topic));
    const card=el("div","card mt");
    card.appendChild(el("div","",`<b>${d.icon} ${esc(d.name)}</b> <span class="muted small">(${comResumo.length}/${topics.length})</span>`));
    if(!comResumo.length){
      card.appendChild(el("div","muted small mt","Nenhum resumo ainda. Adicione em SUMMARIES: chave \""+disc+"::&lt;tema&gt;\"."));
    }
    comResumo.forEach(t=>{
      const item=el("div"); item.style.cssText="border-top:1px solid var(--stroke);margin-top:10px;padding-top:10px";
      const btn=el("button","opt"); btn.style.marginBottom="0";
      btn.innerHTML=`📖 <b>${esc(t.topic)}</b> <span class="pill" style="float:right">${t.phase}</span>`;
      const body=el("div","explain mt hidden"); body.innerHTML=esc(SUMMARIES[tkey(disc,t.topic)]).replace(/\n/g,"<br>");
      btn.onclick=()=>{ body.classList.toggle("hidden"); };
      item.append(btn,body); card.appendChild(item);
    });
    m.appendChild(card);
  }
}

/* ---------- QUIZ / PRÁTICA ---------- */
let quizTimerId=null;
function stopQuizTimer(){ if(quizTimerId){ clearInterval(quizTimerId); quizTimerId=null; } }
function errorsCount(){ return Object.keys(S.errors||{}).length; }
function bookmarksCount(){ return Object.keys(S.bookmarks||{}).length; }
function toggleBookmark(id){ if(S.bookmarks[id]) delete S.bookmarks[id]; else S.bookmarks[id]=true; save(); }

function buildPool(source, disc, topic){
  if(source==="errors") return QUESTIONS.filter(q=>S.errors[q.id]);
  if(source==="bookmarks") return QUESTIONS.filter(q=>S.bookmarks[q.id]);
  let p = unlockedQuestions(disc==="all"?null:disc); // "studied"
  if(topic) p = p.filter(q=>q.topic===topic);
  return p;
}
function startSession(opts){
  const source=opts.source||"studied";
  let pool=buildPool(source, opts.disc, opts.topic);
  if(!pool.length){
    if(source==="errors"){ toast("Nenhum erro pendente — mandou bem! 🎉"); go("home"); return; }
    if(source==="bookmarks"){ toast("Você ainda não marcou questões (toque na ⭐)."); go("home"); return; }
    toast("Marque temas no Plano de Estudos para liberar questões 📋"); go("plan"); return;
  }
  const n=Math.min(opts.n||10, pool.length);
  if(!opts.exam) pool.sort((a,b)=>{ const sa=S.seenQ[a.id]?.correct?1:0, sb=S.seenQ[b.id]?.correct?1:0; return sa-sb;});
  pool = shuffle(pool.slice(0, Math.max(n, Math.min(pool.length,n*2)))).slice(0,n);
  quiz={pool, idx:0, correctCount:0, answered:false,
    mode:opts.exam?"exam":(opts.mode||"quiz"), source, exam:!!opts.exam, total:pool.length,
    answers:new Array(pool.length).fill(null), scored:false,
    endAt: opts.exam ? Date.now()+(opts.minutes||15)*60000 : null };
  go("quiz");
}
// compat: cards de disciplina e "jogar de novo"
function startQuiz(disc, n, isSim=false){ startSession({source:"studied", disc, n, mode:isSim?"sim":"quiz"}); }

function viewQuiz(m){
  if(!quiz){ const p=el("div","card center"); p.innerHTML=`<p class="muted">Escolha um modo na tela inicial.</p>`;
    const b=el("button","btn mt","🎲 Desafio rápido");b.onclick=()=>startSession({source:"studied",n:10});p.appendChild(b); m.appendChild(p); return; }
  if(quiz.idx>=quiz.pool.length){ return quizResult(m); }
  const q=quiz.pool[quiz.idx];
  const d=DISCIPLINES[q.discipline];
  const dl=["","Base","Intermediária","Desafio"][q.difficulty];

  const head=el("div","card");
  const marked=!!S.bookmarks[q.id];
  head.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
    <span class="pill">${d.icon} ${esc(d.name)} · ${q.phase}</span>
    <span style="display:flex;gap:8px;align-items:center">
      <span class="diffbadge d${q.difficulty}">${dl}</span>
      ${quiz.exam?`<span class="timer" id="qtimer">⏱️ --:--</span>`:""}
      <button class="starbtn${marked?" on":""}" id="starbtn" title="Marcar para revisar">${marked?"★":"☆"}</button>
    </span></div>
    <div class="muted small mt">Questão ${quiz.idx+1} de ${quiz.pool.length}${quiz.source==="errors"?" · refazendo erros":quiz.source==="bookmarks"?" · marcadas":""}</div>`;
  m.appendChild(head);
  head.querySelector("#starbtn").onclick=()=>{ toggleBookmark(q.id); render(); };

  const body=el("div","card mt");
  if(q.vignette) body.appendChild(el("div","q-vignette",esc(q.vignette)));
  body.appendChild(el("div","q-stem",esc(q.question)));
  const opts=el("div");
  q.options.forEach((opt,i)=>{
    const sel = quiz.exam && quiz.answers[quiz.idx]===i;
    const b=el("button","opt"+(sel?" sel":""),`<span class="k">${String.fromCharCode(65+i)}</span>${esc(opt)}`);
    b.onclick=()=> quiz.exam ? examSelect(i) : answer(i,body,opts,q);
    opts.appendChild(b);
  });
  body.appendChild(opts);

  if(quiz.exam){
    const nav=el("div","btnrow mt");
    const nb=el("button","btn", quiz.idx+1>=quiz.pool.length?"✅ Finalizar prova":"Próxima →");
    nb.onclick=()=>{ quiz.idx++; render(); window.scrollTo(0,0); };
    nav.appendChild(nb);
    if(quiz.idx>0){ const pb=el("button","btn ghost","← Voltar"); pb.onclick=()=>{ quiz.idx--; render(); window.scrollTo(0,0); }; nav.appendChild(pb); }
    body.appendChild(nav);
  }
  m.appendChild(body);

  // cronômetro do modo prova
  if(quiz.exam && quiz.endAt){
    const upd=()=>{
      const left=Math.max(0, Math.round((quiz.endAt-Date.now())/1000));
      const t=$("#qtimer"); if(t){ const mm=String(Math.floor(left/60)).padStart(2,"0"), ss=String(left%60).padStart(2,"0"); t.textContent="⏱️ "+mm+":"+ss; t.classList.toggle("low",left<=30); }
      if(left<=0){ stopQuizTimer(); toast("Tempo esgotado!"); quiz.idx=quiz.pool.length; render(); }
    };
    upd(); quizTimerId=setInterval(upd,1000);
  }
}
function examSelect(i){ quiz.answers[quiz.idx]=i; save(); render(); }
function answer(i,body,opts,q){
  if(quiz.answered) return;
  quiz.answered=true;
  const correct = i===q.answer;
  const gain = recordAnswer(q, correct);
  quiz.answers[quiz.idx]=i;
  if(correct) quiz.correctCount++;
  bumpMission("m_q",1); if(correct) bumpMission("m_acc",1);
  [...opts.children].forEach((b,j)=>{
    b.classList.add("disabled");
    if(j===q.answer) b.classList.add("correct");
    else if(j===i) b.classList.add("wrong");
  });
  const ex=el("div","explain "+(correct?"ok":"no"));
  ex.innerHTML=`<span class="tag">${correct?`✔ Correto! +${gain} XP`:"✗ Incorreto"}</span>${esc(q.explanation)}`;
  body.appendChild(ex);
  const nav=el("div","btnrow mt");
  const nb=el("button","btn",quiz.idx+1>=quiz.pool.length?"Ver resultado →":"Próxima →");
  nb.onclick=()=>{ quiz.idx++; quiz.answered=false; render(); window.scrollTo(0,0); };
  nav.appendChild(nb);
  body.appendChild(nav);
  save(); renderTopbar(); checkBadges(); syncOnline();
  window.scrollTo(0,document.body.scrollHeight);
}
function quizResult(m){
  stopQuizTimer();
  // pontua o modo prova ao finalizar
  if(quiz.exam && !quiz.scored){
    quiz.correctCount=0;
    quiz.pool.forEach((q,idx)=>{ const sel=quiz.answers[idx]; const ok=sel===q.answer;
      recordAnswer(q, ok); if(ok) quiz.correctCount++; bumpMission("m_q",1); if(ok) bumpMission("m_acc",1); });
    quiz.scored=true; save(); renderTopbar(); checkBadges(); syncOnline();
  }
  const pct=Math.round(quiz.correctCount/quiz.total*100);
  if((quiz.mode==="sim"||quiz.exam) && quiz.total>=8 && pct===100){ S.flags.perfectQuiz=true; S.stats.perfectQuizzes=(S.stats.perfectQuizzes||0)+1; save(); checkBadges(); }

  const c=el("div","card center");
  const em = pct>=80?"🏆":pct>=60?"👏":"📖";
  c.innerHTML=`<div style="font-size:52px">${em}</div>
    <h2>${quiz.correctCount}/${quiz.total} acertos (${pct}%)</h2>
    <p class="muted">${pct>=80?"Excelente! Você dominou este bloco.":pct>=60?"Bom trabalho — revise os erros abaixo.":"Continue treinando, o próximo vai melhor!"}</p>`;
  const row=el("div","btnrow center mt");row.style.justifyContent="center";
  const b1=el("button","btn","🔁 De novo");b1.onclick=()=>startSession({source:quiz.source, n:quiz.total, exam:quiz.exam, minutes: quiz.exam?15:0});
  if(quiz.answers.some((a,idx)=>a!==quiz.pool[idx].answer)){
    const be=el("button","btn ghost","🔁 Refazer só os erros");be.onclick=()=>startSession({source:"errors",n:20});
    row.appendChild(be);
  }
  const b2=el("button","btn ghost","🏠 Início");b2.onclick=()=>{quiz=null;go("home");};
  row.append(b1,b2);
  c.appendChild(row);
  m.appendChild(c);

  // revisão (modo prova mostra tudo; prática mostra os erros)
  m.appendChild(el("div","sectitle","Revisão"));
  quiz.pool.forEach((q,idx)=>{
    const sel=quiz.answers[idx], ok=sel===q.answer;
    if(!quiz.exam && ok) return; // na prática, revisa só o que errou
    const d=DISCIPLINES[q.discipline];
    const item=el("div","card mt");
    item.innerHTML=`<div class="muted small">${d.icon} ${esc(q.topic)}</div>
      <div style="font-weight:700;margin:6px 0">${esc(q.question)}</div>
      <div class="small"><b>Sua resposta:</b> ${sel!=null?String.fromCharCode(65+sel)+") "+esc(q.options[sel]):"(em branco)"} ${ok?"✅":"❌"}</div>
      <div class="small" style="color:var(--good)"><b>Correta:</b> ${String.fromCharCode(65+q.answer)}) ${esc(q.options[q.answer])}</div>
      <div class="explain ${ok?"ok":"no"} mt">${esc(q.explanation)}</div>`;
    m.appendChild(item);
  });
  quiz.pool=quiz.pool.slice(); // mantém para revisão; idx já ao fim
}

/* ---------- FLASHCARDS ---------- */
function viewFlash(m){
  if(!flash){
    const due=dueCards();
    if(!due.length){ const c=el("div","card center");c.innerHTML=`<div style="font-size:48px">✅</div><h2>Tudo revisado!</h2><p class="muted">Nenhum flashcard vencido hoje. Volte amanhã ou treine questões.</p>`;
      const b=el("button","btn mt","❓ Ir para questões");b.onclick=()=>go("quiz");c.appendChild(b);m.appendChild(c);return;}
    flash={pool:due, idx:0, flipped:false};
  }
  if(flash.idx>=flash.pool.length){
    const c=el("div","card center");c.innerHTML=`<div style="font-size:48px">🎉</div><h2>Sessão concluída!</h2><p class="muted">Você revisou ${flash.idx} flashcards.</p>`;
    const b=el("button","btn mt","🏠 Início");b.onclick=()=>{flash=null;go("home");};c.appendChild(b);m.appendChild(c);return;
  }
  const card=flash.pool[flash.idx];
  const d=DISCIPLINES[card.discipline];
  const head=el("div","card");
  head.innerHTML=`<div style="display:flex;justify-content:space-between"><span class="pill">${d.icon} ${esc(d.name)}</span><span class="muted small">${flash.idx+1}/${flash.pool.length} · vencidos</span></div>`;
  m.appendChild(head);

  const fc=el("div","flash mt"+(flash.flipped?" flipped":""));
  fc.innerHTML=`<div class="flash-inner">
    <div class="flash-face"><span class="hint">Pergunta</span><div class="txt">${esc(card.front)}</div><span class="hint" style="top:auto;bottom:14px;left:16px">toque para virar</span></div>
    <div class="flash-face flash-back"><span class="hint">Resposta</span><div class="txt">${esc(card.back)}</div></div></div>`;
  fc.onclick=()=>{ flash.flipped=!flash.flipped; render(); };
  m.appendChild(fc);

  if(flash.flipped){
    const srs=el("div","srsrow mt");
    const opts=[["srs-again","Errei","1 dia"],["srs-hard","Difícil","curto"],["srs-good","Bom","+"],["srs-easy","Fácil","++"]];
    opts.forEach(([cls,lb,sub],q)=>{
      const b=el("button",cls,`${lb}<small>${sub}</small>`);
      b.onclick=()=>{ gradeCard(card.id,q); flash.idx++; flash.flipped=false; render(); window.scrollTo(0,0); };
      srs.appendChild(b);
    });
    m.appendChild(srs);
  }else{
    const hint=el("div","center muted small mt","Leia, pense na resposta e toque no card para conferir.");
    m.appendChild(hint);
  }
}

/* ---------- MÓDULO DE IMAGENS ---------- */
function imgAreas(){ const s=new Set(IMAGES.map(c=>c.area.replace(/\s*\(.*\)/,"").trim())); return [...s]; }
function viewImages(m){
  const head=el("div","card");
  head.innerHTML=`<h3>🖼️ Imagens — reconhecimento visual</h3>
    <p class="muted small">Bata o olho nos <b>achados</b> e diga o diagnóstico antes de revelar. Estilo prova prática de patologia e radiologia.</p>`;
  m.appendChild(head);

  // filtros por área
  const areas=["Todas", ...imgAreas()];
  const frow=el("div","chiprow mt");
  areas.forEach(a=>{
    const on=(imgd&&imgd.filter||"Todas")===a;
    const b=el("button","chip"+(on?" on":""),a);
    b.onclick=()=>{ imgd={filter:a, pool:imgPool(a), idx:0, revealed:false}; render(); };
    frow.appendChild(b);
  });
  m.appendChild(frow);

  if(!imgd) imgd={filter:"Todas", pool:imgPool("Todas"), idx:0, revealed:false};
  if(imgd.idx>=imgd.pool.length){
    const c=el("div","card center mt");c.innerHTML=`<div style="font-size:46px">🎉</div><h2>Você viu todas!</h2><p class="muted">Reveja quando quiser — a repetição fixa o reconhecimento.</p>`;
    const b=el("button","btn mt","🔁 Recomeçar");b.onclick=()=>{imgd.idx=0;imgd.revealed=false;imgd.pool=shuffle(imgd.pool);render();};c.appendChild(b);m.appendChild(c);return;
  }
  const card=imgd.pool[imgd.idx];
  const d=DISCIPLINES[card.discipline];
  const wrap=el("div","card mt");
  wrap.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
    <span class="pill">${d.icon} ${esc(card.area)}</span><span class="muted small">${imgd.idx+1}/${imgd.pool.length}</span></div>`;

  // palco visual: imagem do usuário (src) > esquema svg > ícone neutro
  const stage=el("div","imgstage mt");
  if(card.src){ stage.innerHTML=`<img src="${esc(card.src)}" alt="imagem">`; }
  else if(card.svg){ stage.innerHTML=card.svg; }
  else { stage.innerHTML=`<div class="imgph">${card.area.includes("Radio")?"🩻":card.area.includes("Semio")?"🩺":"🔬"}<span>achado descrito abaixo</span></div>`; }
  wrap.appendChild(stage);

  wrap.appendChild(el("div","findings mt",`<b>Achados:</b> ${esc(card.findings)}`));

  if(!imgd.revealed){
    const b=el("button","btn block mt","👁️ Revelar diagnóstico");
    b.onclick=()=>{
      imgd.revealed=true;
      S.stats.imagesSeen=(S.stats.imagesSeen||0)+1; touchStreak(); addXP(3); save(); renderTopbar(); checkBadges();
      render();
    };
    wrap.appendChild(b);
  } else {
    const ex=el("div","explain ok mt");
    ex.innerHTML=`<span class="tag">✅ ${esc(card.answer)}</span>${esc(card.explanation)}`;
    wrap.appendChild(ex);
    const nav=el("div","btnrow mt");
    const nb=el("button","btn", imgd.idx+1>=imgd.pool.length?"Ver resumo →":"Próxima imagem →");
    nb.onclick=()=>{ imgd.idx++; imgd.revealed=false; render(); window.scrollTo(0,0); };
    nav.appendChild(nb);
    wrap.appendChild(nav);
  }
  m.appendChild(wrap);

  m.appendChild(el("div","center muted small mt","Quer usar suas próprias imagens? Veja COMO-ADICIONAR-QUESTOES.md (campo \"src\")."));
}
function imgPool(area){
  let p = area==="Todas" ? IMAGES.slice() : IMAGES.filter(c=>c.area.replace(/\s*\(.*\)/,"").trim()===area);
  return shuffle(p);
}

/* ---------- RANKING ---------- */
function viewRank(m){
  const p=provider();
  const modo = p==="github" ? "Modo online (GitHub) — publique sua pontuação e todos veem." :
               p==="supabase" ? "Modo online (Supabase) — atualiza automaticamente." :
               "Modo local — troque o código de jogador com os colegas.";
  const head=el("div","card");
  head.innerHTML=`<h3>🏆 Ranking — ${esc(S.profile.turma)}</h3><p class="muted small">${modo}</p>`;
  m.appendChild(head);

  // Botão de publicar (modo GitHub)
  if(p==="github"){
    const pub=el("div","card mt");
    pub.innerHTML=`<h3>📤 Publicar minha pontuação</h3>
      <p class="muted small mb">Clique, confirme no GitHub (botão verde <b>Submit new issue</b>) e em ~1 min você aparece no ranking de todos. Repita quando quiser atualizar seu XP.</p>`;
    const pb=el("button","btn block","📤 Publicar "+S.xp+" XP no ranking");
    pb.onclick=submitScoreGithub; pub.appendChild(pb);
    const rf=el("button","btn ghost sm mt","🔄 Atualizar ranking"); rf.onclick=()=>render();
    pub.appendChild(rf);
    m.appendChild(pub);
  }

  // alternador Total / Semana
  const seg=el("div","chiprow mt");
  [["total","🏆 Geral"],["semana","🗓️ Semana"]].forEach(([k,lb])=>{
    const b=el("button","chip"+(rankMode===k?" on":""),lb); b.onclick=()=>{ rankMode=k; render(); }; seg.appendChild(b);
  });
  m.appendChild(seg);

  const list=el("div","mt"); list.id="ranklist";
  renderRankList(list, localRanking());
  m.appendChild(list);

  if(online()){
    fetchOnline().then(rows=>{ if(rows&&rows.length){
      if(!rows.find(r=>r.id===S.profile.id)) rows.push(myRow());
      // mistura com colegas locais que ainda não publicaram
      S.friends.forEach(f=>{ if(!rows.find(r=>r.id===f.id)) rows.push(f); });
      rows.sort((a,b)=>rankKey(b)-rankKey(a)); renderRankList(list,rows);
    }});
  }

  // Ferramentas de código local (também servem de alternativa offline)
  const tools=el("div","card mt");
  tools.innerHTML=`<h3>👥 Alternativa offline (código de jogador)</h3>
    <p class="muted small mb">Sem internet ou sem GitHub? Envie seu <b>código</b> para os colegas e cole o deles aqui — vocês aparecem no mesmo ranking mesmo assim.</p>`;
  const myc=el("textarea","input"); myc.readOnly=true; myc.value=myCode(); myc.onclick=()=>{myc.select();document.execCommand&&document.execCommand("copy");toast("Código copiado!");};
  tools.appendChild(el("div","small muted","Seu código (toque para copiar):"));
  tools.appendChild(myc);
  const inp=el("textarea","input"); inp.placeholder="Cole aqui o código de um colega...";
  tools.appendChild(el("div","small muted mt","Adicionar colega:"));
  tools.appendChild(inp);
  const b=el("button","btn sm mt","➕ Adicionar ao ranking"); b.onclick=()=>{ if(inp.value.trim()) importCode(inp.value); };
  tools.appendChild(b);
  m.appendChild(tools);
}
function renderRankList(container, rows){
  container.innerHTML="";
  rows.forEach((r,i)=>{
    const isMe=r.id===S.profile.id;
    const row=el("div","rank"+(isMe?" me":"")+(i<3?" top"+(i+1):""));
    const initial=(r.name||"?").trim().charAt(0).toUpperCase()||"?";
    row.innerHTML=`<div class="pos">${i+1}º</div>
      <div class="av">${esc(initial)}</div>
      <div class="info"><div class="nm">${esc(r.name||"Jogador")}${isMe?" (você)":""}</div>
        <div class="sub">Nv ${r.level} · ${esc(r.title||"")} · 🔥${r.streak||0} · ${r.answered||0} q · ${r.accuracy||0}%</div></div>
      <div class="xp">${rankMode==="semana"?(r.weeklyXp||0)+" XP/sem":(r.xp||0)+" XP"}</div>`;
    container.appendChild(row);
  });
  if(rows.length<=1){ container.appendChild(el("div","muted small center mt","Adicione colegas abaixo para começar a competição! 👇")); }
}

/* ---------- BADGES ---------- */
function viewBadges(m){
  const head=el("div","card");
  head.innerHTML=`<h3>🎖️ Conquistas</h3>
    <p class="muted small">Cada conquista tem 5 patamares: 🥉 Bronze · 🥈 Prata · 🥇 Ouro · 🏆 Platina · 💠 Diamante. Quanto maior, mais XP.</p>
    <div class="muted small mt">${achievementsUnlocked()}/${achievementsMax()} patamares conquistados</div>`;
  m.appendChild(head);

  const grid=el("div","grid cols2 mt");
  ACHIEVEMENTS.forEach(a=>{
    const cur=S.ach[a.id]||0, val=a.metric(S);
    const nextReq = cur<5 ? a.tiers[cur] : null;
    const emShown = cur>0 ? TIER_EM[cur-1] : "🔒";
    const tierName = cur>0 ? TIER_NAMES[cur-1] : "Bloqueada";
    // barra de progresso rumo ao próximo patamar
    const prevReq = cur>0 ? a.tiers[cur-1] : 0;
    const pct = nextReq!=null ? Math.min(100, Math.round(((val-prevReq)/(nextReq-prevReq))*100)) : 100;
    const c=el("div","card ach tier"+cur+(cur===0?" locked":""));
    c.style.padding="14px";
    // pips dos 5 níveis
    let pips=""; for(let i=0;i<5;i++){ pips+=`<span style="opacity:${i<cur?1:.25};font-size:15px">${TIER_EM[i]}</span>`; }
    c.innerHTML=`<div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:30px">${a.em}</div>
        <div style="flex:1"><div style="font-weight:700">${esc(a.nm)}</div>
          <div class="muted small">${cur>0?tierName:"—"} · ${val}${a.isPct?"%":""} ${esc(a.unit).replace(/%.*/,"")}</div></div>
        <div style="font-size:20px">${emShown}</div></div>
      <div style="display:flex;gap:4px;margin-top:8px">${pips}</div>
      <div class="prog" style="margin-top:8px"><span style="width:${pct}%;background:${cur>=5?'var(--gold)':'var(--accent)'}"></span></div>
      <div class="muted small mt">${nextReq!=null?`Próximo (${TIER_NAMES[cur]}): ${nextReq} ${esc(a.unit)}`:"✅ Diamante — máximo!"}</div>`;
    grid.appendChild(c);
  });
  m.appendChild(grid);

  // Progresso por disciplina
  m.appendChild(el("div","sectitle","Domínio por disciplina"));
  const g2=el("div","grid cols2");
  for(const key in DISCIPLINES){
    const d=DISCIPLINES[key], p=discProgress(key), bd=S.byDisc[key]||{answered:0,correct:0};
    const acc=bd.answered?Math.round(bd.correct/bd.answered*100):0;
    const c=el("div","card");
    c.innerHTML=`<div style="display:flex;justify-content:space-between"><b>${d.icon} ${esc(d.name)}</b><span class="muted small">${acc}%</span></div>
      <div class="prog" style="margin-top:8px"><span style="width:${p.pct}%;background:${d.color}"></span></div>
      <div class="muted small mt">${p.done}/${p.total} dominadas · ${bd.answered} respondidas</div>`;
    g2.appendChild(c);
  }
  m.appendChild(g2);

  // Pontos fracos por tema (a partir de 3 respostas no tema)
  const topics=Object.keys(S.byTopic||{}).map(k=>{
    const bt=S.byTopic[k]; const i=k.indexOf("::"); const disc=k.slice(0,i), topic=k.slice(i+2);
    return {disc, topic, answered:bt.answered, acc: bt.answered?Math.round(bt.correct/bt.answered*100):0};
  }).filter(t=>t.answered>=3 && DISCIPLINES[t.disc]);
  if(topics.length){
    const weak=topics.slice().sort((a,b)=>a.acc-b.acc).slice(0,6);
    m.appendChild(el("div","sectitle","Pontos fracos (priorize esses temas)"));
    const wrap=el("div");
    weak.forEach(t=>{
      const d=DISCIPLINES[t.disc];
      const row=el("div","mission");
      const col = t.acc<50?"var(--bad)":t.acc<70?"var(--warn)":"var(--good)";
      row.innerHTML=`<div class="em" style="background:${d.color}22">${d.icon}</div>
        <div class="info"><div class="nm">${esc(t.topic)}</div>
          <div class="mprog"><span style="width:${t.acc}%;background:${col}"></span></div></div>
        <div class="rw" style="color:${col}">${t.acc}% · ${t.answered}q</div>`;
      row.style.cursor="pointer";
      row.onclick=()=>{ // treina esse tema (se liberado)
        if(!isStudied(t.disc,t.topic)){ toast("Libere o tema no Plano primeiro."); return; }
        const pool=QUESTIONS.filter(q=>q.discipline===t.disc&&q.topic===t.topic);
        if(pool.length) startSession({source:"studied", disc:t.disc, topic:t.topic, n:Math.min(pool.length,10)});
      };
      wrap.appendChild(row);
    });
    m.appendChild(wrap);
  }

  // Reset
  const rc=el("div","center mt");
  const rb=el("button","btn ghost sm","⟲ Reiniciar progresso"); rb.onclick=()=>{ if(confirm("Apagar TODO o seu progresso? Não dá para desfazer.")){ localStorage.removeItem(LS_KEY); S=freshState(); onboard(); } };
  rc.appendChild(rb); m.appendChild(rc);
}

/* ---------- Modais / toast ---------- */
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); }
function showBadgeModal(a, tier){
  const bg=el("div","modal-bg"); const mo=el("div","modal");
  const tname=TIER_NAMES[tier-1], tem=TIER_EM[tier-1], req=a.tiers[tier-1];
  mo.innerHTML=`<div class="em">${a.em} ${tem}</div><h2>${tname} desbloqueado!</h2>
    <p><b>${esc(a.nm)} — ${tname}</b><br>${req} ${esc(a.unit)}<br><span style="color:var(--gold)">+${TIER_XP[tier-1]} XP</span></p>`;
  const btn=el("button","btn block","Continuar 🎉"); btn.onclick=()=>bg.remove(); mo.appendChild(btn);
  bg.appendChild(mo); bg.onclick=e=>{if(e.target===bg)bg.remove();}; document.body.appendChild(bg);
}
function onboard(){
  const bg=el("div","modal-bg"); const mo=el("div","modal");
  mo.innerHTML=`<div class="em">🩺</div><h2>Bem-vindo ao MedQuest 5</h2><p>Como você quer aparecer no ranking da turma?</p>`;
  const inp=el("input","input"); inp.placeholder="Seu nome ou apelido"; inp.value=S.profile.name||"";
  const inp2=el("input","input"); inp2.placeholder="Turma/grupo"; inp2.value=S.profile.turma||CFG.TURMA;
  mo.append(inp,inp2);
  const btn=el("button","btn block mt","Começar a jogar →");
  btn.onclick=()=>{ S.profile.name=(inp.value.trim()||"Jogador"); S.profile.turma=(inp2.value.trim()||CFG.TURMA); save(); syncOnline(); bg.remove(); render(); };
  mo.appendChild(btn); bg.appendChild(mo); document.body.appendChild(bg);
}

/* ---------- Boot ---------- */
ensureMissions();
// sincroniza conquistas com o progresso atual (sem duplicar patamares já registrados)
for(const a of ACHIEVEMENTS){ const t=achTier(a); if((S.ach[a.id]||0)<t) S.ach[a.id]=t; }
save();
render();
if(!S.profile.name) onboard();
window.MEDQUEST_IMPORT = importCode; // util para debug/console
})();
