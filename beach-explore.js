/* =========================================================================
   Beach Explore — a lightweight, low-poly walkable 3D scene around the
   Surf Shack. Scene-specific content only; movement/controls/renderer
   setup live in explore-shared.js and are reused by every sector's scene.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI } from "./explore-shared.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 40);
hookResize(camera, renderer);

createSkyDome(scene, [
  [0, "#1b1036"], [0.45, "#6a2c6b"], [0.72, "#FF006E"], [1, "#FFBE0B"]
], 0xff8fc7);

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

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const collidables = [{ x: shack.position.x, z: shack.position.z, radius: 4.2 }];

/* =========================================================================
   LOOP
   ========================================================================= */
let lastT = performance.now();
function animate(t){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  stepCamera(camera, controls, dt, { collidables });

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

/* =========================================================================
   UI handoff — reveal controls, pull real stats from app.js (loaded as a
   classic script right before this module, so its globals are visible here).
   ========================================================================= */
revealUI();
try{
  const all = allTimeScore();
  const n = (typeof state !== "undefined" && state.businesses) ? state.businesses.length : 0;
  document.getElementById("exploreStat").innerHTML =
    `${all.toLocaleString()} pts<small>${n} business${n===1?"":"es"} tracked</small>`;
}catch(e){ /* app.js state not available — stat chip just stays blank */ }
