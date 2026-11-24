/* =========================================================================
   Entity Explore — The Vitruvian Study. Geometry is authored in Blender
   (tools/blender/build_entity.py -> models/entity.glb); this file lights
   it, makes the HS_* groups clickable, and wires each one to the same data
   the 2D Study / Practice Log use.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI,
         loadGLB, applyRoomEnvironment, prepareModel, failUI } from "./explore-shared.js";
import { KNOWLEDGE } from "./knowledge.js";
import { h, ui, createInteraction, todayLocked, afterAction, pop, toast, rankCard, weeklyGoalRow } from "./explore-interact.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 20.5);
hookResize(camera, renderer);

createSkyDome(scene, [[0, "#2a4a86"], [0.5, "#7a9ccf"], [1, "#f3d3a0"]], 0x2a1d10, 70, 260);
applyRoomEnvironment(renderer, scene, 0.32);

/* ---------- light: warm interior + a real sunbeam through the oculus ---------- */
scene.add(new THREE.HemisphereLight(0xfff1d6, 0x3b2a18, 0.7));
const sun = new THREE.DirectionalLight(0xffe3b8, 2.6);
sun.position.set(-3.49, 40, -2.32);
sun.target.position.set(3, 0, 2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

const candleLights = [];
for(const [x, z] of [[-19, -2.0], [-19, 2.0], [19, 8]]){
  const l = new THREE.PointLight(0xffa24a, 6, 12, 1.6);
  l.position.set(x, 1.9, z);
  scene.add(l); candleLights.push(l);
}

/* the visible shaft of sunlight + drifting dust */
const shaftTop = new THREE.Vector3(0, 18.5, 0), shaftBot = new THREE.Vector3(3, 0, 2);
const shaftLen = shaftTop.distanceTo(shaftBot);
const shaftQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), shaftTop.clone().sub(shaftBot).normalize());
for(const [k, op] of [[1.0, 0.035], [0.82, 0.03], [0.62, 0.03], [0.4, 0.03]]){
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(4.7 * k, 5.0 * k, shaftLen, 40, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe8b8, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false })
  );
  shaft.position.copy(shaftTop).add(shaftBot).multiplyScalar(0.5);
  shaft.quaternion.copy(shaftQuat);
  scene.add(shaft);
}

const MOTES = 220;
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(MOTES * 3), moteSeed = [];
for(let i = 0; i < MOTES; i++){
  const t = Math.random(), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 4.5;
  const c = shaftBot.clone().lerp(shaftTop, t);
  motePos.set([c.x + Math.cos(a) * r, c.y, c.z + Math.sin(a) * r], i * 3);
  moteSeed.push({ s: 0.15 + Math.random() * 0.25, p: Math.random() * 6.28 });
}
moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xfff1cc, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
scene.add(motes);

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const BOUND = 21.6;
const collidables = [
  { x: 0, z: 0, radius: 3.2 },
  ...[18, 90, 162, 234, 306].map((d) => {
    const a = d * Math.PI / 180;
    return { x: 12.3 * Math.sin(a), z: -12.3 * Math.cos(a), radius: 1.15 };
  }),
  { x: 16.6, z: 9.2, radius: 1.1 },      // sprint kiosk
  { x: -19, z: 0, radius: 2.7 },         // lectern + candelabras
  { x: -16, z: -19, radius: 2.4 }        // drafting table
];

/* =========================================================================
   Hotspot content — each mirrors what the 2D pages already do
   ========================================================================= */
const today = () => getDay(todayStr());
function guard(){
  if(todayLocked()){ toast("🔒 Today is sealed and can't be edited."); return true; }
  return false;
}
function daysThisWeekLogged(id){
  const wk = weekStartOf(todayStr());
  let n = 0;
  for(let i = 0; i < 7; i++){
    const d = state.days[addDays(wk, i)];
    if(d && dayDeedPoints(d, id) > 0) n++;
  }
  return n;
}

function deedSpot(id, blurb){
  const def = deedDef(id);
  return {
    title: def.name, icon: def.icon, sub: blurb,
    status: () => (dayDeedPoints(today(), id) > 0 ? "done" : "todo"),
    link: { href: "chronicle.html", label: "Open the full Practice Log →" },
    render(body, api){
      const day = today();
      const pts = dayDeedPoints(day, id);
      const locked = !!day.locked;
      body.append(ui.big(pts > 0 ? `+${pts}` : "—"), ui.muted("points from this deed today"));
      if(locked) body.append(ui.lock());
      body.append(ui.sec("Log it"));
      if(def.type === "flat"){
        const on = !!(day.deeds[id] && day.deeds[id].on);
        body.append(ui.row(on ? "Logged today" : "Not logged yet", `+${def.points} pts`,
          ui.btn(on ? "✓ Logged" : `Log +${def.points}`, () => {
            if(guard()) return;
            const was = !!(today().deeds[id] && today().deeds[id].on);
            today().deeds[id] = { on: !was };
            saveDay(todayStr());
            pop((was ? "-" : "+") + def.points, !was);
            afterAction(); api.changed();
          }, { on, disabled: locked })));
      } else {
        const cur = day.deeds[id];
        body.append(ui.btns(
          ...def.tiers.map((t) => ui.btn(`${t.label} · +${t.points}`, () => {
            if(guard()) return;
            const prev = dayDeedPoints(today(), id);
            today().deeds[id] = { n: t.n, points: t.points };
            saveDay(todayStr());
            const delta = t.points - prev;
            if(delta) pop((delta > 0 ? "+" : "") + delta, delta > 0);
            afterAction(); api.changed();
          }, { on: !!(cur && cur.n === t.n), disabled: locked })),
          cur ? ui.btn("clear", () => {
            if(guard()) return;
            delete today().deeds[id];
            saveDay(todayStr());
            afterAction(); api.changed();
          }, { alt: true, disabled: locked }) : null));
      }
      body.append(ui.sec("This week"), ui.bar((daysThisWeekLogged(id) / 7) * 100, `${daysThisWeekLogged(id)} of 7 days logged`));
    }
  };
}

const SPOTS = {
  HS_vitruvian: {
    title: "The Vitruvian Figure", icon: "📐", sub: "Your overall standing in ZERV LEVEL UP",
    status: () => "info",
    link: { href: "entity-arena.html", label: "Open the Study →" },
    render(body){
      body.append(rankCard());
      const t = todayStr();
      body.append(ui.sec("Scores"),
        ui.row("Today", null, h("b", null, dayNetScore(t).toLocaleString())),
        ui.row("This week", null, h("b", null, weekNetScore(weekStartOf(t)).toLocaleString())),
        ui.row("Medals earned", null, h("b", null, `${Object.keys(state.achievements).length} / ${ACHIEVEMENTS.length}`)));
      const { idx } = rankInfoForScore(allTimeScore());
      body.append(ui.sec("Rank ladder"),
        ...RANK_TIERS.map((r, i) => ui.row(`${r.boardIcon} ${r.rank}`, `${r.score.toLocaleString()}+ pts · ${r.board}`, i === idx ? h("b", null, "◀ you") : null, i < idx)));
    }
  },
  HS_deed_sprint_training: deedSpot("sprint_training", "Physical · flat bonus"),
  HS_deed_strength_training: deedSpot("strength_training", "Physical · flat bonus"),
  HS_deed_surf_session: deedSpot("surf_session", "Physical · flat bonus"),
  HS_deed_reading: deedSpot("reading", "Spiritual · tiered by minutes"),
  HS_deed_journaling: deedSpot("journaling", "Spiritual · tiered by minutes"),

  HS_sprint: {
    title: "Sprint Quest", icon: "⏱️", sub: "Division 1 by your 21st birthday",
    status: () => (state.sprintGoal && state.sprintGoal.event ? "info" : "todo"),
    link: { href: "entity-arena.html", label: "Open the Study →" },
    render(body, api){
      const days = Math.max(0, daysBetween(todayStr(), SPRINT_DEADLINE));
      body.append(ui.big(days.toLocaleString()), ui.muted(`days until ${SPRINT_DEADLINE} (your 21st birthday)`));
      const g = state.sprintGoal;
      if(!(g && g.event)){
        const ev = h("select", { class: "ix-in" }, ...["60m", "100m", "200m", "400m"].map((e) => h("option", { value: e, selected: e === "100m" }, e)));
        const cur = h("input", { class: "ix-in", type: "number", step: "0.01", min: "0", placeholder: "Current PR (seconds)" });
        const tgt = h("input", { class: "ix-in", type: "number", step: "0.01", min: "0", placeholder: "Target / D1 time (seconds)" });
        body.append(ui.sec("Set your Sprint Quest"), ev, h("div", { style: "height:6px" }), cur, h("div", { style: "height:6px" }), tgt,
          ui.btns(ui.btn("Set my Sprint Quest", () => {
            const targetPR = Number(tgt.value), currentPR = Number(cur.value);
            if(!targetPR || targetPR <= 0){ toast("Enter a target time to continue."); return; }
            state.sprintGoal = { event: ev.value, unit: "sec", targetPR, history: currentPR > 0 ? [{ date: todayStr(), time: currentPR }] : [] };
            saveSprintGoal();
            toast("⚡ Sprint Quest set. Let's move.");
            afterAction(); api.changed();
          })));
        return;
      }
      const best = sprintBestTime();
      body.append(ui.sec(`${g.event} · target ${g.targetPR}s`),
        ui.row("Best time", null, h("b", null, best !== null ? `${best}s` : "not logged yet")));
      if(best !== null){
        const start = g.history[0].time;
        const span = Math.max(0.01, start - g.targetPR);
        body.append(ui.bar(Math.min(100, (Math.max(0, start - best) / span) * 100),
          best <= g.targetPR ? "🎉 Target hit or beaten!" : `${(best - g.targetPR).toFixed(2)}s to go`));
      } else body.append(ui.muted("Log your first time to start tracking progress."));
      const inp = h("input", { class: "ix-in", type: "number", step: "0.01", min: "0", placeholder: "New time logged today (seconds)" });
      body.append(ui.sec("Log a time"), inp, ui.btns(ui.btn("🏁 Log time", () => {
        const time = Number(inp.value);
        if(!time || time <= 0) return;
        const prev = sprintBestTime();
        g.history.push({ date: todayStr(), time });
        saveSprintGoal();
        toast(prev === null || time < prev ? `🏅 New PR: ${time}s!` : `Time logged: ${time}s`);
        afterAction(); api.changed();
      })));
      const recent = g.history.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
      if(recent.length) body.append(ui.sec("Recent"), ...recent.map((x) => ui.row(x.date, null, h("b", null, `${x.time}s`))));
    }
  },

  HS_weekly: {
    title: "Weekly Vows", icon: "🙏", sub: "Personal + spiritual · bonus points, no penalty for skipping",
    status: () => {
      const w = getWeek(weekStartOf(todayStr()));
      return w.personalGoal && w.spiritualGoal ? "done" : "todo";
    },
    link: { href: "entity-arena.html", label: "Open the Study →" },
    render(body, api){
      body.append(ui.sec("This week"), weeklyGoalRow("personalGoal", api), weeklyGoalRow("spiritualGoal", api));
      const wk = weekStartOf(todayStr());
      body.append(ui.sec("Streaks"),
        ui.row("🎯 Personal Goal", null, h("b", null, `${computeWeeklyGoalStreak("personalGoal", wk)} wk`)),
        ui.row("🙏 Spiritual Goal", null, h("b", null, `${computeWeeklyGoalStreak("spiritualGoal", wk)} wk`)));
    }
  }
};

const statFn = () => {
  const all = allTimeScore();
  return `${all.toLocaleString()} pts<small>${rankInfoForScore(all).cur.rank}</small>`;
};

/* =========================================================================
   Boot: load the Blender model, then run
   ========================================================================= */
let ix = null;
loadGLB("models/entity.glb").then((gltf) => {
  scene.add(gltf.scene);
  const named = prepareModel(gltf.scene);
  ix = createInteraction({ scene, camera, canvas, uiRoot: document.getElementById("explore-ui"), statFn });
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

  stepCamera(camera, controls, dt, { boundX: BOUND, boundZMin: -BOUND, boundZMax: BOUND, collidables });

  if(!reducedMotion){
    candleLights.forEach((l, i) => { l.intensity = 6 * (1 + Math.sin(t * 0.007 + i * 2.1) * 0.08 + Math.sin(t * 0.0173 + i) * 0.04); });
    const p = moteGeo.attributes.position;
    for(let i = 0; i < MOTES; i++){
      const m = moteSeed[i];
      p.setY(i, p.getY(i) - m.s * dt);
      p.setX(i, p.getX(i) + Math.sin(t * 0.0006 + m.p) * 0.12 * dt);
      if(p.getY(i) < 0.3) p.setY(i, 18.2);
    }
    p.needsUpdate = true;
  }
  if(ix) ix.update(t);
  renderer.render(scene, camera);
}
