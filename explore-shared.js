/* =========================================================================
   explore-shared.js — reusable pieces for every sector's 3D "Explore"
   scene (Beach, Vitruvian Chamber, Wall Street, Workshop): renderer setup,
   a gradient-sky dome, and the joystick/look-drag/keyboard movement
   controls. Each scene's own *-explore.js only has to describe what the
   scene looks like; this file is what makes walking around it work the
   same way everywhere.
   ========================================================================= */
import * as THREE from "./vendor/three.module.min.js";

export function createRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}

export function createCamera(){
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.rotation.order = "YXZ";
  return camera;
}

export function hookResize(camera, renderer){
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* A vertical-gradient sky painted onto a small canvas, mapped onto the
   inside of a big sphere — cheap and theme-colorable per sector. */
export function createSkyDome(scene, stops, fogColor, fogNear = 70, fogFar = 260){
  const c = document.createElement("canvas");
  c.width = 2; c.height = 256;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  for(const [offset, color] of stops) grad.addColorStop(offset, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(300, 24, 16),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })
  ));
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
}

/* Touch-joystick (mouse-draggable too) + drag-anywhere-else-to-look +
   WASD/arrow-key fallback. Returns { state, getMove() } — state.yaw/pitch
   update live as the user drags; getMove() returns the current {x,z}
   movement intent from whichever input is active. */
export function createControls({ canvas, zoneEl, nubEl }){
  const state = { yaw: 0, pitch: -0.05, moveX: 0, moveZ: 0 };
  const keys = {};

  let joyActive = false, joyId = null, joyCenter = { x: 0, y: 0 };
  function joyStart(id, x, y){
    joyActive = true; joyId = id;
    const r = zoneEl.getBoundingClientRect();
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
    nubEl.style.transform = `translate(${dx}px, ${dy}px)`;
    state.moveX = dx / max;
    state.moveZ = dy / max;
  }
  function joyEnd(){
    joyActive = false; joyId = null;
    nubEl.style.transform = "translate(0,0)";
    state.moveX = 0; state.moveZ = 0;
  }
  zoneEl.addEventListener("pointerdown", (e) => { zoneEl.setPointerCapture(e.pointerId); joyStart(e.pointerId, e.clientX, e.clientY); });
  zoneEl.addEventListener("pointermove", (e) => { if(e.pointerId === joyId) joyMove(e.clientX, e.clientY); });
  zoneEl.addEventListener("pointerup", joyEnd);
  zoneEl.addEventListener("pointercancel", joyEnd);

  let lookActive = false, lookId = null, lastX = 0, lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    lookActive = true; lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if(!lookActive || e.pointerId !== lookId) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    state.yaw -= dx * 0.004;
    state.pitch = Math.max(-0.5, Math.min(0.5, state.pitch - dy * 0.003));
  });
  function endLook(e){ if(e.pointerId === lookId) lookActive = false; }
  canvas.addEventListener("pointerup", endLook);
  canvas.addEventListener("pointercancel", endLook);

  window.addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

  function getMove(){
    if(joyActive) return { x: state.moveX, z: state.moveZ };
    let kx = 0, kz = 0;
    if(keys["a"] || keys["arrowleft"]) kx -= 1;
    if(keys["d"] || keys["arrowright"]) kx += 1;
    if(keys["w"] || keys["arrowup"]) kz -= 1;
    if(keys["s"] || keys["arrowdown"]) kz += 1;
    return { x: kx, z: kz };
  }

  return { state, getMove };
}

/* Moves the camera each frame using the controls' current yaw/move intent,
   clamping to a rectangular bound and pushing out of any circular
   collidable ({x, z, radius}) in the list — a soft "don't walk through
   the building" check, not real physics. */
const _euler = new THREE.Euler();
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
export function stepCamera(camera, controls, dt, opts){
  const { speed = 9, eyeHeight = 1.7, boundX = 58, boundZMin = -56, boundZMax = 58, collidables = [] } = opts || {};
  const move = controls.getMove();
  if(move.x || move.z){
    _euler.set(0, controls.state.yaw, 0);
    _fwd.set(0, 0, -1).applyEuler(_euler);
    _right.set(1, 0, 0).applyEuler(_euler);
    const next = camera.position.clone();
    next.addScaledVector(_fwd, -move.z * speed * dt);
    next.addScaledVector(_right, move.x * speed * dt);
    next.x = Math.max(-boundX, Math.min(boundX, next.x));
    next.z = Math.max(boundZMin, Math.min(boundZMax, next.z));
    for(const c of collidables){
      const d = Math.hypot(next.x - c.x, next.z - c.z);
      if(d < c.radius){
        const ang = Math.atan2(next.z - c.z, next.x - c.x);
        next.x = c.x + Math.cos(ang) * c.radius;
        next.z = c.z + Math.sin(ang) * c.radius;
      }
    }
    camera.position.x = next.x;
    camera.position.z = next.z;
  }
  camera.position.y = eyeHeight;
  camera.rotation.y = controls.state.yaw;
  camera.rotation.x = controls.state.pitch;
}

/* Hides #loadingNotice and shows #explore-ui — call once the scene is
   built and ready for its first frame. */
export function revealUI(){
  const loading = document.getElementById("loadingNotice");
  const ui = document.getElementById("explore-ui");
  if(loading) loading.style.display = "none";
  if(ui) ui.style.display = "block";
}

export { THREE };
