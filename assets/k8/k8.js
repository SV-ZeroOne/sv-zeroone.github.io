import * as THREE from 'three';
import { OrbitControls } from '../lib/three-r180/OrbitControls.js';
import { RoomEnvironment } from '../lib/three-r180/RoomEnvironment.js';
import { buildK8 } from './k8-models.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search), cardMode = params.has('card');
const viewport = $('viewport'), reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// preserveDrawingBuffer keeps "save image" and headless captures working.
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.domElement.setAttribute('aria-hidden', 'true'); viewport.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(room, .04).texture; scene.environmentIntensity = .7; room.dispose(); pmrem.dispose();
// Lower ambient than before: the silver has to read as metal, not paper.
scene.add(new THREE.HemisphereLight(0xeaf0ff, 0x24272a, 1.15));
function light(color, intensity, position) { const l = new THREE.DirectionalLight(color, intensity); l.position.set(...position); scene.add(l); return l; }
const key = light(0xfff3e2, 1.75, [7, 21, 9]); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
// Nearly overhead, with a wide blur: the ground plane is only visible where it
// is shadowed, so a long soft shadow reads as a smudge floating behind the box.
Object.assign(key.shadow.camera, { left: -16, right: 16, top: 30, bottom: -8, near: .1, far: 80 }); key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.shadow.radius = 6;
light(0xd6e4ff, 1.3, [-10, 8, 6]); light(0xf0f4ff, 2.0, [4, 10, -12]);
// Bounce light from under the model so the fan tray and the ports stop
// disappearing into the lid's shadow.
light(0xe8eeff, .5, [-2, -9, 7]);
// True isometric orthographic camera. Corner 2 looks at the rear and left
// faces, so the Ethernet ports and patch lead are visible before any turn.
const ISO_POLAR = Math.acos(1 / Math.sqrt(3)), QUARTER = Math.PI / 2, CAMERA_DISTANCE = 60, DEFAULT_CORNER = Number(params.get('corner') ?? 2);
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 160);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; controls.enableDamping = false; controls.enableZoom = false;
controls.minPolarAngle = .1; controls.maxPolarAngle = Math.PI * .66; controls.minZoom = .02; controls.maxZoom = 6;
controls.touches.ONE = THREE.TOUCH.ROTATE; controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
renderer.domElement.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') controls.enableZoom = true; });
for (const ev of ['pointerup', 'pointercancel']) renderer.domElement.addEventListener(ev, () => { controls.enableZoom = false; });

const model = buildK8(); scene.add(model.root);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
// Manual-style explosion axis: a dashed line through the stack that fades in
// with the separation, so each layer reads as belonging to one assembly.
const axisMat = new THREE.LineDashedMaterial({ color: 0xb5e853, dashSize: .45, gapSize: .35, transparent: true, opacity: 0 });
const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -.05, 0), new THREE.Vector3(0, 18.4, 0)]);
const axis = new THREE.Line(axisGeo, axisMat); axis.computeLineDistances(); axis.visible = false; scene.add(axis);

// Part copy. [tag, title, copy, spec label, spec value, note]
const parts = {
  lid: ['01 · ENCLOSURE', 'Top lid', 'The silver plastic lid unclips without tools. Underneath it is the fan carrier, and four screws later you are at the memory and storage.', 'CASE', '123 × 112 × 43 mm', 'All-plastic shell on the original K8. The K8 Plus moved to a CNC aluminium mid-frame and a larger 132 × 125 × 58 mm case.'],
  fan: ['02 · COOLING', 'Top extractor fan', 'A small axial fan pulls warm air up off the memory and SSDs and out through the side vents. It is the quieter of the two fans.', 'ROLE', 'RAM + SSD airflow', 'Keep the slots clear: a tall M.2 heatsink can foul this tray.'],
  ram1: ['03 · MEMORY', 'DDR5 SO-DIMM (slot 1)', 'Two SO-DIMM sockets sit side by side on top of the board. Ludus wants at least 32 GB; every VM you add is RAM you need, so this is the upgrade that matters most.', 'MY KIT', '2 × 48 GB = 96 GB', 'GMKtec quoted 64 GB; the 8845HS runs 2 × 48 GB happily, and the Ludus authors run their K8 the same way.'],
  ram2: ['03 · MEMORY', 'DDR5 SO-DIMM (slot 2)', 'The second of the two side-by-side sockets. Fit a matched pair so the modules run in dual channel: Windows templates build noticeably faster with the bandwidth.', 'SPEED', 'DDR5-5600', 'A 2 × 32 GB kit is the budget sweet spot; 2 × 48 GB is the ceiling.'],
  ssd1: ['04 · STORAGE', 'M.2 2280 NVMe (slot 1)', 'PCIe 4.0 ×4. Templates and VM disks live here, so a fast drive is what makes a range feel snappy. Ludus asks for 200 GB minimum.', 'MINIMUM', '200 GB, fast NVMe', 'Each Windows template provisions a large virtual disk. 1–2 TB keeps you from pruning templates.'],
  ssd2: ['04 · STORAGE', 'M.2 2280 NVMe (slot 2)', 'The second slot takes another Gen4 drive. The Ludus team runs two 2 TB drives in RAID 0 in theirs; a second 1 TB is plenty for most home ranges.', 'MAXIMUM', '2 × 4 TB', 'Low-profile heatsinks only: the fan tray sits directly above.'],
  wifi: ['05 · WIRELESS', 'M.2 2230 Wi-Fi 6E + BT 5.2', 'Handy for a desktop, irrelevant for a range host. It sits at the front of the drive bay, under the first NVMe drive, with its antenna leads taped to the shell. Ludus refuses to install over Wi-Fi: the Proxmox bridge needs a wired interface.', 'LUDUS', 'Not used', 'Some people swap this slot for a third small SSD. Leave it alone unless you enjoy adapters.'],
  board: ['06 · MAINBOARD', 'Ryzen 7 8845HS board', 'Eight Zen 4 cores, sixteen threads, soldered to the underside. Ludus needs a Passmark score above 6,000; this chip scores about 29,000.', 'PASSMARK', '≈ 29,000', 'Hardware virtualisation (AMD-V / SVM) must be switched on in the BIOS before Proxmox will run VMs.'],
  nic: ['07 · NETWORK', 'Dual 2.5 GbE', 'Two 2.5 GbE ports on the rear. Ludus assumes one plain wired interface and builds its own virtual networks behind it, so one cable is all you need.', 'REQUIRED', 'Wired, not Wi-Fi', 'Realtek RTL8125 on the original K8; the K8 Plus swapped in Intel I226V. Either is fine for Debian.'],
  cooler: ['08 · COOLING', 'Heat-pipe blower', 'A centrifugal blower under the board pulls air in through the base and pushes it across the CPU heat pipes and out of the rear fin stack.', 'TDP', '35–54 W (configurable)', 'Set the BIOS power mode to the balanced profile; the range does not benefit from the hot setting.'],
  bottom: ['09 · ENCLOSURE', 'Bottom plate', 'Rubber feet, intake vents for the blower and the VESA mount points, so the whole range can hang off the back of a monitor or sit in a cupboard.', 'MOUNT', 'VESA 75 / 100', 'Give the base some air. It is the only intake the CPU cooler has.'],
  shell: ['10 · ENCLOSURE', 'Mid shell and side vents', 'The silver body, with one large vent grille per side and real cut-outs for the rear ports and the front I/O. On the original K8 this is painted plastic.', 'FRONT I/O', 'USB4 · 2 × USB-A · audio', 'One USB4 port on the K8. The K8 Plus has two, plus OCuLink for an external GPU.'],
};
const labelDefs = [
  ['lid', 'Top lid', 'left'], ['fan', 'Extractor fan', 'left'], ['shell', 'Shell + side vents', 'left'], ['ram2', 'DDR5 SO-DIMM ×2 · 96 GB', 'left'],
  ['ssd1', 'M.2 NVMe ×2 · PCIe 4.0', 'right'], ['wifi', 'Wi-Fi 6E · unused', 'left'], ['board', 'Ryzen 7 8845HS board', 'right'],
  ['nic', 'Dual 2.5 GbE · wired uplink', 'right'], ['cooler', 'Heat-pipe blower', 'right'], ['bottom', 'Bottom plate · VESA', 'left'],
];
const labelLayer = $('labels'), leaders = $('leaders');
const labelButtons = Object.fromEntries(labelDefs.map(([id, text]) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'callout'; b.textContent = text; b.dataset.part = id;
  b.addEventListener('click', () => select(id)); labelLayer.appendChild(b); return [id, b];
}));
const leaderPaths = labelDefs.map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); leaders.appendChild(p); return p; });

let separation = 0, destination = 0, scheduled = 0, visible = true, lastTime = 0, autoFraming = false, turn = 0, goalZoom = 1, selected = null, essentials = false, ghosted = false, pulseStart = 0, pulseLength = 0;
const goalCamera = new THREE.Vector3(), goalTarget = new THREE.Vector3();
const isoDirection = () => new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, ISO_POLAR, Math.PI / 4 + (DEFAULT_CORNER + turn) * QUARTER));
function requestRender() { if (!scheduled && visible && !document.hidden) scheduled = requestAnimationFrame(render); }

// Material states: normal, dimmed (essentials mode), highlighted (essential or selected).
const variants = new Map();
function variant(material, kind) {
  const key = material.uuid + kind; if (variants.has(key)) return variants.get(key);
  const v = material.clone();
  if (kind === 'dim') { v.transparent = true; v.opacity = .16; }
  else if (kind === 'ghost') { v.transparent = true; v.opacity = .3; v.depthWrite = false; }
  else { v.emissive = new THREE.Color(kind === 'selected' ? 0x8fbf20 : 0x5a8a10); v.emissiveIntensity = kind === 'selected' ? .34 : .3; }
  variants.set(key, v); return v;
}
const meshes = [];
model.root.traverse(o => {
  if (!o.isMesh) return;
  o.userData.base = o.material; let p = o, part = null, essential = false;
  while (p) { if (p.userData.part && !part) part = p.userData.part; if (p.userData.essential) essential = true; p = p.parent; }
  o.userData.partId = part; o.userData.essential = essential; meshes.push(o);
});
const selectedVariants = [];
function applyMaterials() {
  selectedVariants.length = 0;
  for (const o of meshes) {
    const mat = o.userData.base, isSelected = selected && o.userData.partId === selected;
    if (isSelected) { o.material = variant(mat, 'selected'); if (!selectedVariants.includes(o.material)) selectedVariants.push(o.material); }
    else if (essentials) o.material = o.userData.essential ? variant(mat, 'essential') : (mat.transparent ? mat : variant(mat, 'dim'));
    // The shell is hollow: while exploded, ghost it so the board stack reads
    // through the walls instead of hiding behind them.
    else if (ghosted && o.userData.partId === 'shell') o.material = variant(mat, 'ghost');
    else o.material = mat;
  }
  requestRender();
}
function setGhost(want) { if (want === ghosted) return; ghosted = want; applyMaterials(); }
function select(id) {
  selected = id; const p = parts[id];
  pulseStart = performance.now(); pulseLength = reducedMotion.matches ? 0 : 900;
  ['part-tag', 'part-title', 'part-copy', 'spec-label', 'spec-value', 'part-note'].forEach((f, i) => { $(f).textContent = p[i]; });
  for (const [pid, b] of Object.entries(labelButtons)) b.setAttribute('aria-pressed', String(pid === id || (id === 'ram1' && pid === 'ram2') || (id === 'ssd2' && pid === 'ssd1')));
  applyMaterials();
}
function overlayInsets() {
  const area = viewport.getBoundingClientRect(), caption = document.querySelector('.model-caption').getBoundingClientRect();
  const metaBottom = Math.max(area.top, ...[...document.querySelectorAll('.scene-meta>span')].map(s => s.getBoundingClientRect()).filter(r => r.height).map(r => r.bottom));
  const top = metaBottom - area.top + 12, bottom = (caption.height ? Math.max(0, area.bottom - caption.top) : 0) + 10;
  // Leave room for the callout columns on the long sides.
  // The social card has no callout columns competing for space, so let the
  // model use the frame.
  return { top, bottom, side: cardMode ? Math.max(16, area.width * .05) : Math.max(16, Math.min(area.width * .3, 230)) };
}
function frame(animate = false) {
  const direction = isoDirection();
  model.explode(destination); model.root.updateMatrixWorld(true);
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize(), up = new THREE.Vector3().crossVectors(direction, right);
  const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = new THREE.Vector3(-Infinity, -Infinity, -Infinity), bb = new THREE.Box3(), pt = new THREE.Vector3(), pr = new THREE.Vector3();
  model.root.traverseVisible(o => {
    if (!o.isMesh) return;
    if (o.isInstancedMesh) { if (!o.boundingBox) o.computeBoundingBox(); bb.copy(o.boundingBox); } else { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.copy(o.geometry.boundingBox); }
    for (let i = 0; i < 8; i++) { pt.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(o.matrixWorld); pr.set(pt.dot(right), pt.dot(up), pt.dot(direction)); min.min(pr); max.max(pr); }
  });
  model.explode(separation);
  const w = viewport.clientWidth || 1, h = viewport.clientHeight || 1, inset = overlayInsets();
  const upp = Math.max((max.x - min.x) / Math.max(1, w - 2 * inset.side), (max.y - min.y) / Math.max(1, h - inset.top - inset.bottom));
  const lift = (inset.bottom - inset.top) / 2 * upp;
  goalTarget.set(0, 0, 0).addScaledVector(right, (min.x + max.x) / 2).addScaledVector(up, (min.y + max.y) / 2 - lift).addScaledVector(direction, (min.z + max.z) / 2);
  goalCamera.copy(goalTarget).addScaledVector(direction, CAMERA_DISTANCE); goalZoom = 2 / (h * upp); autoFraming = animate;
  if (!animate) { camera.position.copy(goalCamera); controls.target.copy(goalTarget); camera.zoom = goalZoom; camera.updateProjectionMatrix(); controls.update(); }
  updateProjectionLabel(); requestRender();
}
let projectionLabel = '';
function updateProjectionLabel() {
  const s = new THREE.Spherical().setFromVector3((autoFraming ? goalCamera : camera.position).clone().sub(autoFraming ? goalTarget : controls.target));
  const off = Math.abs(THREE.MathUtils.euclideanModulo(s.theta - Math.PI / 4 + QUARTER / 2, QUARTER) - QUARTER / 2);
  const label = Math.abs(s.phi - ISO_POLAR) < .004 && off < .004 ? 'ISOMETRIC' : 'FREE ORBIT';
  if (label !== projectionLabel) { projectionLabel = label; $('projection').textContent = label; }
}
function setSeparation(value, instant = false) {
  destination = value / 100; $('separation').value = value; $('separation-value').value = `${value}%`;
  $('explode').textContent = destination > .5 ? 'Reassemble ↙' : 'Explode the K8 ↗';
  $('explosion-hint').textContent = destination > .5 ? 'Select a callout or a part for its role in the range. Drag to orbit; arrow keys step the isometric corners.' : 'Assembled. Rear face shown: dual 2.5 GbE with the wired uplink Ludus insists on.';
  if (instant || reducedMotion.matches) { separation = destination; model.explode(separation); }
  frame(!instant && !reducedMotion.matches); requestRender();
}
const anchor = new THREE.Vector3();
const labelText = Object.fromEntries(labelDefs.map(([id, text]) => [id, text]));
let compactMode = null;
function updateLabels() {
  const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
  // Under 700 px the two callout columns squeeze the model, so swap them for
  // numbered pins; the inspector tag already carries the same number.
  const compact = w < 700;
  if (compact !== compactMode) {
    compactMode = compact;
    for (const [id, b] of Object.entries(labelButtons)) {
      b.textContent = compact ? (parts[id]?.[0] || '').slice(0, 2) : labelText[id];
      b.classList.toggle('pin', compact);
    }
  }
  const alpha = $('labels-toggle').checked ? THREE.MathUtils.clamp((separation - .5) / .3, 0, 1) : 0;
  labelLayer.style.opacity = leaders.style.opacity = alpha; labelLayer.style.pointerEvents = alpha > .5 ? '' : 'none'; if (!alpha) return;
  const columns = { left: [], right: [] };
  labelDefs.forEach(([id, , side], i) => { model.anchor(id, anchor).project(camera); columns[side].push({ i, id, x: (anchor.x + 1) / 2 * w, y: (1 - anchor.y) / 2 * h }); });
  for (const side of ['left', 'right']) {
    const list = columns[side].sort((a, b) => a.y - b.y), gap = 30, top = 44, bottom = h - 64;
    for (let n = 0; n < list.length; n++) list[n].ly = Math.max(list[n].y, n ? list[n - 1].ly + gap : top);
    for (let n = list.length - 1; n >= 0; n--) list[n].ly = Math.min(list[n].ly, n < list.length - 1 ? list[n + 1].ly - gap : bottom);
    for (const item of list) {
      const b = labelButtons[item.id], bw = b.offsetWidth, bh = b.offsetHeight, lx = side === 'left' ? 14 : w - 14 - bw;
      b.style.transform = `translate(${lx}px,${item.ly - bh / 2}px)`;
      const ex = side === 'left' ? lx + bw : lx, kneeX = side === 'left' ? Math.min(item.x, ex + 26) : Math.max(item.x, ex - 26);
      leaderPaths[item.i].setAttribute('d', `M${ex},${item.ly}H${kneeX}L${item.x},${item.y}`);
    }
  }
}
function render(time) {
  scheduled = 0; const delta = Math.min((time - lastTime) / 1000, .05); lastTime = time;
  if (Math.abs(destination - separation) > .001) { separation = reducedMotion.matches ? destination : THREE.MathUtils.damp(separation, destination, 8, delta); model.explode(separation); requestRender(); }
  else if (separation !== destination) { separation = destination; model.explode(separation); }
  setGhost(destination > .02 && !essentials);
  axisMat.opacity = destination > .02 ? Math.min(.55, Math.max(0, separation - .02) * 1.1) : 0;
  axis.visible = axisMat.opacity > .005;
  // One-shot selection pulse: a few cycles on selection, then a steady tint, so
  // the renderer still goes idle when nothing is changing.
  if (pulseLength) {
    const t = performance.now() - pulseStart;
    if (t < pulseLength) {
      const k = .5 + .5 * Math.cos(t / pulseLength * Math.PI * 4);
      for (const v of selectedVariants) v.emissiveIntensity = .2 + .5 * k;
      requestRender();
    } else { pulseLength = 0; for (const v of selectedVariants) v.emissiveIntensity = .34; }
  }
  if (autoFraming) {
    const a = 1 - Math.exp(-8 * delta), now = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)), goal = new THREE.Spherical().setFromVector3(goalCamera.clone().sub(goalTarget));
    const dTheta = THREE.MathUtils.euclideanModulo(goal.theta - now.theta + Math.PI, 2 * Math.PI) - Math.PI;
    now.theta += dTheta * a; now.phi += (goal.phi - now.phi) * a; now.radius += (goal.radius - now.radius) * a;
    controls.target.lerp(goalTarget, a); camera.position.setFromSpherical(now).add(controls.target); camera.zoom += (goalZoom - camera.zoom) * a;
    if (Math.abs(dTheta) < 1e-4 && Math.abs(goal.phi - now.phi) < 1e-4 && controls.target.distanceToSquared(goalTarget) < 1e-6 && Math.abs(goalZoom - camera.zoom) < goalZoom * 1e-4) { camera.position.copy(goalCamera); controls.target.copy(goalTarget); camera.zoom = goalZoom; autoFraming = false; }
    camera.updateProjectionMatrix(); controls.update(); requestRender();
  }
  renderer.render(scene, camera); updateLabels();
}
function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false);
  leaders.setAttribute('viewBox', `0 0 ${w} ${h}`);
  Object.assign(camera, { left: -w / h, right: w / h, top: 1, bottom: -1 }); camera.updateProjectionMatrix(); frame();
}
function rotate(direction) { turn += direction; frame(!reducedMotion.matches); }
function zoom(factor) { autoFraming = false; camera.zoom = THREE.MathUtils.clamp(camera.zoom / factor, controls.minZoom, controls.maxZoom); camera.updateProjectionMatrix(); controls.update(); requestRender(); }
controls.addEventListener('change', () => { updateProjectionLabel(); requestRender(); }); controls.addEventListener('start', () => { autoFraming = false; });
$('separation').addEventListener('input', e => setSeparation(Number(e.target.value))); $('explode').addEventListener('click', () => setSeparation(destination > .5 ? 0 : 100));
$('labels-toggle').addEventListener('change', requestRender); $('essentials').addEventListener('change', e => { essentials = e.target.checked; applyMaterials(); });
$('reset-view').addEventListener('click', () => { turn = 0; frame(!reducedMotion.matches); });
$('rotate-left').addEventListener('click', () => rotate(-1)); $('rotate-right').addEventListener('click', () => rotate(1)); $('zoom-in').addEventListener('click', () => zoom(.85)); $('zoom-out').addEventListener('click', () => zoom(1 / .85));
viewport.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); rotate(e.key === 'ArrowLeft' ? -1 : 1); }
  if (e.key === '+' || e.key === '=') zoom(.85); if (e.key === '-') zoom(1 / .85);
  if (e.key === 'e' || e.key === 'E') setSeparation(destination > .5 ? 0 : 100);
});
const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(); let press = null;
renderer.domElement.addEventListener('pointerdown', e => { press = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!press || Math.hypot(press[0] - e.clientX, press[1] - e.clientY) > 5) return;
  const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects([model.root], true).find(h => { let p = h.object, shown = true; while (p) { if (!p.visible) shown = false; p = p.parent; } return shown; });
  if (!hit) return; let o = hit.object; while (o && !o.userData.part) o = o.parent; if (o) select(o.userData.part);
});
new ResizeObserver(resize).observe(viewport);
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) requestRender(); else { cancelAnimationFrame(scheduled); scheduled = 0; } }).observe(viewport);
document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); else { cancelAnimationFrame(scheduled); scheduled = 0; } });
renderer.domElement.addEventListener('webglcontextlost', e => {
  e.preventDefault(); $('fallback').hidden = false; renderer.domElement.hidden = true; $('load-status').textContent = 'The 3D context was interrupted. Reload to retry; the diagram above still shows the layout.';
  document.querySelectorAll('button,input').forEach(c => c.disabled = true); cancelAnimationFrame(scheduled); scheduled = 0; visible = false;
});
document.querySelectorAll('button,input').forEach(c => c.disabled = false);
resize(); select('nic');
if (params.has('explode')) setSeparation(100, true);
if (params.has('select') && parts[params.get('select')]) select(params.get('select'));
renderer.render(scene, camera); updateLabels(); $('fallback').hidden = true; viewport.dataset.ready = 'true';
