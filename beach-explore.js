/* =========================================================================
   Beach Explore — the Surf Shack. Geometry is authored in Blender
   (tools/blender/build_beach.py -> models/beach.glb); the live ocean, sun,
   lights and every click-through to your data live here.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI,
         loadGLB, applyRoomEnvironment, prepareModel, failUI } from "./explore-shared.js";
import { KNOWLEDGE } from "./knowledge.js";
import { h, ui, createInteraction, afterAction, pop, toast, rankCard, weeklyGoalRow } from "./explore-interact.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 37);
hookResize(camera, renderer);

createSkyDome(scene, [[0, "#1b1036"], [0.45, "#6a2c6b"], [0.72, "#FF006E"], [1, "#FFBE0B"]], 0xff9fc9, 80, 300);
applyRoomEnvironment(renderer, scene, 0.5);

/* ---------- light ---------- */
scene.add(new THREE.HemisphereLight(0xffd9b8, 0xf4c06d, 0.85));
const sun = new THREE.DirectionalLight(0xffb35c, 3.0);
sun.position.set(-60, 30, -75);
sun.target.position.set(0, 0, -6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 200 });
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

const warm = [];
function glow(x, y, z, color, intensity, dist){
  const l = new THREE.PointLight(color, intensity, dist, 1.6);
  l.position.set(x, y, z); scene.add(l); warm.push({ l, base: intensity });
}
glow(0, 2.3, -8, 0xffb866, 5, 12);            // shack interior
glow(0, 3.2, -2.2, 0xffdc8a, 4, 12);          // string lights
glow(-2.6, 2.6, 12, 0xff9a00, 3, 8);          // tiki torches
glow(2.6, 2.6, 24, 0xff9a00, 3, 8);
glow(-6.3, 1.6, -1.2, 0xff4fa3, 3, 7);        // IG ring light
glow(6.3, 1.6, -1.2, 0x6ff5ff, 3, 7);         // TikTok ring light

const lampLight = new THREE.PointLight(0xffe6a0, 0, 70, 1.3);
lampLight.position.set(-23, 13.1, -66);
scene.add(lampLight);

/* ---------- sun disc + glow on the horizon ---------- */
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(15, 48), new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false }));
sunDisc.position.set(-60, 12, -230);
scene.add(sunDisc);
{
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,214,120,.9)"); g.addColorStop(0.35, "rgba(255,120,120,.35)"); g.addColorStop(1, "rgba(255,0,110,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  spr.scale.set(150, 150, 1); spr.position.set(-60, 12, -228); spr.raycast = () => {};
  scene.add(spr);
}

/* ---------- ocean (live) ---------- */
const oceanGeo = new THREE.PlaneGeometry(260, 140, 64, 36);
const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshStandardMaterial({ color: 0x146c6e, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.93, flatShading: true, envMapIntensity: 0.9 }));
ocean.rotation.x = -Math.PI / 2;
ocean.position.set(0, 0.05, -100);
ocean.receiveShadow = true;
scene.add(ocean);
const oceanBase = oceanGeo.attributes.position.array.slice();
const foam = new THREE.Mesh(new THREE.PlaneGeometry(260, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
foam.rotation.x = -Math.PI / 2;
foam.position.set(0, 0.07, -29);
scene.add(foam);

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const PALMS = [[-9, -17], [-16, 2], [-11, 19], [10, -19], [16, 5], [13, 20], [-24, -22], [23, -21], [-5, -26], [6, -27], [-26, 9], [25, 12], [-19, -9], [20, -8], [30, -4], [-34, 14]];
const collidables = [
  { x: 0, z: -8, radius: 4.7 }, { x: 0, z: -4.4, radius: 2.4 },     // shack + porch
  { x: -6.3, z: -1.6, radius: 1.4 }, { x: 6.3, z: -1.6, radius: 1.4 },
  { x: 9.5, z: 4, radius: 1.3 }, { x: -9.5, z: 5, radius: 2.2 },
  { x: 12.5, z: -3.8, radius: 2.8 }, { x: -16.5, z: -6.5, radius: 2.9 }, { x: 21, z: 3, radius: 2.3 },
  { x: -19.2, z: -23, radius: 1.8 },
  { x: -3.1, z: -0.6, radius: 1.9 },
  ...PALMS.map(([x, z]) => ({ x, z, radius: 0.55 }))
];

/* =========================================================================
   Hotspot content — mirrors entrepreneur.html's own handlers
   ========================================================================= */
const today = () => getDay(todayStr());

function completeTask(bizId, taskId){
  const t = getBizTasks(bizId).find((x) => x.id === taskId);
  if(!t || t.done) return;
  t.done = true;
  saveBizTasks(bizId);
  const day = today();
  day.biz._tasksDone = (day.biz._tasksDone || 0) + 1;
  saveDay(todayStr());
  pop("+" + BUSINESS_TASK_POINTS, true);
}

function postSpot(id){
  const def = bizDailyDef(id);
  return {
    title: def.name, icon: def.icon, sub: "Daily priority · flat bonus",
    status: () => (today().biz[id] && today().biz[id].on ? "done" : "todo"),
    link: { href: "entrepreneur.html", label: "Open the Surf Shack →" },
    render(body, api){
      const on = !!(today().biz[id] && today().biz[id].on);
      body.append(ui.big(on ? `+${def.points}` : "—"), ui.muted("points from this post today"),
        ui.sec("Log it"),
        ui.row(on ? "Posted today" : "Not posted yet", `+${def.points} pts`,
          ui.btn(on ? "✓ Posted today" : `Log +${def.points}`, () => {
            const was = !!(today().biz[id] && today().biz[id].on);
            today().biz[id] = { on: !was };
            saveDay(todayStr());
            pop((was ? "-" : "+") + def.points, !was);
            afterAction(); api.changed();
          }, { on })),
        ui.muted("ZERV's daily priority: one post on each platform, every day."));
    }
  };
}

let revBiz = null, pipeBiz = null;
function curPipeBiz(){
  if(!state.businesses.some((b) => b.id === pipeBiz)) pipeBiz = state.businesses[0] ? state.businesses[0].id : null;
  return pipeBiz;
}
function announceRevenue(r, bizName){
  toast(`💰 ${money(r.entry.amount)} logged for ${bizName}`);
  if(r.earned.length){
    const pts = r.earned.reduce((x, m) => x + m.points, 0);
    toast(`🏆 ${r.earned[r.earned.length - 1].pct}% of ${bizName}'s target! +${pts}`);
    pop("+" + pts, true);
  }
}
const NEXT_STAGE = { lead: ["contacted", "Contacted ▸"], contacted: ["call", "Call booked ▸"], call: ["won", "Won 🎉"] };
function announceMove(res){
  if(!res) return;
  let pts = 0;
  for(const e of res.earned){
    pts += e.points;
    toast(`🎯 ${res.lead.name}: ${e.label}${e.points ? " +" + e.points : ""}`);
  }
  if(pts > 0) pop("+" + pts, true);
  if(res.lead.stage === "won" && res.earned.some((e) => e.kind === "won")) toast("🔔 Client won! Ring the bell.");
}
const money = (n) => "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
function curBiz(){
  if(!state.businesses.some((b) => b.id === revBiz)) revBiz = state.businesses[0] ? state.businesses[0].id : null;
  return revBiz;
}

const SPOTS = {
  HS_shack: {
    title: "ZERV Surf Shack", icon: "🏢", sub: "Your businesses — tasks & progress",
    status: () => (state.businesses.some((b) => getBizTasks(b.id).some((t) => !t.done)) ? "todo" : "info"),
    link: { href: "entrepreneur.html", label: "Manage businesses →" },
    render(body, api){
      if(!state.businesses.length){
        body.append(ui.muted("No businesses tracked yet. Add ZERV, DeskGenie or anything new on the Surf Shack page."));
        return;
      }
      for(const biz of state.businesses){
        const tasks = getBizTasks(biz.id);
        const open = tasks.filter((t) => !t.done);
        body.append(ui.sec(`🏢 ${biz.name}`),
          ui.bar(tasks.length ? ((tasks.length - open.length) / tasks.length) * 100 : 0, `${tasks.length - open.length} / ${tasks.length} tasks complete`));
        for(const t of open.slice(0, 6)){
          body.append(ui.row(t.text, null, ui.btn("✓ Done", () => { completeTask(biz.id, t.id); afterAction(); api.changed(); })));
        }
        if(open.length > 6) body.append(ui.muted(`+${open.length - 6} more on the Surf Shack page`));
        if(!open.length) body.append(ui.muted(tasks.length ? "All caught up. 🎉" : "No tasks yet."));
        const inp = h("input", { class: "ix-in", type: "text", placeholder: "New task..." });
        const add = () => {
          if(!inp.value.trim()) return;
          tasks.push({ id: "t" + Date.now(), text: inp.value.trim(), done: false, createdAt: todayStr() });
          saveBizTasks(biz.id);
          api.changed();
        };
        inp.addEventListener("keydown", (e) => { if(e.key === "Enter") add(); });
        body.append(h("div", { style: "display:flex;gap:6px;margin-top:6px" }, inp, ui.btn("Add", add)));
      }
    }
  },
  HS_post_ig: postSpot("zerv_post_ig"),
  HS_post_tiktok: postSpot("zerv_post_tiktok"),

  HS_goal: {
    title: "Weekly Business Goal", icon: "🚀", sub: "Bonus points, no penalty for skipping",
    status: () => (getWeek(weekStartOf(todayStr())).businessGoal ? "done" : "todo"),
    link: { href: "entrepreneur.html", label: "Open the Surf Shack →" },
    render(body, api){
      body.append(ui.sec("This week"), weeklyGoalRow("businessGoal", api),
        ui.sec("Streak"), ui.row("🚀 Business Goal", null, h("b", null, `${computeWeeklyGoalStreak("businessGoal", weekStartOf(todayStr()))} wk`)));
    }
  },

  HS_journal: {
    title: "Founder's Logbook", icon: "📓", sub: "Notes, revenue updates, ideas",
    status: () => "info",
    link: { href: "entrepreneur.html", label: "Open the Surf Shack →" },
    render(body, api){
      if(!state.businesses.length){ body.append(ui.muted("Add a business first, then log notes here.")); return; }
      const sel = h("select", { class: "ix-in" }, ...state.businesses.map((b) => h("option", { value: b.id }, b.name)));
      const ta = h("textarea", { class: "ix-in", rows: "3", placeholder: "Notes, revenue updates, ideas..." });
      body.append(ui.sec("New entry"), sel, h("div", { style: "height:6px" }), ta,
        ui.btns(ui.btn(`+ Log entry (+${BUSINESS_JOURNAL_POINTS})`, () => {
          if(!ta.value.trim()) return;
          const journal = getBizJournal(sel.value);
          journal.push({ id: "j" + Date.now(), text: ta.value.trim(), ts: Date.now() });
          saveBizJournal(sel.value);
          const day = today();
          day.biz._journalEntries = (day.biz._journalEntries || 0) + 1;
          saveDay(todayStr());
          pop("+" + BUSINESS_JOURNAL_POINTS, true);
          afterAction(); api.changed();
        })));
      const all = [];
      for(const b of state.businesses) for(const j of getBizJournal(b.id)) all.push({ ...j, biz: b.name });
      all.sort((a, b) => b.ts - a.ts);
      body.append(ui.sec("Recent"));
      if(!all.length) body.append(ui.muted("No journal entries yet."));
      for(const j of all.slice(0, 6)) body.append(ui.row(j.text, `${j.biz} · ${new Date(j.ts).toLocaleString()}`));
    }
  },

  HS_pipeline: {
    title: "Sales Pipeline", icon: "📞", sub: "Leads, outreach and clients won",
    status: () => (outreachToday() >= 1 ? "done" : "todo"),
    link: { href: "entrepreneur.html", label: "Open the Surf Shack →" },
    render(body, api){
      if(!state.businesses.length){ body.append(ui.muted("Add a business on the Surf Shack page first, then track its leads here.")); return; }
      const id = curPipeBiz();
      const biz = state.businesses.find((b) => b.id === id);
      const sel = h("select", { class: "ix-in", onchange: () => { pipeBiz = sel.value; api.changed(); } },
        ...state.businesses.map((b) => h("option", { value: b.id }, b.name)));
      sel.value = id;
      body.append(sel);

      const sum = pipelineSummary(id);
      const n = outreachToday();
      body.append(h("div", { style: "height:6px" }),
        ui.row("Pipeline", `new · contacted · call booked · won — ${money(sum.openValue)} open, ${money(sum.wonValue)} won`,
          h("b", null, `${sum.lead} · ${sum.contacted} · ${sum.call} · ${sum.won}`)),
        ui.bar(Math.min(n, OUTREACH_DAILY_CAP) / OUTREACH_DAILY_CAP * 100,
          `Outreach today: ${n} (+${OUTREACH_POINTS} each, up to ${OUTREACH_DAILY_CAP} a day = ${outreachPay(n)} / ${OUTREACH_DAILY_CAP * OUTREACH_POINTS} pts)`));

      const name = h("input", { class: "ix-in", type: "text", placeholder: "Lead name (person or company)" });
      const val = h("input", { class: "ix-in", type: "number", step: "1", min: "0", placeholder: "Deal value ($, optional)" });
      const note = h("input", { class: "ix-in", type: "text", placeholder: "Note (optional)" });
      const add = () => {
        const l = addLead(id, name.value, val.value, note.value);
        if(!l){ toast("Give the lead a name."); return; }
        toast(`📞 Lead added: ${l.name}`);
        api.changed();
      };
      name.addEventListener("keydown", (e) => { if(e.key === "Enter") add(); });
      body.append(ui.sec("Add a lead"), name, h("div", { style: "height:6px" }), val, h("div", { style: "height:6px" }), note, ui.btns(ui.btn("Add lead", add)));

      const open = getLeads(id).filter((l) => l.stage !== "won" && l.stage !== "lost")
        .sort((a, b) => PIPELINE_RANK[b.stage] - PIPELINE_RANK[a.stage]);
      body.append(ui.sec(`Open leads · ${open.length}`));
      if(!open.length) body.append(ui.muted("No open leads. Add one above, then move it forward as the conversation does."));
      for(const l of open.slice(0, 8)){
        const [next, nextLabel] = NEXT_STAGE[l.stage];
        const sub = [pipelineStageDef(l.stage).label, l.value ? money(l.value) : "", l.note, l.touches ? `${l.touches} follow-up${l.touches === 1 ? "" : "s"}` : ""].filter(Boolean).join(" · ");
        const btns = [ui.btn(nextLabel, () => { announceMove(moveLead(id, l.id, next)); afterAction(); api.changed(); })];
        if(l.stage !== "lead") btns.push(ui.btn("↻", () => {
          const r = logFollowUp(id, l.id);
          if(r){
            toast(r.points > 0 ? `↻ Follow-up logged +${r.points}` : "↻ Follow-up logged (daily outreach cap reached)");
            if(r.points > 0) pop("+" + r.points, true);
          }
          afterAction(); api.changed();
        }, { alt: true }));
        btns.push(ui.btn("Lost", () => { moveLead(id, l.id, "lost"); api.changed(); }, { alt: true }));
        body.append(ui.row(l.name, sub, h("div", { class: "ix-btns", style: "margin:0;flex-wrap:nowrap" }, btns)));
      }
      if(open.length > 8) body.append(ui.muted(`+${open.length - 8} more open leads (they're on the board; close some out to see them here)`));

      const closed = getLeads(id).filter((l) => l.stage === "won" || l.stage === "lost")
        .sort((a, b) => (a.stage === "won" ? 0 : 1) - (b.stage === "won" ? 0 : 1)).slice(0, 5);
      if(closed.length){
        body.append(ui.sec("Closed"));
        for(const l of closed){
          const btns = [];
          if(l.stage === "won" && l.value > 0 && !l.revenueLogged){
            btns.push(ui.btn(`💰 Log ${money(l.value)}`, () => {
              const r = logLeadRevenue(id, l.id);
              if(r) announceRevenue(r, biz.name);
              afterAction(); api.changed();
            }));
          }
          btns.push(ui.btn("×", () => { deleteLead(id, l.id); toast("Lead removed. Points already earned stay."); api.changed(); }, { alt: true }));
          body.append(ui.row(l.name, `${l.stage === "won" ? "Client won 🎉" : "Lost"}${l.value ? " · " + money(l.value) : ""}${l.revenueLogged ? " · revenue logged" : ""}`,
            h("div", { class: "ix-btns", style: "margin:0;flex-wrap:nowrap" }, btns), l.stage === "lost"));
        }
      }
    }
  },

  HS_revenue: {
    title: "Revenue Stand", icon: "💰", sub: "Income, monthly targets & milestone bonuses",
    status: () => {
      if(!state.businesses.length) return "info";
      if(!state.businesses.some((b) => state.revenueGoals[b.id] > 0)) return "todo";
      return state.businesses.every((b) => !(state.revenueGoals[b.id] > 0) || revenueMilestoneEarned(b.id, 100)) ? "done" : "info";
    },
    link: { href: "entrepreneur.html", label: "Open the Surf Shack →" },
    render(body, api){
      if(!state.businesses.length){ body.append(ui.muted("Add a business on the Surf Shack page first, then log its revenue here.")); return; }
      const id = curBiz();
      const biz = state.businesses.find((b) => b.id === id);
      const sel = h("select", { class: "ix-in", onchange: () => { revBiz = sel.value; api.changed(); } },
        ...state.businesses.map((b) => h("option", { value: b.id }, b.name)));
      sel.value = id;
      body.append(sel);

      const month = monthKeyOf(todayStr());
      const rev = bizMonthRevenue(id, month);
      const target = state.revenueGoals[id] || 0;
      body.append(h("div", { style: "height:8px" }), ui.big(money(rev)), ui.muted(`earned in ${month}`));
      if(target > 0){
        body.append(ui.bar((rev / target) * 100, rev >= target ? `Target of ${money(target)} hit! 🎉` : `${money(target - rev)} to go of ${money(target)}`));
      } else body.append(ui.muted("Set a monthly target below to start earning milestone bonuses."));

      body.append(ui.sec("Milestone bonuses"));
      for(const m of REVENUE_MILESTONES){
        const got = revenueMilestoneEarned(id, m.pct, month);
        body.append(ui.row(target > 0 ? `${m.pct}% · ${money(target * m.pct / 100)}` : `${m.pct}% of your target`, `+${m.points} pts`,
          got ? h("b", null, "✓ paid") : (target > 0 ? h("span", { class: "ix-muted" }, "🔒") : null), got));
      }

      const amt = h("input", { class: "ix-in", type: "number", step: "0.01", min: "0", placeholder: "Amount earned ($)" });
      const note = h("input", { class: "ix-in", type: "text", placeholder: "Note (optional) — client, product, source" });
      body.append(ui.sec("Log revenue"), amt, h("div", { style: "height:6px" }), note,
        ui.btns(ui.btn("💰 Log revenue", () => {
          const r = logRevenue(id, amt.value, note.value);
          if(!r){ toast("Enter an amount above 0."); return; }
          toast(`💰 ${money(r.entry.amount)} logged for ${biz.name}`);
          if(r.earned.length){
            const pts = r.earned.reduce((x, m) => x + m.points, 0);
            toast(`🏆 ${r.earned[r.earned.length - 1].pct}% of ${biz.name}'s target! +${pts}`);
            pop("+" + pts, true);
          }
          afterAction(); api.changed();
        })));

      const tgt = h("input", { class: "ix-in", type: "number", step: "1", min: "0", placeholder: "Monthly revenue target ($)", value: target || "" });
      body.append(ui.sec("Monthly target"), tgt,
        ui.btns(ui.btn("Save target", () => {
          const earned = setRevenueGoal(id, tgt.value);
          toast(Number(tgt.value) > 0 ? `🎯 ${biz.name} target set to ${money(Number(tgt.value))}` : "Target cleared.");
          if(earned.length){ const pts = earned.reduce((x, m) => x + m.points, 0); toast(`🏆 Milestones already reached! +${pts}`); pop("+" + pts, true); }
          afterAction(); api.changed();
        })));

      const recent = getRevenue(id).slice().sort((a, b) => b.ts - a.ts).slice(0, 5);
      body.append(ui.sec(`Recent · lifetime ${money(bizLifetimeRevenue(id))}`));
      if(!recent.length) body.append(ui.muted("No revenue logged yet — your first dollar earns a medal."));
      for(const e of recent){
        body.append(ui.row(money(e.amount), `${e.date}${e.note ? " · " + e.note : ""}`,
          ui.btn("×", () => { deleteRevenue(id, e.id); toast("Entry removed. Milestone bonuses already paid stay."); api.changed(); }, { alt: true })));
      }
      body.append(ui.muted("The pier buoys and lighthouse show all businesses combined."));
    }
  },

  HS_rack: {
    title: "Rank Boards", icon: "🏆", sub: "Every board you earn joins the rack",
    status: () => "info",
    link: { href: "index.html", label: "Open HQ →" },
    render(body){
      body.append(rankCard());
      const { idx } = rankInfoForScore(allTimeScore());
      body.append(ui.sec("The quiver"),
        ...RANK_TIERS.map((r, i) => ui.row(`${r.boardIcon} ${r.board}`, `${r.rank} · ${r.score.toLocaleString()}+ pts`, i === idx ? h("b", null, "◀ you") : (i > idx ? h("span", { class: "ix-muted" }, "🔒") : null), i < idx)));
    }
  }
};

const statFn = () => {
  const all = allTimeScore();
  const n = state.businesses.length;
  return `${all.toLocaleString()} pts<small>${n} business${n === 1 ? "" : "es"} tracked</small>`;
};

/* =========================================================================
   Boot
   ========================================================================= */
let ix = null, named = null;
const lockedBoards = [];
function tintBoards(){
  if(!named) return;
  const { idx } = rankInfoForScore(allTimeScore());
  for(let i = 0; i < 7; i++){
    const m = named["KEEP_board_" + i];
    if(!m) continue;
    if(!lockedBoards[i]) lockedBoards[i] = m.material.color.clone();
    if(i > idx) m.material.color.copy(lockedBoards[i]).lerp(new THREE.Color(0x3a3a44), 0.82);
    else m.material.color.copy(lockedBoards[i]);
  }
}

let pipeCtx = null, pipeTex = null;
function initPipelineBoard(){
  const mesh = named && named.KEEP_pipeline_board;
  if(!mesh) return;
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 546;
  pipeCtx = c.getContext("2d");
  pipeTex = new THREE.CanvasTexture(c);
  pipeTex.colorSpace = THREE.SRGBColorSpace;
  pipeTex.flipY = false;
  mesh.material = new THREE.MeshBasicMaterial({ map: pipeTex, toneMapped: false });
}
function fitText(ctx, text, maxW){
  if(ctx.measureText(text).width <= maxW) return text;
  while(text.length > 1 && ctx.measureText(text + "…").width > maxW) text = text.slice(0, -1);
  return text + "…";
}
function paintPipeline(){
  if(!pipeCtx) return;
  const ctx = pipeCtx, W = 1024, H = 546;
  ctx.fillStyle = "#1E2A26"; ctx.fillRect(0, 0, W, H);
  const all = [];
  for(const b of state.businesses) for(const l of getLeads(b.id)) all.push(l);
  const cols = [["lead", "NEW"], ["contacted", "CONTACTED"], ["call", "CALL BOOKED"], ["won", "WON"]];
  const colW = W / 4, notes = ["#FFE27A", "#FFB3C7", "#9BE7F2"];
  ctx.textAlign = "center";
  cols.forEach(([id, label], i) => {
    const x = i * colW, list = all.filter((l) => l.stage === id).reverse();
    ctx.fillStyle = id === "won" ? "#1F6B3A" : "#2C3B35"; ctx.fillRect(x + 6, 8, colW - 12, 72);
    ctx.fillStyle = "#F4EFE2"; ctx.font = "700 24px 'Poppins', sans-serif"; ctx.fillText(label, x + colW / 2, 38);
    ctx.fillStyle = "#FFD36B"; ctx.font = "700 30px 'Poppins', sans-serif"; ctx.fillText(String(list.length), x + colW / 2, 70);
    list.slice(0, 3).forEach((l, k) => {
      const y = 94 + k * 82;
      ctx.fillStyle = notes[(i + k) % 3]; ctx.fillRect(x + 14, y, colW - 28, 70);
      ctx.fillStyle = "#1A1A1A"; ctx.font = "700 24px 'Poppins', sans-serif";
      ctx.fillText(fitText(ctx, l.name, colW - 48), x + colW / 2, y + 30);
      if(l.value > 0){ ctx.font = "600 20px 'Poppins', sans-serif"; ctx.fillText(money(l.value), x + colW / 2, y + 56); }
    });
    if(list.length > 3){ ctx.fillStyle = "#cfd8d3"; ctx.font = "600 20px 'Poppins', sans-serif"; ctx.fillText(`+${list.length - 3} more`, x + colW / 2, 94 + 3 * 82 + 14); }
  });
  const sum = pipelineSummary(null), n = outreachToday();
  ctx.textAlign = "left"; ctx.fillStyle = "#F4EFE2"; ctx.font = "700 24px 'Poppins', sans-serif";
  ctx.fillText(`Outreach today: ${Math.min(n, OUTREACH_DAILY_CAP)} / ${OUTREACH_DAILY_CAP}${n > OUTREACH_DAILY_CAP ? " (cap)" : ""}`, 20, H - 28);
  ctx.fillStyle = "#3A4A43"; ctx.fillRect(330, H - 46, 250, 22);
  ctx.fillStyle = "#FFD36B"; ctx.fillRect(330, H - 46, 250 * Math.min(n, OUTREACH_DAILY_CAP) / OUTREACH_DAILY_CAP, 22);
  ctx.textAlign = "right"; ctx.fillStyle = "#6CFFA8";
  ctx.fillText(`Open pipeline: ${money(sum.openValue)}`, W - 20, H - 28);
  pipeTex.needsUpdate = true;
}

function lightWorld(){
  if(!named) return;
  let rev = 0, tgt = 0;
  for(const b of state.businesses){
    const t = state.revenueGoals[b.id] || 0;
    if(t > 0){ tgt += t; rev += bizMonthRevenue(b.id); }
  }
  const progress = tgt > 0 ? rev / tgt : 0;
  [25, 50, 75, 100].forEach((pct, i) => {
    const m = named["KEEP_buoy_" + i];
    if(!m) return;
    const on = progress * 100 >= pct;
    m.material.color.set(on ? 0xffd36b : 0xc9c9cf);
    m.material.emissive.set(on ? 0xffb000 : 0x000000);
    m.material.emissiveIntensity = on ? 1.4 : 0;
  });
  const lamp = named.KEEP_lighthouse_lamp;
  const full = progress >= 1;
  if(lamp){ lamp.material.emissive.set(full ? 0xfff0b0 : 0x000000); lamp.material.emissiveIntensity = full ? 3 : 0; }
  lampLight.intensity = full ? 60 : 0;
}

loadGLB("models/beach.glb").then((gltf) => {
  scene.add(gltf.scene);
  named = prepareModel(gltf.scene);
  initPipelineBoard();
  ix = createInteraction({ scene, camera, canvas, uiRoot: document.getElementById("explore-ui"), statFn, onChange: () => { tintBoards(); lightWorld(); paintPipeline(); } });
  for(const name in SPOTS) ix.register(named[name], { ...SPOTS[name], learn: KNOWLEDGE[name] });
  ix.changed();
  window.__ex = { camera, controls, ix, scene };
  revealUI();
  requestAnimationFrame(animate);
}).catch((e) => { console.error(e); failUI("The model file didn't load."); });

let lastT = performance.now();
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  stepCamera(camera, controls, dt, { boundX: 52, boundZMin: -52, boundZMax: 44, collidables });

  if(!reducedMotion){
    const pos = oceanGeo.attributes.position;
    const time = t * 0.0012;
    for(let i = 0; i < pos.count; i++){
      const ix_ = oceanBase[i * 3], iz = oceanBase[i * 3 + 2];
      pos.setZ(i, Math.sin(ix_ * 0.15 + time * 3) * 0.2 + Math.sin(iz * 0.2 + time * 2.2) * 0.16);
    }
    pos.needsUpdate = true;
    foam.position.y = 0.07 + Math.sin(time * 3) * 0.03;
    warm.forEach((w, i) => { w.l.intensity = w.base * (1 + Math.sin(t * 0.006 + i * 1.7) * 0.07); });
  }
  if(ix) ix.update(t);
  renderer.render(scene, camera);
}
