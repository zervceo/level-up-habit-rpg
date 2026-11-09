/* =========================================================================
   Elixir Explore — The Workshop. A walkable maker's workshop interior
   with four corner stations hinting at the sector's hobbies: surfboard
   shaping, coding, electrical engineering, and art.
   ========================================================================= */
import { THREE, createRenderer, createCamera, hookResize, createSkyDome, createControls, stepCamera, revealUI } from "./explore-shared.js";

const canvas = document.getElementById("three-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = createCamera();
camera.position.set(0, 1.7, 16);
hookResize(camera, renderer);

/* Warm sawdust-lit interior, barely visible through the skylights */
createSkyDome(scene, [
  [0, "#1a0f08"], [0.5, "#4a3522"], [1, "#FF8C42"]
], 0x3D2A1A, 18, 80);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xFFD9A8, 0x2B1D12, 0.85));
const overhead = new THREE.DirectionalLight(0xFFE3B8, 1.0);
overhead.position.set(10, 30, 10);
scene.add(overhead);
const warmGlow = new THREE.PointLight(0xFF8C42, 0.7, 36);
warmGlow.position.set(0, 5, 0);
scene.add(warmGlow);

const ROOM = 20;
const WALL_H = 7;

/* ---------- floor (wood planks) ---------- */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM * 2, ROOM * 2),
  new THREE.MeshLambertMaterial({ color: 0x6B4226 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const plankLine = new THREE.MeshLambertMaterial({ color: 0x4A3522 });
for(let i = -ROOM; i <= ROOM; i += 2.5){
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, ROOM * 2), plankLine);
  line.position.set(i, 0.005, 0);
  scene.add(line);
}

/* ---------- walls ---------- */
const wallMat = new THREE.MeshLambertMaterial({ color: 0x4A3522 });
function wall(w, h, d, x, y, z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, y, z);
  scene.add(m);
}
wall(ROOM * 2 + 2, WALL_H, 1, 0, WALL_H / 2, -ROOM);
wall(ROOM * 2 + 2, WALL_H, 1, 0, WALL_H / 2, ROOM);
wall(1, WALL_H, ROOM * 2 + 2, -ROOM, WALL_H / 2, 0);
wall(1, WALL_H, ROOM * 2 + 2, ROOM, WALL_H / 2, 0);

/* pegboard with hanging tool silhouettes on the back wall */
const pegboard = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), new THREE.MeshLambertMaterial({ color: 0x3D2A1A }));
pegboard.position.set(0, 4, -ROOM + 0.52);
scene.add(pegboard);
const toolMat = new THREE.MeshLambertMaterial({ color: 0xF0E4D4 });
[-3.5, -1.2, 1.2, 3.5].forEach((x, i) => {
  const tool = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4 + (i % 2) * 0.4, 0.1), toolMat);
  tool.position.set(x, 4.2, -ROOM + 0.58);
  scene.add(tool);
});

/* ---------- ceiling with skylight strip ---------- */
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM * 2, ROOM * 2),
  new THREE.MeshLambertMaterial({ color: 0x3D2A1A, side: THREE.DoubleSide })
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = WALL_H;
scene.add(ceiling);
const skylight = new THREE.Mesh(new THREE.PlaneGeometry(4, ROOM * 1.6), new THREE.MeshBasicMaterial({ color: 0xFFE3B8 }));
skylight.rotation.x = Math.PI / 2;
skylight.position.y = WALL_H - 0.02;
scene.add(skylight);

const collidables = [];
function benchBase(x, z, w = 3.2, d = 1.6, color = 0x8a5a3c){
  const bench = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, d), new THREE.MeshLambertMaterial({ color }));
  top.position.y = 1.0;
  bench.add(top);
  for(const lx of [-w / 2 + 0.2, w / 2 - 0.2]){
    for(const lz of [-d / 2 + 0.2, d / 2 - 0.2]){
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), new THREE.MeshLambertMaterial({ color: 0x3D2A1A }));
      leg.position.set(lx, 0.5, lz);
      bench.add(leg);
    }
  }
  bench.position.set(x, 0, z);
  scene.add(bench);
  collidables.push({ x, z, radius: Math.max(w, d) / 2 + 0.5 });
  return bench;
}

/* ---------- 1. surfboard shaping station ---------- */
const shapeStation = benchBase(-13, -13);
const boardBlank = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.1, 0.1), new THREE.MeshLambertMaterial({ color: 0xFF006E }));
boardBlank.position.set(-13, 1.9, -13.4);
boardBlank.rotation.z = 0.08;
scene.add(boardBlank);
const finRackPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), new THREE.MeshLambertMaterial({ color: 0x3D2A1A }));
finRackPost.position.set(-13 + 1.5, 1.2, -13);
scene.add(finRackPost);
const shavings = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.2, 8), new THREE.MeshLambertMaterial({ color: 0xE8DFC8 }));
shavings.position.set(-13 + 0.9, 0.1, -12.4);
scene.add(shavings);

/* ---------- 2. coding station ---------- */
const codeStation = benchBase(13, -13);
const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.06), new THREE.MeshBasicMaterial({ color: 0x3A86FF }));
monitor.position.set(13, 1.65, -13.3);
scene.add(monitor);
const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), new THREE.MeshLambertMaterial({ color: 0x2B1D12 }));
monitorStand.position.set(13, 1.22, -13.3);
scene.add(monitorStand);
const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.22), new THREE.MeshLambertMaterial({ color: 0xF0E4D4 }));
keyboard.position.set(13, 1.08, -12.9);
scene.add(keyboard);
const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 10), new THREE.MeshLambertMaterial({ color: 0x3A2A1A }));
chair.position.set(13, 0.55, -11.7);
scene.add(chair);
const chairPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x2B1D12 }));
chairPost.position.set(13, 0.3, -11.7);
scene.add(chairPost);

/* ---------- 3. electrical engineering station ---------- */
const eeStation = benchBase(-13, 13);
const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.6), new THREE.MeshLambertMaterial({ color: 0x1F8A5F }));
pcb.position.set(-13, 1.09, 13);
scene.add(pcb);
const solderIron = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), new THREE.MeshLambertMaterial({ color: 0x1A1A2E }));
solderIron.rotation.z = Math.PI / 3;
solderIron.position.set(-12.4, 1.22, 13.3);
scene.add(solderIron);
const solderTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 6), new THREE.MeshBasicMaterial({ color: 0xFFBE0B }));
solderTip.rotation.z = Math.PI / 3;
solderTip.position.set(-12.14, 1.0, 13.44);
scene.add(solderTip);
const wireCoil = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), new THREE.MeshLambertMaterial({ color: 0x3A86FF }));
wireCoil.rotation.x = Math.PI / 2;
wireCoil.position.set(-13.7, 1.12, 12.7);
scene.add(wireCoil);

/* ---------- 4. art station ---------- */
const easelGroup = new THREE.Group();
const easelMat = new THREE.MeshLambertMaterial({ color: 0x8a5a3c });
for(const side of [-1, 1]){
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), easelMat);
  leg.position.set(side * 0.5, 1.0, 0.3 * side);
  leg.rotation.z = side * 0.18;
  easelGroup.add(leg);
}
const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), easelMat);
backLeg.position.set(0, 1.0, -0.5);
backLeg.rotation.x = -0.2;
easelGroup.add(backLeg);
const canvasFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.06), new THREE.MeshLambertMaterial({ color: 0xF0E4D4 }));
canvasFrame.position.set(0, 1.5, 0.15);
canvasFrame.rotation.x = -0.1;
easelGroup.add(canvasFrame);
const paintSplotch = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), new THREE.MeshBasicMaterial({ color: 0xFF006E }));
paintSplotch.position.set(0.1, 1.55, 0.19);
paintSplotch.rotation.x = -0.1;
easelGroup.add(paintSplotch);
easelGroup.position.set(13, 0, 13);
scene.add(easelGroup);
collidables.push({ x: 13, z: 13, radius: 1.3 });
const palette = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), new THREE.MeshLambertMaterial({ color: 0xE8DFC8 }));
palette.rotation.x = -Math.PI / 2;
palette.position.set(13 - 1.4, 1.02, 13.6);
scene.add(palette);
benchBase(13, 13.6, 2.2, 1.2);

/* ---------- central workbench island (the main collidable landmark) ---------- */
const island = benchBase(0, 0, 4.4, 2.2, 0x6b4a2a);
const vice = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: 0x1A1A2E }));
vice.position.set(0, 1.22, 0.6);
scene.add(vice);

/* ---------- controls ---------- */
const controls = createControls({
  canvas,
  zoneEl: document.getElementById("joystick-zone"),
  nubEl: document.getElementById("joystick-nub")
});
const WALL_MARGIN = ROOM - 2;

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
    const flicker = 1 + Math.sin(t * 0.005) * 0.1;
    warmGlow.intensity = 0.7 * flicker;
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
  const started = HOBBIES.filter(h => getElixirMilestones(h.id).length >= 1).length;
  document.getElementById("exploreStat").innerHTML =
    `${all.toLocaleString()} pts<small>${started}/${HOBBIES.length} hobbies started</small>`;
}catch(e){ /* app.js state not available — stat chip just stays blank */ }
