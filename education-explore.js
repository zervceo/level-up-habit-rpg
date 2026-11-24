/* =========================================================================
   Education Explore — Wall Street at dusk. Geometry is authored in Blender
   (tools/blender/build_education.py -> models/education.glb). Each finance
   topic is a street pavilion, the Exchange holds your deadlines + weekly
   schoolwork goal, and the Charging Bull shows your overall rank.
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
camera.position.set(0, 1.7, 45);
hookResize(camera, renderer);

createSkyDome(scene, [[0, "#04081a"], [0.45, "#14357a"], [0.8, "#b8665a"], [1, "#f0b36a"]], 0x1c2f5c, 70, 240);
applyRoomEnvironment(renderer, scene, 0.4);

/* ---------- light ---------- */
scene.add(new THREE.HemisphereLight(0x9bb4ff, 0x1a1a2e, 0.65));
const moon = new THREE.DirectionalLight(0xcfd8ff, 1.5);
moon.position.set(-35, 70, 25);
moon.target.position.set(0, 0, -5);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -45, right: 45, top: 80, bottom: -80, near: 10, far: 200 });
moon.shadow.bias = -0.0006;
scene.add(moon, moon.target);

const warm = [];
function glow(x, y, z, color, intensity, dist){
  const l = new THREE.PointLight(color, intensity, dist, 1.5);
  l.position.set(x, y, z); scene.add(l); warm.push({ l, base: intensity });
}
glow(0, 7, 31, 0xffc878, 14, 24);            // bull
glow(0, 12, -36, 0xffd9a0, 22, 36);          // Exchange
for(const [x, z] of [[-10.5, 20], [10.5, 6], [-10.5, -8], [10.5, -20], [-10.5, -30]]) glow(x, 4.2, z, 0xfff0c8, 5, 11);

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const TREES = [[-10.5, 14], [10.5, 30], [-10.5, -14], [10.5, -2], [10.5, -26], [-10.5, 36], [10.5, 41]];
const CARS = [[-5.6, 36], [5.6, 24], [-5.6, 12], [5.6, -4], [-5.6, -14], [5.6, -26]];
const collidables = [
  ...[[-10.5, 20], [10.5, 6], [-10.5, -8], [10.5, -20], [-10.5, -30]].map(([x, z]) => ({ x, z, radius: 2.5 })),
  ...[28, 31, 34].map((z) => ({ x: 0, z, radius: 3.3 })),
  ...CARS.map(([x, z]) => ({ x, z, radius: 2.2 })),
  ...TREES.map(([x, z]) => ({ x, z, radius: 0.9 }))
];

/* =========================================================================
   Hotspot content — mirrors education.html's own handlers
   ========================================================================= */
const today = () => getDay(todayStr());

function topicSpot(id, blurb){
  const t = topicDef(id);
  return {
    title: t.name, icon: t.icon, sub: blurb,
    status: () => (dayStudyPoints(today(), id) > 0 ? "done" : "todo"),
    link: { href: "education.html", label: "Open the Trading Floor →" },
    render(body, api){
      const lifetime = financeTopicLifetimePoints(id);
      const { cur, next } = masteryTitleForScore(lifetime);
      const span = next ? next.score - cur.score : 1;
      const into = next ? lifetime - cur.score : 1;
      body.append(ui.big(cur.title),
        ui.bar(next ? (into / span) * 100 : 100,
          next ? `${into.toLocaleString()} / ${span.toLocaleString()} to ${next.title}` : `${lifetime.toLocaleString()} lifetime — Managing Director reached`));
      const curRec = today().study[id];
      body.append(ui.sec("Log study time today"),
        ui.btns(...t.tiers.map((tier) => ui.btn(`${tier.label} · +${tier.points}`, () => {
          const prev = dayStudyPoints(today(), id);
          today().study[id] = { n: tier.n, points: tier.points };
          saveDay(todayStr());
          const delta = tier.points - prev;
          if(delta) pop((delta > 0 ? "+" : "") + delta, delta > 0);
          afterAction(); api.changed();
        }, { on: !!(curRec && curRec.n === tier.n) }))));
      body.append(ui.sec("The ladder"),
        ...MASTERY_TITLES.map((m, i) => ui.row(m.title, `${m.score.toLocaleString()}+ lifetime pts`,
          m.title === cur.title ? h("b", null, "◀ you") : null, lifetime >= m.score && m.title !== cur.title)));
    }
  };
}

function classCountRows(){
  return state.classes.map((c) => {
    const all = state.assignments.filter((a) => a.classId === c.id);
    return ui.row(c.name, `${all.filter((a) => !a.done).length} open · ${all.filter((a) => a.done).length} done`);
  });
}

const SPOTS = {
  HS_topic_accounting: topicSpot("accounting", "Finance mastery · Wall Street ladder"),
  HS_topic_statements: topicSpot("statements", "Finance mastery · Wall Street ladder"),
  HS_topic_corp_finance: topicSpot("corp_finance", "Finance mastery · Wall Street ladder"),
  HS_topic_investing: topicSpot("investing", "Finance mastery · Wall Street ladder"),
  HS_topic_valuation: topicSpot("valuation", "Finance mastery · Wall Street ladder"),

  HS_exchange: {
    title: "The Trading Floor", icon: "🏛️", sub: "Deadlines, classes & your weekly schoolwork goal",
    status: () => {
      const urgent = upcomingAssignments(ASSIGNMENT_DUE_SOON_DAYS).length > 0;
      return urgent || !getWeek(weekStartOf(todayStr())).schoolwork ? "todo" : "done";
    },
    link: { href: "education.html", label: "Open the Trading Floor →" },
    render(body, api){
      body.append(ui.sec("This week"), weeklyGoalRow("schoolwork", api));
      const open = state.assignments.filter((a) => !a.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      body.append(ui.sec(`Deadlines · ${open.length} open`));
      if(!open.length) body.append(ui.muted("Nothing due. You're ahead of the market. 📈"));
      for(const a of open.slice(0, 7)){
        const overdue = a.dueDate < todayStr();
        const out = daysBetween(todayStr(), a.dueDate);
        const when = overdue ? "OVERDUE" : out === 0 ? "Due today" : `Due in ${out}d`;
        body.append(ui.row(a.title, `${classNameFor(a.classId)} · ${when}`,
          ui.btn("✓ Done", () => {
            const x = state.assignments.find((q) => q.id === a.id);
            if(!x || x.done) return;
            x.done = true;
            saveAssignments();
            const day = today();
            day.study._assignmentsDone = (day.study._assignmentsDone || 0) + 1;
            saveDay(todayStr());
            pop("+" + ASSIGNMENT_DONE_POINTS, true);
            afterAction(); api.changed();
          })));
      }
      if(open.length > 7) body.append(ui.muted(`+${open.length - 7} more on the Trading Floor page`));

      body.append(ui.sec("Add an assignment"));
      if(!state.classes.length){
        const ci = h("input", { class: "ix-in", type: "text", placeholder: "Add your first class (e.g. Econ 101)" });
        const addClass = () => {
          if(!ci.value.trim()) return;
          state.classes.push({ id: "cls" + Date.now(), name: ci.value.trim() });
          saveClasses(); api.changed();
        };
        ci.addEventListener("keydown", (e) => { if(e.key === "Enter") addClass(); });
        body.append(h("div", { style: "display:flex;gap:6px" }, ci, ui.btn("Add class", addClass)));
      } else {
        const cls = h("select", { class: "ix-in" }, ...state.classes.map((c) => h("option", { value: c.id }, c.name)));
        const title = h("input", { class: "ix-in", type: "text", placeholder: "Assignment title" });
        const due = h("input", { class: "ix-in", type: "date" });
        body.append(cls, h("div", { style: "height:6px" }), title, h("div", { style: "height:6px" }), due,
          ui.btns(ui.btn("Add assignment", () => {
            if(!title.value.trim() || !due.value){ toast("Give it a title and a due date."); return; }
            state.assignments.push({ id: "asg" + Date.now(), classId: cls.value, title: title.value.trim(), dueDate: due.value, done: false });
            saveAssignments(); api.changed();
          })));
        body.append(ui.sec("Classes"), ...classCountRows());
      }
    }
  },

  HS_bull: {
    title: "The Charging Bull", icon: "🐂", sub: "Your overall rank across all four sectors",
    status: () => "info",
    link: { href: "index.html", label: "Open HQ →" },
    render(body){
      body.append(rankCard());
      body.append(ui.sec("Finance titles"),
        ...FINANCE_TOPICS.map((t) => ui.row(`${t.icon} ${t.name}`, null, h("b", null, masteryTitleForScore(financeTopicLifetimePoints(t.id)).cur.title))));
    }
  }
};

const statFn = () => {
  const all = allTimeScore();
  const n = state.classes.length;
  return `${all.toLocaleString()} pts<small>${n} class${n === 1 ? "" : "es"} tracked</small>`;
};

/* ---------- the Exchange marquee: your deadlines, scrolling ---------- */
let ticker = null, tickerTex = null;
const TICK_VISIBLE = 1664;     // px that fit the 26m x 1m band at 64px tall
function paintTicker(){
  if(!ticker) return;
  const open = state.assignments.filter((a) => !a.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  const t = todayStr();
  const parts = open.map((a) => {
    const out = daysBetween(t, a.dueDate);
    return `${a.title} (${classNameFor(a.classId)}) ${a.dueDate < t ? "OVERDUE" : out === 0 ? "DUE TODAY" : "in " + out + "d"}`;
  });
  const msg = (parts.length ? "▶ DEADLINES  " + parts.join("   ◆   ") : "▶ NO DEADLINES — YOU'RE AHEAD OF THE MARKET") +
    `   ◆   ZERV LEVEL UP  ${allTimeScore().toLocaleString()} PTS   ◆   `;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = "700 40px 'Poppins', sans-serif";
  const P = Math.max(TICK_VISIBLE, Math.ceil(ctx.measureText(msg).width) + 40);
  c.width = P * 2; c.height = 64;
  ctx.fillStyle = "#031a0c"; ctx.fillRect(0, 0, c.width, 64);
  ctx.font = "700 40px 'Poppins', sans-serif";
  ctx.fillStyle = "#3dff8a"; ctx.textBaseline = "middle";
  ctx.fillText(msg, 10, 34); ctx.fillText(msg, P + 10, 34);
  if(tickerTex) tickerTex.dispose();
  tickerTex = new THREE.CanvasTexture(c);
  tickerTex.colorSpace = THREE.SRGBColorSpace;
  tickerTex.wrapS = THREE.RepeatWrapping;
  tickerTex.repeat.set(TICK_VISIBLE / c.width, 1);
  tickerTex.userData.period = P / c.width;
  ticker.material = new THREE.MeshBasicMaterial({ map: tickerTex, toneMapped: false });
}

/* =========================================================================
   Boot
   ========================================================================= */
let ix = null;
loadGLB("models/education.glb").then((gltf) => {
  scene.add(gltf.scene);
  const named = prepareModel(gltf.scene);
  ticker = named.KEEP_ticker || null;
  ix = createInteraction({ scene, camera, canvas, uiRoot: document.getElementById("explore-ui"), statFn, onChange: paintTicker });
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

  stepCamera(camera, controls, dt, { boundX: 12.6, boundZMin: -27.5, boundZMax: 47, collidables });

  if(tickerTex && !reducedMotion){
    tickerTex.offset.x = (tickerTex.offset.x + dt * 0.012) % tickerTex.userData.period;
  }
  if(!reducedMotion) warm.forEach((w, i) => { w.l.intensity = w.base * (1 + Math.sin(t * 0.004 + i * 1.3) * 0.05); });
  if(ix) ix.update(t);
  renderer.render(scene, camera);
}
