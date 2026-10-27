/* =========================================================================
   ZERV LEVEL UP — shared config, storage & scoring engine.
   Included by every page (index.html, chronicle.html, honors.html) before
   that page's own inline script. All game state lives in localStorage, so
   pages stay in sync purely by reading/writing the same keys — no SPA
   routing needed.

   Scoring is deliberately "floor at zero": a day's (and therefore a week's
   and all-time's) score can never go negative. Wipeouts (vices) only ever
   cancel out that day's Wins down to zero — they can't create a debt that
   carries forward. See NOTES.md for the full reasoning.
   ========================================================================= */

const DEEDS = [
  { id:"zerv_post_ig", name:"ZERV Post — Instagram", icon:"📸", type:"flat", points:300, priority:true },
  { id:"zerv_post_tiktok", name:"ZERV Post — TikTok", icon:"🎵", type:"flat", points:300, priority:true },
  { id:"sprint_training", name:"Sprint Training", icon:"🏃", type:"flat", points:300 },
  { id:"strength_training", name:"Strength Training", icon:"🏋️", type:"flat", points:250 },
  { id:"surf_session", name:"Surf Session", icon:"🏄", type:"flat", points:300 },
  { id:"coding", name:"Coding", icon:"💻", type:"tiered", unit:"min", tiers:[
      {n:15, points:150, label:"15 min"}, {n:30, points:300, label:"30 min"},
      {n:45, points:450, label:"45 min"}, {n:60, points:600, label:"60 min"} ] },
  { id:"reading", name:"Read", icon:"📖", type:"tiered", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"journaling", name:"Journal", icon:"📓", type:"tiered", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"shape_board", name:"Shape a Board", icon:"🪵", type:"repeatable", points:1000, bonus:true }
];

const VICES = [
  { id:"weed", name:"Smoking Marijuana", icon:"🌿", type:"stacking", points:-100 },
  { id:"alcohol", name:"Drinking Alcohol", icon:"🍺", type:"stacking", points:-100 },
  { id:"personal_vice", name:"Masturbating", icon:"🔞", type:"tiered_count", tiers:[
      {n:1, points:-50}, {n:2, points:-150}, {n:3, points:-200} ] },
  { id:"food_spending", name:"Spending Money on Food", icon:"🍔", type:"tiered_count", tiers:[
      {n:1, points:-50}, {n:2, points:-100}, {n:3, points:-200} ] },
  { id:"purchases", name:"Purchases (non-food)", icon:"🛍️", type:"amount_each", ranges:[
      {min:0, max:25, points:-25}, {min:25, max:75, points:-50},
      {min:75, max:150, points:-100}, {min:150, max:Infinity, points:-200} ] }
];

const WEEKLY_GOALS = [
  { id:"schoolwork", name:"Schoolwork", icon:"🎓", points:750 },
  { id:"personalGoal", name:"Personal Goal", icon:"🎯", points:750 },
  { id:"businessGoal", name:"Business Goal", icon:"🚀", points:750 }
];

const RANK_TIERS = [
  { score:0,       rank:"Grom",             board:"Foam Pop-Out",         boardIcon:"🏄", gear:"Boardshorts",          gearIcon:"🩳" },
  { score:2500,    rank:"Rookie Rider",      board:"Longboard",            boardIcon:"🏄", gear:"Rash Guard",           gearIcon:"👕" },
  { score:7500,    rank:"Wave Chaser",       board:"Funboard",             boardIcon:"🏄‍♂️", gear:"Spring Suit",          gearIcon:"🤿" },
  { score:15000,   rank:"Shortboarder",      board:"Performance Shortboard", boardIcon:"🏄", gear:"Full Wetsuit",        gearIcon:"🖤" },
  { score:30000,   rank:"Barrel Hunter",     board:"Step-Up Gun",          boardIcon:"🌊", gear:"Pro Wetsuit",          gearIcon:"⚡" },
  { score:60000,   rank:"Big Wave Charger",  board:"Tow-In Gun",           boardIcon:"🔥", gear:"Big Wave Vest",        gearIcon:"🦺" },
  { score:100000,  rank:"ZERV Legend",       board:"Golden ZERV Board",    boardIcon:"🏆", gear:"Championship Jersey",  gearIcon:"👑" }
];

const ACHIEVEMENTS = [
  { id:"first_win", name:"First Win", icon:"🌟", desc:"Log your very first Win.",
    check:a => a.totalDeedEvents >= 1 },
  { id:"perfect_day", name:"Perfect Day", icon:"🎉", desc:"Log every single daily category in one day.",
    check:a => a.everyCategoryDay },
  { id:"consistency_7", name:"On a Roll", icon:"🔁", desc:"7-day streak logging at least one Win every day.",
    check:a => a.longestDeedStreak >= 7 },
  { id:"grind_30", name:"30-Day Grind", icon:"🔥", desc:"30-day streak with a Win logged every day.",
    check:a => a.longestDeedStreak >= 30 },
  { id:"sprint_streak_7", name:"Speed Streak", icon:"⚡", desc:"7-day streak of Sprint Training.",
    check:a => a.longestSprintStreak >= 7 },
  { id:"code_streak_7", name:"Code Streak", icon:"👨‍💻", desc:"7-day streak of Coding.",
    check:a => a.longestCodeStreak >= 7 },
  { id:"social_streak_7", name:"Content Machine", icon:"📱", desc:"7-day streak posting ZERV on both Instagram and TikTok.",
    check:a => a.longestSocialStreak >= 7 },
  { id:"big_day", name:"Epic Session", icon:"💥", desc:"Score 2,000+ points in a single day.",
    check:a => a.maxDayScore >= 2000 },
  { id:"century_club", name:"Century Club", icon:"💯", desc:"100 total Wins/Wipeouts logged, lifetime.",
    check:a => a.totalLogEvents >= 100 },
  { id:"rank_rookie", name:"Rookie Rider", icon:"🏄", desc:"Reach Rookie Rider rank.", check:a => a.allTime >= 2500 },
  { id:"rank_chaser", name:"Wave Chaser", icon:"🌊", desc:"Reach Wave Chaser rank.", check:a => a.allTime >= 7500 },
  { id:"rank_shortboarder", name:"Shortboarder", icon:"🏄‍♂️", desc:"Reach Shortboarder rank.", check:a => a.allTime >= 15000 },
  { id:"rank_barrel", name:"Barrel Hunter", icon:"🛢️", desc:"Reach Barrel Hunter rank.", check:a => a.allTime >= 30000 },
  { id:"rank_bigwave", name:"Big Wave Charger", icon:"🔥", desc:"Reach Big Wave Charger rank.", check:a => a.allTime >= 60000 },
  { id:"rank_legend", name:"ZERV Legend", icon:"🏆", desc:"Reach ZERV Legend rank.", check:a => a.allTime >= 100000 },
  { id:"hat_trick", name:"Hat Trick", icon:"🎩", desc:"Complete Schoolwork, Personal Goal, and Business Goal in the same week.",
    check:a => a.hasHatTrickWeek },
  { id:"business_streak_4", name:"Founder Mode", icon:"🚀", desc:"Business Goal completed 4 weeks in a row.",
    check:a => a.businessGoalStreak >= 4 },
  { id:"bookworm", name:"Bookworm", icon:"📚", desc:"Reading logged on 30 different days.",
    check:a => a.readingDays >= 30 },
  { id:"reflective", name:"Reflective Mind", icon:"📓", desc:"Journaling logged on 30 different days.",
    check:a => a.journalDays >= 30 },
  { id:"track_star", name:"Track Star", icon:"🥇", desc:"Sprint Training logged on 30 different days.",
    check:a => a.sprintDays >= 30 },
  { id:"days_50", name:"Dedicated", icon:"🗓️", desc:"Data logged on 50 different days, lifetime.",
    check:a => a.distinctLoggedDays >= 50 },
  { id:"board_breaker", name:"Board Breaker", icon:"🪵", desc:"Shape 5 boards, lifetime.",
    check:a => a.boardsShaped >= 5 },
  { id:"board_master", name:"Shaper Pro", icon:"🏆", desc:"Shape 10 boards, lifetime.",
    check:a => a.boardsShaped >= 10 }
];

/* =========================================================================
   STORAGE
   ========================================================================= */
const DAY_PREFIX = "gameoflife:day:";
const WEEK_PREFIX = "gameoflife:week:";
const ACH_KEY = "gameoflife:achievements";
const PROFILE_KEY = "gameoflife:profile";

function defaultDay(){ return { deeds:{}, vices:{}, locked:false }; }
function defaultWeek(){ return { schoolwork:false, personalGoal:false, businessGoal:false }; }

const state = { days:{}, weeks:{}, achievements:{} };

function loadAll(){
  for(let i=0;i<localStorage.length;i++){
    const key = localStorage.key(i);
    if(key.startsWith(DAY_PREFIX)){
      try{
        const raw = JSON.parse(localStorage.getItem(key));
        if(raw && raw.follies && !raw.vices) raw.vices = raw.follies; // migrate old field name
        state.days[key.slice(DAY_PREFIX.length)] = Object.assign(defaultDay(), raw);
      }catch(e){}
    } else if(key.startsWith(WEEK_PREFIX)){
      try{ state.weeks[key.slice(WEEK_PREFIX.length)] = Object.assign(defaultWeek(), JSON.parse(localStorage.getItem(key))); }catch(e){}
    }
  }
  try{ state.achievements = JSON.parse(localStorage.getItem(ACH_KEY)) || {}; }catch(e){ state.achievements = {}; }
  if(!localStorage.getItem(PROFILE_KEY)){
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ schemaVersion:2, createdAt: new Date().toISOString() }));
  }
}
function saveDay(date){
  localStorage.setItem(DAY_PREFIX + date, JSON.stringify(state.days[date]));
}
function saveWeek(weekStart){
  localStorage.setItem(WEEK_PREFIX + weekStart, JSON.stringify(state.weeks[weekStart]));
}
function saveAchievements(){
  localStorage.setItem(ACH_KEY, JSON.stringify(state.achievements));
}
function getDay(date){
  if(!state.days[date]) state.days[date] = defaultDay();
  return state.days[date];
}
function getWeek(weekStart){
  if(!state.weeks[weekStart]) state.weeks[weekStart] = defaultWeek();
  return state.weeks[weekStart];
}

/* =========================================================================
   DATE HELPERS (local time, Monday-start weeks)
   ========================================================================= */
function pad(n){ return String(n).padStart(2,"0"); }
function dateStr(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function todayStr(){ return dateStr(new Date()); }
function parseDate(s){ const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); }
function addDays(s, n){ const d = parseDate(s); d.setDate(d.getDate()+n); return dateStr(d); }
function weekStartOf(s){
  const d = parseDate(s);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return dateStr(d);
}

/* =========================================================================
   SCORING ENGINE
   ========================================================================= */
function deedDef(id){ return DEEDS.find(d=>d.id===id); }
function viceDef(id){ return VICES.find(v=>v.id===id); }

function tierPointsByN(tiers, n){
  let bestN = -1, bestPoints = 0;
  for(const t of tiers){ if(n >= t.n && t.n > bestN){ bestN = t.n; bestPoints = t.points; } }
  return bestPoints;
}
function amountPoints(ranges, amount){
  for(const r of ranges){ if(amount >= r.min && amount < r.max) return r.points; }
  return ranges[ranges.length-1].points;
}

function dayDeedPoints(day, id){
  const def = deedDef(id);
  const rec = day.deeds[id];
  if(!rec) return 0;
  if(def.type === "flat") return rec.on ? def.points : 0;
  if(def.type === "tiered") return rec.points || 0;
  if(def.type === "repeatable") return (rec.entries||[]).reduce((s,e)=>s+e.points,0);
  return 0;
}
function dayDeedsTotal(day){ return DEEDS.reduce((s,d)=>s + dayDeedPoints(day, d.id), 0); }

function dayVicePoints(day, id){
  const def = viceDef(id);
  const rec = day.vices[id];
  if(!rec) return 0;
  if(def.type === "stacking") return (rec.count||0) * def.points;
  if(def.type === "tiered_count") return tierPointsByN(def.tiers, rec.count||0);
  if(def.type === "amount_each") return (rec.entries||[]).reduce((s,e)=>s+e.points,0);
  return 0;
}
function dayVicesTotal(day){ return VICES.reduce((s,v)=>s + dayVicePoints(day, v.id), 0); }

/* The core "stay encouraging" rule: a day's net score can never go below
   zero. Wipeouts only ever eat into that day's Wins — they can't create a
   debt that drags your Week or All-Time total backwards. */
function dayNetScore(date){
  const day = state.days[date];
  if(!day) return 0;
  return Math.max(0, dayDeedsTotal(day) + dayVicesTotal(day));
}
function weeklyGoalsBonus(weekStart){
  const w = getWeek(weekStart);
  return WEEKLY_GOALS.reduce((s,g)=> s + (w[g.id] ? g.points : 0), 0);
}
function weekNetScore(weekStart){
  let total = weeklyGoalsBonus(weekStart);
  for(let i=0;i<7;i++){ total += dayNetScore(addDays(weekStart, i)); }
  return total;
}
function allTimeScore(){
  let total = 0;
  for(const date in state.days){ total += dayNetScore(date); }
  for(const wk in state.weeks){ total += weeklyGoalsBonus(wk); }
  return total;
}

function rankInfoForScore(score){
  let cur = RANK_TIERS[0], next = RANK_TIERS[1] || null, idx = 0;
  for(let i=0;i<RANK_TIERS.length;i++){
    if(score >= RANK_TIERS[i].score){ cur = RANK_TIERS[i]; idx = i; next = RANK_TIERS[i+1] || null; }
  }
  return { cur, next, idx };
}

function computeWeeklyGoalStreak(goalId, uptoWeekStart){
  let streak = 0;
  let cursor = uptoWeekStart;
  while(state.weeks[cursor] && state.weeks[cursor][goalId]){
    streak++;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

/* =========================================================================
   ACHIEVEMENT AGGREGATES — scans the entire stored history every call.
   ========================================================================= */
function computeAggregates(){
  const dates = Object.keys(state.days).sort();
  const agg = {
    allTime: allTimeScore(),
    totalDeedEvents: 0, totalLogEvents: 0,
    everyCategoryDay: false,
    maxDayScore: 0,
    longestDeedStreak: 0, longestSprintStreak: 0, longestCodeStreak: 0, longestSocialStreak: 0,
    journalDays: 0, readingDays: 0, sprintDays: 0, boardsShaped: 0,
    distinctLoggedDays: 0,
    hasHatTrickWeek: Object.values(state.weeks).some(w => w.schoolwork && w.personalGoal && w.businessGoal),
    businessGoalStreak: computeWeeklyGoalStreak("businessGoal", weekStartOf(todayStr()))
  };
  if(dates.length === 0) return agg;

  const minDate = dates[0];
  const maxDate = dates[dates.length-1] < todayStr() ? dates[dates.length-1] : todayStr();

  let deedRun = 0, sprintRun = 0, codeRun = 0, socialRun = 0;
  let cursor = minDate;
  let guard = 0;
  while(cursor <= maxDate && guard < 3660){
    const day = state.days[cursor];
    if(day){
      const deedsTotal = dayDeedsTotal(day);
      const net = dayNetScore(cursor);
      const hasAnyDeed = deedsTotal > 0;
      const hasAnything = Object.keys(day.deeds).length > 0 || Object.keys(day.vices).length > 0;

      if(hasAnything) agg.distinctLoggedDays++;

      for(const d of DEEDS){
        const rec = day.deeds[d.id];
        if(!rec) continue;
        if(d.type === "flat" && rec.on){ agg.totalDeedEvents++; agg.totalLogEvents++; }
        else if(d.type === "tiered" && rec.n){ agg.totalDeedEvents++; agg.totalLogEvents++; }
        else if(d.type === "repeatable" && rec.entries){ agg.totalDeedEvents += rec.entries.length; agg.totalLogEvents += rec.entries.length; }
      }
      for(const v of VICES){
        const rec = day.vices[v.id];
        if(!rec) continue;
        if(v.type === "stacking" && rec.count) agg.totalLogEvents += rec.count;
        else if(v.type === "tiered_count" && rec.count) agg.totalLogEvents += rec.count;
        else if(v.type === "amount_each" && rec.entries) agg.totalLogEvents += rec.entries.length;
      }

      if(day.deeds.journaling && day.deeds.journaling.n) agg.journalDays++;
      if(day.deeds.reading && day.deeds.reading.n) agg.readingDays++;
      if(day.deeds.sprint_training && day.deeds.sprint_training.on) agg.sprintDays++;
      agg.boardsShaped += (day.deeds.shape_board && day.deeds.shape_board.entries || []).length;

      const allCatsLogged = DEEDS.filter(d=>!d.bonus).every(d => {
        const rec = day.deeds[d.id];
        if(!rec) return false;
        if(d.type === "flat") return !!rec.on;
        if(d.type === "tiered") return !!rec.n;
        return false;
      });
      if(allCatsLogged) agg.everyCategoryDay = true;

      if(hasAnything && net > agg.maxDayScore) agg.maxDayScore = net;

      if(hasAnyDeed) deedRun++; else deedRun = 0;
      agg.longestDeedStreak = Math.max(agg.longestDeedStreak, deedRun);

      const sprintOn = day.deeds.sprint_training && day.deeds.sprint_training.on;
      if(sprintOn) sprintRun++; else sprintRun = 0;
      agg.longestSprintStreak = Math.max(agg.longestSprintStreak, sprintRun);

      const codeOn = day.deeds.coding && day.deeds.coding.n;
      if(codeOn) codeRun++; else codeRun = 0;
      agg.longestCodeStreak = Math.max(agg.longestCodeStreak, codeRun);

      const bothSocial = (day.deeds.zerv_post_ig && day.deeds.zerv_post_ig.on) && (day.deeds.zerv_post_tiktok && day.deeds.zerv_post_tiktok.on);
      if(bothSocial) socialRun++; else socialRun = 0;
      agg.longestSocialStreak = Math.max(agg.longestSocialStreak, socialRun);
    } else {
      deedRun = 0; sprintRun = 0; codeRun = 0; socialRun = 0;
    }
    cursor = addDays(cursor, 1);
    guard++;
  }
  return agg;
}

/* Checks every Achievement against full history, unlocking + persisting +
   toasting any newly-earned ones. Safe to call from any page after any
   state-changing action, and once on load. Does not touch the DOM grid. */
function checkAndUnlockAchievements(){
  const agg = computeAggregates();
  for(const a of ACHIEVEMENTS){
    if(state.achievements[a.id]) continue;
    if(a.check(agg)){
      state.achievements[a.id] = todayStr();
      saveAchievements();
      showToast(`🏆 Medal earned: ${a.name}`);
    }
  }
}

/* =========================================================================
   CROSS-PAGE UI HELPERS (toasts, popups, scoreboard, rank-up detection)
   ========================================================================= */
function popupAt(text, positive){
  const el = document.createElement("div");
  el.className = "pop " + (positive ? "pos":"neg");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1150);
}
function showToast(msg){
  const layer = document.getElementById("toastLayer");
  if(!layer) return;
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  layer.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}
function flashLevelUp(){
  const f = document.createElement("div");
  f.style.cssText = "position:fixed;inset:0;z-index:998;pointer-events:none;background:radial-gradient(circle,var(--zerv-heading) 0%,transparent 70%);opacity:0.5;animation:flashLU .7s ease-out forwards;";
  document.body.appendChild(f);
  setTimeout(()=>f.remove(), 750);
}

/* Fills #scoreToday / #scoreWeek / #scoreAllTime if present on the page. */
function renderScoreboard(){
  if(!document.getElementById("scoreToday")) return;
  const t = todayStr();
  const wk = weekStartOf(t);
  setScoreTile("scoreToday", dayNetScore(t));
  setScoreTile("scoreWeek", weekNetScore(wk));
  setScoreTile("scoreAllTime", allTimeScore());
}
function setScoreTile(id, val){
  const el = document.getElementById(id);
  if(!el) return;
  const prev = el.dataset.val;
  el.textContent = val.toLocaleString();
  el.dataset.val = val;
  if(prev !== undefined && Number(prev) !== val){
    el.classList.remove("pulse");
    void el.offsetWidth; // restart the animation
    el.classList.add("pulse");
  }
}

/* =========================================================================
   SCENE INTERACTIVITY — scroll/pointer parallax on the beach background,
   plus a click-the-sun/click-the-badge sparkle easter egg. Entirely skipped
   under prefers-reduced-motion. Call once per page after the DOM is ready.
   ========================================================================= */
function initSceneInteractivity(){
  const bg = document.getElementById("bgwash");
  if(!bg) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  function updateScroll(){
    document.documentElement.style.setProperty("--scrollY", window.scrollY);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if(!ticking){ requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive:true });

  if(window.matchMedia("(hover: hover)").matches){
    window.addEventListener("mousemove", (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty("--mx", mx.toFixed(3));
      document.documentElement.style.setProperty("--my", my.toFixed(3));
    }, { passive:true });
  }

  document.querySelectorAll(".sun, .moon, .zerv-badge").forEach(el => {
    el.addEventListener("click", () => sparkleBurst(el));
  });
}
function sparkleBurst(el){
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
  for(let i=0;i<12;i++){
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    const angle = Math.random()*Math.PI*2;
    const dist = 36 + Math.random()*70;
    s.style.setProperty("--dx", (Math.cos(angle)*dist).toFixed(1) + "px");
    s.style.setProperty("--dy", (Math.sin(angle)*dist).toFixed(1) + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
}

/* Fills the Surfer Profile widget if present on the page, and toasts a
   rank-up (comparing against __lastRankIdx, tracked per page-load). */
let __lastRankIdx = null;
function renderSurferProfile(){
  const all = allTimeScore();
  const { cur, next, idx } = rankInfoForScore(all);
  if(__lastRankIdx === null) __lastRankIdx = idx;

  if(document.getElementById("rankName")){
    document.getElementById("rankName").textContent = cur.rank;
    document.getElementById("boardIcon").textContent = cur.boardIcon;
    document.getElementById("boardName").textContent = cur.board;
    document.getElementById("gearIcon").textContent = cur.gearIcon;
    document.getElementById("gearName").textContent = cur.gear;

    const fill = document.getElementById("rankProgressFill");
    const label = document.getElementById("rankProgressLabel");
    if(next){
      const span = next.score - cur.score;
      const into = Math.max(0, all - cur.score);
      const pct = Math.min(100, (into/span)*100);
      fill.style.width = pct + "%";
      label.textContent = `${into.toLocaleString()} / ${span.toLocaleString()} to ${next.rank}`;
    } else {
      fill.style.width = "100%";
      label.textContent = `${all.toLocaleString()} — you've reached ZERV Legend status`;
    }
  }

  if(idx > __lastRankIdx){
    showToast(`🏆 Rank up! You are now a ${cur.rank}!`);
    flashLevelUp();
  }
  __lastRankIdx = idx;
}

loadAll();
