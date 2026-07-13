/* ============================================================
   MedQuest 5 — App principal
   Lógica: perfil, XP/níveis, streak, conquistas, missões,
   quiz de raciocínio clínico, flashcards (SM-2) e ranking.
   ============================================================ */
(function(){
"use strict";
const { DISCIPLINES, QUESTIONS, FLASHCARDS, SYLLABUS, SUMMARIES, CRONOGRAMA, IMAGES, LINKS } = window.MEDQUEST_DATA;
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
  { id:"foco", em:"🍅", nm:"Foco Total", unit:"pomodoros",
    metric:s=>s.stats.pomodoros||0, tiers:[4,12,30,60,120] },
];
// patamar atual alcançado (0 = nenhum, 5 = Diamante) para uma conquista
function achTier(a){ const v=a.metric(S); let t=0; for(let i=0;i<a.tiers.length;i++){ if(v>=a.tiers[i]) t=i+1; } return t; }

/* ---------- Estado ---------- */
function freshState(){
  return {
    profile:{ id:"p_"+Math.abs(hash(String(navigator.userAgent+performance.now()+"x"))).toString(36), name:"", turma:CFG.TURMA },
    xp:0,
    stats:{answered:0, correct:0, reviews:0, activeDays:0, perfectQuizzes:0, imagesSeen:0, pomodoros:0, focusMin:0, quizMin:0},
    studied:{},                   // {"disc::topic": true} — temas marcados como estudados
    byDisc:{},                    // {disc:{answered,correct}}
    byTopic:{},                   // {"disc::topic": {answered,correct}}
    seenQ:{},                     // {qid: {correct:bool, count}}
    errors:{},                    // {qid:true} — questões erradas ainda não recuperadas
    bookmarks:{},                 // {qid:true} — questões marcadas para revisar
    weekly:{week:"", xp:0},       // XP da semana (competição semanal)
    history:{},                   // {"AAAA-MM-DD": {xp,answered,correct}} — evolução diária
    notes:{},                     // {"disc::topic": "anotação pessoal"}
    duels:[],                     // histórico de duelos [{opp,my,their,res,date}]
    settings:{pomoFocus:25, pomoBreak:5, pomoGoal:4, theme:"dark", fontScale:1,
              reminder:{enabled:false, time:"19:00", lastDate:""}}, // config
    dailyQ:{date:"", done:false, correct:false}, // questão do dia
    errReasons:{sabia:0, conceito:0, atencao:0}, // "por que errei"
    taught:{}, // "ensine um colega": {"disc::topic": explicação}
    priority:{}, // temas marcados como "cai muito" {"disc::topic": true}
    trilha:{}, // progresso da trilha por tema {"disc::topic": {resumo:bool}}
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
function histToday(){ const t=todayStr(); if(!S.history[t]) S.history[t]={xp:0,answered:0,correct:0}; return S.history[t]; }
function addXP(n){
  S.xp+=n;
  const w=weekStr();
  if(!S.weekly || S.weekly.week!==w) S.weekly={week:w, xp:0};
  S.weekly.xp+=n;
  histToday().xp+=n;
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
  const h=histToday(); h.answered++; if(correct) h.correct++;
  if(!S.byDisc[disc]) S.byDisc[disc]={answered:0,correct:0};
  S.byDisc[disc].answered++;
  const tk=tkey(disc,q.topic);
  if(!S.byTopic[tk]) S.byTopic[tk]={answered:0,correct:0};
  S.byTopic[tk].answered++;
  // registro por questão + controle de erros
  if(!S.seenQ[q.id]) S.seenQ[q.id]={correct:false,count:0};
  S.seenQ[q.id].count++; S.seenQ[q.id].last=todayStr();
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
function isPriority(disc,topic){ return !!(S.priority||{})[tkey(disc,topic)]; }
function togglePriority(disc,topic){ if(!S.priority)S.priority={}; const k=tkey(disc,topic); if(S.priority[k]) delete S.priority[k]; else S.priority[k]=true; save(); }
function priorityCount(){ return Object.keys(S.priority||{}).length; }

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
  answered:S.stats.answered, studied:studiedCount().studied,
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

let _syncT=null;
async function syncOnline(){
  // Supabase sincroniza sozinho (com debounce); GitHub usa envio manual (botão Publicar).
  if(provider()!=="supabase" || !S.profile.name) return;
  clearTimeout(_syncT);
  _syncT=setTimeout(()=>{ // coalesce rajadas de respostas em 1 requisição
    fetch(CFG.SUPABASE_URL+"/rest/v1/leaderboard",{
      method:"POST",
      headers:supaHeaders({Prefer:"resolution=merge-duplicates"}),
      body:JSON.stringify([{ player_id:S.profile.id, name:S.profile.name, turma:S.profile.turma,
        xp:S.xp, level:levelInfo(S.xp).level, streak:S.streak.count,
        answered:S.stats.answered, studied:studiedCount().studied,
        weekly_xp:weeklyXP(), week:weekStr(),
        accuracy:S.stats.answered?Math.round(S.stats.correct/S.stats.answered*100):0 }])
    }).catch(()=>{});
  }, 2500);
}
async function fetchOnline(){
  const p=provider();
  if(p==="supabase"){
    try{
      const url=CFG.SUPABASE_URL+"/rest/v1/leaderboard?select=*&turma=eq."+encodeURIComponent(S.profile.turma)+"&order=xp.desc&limit=100";
      const res=await fetch(url,{headers:supaHeaders()});
      if(!res.ok) return null;
      const data=await res.json(); const cw=weekStr();
      return data.map(d=>({id:d.player_id,name:d.name,xp:d.xp||0,level:d.level||1,streak:d.streak||0,
        answered:d.answered||0, studied:d.studied||0, weeklyXp:(d.week===cw?(d.weekly_xp||0):0),
        accuracy:d.accuracy||0, title:(LEVELS[(d.level||1)-1]||LEVELS[0]).t}));
    }catch(e){ return null; }
  }
  if(p==="github"){
    try{
      const res=await fetch(pagesBase()+"/leaderboard.json?t="+Date.now(),{cache:"no-store"});
      if(!res.ok) return null;
      const j=await res.json(); const players=j.players||{}; const cw=weekStr();
      return Object.keys(players).map(id=>{ const d=players[id]; return {
        id, name:d.name, xp:d.xp||0, weeklyXp:(d.week===cw?(d.weeklyXp||0):0), level:d.level||1, streak:d.streak||0,
        answered:d.answered||0, studied:d.studied||0, accuracy:d.accuracy||0, turma:d.turma,
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
  stopQuizTimer(); stopQClock();
  renderTopbar();
  const main=$("#main"); main.innerHTML="";
  main.classList.remove("view-enter"); void main.offsetWidth; main.classList.add("view-enter"); // reanima a troca de tela
  if(route==="home") viewHome(main);
  else if(route==="plan") viewPlan(main);
  else if(route==="quiz") viewQuiz(main);
  else if(route==="flash") viewFlash(main);
  else if(route==="images") viewImages(main);
  else if(route==="summaries") viewResumos(main);
  else if(route==="dvd") viewDuvidas(main);
  else if(route==="rank") viewRank(main);
  else if(route==="badges") viewBadges(main);
  renderNav();
  save();
}
function go(r){ route=r; if(r==="quiz" && quiz && quiz.idx>=quiz.pool.length) quiz=null; if(r==="flash") flash=null; render(); window.scrollTo(0,0);}

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
  const items=[["home","🏠","Início"],["plan","📋","Plano"],["quiz","❓","Questões"],["flash","🃏","Flashcards"],["images","🖼️","Imagens"],["summaries","📖","Resumos"],["dvd","💬","Dúvidas"],["rank","🏆","Ranking"],["badges","🎖️","Conquistas"]];
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
    tile("🍅",pomodorosToday(),"foco hoje"),
    tile("🎖️",achievementsUnlocked()+"/"+achievementsMax(),"patamares"),
  );
  m.appendChild(tiles);

  // Contagem regressiva para as provas
  const ex=CFG.EXAMS||{};
  const dgt=(ds)=>{ if(!ds) return null; const t=new Date(ds+"T00:00:00"); if(isNaN(t)) return null; return Math.ceil((t-new Date())/86400000); };
  const d1=dgt(ex.N1), d2=dgt(ex.N2);
  const parts=[];
  if(d1!=null && d1>=0) parts.push(`<b>N1</b> em <b style="color:var(--warn)">${d1}</b> dia${d1===1?"":"s"}`);
  if(d2!=null && d2>=0) parts.push(`<b>N2</b> em <b style="color:var(--warn)">${d2}</b> dia${d2===1?"":"s"}`);
  if(parts.length){
    const cd=el("div","card mt"); cd.style.display="flex"; cd.style.alignItems="center"; cd.style.gap="12px";
    cd.innerHTML=`<div style="font-size:26px">📆</div><div class="small">Contagem regressiva — ${parts.join(" · ")}</div>`;
    m.appendChild(cd);
  }

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

  // Questão do dia
  const dqc=el("div","card mt"); dqc.style.borderColor= dailyDone()?"var(--good)":"var(--gold)";
  if(dailyDone()){
    dqc.innerHTML=`<div style="display:flex;align-items:center;gap:12px"><div style="font-size:26px">✅</div>
      <div class="small"><b>Questão do dia</b> concluída — ${S.dailyQ.correct?"você acertou! 🎉":"volte amanhã para a próxima."}</div></div>`;
  } else {
    dqc.innerHTML=`<div style="display:flex;align-items:center;gap:12px"><div style="font-size:26px">🎯</div>
      <div class="small" style="flex:1"><b>Questão do dia</b> — a mesma para toda a turma. Acerte e ganhe bônus!</div></div>`;
    const db=el("button","btn block mt","🎯 Responder (+50 XP se acertar)"); db.onclick=startDaily; dqc.appendChild(db);
  }
  m.appendChild(dqc);

  // Meta inteligente até a prova + divisão semanal
  const sg=smartDailyGoal();
  const dv=division(wk);
  const mg=el("div","card mt");
  let mgHtml=`<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <b>${dv.cur.em} Divisão ${dv.cur.n}</b><span class="muted small">${dv.next?`faltam ${dv.toNext} XP p/ ${dv.next.n}`:"divisão máxima!"}</span></div>`;
  if(sg){ const doneToday=(S.history[todayStr()]||{}).answered||0;
    mgHtml+=`<div class="small mt">🎯 Meta até a <b>${sg.phase}</b> (${sg.days} dias): <b style="color:var(--warn)">${sg.perDay}</b> questões/dia · ${sg.remaining} restantes</div>
      <div class="prog" style="margin-top:6px"><span style="width:${Math.min(100,Math.round(doneToday/Math.max(1,sg.perDay)*100))}%;background:var(--grad)"></span></div>
      <div class="muted small mt">Hoje: ${doneToday}/${sg.perDay} da meta</div>`;
  }
  mg.innerHTML=mgHtml; m.appendChild(mg);

  // Praticar
  m.appendChild(el("div","sectitle","Praticar"));
  const acts=el("div","btnrow");
  const b1=el("button","btn","🎲 Desafio rápido"); b1.onclick=()=>startSession({source:"studied",n:10}); acts.appendChild(b1);
  const b2=el("button","btn","⏱️ Modo Prova"); b2.onclick=()=>startSession({source:"studied",n:15,exam:true,minutes:20}); acts.appendChild(b2);
  m.appendChild(acts);
  const actsR=el("div","btnrow mt");
  const br=el("button","btn ghost","🧠 Revisão inteligente"); br.onclick=()=>startSmartReview(15); actsR.appendChild(br);
  const bv=el("button","btn ghost",`🎓 Revisão de véspera (${(nextExam()||{}).phase||"prova"})`); bv.onclick=startExamReview; actsR.appendChild(bv);
  m.appendChild(actsR);
  const acts2=el("div","btnrow mt");
  const ec=errorsCount(), bc=bookmarksCount();
  const b3=el("button","btn ghost",`🔁 Refazer erros${ec?` (${ec})`:""}`); b3.onclick=()=>startSession({source:"errors",n:20}); if(!ec)b3.style.opacity=".6"; acts2.appendChild(b3);
  const b4=el("button","btn ghost",`⭐ Marcadas${bc?` (${bc})`:""}`); b4.onclick=()=>startSession({source:"bookmarks",n:Math.max(bc,1)}); if(!bc)b4.style.opacity=".6"; acts2.appendChild(b4);
  m.appendChild(acts2);
  const acts2b=el("div","btnrow mt");
  const bp=el("button","btn ghost","🎯 Pegadinhas"); bp.onclick=startPegadinhas; acts2b.appendChild(bp);
  const bef=el("button","btn ghost","🧩 Cards dos meus erros"); bef.onclick=startErrorCards; acts2b.appendChild(bef);
  m.appendChild(acts2b);
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
      const pr=isPriority(disc,t.topic);
      const qlabel = t.qCount ? `${t.qCount} questõe${t.qCount>1?"s":""}` : "sem questões ainda";
      row.innerHTML=`<input type="checkbox" ${checked} style="width:20px;height:20px;accent-color:${d.color}">
        <div class="info"><div class="nm">${esc(t.topic)}</div><div class="muted small">${qlabel}${hasSummary(disc,t.topic)?" · 📖 resumo":""}</div></div>
        <button class="firebtn${pr?" on":""}" title="Marcar como 'cai muito'">🔥</button>
        <div class="rw" style="color:${t.studied?'var(--good)':'var(--muted2)'}">${t.studied?"estudado":""}</div>`;
      const cb=row.querySelector("input");
      cb.onchange=()=>{ setStudied(disc,t.topic,cb.checked); render(); };
      row.querySelector(".firebtn").onclick=(e)=>{ e.preventDefault(); togglePriority(disc,t.topic); render(); };
      card.appendChild(row);
    });
    m.appendChild(card);
  }

  const foot=el("div","center muted small mt","Dica: marque só o que já estudou de verdade. Conforme avança na matéria, volte aqui e libere mais temas. 💪");
  m.appendChild(foot);
}

/* ---------- Anotações pessoais + Resumos ---------- */
function hasSummary(disc,topic){ return !!SUMMARIES[tkey(disc,topic)]; }
function getNote(disc,topic){ return S.notes[tkey(disc,topic)]||""; }
function hasNote(disc,topic){ return !!(S.notes[tkey(disc,topic)]||"").trim(); }
function setNote(disc,topic,txt){ const k=tkey(disc,topic); if(txt.trim()) S.notes[k]=txt; else delete S.notes[k]; save(); }
let noteSel=null;
function noteEditor(disc,topic){
  const box=el("div","mt hidden");
  const ta=el("textarea","input"); ta.placeholder="Escreva sua anotação sobre "+topic+"..."; ta.value=getNote(disc,topic);
  ta.style.minHeight="70px";
  ta.onchange=()=>{ setNote(disc,topic,ta.value); toast("Anotação salva ✍️"); };
  box.appendChild(ta); return box;
}
function viewResumos(m){
  const total=Object.keys(DISCIPLINES).reduce((a,d)=>a+planTopics(d).length,0);
  const withS=Object.keys(SUMMARIES).length, withN=Object.keys(S.notes||{}).length;
  const head=el("div","card");
  head.innerHTML=`<h3>📖 Resumos & Anotações</h3>
    <p class="muted small">Toque num tema para abrir o resumo. Use <b>✍️ Anotar</b> para escrever suas próprias notas (salvas no seu aparelho).</p>
    <div class="muted small mt">${withS}/${total} temas com resumo · ${withN} anotações suas</div>`;
  m.appendChild(head);

  const hasLinks=(disc,topic)=>{ const l=(LINKS||{})[tkey(disc,topic)]; return l&&l.length; };
  for(const disc in DISCIPLINES){
    const d=DISCIPLINES[disc];
    const topics=planTopics(disc).filter(t=>hasSummary(disc,t.topic)||hasNote(disc,t.topic)||hasLinks(disc,t.topic));
    if(!topics.length) continue;
    const card=el("div","card mt");
    card.appendChild(el("div","",`<b>${d.icon} ${esc(d.name)}</b>`));
    topics.forEach(t=>{
      const has=hasSummary(disc,t.topic);
      const item=el("div"); item.style.cssText="border-top:1px solid var(--stroke);margin-top:10px;padding-top:10px";
      const btn=el("button","opt"); btn.style.marginBottom="0";
      btn.innerHTML=`${has?"📖":"📝"} <b>${esc(t.topic)}</b> ${hasNote(disc,t.topic)?"<span class='muted small'>✍️</span>":""}${hasLinks(disc,t.topic)?" <span class='muted small'>🔗</span>":""} <span class="pill" style="float:right">${t.phase}</span>`;
      const body=el("div","explain mt hidden"); if(has) body.innerHTML=esc(SUMMARIES[tkey(disc,t.topic)]).replace(/\n/g,"<br>");
      const noteBox=noteEditor(disc,t.topic);
      const nbtn=el("button","btn ghost sm mt","✍️ Anotar"); nbtn.onclick=()=>noteBox.classList.toggle("hidden");
      btn.onclick=()=>{ if(has) body.classList.toggle("hidden"); else noteBox.classList.toggle("hidden"); };
      item.appendChild(btn); if(has) item.appendChild(body);
      if(hasLinks(disc,t.topic)){ const lw=el("div","mt"); (LINKS[tkey(disc,t.topic)]||[]).forEach(lk=>{ const a=el("a","chip"); a.href=lk.url; a.target="_blank"; a.rel="noopener"; a.textContent="🔗 "+lk.label; a.style.marginRight="6px"; a.style.display="inline-block"; a.style.marginTop="6px"; lw.appendChild(a); }); item.appendChild(lw); }
      item.appendChild(nbtn); item.appendChild(noteBox);
      card.appendChild(item);
    });
    m.appendChild(card);
  }

  // Anotar qualquer tema
  const add=el("div","card mt");
  add.innerHTML=`<b>✍️ Anotar um tema</b><p class="muted small mt mb">Escolha qualquer tema do plano para escrever suas notas.</p>`;
  const sel=el("select","input");
  sel.appendChild(el("option","","— escolher tema —"));
  for(const disc in DISCIPLINES){
    const grp=document.createElement("optgroup"); grp.label=DISCIPLINES[disc].name;
    planTopics(disc).forEach(t=>{ const o=document.createElement("option"); o.value=tkey(disc,t.topic); o.textContent=t.topic; grp.appendChild(o); });
    sel.appendChild(grp);
  }
  sel.value=noteSel||"";
  sel.onchange=()=>{ noteSel=sel.value||null; render(); };
  add.appendChild(sel);
  if(noteSel){ const i=noteSel.indexOf("::"); const dsc=noteSel.slice(0,i), tp=noteSel.slice(i+2);
    const ed=noteEditor(dsc,tp); ed.classList.remove("hidden"); add.appendChild(ed); }
  m.appendChild(add);
}

/* ---------- QUIZ / PRÁTICA ---------- */
let quizTimerId=null;
function stopQuizTimer(){ if(quizTimerId){ clearInterval(quizTimerId); quizTimerId=null; } }
let qClockId=null;
function stopQClock(){ if(qClockId){ clearInterval(qClockId); qClockId=null; } }
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
  if(opts.phase && opts.phase!=="all") pool=pool.filter(q=>q.phase===opts.phase);
  if(opts.priorityOnly) pool=pool.filter(q=>isPriority(q.discipline,q.topic));
  if(!pool.length){
    if(opts.priorityOnly){ toast("Marque temas como 🔥 'cai muito' no Plano primeiro."); go("plan"); return; }
    if(opts.phase){ toast("Marque temas de "+opts.phase+" no Plano para liberar questões 📋"); go("plan"); return; }
    if(source==="errors"){ toast("Nenhum erro pendente — mandou bem! 🎉"); go("home"); return; }
    if(source==="bookmarks"){ toast("Você ainda não marcou questões (toque na ⭐)."); go("home"); return; }
    toast("Marque temas no Plano de Estudos para liberar questões 📋"); go("plan"); return;
  }
  const n=Math.min(opts.n||10, pool.length);
  if(!opts.exam) pool.sort((a,b)=>{ // prioriza temas "cai muito" e não-dominadas
    const pa=isPriority(a.discipline,a.topic)?1:0, pb=isPriority(b.discipline,b.topic)?1:0; if(pa!==pb) return pb-pa;
    const sa=S.seenQ[a.id]?.correct?1:0, sb=S.seenQ[b.id]?.correct?1:0; return sa-sb;});
  pool = shuffle(pool.slice(0, Math.max(n, Math.min(pool.length,n*2)))).slice(0,n);
  quiz={pool, idx:0, correctCount:0, answered:false,
    mode:opts.exam?"exam":(opts.mode||"quiz"), source, exam:!!opts.exam, total:pool.length,
    answers:new Array(pool.length).fill(null), scored:false,
    endAt: opts.exam ? Date.now()+(opts.minutes||15)*60000 : null };
  go("quiz");
}
// compat: cards de disciplina e "jogar de novo"
function startQuiz(disc, n, isSim=false){ startSession({source:"studied", disc, n, mode:isSim?"sim":"quiz"}); }
function trilhaStatus(disc,topic){
  const k=tkey(disc,topic); const tr=(S.trilha||{})[k]||{};
  const hasRes=hasSummary(disc,topic);
  const bt=(S.byTopic||{})[k]||{correct:0};
  const qn=QUESTIONS.filter(q=>q.discipline===disc&&q.topic===topic).length;
  const need=Math.max(1,Math.min(3, qn||3));
  const steps=[
    {id:"resumo", label: hasRes?"📖 Ler o resumo":"📖 Resumo (sem resumo ainda)", done: hasRes? !!tr.resumo : true},
    {id:"flash",  label:"🃏 Revisar flashcards", done: !!tr.flash},
    {id:"quest",  label:`❓ Acertar ${need} questões (${Math.min(bt.correct||0,need)}/${need})`, done:(bt.correct||0)>=need},
  ];
  return {steps, pct: Math.round(steps.filter(s=>s.done).length/steps.length*100)};
}
function trilhaModal(){
  const bg=el("div","modal-bg"); const mo=el("div","modal"); mo.style.textAlign="left"; mo.style.maxHeight="88vh"; mo.style.overflow="auto";
  mo.innerHTML=`<h3 style="text-align:center">🧭 Trilha de estudo</h3><p class="muted small">Domine um tema passo a passo: resumo → flashcards → questões.</p>`;
  const studied=[]; for(const disc in DISCIPLINES) planTopics(disc).forEach(t=>{ if(t.studied) studied.push({disc,topic:t.topic}); });
  const sel=el("select","input mt");
  if(!studied.length){ const o=document.createElement("option"); o.textContent="(marque temas no Plano primeiro)"; sel.appendChild(o); }
  studied.forEach(t=>{ const o=document.createElement("option"); o.value=tkey(t.disc,t.topic); o.textContent=DISCIPLINES[t.disc].icon+" "+t.topic; sel.appendChild(o); });
  mo.appendChild(sel);
  const body=el("div","mt"); mo.appendChild(body);
  const cl=el("button","btn ghost block mt","Fechar"); cl.onclick=()=>bg.remove(); mo.appendChild(cl);
  function renderSteps(){
    const k=sel.value; body.innerHTML=""; if(!k||k.indexOf("::")<0) return;
    const i=k.indexOf("::"), disc=k.slice(0,i), topic=k.slice(i+2);
    const st=trilhaStatus(disc,topic);
    body.innerHTML=`<div class="prog"><span style="width:${st.pct}%;background:var(--good)"></span></div><div class="muted small mt mb">${st.pct}% concluído${st.pct===100?" — tema dominado! 🎉":""}</div>`;
    st.steps.forEach(s=>{
      const row=el("div","mission");
      row.innerHTML=`<div class="em">${s.done?"✅":"⬜"}</div><div class="info"><div class="nm">${s.label}</div></div>`;
      if(s.id==="resumo" && hasSummary(disc,topic)){ const b=el("button","btn ghost sm","Ler"); b.onclick=()=>{ if(!S.trilha)S.trilha={}; S.trilha[k]=Object.assign(S.trilha[k]||{},{resumo:true}); save(); renderSteps(); const sm=el("div","explain mt"); sm.innerHTML=esc(SUMMARIES[k]).replace(/\n/g,"<br>"); body.appendChild(sm); }; row.appendChild(b); }
      else if(s.id==="flash"){ const b=el("button","btn ghost sm","Ir"); b.onclick=()=>{ if(!S.trilha)S.trilha={}; S.trilha[k]=Object.assign(S.trilha[k]||{},{flash:true}); save(); bg.remove(); go("flash"); }; row.appendChild(b); }
      else if(s.id==="quest"){ const qn=QUESTIONS.filter(q=>q.discipline===disc&&q.topic===topic).length; if(qn){ const b=el("button","btn ghost sm","Treinar"); b.onclick=()=>{ bg.remove(); startSession({source:"studied",disc,topic,n:Math.min(10,qn)}); }; row.appendChild(b); } }
      body.appendChild(row);
    });
  }
  sel.onchange=renderSteps; renderSteps();
  bg.appendChild(mo); bg.onclick=e=>{if(e.target===bg)bg.remove();}; document.body.appendChild(bg);
}
function teachModal(){
  const bg=el("div","modal-bg"); const mo=el("div","modal"); mo.style.textAlign="left";
  mo.innerHTML=`<h3 style="text-align:center">👩‍🏫 Ensine um colega</h3><p class="muted small">Explicar com suas palavras é a melhor forma de fixar. Escreva a explicação de um tema como se ensinasse alguém.</p>`;
  mo.appendChild(el("div","small muted mt","Tema:"));
  const sel=el("select","input");
  const studiedTopics=[];
  for(const disc in DISCIPLINES) planTopics(disc).forEach(t=>{ if(t.studied) studiedTopics.push({disc, topic:t.topic}); });
  if(!studiedTopics.length){ const o=document.createElement("option"); o.textContent="(marque temas no Plano primeiro)"; sel.appendChild(o); }
  studiedTopics.forEach(t=>{ const o=document.createElement("option"); o.value=tkey(t.disc,t.topic); o.textContent=DISCIPLINES[t.disc].icon+" "+t.topic; sel.appendChild(o); });
  mo.appendChild(sel);
  const ta=el("textarea","input mt"); ta.style.minHeight="120px"; ta.placeholder="Explique o tema com suas palavras..."; mo.appendChild(ta);
  const upd=()=>{ const k=sel.value; ta.value=(S.taught&&S.taught[k])||""; }; sel.onchange=upd; upd();
  let share=false;
  if(supaOn()){ const sh=el("label","mission mt"); sh.style.cursor="pointer"; sh.innerHTML=`<input type="checkbox" style="width:20px;height:20px"><div class="info"><div class="nm">Publicar como dica no fórum de Dúvidas</div></div>`; sh.querySelector("input").onchange=(e)=>share=e.target.checked; mo.appendChild(sh); }
  const sv=el("button","btn block mt","💾 Salvar explicação");
  sv.onclick=async()=>{ if(!sel.value||!ta.value.trim()){ toast("Escolha um tema e escreva a explicação."); return; }
    const k=sel.value, first=!(S.taught&&S.taught[k]); if(!S.taught)S.taught={}; S.taught[k]=ta.value;
    if(first) addXP(20); save(); renderTopbar(); checkBadges();
    const i=k.indexOf("::"), disc=k.slice(0,i), topic=k.slice(i+2);
    if(share) await muralPost("💡 Dica sobre "+topic+":\n\n"+ta.value, {discipline:disc, kind:"recado"});
    toast(first?"Explicação salva! +20 XP 👩‍🏫":"Explicação atualizada!"); bg.remove(); };
  const cl=el("button","btn ghost block mt","Fechar"); cl.onclick=()=>bg.remove();
  mo.append(sv,cl); bg.appendChild(mo); bg.onclick=e=>{if(e.target===bg)bg.remove();}; document.body.appendChild(bg);
}
function examConfigModal(){
  const bg=el("div","modal-bg"); const mo=el("div","modal"); mo.style.textAlign="left";
  mo.innerHTML=`<h3 style="text-align:center">🎯 Simulado personalizado</h3><p class="muted small">Monte como a prova real: nº de questões, tempo e conteúdo.</p>`;
  function num(label,val,min,max){ const w=el("div","mt"); w.innerHTML=`<div class="small muted">${label}</div>`; const i=el("input","input"); i.type="number"; i.min=min;i.max=max;i.value=val; w.appendChild(i); mo.appendChild(w); return i; }
  const ni=num("Nº de questões",20,3,60);
  const mi=num("Tempo (minutos)",30,3,240);
  mo.appendChild(el("div","small muted mt","Prova (fase):"));
  const ph=el("select","input"); [["all","Todas"],["N1","N1 (1ª prova)"],["N2","N2 (2ª prova)"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;ph.appendChild(o);}); mo.appendChild(ph);
  mo.appendChild(el("div","small muted mt","Matéria:"));
  const dsel=el("select","input"); const oa=document.createElement("option"); oa.value="all"; oa.textContent="Todas"; dsel.appendChild(oa); for(const d in DISCIPLINES){const o=document.createElement("option");o.value=d;o.textContent=DISCIPLINES[d].name;dsel.appendChild(o);} mo.appendChild(dsel);
  const go1=el("button","btn block mt","▶ Começar simulado"); go1.onclick=()=>{ bg.remove(); startSession({source:"studied", disc:dsel.value, phase:ph.value, n:parseInt(ni.value)||20, exam:true, minutes:parseInt(mi.value)||30}); };
  const cl=el("button","btn ghost block mt","Cancelar"); cl.onclick=()=>bg.remove();
  mo.append(go1,cl); bg.appendChild(mo); bg.onclick=e=>{if(e.target===bg)bg.remove();}; document.body.appendChild(bg);
}

// ---- Duelo (assíncrono, via código) ----
function startFromQuestions(qs, duel){
  if(!qs.length){ toast("Sem questões para o duelo."); return; }
  quiz={pool:qs, idx:0, correctCount:0, answered:false, mode:"quiz", source:"duel", exam:false,
    total:qs.length, answers:new Array(qs.length).fill(null), scored:false, endAt:null, duel};
  go("quiz");
}
function startDuelCreate(n){
  const pool=buildPool("studied","all");
  if(!pool.length){ toast("Libere temas no Plano para criar um duelo 📋"); go("plan"); return; }
  startFromQuestions(shuffle(pool).slice(0, Math.min(n||8, pool.length)), {role:"create"});
}
function startDuelAccept(code){
  let data; try{ data=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); }catch(e){ toast("Código de duelo inválido."); return; }
  if(!data || !Array.isArray(data.qs)){ toast("Código de duelo inválido."); return; }
  const qs=data.qs.map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean);
  if(!qs.length){ toast("As questões do duelo não foram encontradas (versões diferentes?)."); return; }
  if(qs.length<data.qs.length) toast("Aviso: algumas questões do duelo não existem aqui.");
  startFromQuestions(qs, {role:"accept", by:data.by||"Colega", oppC:data.c||0, oppN:data.n||qs.length});
}

// ---- Revisão inteligente (curva do esquecimento) ----
function reviewScore(q){
  if(S.errors[q.id]) return 1000;                     // erro pendente = prioridade máxima
  const s=S.seenQ[q.id];
  if(!s || !s.correct) return 500;                    // nunca dominada
  const days = s.last ? daysBetween(s.last, todayStr()) : 30;
  return Math.min(400, days*10);                      // dominada há mais tempo = revisar
}
function startSmartReview(n){
  const pool=buildPool("studied","all");
  if(!pool.length){ toast("Libere temas no Plano para revisar 📋"); go("plan"); return; }
  const ranked=pool.slice().sort((a,b)=>reviewScore(b)-reviewScore(a)).slice(0, Math.min(n||15, pool.length));
  quiz={pool:shuffle(ranked), idx:0, correctCount:0, answered:false, mode:"quiz", source:"smart", exam:false,
    total:ranked.length, answers:new Array(ranked.length).fill(null), scored:false, endAt:null};
  go("quiz");
}
// ---- Questão do dia (igual para todos, por data) ----
function dailyQuestion(){ return QUESTIONS[Math.abs(hash(todayStr()))%QUESTIONS.length]; }
function dailyDone(){ return S.dailyQ && S.dailyQ.date===todayStr() && S.dailyQ.done; }
function startDaily(){
  const dq=dailyQuestion();
  quiz={pool:[dq], idx:0, correctCount:0, answered:false, mode:"quiz", source:"daily", exam:false,
    total:1, answers:[null], scored:false, endAt:null, daily:true};
  go("quiz");
}
// ---- Próxima prova / metas inteligentes / divisões ----
function nextExam(){
  const ex=CFG.EXAMS||{}; const dd=(s)=>{ if(!s)return null; const t=new Date(s+"T00:00:00"); if(isNaN(t))return null; return Math.ceil((t-new Date())/86400000); };
  const n1=dd(ex.N1), n2=dd(ex.N2);
  if(n1!=null && n1>=0) return {phase:"N1", days:n1};
  if(n2!=null && n2>=0) return {phase:"N2", days:n2};
  return null;
}
function smartDailyGoal(){
  const ne=nextExam(); if(!ne) return null;
  const remaining=unlockedQuestions(null).filter(q=>q.phase===ne.phase && !(S.seenQ[q.id]&&S.seenQ[q.id].correct)).length;
  return {phase:ne.phase, days:ne.days, remaining, perDay:Math.ceil(remaining/Math.max(1,ne.days))};
}
const DIVISIONS=[{n:"Bronze",em:"🥉",min:0},{n:"Prata",em:"🥈",min:150},{n:"Ouro",em:"🥇",min:400},{n:"Platina",em:"🏆",min:800},{n:"Diamante",em:"💠",min:1400},{n:"Mestre",em:"👑",min:2200}];
function division(xp){ let i=0; for(let k=0;k<DIVISIONS.length;k++) if(xp>=DIVISIONS[k].min) i=k; return {cur:DIVISIONS[i], next:DIVISIONS[i+1]||null, toNext:DIVISIONS[i+1]?DIVISIONS[i+1].min-xp:0}; }
// ---- Revisão de véspera (fase da próxima prova) ----
function startExamReview(){
  const ne=nextExam(); const phase=ne?ne.phase:"N1";
  const pool=unlockedQuestions(null).filter(q=>q.phase===phase);
  if(!pool.length){ toast("Libere temas de "+phase+" no Plano 📋"); go("plan"); return; }
  const ranked=pool.slice().sort((a,b)=>reviewScore(b)-reviewScore(a)).slice(0,20);
  quiz={pool:shuffle(ranked), idx:0, correctCount:0, answered:false, mode:"exam", source:"vespera", exam:true,
    total:ranked.length, answers:new Array(ranked.length).fill(null), scored:false, endAt:Date.now()+25*60000};
  go("quiz");
}
// ---- Pegadinhas (difíceis que você errou) ----
function startPegadinhas(){
  const all=QUESTIONS.filter(q=>S.errors[q.id] && q.difficulty===3);
  if(!all.length){ toast("Nenhuma pegadinha por ora (questões difíceis que você errou)."); return; }
  const pool=shuffle(all).slice(0,15);
  quiz={pool, idx:0, correctCount:0, answered:false, mode:"quiz", source:"pegadinhas", exam:false,
    total:pool.length, answers:new Array(pool.length).fill(null), scored:false, endAt:null};
  go("quiz");
}
// ---- Flashcards automáticos dos erros ----
function startErrorCards(){
  const cards=QUESTIONS.filter(q=>S.errors[q.id]).map(q=>({id:"e-"+q.id, discipline:q.discipline,
    front:q.question, back:"✅ "+q.options[q.answer]+"\n\n"+q.explanation, auto:true}));
  if(!cards.length){ toast("Sem erros pendentes — mandou bem! 🎉"); return; }
  route="flash"; flash={pool:shuffle(cards), idx:0, flipped:false, auto:true}; render(); window.scrollTo(0,0);
}

function viewQuiz(m){
  if(quiz && !quiz.startedAt) quiz.startedAt=Date.now();
  if(!quiz){
    const head=el("div","card");
    head.innerHTML=`<h3>❓ Questões</h3><p class="muted small">Escolha um modo de treino. As questões vêm dos temas que você marcou no Plano.</p>`;
    m.appendChild(head);
    const ec=errorsCount(), bc=bookmarksCount();
    const rows=[
      ["🎲 Desafio rápido (10)", ()=>startSession({source:"studied",n:10}), false],
      ["⏱️ Modo Prova (15, cronometrado)", ()=>startSession({source:"studied",n:15,exam:true,minutes:20}), false],
      ["🎯 Simulado personalizado (prova real)", examConfigModal, false],
      ["🧠 Revisão inteligente", ()=>startSmartReview(15), true],
      [`🎓 Revisão de véspera (${(nextExam()||{}).phase||"prova"})`, startExamReview, true],
      [`🔁 Refazer erros${ec?` (${ec})`:""}`, ()=>startSession({source:"errors",n:20}), true],
      [`⭐ Marcadas${bc?` (${bc})`:""}`, ()=>startSession({source:"bookmarks",n:Math.max(bc,1)}), true],
      ["🎯 Pegadinhas", startPegadinhas, true],
      [`🔥 Focar nos que caem muito${priorityCount()?` (${priorityCount()})`:""}`, ()=>startSession({source:"studied",priorityOnly:true,n:15}), true],
      ["🧭 Trilha de estudo (guiada)", trilhaModal, true],
      ["👩‍🏫 Ensine um tema (fixa muito!)", teachModal, true],
    ];
    rows.forEach(([lb,fn,ghost])=>{ const b=el("button","btn"+(ghost?" ghost":"")+" block mt",lb); b.onclick=fn; m.appendChild(b); });
    return;
  }
  if(quiz.idx>=quiz.pool.length){ return quizResult(m); }
  const q=quiz.pool[quiz.idx];
  const d=DISCIPLINES[q.discipline];
  const dl=["","Base","Intermediária","Desafio"][q.difficulty];

  if(quiz.qShownIdx!==quiz.idx){ quiz.qStart=Date.now(); quiz.qShownIdx=quiz.idx; }
  const head=el("div","card");
  const marked=!!S.bookmarks[q.id];
  head.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
    <span class="pill">${d.icon} ${esc(d.name)} · ${q.phase}</span>
    <span style="display:flex;gap:8px;align-items:center">
      <span class="diffbadge d${q.difficulty}">${dl}</span>
      <span class="timer" id="qclock" title="tempo nesta questão">⏱ 0:00</span>
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

  // relógio da questão (tempo gasto nesta questão)
  const qc=()=>{ const e0=$("#qclock"); if(e0){ const s=Math.max(0,Math.floor((Date.now()-(quiz.qStart||Date.now()))/1000)); e0.textContent="⏱ "+Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); } };
  qc(); qClockId=setInterval(qc,1000);

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
  if(quiz.daily && !dailyDone()){ const bonus=correct?50:15; addXP(bonus); S.dailyQ={date:todayStr(),done:true,correct};
    ex.innerHTML+=`<div class="mt" style="color:var(--gold);font-weight:700">🎯 Questão do dia! +${bonus} XP</div>`; }
  if(!correct){
    const rz=el("div","mt"); rz.innerHTML=`<div class="small muted mb">Por que você errou? (ajuda a ver seus padrões)</div>`;
    const rrow=el("div","chiprow");
    [["sabia","Não sabia"],["conceito","Troquei conceito"],["atencao","Desatenção"]].forEach(([k,lb])=>{
      const c=el("button","chip",lb); c.onclick=()=>{ S.errReasons[k]=(S.errReasons[k]||0)+1; save(); [...rrow.children].forEach(x=>x.classList.remove("on")); c.classList.add("on"); toast("Anotado 👍"); };
      rrow.appendChild(c);
    });
    rz.appendChild(rrow); body.appendChild(rz);
  }
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
  // tempo gasto (limitado a 3 min/questão para evitar inflar)
  if(!quiz.timeAdded && quiz.startedAt){
    const mins=Math.min(quiz.total*3, Math.round((Date.now()-quiz.startedAt)/60000));
    if(mins>0){ S.stats.quizMin=(S.stats.quizMin||0)+mins; const h=histToday(); h.quizMin=(h.quizMin||0)+mins; }
    quiz.timeAdded=true; save();
  }
  // pontua o modo prova ao finalizar
  if(quiz.exam && !quiz.scored){
    quiz.correctCount=0;
    quiz.pool.forEach((q,idx)=>{ const sel=quiz.answers[idx]; const ok=sel===q.answer;
      recordAnswer(q, ok); if(ok) quiz.correctCount++; bumpMission("m_q",1); if(ok) bumpMission("m_acc",1); });
    quiz.scored=true; save(); renderTopbar(); checkBadges(); syncOnline();
  }
  if(quiz.challenge && quiz.scored && !quiz.chSubmitted){ challengeSubmit(quiz.challenge.id, quiz.correctCount, quiz.total); quiz.chSubmitted=true; }
  const pct=Math.round(quiz.correctCount/quiz.total*100);
  if((quiz.mode==="sim"||quiz.exam) && quiz.total>=8 && pct===100){ S.flags.perfectQuiz=true; S.stats.perfectQuizzes=(S.stats.perfectQuizzes||0)+1; save(); checkBadges(); }

  const c=el("div","card center");
  const em = pct>=80?"🏆":pct>=60?"👏":"📖";
  const avgSec = quiz.startedAt ? Math.round((Date.now()-quiz.startedAt)/1000/Math.max(1,quiz.total)) : 0;
  c.innerHTML=`<div style="font-size:52px">${em}</div>
    <h2>${quiz.correctCount}/${quiz.total} acertos (${pct}%)</h2>
    <p class="muted">${pct>=80?"Excelente! Você dominou este bloco.":pct>=60?"Bom trabalho — revise os erros abaixo.":"Continue treinando, o próximo vai melhor!"}</p>
    ${avgSec?`<div class="pill">⏱ ${avgSec}s por questão em média</div>`:""}`;
  const row=el("div","btnrow center mt");row.style.justifyContent="center";
  if(!quiz.duel && !quiz.challenge){
    const b1=el("button","btn","🔁 De novo");b1.onclick=()=>startSession({source:quiz.source, n:quiz.total, exam:quiz.exam, minutes: quiz.exam?15:0});
    row.appendChild(b1);
    if(quiz.answers.some((a,idx)=>a!==quiz.pool[idx].answer)){
      const be=el("button","btn ghost","🔁 Refazer só os erros");be.onclick=()=>startSession({source:"errors",n:20});
      row.appendChild(be);
    }
  }
  const b2=el("button","btn ghost","🏠 Início");b2.onclick=()=>{quiz=null;go("home");};
  row.append(b2);
  c.appendChild(row);
  m.appendChild(c);

  // ---- Placar do desafio ----
  if(quiz.challenge){
    const cb=el("div","card mt");
    cb.innerHTML=`<h3>🏆 ${esc(quiz.challenge.title||"Desafio")}</h3><div class="muted small">Placar da turma:</div>`;
    const boardc=el("div","mt"); boardc.innerHTML=`<div class="muted small">Carregando placar...</div>`;
    cb.appendChild(boardc); m.appendChild(cb);
    challengeBoard(quiz.challenge.id).then(rows=>{
      boardc.innerHTML="";
      if(!rows){ boardc.innerHTML=`<div class="muted small">Não consegui carregar o placar.</div>`; return; }
      rows.forEach((r,i)=>{
        const isMe=r.player_id===S.profile.id;
        const rr=el("div","rank"+(isMe?" me":"")+(i<3?" top"+(i+1):""));
        rr.innerHTML=`<div class="pos">${i+1}º</div><div class="av">${esc((r.name||"?").charAt(0).toUpperCase())}</div>
          <div class="info"><div class="nm">${esc(r.name||"Jogador")}${isMe?" (você)":""}</div></div>
          <div class="xp">${r.correct}/${r.total}</div>`;
        boardc.appendChild(rr);
      });
    });
  }

  // ---- Duelo ----
  if(quiz.duel){
    const dcard=el("div","card mt center");
    if(quiz.duel.role==="create"){
      const code=btoa(unescape(encodeURIComponent(JSON.stringify({v:1, by:S.profile.name||"Jogador", qs:quiz.pool.map(q=>q.id), c:quiz.correctCount, n:quiz.total}))));
      dcard.innerHTML=`<div style="font-size:36px">⚔️</div><h3>Desafio criado!</h3>
        <p class="muted small">Você fez <b>${quiz.correctCount}/${quiz.total}</b>. Envie o código abaixo para um colega — ele responde as MESMAS questões e o app diz quem venceu.</p>`;
      const ta=el("textarea","input"); ta.readOnly=true; ta.value=code; ta.onclick=()=>{ta.select();document.execCommand&&document.execCommand("copy");toast("Código do duelo copiado!");};
      dcard.appendChild(ta);
    } else {
      // aceitou: compara
      const my=quiz.correctCount, their=quiz.duel.oppC||0;
      const res = my>their?"win":my<their?"lose":"draw";
      if(!quiz.duelSaved){ S.duels.unshift({opp:quiz.duel.by||"Colega", my, their, res, date:todayStr()}); S.duels=S.duels.slice(0,20); if(res==="win") addXP(20); quiz.duelSaved=true; save(); renderTopbar(); checkBadges(); }
      const em = res==="win"?"🏆":res==="lose"?"😔":"🤝";
      const msg = res==="win"?"Você venceu!":res==="lose"?"Você perdeu — bola pra frente!":"Empate!";
      dcard.innerHTML=`<div style="font-size:40px">${em}</div><h3>${msg}</h3>
        <div style="font-size:22px;font-weight:800;margin:8px 0">Você ${my} × ${their} ${esc(quiz.duel.by||"Colega")}</div>
        ${res==="win"?'<p class="muted small">+20 XP de bônus de vitória 🎉</p>':""}`;
    }
    m.appendChild(dcard);
  }

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
    if(supaOn()){ const rb=el("button","btn ghost sm mt","⚠️ Reportar erro nesta questão"); rb.onclick=()=>reportQuestion(q.id); item.appendChild(rb); }
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
  head.innerHTML=`<div style="display:flex;justify-content:space-between"><span class="pill">${d.icon} ${esc(d.name)}</span><span class="muted small">${flash.idx+1}/${flash.pool.length} · ${flash.auto?"meus erros":"vencidos"}</span></div>`;
  m.appendChild(head);

  const fc=el("div","flash mt"+(flash.flipped?" flipped":""));
  fc.innerHTML=`<div class="flash-inner">
    <div class="flash-face"><span class="hint">${flash.auto?"Questão que errei":"Pergunta"}</span><div class="txt" style="${flash.auto?"font-size:16px":""}">${esc(card.front)}</div><span class="hint" style="top:auto;bottom:14px;left:16px">toque para virar</span></div>
    <div class="flash-face flash-back"><span class="hint">Resposta</span><div class="txt" style="${flash.auto?"font-size:15px;white-space:pre-line":""}">${esc(card.back)}</div></div></div>`;
  fc.onclick=()=>{ flash.flipped=!flash.flipped; render(); };
  m.appendChild(fc);

  if(flash.flipped && flash.auto){
    const nx=el("button","btn block mt", flash.idx+1>=flash.pool.length?"Concluir":"Próximo →");
    nx.onclick=()=>{ S.stats.reviews=(S.stats.reviews||0)+1; touchStreak(); addXP(2); save(); renderTopbar(); flash.idx++; flash.flipped=false; render(); window.scrollTo(0,0); };
    m.appendChild(nx);
  } else if(flash.flipped){
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

/* ---------- DÚVIDAS (fórum por matéria) ---------- */
let dvdFilter="all";
function viewDuvidas(m){
  const head=el("div","card");
  head.innerHTML=`<h3>💬 Dúvidas da turma</h3><p class="muted small">Poste dúvidas por matéria e responda os colegas. O autor marca ✅ quando for resolvida.</p>`;
  m.appendChild(head);
  if(!supaOn()){ m.appendChild(el("div","card mt muted small","As dúvidas usam a nuvem (Supabase), que não está configurada.")); return; }

  // Nova dúvida
  const form=el("div","card mt");
  form.appendChild(el("b",null,"Nova dúvida / recado"));
  const selD=el("select","input mt"); const oa=document.createElement("option"); oa.value=""; oa.textContent="Matéria (opcional)"; selD.appendChild(oa);
  for(const d in DISCIPLINES){ const o=document.createElement("option"); o.value=d; o.textContent=DISCIPLINES[d].name; selD.appendChild(o); }
  form.appendChild(selD);
  const ta=el("textarea","input mt"); ta.placeholder="Escreva sua dúvida ou recado..."; form.appendChild(ta);
  const kindRow=el("div","chiprow mt"); let kind="duvida";
  const kd=el("button","chip on","❓ Dúvida"), kr=el("button","chip","📢 Recado");
  kd.onclick=()=>{kind="duvida";kd.classList.add("on");kr.classList.remove("on");};
  kr.onclick=()=>{kind="recado";kr.classList.add("on");kd.classList.remove("on");};
  kindRow.append(kd,kr); form.appendChild(kindRow);
  const pb=el("button","btn sm mt","📨 Publicar");
  pb.onclick=async()=>{ if(!ta.value.trim())return; pb.disabled=true; const ok=await muralPost(ta.value,{discipline:selD.value||null, kind}); pb.disabled=false; if(ok){ toast("Publicado! 💬"); render(); } else toast("Falha ao publicar (rodou o SQL das dúvidas?)."); };
  form.appendChild(pb); m.appendChild(form);

  // Filtro por matéria
  const fr=el("div","chiprow mt");
  const mk=(val,lb)=>{ const c=el("button","chip"+(dvdFilter===val?" on":""),lb); c.onclick=()=>{ dvdFilter=val; render(); }; return c; };
  fr.appendChild(mk("all","Todas"));
  for(const d in DISCIPLINES) fr.appendChild(mk(d, DISCIPLINES[d].icon));
  m.appendChild(fr);

  // Lista
  const listc=el("div","mt"); listc.innerHTML=`<div class="muted small">Carregando dúvidas...</div>`; m.appendChild(listc);
  muralFetch(dvdFilter).then(posts=>{
    listc.innerHTML="";
    if(!posts){ listc.innerHTML=`<div class="card muted small">Não consegui carregar (rode o SQL das dúvidas no Supabase).</div>`; return; }
    if(!posts.length){ listc.innerHTML=`<div class="card muted small">Nenhuma dúvida ${dvdFilter!=="all"?"nessa matéria ":""}ainda. Seja o primeiro! 👋</div>`; return; }
    posts.forEach(p=>{
      const d=p.discipline && DISCIPLINES[p.discipline];
      const when=(p.created_at||"").slice(0,10);
      const badge = p.kind==="recado" ? `<span class="pill">📢 recado</span>` : `<span class="pill">❓ dúvida</span>`;
      const res = p.resolved ? `<span class="pill" style="color:var(--good)">✅ resolvido</span>` : "";
      const it=el("div","card mt");
      it.innerHTML=`<div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;align-items:center">
          <div style="font-weight:700">${esc(p.name||"Anônimo")} <span class="muted small">· ${esc(when)}</span></div>
          <div>${d?`<span class="pill">${d.icon}</span> `:""}${badge} ${res}</div></div>
        <div class="small mt">${esc(p.text||"")}</div>`;
      const rbox=el("div","mt hidden");
      const rbtn=el("button","btn ghost sm mt","💬 Respostas");
      async function loadReplies(){
        const reps=await repliesFetch(p.id); rbox.innerHTML="";
        (reps||[]).forEach(r=>{ const rr=el("div","small"); rr.style.cssText="border-left:2px solid var(--stroke);padding:4px 0 4px 8px;margin-top:6px"; rr.innerHTML=`<b>${esc(r.name||"Anônimo")}:</b> ${esc(r.text||"")}`; rbox.appendChild(rr); });
        const rta=el("input","input mt"); rta.placeholder="Responder..."; rbox.appendChild(rta);
        const rpb=el("button","btn ghost sm mt","Responder"); rpb.onclick=async()=>{ if(!rta.value.trim())return; rpb.disabled=true; const ok=await replyPost(p.id, rta.value); rpb.disabled=false; if(ok){ rta.value=""; toast("Respondido!"); loadReplies(); } }; rbox.appendChild(rpb);
        if(p.author_id===S.profile.id){ const rv=el("button","btn ghost sm mt", p.resolved?"↩️ Reabrir":"✅ Marcar resolvido"); rv.style.marginLeft="6px"; rv.onclick=async()=>{ await muralResolve(p.id, !p.resolved); toast("Atualizado!"); render(); }; rbox.appendChild(rv); }
      }
      rbtn.onclick=async()=>{ if(!rbox.classList.contains("hidden")){ rbox.classList.add("hidden"); return; } rbox.classList.remove("hidden"); rbox.innerHTML=`<div class="muted small">...</div>`; await loadReplies(); };
      it.append(rbtn, rbox); listc.appendChild(it);
    });
  });
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

  // Progresso da turma
  m.appendChild(el("div","sectitle","Progresso da turma"));
  const turmaBox=el("div"); turmaBox.id="turmabox";
  renderTurma(turmaBox, localRanking());
  m.appendChild(turmaBox);

  // ---- Desafios da turma ----
  if(supaOn()){
    const chc=el("div","card mt");
    chc.innerHTML=`<h3>🏆 Desafios da turma</h3><p class="muted small mb">Todos jogam as MESMAS questões e disputam o placar. Crie um e chame a galera!</p>`;
    const cbtn=el("button","btn sm","➕ Criar desafio"); cbtn.onclick=challengeCreateModal; chc.appendChild(cbtn);
    const clist=el("div","mt"); clist.innerHTML=`<div class="muted small">Carregando desafios...</div>`; chc.appendChild(clist);
    m.appendChild(chc);
    challengesFetch().then(list=>{
      clist.innerHTML="";
      if(!list){ clist.innerHTML=`<div class="muted small">Não consegui carregar (o SQL do desafio já foi rodado?).</div>`; return; }
      if(!list.length){ clist.innerHTML=`<div class="muted small">Nenhum desafio ativo. Crie o primeiro! 👆</div>`; return; }
      list.forEach(ch=>{
        let n=0; try{ n=JSON.parse(ch.question_ids).length; }catch(e){}
        const endsTxt = ch.ends_at ? ("até "+new Date(ch.ends_at).toLocaleDateString("pt-BR")) : "";
        const it=el("div","card mt"); it.style.padding="12px";
        it.innerHTML=`<div style="font-weight:800">${esc(ch.title||"Desafio")}</div>
          <div class="muted small">${n} questões · por ${esc(ch.created_by_name||"alguém")}${endsTxt?" · "+endsTxt:""}</div>`;
        const rr=el("div","btnrow mt");
        const pl=el("button","btn sm","▶ Jogar"); pl.onclick=()=>startChallenge(ch); rr.appendChild(pl);
        const board=el("div","mt hidden");
        const bd=el("button","btn ghost sm","🏅 Placar");
        bd.onclick=async()=>{ if(!board.classList.contains("hidden")){ board.classList.add("hidden"); return; }
          board.classList.remove("hidden"); board.innerHTML=`<div class="muted small">...</div>`;
          const rows=await challengeBoard(ch.id); board.innerHTML="";
          if(!rows||!rows.length){ board.innerHTML=`<div class="muted small">Ninguém jogou ainda.</div>`; return; }
          rows.forEach((r,i)=>{ const line=el("div","small"); line.textContent=`${i+1}º  ${r.name||"Jogador"} — ${r.correct}/${r.total}`; if(r.player_id===S.profile.id) line.style.color="var(--accent)"; board.appendChild(line); }); };
        rr.appendChild(bd); it.appendChild(rr); it.appendChild(board);
        clist.appendChild(it);
      });
    });
  }

  // ---- Duelo ----
  const duel=el("div","card mt");
  duel.innerHTML=`<h3>⚔️ Duelo</h3><p class="muted small mb">Desafie um colega: vocês respondem as MESMAS questões e o app diz quem venceu. Funciona por código (sem servidor).</p>`;
  const drow=el("div","btnrow");
  const dc=el("button","btn","⚔️ Criar desafio (8 questões)"); dc.onclick=()=>startDuelCreate(8); drow.appendChild(dc);
  duel.appendChild(drow);
  const dinp=el("textarea","input"); dinp.placeholder="Cole aqui o código de duelo de um colega...";
  duel.appendChild(el("div","small muted mt","Aceitar um desafio:"));
  duel.appendChild(dinp);
  const da=el("button","btn ghost sm mt","🎯 Aceitar e jogar"); da.onclick=()=>{ if(dinp.value.trim()) startDuelAccept(dinp.value); }; duel.appendChild(da);
  if(S.duels && S.duels.length){
    duel.appendChild(el("div","small muted mt","Últimos duelos:"));
    S.duels.slice(0,5).forEach(x=>{
      const em=x.res==="win"?"🏆":x.res==="lose"?"😔":"🤝";
      duel.appendChild(el("div","small",`${em} vs ${esc(x.opp)} — ${x.my} × ${x.their}`));
    });
  }
  m.appendChild(duel);


  if(online()){
    fetchOnline().then(rows=>{ if(rows&&rows.length){
      if(!rows.find(r=>r.id===S.profile.id)) rows.push(myRow());
      // mistura com colegas locais que ainda não publicaram
      S.friends.forEach(f=>{ if(!rows.find(r=>r.id===f.id)) rows.push(f); });
      rows.sort((a,b)=>rankKey(b)-rankKey(a)); renderRankList(list,rows); renderTurma(turmaBox,rows);
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
function renderTurma(container, rows){
  container.innerHTML="";
  if(!rows || rows.length<=1){ container.appendChild(el("div","card muted small","Você ainda está sozinho aqui. Convide os colegas (código de jogador ou duelo, abaixo) para acompanhar o progresso da turma. 👥")); return; }
  const planTotal=studiedCount().total||82;
  const totXp=rows.reduce((a,r)=>a+(r.xp||0),0);
  const accs=rows.filter(r=>(r.answered||0)>0);
  const avgAcc=accs.length?Math.round(accs.reduce((a,r)=>a+(r.accuracy||0),0)/accs.length):0;
  const maxStreak=Math.max(0,...rows.map(r=>r.streak||0));
  const totQ=rows.reduce((a,r)=>a+(r.answered||0),0);
  const agg=el("div","card");
  agg.innerHTML=`<div class="tiles">
     <div class="tile"><div class="em">👥</div><div class="big">${rows.length}</div><div class="lbl">colegas</div></div>
     <div class="tile"><div class="em">⭐</div><div class="big">${totXp}</div><div class="lbl">XP da turma</div></div>
     <div class="tile"><div class="em">🎯</div><div class="big">${avgAcc}%</div><div class="lbl">acerto médio</div></div>
     <div class="tile"><div class="em">🔥</div><div class="big">${maxStreak}</div><div class="lbl">maior streak</div></div>
     <div class="tile"><div class="em">❓</div><div class="big">${totQ}</div><div class="lbl">questões</div></div>
   </div>`;
  container.appendChild(agg);
  rows.forEach(r=>{
    const isMe=r.id===S.profile.id, li=levelInfo(r.xp||0);
    const planPct=Math.min(100,Math.round((r.studied||0)/planTotal*100));
    const initial=(r.name||"?").trim().charAt(0).toUpperCase()||"?";
    const c=el("div","card mt"); if(isMe) c.style.borderColor="var(--accent)";
    c.innerHTML=`<div style="display:flex;align-items:center;gap:12px">
        <div style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-weight:800;background:var(--grad);color:#fff;flex:0 0 auto">${esc(initial)}</div>
        <div style="flex:1;min-width:0"><div style="font-weight:800">${esc(r.name||"Jogador")}${isMe?" (você)":""}</div>
          <div class="muted small">Nv ${r.level} · ${esc(r.title||"")}</div></div>
        <div style="text-align:right"><div style="font-weight:800;color:var(--gold)">${r.xp||0} XP</div><div class="muted small">🔥${r.streak||0} · ${r.weeklyXp||0}/sem</div></div>
      </div>
      <div class="small muted mt">Nível (rumo ao próximo)</div>
      <div class="prog"><span style="width:${li.pct}%;background:var(--grad)"></span></div>
      <div class="small muted mt">Plano de estudos: ${r.studied||0}/${planTotal} temas</div>
      <div class="prog"><span style="width:${planPct}%;background:var(--good)"></span></div>
      <div class="small muted mt">${r.answered||0} questões respondidas · ${r.accuracy||0}% de acerto</div>`;
    container.appendChild(c);
  });
}

/* ---------- Gráfico de evolução ---------- */
function lastDays(n){
  const arr=[]; const base=new Date();
  for(let i=n-1;i>=0;i--){ const t=new Date(base); t.setDate(base.getDate()-i);
    const key=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
    const h=S.history[key]||{xp:0,answered:0,correct:0};
    arr.push({key, day:t.getDate(), xp:h.xp||0, answered:h.answered||0, correct:h.correct||0, acc:h.answered?Math.round(h.correct/h.answered*100):null});
  }
  return arr;
}
function evolutionSVG(days){
  const data=lastDays(days), W=320, H=150, pad=22, cw=(W-2*pad)/days;
  const maxXp=Math.max(10, ...data.map(d=>d.xp));
  const bh=H-2*pad;
  let bars="", pts=[], dots="", labels="";
  data.forEach((d,i)=>{
    const x=pad+i*cw, bw=Math.max(3,cw*0.55);
    const h=Math.round(d.xp/maxXp*bh);
    bars+=`<rect x="${(x+cw*0.22).toFixed(1)}" y="${H-pad-h}" width="${bw.toFixed(1)}" height="${h}" rx="2" fill="url(#gb)"/>`;
    if(d.acc!=null){ const px=x+cw/2, py=pad+(100-d.acc)/100*bh; pts.push(px.toFixed(1)+","+py.toFixed(1));
      dots+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="#34d399"/>`; }
    if(i%2===0||days<=7) labels+=`<text x="${(x+cw/2).toFixed(1)}" y="${H-6}" fill="#5f6d92" font-size="8" text-anchor="middle">${d.day}</text>`;
  });
  const line = pts.length>1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="#34d399" stroke-width="1.6"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%">
    <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b06cff"/><stop offset="1" stop-color="#7c8cff"/></linearGradient></defs>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}" stroke="#243154" stroke-width="1"/>
    <line x1="${pad}" y1="${H-pad}" x2="${W-4}" y2="${H-pad}" stroke="#243154" stroke-width="1"/>
    ${bars}${line}${dots}${labels}</svg>`;
}
/* ---------- Tempo de estudo ---------- */
function studyMinToday(){ const h=S.history[todayStr()]||{}; return (h.focusMin||0)+(h.quizMin||0); }
function studyMinTotal(){ return (S.stats.focusMin||0)+(S.stats.quizMin||0); }
function studyMinWeek(){ return lastDays(7).reduce((a,d)=>a+minOf(d.key),0); }
function minOf(key){ const h=S.history[key]||{}; return (h.focusMin||0)+(h.quizMin||0); }
function fmtDur(min){ min=Math.round(min); if(min<60) return min+" min"; const h=Math.floor(min/60), m=min%60; return h+"h"+(m?" "+m+"min":""); }
function minutesSVG(days){
  const data=lastDays(days).map(d=>({day:d.day, min:minOf(d.key)}));
  const W=320,H=120,pad=20,cw=(W-2*pad)/days, bh=H-2*pad, maxM=Math.max(20,...data.map(d=>d.min));
  let bars="",labels="";
  data.forEach((d,i)=>{ const x=pad+i*cw, bw=Math.max(4,cw*0.6), h=Math.round(d.min/maxM*bh);
    bars+=`<rect x="${(x+cw*0.2).toFixed(1)}" y="${H-pad-h}" width="${bw.toFixed(1)}" height="${h}" rx="2" fill="url(#gm)"/>`;
    labels+=`<text x="${(x+cw/2).toFixed(1)}" y="${H-5}" fill="#5f6d92" font-size="8" text-anchor="middle">${d.day}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%">
    <defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs>
    <line x1="${pad}" y1="${H-pad}" x2="${W-4}" y2="${H-pad}" stroke="#243154" stroke-width="1"/>${bars}${labels}</svg>`;
}

/* ---------- BADGES ---------- */
function viewBadges(m){
  const head=el("div","card");
  head.innerHTML=`<h3>🎖️ Conquistas</h3>
    <p class="muted small">Cada conquista tem 5 patamares: 🥉 Bronze · 🥈 Prata · 🥇 Ouro · 🏆 Platina · 💠 Diamante. Quanto maior, mais XP.</p>
    <div class="muted small mt">${achievementsUnlocked()}/${achievementsMax()} patamares conquistados</div>`;
  const shb=el("button","btn sm mt","📣 Compartilhar meu progresso"); shb.onclick=shareCard; head.appendChild(shb);
  m.appendChild(head);

  // Evolução (últimos 14 dias)
  m.appendChild(el("div","sectitle","Evolução (14 dias)"));
  const ch=el("div","card");
  ch.innerHTML=`<div style="display:flex;gap:16px;font-size:11px;color:var(--muted);margin-bottom:6px">
      <span>🟪 XP por dia</span><span>🟢 % de acerto</span></div>`+evolutionSVG(14);
  m.appendChild(ch);

  // Tempo de estudo
  m.appendChild(el("div","sectitle","Tempo de estudo"));
  const tcard=el("div","card");
  const activeD=Object.keys(S.history||{}).filter(k=>minOf(k)>0).length;
  const avg=activeD?Math.round(studyMinTotal()/activeD):0;
  tcard.innerHTML=`<div class="tiles" style="margin-bottom:10px">
      <div class="tile"><div class="em">⏱️</div><div class="big">${fmtDur(studyMinTotal())}</div><div class="lbl">total</div></div>
      <div class="tile"><div class="em">📅</div><div class="big">${fmtDur(studyMinWeek())}</div><div class="lbl">esta semana</div></div>
      <div class="tile"><div class="em">☀️</div><div class="big">${fmtDur(studyMinToday())}</div><div class="lbl">hoje</div></div>
      <div class="tile"><div class="em">📈</div><div class="big">${fmtDur(avg)}</div><div class="lbl">média/dia</div></div>
    </div>
    <div class="small muted mb">Minutos por dia (foco Pomodoro + questões):</div>${minutesSVG(14)}`;
  m.appendChild(tcard);

  // Lembrete diário
  const rm=(S.settings&&S.settings.reminder)||{enabled:false,time:"19:00"};
  m.appendChild(el("div","sectitle","Lembrete diário"));
  const rcard=el("div","card");
  rcard.innerHTML=`<p class="muted small mb">Receba um aviso todos os dias para não perder o ritmo (e a questão do dia). Funciona melhor com o app <b>instalado</b> e aberto no horário.</p>`;
  const rrow=el("label","mission"); rrow.style.cursor="pointer";
  rrow.innerHTML=`<input type="checkbox" ${rm.enabled?"checked":""} style="width:22px;height:22px">
    <div class="info"><div class="nm">Ativar lembrete diário</div><div class="muted small">Notificação no horário escolhido</div></div>`;
  const rcb=rrow.querySelector("input");
  rcard.appendChild(rrow);
  const trow=el("div","mt"); trow.innerHTML=`<div class="small muted">Horário</div>`;
  const tin=el("input","input"); tin.type="time"; tin.value=rm.time||"19:00"; trow.appendChild(tin);
  rcard.appendChild(trow);
  const rsave=el("button","btn sm mt","Salvar lembrete");
  const applyR=()=>{ S.settings.reminder={enabled:rcb.checked, time:tin.value||"19:00", lastDate:(S.settings.reminder||{}).lastDate||""};
    if(rcb.checked){ try{ if(window.Notification && Notification.permission==="default") Notification.requestPermission(); }catch(e){} }
    save(); toast("Lembrete "+(rcb.checked?"ativado":"desativado")+" ✅");
    if(S.settings.push && pushSupported()) subscribePush(); }; // reenvia inscrição com o novo horário
  rsave.onclick=applyR; rcb.onchange=()=>{ if(rcb.checked){ try{ if(window.Notification&&Notification.permission==="default") Notification.requestPermission(); }catch(e){} } };
  rcard.appendChild(rsave);
  // Push (app fechado)
  if(pushSupported()){
    const pOn=!!(S.settings&&S.settings.push);
    rcard.appendChild(el("div","small muted mt","🔔 Push (recebe mesmo com o app fechado):"));
    const pbtn=el("button","btn ghost sm mt", pOn?"🔕 Desativar push":"🔔 Ativar push (app fechado)");
    pbtn.onclick=async()=>{ if(pOn){ await unsubscribePush(); } else { await subscribePush(); } render(); };
    rcard.appendChild(pbtn);
  }
  m.appendChild(rcard);

  // Análise dos erros ("por que errei")
  const er=S.errReasons||{sabia:0,conceito:0,atencao:0};
  const erTot=(er.sabia||0)+(er.conceito||0)+(er.atencao||0);
  if(erTot){
    m.appendChild(el("div","sectitle","Por que você erra"));
    const ecard=el("div","card");
    const pctf=(v)=>Math.round((v||0)/erTot*100);
    ecard.innerHTML=`<p class="muted small mb">Padrão dos seus erros marcados (${erTot}):</p>`;
    [["Não sabia o conteúdo","sabia","var(--bad)"],["Troquei conceito","conceito","var(--warn)"],["Desatenção","atencao","var(--info)"]].forEach(([lb,k,cl])=>{
      const row=el("div","mt"); row.innerHTML=`<div class="small" style="display:flex;justify-content:space-between"><span>${lb}</span><span>${pctf(er[k])}%</span></div>
        <div class="prog" style="margin-top:4px"><span style="width:${pctf(er[k])}%;background:${cl}"></span></div>`;
      ecard.appendChild(row);
    });
    ecard.appendChild(el("div","muted small mt","Dica: muita 'desatenção' → leia o enunciado 2x. Muito 'não sabia' → volte ao resumo do tema."));
    m.appendChild(ecard);
  }

  // Ajustes / acessibilidade
  m.appendChild(el("div","sectitle","Ajustes"));
  const acard=el("div","card");
  acard.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
     <div><b>Tamanho da fonte</b><div class="muted small">Deixe o texto maior ou menor</div></div></div>`;
  const frow=el("div","btnrow mt");
  const fminus=el("button","btn ghost sm","A−"); fminus.onclick=()=>{ bumpFont(-1); render(); };
  const flabel=el("span","chip",Math.round(((S.settings&&S.settings.fontScale)||1)*100)+"%");
  const fplus=el("button","btn ghost sm","A+"); fplus.onclick=()=>{ bumpFont(1); render(); };
  frow.append(fminus,flabel,fplus); acard.appendChild(frow);
  m.appendChild(acard);

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

  // Backup do progresso (migrar de aparelho / segurança)
  m.appendChild(el("div","sectitle","Backup"));
  const bk=el("div","card");
  bk.innerHTML=`<p class="muted small mb">Guarde seu <b>código de backup</b> em local seguro. Para trocar de aparelho, cole o código no outro e restaure.</p>`;
  const bta=el("textarea","input"); bta.readOnly=true; bta.style.fontSize="10px";
  try{ bta.value=btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }catch(e){ bta.value=""; }
  bta.onclick=()=>{ bta.select(); document.execCommand&&document.execCommand("copy"); toast("Backup copiado!"); };
  bk.appendChild(el("div","small muted","Seu backup (toque para copiar):")); bk.appendChild(bta);
  const bimp=el("textarea","input"); bimp.placeholder="Cole um código de backup para restaurar...";
  bk.appendChild(el("div","small muted mt","Restaurar backup:")); bk.appendChild(bimp);
  const bib=el("button","btn ghost sm mt","♻️ Restaurar");
  bib.onclick=()=>{ if(!bimp.value.trim())return; if(!confirm("Restaurar vai SUBSTITUIR seu progresso atual. Continuar?"))return;
    try{ const st=JSON.parse(decodeURIComponent(escape(atob(bimp.value.trim())))); if(!st||!st.profile)throw 0; S=migrate(st); save(); toast("Progresso restaurado! ✅"); go("home"); }
    catch(e){ toast("Código de backup inválido."); } };
  bk.appendChild(bib);
  m.appendChild(bk);

  // Sincronização em nuvem (Supabase)
  if(supaOn()){
    const cl=el("div","card mt");
    cl.innerHTML=`<b>☁️ Sincronização em nuvem</b><p class="muted small mt mb">Salve seu progresso na nuvem e recupere em qualquer aparelho usando o seu <b>ID de sincronização</b>.</p>`;
    const row=el("div","btnrow");
    const sv=el("button","btn sm","☁️ Salvar na nuvem"); sv.onclick=cloudSave;
    const ld=el("button","btn ghost sm","⬇️ Baixar (este ID)"); ld.onclick=()=>cloudLoad();
    row.append(sv,ld); cl.appendChild(row);
    cl.appendChild(el("div","small muted mt","Seu ID de sincronização (copie para usar em outro aparelho):"));
    const idta=el("textarea","input"); idta.readOnly=true; idta.value=S.profile.id; idta.style.fontSize="11px"; idta.onclick=()=>{idta.select();document.execCommand&&document.execCommand("copy");toast("ID copiado!");};
    cl.appendChild(idta);
    const oid=el("input","input"); oid.placeholder="Baixar de outro ID (cole aqui)...";
    cl.appendChild(oid);
    const ob=el("button","btn ghost sm mt","⬇️ Baixar desse ID"); ob.onclick=()=>{ if(oid.value.trim()) cloudLoad(oid.value); };
    cl.appendChild(ob);
    m.appendChild(cl);
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

/* ---------- Pomodoro (controles explícitos) ---------- */
const POMO_PRESETS=[[25,5],[50,10],[15,3],[45,15]];
let pomo={phase:"idle", left:0, running:false, open:false};
let pomoIv=null;
function fmtT(s){ return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); }
function pFocus(){ return (S.settings&&S.settings.pomoFocus)||25; }
function pBreak(){ return (S.settings&&S.settings.pomoBreak)||5; }
function pomodorosToday(){ return (S.history[todayStr()]||{}).pomodoros||0; }
function pomoBeep(){ try{ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return; const ac=new AC(); const o=ac.createOscillator(), g=ac.createGain(); o.connect(g); g.connect(ac.destination); o.frequency.value=880; g.gain.value=0.07; o.start(); setTimeout(()=>{o.stop();ac.close&&ac.close();},420); }catch(e){} }
function pomoNotify(msg){ toast(msg); try{ if(window.Notification && Notification.permission==="granted") new Notification("MedQuest 5",{body:msg}); }catch(e){} pomoBeep(); }
function pomoEnsureLoop(){
  clearInterval(pomoIv);
  pomoIv=setInterval(()=>{
    if(pomo.phase==="idle" || !pomo.running) return;
    pomo.left--;
    if(pomo.left<=0){
      if(pomo.phase==="focus"){ S.stats.pomodoros=(S.stats.pomodoros||0)+1; S.stats.focusMin=(S.stats.focusMin||0)+pFocus(); const h=histToday(); h.pomodoros=(h.pomodoros||0)+1; h.focusMin=(h.focusMin||0)+pFocus(); touchStreak(); addXP(15); save(); renderTopbar(); checkBadges();
        const goal=(S.settings&&S.settings.pomoGoal)||4;
        pomoNotify((h.pomodoros>=goal?"Meta de foco do dia batida! 🎉 ":"Foco concluído! +15 XP 🍅 ")+"Hora de descansar ☕"); pomoBegin("break"); }
      else { pomoNotify("Descanso acabou! Bora voltar aos estudos 💪"); pomoBegin("focus"); }
      return;
    }
    pomoRender();
  },1000);
}
function pomoBegin(phase){ // define fase e começa a contar
  pomo.phase=phase; pomo.left=(phase==="focus"?pFocus():pBreak())*60; pomo.running=true;
  try{ if(window.Notification && Notification.permission==="default") Notification.requestPermission(); }catch(e){}
  pomoEnsureLoop(); pomoRender();
}
function pomoIniciar(){ pomoBegin("focus"); }
function pomoPausar(){ pomo.running=false; pomoRender(); }
function pomoRetomar(){ pomo.running=true; pomoRender(); }
function pomoReiniciar(){ pomo.left=((pomo.phase==="break")?pBreak():pFocus())*60; pomo.running=true; pomoRender(); } // reinicia a fase atual
function pomoParar(){ clearInterval(pomoIv); pomoIv=null; pomo={phase:"idle",left:0,running:false,open:pomo.open}; pomoRender(); }
function pomoBtn(id,label,cls){ return `<button class="pmb ${cls||""}" id="${id}">${label}</button>`; }
function pomoRender(){
  let box=$("#pomo"); if(!box){ box=el("div"); box.id="pomo"; document.body.appendChild(box); }
  const idle=pomo.phase==="idle";
  const icon=pomo.phase==="break"?"☕":"🍅";
  const label = idle ? `🍅 Pomodoro` : `${icon} ${fmtT(pomo.left)}`;
  box.className="pomo "+(idle?"idle":pomo.phase)+(!idle&&!pomo.running?" paused":"");
  let controls="";
  if(pomo.open){
    if(idle){
      controls = pomoBtn("p-start","▶ Iniciar","go")
        + pomoBtn("p-cfg","⚙ "+pFocus()+"/"+pBreak(),"cfg");
    } else {
      controls = (pomo.running?pomoBtn("p-pause","⏸ Pausar"):pomoBtn("p-resume","▶ Retomar","go"))
        + pomoBtn("p-restart","⟲ Reiniciar")
        + pomoBtn("p-stop","✕ Parar","stop");
    }
  }
  box.innerHTML=`<button class="pomo-pill" id="pomo-toggle" title="pomodoro">${label}${pomo.open?" ▾":" ▸"}</button>`+
    (controls?`<div class="pomo-ctrl">${controls}</div>`:"");
  $("#pomo-toggle").onclick=()=>{ pomo.open=!pomo.open; pomoRender(); };
  const bind=(id,fn)=>{ const b=$("#"+id); if(b) b.onclick=fn; };
  bind("p-start",pomoIniciar); bind("p-cfg",pomoConfig);
  bind("p-pause",pomoPausar); bind("p-resume",pomoRetomar);
  bind("p-restart",pomoReiniciar); bind("p-stop",pomoParar);
}
function pomoConfig(){
  const bg=el("div","modal-bg"); const mo=el("div","modal"); mo.style.textAlign="left";
  mo.innerHTML=`<h3 style="text-align:center">🍅 Configurar Pomodoro</h3>`;
  function numRow(label,val,min,max){ const wrap=el("div","mt"); wrap.innerHTML=`<div class="small muted">${label}</div>`;
    const inp=el("input","input"); inp.type="number"; inp.min=min; inp.max=max; inp.value=val; wrap.appendChild(inp); mo.appendChild(wrap); return inp; }
  const fi=numRow("Foco (minutos)",pFocus(),1,180);
  const bi=numRow("Descanso (minutos)",pBreak(),1,60);
  const gi=numRow("Meta de pomodoros por dia",(S.settings.pomoGoal||4),1,20);
  const pr=el("div","chiprow mt"); POMO_PRESETS.forEach(p=>{ const c=el("button","chip",p[0]+"/"+p[1]); c.onclick=()=>{ fi.value=p[0]; bi.value=p[1]; }; pr.appendChild(c); });
  mo.appendChild(el("div","small muted mt","Presets rápidos:")); mo.appendChild(pr);
  const sv=el("button","btn block mt","Salvar"); sv.onclick=()=>{
    S.settings.pomoFocus=Math.max(1,Math.min(180,parseInt(fi.value)||25));
    S.settings.pomoBreak=Math.max(1,Math.min(60,parseInt(bi.value)||5));
    S.settings.pomoGoal=Math.max(1,Math.min(20,parseInt(gi.value)||4));
    save(); pomoRender(); toast("Configuração salva 🍅"); bg.remove();
  };
  const cl=el("button","btn ghost block mt","Fechar"); cl.onclick=()=>bg.remove();
  mo.append(sv,cl); bg.appendChild(mo); bg.onclick=e=>{ if(e.target===bg) bg.remove(); }; document.body.appendChild(bg);
}

/* ---------- Busca global ---------- */
function normStr(s){ return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function openSearch(){
  const bg=el("div","modal-bg"); bg.style.alignItems="flex-start"; bg.style.paddingTop="34px";
  const mo=el("div","modal"); mo.style.textAlign="left"; mo.style.maxWidth="580px"; mo.style.width="100%"; mo.style.maxHeight="88vh"; mo.style.overflow="auto";
  mo.innerHTML=`<h3 style="text-align:center;margin-bottom:10px">🔎 Buscar</h3>`;
  const inp=el("input","input"); inp.placeholder="Ex.: sepse, anel de sinete, clearance, Courvoisier...";
  mo.appendChild(inp);
  const res=el("div","mt"); mo.appendChild(res);
  const close=el("button","btn ghost block mt","Fechar"); close.onclick=()=>bg.remove(); mo.appendChild(close);
  bg.appendChild(mo); bg.onclick=e=>{ if(e.target===bg) bg.remove(); }; document.body.appendChild(bg);
  setTimeout(()=>inp.focus(),50);
  function run(){
    const raw=inp.value.trim(), q=normStr(raw); res.innerHTML="";
    if(q.length<2){ res.innerHTML=`<div class="muted small center">Digite ao menos 2 letras.</div>`; return; }
    const qs=QUESTIONS.filter(x=>normStr(x.question+" "+x.topic+" "+x.explanation+" "+x.options.join(" ")).includes(q)).slice(0,12);
    const sm=Object.keys(SUMMARIES).filter(k=>normStr(k+" "+SUMMARIES[k]).includes(q)).slice(0,10);
    const fc=FLASHCARDS.filter(x=>normStr(x.front+" "+x.back).includes(q)).slice(0,12);
    const im=IMAGES.filter(x=>normStr(x.findings+" "+x.answer+" "+x.explanation).includes(q)).slice(0,10);
    if(!(qs.length+sm.length+fc.length+im.length)){ res.innerHTML=`<div class="muted small center">Nada encontrado para "${esc(raw)}".</div>`; return; }
    if(qs.length){ res.appendChild(el("div","sectitle","Questões ("+qs.length+")"));
      qs.forEach(x=>{ const d=DISCIPLINES[x.discipline]; const it=el("div","card mt");
        it.innerHTML=`<div class="muted small">${d.icon} ${esc(x.topic)}</div><div style="font-weight:700;margin:4px 0">${esc(x.question)}</div>
          <div class="small" style="color:var(--good)"><b>Resposta:</b> ${esc(x.options[x.answer])}</div>
          <div class="explain ok mt">${esc(x.explanation)}</div>`; res.appendChild(it); }); }
    if(sm.length){ res.appendChild(el("div","sectitle","Resumos ("+sm.length+")"));
      sm.forEach(k=>{ const i=k.indexOf("::"); const it=el("div","card mt");
        it.innerHTML=`<div style="font-weight:700">📖 ${esc(k.slice(i+2))}</div><div class="explain mt">${esc(SUMMARIES[k]).replace(/\n/g,"<br>")}</div>`; res.appendChild(it); }); }
    if(fc.length){ res.appendChild(el("div","sectitle","Flashcards ("+fc.length+")"));
      fc.forEach(x=>{ const it=el("div","card mt"); it.innerHTML=`<div style="font-weight:700">${esc(x.front)}</div><div class="small muted mt">${esc(x.back)}</div>`; res.appendChild(it); }); }
    if(im.length){ res.appendChild(el("div","sectitle","Imagens ("+im.length+")"));
      im.forEach(x=>{ const it=el("div","card mt"); it.innerHTML=`<div class="muted small">${esc(x.area)}</div><div class="small"><b>Achados:</b> ${esc(x.findings)}</div><div class="small" style="color:var(--good)"><b>Dx:</b> ${esc(x.answer)}</div>`; res.appendChild(it); }); }
  }
  inp.oninput=run;
}

/* ---------- Nuvem (Supabase): sincronização + mural ---------- */
function supaOn(){ return !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY); }
function supaHeaders(extra){ return Object.assign({ apikey:CFG.SUPABASE_ANON_KEY, Authorization:"Bearer "+CFG.SUPABASE_ANON_KEY, "Content-Type":"application/json" }, extra||{}); }
async function cloudSave(){
  if(!supaOn()){ toast("Nuvem não configurada."); return; }
  try{
    const body=[{ player_id:S.profile.id, name:S.profile.name||"", turma:S.profile.turma||"",
      data:btoa(unescape(encodeURIComponent(JSON.stringify(S)))) }];
    const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/saves", {method:"POST", headers:supaHeaders({Prefer:"resolution=merge-duplicates"}), body:JSON.stringify(body)});
    toast(res.ok?"Progresso salvo na nuvem ☁️✅":("Falha ao salvar ("+res.status+"). O SQL já foi rodado?"));
  }catch(e){ toast("Sem conexão com a nuvem."); }
}
async function cloudLoad(id){
  if(!supaOn()){ toast("Nuvem não configurada."); return; }
  const pid=(id||S.profile.id).trim();
  if(!confirm("Baixar da nuvem vai SUBSTITUIR seu progresso atual. Continuar?")) return;
  try{
    const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/saves?player_id=eq."+encodeURIComponent(pid)+"&select=data", {headers:supaHeaders()});
    if(!res.ok){ toast("Falha ao acessar a nuvem ("+res.status+")."); return; }
    const rows=await res.json();
    if(!rows||!rows.length){ toast("Nenhum backup na nuvem para esse ID."); return; }
    const st=JSON.parse(decodeURIComponent(escape(atob(rows[0].data))));
    if(!st||!st.profile) throw 0;
    S=migrate(st); save(); applyTheme(); applyFontScale(); toast("Progresso baixado da nuvem ✅"); go("home");
  }catch(e){ toast("Backup da nuvem inválido."); }
}
async function muralFetch(disc){
  if(!supaOn()) return null;
  try{
    let url=CFG.SUPABASE_URL+"/rest/v1/mural?turma=eq."+encodeURIComponent(S.profile.turma)+"&select=*&order=id.desc&limit=100";
    if(disc && disc!=="all") url+="&discipline=eq."+encodeURIComponent(disc);
    const res=await fetch(url,{headers:supaHeaders()}); return res.ok? await res.json() : null;
  }catch(e){ return null; }
}
async function muralPost(text, opts){
  if(!supaOn()) return false; opts=opts||{};
  try{
    const body=[{ turma:S.profile.turma, name:S.profile.name||"Anônimo", author_id:S.profile.id,
      text:String(text).slice(0,600), discipline:opts.discipline||null, topic:opts.topic||null, kind:opts.kind||"duvida" }];
    const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/mural",{method:"POST", headers:supaHeaders(), body:JSON.stringify(body)});
    return res.ok;
  }catch(e){ return false; }
}
async function repliesFetch(postId){
  if(!supaOn()) return null;
  try{ const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/mural_replies?post_id=eq."+encodeURIComponent(postId)+"&select=*&order=id.asc&limit=100",{headers:supaHeaders()}); return res.ok?await res.json():null; }catch(e){ return null; }
}
async function replyPost(postId, text){
  if(!supaOn()) return false;
  try{ const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/mural_replies",{method:"POST", headers:supaHeaders(), body:JSON.stringify([{post_id:postId, name:S.profile.name||"Anônimo", text:String(text).slice(0,600)}])}); return res.ok; }catch(e){ return false; }
}
async function muralResolve(postId, val){
  if(!supaOn()) return false;
  try{ const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/mural?id=eq."+encodeURIComponent(postId),{method:"PATCH", headers:supaHeaders(), body:JSON.stringify({resolved:val})}); return res.ok; }catch(e){ return false; }
}
async function reportQuestion(qid){
  if(!supaOn()){ toast("Reportar precisa da nuvem (Supabase)."); return; }
  const reason=window.prompt("O que está errado nesta questão? (ex.: gabarito, enunciado, digitação)"); if(!reason) return;
  try{ const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/reports",{method:"POST",headers:supaHeaders(),body:JSON.stringify([{question_id:qid, reason:String(reason).slice(0,400), name:S.profile.name||"", turma:S.profile.turma}])});
    toast(res.ok?"Reportado, obrigado! 🙏":"Falha ao reportar (rodou o SQL de reports?)."); }catch(e){ toast("Sem conexão."); }
}
// ---- Desafio da turma (challenges) ----
function chId(){ return "c"+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36); }
async function challengesFetch(){
  if(!supaOn()) return null;
  try{
    const nowIso=new Date().toISOString();
    const url=CFG.SUPABASE_URL+"/rest/v1/challenges?turma=eq."+encodeURIComponent(S.profile.turma)+"&or=(ends_at.gt."+nowIso+",ends_at.is.null)&select=*&order=created_at.desc&limit=20";
    const res=await fetch(url,{headers:supaHeaders()}); return res.ok? await res.json():null;
  }catch(e){ return null; }
}
async function challengeCreate(title, disc, n){
  if(!supaOn()){ toast("Nuvem não configurada."); return; }
  let pool=QUESTIONS.slice(); if(disc&&disc!=="all") pool=pool.filter(q=>q.discipline===disc);
  if(pool.length<3){ toast("Poucas questões para essa matéria."); return; }
  const ids=shuffle(pool).slice(0,Math.min(n||10,pool.length)).map(q=>q.id);
  const body=[{ id:chId(), turma:S.profile.turma, title:(title||"Desafio da turma").slice(0,80),
    question_ids:JSON.stringify(ids), created_by:S.profile.id, created_by_name:S.profile.name||"Alguém",
    ends_at:new Date(Date.now()+7*864e5).toISOString() }];
  try{
    const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/challenges",{method:"POST",headers:supaHeaders(),body:JSON.stringify(body)});
    if(res.ok){ toast("Desafio criado! 🏆"); render(); } else toast("Falha ao criar ("+res.status+"). Rodou o SQL do desafio?");
  }catch(e){ toast("Sem conexão."); }
}
async function challengeBoard(cid){
  try{ const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/challenge_scores?challenge_id=eq."+encodeURIComponent(cid)+"&select=name,correct,total,player_id&order=correct.desc,created_at.asc&limit=60",{headers:supaHeaders()}); return res.ok?await res.json():null; }catch(e){ return null; }
}
async function challengeSubmit(cid, correct, total){
  try{ await fetch(CFG.SUPABASE_URL+"/rest/v1/challenge_scores",{method:"POST",headers:supaHeaders({Prefer:"resolution=merge-duplicates"}),body:JSON.stringify([{challenge_id:cid,player_id:S.profile.id,name:S.profile.name||"Jogador",correct,total}])}); }catch(e){}
}
function startChallenge(ch){
  let ids=[]; try{ ids=JSON.parse(ch.question_ids); }catch(e){}
  const pool=ids.map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean);
  if(!pool.length){ toast("As questões do desafio não foram encontradas."); return; }
  quiz={pool, idx:0, correctCount:0, answered:false, mode:"exam", source:"challenge", exam:true,
    total:pool.length, answers:new Array(pool.length).fill(null), scored:false, endAt:null, challenge:ch};
  go("quiz");
}
function challengeCreateModal(){
  const bg=el("div","modal-bg"); const mo=el("div","modal"); mo.style.textAlign="left";
  mo.innerHTML=`<h3 style="text-align:center">🏆 Criar desafio</h3>`;
  mo.appendChild(el("div","small muted","Título:"));
  const ti=el("input","input"); ti.placeholder="Ex.: Desafio de Imunologia"; mo.appendChild(ti);
  mo.appendChild(el("div","small muted mt","Matéria:"));
  const sel=el("select","input"); const oAll=document.createElement("option"); oAll.value=""; oAll.textContent="Todas as matérias"; sel.appendChild(oAll);
  for(const d in DISCIPLINES){ const o=document.createElement("option"); o.value=d; o.textContent=DISCIPLINES[d].name; sel.appendChild(o); }
  mo.appendChild(sel);
  mo.appendChild(el("div","small muted mt","Nº de questões:"));
  const ni=el("input","input"); ni.type="number"; ni.min=3; ni.max=20; ni.value=10; mo.appendChild(ni);
  const cr=el("button","btn block mt","Criar desafio"); cr.onclick=async()=>{ cr.disabled=true; await challengeCreate(ti.value, sel.value||"all", parseInt(ni.value)||10); bg.remove(); };
  const cl=el("button","btn ghost block mt","Cancelar"); cl.onclick=()=>bg.remove();
  mo.append(cr,cl); bg.appendChild(mo); bg.onclick=e=>{if(e.target===bg)bg.remove();}; document.body.appendChild(bg);
}

// ---- Push (notificação com app fechado) ----
function urlB64ToUint8(base64){
  const pad="=".repeat((4-base64.length%4)%4);
  const b=(base64+pad).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(b); const arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i); return arr;
}
function pushSupported(){ return ("serviceWorker" in navigator) && ("PushManager" in window) && supaOn() && !!CFG.VAPID_PUBLIC; }
async function subscribePush(){
  if(!pushSupported()){ toast("Push não disponível neste navegador."); return false; }
  try{
    const perm=await Notification.requestPermission();
    if(perm!=="granted"){ toast("Permissão de notificação negada."); return false; }
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:urlB64ToUint8(CFG.VAPID_PUBLIC)});
    const body=[{ player_id:S.profile.id, name:S.profile.name||"", turma:S.profile.turma||"",
      time:(S.settings&&S.settings.reminder&&S.settings.reminder.time)||"19:00", sub:JSON.stringify(sub) }];
    const res=await fetch(CFG.SUPABASE_URL+"/rest/v1/push_subs",{method:"POST", headers:supaHeaders({Prefer:"resolution=merge-duplicates"}), body:JSON.stringify(body)});
    if(res.ok){ if(!S.settings)S.settings={}; S.settings.push=true; save(); toast("Push ativado! 🔔"); return true; }
    toast("Falha ao registrar push ("+res.status+"). A tabela push_subs já existe?"); return false;
  }catch(e){ toast("Não consegui ativar o push."); return false; }
}
async function unsubscribePush(){
  try{ const reg=await navigator.serviceWorker.ready; const sub=await reg.pushManager.getSubscription(); if(sub) await sub.unsubscribe(); }catch(e){}
  try{ await fetch(CFG.SUPABASE_URL+"/rest/v1/push_subs?player_id=eq."+encodeURIComponent(S.profile.id), {method:"DELETE", headers:supaHeaders()}); }catch(e){}
  if(!S.settings)S.settings={}; S.settings.push=false; save(); toast("Push desativado.");
}

/* ---------- Compartilhar progresso (imagem) ---------- */
function shareCard(){
  const li=levelInfo(S.xp);
  const acc=S.stats.answered?Math.round(S.stats.correct/S.stats.answered*100):0;
  const W=1080,H=1080; const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext&&cv.getContext("2d");
  if(!ctx){ toast("Seu navegador não permite gerar a imagem aqui."); return; }
  const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,"#0b1020"); g.addColorStop(1,"#211447"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const g2=ctx.createRadialGradient(W*0.82,H*0.12,0,W*0.82,H*0.12,640); g2.addColorStop(0,"rgba(124,140,255,.35)"); g2.addColorStop(1,"rgba(124,140,255,0)"); ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
  ctx.textAlign="center";
  ctx.fillStyle="#e8edf7"; ctx.font="bold 52px Segoe UI, Arial, sans-serif"; ctx.fillText("MedQuest 5", W/2, 150);
  ctx.font="bold 92px Segoe UI, Arial, sans-serif"; ctx.fillText(S.profile.name||"Jogador", W/2, 330);
  ctx.fillStyle="#b06cff"; ctx.font="bold 50px Segoe UI, Arial, sans-serif"; ctx.fillText("Nível "+li.level+" · "+li.title, W/2, 410);
  function stat(x,big,lbl,color){ ctx.fillStyle=color; ctx.font="bold 100px Segoe UI, Arial, sans-serif"; ctx.fillText(String(big), x, 640); ctx.fillStyle="#9aa7c7"; ctx.font="36px Segoe UI, Arial, sans-serif"; ctx.fillText(lbl, x, 705); }
  stat(W*0.25, S.xp, "XP", "#f4c145");
  stat(W*0.5, S.streak.count, "dias 🔥", "#fb7185");
  stat(W*0.75, acc+"%", "acerto", "#34d399");
  ctx.fillStyle="#e8edf7"; ctx.font="44px Segoe UI, Arial, sans-serif"; ctx.fillText(S.stats.answered+" questões · "+achievementsUnlocked()+"/"+achievementsMax()+" conquistas", W/2, 830);
  ctx.fillStyle="#8ea0c4"; ctx.font="38px Segoe UI, Arial, sans-serif"; ctx.fillText("Bora estudar comigo!", W/2, 930);
  ctx.fillStyle="#5f6d92"; ctx.font="32px Segoe UI, Arial, sans-serif"; ctx.fillText("fabiocayres7-ai.github.io/medquest", W/2, 1015);
  cv.toBlob(async (blob)=>{
    if(!blob){ toast("Não consegui gerar a imagem."); return; }
    const file=new File([blob],"medquest.png",{type:"image/png"});
    try{ if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:"MedQuest 5", text:"Meu progresso no MedQuest!"}); return; } }catch(e){}
    const url=URL.createObjectURL(blob);
    const bg=el("div","modal-bg"); const mo=el("div","modal");
    mo.innerHTML=`<h3>📣 Compartilhar progresso</h3><img src="${url}" alt="progresso" style="width:100%;border-radius:14px;margin:10px 0">`;
    const a=el("a","btn block"); a.href=url; a.download="medquest.png"; a.textContent="⬇️ Baixar imagem"; mo.appendChild(a);
    const cl=el("button","btn ghost block mt","Fechar"); cl.onclick=()=>{bg.remove();URL.revokeObjectURL(url);}; mo.appendChild(cl);
    bg.appendChild(mo); bg.onclick=e=>{ if(e.target===bg){bg.remove();URL.revokeObjectURL(url);} }; document.body.appendChild(bg);
  },"image/png");
}

/* ---------- Tema claro/escuro ---------- */
function applyTheme(){
  const light=(S.settings&&S.settings.theme)==="light";
  document.body.classList.toggle("light", light);
  const tb=$("#themebtn"); if(tb) tb.textContent= light?"☀️":"🌙";
  const tc=document.querySelector('meta[name="theme-color"]'); if(tc) tc.setAttribute("content", light?"#f4f6fb":"#080b16");
}
function toggleTheme(){ if(!S.settings) S.settings={}; S.settings.theme=(S.settings.theme==="light")?"dark":"light"; save(); applyTheme(); }
function applyFontScale(){ const s=(S.settings&&S.settings.fontScale)||1; try{ document.body.style.zoom=s; }catch(e){} }
function bumpFont(dir){ if(!S.settings) S.settings={}; let s=((S.settings.fontScale||1)+dir*0.1); s=Math.max(0.9,Math.min(1.4,Math.round(s*10)/10)); S.settings.fontScale=s; save(); applyFontScale(); }

/* ---------- Lembrete diário ---------- */
function reminderTick(){
  const rm=S.settings&&S.settings.reminder; if(!rm||!rm.enabled||!rm.time) return;
  const today=todayStr(); if(rm.lastDate===today) return;
  const now=new Date(); const hh=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
  if(hh>=rm.time){
    rm.lastDate=today; save();
    const msg = studyMinToday()>0 ? "Continue firme! Que tal a questão do dia? 🎯" : "Hora de estudar! Faça a questão do dia e mantenha o streak 🔥";
    try{ if(window.Notification && Notification.permission==="granted") new Notification("MedQuest 5",{body:msg}); }catch(e){}
    toast(msg);
  }
}
function initReminder(){ try{ reminderTick(); }catch(e){} setInterval(()=>{ try{ reminderTick(); }catch(e){} }, 30000); }

/* ---------- Boot ---------- */
pomoRender();
applyTheme();
applyFontScale();
initReminder();
const _sb=$("#searchbtn"); if(_sb) _sb.onclick=openSearch;
const _tb=$("#themebtn"); if(_tb) _tb.onclick=toggleTheme;
ensureMissions();
// sincroniza conquistas com o progresso atual (sem duplicar patamares já registrados)
for(const a of ACHIEVEMENTS){ const t=achTier(a); if((S.ach[a.id]||0)<t) S.ach[a.id]=t; }
save();
render();
if(!S.profile.name) onboard(); else syncOnline(); // publica no ranking (Supabase) ao abrir
window.MEDQUEST_IMPORT = importCode; // util para debug/console
})();
