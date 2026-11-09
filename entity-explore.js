/* =========================================================================
   Entity Explore — The Vitruvian Chamber. A walkable Renaissance study
   room built around Leonardo's circle-and-square construction, inlaid
   in the floor, with a central pedestal and study-desk props.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI } from "./explore-shared.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 18);
hookResize(camera, renderer);

/* Dusk-parchment sky, barely visible through the oculus */
createSkyDome(scene, [
  [0, "#140d08"], [0.5, "#3b2a18"], [1, "#9C4A3C"]
], 0x3b2a18, 20, 90);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xC9A227, 0x2A1D10, 0.75));
const beam = new THREE.DirectionalLight(0xFFE3B8, 1.15);
beam.position.set(0, 40, 0);
scene.add(beam);
const warmFill = new THREE.PointLight(0xC9A227, 0.6, 40);
warmFill.position.set(0, 6, 0);
scene.add(warmFill);

const ROOM = 26; /* half-size of the square chamber interior */
const WALL_H = 9;

/* ---------- floor ---------- */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM * 2, ROOM * 2),
  new THREE.MeshLambertMaterial({ color: 0x3B2A18 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/* ---------- the circle-and-square inlay, flat on the floor ---------- */
const gold = new THREE.MeshLambertMaterial({ color: 0xC9A227 });
const sanguine = new THREE.MeshLambertMaterial({ color: 0x9C4A3C });
const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.1, 8, 48), gold);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.02;
scene.add(ring);

function floorSquareEdge(len, x, z, rotY){
  const edge = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.2), gold);
  edge.position.set(x, 0.02, z);
  edge.rotation.y = rotY;
  scene.add(edge);
}
const sq = 9 * 1.41; /* square tangent to the circle */
floorSquareEdge(sq, 0, -sq / 2, 0);
floorSquareEdge(sq, 0, sq / 2, 0);
floorSquareEdge(sq, -sq / 2, 0, Math.PI / 2);
floorSquareEdge(sq, sq / 2, 0, Math.PI / 2);

/* radiating construction lines */
for(let i = 0; i < 8; i++){
  const ang = (i / 8) * Math.PI * 2;
  const line = new THREE.Mesh(new THREE.BoxGeometry(9, 0.02, 0.06), sanguine);
  line.position.set(Math.cos(ang) * 4.5, 0.015, Math.sin(ang) * 4.5);
  line.rotation.y = -ang;
  scene.add(line);
}

/* ---------- central pedestal (the collidable landmark) ---------- */
const pedestal = new THREE.Group();
const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 1.3, 16), new THREE.MeshLambertMaterial({ color: 0xEFE3C4 }));
plinth.position.y = 0.65;
pedestal.add(plinth);
const globe = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), gold);
globe.position.y = 1.3 + 0.7;
pedestal.add(globe);
const globeRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 8, 32), sanguine);
globeRing.position.y = globe.position.y;
globeRing.rotation.x = Math.PI / 2.3;
pedestal.add(globeRing);
scene.add(pedestal);

/* ---------- walls ---------- */
const wallMat = new THREE.MeshLambertMaterial({ color: 0xD8C9A3 });
function wall(w, h, d, x, y, z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}
wall(ROOM * 2 + 2, WALL_H, 1, 0, WALL_H / 2, -ROOM);
wall(ROOM * 2 + 2, WALL_H, 1, 0, WALL_H / 2, ROOM);
wall(1, WALL_H, ROOM * 2 + 2, -ROOM, WALL_H / 2, 0);
wall(1, WALL_H, ROOM * 2 + 2, ROOM, WALL_H / 2, 0);

/* window insets on the walls for visual interest */
const windowMat = new THREE.MeshBasicMaterial({ color: 0x9C4A3C });
[-14, 14].forEach((x) => {
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4), windowMat);
  win.position.set(x, 5, -ROOM + 0.51);
  scene.add(win);
});

/* ---------- ceiling with an oculus (open circle) ---------- */
const ceiling = new THREE.Mesh(
  new THREE.RingGeometry(5, ROOM * 1.5, 24),
  new THREE.MeshLambertMaterial({ color: 0xEFE3C4, side: THREE.DoubleSide })
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = WALL_H;
scene.add(ceiling);

/* ---------- draftsman's table + scrolls (a side prop) ---------- */
const table = new THREE.Group();
const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 1.6), new THREE.MeshLambertMaterial({ color: 0x6b4a2a }));
tableTop.position.y = 1.0;
tableTop.rotation.x = -0.18;
table.add(tableTop);
for(let i = 0; i < 4; i++){
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), new THREE.MeshLambertMaterial({ color: 0x4a3521 }));
  leg.position.set((i % 2 ? 1.3 : -1.3), 0.5, (i < 2 ? 0.6 : -0.6));
  table.add(leg);
}
const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), new THREE.MeshLambertMaterial({ color: 0xEFE3C4 }));
scroll.rotation.z = Math.PI / 2;
scroll.position.set(0.3, 1.15, 0);
table.add(scroll);
table.position.set(-18, 0, -16);
table.rotation.y = 0.6;
scene.add(table);

/* candle stands along the walls */
function candle(x, z){
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.6, 6), gold);
  stand.position.y = 0.8;
  g.add(stand);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), new THREE.MeshBasicMaterial({ color: 0xFFBE0B }));
  flame.position.y = 1.65;
  g.add(flame);
  g.position.set(x, 0, z);
  scene.add(g);
}
[[-22, -22], [22, -22], [-22, 22], [22, 22]].forEach(([x, z]) => candle(x, z));

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const WALL_MARGIN = ROOM - 2;
const collidables = [
  { x: 0, z: 0, radius: 2.0 },
  { x: -18, z: -16, radius: 2.0 }
];

/* =========================================================================
   LOOP
   ========================================================================= */
let lastT = performance.now();
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  stepCamera(camera, controls, dt, {
    boundX: WALL_MARGIN, boundZMin: -WALL_MARGIN, boundZMax: WALL_MARGIN, collidables
  });

  if(!reducedMotion){
    const flicker = 1 + Math.sin(t * 0.006) * 0.08;
    warmFill.intensity = 0.6 * flicker;
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
  const { cur } = rankInfoForScore(all);
  document.getElementById("exploreStat").innerHTML =
    `${all.toLocaleString()} pts<small>${cur.rank}</small>`;
}catch(e){ /* app.js state not available — stat chip just stays blank */ }
