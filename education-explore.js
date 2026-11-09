/* =========================================================================
   Education Explore — a walkable low-poly Wall Street. A canyon of
   skyscrapers running toward a columned trading-floor building at the
   far end, with a charging bull statue as the street's landmark.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI } from "./explore-shared.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 46);
hookResize(camera, renderer);

/* Cold city-dusk sky — navy fading to a gold haze near the skyline */
createSkyDome(scene, [
  [0, "#040a1c"], [0.5, "#0B3D91"], [1, "#D4AF37"]
], 0x0B3D91, 40, 160);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xE8EEF7, 0x0A1F3D, 0.85));
const moon = new THREE.DirectionalLight(0xE8EEF7, 0.9);
moon.position.set(-30, 60, 20);
scene.add(moon);
const neon = new THREE.PointLight(0x00C853, 0.8, 50);
neon.position.set(0, 10, -40);
scene.add(neon);

/* ---------- street ---------- */
const STREET_LEN = 90; /* z runs from +45 (start) to -45 (far end) */
const STREET_W = 14;
const street = new THREE.Mesh(
  new THREE.PlaneGeometry(STREET_W, STREET_LEN),
  new THREE.MeshLambertMaterial({ color: 0x1A1A2E })
);
street.rotation.x = -Math.PI / 2;
scene.add(street);

const gold = new THREE.MeshLambertMaterial({ color: 0xD4AF37 });
const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, STREET_LEN - 4), gold);
centerLine.position.y = 0.011;
scene.add(centerLine);

const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x9aa3b5 });
[-1, 1].forEach((side) => {
  const sw = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, STREET_LEN), sidewalkMat);
  sw.position.set(side * (STREET_W / 2 + 2), 0.1, 0);
  scene.add(sw);
});

/* ---------- skyscraper canyon ---------- */
const bodyMats = [0x0A1F3D, 0x122A4A, 0x1A3560].map(c => new THREE.MeshLambertMaterial({ color: c }));
const windowMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
const collidables = [];

function skyscraper(x, z, w, h, d){
  const g = new THREE.Group();
  const mat = bodyMats[Math.floor(Math.random() * bodyMats.length)];
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  body.position.y = h / 2;
  g.add(body);
  /* a few lit-window strips, cheap: thin emissive-looking planes on the street-facing face */
  const faceX = x < 0 ? w / 2 + 0.05 : -w / 2 - 0.05;
  for(let i = 0; i < 4; i++){
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.7, 0.4), windowMat);
    strip.position.set(faceX, h * (0.2 + i * 0.2), 0);
    strip.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(strip);
  }
  g.position.set(x, 0, z);
  scene.add(g);
  collidables.push({ x, z, radius: Math.max(w, d) / 2 + 0.6 });
}
const SIDE_X = STREET_W / 2 + 5;
const zSlots = [-38, -26, -14, -2, 10, 22, 34];
zSlots.forEach((z, i) => {
  const hL = 14 + ((i * 7) % 20);
  const hR = 14 + ((i * 11) % 22);
  skyscraper(-SIDE_X, z, 7, hL, 7);
  skyscraper(SIDE_X, z, 7, hR, 7);
});

/* ---------- trading-floor building (the landmark, far end of the street) ---------- */
const exchange = new THREE.Group();
const facade = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 6), new THREE.MeshLambertMaterial({ color: 0xF0F4FA }));
facade.position.y = 5;
exchange.add(facade);
const pediment = new THREE.Mesh(new THREE.ConeGeometry(10, 2.5, 4), new THREE.MeshLambertMaterial({ color: 0xD4AF37 }));
pediment.position.y = 10 + 1.25;
pediment.rotation.y = Math.PI / 4;
pediment.scale.set(1.15, 1, 0.5);
exchange.add(pediment);
for(let i = 0; i < 6; i++){
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8, 10), new THREE.MeshLambertMaterial({ color: 0xE8EEF7 }));
  col.position.set(-6.5 + i * 2.6, 4, 3.1);
  exchange.add(col);
}
const ticker = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x00C853 }));
ticker.position.set(0, 2.2, 3.2);
exchange.add(ticker);
exchange.position.set(0, 0, -44);
scene.add(exchange);
collidables.push({ x: 0, z: -44, radius: 9 });

/* ---------- charging bull statue (street landmark, collidable) ---------- */
const bronze = new THREE.MeshLambertMaterial({ color: 0xB5812E });
const bronzeDark = new THREE.MeshLambertMaterial({ color: 0x8A6324 });
const bull = new THREE.Group();
const bullBody = new THREE.Mesh(new THREE.CapsuleGeometry(1.1, 1.8, 4, 8), bronze);
bullBody.rotation.z = Math.PI / 2;
bullBody.position.y = 1.6;
bull.add(bullBody);
const bullHead = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 8), bronze);
bullHead.rotation.x = Math.PI / 2;
bullHead.position.set(0, 1.5, 1.7);
bull.add(bullHead);
for(const side of [-1, 1]){
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 6), gold);
  horn.position.set(side * 0.35, 2.0, 2.0);
  horn.rotation.x = -0.6;
  horn.rotation.z = side * 0.3;
  bull.add(horn);
}
for(const [lx, lz] of [[-0.5, 0.8], [0.5, 0.8], [-0.5, -0.8], [0.5, -0.8]]){
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 6), bronzeDark);
  leg.position.set(lx, 0.7, lz);
  bull.add(leg);
}
bull.position.set(0, 0, 18);
bull.rotation.y = Math.PI;
scene.add(bull);
collidables.push({ x: 0, z: 18, radius: 2.2 });

/* ---------- street lamps ---------- */
function lamp(x, z){
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4, 6), new THREE.MeshLambertMaterial({ color: 0x1A1A2E }));
  pole.position.y = 2;
  g.add(pole);
  const lightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFE3B8 }));
  lightBulb.position.y = 4.1;
  g.add(lightBulb);
  g.position.set(x, 0, z);
  scene.add(g);
}
[-28, -8, 12, 32].forEach((z) => {
  lamp(-STREET_W / 2 - 0.5, z);
  lamp(STREET_W / 2 + 0.5, z);
});

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});

/* =========================================================================
   LOOP
   ========================================================================= */
let lastT = performance.now();
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  stepCamera(camera, controls, dt, {
    boundX: STREET_W / 2 + 5.5, boundZMin: -48, boundZMax: 44, collidables
  });

  if(!reducedMotion){
    const flicker = 1 + Math.sin(t * 0.004) * 0.15;
    neon.intensity = 0.8 * flicker;
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

/* =========================================================================
   UI handoff
   ========================================================================= */
revealUI();
try{
  const all = allTimeScore();
  const n = (typeof state !== "undefined" && state.classes) ? state.classes.length : 0;
  document.getElementById("exploreStat").innerHTML =
    `${all.toLocaleString()} pts<small>${n} class${n===1?"":"es"} tracked</small>`;
}catch(e){ /* app.js state not available — stat chip just stays blank */ }
