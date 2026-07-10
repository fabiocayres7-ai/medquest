/* ============================================================
   MedQuest 5 — App principal
   Lógica: perfil, XP/níveis, streak, conquistas, missões,
   quiz de raciocínio clínico, flashcards (SM-2) e ranking.
   ============================================================ */
(function(){
"use strict";
const { DISCIPLINES, QUESTIONS, FLASHCARDS } = window.MEDQUEST_DATA;
const CFG = window.MEDQUEST_CONFIG;
const LS_KEY = "medquest5_state_v1";

/* ---------- Níveis ---------- */
const LEVELS = [
  {min:0,    t:"Calouro"},
  {min:120,  t:"Interno"},
  {min:320,  t:"Plantonista"},
  {min:640,  t:"Residente"},
  {min:1100, t:"Preceptor"},
  {min:1750, t:"Especialista"},
  {min:2600, t:"Chefe de Equipe"},
  {min:3700, t:"Professor"},
  {min:5100, t:"Livre-Docente"},
  {min:7000, t:"Lenda da Mandic"},
];
function levelInfo(xp){
  let idx=0;
  for(let i=0;i<LEVELS.length;i++){ if(xp>=LEVELS[i].min) idx=i; }
  const cur=LEVELS[idx], next=LEVELS[idx+1]||null;
  const base=cur.min, ceil=next?next.min:cur.min;
  const pct = next ? Math.min(100,Math.round((xp-base)/(ceil-base)*100)) : 100;
  return {level:idx+1, title:cur.t, pct, toNext: next? ceil-xp : 0, next};
}

/* ---------- Conquistas ---------- */
const BADGES = [
  {id:"first",   em:"🎯", nm:"Primeiro Diagnóstico", ds:"Acerte 1 questão",           test:s=>s.stats.correct>=1},
  {id:"q50",     em:"📚", nm:"Estudante Dedicado",    ds:"Responda 50 questões",       test:s=>s.stats.answered>=50},
  {id:"q150",    em:"🏅", nm:"Centurião Clínico",     ds:"Responda 150 questões",      test:s=>s.stats.answered>=150},
  {id:"acc80",   em:"🎓", nm:"Olho Clínico",          ds:"80%+ de acerto (min 30 q)",  test:s=>s.stats.answered>=30 && s.stats.correct/s.stats.answered>=.8},
  {id:"streak7", em:"🔥", nm:"Rotina de Plantão",     ds:"7 dias seguidos estudando",  test:s=>s.streak.best>=7},
  {id:"streak30",em:"⚡", nm:"Maratonista",           ds:"30 dias seguidos",           test:s=>s.streak.best>=30},
  {id:"flash100",em:"🧠", nm:"Memória de Elefante",   ds:"Revise 100 flashcards",      test:s=>s.stats.reviews>=100},
  {id:"perfect", em:"💎", nm:"Alta sem Intercorrências", ds:"Simulado 100% (min 8 q)", test:s=>s.flags.perfectQuiz},
  {id:"immuno",  em:"🧬", nm:"Imunologista",          ds:"30 acertos em MAD II",       test:s=>(s.byDisc.mad?.correct||0)>=30},
  {id:"pharma",  em:"💊", nm:"Farmacologista",        ds:"20 acertos em Terapêutica",  test:s=>(s.byDisc.terap?.correct||0)>=20},
  {id:"generalist",em:"🩺",nm:"Clínico Geral",        ds:"1 acerto em cada disciplina",test:s=>Object.keys(DISCIPLINES).every(d=>(s.byDisc[d]?.correct||0)>=1)},
  {id:"lvl5",    em:"👑", nm:"Preceptor",             ds:"Alcance o nível 5",          test:s=>levelInfo(s.xp).level>=5},
];

/* ---------- Estado ---------- */
function freshState(){
  return {
    profile:{ id:"p_"+Math.abs(hash(String(navigator.userAgent+performance.now()+"x"))).toString(36), name:"", turma:CFG.TURMA },
    xp:0,
    stats:{answered:0, correct:0, reviews:0},
    byDisc:{},                    // {disc:{answered,correct}}
    seenQ:{},                     // {qid: {correct:bool, count}}
    srs:{},                       // {cardId:{ef,interval,reps,due}}
    streak:{count:0, best:0, last:null},
    missions:{date:null, list:[]},
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
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function $(sel,el=document){return el.querySelector(sel);}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

/* ---------- XP / streak / progresso ---------- */
function addXP(n){ S.xp+=n; }
function touchStreak(){
  const t=todayStr();
  if(S.streak.last===t) return;
  if(S.streak.last && daysBetween(S.streak.last,t)===1) S.streak.count++;
  else S.streak.count=1;
  S.streak.last=t;
  if(S.streak.count>S.streak.best) S.streak.best=S.streak.count;
}
function recordAnswer(disc, correct, difficulty){
  touchStreak();
  S.stats.answered++;
  if(!S.byDisc[disc]) S.byDisc[disc]={answered:0,correct:0};
  S.byDisc[disc].answered++;
  if(correct){ S.stats.correct++; S.byDisc[disc].correct++;
    const gain = 8*(difficulty||1) + Math.min(10, S.streak.count); addXP(gain); return gain;
  }
  addXP(2); return 2;
}
function discProgress(disc){
  const total=QUESTIONS.filter(q=>q.discipline===disc).length;
  const done=Object.keys(S.seenQ).filter(id=>{const q=QUESTIONS.find(x=>x.id===id);return q&&q.discipline===disc&&S.seenQ[id].correct;}).length;
  return {done, total, pct: total? Math.round(done/total*100):0};
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
function checkBadges(){
  const newly=[];
  for(const b of BADGES){ if(!S.badges.includes(b.id) && b.test(S)){ S.badges.push(b.id); newly.push(b);} }
  if(newly.length){ save(); showBadgeModal(newly[0]); }
}

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
  xp:S.xp, level:li.level, title:li.title, streak:S.streak.count,
  answered:S.stats.answered,
  accuracy:S.stats.answered? Math.round(S.stats.correct/S.stats.answered*100):0
};}
function localRanking(){
  const rows=[myRow(), ...S.friends.filter(f=>f.id!==S.profile.id)];
  return rows.sort((a,b)=>b.xp-a.xp);
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

/* ---- Supabase (online, opcional) ---- */
function online(){ return CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY; }
async function syncOnline(){
  if(!online() || !S.profile.name) return;
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
  }catch(e){ /* silencioso */ }
}
async function fetchOnline(){
  if(!online()) return null;
  try{
    const url=CFG.SUPABASE_URL+"/rest/v1/leaderboard?select=*&turma=eq."+encodeURIComponent(S.profile.turma)+"&order=xp.desc&limit=100";
    const res=await fetch(url,{headers:{ "apikey":CFG.SUPABASE_ANON_KEY, "Authorization":"Bearer "+CFG.SUPABASE_ANON_KEY }});
    if(!res.ok) return null;
    const data=await res.json();
    return data.map(d=>({id:d.player_id,name:d.name,xp:d.xp,level:d.level,streak:d.streak,
      answered:d.answered,accuracy:d.accuracy,title:(LEVELS[(d.level||1)-1]||LEVELS[0]).t}));
  }catch(e){ return null; }
}

/* ============================================================
   UI / RENDER
   ============================================================ */
let route="home";
let quiz=null;   // {pool, idx, correctCount, mode}
let flash=null;  // {pool, idx, flipped}

function render(){
  ensureMissions();
  renderTopbar();
  const main=$("#main"); main.innerHTML="";
  if(route==="home") viewHome(main);
  else if(route==="quiz") viewQuiz(main);
  else if(route==="flash") viewFlash(main);
  else if(route==="rank") viewRank(main);
  else if(route==="badges") viewBadges(main);
  renderNav();
  save();
}
function go(r){ route=r; if(r==="quiz"&&!quiz) quiz=null; if(r==="flash") flash=null; render(); window.scrollTo(0,0);}

function renderTopbar(){
  const li=levelInfo(S.xp);
  $("#playerchip").innerHTML =
    `<span class="lvl">Nv ${li.level}</span><span class="name">${esc(S.profile.name||"Jogador")}</span>`+
    `<span class="streak">🔥${S.streak.count}</span>`;
  $("#xptitle").textContent = `Nível ${li.level} · ${li.title}`;
  $("#xpsub").textContent = li.next ? `${S.xp} XP · faltam ${li.toNext} p/ ${li.next.t}` : `${S.xp} XP · nível máximo!`;
  $("#xpfill").style.width = li.pct+"%";
}

function renderNav(){
  const items=[["home","🏠","Início"],["quiz","❓","Questões"],["flash","🃏","Flashcards"],["rank","🏆","Ranking"],["badges","🎖️","Conquistas"]];
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
    tile("🎖️",S.badges.length+"/"+BADGES.length,"conquistas"),
  );
  m.appendChild(tiles);

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

  // Ações rápidas
  m.appendChild(el("div","sectitle","Jogar"));
  const acts=el("div","btnrow");
  const b1=el("button","btn","🎲 Desafio rápido (10 questões)"); b1.onclick=()=>startQuiz("all",10); acts.appendChild(b1);
  const b2=el("button","btn ghost","📝 Simulado (15 questões)"); b2.onclick=()=>startQuiz("all",15,true); acts.appendChild(b2);
  const b3=el("button","btn ghost","🃏 Revisar flashcards"); b3.onclick=()=>go("flash"); acts.appendChild(b3);
  m.appendChild(acts);

  // Disciplinas
  m.appendChild(el("div","sectitle","Estudar por disciplina"));
  const grid=el("div","grid cols2");
  for(const key in DISCIPLINES){
    const d=DISCIPLINES[key], p=discProgress(key);
    const qn=QUESTIONS.filter(q=>q.discipline===key).length;
    const fn=FLASHCARDS.filter(f=>f.discipline===key).length;
    const c=el("div","card disc");
    c.innerHTML=`<div class="ic">${d.icon}</div><div class="nm">${esc(d.name)}</div>
      <div class="meta">${qn} questões · ${fn} flashcards · ${p.done}/${p.total} dominadas</div>
      <div class="prog"><span style="width:${p.pct}%;background:${d.color}"></span></div>`;
    c.onclick=()=>startQuiz(key, Math.min(qn,12));
    grid.appendChild(c);
  }
  m.appendChild(grid);
}
function tile(em,big,lbl){ const t=el("div","tile"); t.innerHTML=`<div class="em">${em}</div><div class="big">${big}</div><div class="lbl">${lbl}</div>`; return t;}

/* ---------- QUIZ ---------- */
function startQuiz(disc, n, isSim=false){
  let pool = disc==="all"?QUESTIONS.slice():QUESTIONS.filter(q=>q.discipline===disc);
  // prioriza questões ainda não dominadas
  pool.sort((a,b)=>{ const sa=S.seenQ[a.id]?.correct?1:0, sb=S.seenQ[b.id]?.correct?1:0; return sa-sb;});
  pool = shuffle(pool.slice(0, Math.max(n, Math.min(pool.length,n*2)))).slice(0,n);
  quiz={pool, idx:0, correctCount:0, answered:false, mode:isSim?"sim":"quiz", total:pool.length};
  go("quiz");
}
function viewQuiz(m){
  if(!quiz){ const p=el("div","card center"); p.innerHTML=`<p class="muted">Escolha um modo na tela inicial.</p>`;
    const b=el("button","btn mt","🎲 Desafio rápido");b.onclick=()=>startQuiz("all",10);p.appendChild(b); m.appendChild(p); return; }
  if(quiz.idx>=quiz.pool.length){ return quizResult(m); }
  const q=quiz.pool[quiz.idx];
  const d=DISCIPLINES[q.discipline];

  const head=el("div","card");
  const dl=["","Base","Intermediária","Desafio"][q.difficulty];
  head.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
    <span class="pill">${d.icon} ${esc(d.name)} · ${q.phase}</span>
    <span class="diffbadge d${q.difficulty}">${dl}</span></div>
    <div class="muted small mt">Questão ${quiz.idx+1} de ${quiz.pool.length}</div>`;
  m.appendChild(head);

  const body=el("div","card mt");
  if(q.vignette) body.appendChild(el("div","q-vignette",esc(q.vignette)));
  body.appendChild(el("div","q-stem",esc(q.question)));
  const opts=el("div");
  q.options.forEach((opt,i)=>{
    const b=el("button","opt",`<span class="k">${String.fromCharCode(65+i)}</span>${esc(opt)}`);
    b.onclick=()=>answer(i,body,opts,q);
    opts.appendChild(b);
  });
  body.appendChild(opts);
  m.appendChild(body);
}
function answer(i,body,opts,q){
  if(quiz.answered) return;
  quiz.answered=true;
  const correct = i===q.answer;
  const gain = recordAnswer(q.discipline, correct, q.difficulty);
  if(!S.seenQ[q.id]) S.seenQ[q.id]={correct:false,count:0};
  S.seenQ[q.id].count++; if(correct) S.seenQ[q.id].correct=true;
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
  const pct=Math.round(quiz.correctCount/quiz.total*100);
  if(quiz.mode==="sim" && quiz.total>=8 && pct===100){ S.flags.perfectQuiz=true; save(); checkBadges(); }
  const c=el("div","card center");
  const em = pct>=80?"🏆":pct>=60?"👏":"📖";
  c.innerHTML=`<div style="font-size:52px">${em}</div>
    <h2>${quiz.correctCount}/${quiz.total} acertos (${pct}%)</h2>
    <p class="muted">${pct>=80?"Excelente! Você dominou este bloco.":pct>=60?"Bom trabalho — revise os erros.":"Continue treinando, o próximo vai melhor!"}</p>`;
  const row=el("div","btnrow center mt");row.style.justifyContent="center";
  const b1=el("button","btn","🔁 Jogar de novo");b1.onclick=()=>startQuiz("all",quiz.total,quiz.mode==="sim");
  const b2=el("button","btn ghost","🏠 Início");b2.onclick=()=>{quiz=null;go("home");};
  row.append(b1,b2);
  c.appendChild(row);
  m.appendChild(c);
  quiz.pool=[]; // trava reentrada
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

/* ---------- RANKING ---------- */
function viewRank(m){
  const head=el("div","card");
  head.innerHTML=`<h3>🏆 Ranking — ${esc(S.profile.turma)}</h3>
    <p class="muted small">${online()?"Modo online (Supabase) ativo — atualiza automaticamente.":"Modo local — compartilhe seu código com os colegas para comparar."}</p>`;
  m.appendChild(head);

  const list=el("div","mt"); list.id="ranklist";
  renderRankList(list, localRanking());
  m.appendChild(list);

  if(online()){
    fetchOnline().then(rows=>{ if(rows&&rows.length){ // garante que 'eu' apareça
      if(!rows.find(r=>r.id===S.profile.id)) rows.push(myRow());
      rows.sort((a,b)=>b.xp-a.xp); renderRankList(list,rows);
    }});
  }

  // Ferramentas de código local
  const tools=el("div","card mt");
  tools.innerHTML=`<h3>👥 Estudar com colegas (modo local)</h3>
    <p class="muted small mb">Envie seu <b>código de jogador</b> para os colegas e cole o deles aqui. Assim vocês aparecem no mesmo ranking mesmo sem servidor.</p>`;
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
      <div class="xp">${r.xp} XP</div>`;
    container.appendChild(row);
  });
  if(rows.length<=1){ container.appendChild(el("div","muted small center mt","Adicione colegas abaixo para começar a competição! 👇")); }
}

/* ---------- BADGES ---------- */
function viewBadges(m){
  m.appendChild(el("div","sectitle",`Conquistas (${S.badges.length}/${BADGES.length})`));
  const grid=el("div","grid cols3");
  BADGES.forEach(b=>{
    const has=S.badges.includes(b.id);
    const c=el("div","badge"+(has?"":" locked"));
    c.innerHTML=`<div class="em">${b.em}</div><div class="nm">${esc(b.nm)}</div><div class="ds">${esc(b.ds)}</div>`;
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

  // Reset
  const rc=el("div","center mt");
  const rb=el("button","btn ghost sm","⟲ Reiniciar progresso"); rb.onclick=()=>{ if(confirm("Apagar TODO o seu progresso? Não dá para desfazer.")){ localStorage.removeItem(LS_KEY); S=freshState(); onboard(); } };
  rc.appendChild(rb); m.appendChild(rc);
}

/* ---------- Modais / toast ---------- */
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); }
function showBadgeModal(b){
  const bg=el("div","modal-bg"); const mo=el("div","modal");
  mo.innerHTML=`<div class="em">${b.em}</div><h2>Conquista desbloqueada!</h2><p><b>${esc(b.nm)}</b><br>${esc(b.ds)}</p>`;
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
render();
if(!S.profile.name) onboard();
window.MEDQUEST_IMPORT = importCode; // util para debug/console
})();
