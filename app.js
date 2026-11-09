/* =========================================================================
   ZERV LEVEL UP — shared config, storage & scoring engine.

   Four sectors, one system:
     - Entity        (Colosseum)       physical + spiritual habits, vices
     - Entrepreneur  (Surf Shack)      ZERV / DeskGenie / future businesses
     - Education     (Wall Street)     classes, deadlines, finance mastery
     - Elixir        (Workshop)        hobby mastery: surfboards, code, EE, art

   Every sector's logged actions land in ONE shared day record and roll up
   into ONE all-time score / rank, so leveling up is one coherent system
   rather than four disconnected trackers. Included by every page before
   that page's own inline script — all state lives in localStorage.

   Scoring stays "floor at zero": a day's combined score across every
   sector can never go negative. Vices (logged under Entity) only ever
   cancel out that day's combined Wins down to zero, across ALL sectors —
   they can't create a debt that carries forward. See NOTES.md.
   ========================================================================= */

/* =========================================================================
   ENTITY — Colosseum. Physical + spiritual habits, vices, weekly goals.
   ========================================================================= */
const DEEDS = [
  { id:"sprint_training", name:"Sprint Training", icon:"🏃", type:"flat", points:300 },
  { id:"strength_training", name:"Strength Training", icon:"🏋️", type:"flat", points:250 },
  { id:"surf_session", name:"Surf Session", icon:"🏄", type:"flat", points:300 },
  { id:"reading", name:"Read", icon:"📖", type:"tiered", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"journaling", name:"Journal", icon:"📓", type:"tiered", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] }
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

/* Weekly goals span all four sectors but share one mechanic: a per-week
   checkbox worth a flat bonus, no penalty for skipping a week. Each is
   rendered on its own sector's page (Schoolwork -> Education, Business
   Goal -> Entrepreneur, Personal/Spiritual -> Entity) even though the
   underlying storage is one unified per-week record. */
const WEEKLY_GOALS = [
  { id:"schoolwork", name:"Schoolwork", icon:"🎓", points:750, sector:"education" },
  { id:"personalGoal", name:"Personal Goal", icon:"🎯", points:750, sector:"entity" },
  { id:"spiritualGoal", name:"Spiritual Goal", icon:"🙏", points:750, sector:"entity" },
  { id:"businessGoal", name:"Business Goal", icon:"🚀", points:750, sector:"entrepreneur" }
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

/* The Sprint Quest deadline: 21st birthday. Today (per the request) the
   user is 19, born Dec 18 — so the next birthday (Dec 18, 2026) is the
   20th, and the 21st falls on Dec 18, 2027. Event/times are entirely
   self-configured (see SPRINT_GOAL_KEY below) rather than guessed, since
   gender/event/current PR weren't given and guessing wrong would make the
   whole sector's headline goal meaningless. */
const SPRINT_DEADLINE = "2027-12-18";

/* =========================================================================
   ENTREPRENEUR — Surf Shack. Businesses, tasks, journal, daily content.
   ========================================================================= */
const ENTREPRENEUR_DAILY = [
  { id:"zerv_post_ig", name:"ZERV Post — Instagram", icon:"📸", type:"flat", points:300, priority:true },
  { id:"zerv_post_tiktok", name:"ZERV Post — TikTok", icon:"🎵", type:"flat", points:300, priority:true }
];
const BUSINESS_TASK_POINTS = 100;   /* completing any business to-do */
const BUSINESS_JOURNAL_POINTS = 50; /* logging a journal/notes entry */

/* =========================================================================
   EDUCATION — Wall Street Trading Floor. Classes, deadlines, mastery.
   ========================================================================= */
const FINANCE_TOPICS = [
  { id:"accounting", name:"Accounting Fundamentals", icon:"📒", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"statements", name:"Financial Statements & Ratios", icon:"📊", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"corp_finance", name:"Corporate Finance", icon:"🏦", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"investing", name:"Investing & Markets", icon:"📈", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] },
  { id:"valuation", name:"Valuation & Deal-Making", icon:"🤝", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"}, {n:60, points:500, label:"60 min"} ] }
];
/* A Wall Street job-title ladder per topic, driven by that topic's own
   lifetime point total (not the overall all-time score). */
const MASTERY_TITLES = [
  { score:0,     title:"Intern" },
  { score:500,   title:"Analyst" },
  { score:1500,  title:"Associate" },
  { score:3500,  title:"Vice President" },
  { score:7000,  title:"Director" },
  { score:12000, title:"Managing Director" }
];
const ASSIGNMENT_DUE_SOON_DAYS = 3; /* highlight/alert window */
const ASSIGNMENT_DONE_POINTS = 150; /* flat bonus for completing any assignment */

/* =========================================================================
   ELIXIR — The Workshop. Hobby mastery: surfboards, code, EE, art.
   ========================================================================= */
const HOBBIES = [
  { id:"surfboard_making", name:"Surfboard Making", icon:"🪵", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"},
      {n:45, points:300, label:"45 min"}, {n:60, points:400, label:"60 min"} ],
    milestones:[
      "Learn board anatomy & foam blank types (PU vs EPS)",
      "Shape your first blank using a template",
      "Master rail shaping and bottom contours (concave, vee)",
      "Learn fin setup (thruster, quad, single)",
      "Glass your first board (resin, fiberglass, lamination)",
      "Sand and polish to a pro-level finish",
      "Design and shape a fully custom board from your own template"
    ] },
  { id:"coding", name:"Coding", icon:"💻", unit:"min", tiers:[
      {n:15, points:150, label:"15 min"}, {n:30, points:300, label:"30 min"},
      {n:45, points:450, label:"45 min"}, {n:60, points:600, label:"60 min"} ],
    milestones:[
      "Learn core syntax of one language (variables, loops, functions)",
      "Build and ship a small CLI tool or script",
      "Learn data structures & algorithms fundamentals",
      "Build a full web app (frontend + backend + database)",
      "Learn version control & collaborate on a real project",
      "Deploy a production app that real users use",
      "Architect a system from scratch (design docs, scaling, tradeoffs)"
    ] },
  { id:"electrical", name:"Electrical Engineering", icon:"🔌", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"},
      {n:45, points:300, label:"45 min"}, {n:60, points:400, label:"60 min"} ],
    milestones:[
      "Learn circuit basics (Ohm's law, series/parallel circuits)",
      "Build your first breadboard circuit (LED + resistor + switch)",
      "Learn to read datasheets & use a multimeter",
      "Build a project with a microcontroller (Arduino/ESP32)",
      "Design and order your first PCB",
      "Learn power systems basics (AC/DC, batteries, motor drivers)",
      "Design and build a complete original electronics product"
    ] },
  { id:"art", name:"Art", icon:"🎨", unit:"min", tiers:[
      {n:15, points:100, label:"15 min"}, {n:30, points:200, label:"30 min"},
      {n:45, points:300, label:"45 min"}, {n:60, points:400, label:"60 min"} ],
    milestones:[
      "Learn fundamentals: line, shape, value, perspective",
      "Practice daily observational sketching",
      "Learn color theory & develop a personal palette",
      "Complete a series of studies in one medium",
      "Develop a consistent personal style across pieces",
      "Build a complete portfolio / body of work",
      "Produce a signature piece worth exhibiting or selling"
    ] }
];
const MASTERY_LEVEL_NAMES = ["Novice","Apprentice","Apprentice","Practitioner","Practitioner","Skilled","Advanced","Master"];
const SHAPE_BOARD_BONUS = { id:"shape_board", name:"Shape a Board", icon:"🏄", points:1000 };

const ACHIEVEMENTS = [
  { id:"first_win", name:"First Win", icon:"🌟", desc:"Log your very first Win, anywhere in the system.",
    check:a => a.totalDeedEvents >= 1 },
  { id:"consistency_7", name:"On a Roll", icon:"🔁", desc:"7-day streak logging at least one Win every day.",
    check:a => a.longestDeedStreak >= 7 },
  { id:"grind_30", name:"30-Day Grind", icon:"🔥", desc:"30-day streak with a Win logged every day.",
    check:a => a.longestDeedStreak >= 30 },
  { id:"sprint_streak_7", name:"Speed Streak", icon:"⚡", desc:"7-day streak of Sprint Training.",
    check:a => a.longestSprintStreak >= 7 },
  { id:"track_star", name:"Track Star", icon:"🥇", desc:"Sprint Training logged on 30 different days.",
    check:a => a.sprintDays >= 30 },
  { id:"personal_record", name:"Personal Record", icon:"🏅", desc:"Log an improved Sprint Quest PR.",
    check:a => a.hasPrImprovement },
  { id:"big_day", name:"Epic Day", icon:"💥", desc:"Score 2,000+ points in a single day, across every sector combined.",
    check:a => a.maxDayScore >= 2000 },
  { id:"century_club", name:"Century Club", icon:"💯", desc:"100 total Wins/Wipeouts logged, lifetime, across every sector.",
    check:a => a.totalLogEvents >= 100 },
  { id:"days_50", name:"Dedicated", icon:"🗓️", desc:"Data logged on 50 different days, lifetime.",
    check:a => a.distinctLoggedDays >= 50 },
  { id:"bookworm", name:"Bookworm", icon:"📚", desc:"Reading logged on 30 different days.",
    check:a => a.readingDays >= 30 },
  { id:"reflective", name:"Reflective Mind", icon:"📓", desc:"Journaling logged on 30 different days.",
    check:a => a.journalDays >= 30 },
  { id:"grand_slam", name:"Grand Slam", icon:"🎩", desc:"Complete Schoolwork, Personal, Spiritual, and Business goals in the same week.",
    check:a => a.hasGrandSlamWeek },
  { id:"business_streak_4", name:"Founder Mode", icon:"🚀", desc:"Business Goal completed 4 weeks in a row.",
    check:a => a.businessGoalStreak >= 4 },
  { id:"dean_list", name:"Dean's List", icon:"🎓", desc:"Schoolwork completed 4 weeks in a row.",
    check:a => a.schoolworkStreak >= 4 },
  { id:"social_streak_7", name:"Content Machine", icon:"📱", desc:"7-day streak posting ZERV on both Instagram and TikTok.",
    check:a => a.longestSocialStreak >= 7 },
  { id:"founder", name:"Founder", icon:"🏢", desc:"Track 2 or more businesses at once.",
    check:a => a.businessCount >= 2 },
  { id:"hustler", name:"Hustler", icon:"💼", desc:"Complete 50 business tasks, lifetime.",
    check:a => a.businessTasksDone >= 50 },
  { id:"deadline_crusher", name:"Deadline Crusher", icon:"⏰", desc:"Complete 10 assignments, lifetime.",
    check:a => a.assignmentsDone >= 10 },
  { id:"wall_street_bound", name:"Wall Street Bound", icon:"🏙️", desc:"Reach Managing Director mastery in any finance topic.",
    check:a => a.hasMDTopic },
  { id:"code_streak_7", name:"Code Streak", icon:"👨‍💻", desc:"7-day streak of Coding practice.",
    check:a => a.longestCodeStreak >= 7 },
  { id:"board_breaker", name:"Board Breaker", icon:"🪵", desc:"Shape 5 boards, lifetime.",
    check:a => a.boardsShaped >= 5 },
  { id:"board_master", name:"Shaper Pro", icon:"🏆", desc:"Shape 10 boards, lifetime.",
    check:a => a.boardsShaped >= 10 },
  { id:"renaissance_maker", name:"Renaissance Maker", icon:"🧰", desc:"Check off at least one milestone in all four Elixir hobbies.",
    check:a => a.hobbiesWithMilestone >= 4 },
  { id:"master_craftsman", name:"Master Craftsman", icon:"👑", desc:"Check off every milestone in any one Elixir hobby.",
    check:a => a.hasMasteredHobby },
  { id:"rank_rookie", name:"Rookie Rider", icon:"🏄", desc:"Reach Rookie Rider rank.", check:a => a.allTime >= 2500 },
  { id:"rank_chaser", name:"Wave Chaser", icon:"🌊", desc:"Reach Wave Chaser rank.", check:a => a.allTime >= 7500 },
  { id:"rank_shortboarder", name:"Shortboarder", icon:"🏄‍♂️", desc:"Reach Shortboarder rank.", check:a => a.allTime >= 15000 },
  { id:"rank_barrel", name:"Barrel Hunter", icon:"🛢️", desc:"Reach Barrel Hunter rank.", check:a => a.allTime >= 30000 },
  { id:"rank_bigwave", name:"Big Wave Charger", icon:"🔥", desc:"Reach Big Wave Charger rank.", check:a => a.allTime >= 60000 },
  { id:"rank_legend", name:"ZERV Legend", icon:"🏆", desc:"Reach ZERV Legend rank.", check:a => a.allTime >= 100000 }
];

/* =========================================================================
   STORAGE
   ========================================================================= */
const DAY_PREFIX = "gameoflife:day:";
const WEEK_PREFIX = "gameoflife:week:";
const ACH_KEY = "gameoflife:achievements";
const PROFILE_KEY = "gameoflife:profile";
const BUSINESSES_KEY = "gameoflife:business:list";
const BIZ_TASKS_PREFIX = "gameoflife:business:tasks:";
const BIZ_JOURNAL_PREFIX = "gameoflife:business:journal:";
const CLASSES_KEY = "gameoflife:edu:classes";
const ASSIGNMENTS_KEY = "gameoflife:edu:assignments";
const ELIXIR_MILESTONES_KEY = "gameoflife:elixir:milestones";
const SPRINT_GOAL_KEY = "gameoflife:entity:sprintGoal";

function defaultDay(){ return { deeds:{}, vices:{}, biz:{}, study:{}, craft:{}, locked:false }; }
function defaultWeek(){ return { schoolwork:false, personalGoal:false, spiritualGoal:false, businessGoal:false }; }

const state = {
  days:{}, weeks:{}, achievements:{},
  businesses: [], bizTasks: {}, bizJournal: {},
  classes: [], assignments: [],
  elixirMilestones: {},
  sprintGoal: null
};

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
    } else if(key.startsWith(BIZ_TASKS_PREFIX)){
      try{ state.bizTasks[key.slice(BIZ_TASKS_PREFIX.length)] = JSON.parse(localStorage.getItem(key)) || []; }catch(e){}
    } else if(key.startsWith(BIZ_JOURNAL_PREFIX)){
      try{ state.bizJournal[key.slice(BIZ_JOURNAL_PREFIX.length)] = JSON.parse(localStorage.getItem(key)) || []; }catch(e){}
    }
  }
  try{ state.achievements = JSON.parse(localStorage.getItem(ACH_KEY)) || {}; }catch(e){ state.achievements = {}; }
  try{ state.businesses = JSON.parse(localStorage.getItem(BUSINESSES_KEY)) || null; }catch(e){ state.businesses = null; }
  if(!state.businesses){
    state.businesses = [
      { id:"zerv", name:"ZERV", createdAt: todayStr() },
      { id:"deskgenie", name:"DeskGenie", createdAt: todayStr() }
    ];
    saveBusinesses();
  }
  try{ state.classes = JSON.parse(localStorage.getItem(CLASSES_KEY)) || []; }catch(e){ state.classes = []; }
  try{ state.assignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)) || []; }catch(e){ state.assignments = []; }
  try{ state.elixirMilestones = JSON.parse(localStorage.getItem(ELIXIR_MILESTONES_KEY)) || {}; }catch(e){ state.elixirMilestones = {}; }
  try{ state.sprintGoal = JSON.parse(localStorage.getItem(SPRINT_GOAL_KEY)) || null; }catch(e){ state.sprintGoal = null; }
  if(!localStorage.getItem(PROFILE_KEY)){
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ schemaVersion:3, createdAt: new Date().toISOString() }));
  }
}
function saveDay(date){ localStorage.setItem(DAY_PREFIX + date, JSON.stringify(state.days[date])); }
function saveWeek(weekStart){ localStorage.setItem(WEEK_PREFIX + weekStart, JSON.stringify(state.weeks[weekStart])); }
function saveAchievements(){ localStorage.setItem(ACH_KEY, JSON.stringify(state.achievements)); }
function saveBusinesses(){ localStorage.setItem(BUSINESSES_KEY, JSON.stringify(state.businesses)); }
function saveBizTasks(bizId){ localStorage.setItem(BIZ_TASKS_PREFIX + bizId, JSON.stringify(state.bizTasks[bizId] || [])); }
function saveBizJournal(bizId){ localStorage.setItem(BIZ_JOURNAL_PREFIX + bizId, JSON.stringify(state.bizJournal[bizId] || [])); }
function saveClasses(){ localStorage.setItem(CLASSES_KEY, JSON.stringify(state.classes)); }
function saveAssignments(){ localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state.assignments)); }
function saveElixirMilestones(){ localStorage.setItem(ELIXIR_MILESTONES_KEY, JSON.stringify(state.elixirMilestones)); }
function saveSprintGoal(){ localStorage.setItem(SPRINT_GOAL_KEY, JSON.stringify(state.sprintGoal)); }

function getDay(date){ if(!state.days[date]) state.days[date] = defaultDay(); return state.days[date]; }
function getWeek(weekStart){ if(!state.weeks[weekStart]) state.weeks[weekStart] = defaultWeek(); return state.weeks[weekStart]; }
function getBizTasks(bizId){ if(!state.bizTasks[bizId]) state.bizTasks[bizId] = []; return state.bizTasks[bizId]; }
function getBizJournal(bizId){ if(!state.bizJournal[bizId]) state.bizJournal[bizId] = []; return state.bizJournal[bizId]; }
function getElixirMilestones(hobbyId){ if(!state.elixirMilestones[hobbyId]) state.elixirMilestones[hobbyId] = []; return state.elixirMilestones[hobbyId]; }

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
function daysBetween(fromStr, toStr){ return Math.round((parseDate(toStr) - parseDate(fromStr)) / 86400000); }

/* =========================================================================
   GENERIC SCORING HELPERS — shared by every sector's "flat / tiered /
   repeatable" logging pattern.
   ========================================================================= */
function deedDef(id){ return DEEDS.find(d=>d.id===id); }
function viceDef(id){ return VICES.find(v=>v.id===id); }
function bizDailyDef(id){ return ENTREPRENEUR_DAILY.find(d=>d.id===id); }
function topicDef(id){ return FINANCE_TOPICS.find(t=>t.id===id); }
function hobbyDef(id){ return HOBBIES.find(h=>h.id===id); }

function tierPointsByN(tiers, n){
  let bestN = -1, bestPoints = 0;
  for(const t of tiers){ if(n >= t.n && t.n > bestN){ bestN = t.n; bestPoints = t.points; } }
  return bestPoints;
}
function amountPoints(ranges, amount){
  for(const r of ranges){ if(amount >= r.min && amount < r.max) return r.points; }
  return ranges[ranges.length-1].points;
}
/* One shared calculator for every "flat / tiered / repeatable" positive
   record, regardless of which sector it belongs to. */
function positivePoints(def, rec){
  if(!def || !rec) return 0;
  if(def.type === "flat") return rec.on ? def.points : 0;
  if(def.type === "tiered") return rec.points || 0;
  if(def.type === "repeatable") return (rec.entries||[]).reduce((s,e)=>s+e.points,0);
  return 0;
}

function dayDeedPoints(day, id){ return positivePoints(deedDef(id), day.deeds[id]); }
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

function dayBizPoints(day, id){ return positivePoints(bizDailyDef(id), day.biz[id]); }
function dayBizTotal(day){
  let total = ENTREPRENEUR_DAILY.reduce((s,d)=>s + dayBizPoints(day, d.id), 0);
  total += (day.biz._tasksDone || 0) * BUSINESS_TASK_POINTS;
  total += (day.biz._journalEntries || 0) * BUSINESS_JOURNAL_POINTS;
  return total;
}

function dayStudyPoints(day, id){ return (day.study[id] && day.study[id].points) || 0; }
function dayStudyTotal(day){
  let total = FINANCE_TOPICS.reduce((s,t)=>s + dayStudyPoints(day, t.id), 0);
  total += (day.study._assignmentsDone || 0) * ASSIGNMENT_DONE_POINTS;
  return total;
}

function dayCraftPoints(day, id){ return (day.craft[id] && day.craft[id].points) || 0; }
function dayCraftTotal(day){
  let total = HOBBIES.reduce((s,h)=>s + dayCraftPoints(day, h.id), 0);
  total += (day.craft[SHAPE_BOARD_BONUS.id] && day.craft[SHAPE_BOARD_BONUS.id].entries || []).reduce((s,e)=>s+e.points,0);
  return total;
}

/* The core "stay encouraging" rule: a day's combined net score — across
   EVERY sector — can never go below zero. Vices only ever eat into that
   day's combined Wins; they can't create a debt that drags the Week or
   All-Time total backwards. */
function dayGrossPositive(day){ return dayDeedsTotal(day) + dayBizTotal(day) + dayStudyTotal(day) + dayCraftTotal(day); }
function dayNetScore(date){
  const day = state.days[date];
  if(!day) return 0;
  return Math.max(0, dayGrossPositive(day) + dayVicesTotal(day));
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
   EDUCATION HELPERS — finance-topic mastery, classes/assignments
   ========================================================================= */
function financeTopicLifetimePoints(topicId){
  let total = 0;
  for(const date in state.days){ total += dayStudyPoints(state.days[date], topicId); }
  return total;
}
function masteryTitleForScore(score){
  let cur = MASTERY_TITLES[0], next = MASTERY_TITLES[1] || null;
  for(let i=0;i<MASTERY_TITLES.length;i++){
    if(score >= MASTERY_TITLES[i].score){ cur = MASTERY_TITLES[i]; next = MASTERY_TITLES[i+1] || null; }
  }
  return { cur, next };
}
function upcomingAssignments(withinDays){
  const today = todayStr();
  const limit = addDays(today, withinDays);
  return state.assignments
    .filter(a => !a.done)
    .filter(a => a.dueDate <= limit)
    .sort((a,b) => a.dueDate.localeCompare(b.dueDate));
}
function classNameFor(classId){
  const c = state.classes.find(c=>c.id===classId);
  return c ? c.name : "(no class)";
}

/* =========================================================================
   ELIXIR HELPERS — hobby mastery level from milestones checked
   ========================================================================= */
function hobbyMasteryLevel(hobbyId){
  const checked = getElixirMilestones(hobbyId).length;
  const total = hobbyDef(hobbyId).milestones.length;
  const name = MASTERY_LEVEL_NAMES[Math.min(checked, MASTERY_LEVEL_NAMES.length-1)];
  return { checked, total, name };
}

/* =========================================================================
   SPRINT QUEST HELPERS — entirely self-configured (event/PR/target), since
   guessing gender/event/standards would make the goal meaningless.
   ========================================================================= */
function sprintBestTime(){
  if(!state.sprintGoal || !state.sprintGoal.history || !state.sprintGoal.history.length) return null;
  return Math.min(...state.sprintGoal.history.map(h=>h.time));
}
function sprintHasImprovement(){
  if(!state.sprintGoal || !state.sprintGoal.history || state.sprintGoal.history.length < 2) return false;
  const sorted = state.sprintGoal.history.slice().sort((a,b)=>a.date.localeCompare(b.date));
  let best = sorted[0].time;
  for(let i=1;i<sorted.length;i++){
    if(sorted[i].time < best) return true;
    best = Math.min(best, sorted[i].time);
  }
  return false;
}

/* =========================================================================
   ACHIEVEMENT AGGREGATES — scans the entire stored history every call.
   ========================================================================= */
function computeAggregates(){
  const dates = Object.keys(state.days).sort();
  const agg = {
    allTime: allTimeScore(),
    totalDeedEvents: 0, totalLogEvents: 0,
    maxDayScore: 0,
    longestDeedStreak: 0, longestSprintStreak: 0, longestCodeStreak: 0, longestSocialStreak: 0,
    journalDays: 0, readingDays: 0, sprintDays: 0, boardsShaped: 0,
    distinctLoggedDays: 0,
    hasGrandSlamWeek: Object.values(state.weeks).some(w => w.schoolwork && w.personalGoal && w.spiritualGoal && w.businessGoal),
    businessGoalStreak: computeWeeklyGoalStreak("businessGoal", weekStartOf(todayStr())),
    schoolworkStreak: computeWeeklyGoalStreak("schoolwork", weekStartOf(todayStr())),
    businessCount: state.businesses.length,
    businessTasksDone: Object.values(state.bizTasks).reduce((s,arr)=>s + arr.filter(t=>t.done).length, 0),
    assignmentsDone: state.assignments.filter(a=>a.done).length,
    hasMDTopic: FINANCE_TOPICS.some(t => financeTopicLifetimePoints(t.id) >= MASTERY_TITLES[MASTERY_TITLES.length-1].score),
    hobbiesWithMilestone: HOBBIES.filter(h => getElixirMilestones(h.id).length >= 1).length,
    hasMasteredHobby: HOBBIES.some(h => getElixirMilestones(h.id).length >= h.milestones.length),
    hasPrImprovement: sprintHasImprovement()
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
      const positiveTotal = dayGrossPositive(day);
      const net = dayNetScore(cursor);
      const hasAnyPositive = positiveTotal > 0;
      const hasAnything = Object.keys(day.deeds).length > 0 || Object.keys(day.vices).length > 0 ||
                           Object.keys(day.biz).length > 0 || Object.keys(day.study).length > 0 || Object.keys(day.craft).length > 0;

      if(hasAnything) agg.distinctLoggedDays++;

      for(const d of DEEDS){
        const rec = day.deeds[d.id];
        if(!rec) continue;
        if(d.type === "flat" && rec.on){ agg.totalDeedEvents++; agg.totalLogEvents++; }
        else if(d.type === "tiered" && rec.n){ agg.totalDeedEvents++; agg.totalLogEvents++; }
      }
      for(const v of VICES){
        const rec = day.vices[v.id];
        if(!rec) continue;
        if(v.type === "stacking" && rec.count) agg.totalLogEvents += rec.count;
        else if(v.type === "tiered_count" && rec.count) agg.totalLogEvents += rec.count;
        else if(v.type === "amount_each" && rec.entries) agg.totalLogEvents += rec.entries.length;
      }
      for(const d of ENTREPRENEUR_DAILY){
        if(day.biz[d.id] && day.biz[d.id].on){ agg.totalDeedEvents++; agg.totalLogEvents++; }
      }
      for(const t of FINANCE_TOPICS){ if(day.study[t.id] && day.study[t.id].n){ agg.totalDeedEvents++; agg.totalLogEvents++; } }
      for(const h of HOBBIES){ if(day.craft[h.id] && day.craft[h.id].n){ agg.totalDeedEvents++; agg.totalLogEvents++; } }
      const boardEntries = (day.craft[SHAPE_BOARD_BONUS.id] && day.craft[SHAPE_BOARD_BONUS.id].entries) || [];
      agg.boardsShaped += boardEntries.length;
      agg.totalDeedEvents += boardEntries.length; agg.totalLogEvents += boardEntries.length;

      if(day.deeds.journaling && day.deeds.journaling.n) agg.journalDays++;
      if(day.deeds.reading && day.deeds.reading.n) agg.readingDays++;
      if(day.deeds.sprint_training && day.deeds.sprint_training.on) agg.sprintDays++;

      if(hasAnything && net > agg.maxDayScore) agg.maxDayScore = net;

      if(hasAnyPositive) deedRun++; else deedRun = 0;
      agg.longestDeedStreak = Math.max(agg.longestDeedStreak, deedRun);

      const sprintOn = day.deeds.sprint_training && day.deeds.sprint_training.on;
      if(sprintOn) sprintRun++; else sprintRun = 0;
      agg.longestSprintStreak = Math.max(agg.longestSprintStreak, sprintRun);

      const codeOn = day.craft.coding && day.craft.coding.n;
      if(codeOn) codeRun++; else codeRun = 0;
      agg.longestCodeStreak = Math.max(agg.longestCodeStreak, codeRun);

      const bothSocial = (day.biz.zerv_post_ig && day.biz.zerv_post_ig.on) && (day.biz.zerv_post_tiktok && day.biz.zerv_post_tiktok.on);
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
    void el.offsetWidth;
    el.classList.add("pulse");
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

/* =========================================================================
   SCENE INTERACTIVITY — scroll/pointer parallax on a page's background,
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

  document.querySelectorAll(".sun, .moon, .zerv-badge, .sector-emblem").forEach(el => {
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

loadAll();
