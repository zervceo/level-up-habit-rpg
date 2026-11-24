/* =========================================================================
   explore-interact.js — the "click things in 3D" layer shared by every
   sector scene. A scene registers Blender-authored groups (HS_* nodes) as
   hotspots; this module gives them hover highlight, floating quest-style
   markers, click / press-E activation, and a side panel whose contents
   (live data + real actions that write to the same localStorage the 2D
   pages use) are supplied by the scene.
   ========================================================================= */
import { THREE } from "./explore-shared.js";

const MAIN_2D_PAGES = ["entity-arena.html", "entrepreneur.html", "education.html", "elixir.html"];

const CSS = `
.ix-tip{position:fixed;z-index:7;pointer-events:none;padding:6px 10px;border-radius:14px;font:600 11px 'Poppins',sans-serif;
  background:rgba(26,26,46,.88);color:var(--zerv-text);border:2px solid var(--zerv-border);white-space:nowrap;display:none;transform:translate(14px,14px)}
.ix-prompt{position:absolute;left:50%;bottom:max(26px,env(safe-area-inset-bottom));transform:translateX(-50%);pointer-events:none!important;
  padding:8px 16px;border-radius:20px;font:700 12px 'Poppins',sans-serif;background:rgba(26,26,46,.85);color:var(--zerv-heading);
  border:2px solid var(--zerv-border);display:none;white-space:nowrap}
.ix-prompt kbd{display:inline-block;margin-right:8px;padding:1px 7px;border-radius:6px;background:var(--btn-primary-bg);color:var(--btn-primary-text);font:700 11px 'Bungee',sans-serif}
.ix-cross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(255,255,255,.55);pointer-events:none!important;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.ix-panel{position:absolute;right:14px;top:74px;width:min(372px,calc(100% - 28px));max-height:calc(100% - 150px);overflow:auto;
  background:rgba(20,20,38,.93);color:var(--zerv-text);border:2px solid var(--zerv-border);border-radius:18px;padding:14px 16px 16px;
  font:400 13px/1.45 'Poppins',sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5);backdrop-filter:blur(8px);display:none}
.ix-panel.open{display:block;animation:ixIn .16s ease-out}
@keyframes ixIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ix-x{position:absolute;right:10px;top:8px;width:30px;height:30px;border-radius:50%;border:2px solid var(--zerv-border);background:transparent;color:var(--zerv-text);font-size:14px;cursor:pointer}
.ix-head{display:flex;gap:10px;align-items:center;margin:0 34px 10px 0}
.ix-ico{font-size:28px;line-height:1}
.ix-title{font:400 15px 'Bungee',sans-serif;color:var(--zerv-heading);line-height:1.15}
.ix-sub{font-size:11px;opacity:.75}
.ix-sec{margin:12px 0 6px;font:700 10px 'Poppins',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--zerv-heading);opacity:.9}
.ix-muted{opacity:.72;font-size:12px}
.ix-row{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.09)}
.ix-row:last-child{border-bottom:0}
.ix-row .ix-lbl{flex:1;min-width:0}
.ix-row .ix-lbl small{display:block;opacity:.7;font-size:11px}
.ix-row.done .ix-lbl{opacity:.55;text-decoration:line-through}
.ix-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.ix-btn{cursor:pointer;border-radius:14px;padding:7px 12px;font:700 11px 'Poppins',sans-serif;border:2px solid var(--btn-primary-border);
  background:var(--btn-primary-bg);color:var(--btn-primary-text)}
.ix-btn:hover{background:var(--btn-primary-hover-bg);color:var(--btn-primary-hover-text)}
.ix-btn.alt{background:transparent;color:var(--zerv-text);border-color:var(--zerv-border)}
.ix-btn.on{background:var(--btn-secondary-bg);color:var(--btn-secondary-text);border-color:var(--btn-secondary-border)}
.ix-btn[disabled]{opacity:.45;cursor:not-allowed}
.ix-bar{height:9px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden;margin:6px 0 3px}
.ix-bar>i{display:block;height:100%;background:var(--btn-primary-bg);border-radius:6px}
.ix-big{font:400 26px 'Bungee',sans-serif;color:var(--zerv-heading);line-height:1.1}
.ix-in{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:12px;border:2px solid var(--input-border);background:var(--input-bg);color:var(--input-text);font:400 13px 'Poppins',sans-serif}
.ix-lock{margin:8px 0;padding:7px 10px;border-radius:12px;background:rgba(255,77,77,.16);border:1px solid rgba(255,77,77,.5);font-size:12px}
.ix-learn{margin-top:14px;border-top:1px solid rgba(255,255,255,.14);padding-top:8px}
.ix-learn>.ix-sec{margin-top:4px}
.ix-learn details{border-bottom:1px solid rgba(255,255,255,.09);padding:4px 0}
.ix-learn summary{cursor:pointer;font:600 12px 'Poppins',sans-serif;padding:5px 0;color:var(--zerv-text);list-style:none}
.ix-learn summary::-webkit-details-marker{display:none}
.ix-learn summary::before{content:'\\25B8';display:inline-block;width:14px;color:var(--zerv-heading)}
.ix-learn details[open]>summary::before{content:'\\25BE'}
.ix-learn details p{margin:2px 0 8px 14px;font-size:12px;opacity:.88;line-height:1.5}
.ix-link{display:inline-block;margin-top:12px;font:700 11px 'Poppins',sans-serif;color:var(--zerv-link);text-decoration:none}
.ix-link:hover{color:var(--zerv-link-hover)}
`;

export function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  for(const k in (attrs || {})){
    const v = attrs[k];
    if(v === false || v == null) continue;
    if(k === "class") el.className = v;
    else if(k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if(k === "html") el.innerHTML = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for(const kid of kids.flat()){
    if(kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

/* ---------- small building blocks scenes use inside panel bodies ---------- */
export const ui = {
  sec: (t) => h("div", { class: "ix-sec" }, t),
  muted: (t) => h("div", { class: "ix-muted" }, t),
  big: (t) => h("div", { class: "ix-big" }, t),
  bar: (pct, label) => h("div", null,
    h("div", { class: "ix-bar" }, h("i", { style: `width:${Math.max(0, Math.min(100, pct))}%` })),
    label ? h("div", { class: "ix-muted" }, label) : null),
  btn: (text, onClick, o = {}) => h("button", { class: "ix-btn" + (o.alt ? " alt" : "") + (o.on ? " on" : ""), disabled: !!o.disabled, onclick: onClick }, text),
  btns: (...b) => h("div", { class: "ix-btns" }, b),
  row: (label, sub, right, done) => h("div", { class: "ix-row" + (done ? " done" : "") },
    h("div", { class: "ix-lbl" }, label, sub ? h("small", null, sub) : null), right || null),
  learn: (cards, openSet) => h("div", { class: "ix-learn" },
    h("div", { class: "ix-sec" }, "📚 Learn"),
    cards.map((c) => {
      const d = h("details", { open: openSet ? openSet.has(c.t) : false },
        h("summary", null, c.t), h("p", null, c.b));
      d.addEventListener("toggle", () => { if(openSet){ d.open ? openSet.add(c.t) : openSet.delete(c.t); } });
      return d;
    })),
  lock: () => h("div", { class: "ix-lock" }, "🔒 Today is sealed (locked in the Practice Log) — it's read-only until tomorrow."),
  link2D: (href, label) => h("a", { class: "ix-link", href, onclick: () => {
    if(MAIN_2D_PAGES.includes(href)){ try{ sessionStorage.setItem("gameoflife:prefer2D", "1"); }catch(e){} }
  } }, label)
};

/* ---------- data helpers that mirror what the 2D pages do ---------- */
export function todayLocked(){
  try{ return !!getDay(todayStr()).locked; }catch(e){ return false; }
}
export function afterAction(){
  try{ checkAndUnlockAchievements(); }catch(e){}
}
export function pop(text, positive){ try{ popupAt(text, positive); }catch(e){} }
export function toast(msg){ try{ showToast(msg); }catch(e){} }

export function rankCard(){
  const all = allTimeScore();
  const { cur, next } = rankInfoForScore(all);
  const pct = next ? ((all - cur.score) / (next.score - cur.score)) * 100 : 100;
  return h("div", null,
    ui.big(`${all.toLocaleString()} pts`),
    h("div", null, `${cur.boardIcon} ${cur.rank} · ${cur.board}`),
    ui.bar(pct, next ? `${(next.score - all).toLocaleString()} pts to ${next.rank}` : "Top rank reached — ZERV Legend"),
    ui.muted(`${cur.gearIcon} Gear: ${cur.gear}`));
}

/* Weekly-goal row: identical storage + scoring to the 2D page's checkbox. */
export function weeklyGoalRow(goalId, api){
  const g = WEEKLY_GOALS.find(x => x.id === goalId);
  const wk = weekStartOf(todayStr());
  const w = getWeek(wk);
  const done = !!w[g.id];
  return ui.row(`${g.icon} ${g.name}`, `+${g.points} · week of ${wk}`,
    ui.btn(done ? "✓ Done" : "Mark done", () => {
      w[g.id] = !w[g.id];
      saveWeek(wk);
      if(w[g.id]){ toast(`${g.icon} ${g.name} complete! +${g.points}`); pop("+" + g.points, true); }
      afterAction();
      api.changed();
    }, { on: done }));
}

/* ---------------------------------------------------------------------- */
export function createInteraction({ scene, camera, canvas, uiRoot, statFn, onChange, reachDefault = 16 }){
  if(!document.getElementById("ix-css")){
    const s = document.createElement("style");
    s.id = "ix-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tip = h("div", { class: "ix-tip" });
  const prompt = h("div", { class: "ix-prompt" });
  const cross = h("div", { class: "ix-cross" });
  const body = h("div", { class: "ix-body" });
  const head = { ico: h("div", { class: "ix-ico" }), title: h("div", { class: "ix-title" }), sub: h("div", { class: "ix-sub" }) };
  const panel = h("div", { class: "ix-panel", role: "dialog" },
    h("button", { class: "ix-x", "aria-label": "Close", onclick: () => close() }, "✕"),
    h("div", { class: "ix-head" }, head.ico, h("div", null, head.title, head.sub)),
    body);
  document.body.appendChild(tip);
  uiRoot.append(prompt, cross, panel);

  const spots = [];                 // { def, group, meshes, marker, top }
  const byObject = new Map();       // group -> spot
  let active = null, hovered = null, centered = null;
  let pointer = null, dirty = true, lastCamKey = "";
  const ray = new THREE.Raycaster();
  const api = { changed, toast, pop };

  /* --- marker sprites --- */
  const COLORS = { todo: "#FFBE0B", done: "#00C853", info: "#7FB6FF" };
  function markerTexture(icon, status){
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    x.beginPath(); x.arc(64, 64, 58, 0, Math.PI * 2);
    x.fillStyle = "rgba(20,20,38,.92)"; x.fill();
    x.lineWidth = 9; x.strokeStyle = COLORS[status] || COLORS.info; x.stroke();
    x.font = "58px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(status === "done" ? "✅" : icon, 64, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function paintMarker(s){
    const status = s.def.status ? s.def.status() : "info";
    if(s.lastStatus === status) return;
    s.lastStatus = status;
    if(s.marker.material.map) s.marker.material.map.dispose();
    s.marker.material.map = markerTexture(s.def.icon, status);
    s.marker.material.needsUpdate = true;
  }

  function register(group, def){
    if(!group) { console.warn("hotspot missing in model:", def.title); return null; }
    const meshes = [];
    group.traverse((o) => {
      if(o.isMesh){
        o.material = o.material.clone();
        o.userData.ixBase = o.material.emissive ? { c: o.material.emissive.clone(), i: o.material.emissiveIntensity } : null;
        meshes.push(o);
      }
    });
    const box = new THREE.Box3().setFromObject(group);
    const c = box.getCenter(new THREE.Vector3());
    const top = Math.min(box.max.y + 0.7, def.markerMax || 5.2);
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false, fog: false }));
    marker.raycast = () => {};
    marker.renderOrder = 20;
    marker.position.set(c.x, top, c.z);
    scene.add(marker);
    const s = { def, group, meshes, marker, baseY: top, lastStatus: null, reach: def.reach || reachDefault };
    spots.push(s); byObject.set(group, s);
    paintMarker(s);
    return s;
  }

  function spotOf(obj){
    for(let o = obj; o; o = o.parent){ if(byObject.has(o)) return byObject.get(o); }
    return null;
  }
  function pick(ndcX, ndcY, maxDist){
    ray.setFromCamera({ x: ndcX, y: ndcY }, camera);
    ray.far = 60;
    const hits = ray.intersectObjects(scene.children, true);
    for(const hit of hits){
      const mat = hit.object.material;
      if(hit.object.isSprite || hit.object.isPoints || (mat && mat.depthWrite === false)) continue;   // light shafts, dust, glows aren't solid
      const s = spotOf(hit.object);
      if(s && hit.distance <= Math.min(maxDist, s.reach)) return s;
      return null;                 // something solid is in front
    }
    return null;
  }

  function tint(s, mode){
    for(const m of s.meshes){
      const b = m.userData.ixBase;
      if(!b || !m.material.emissive) continue;
      if(mode){ m.material.emissive.set(0xFFD36B); m.material.emissiveIntensity = mode === "hover" ? 0.55 : 0.32; }
      else { m.material.emissive.copy(b.c); m.material.emissiveIntensity = b.i; }
    }
  }

  /* --- panel --- */
  function renderPanel(){
    if(!active) return;
    const d = active.def;
    head.ico.textContent = d.icon;
    head.title.textContent = typeof d.title === "function" ? d.title() : d.title;
    head.sub.textContent = d.sub ? (typeof d.sub === "function" ? d.sub() : d.sub) : "";
    body.replaceChildren();
    d.render(body, api);
    if(d.learn && d.learn.length){
      active.learnOpen = active.learnOpen || new Set();
      body.append(ui.learn(d.learn, active.learnOpen));
    }
    if(d.link) body.append(ui.link2D(d.link.href, d.link.label));
  }
  function open(s){
    if(active && active !== s) tint(active, null);
    active = s;
    tint(s, "active");
    panel.classList.add("open");
    renderPanel();
    panel.scrollTop = 0;
  }
  function close(){
    if(active) tint(active, hovered === active ? "hover" : null);
    active = null;
    panel.classList.remove("open");
  }
  function changed(){
    for(const s of spots) paintMarker(s);
    if(statFn){
      try{ document.getElementById("exploreStat").innerHTML = statFn(); }catch(e){}
    }
    renderPanel();
    if(onChange){ try{ onChange(); }catch(e){ console.error(e); } }
  }

  /* --- input --- */
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener("pointerup", (e) => {
    if(!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const quick = performance.now() - down.t < 600;
    down = null;
    if(e.button !== 0 || moved > 6 || !quick) return;
    const r = canvas.getBoundingClientRect();
    const s = pick(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1, 30);
    if(s) open(s); else if(active) close();
  });
  canvas.addEventListener("pointermove", (e) => { pointer = { x: e.clientX, y: e.clientY }; dirty = true; });
  canvas.addEventListener("pointerleave", () => { pointer = null; dirty = true; });
  window.addEventListener("keydown", (e) => {
    if(e.target && e.target.matches && e.target.matches("input,textarea,select")) return;
    if(e.key === "Escape") close();
    if((e.key === "e" || e.key === "E" || e.key === "Enter") && centered) open(centered);
  });

  function setHover(s, x, y){
    if(hovered !== s){
      if(hovered && hovered !== active) tint(hovered, null);
      hovered = s;
      if(s && s !== active) tint(s, "hover");
      canvas.style.cursor = s ? "pointer" : "";
    }
    if(s && pointer){
      tip.style.display = "block";
      tip.style.left = x + "px"; tip.style.top = y + "px";
      const t = typeof s.def.title === "function" ? s.def.title() : s.def.title;
      tip.textContent = `${s.def.icon} ${t} — click`;
    } else tip.style.display = "none";
  }

  const _p = new THREE.Vector3();
  function update(t){
    const key = camera.position.x.toFixed(2) + camera.position.z.toFixed(2) + camera.rotation.y.toFixed(3) + camera.rotation.x.toFixed(3);
    if(key !== lastCamKey){ lastCamKey = key; dirty = true; }
    if(dirty){
      dirty = false;
      if(pointer){
        const r = canvas.getBoundingClientRect();
        setHover(pick(((pointer.x - r.left) / r.width) * 2 - 1, -((pointer.y - r.top) / r.height) * 2 + 1, 30), pointer.x, pointer.y);
      } else setHover(null);
      const c = pick(0, 0, 9);
      if(c !== centered){
        centered = c;
        if(c){
          const tt = typeof c.def.title === "function" ? c.def.title() : c.def.title;
          prompt.replaceChildren(h("kbd", null, "E"), `${c.def.icon} ${tt}`);
          prompt.style.display = "block";
        } else prompt.style.display = "none";
      }
    }
    for(let i = 0; i < spots.length; i++){
      const s = spots[i];
      const d = _p.copy(s.marker.position).distanceTo(camera.position);
      s.marker.visible = d < 30;
      if(!s.marker.visible) continue;
      const sc = Math.max(0.7, Math.min(2.4, 0.5 + d * 0.05));
      s.marker.scale.set(sc, sc, 1);
      s.marker.position.y = s.baseY + (reduced ? 0 : Math.sin(t * 0.003 + i) * 0.12);
    }
  }

  return { register, update, changed, open, close, spots, api, pick };
}
