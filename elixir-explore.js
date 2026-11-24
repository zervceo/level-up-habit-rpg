/* =========================================================================
   Elixir Explore — the Workshop. Geometry is authored in Blender
   (tools/blender/build_elixir.py -> models/elixir.glb): four hobby bays
   around a central mastery island. Each bay opens that hobby's practice
   log + milestone checklist, wired to the same data as elixir.html.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI,
         loadGLB, applyRoomEnvironment, prepareModel, failUI } from "./explore-shared.js";
import { KNOWLEDGE } from "./knowledge.js";
import { h, ui, createInteraction, afterAction, pop, toast, rankCard } from "./explore-interact.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 19);
hookResize(camera, renderer);

createSkyDome(scene, [[0, "#1a0f08"], [0.5, "#4a3522"], [1, "#FF8C42"]], 0x3d2a1a, 120, 400);
applyRoomEnvironment(renderer, scene, 0.35);

/* ---------- light: a "sun" parked just under the ceiling so the roof doesn't shadow the room ---------- */
scene.add(new THREE.HemisphereLight(0xffe9c8, 0x4a3322, 0.8));
const sun = new THREE.DirectionalLight(0xffe2b0, 2.0);
sun.position.set(-10, 7.6, 12);
sun.target.position.set(6, 0, -8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 0.5, far: 60 });
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

const pendants = [];
for(const [x, z] of [[-12, -14], [12, -14], [-14, 6], [14, 6], [0, -4], [0, 12]]){
  const l = new THREE.PointLight(0xffc766, 9, 16, 1.5);
  l.position.set(x, 4.9, z);
  scene.add(l); pendants.push(l);
}

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const collidables = [
  ...[-13.5, -12, -10.5].map((x) => ({ x, z: -18.8, radius: 1.0 })), { x: -8.8, z: -19.7, radius: 0.9 },   // shaping bay
  ...[9.5, 12, 14.5].map((x) => ({ x, z: -19.4, radius: 1.6 })), { x: 15.8, z: -19.7, radius: 0.9 }, { x: 12, z: -17.4, radius: 0.5 }, // coding
  ...[3.5, 6, 8.5].map((z) => ({ x: -19.4, z, radius: 1.6 })),                                              // electrical
  { x: 18.5, z: 7.9, radius: 1.1 }, { x: 18.5, z: 4.1, radius: 1.1 }, { x: 19.6, z: 9.4, radius: 1.6 }, { x: 19.8, z: 2.4, radius: 0.8 }, // art
  ...[-1.8, 0, 1.8].map((x) => ({ x, z: -4, radius: 1.9 }))                                                  // island
];

/* =========================================================================
   Hotspot content — mirrors elixir.html's own handlers
   ========================================================================= */
const today = () => getDay(todayStr());
function lifetimePractice(id){
  let n = 0;
  for(const d in state.days) n += dayCraftPoints(state.days[d], id);
  return n;
}
function boardsShaped(){
  return Object.keys(state.days).reduce((s, d) => s + ((state.days[d].craft[SHAPE_BOARD_BONUS.id] && state.days[d].craft[SHAPE_BOARD_BONUS.id].entries) || []).length, 0);
}

function hobbySpot(id, blurb){
  const hob = hobbyDef(id);
  return {
    title: hob.name, icon: hob.icon, sub: blurb,
    status: () => (dayCraftPoints(today(), id) > 0 ? "done" : "todo"),
    link: { href: "elixir.html", label: "Open the Workshop →" },
    render(body, api){
      const { checked, total, name } = hobbyMasteryLevel(id);
      body.append(ui.big(name), ui.bar((checked / total) * 100, `${checked} / ${total} milestones · ${lifetimePractice(id).toLocaleString()} lifetime practice points`));
      const cur = today().craft[id];
      body.append(ui.sec("Log practice time today"),
        ui.btns(...hob.tiers.map((t) => ui.btn(`${t.label} · +${t.points}`, () => {
          const prev = dayCraftPoints(today(), id);
          today().craft[id] = { n: t.n, points: t.points };
          saveDay(todayStr());
          const delta = t.points - prev;
          if(delta) pop((delta > 0 ? "+" : "") + delta, delta > 0);
          afterAction(); api.changed();
        }, { on: !!(cur && cur.n === t.n) }))));
      if(id === "surfboard_making"){
        body.append(ui.sec("Bonus wave 🌊"), ui.muted("Not required, not weekly — a big bonus whenever you finish shaping one."),
          ui.btns(ui.btn(`🏄 Shape a Board (+${SHAPE_BOARD_BONUS.points})`, () => {
            const day = today();
            if(!day.craft[SHAPE_BOARD_BONUS.id]) day.craft[SHAPE_BOARD_BONUS.id] = { entries: [] };
            day.craft[SHAPE_BOARD_BONUS.id].entries.push({ points: SHAPE_BOARD_BONUS.points, ts: Date.now() });
            saveDay(todayStr());
            pop("+" + SHAPE_BOARD_BONUS.points, true);
            toast("🏄 Board shaped! Bonus banked.");
            afterAction(); api.changed();
          })),
          ui.muted(`${boardsShaped()} board${boardsShaped() === 1 ? "" : "s"} shaped, lifetime`));
      }
      const done = getElixirMilestones(id);
      body.append(ui.sec("Skill progression"), ui.muted("Self-assessed — check one off when you genuinely reach it."));
      hob.milestones.forEach((m, i) => {
        const on = done.includes(i);
        body.append(ui.row(`${i + 1}. ${m}`, null, ui.btn(on ? "✓" : "○", () => {
          const arr = getElixirMilestones(id);
          const pos = arr.indexOf(i);
          if(pos === -1){ arr.push(i); toast("🧰 Milestone checked off!"); } else arr.splice(pos, 1);
          saveElixirMilestones();
          afterAction(); api.changed();
        }, { on }), on));
      });
    }
  };
}

const SPOTS = {
  HS_hobby_surfboard_making: hobbySpot("surfboard_making", "Shaping bay · foam, resin & fins"),
  HS_hobby_coding: hobbySpot("coding", "Code corner · from first syntax to shipped systems"),
  HS_hobby_electrical: hobbySpot("electrical", "Circuit lab · Ohm's law to original products"),
  HS_hobby_art: hobbySpot("art", "Art studio · fundamentals to a signature piece"),
  HS_hub: {
    title: "Mastery Island", icon: "🛠️", sub: "All four crafts at a glance",
    status: () => "info",
    link: { href: "elixir.html", label: "Open the Workshop →" },
    render(body){
      body.append(rankCard());
      body.append(ui.sec(`Today's practice · +${dayCraftTotal(today()).toLocaleString()}`));
      for(const hob of HOBBIES){
        const { checked, total, name } = hobbyMasteryLevel(hob.id);
        body.append(ui.row(`${hob.icon} ${hob.name}`, `${checked}/${total} milestones · today +${dayCraftPoints(today(), hob.id)}`, h("b", null, name)));
      }
    }
  }
};

const statFn = () => {
  const all = allTimeScore();
  const started = HOBBIES.filter((x) => getElixirMilestones(x.id).length >= 1).length;
  return `${all.toLocaleString()} pts<small>${started}/${HOBBIES.length} hobbies started</small>`;
};

/* ---------- live screens ---------- */
const screens = {};
function setScreen(mesh, draw, w = 512, hgt = 300){
  const c = document.createElement("canvas");
  c.width = w; c.height = hgt;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  mesh.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const ctx = c.getContext("2d");
  const s = { ctx, tex, draw, w, h: hgt };
  draw(ctx, w, hgt, 0);
  tex.needsUpdate = true;
  return s;
}
function wrap(ctx, text, x, y, maxW, lh){
  let line = "";
  for(const word of text.split(" ")){
    const t = line ? line + " " + word : word;
    if(ctx.measureText(t).width > maxW && line){ ctx.fillText(line, x, y); y += lh; line = word; } else line = t;
  }
  ctx.fillText(line, x, y);
  return y + lh;
}
function drawMilestone(ctx, w, hgt){
  const hob = hobbyDef("coding");
  const done = getElixirMilestones("coding");
  const next = hob.milestones.findIndex((_, i) => !done.includes(i));
  ctx.fillStyle = "#0a1a2e"; ctx.fillRect(0, 0, w, hgt);
  ctx.fillStyle = "#3A86FF"; ctx.font = "700 24px monospace"; ctx.fillText("// NEXT MILESTONE", 22, 40);
  ctx.fillStyle = "#e8f1ff"; ctx.font = "700 30px 'Poppins', sans-serif";
  const msg = next === -1 ? "All milestones reached. Architect something new." : `${next + 1}. ${hob.milestones[next]}`;
  wrap(ctx, msg, 22, 96, w - 44, 40);
  ctx.fillStyle = "#6cffa8"; ctx.font = "700 22px monospace";
  ctx.fillText(`> ${done.length}/${hob.milestones.length} complete`, 22, hgt - 26);
}
function drawCode(ctx, w, hgt){
  ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, w, hgt);
  const cols = ["#6cffa8", "#8fc4ff", "#ffbe0b", "#ff8c42", "#e8f1ff", "#c792ea"];
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  ctx.font = "20px monospace";
  for(let i = 0; i < 11; i++){
    let x = 24 + Math.floor(rnd() * 3) * 22;
    for(let k = 0; k < 1 + Math.floor(rnd() * 4); k++){
      const len = 40 + Math.floor(rnd() * 110);
      ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
      ctx.fillRect(x, 28 + i * 24, len, 10);
      x += len + 14;
    }
  }
}
function drawTerminal(ctx, w, hgt){
  const hob = hobbyDef("coding");
  const n = getElixirMilestones("coding").length;
  ctx.fillStyle = "#06140c"; ctx.fillRect(0, 0, w, hgt);
  ctx.fillStyle = "#6cffa8"; ctx.font = "700 24px monospace";
  ctx.fillText("$ zerv build --craft coding", 20, 42);
  ctx.fillText(`✓ ${n} / ${hob.milestones.length} milestones`, 20, 84);
  ctx.fillText(`✓ practice today: +${dayCraftPoints(getDay(todayStr()), "coding")}`, 20, 120);
  ctx.strokeStyle = "#6cffa8"; ctx.lineWidth = 3; ctx.strokeRect(20, 160, w - 40, 36);
  ctx.fillRect(24, 164, (w - 48) * (n / hob.milestones.length), 28);
  ctx.fillText("$ _", 20, 250);
}
function drawScope(ctx, w, hgt, t){
  ctx.fillStyle = "#02140c"; ctx.fillRect(0, 0, w, hgt);
  ctx.strokeStyle = "rgba(60,255,140,.25)"; ctx.lineWidth = 1;
  for(let i = 0; i <= 8; i++){ ctx.beginPath(); ctx.moveTo(i * w / 8, 0); ctx.lineTo(i * w / 8, hgt); ctx.stroke(); }
  for(let i = 0; i <= 6; i++){ ctx.beginPath(); ctx.moveTo(0, i * hgt / 6); ctx.lineTo(w, i * hgt / 6); ctx.stroke(); }
  ctx.strokeStyle = "#3dff8a"; ctx.lineWidth = 3; ctx.beginPath();
  for(let x = 0; x <= w; x += 3){
    const y = hgt / 2 + Math.sin(x * 0.035 + t * 4) * hgt * 0.28 + Math.sin(x * 0.09 + t * 2) * hgt * 0.08;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function refreshScreens(){
  for(const k of ["code0", "code1", "code2"]){
    const s = screens[k];
    if(!s) continue;
    s.draw(s.ctx, s.w, s.h, 0);
    s.tex.needsUpdate = true;
  }
}

/* =========================================================================
   Boot
   ========================================================================= */
let ix = null;
loadGLB("models/elixir.glb").then((gltf) => {
  scene.add(gltf.scene);
  const named = prepareModel(gltf.scene);
  if(named.KEEP_screen_code_0) screens.code0 = setScreen(named.KEEP_screen_code_0, drawMilestone);
  if(named.KEEP_screen_code_1) screens.code1 = setScreen(named.KEEP_screen_code_1, drawCode);
  if(named.KEEP_screen_code_2) screens.code2 = setScreen(named.KEEP_screen_code_2, drawTerminal);
  if(named.KEEP_screen_scope) screens.scope = setScreen(named.KEEP_screen_scope, drawScope, 256, 192);
  ix = createInteraction({ scene, camera, canvas, uiRoot: document.getElementById("explore-ui"), statFn, onChange: refreshScreens });
  for(const name in SPOTS) ix.register(named[name], { ...SPOTS[name], learn: KNOWLEDGE[name] });
  ix.changed();
  window.__ex = { camera, controls, ix, scene };
  revealUI();
  requestAnimationFrame(animate);
}).catch((e) => { console.error(e); failUI("The model file didn't load."); });

let lastT = performance.now(), frame = 0;
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  frame++;

  stepCamera(camera, controls, dt, { boundX: 20.6, boundZMin: -20.6, boundZMax: 20.6, collidables });

  if(!reducedMotion){
    pendants.forEach((l, i) => { l.intensity = 9 * (1 + Math.sin(t * 0.003 + i * 1.9) * 0.03); });
    if(screens.scope && frame % 4 === 0){
      screens.scope.draw(screens.scope.ctx, screens.scope.w, screens.scope.h, t / 1000);
      screens.scope.tex.needsUpdate = true;
    }
  }
  if(ix) ix.update(t);
  renderer.render(scene, camera);
}
