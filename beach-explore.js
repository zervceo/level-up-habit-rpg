/* =========================================================================
   Beach Explore — a lightweight, low-poly walkable 3D scene around the
   Surf Shack, built with Three.js as a plain ES module import — no
   bundler, no build step, fits the same "plain static files" setup as the
   rest of this app. Three.js itself is vendored into vendor/three.module.min.js
   (MIT license alongside it) rather than pulled from a CDN at runtime, so
   this page keeps working even if a visitor's network blocks CDNs — see
   NOTES.md. app.js is loaded as a classic script right before this module
   in beach-explore.html, so its top-level consts/functions (state,
   allTimeScore, etc.) are visible here via normal global lookup.
   ========================================================================= */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById('three-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 1.7, 40);
camera.rotation.order = "YXZ";

/* ---------- sunset sky (gradient canvas on an inverted sphere) ---------- */
function makeSkyTexture(){
  const c = document.createElement("canvas");
  c.width = 2; c.height = 256;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#1b1036");
  grad.addColorStop(0.45, "#6a2c6b");
  grad.addColorStop(0.72, "#FF006E");
  grad.addColorStop(1, "#FFBE0B");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  return new THREE.CanvasTexture(c);
}
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(300, 24, 16),
  new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false })
));
scene.fog = new THREE.Fog(0xff8fc7, 70, 260);

/* ---------- lights (cheap — no shadow maps, keeps this fast on phones) ---------- */
scene.add(new THREE.HemisphereLight(0xffe3b8, 0xF4C06D, 0.95));
const sun = new THREE.DirectionalLight(0xFFBE0B, 1.1);
sun.position.set(-40, 60, 20);
scene.add(sun);

/* ---------- ground (sand) ---------- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(240, 240),
  new THREE.MeshLambertMaterial({ color: 0xF4C06D })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ---------- ocean (animated low-poly waves) ---------- */
const oceanGeo = new THREE.PlaneGeometry(240, 140, 48, 28);
const ocean = new THREE.Mesh(
  oceanGeo,
  new THREE.MeshLambertMaterial({ color: 0x146C6E, transparent: true, opacity: 0.92 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.set(0, 0.05, -100);
scene.add(ocean);
const oceanBase = oceanGeo.attributes.position.array.slice();

const foam = new THREE.Mesh(
  new THREE.PlaneGeometry(240, 6),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
);
foam.rotation.x = -Math.PI / 2;
foam.position.set(0, 0.06, -32);
scene.add(foam);

/* ---------- the Surf Shack ---------- */
const shack = new THREE.Group();
const base = new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, 5), new THREE.MeshLambertMaterial({ color: 0x8a5a3c }));
base.position.y = 1.7;
shack.add(base);
const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.4, 4), new THREE.MeshLambertMaterial({ color: 0xFF8C42 }));
roof.position.y = 3.4 + 1.2;
roof.rotation.y = Math.PI / 4;
shack.add(roof);
const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.1), new THREE.MeshLambertMaterial({ color: 0x1A1A2E }));
door.position.set(0, 1.05, 2.51);
shack.add(door);
const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.1), new THREE.MeshLambertMaterial({ color: 0xFF006E }));
sign.position.set(0, 2.9, 2.56);
shack.add(sign);
scene.add(shack);
const SHACK_RADIUS = 4.2;

/* ---------- palms ---------- */
function createPalm(){
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.22, 3.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x6b4a2a })
  );
  trunk.position.y = 1.6;
  trunk.rotation.z = (Math.random() - 0.5) * 0.25;
  g.add(trunk);
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x1F8A5F, side: THREE.DoubleSide });
  const top = new THREE.Group();
  top.position.y = 3.2;
  for(let i = 0; i < 6; i++){
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.1, 4), frondMat);
    frond.rotation.z = Math.PI / 2.1;
    frond.rotation.y = (i / 6) * Math.PI * 2;
    top.add(frond);
  }
  g.add(top);
  return g;
}
const palmPositions = [
  [-9,-10],[-14,2],[-10,16],[9,-12],[14,4],[11,18],
  [-20,-24],[20,-22],[-6,-28],[7,-30],[-22,8],[22,10]
];
for(const [x, z] of palmPositions){
  const p = createPalm();
  p.position.set(x, 0, z);
  p.scale.setScalar(0.85 + Math.random() * 0.4);
  scene.add(p);
}

/* ---------- beach props (matching the 2D iconography) ---------- */
const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.08), new THREE.MeshLambertMaterial({ color: 0xFF006E }));
board.position.set(3.2, 1.1, 3.6);
board.rotation.z = 0.25;
scene.add(board);

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshLambertMaterial({ color: 0x00FF41 }));
ball.position.set(-3.6, 0.4, 4.2);
scene.add(ball);

/* =========================================================================
   CONTROLS — touch-joystick (mouse-draggable too) for movement, drag
   anywhere else on the canvas to look around, WASD/arrows as a desktop
   alternative to the joystick.
   ========================================================================= */
let yaw = 0, pitch = -0.05;
const moveState = { x: 0, z: 0 };
const keys = {};
const _fwd = new THREE.Vector3(), _right = new THREE.Vector3(), _euler = new THREE.Euler();

const zone = document.getElementById("joystick-zone");
const nub = document.getElementById("joystick-nub");
let joyActive = false, joyId = null, joyCenter = { x: 0, y: 0 };
function joyStart(id, x, y){
  joyActive = true; joyId = id;
  const r = zone.getBoundingClientRect();
  joyCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  joyMove(x, y);
}
function joyMove(x, y){
  if(!joyActive) return;
  let dx = x - joyCenter.x, dy = y - joyCenter.y;
  const max = 40;
  const dist = Math.min(Math.hypot(dx, dy), max);
  const ang = Math.atan2(dy, dx);
  dx = Math.cos(ang) * dist; dy = Math.sin(ang) * dist;
  nub.style.transform = `translate(${dx}px, ${dy}px)`;
  moveState.x = dx / max;
  moveState.z = dy / max;
}
function joyEnd(){
  joyActive = false; joyId = null;
  nub.style.transform = "translate(0,0)";
  moveState.x = 0; moveState.z = 0;
}
zone.addEventListener("pointerdown", (e) => { zone.setPointerCapture(e.pointerId); joyStart(e.pointerId, e.clientX, e.clientY); });
zone.addEventListener("pointermove", (e) => { if(e.pointerId === joyId) joyMove(e.clientX, e.clientY); });
zone.addEventListener("pointerup", joyEnd);
zone.addEventListener("pointercancel", joyEnd);

let lookActive = false, lookId = null, lastX = 0, lastY = 0;
canvas.addEventListener("pointerdown", (e) => {
  lookActive = true; lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if(!lookActive || e.pointerId !== lookId) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  yaw -= dx * 0.004;
  pitch = Math.max(-0.5, Math.min(0.5, pitch - dy * 0.003));
});
function endLook(e){ if(e.pointerId === lookId) lookActive = false; }
canvas.addEventListener("pointerup", endLook);
canvas.addEventListener("pointercancel", endLook);

window.addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

/* =========================================================================
   LOOP
   ========================================================================= */
const BOUND = 58;
let lastT = performance.now();
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  let kx = 0, kz = 0;
  if(keys["a"] || keys["arrowleft"]) kx -= 1;
  if(keys["d"] || keys["arrowright"]) kx += 1;
  if(keys["w"] || keys["arrowup"]) kz -= 1;
  if(keys["s"] || keys["arrowdown"]) kz += 1;
  const mx = joyActive ? moveState.x : kx;
  const mz = joyActive ? moveState.z : kz;

  if(mx || mz){
    const speed = 9;
    _euler.set(0, yaw, 0);
    _fwd.set(0, 0, -1).applyEuler(_euler);
    _right.set(1, 0, 0).applyEuler(_euler);
    const next = camera.position.clone();
    next.addScaledVector(_fwd, -mz * speed * dt);
    next.addScaledVector(_right, mx * speed * dt);
    next.x = Math.max(-BOUND, Math.min(BOUND, next.x));
    next.z = Math.max(-BOUND + 2, Math.min(BOUND, next.z));
    const distToShack = Math.hypot(next.x - shack.position.x, next.z - shack.position.z);
    if(distToShack < SHACK_RADIUS){
      const ang = Math.atan2(next.z - shack.position.z, next.x - shack.position.x);
      next.x = shack.position.x + Math.cos(ang) * SHACK_RADIUS;
      next.z = shack.position.z + Math.sin(ang) * SHACK_RADIUS;
    }
    camera.position.x = next.x;
    camera.position.z = next.z;
  }
  camera.position.y = 1.7;
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  if(!reducedMotion){
    const pos = oceanGeo.attributes.position;
    const time = t * 0.0012;
    for(let i = 0; i < pos.count; i++){
      const ix = oceanBase[i * 3], iz = oceanBase[i * 3 + 2];
      const h = Math.sin(ix * 0.15 + time * 3) * 0.18 + Math.sin(iz * 0.2 + time * 2.2) * 0.14;
      pos.setY(i, h);
    }
    pos.needsUpdate = true;
    foam.position.y = 0.06 + Math.sin(time * 3) * 0.03;
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================================================
   UI handoff — hide the loading notice, show controls, pull real stats
   from app.js (loaded as a classic script right before this module).
   ========================================================================= */
document.getElementById("loadingNotice").style.display = "none";
document.getElementById("explore-ui").style.display = "block";
try{
  const all = allTimeScore();
  const n = (typeof state !== "undefined" && state.businesses) ? state.businesses.length : 0;
  document.getElementById("exploreStat").innerHTML =
    `${all.toLocaleString()} pts<small>${n} business${n===1?"":"es"} tracked</small>`;
}catch(e){ /* app.js state not available — stat chip just stays blank */ }
