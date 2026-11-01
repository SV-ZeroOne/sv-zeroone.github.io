import * as T from 'three';
import { RoundedBoxGeometry } from '../lib/three-r180/RoundedBoxGeometry.js';

// Procedural GMKtec NucBox K8 (original silver model). One scene unit = 10 mm.
//
// Sources for the reconstruction, so nobody has to guess later:
//   Envelope 123 x 112 x 43 mm, all-plastic silver: Liliputing review, TechRadar
//   review (111 mm on the depth, we use the manufacturer's 112).
//   Front I/O: power button, pinhole reset, 3.5 mm jack, USB4, 2 x USB-A 3.2 Gen 2x1.
//   Rear I/O: Kensington slot, USB 3.2 Gen 2x1 and USB 2.0, DisplayPort 1.4 and
//   HDMI 2.0, dual 2.5 GbE (Realtek RTL8125), DC jack, vent strip along the base.
//   Left/right: one large air vent per side.
//   Internals: two side-by-side DDR5 SO-DIMM slots and two M.2 2280 slots on the
//   top of the board, Wi-Fi 2230 under the drives, turbine blower and fin stack
//   under the board (Liliputing teardown, GMKtec K8 Plus teardown video).
// The exact left-to-right order of the rear port cluster is taken from a reviewer
// walking along the back of the machine; hidden routing and proportions are
// illustrative. It is an explanatory reconstruction, not CAD.
const standard = (color, metalness = .5, roughness = .4) => new T.MeshStandardMaterial({ color, metalness, roughness });
export const materials = {
  silver: standard(0x9aa1a9, .42, .44), lid: standard(0x969ea7, .4, .44),
  panel: standard(0x878e96, .46, .4), plastic: standard(0x22262a, .12, .6),
  tray: standard(0x40474d, .18, .55), dark: standard(0x15181b, .4, .45),
  grille: standard(0x0b0e10, .2, .7), void: standard(0x06080a, .1, .95),
  rubber: standard(0x111316, .05, .75), steel: standard(0x9ea3a8, .9, .3),
  copper: standard(0xc08552, .85, .32), pcb: standard(0x16302a, .25, .62),
  module: standard(0x12241f, .2, .6), chip: standard(0x1a1d22, .25, .5),
  gold: standard(0xd1ae5b, .8, .3), lime: standard(0x9fd03a, .2, .45),
  blue: standard(0x2a5fb0, .3, .5),
  led: new T.MeshStandardMaterial({ color: 0x8fd62a, emissive: 0x9ff03a, emissiveIntensity: .5 }),
};
const m = materials;
const xyz = new T.Object3D();
export function group(parent, name, position = [0, 0, 0]) {
  const g = new T.Group(); g.name = name; g.position.set(...position); parent?.add(g); return g;
}
function mesh(parent, geometry, material, position = [0, 0, 0]) {
  const o = new T.Mesh(geometry, material); o.position.set(...position);
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
export function box(parent, size, position, material = m.dark, radius = 0) {
  return mesh(parent, radius ? new RoundedBoxGeometry(...size, 3, Math.min(radius, ...size.map(v => v / 2))) : new T.BoxGeometry(...size), material, position);
}
function plane(parent, w, h, material, position) { return mesh(parent, new T.PlaneGeometry(w, h), material, position); }
function disc(parent, radius, height, position, material = m.dark, segments = 48) {
  return mesh(parent, new T.CylinderGeometry(radius, radius, height, segments), material, position);
}
function ring(parent, r, thickness, position, material = m.steel) {
  const o = mesh(parent, new T.TorusGeometry(r, thickness, 8, 64), material, position); o.rotation.x = Math.PI / 2; return o;
}
// centripetal keeps the curve inside its control points, so a cable cannot loop
// back over the lid the way the default Catmull-Rom tension used to.
export function tube(parent, points, radius = .1, material = m.rubber) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)), false, 'centripetal');
  return mesh(parent, new T.TubeGeometry(curve, 48, radius, 10, false), material);
}
function instances(parent, geometry, material, transforms) {
  const o = new T.InstancedMesh(geometry, material, transforms.length);
  transforms.forEach(([x, y, z, ry = 0], i) => { xyz.position.set(x, y, z); xyz.rotation.set(0, ry, 0); xyz.updateMatrix(); o.setMatrixAt(i, xyz.matrix); });
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function screws(parent, positions, radius = .16) {
  instances(parent, new T.CylinderGeometry(radius, radius, .06, 14), m.steel, positions);
  instances(parent, new T.BoxGeometry(radius * 1.2, .02, .04), m.dark, positions.map(([x, y, z]) => [x, y + .04, z]));
}
const decalCache = new Map();
// Top-face decals read correctly from the default (rear) isometric corner.
const TOP = [-Math.PI / 2, 0, Math.PI];
function decal(parent, text, width, position, color = '#8b9299', height = width / 6, rotation = TOP, weight = 700) {
  const key = text + color + weight;
  if (!decalCache.has(key)) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const c = canvas.getContext('2d'); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${weight} 100px Arial, sans-serif`;
    c.translate(512, 83); c.scale(Math.min(1, 1000 / Math.max(1, c.measureText(text).width)), 1); c.fillText(text, 0, 0);
    const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
    decalCache.set(key, new T.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: .6, metalness: .2, polygonOffset: true, polygonOffsetFactor: -1 }));
  }
  const d = plane(parent, width, height, decalCache.get(key), position); d.rotation.set(...rotation); d.castShadow = false; return d;
}
function tracesMaterial() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024; const c = canvas.getContext('2d');
  c.fillStyle = '#17332c'; c.fillRect(0, 0, 1024, 1024); c.strokeStyle = '#2f5a4a'; c.lineWidth = 2;
  for (let i = 0; i < 160; i++) { const x = (i * 97) % 1000, y = (i * 61) % 1000; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 36, y); c.lineTo(x + 70, y + 34); c.lineTo(x + 70, y + 120); c.stroke(); c.fillStyle = '#b89a5a'; c.fillRect(x, y, 4, 4); }
  const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace;
  return new T.MeshStandardMaterial({ map, roughness: .62, metalness: .3 });
}
// Rounded rectangle helper. Built centred on (cx, cy) so wall holes and the
// matching port blocks can share one table of coordinates.
function roundedPath(Ctor, cx, cy, w, h, r) {
  const p = new Ctor(), x = cx - w / 2, y = cy - h / 2, rr = Math.max(.01, Math.min(r, w / 2, h / 2));
  p.moveTo(x + rr, y);
  p.lineTo(x + w - rr, y); p.quadraticCurveTo(x + w, y, x + w, y + rr);
  p.lineTo(x + w, y + h - rr); p.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  p.lineTo(x + rr, y + h); p.quadraticCurveTo(x, y + h, x, y + h - rr);
  p.lineTo(x, y + rr); p.quadraticCurveTo(x, y, x + rr, y);
  p.closePath(); return p;
}
function axialFan(parent, radius, position) {
  const f = group(parent, 'axial-fan', position);
  const vertices = [], indices = [], rows = 12, cols = 6;
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) {
    const u = i / rows, v = j / cols, r = radius * (.24 + .72 * u), a = -.8 * u + (v - .5) * (.7 - .12 * u);
    vertices.push(r * Math.cos(a), radius * (.16 * (v - .5) * (.3 + .7 * u)), r * Math.sin(a));
  }
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const a = i * (cols + 1) + j, b = a + cols + 1; indices.push(a, a + 1, b, b, a + 1, b + 1); }
  const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const fanMat = standard(0x2b3036, .1, .5); fanMat.side = T.DoubleSide;
  const blades = new T.InstancedMesh(geometry, fanMat, 7); blades.castShadow = true;
  for (let i = 0; i < 7; i++) { xyz.position.set(0, 0, 0); xyz.rotation.set(0, i * Math.PI * 2 / 7, 0); xyz.updateMatrix(); blades.setMatrixAt(i, xyz.matrix); } f.add(blades);
  disc(f, radius * .27, .3, [0, .05, 0], m.plastic); ring(f, radius * .98, .07, [0, .02, 0], m.dark);
  decal(f, 'GMKtec', radius * .42, [0, .21, 0], '#9aa0a6', radius * .12);
  return f;
}
// Turbine blower: a housing with an intake well and a real outlet duct that
// feeds the rear fin stack, rather than a bare cylinder of blades.
function blower(parent, radius, position) {
  const b = group(parent, 'blower', position);
  box(b, [radius * 2.05, .78, radius * 2.05], [0, 0, 0], m.tray, .34);
  disc(b, radius * .97, .74, [0, .06, 0], m.void, 40);
  const transforms = []; for (let i = 0; i < 30; i++) { const a = i * Math.PI * 2 / 30; transforms.push([Math.cos(a) * radius * .62, .05, Math.sin(a) * radius * .62, -a + .9]); }
  instances(b, new T.BoxGeometry(.06, .6, radius * .55), standard(0x343a40, .2, .55), transforms);
  disc(b, radius * .3, .66, [0, .05, 0], m.dark);
  box(b, [radius * .9, .74, 2.5], [0, .02, -radius - .8], m.tray, .12);   // outlet duct to the fins
  return b;
}
function finStack(parent, length, height, depth, position) {
  const p = group(parent, 'fins', position), positions = [];
  for (let x = -length / 2; x <= length / 2; x += .14) positions.push([x, 0, 0]);
  instances(p, new T.BoxGeometry(.05, height, depth), m.steel, positions); return p;
}
// Port block. face = the side of the block that faces out of the case, so the
// opening sits on the visible face after the wall is cut around it.
function portBlock(parent, size, position, material = m.dark, face = -1) {
  const g = group(parent, 'port', position); box(g, size, [0, 0, 0], material, .04);
  box(g, [size[0] * .8, size[1] * .55, .1], [0, 0, face * (size[2] / 2 - .01)], m.void);
  return g;
}
export function buildK8() {
  const W = 12.3, D = 11.2, H = 3.2, TW = .22, RC = .55;
  const SHELL_Y = .26, BOARD_Y = 1.45;
  // shell-local height -> board-local height (the port blocks live on the board)
  const ioy = y => SHELL_Y + y - BOARD_Y;
  const root = group(null, 'GMKtec NucBox K8');
  const moves = [], anchors = {};
  // part(): a movable assembly. offset/stage define its path during the
  // staged explosion. essential: highlighted in "Ludus essentials" mode.
  function part(id, parent, position, offset, stage, anchor, essential = false) {
    const g = group(parent, id, position); g.userData.part = id; g.userData.essential = essential;
    moves.push({ g, start: g.position.clone(), offset: new T.Vector3(...offset), stage });
    anchors[id] = group(g, 'anchor', anchor); return g;
  }
  // 01 Bottom plate: silver plastic, rubber feet, intake vents under the blower,
  // VESA bosses.
  const bottom = part('bottom', root, [0, 0, 0], [0, 0, 0], [0, 1], [-W / 2 + .4, .25, 0]);
  box(bottom, [W, .26, D], [0, .13, 0], m.silver, .3);
  for (const [x, z] of [[-4.6, -4.2], [4.6, -4.2], [-4.6, 4.2], [4.6, 4.2]]) disc(bottom, .5, .1, [x, -.05, z], m.rubber, 24);
  const vents = []; for (let z = -2.2; z <= 2.2; z += .4) vents.push([-1, .27, z]);
  instances(bottom, new T.BoxGeometry(5.6, .02, .14), m.void, vents);
  for (const [x, z] of [[-3.75, -3.75], [3.75, -3.75], [-3.75, 3.75], [3.75, 3.75]]) disc(bottom, .28, .06, [x, -.03, z], m.steel, 16);
  // 02 Cooler: turbine blower, copper heat pipes bending into the rear fin stack,
  // cold plate on the underside of the CPU.
  const cooler = part('cooler', root, [0, .3, 0], [0, 1.5, 0], [.25, .65], [W / 2 - 1.2, .5, -4.6]);
  blower(cooler, 2.55, [-.9, .42, 1.1]);
  finStack(cooler, 7.4, .9, .9, [0, .46, -4.65]);
  box(cooler, [7.5, .95, .08], [0, .46, -5.12], m.plastic);
  box(cooler, [3.2, .14, 3.2], [1.9, .98, .2], m.copper, .05);
  tube(cooler, [[1.9, 1.02, .2], [.4, 1.02, -1.8], [-1.4, .95, -3.6], [-1.6, .92, -4.3]], .22, m.copper);
  tube(cooler, [[2.1, 1.02, -.4], [1.7, 1.02, -2.2], [1.4, .95, -3.6], [1.4, .92, -4.3]], .22, m.copper);
  // 03 Mainboard. CPU and cooler are underneath; RAM, M.2 and Wi-Fi on top.
  const board = part('board', root, [0, BOARD_Y, 0], [0, 3.6, 0], [.12, .55], [W / 2 - .6, .3, 4.2]);
  box(board, [11.6, .14, 10.6], [0, .07, 0], m.pcb, .15);
  plane(board, 11.5, 10.5, tracesMaterial(), [0, .141, 0]).rotation.x = -Math.PI / 2;
  box(board, [3.3, .12, 3.3], [1.9, -.06, .2], m.chip, .04);
  decal(board, 'RYZEN 7 8845HS', 2.9, [1.9, .15, 3.2], '#5c7a66', .32);
  // Two side-by-side SO-DIMM sockets (the K8 does not stack them). A 67.6 mm
  // module is 6.76 units long, so the pair is centred at RAM_X to keep both the
  // module and its connector inside the 116 mm board and the 123 mm case.
  const RAM_X = -2.1;
  for (const z of [-2.6, 1.1]) box(board, [7.0, .34, .42], [RAM_X, .3, z + 1.62], m.plastic, .04);
  // Two M.2 2280 sockets running front to back, plus the 2230 Wi-Fi socket.
  for (const x of [2.4, 4.75]) { box(board, [2.3, .3, .5], [x, .29, -4.95], m.plastic, .04); box(board, [.4, .18, .4], [x, .23, 2.9], m.steel, .04); }
  box(board, [3.1, .26, 2.3], [3.6, .26, 4.1], m.plastic, .04);
  // Rear I/O. The blocks pass through the cut-outs in the shell wall, so the
  // assembled view shows real ports rather than painted rectangles.
  const rearPorts = [
    { id: 'ken', kind: 'slot', x: -5.05, y: .95, w: .85, h: .34 },
    { id: 'usb2', kind: 'usbA', x: -2.6, y: 1.58, w: 1.2, h: .42 },
    { id: 'usb3', kind: 'usbA', x: -2.6, y: 1.08, w: 1.2, h: .42 },
    { id: 'dp', kind: 'video', x: -.95, y: 1.58, w: 1.15, h: .42 },
    { id: 'hdmi', kind: 'video', x: -.95, y: 1.08, w: 1.2, h: .4 },
    { id: 'lan2', kind: 'rj45', x: 1.55, y: 1.28, w: 1.32, h: 1.02 },
    { id: 'lan1', kind: 'rj45', x: 3.05, y: 1.28, w: 1.32, h: 1.02 },
    { id: 'dc', kind: 'dc', x: 4.85, y: 1.2, w: .62, h: .62 },
  ];
  const frontPorts = [
    { id: 'audio', kind: 'audio', x: -1.9, y: 1.15, w: .6, h: .6 },
    { id: 'usbA1', kind: 'usbA', x: -.5, y: 1.15, w: 1.2, h: .45 },
    { id: 'usbA2', kind: 'usbA', x: .9, y: 1.15, w: 1.2, h: .45 },
    { id: 'usb4', kind: 'usbC', x: 2.3, y: 1.15, w: 1.0, h: .42 },
    { id: 'reset', kind: 'pinhole', x: 3.3, y: 1.15, w: .16, h: .16 },
    { id: 'power', kind: 'power', x: 4.5, y: 1.15, w: .68, h: .68 },
  ];
  const rear = group(board, 'rear-io', [0, 0, -D / 2 + TW / 2]);
  for (const p of rearPorts) {
    const y = ioy(p.y);
    if (p.kind === 'rj45') {
      const g = portBlock(rear, [1.3, 1.1, .5], [p.x, y, 0], m.dark, -1);
      g.name = 'rj45'; g.userData.part = 'nic'; g.userData.essential = true;
      for (const dx of [-.42, .42]) box(g, [.16, .1, .06], [dx, .5, -.26], dx < 0 ? m.led : m.lime);
    } else if (p.kind === 'usbA') {
      const g = portBlock(rear, [1.25, .5, .5], [p.x, y, 0], m.steel, -1);
      box(g, [1.0, .16, .06], [0, .06, -.26], m.blue);
    } else if (p.kind === 'video') {
      portBlock(rear, [p.w + .1, .55, .5], [p.x, y, 0], m.steel, -1);
    } else if (p.kind === 'dc') {
      const g = group(rear, 'dc', [p.x, y, 0]);
      disc(g, .36, .54, [0, 0, 0], m.dark, 24).rotation.x = Math.PI / 2;
      disc(g, .12, .56, [0, 0, 0], m.gold, 16).rotation.x = Math.PI / 2;
    } else {
      box(rear, [p.w, p.h, .3], [p.x, y, 0], m.void);
    }
  }
  anchors.nic = group(rear, 'anchor', [3.05, ioy(1.28) + .7, -.3]);
  const front = group(board, 'front-io', [0, 0, D / 2 - TW / 2]);
  for (const p of frontPorts) {
    const y = ioy(p.y);
    if (p.kind === 'audio') {
      const g = group(front, 'audio', [p.x, y, 0]);
      disc(g, .3, .54, [0, 0, 0], m.dark, 24).rotation.x = Math.PI / 2;
      disc(g, .16, .56, [0, 0, 0], m.void, 16).rotation.x = Math.PI / 2;
    } else if (p.kind === 'power') {
      const g = group(front, 'power', [p.x, y, 0]);
      disc(g, .34, .54, [0, 0, 0], m.steel, 24).rotation.x = Math.PI / 2;
      disc(g, .25, .56, [0, 0, 0], m.led, 24).rotation.x = Math.PI / 2;
    } else if (p.kind === 'pinhole') {
      disc(front, .09, .54, [p.x, y, 0], m.void, 12).rotation.x = Math.PI / 2;
    } else if (p.kind === 'usbC') {
      const g = portBlock(front, [.98, .44, .5], [p.x, y, 0], m.steel, 1);
      box(g, [.62, .16, .06], [0, 0, .26], m.void);
    } else {
      const g = portBlock(front, [1.25, .52, .5], [p.x, y, 0], m.steel, 1);
      box(g, [1.0, .17, .06], [0, .06, .26], m.blue);
    }
  }
  // The wired uplink Ludus requires: a lime patch lead in LAN1.
  const plug = group(board, 'patch-lead', [3.05, ioy(1.28), -D / 2]);
  plug.userData.part = 'nic'; plug.userData.essential = true;
  box(plug, [1.0, .8, 1.2], [0, 0, -.5], m.lime, .08); box(plug, [.5, .3, .6], [0, .5, -.6], m.lime, .06);
  // Drop the lead close behind the port. Under an orthographic camera a point
  // further back projects *higher*, so a cable that reaches far rearward climbs
  // above the lid and reads as a floating artefact.
  tube(plug, [[0, -.2, -1.0], [-.2, -.9, -1.5], [-.8, -2.4, -1.9], [-1.6, -3.8, -2.1]], .17, m.lime);
  // The lead hangs below the case, where it would otherwise drop a soft shadow
  // onto the invisible ground plane and read as a smudge behind the machine.
  plug.traverse(o => { if (o.isMesh) o.castShadow = false; });
  // 04/05 Two DDR5 SO-DIMMs, side by side as fitted.
  for (let n = 0; n < 2; n++) {
    const ram = part(`ram${n + 1}`, board, [RAM_X, .5, n ? 1.1 : -2.6], [0, 1.2 + n * .7, 0], [.4 + n * .03, .8 + n * .05], [RAM_X, .12, n ? 1.4 : -2.3], true);
    box(ram, [6.76, .12, 2.86], [0, 0, 0], m.module, .04);
    for (let i = 0; i < 8; i++) box(ram, [.72, .09, 1.2], [-2.9 + i * .83, .1, -.3], m.chip, .03);
    box(ram, [6.76, .06, .18], [0, -.02, 1.46], m.gold);
    for (const x of [-3.15, 3.15]) box(ram, [.3, .4, .5], [x, .12, 1.2], m.plastic, .04);
    decal(ram, 'DDR5 SO-DIMM 48 GB', 3.4, [0, .07, .8], '#9ea6a0', .34);
  }
  // 06/07 Two M.2 2280 NVMe drives; the first wears a heatsink.
  const ssd1 = part('ssd1', board, [2.4, .3, -1.0], [0, 1.4, 0], [.38, .8], [2.4, .4, -3.2], true);
  box(ssd1, [2.1, .1, 8.0], [0, 0, 0], m.module, .03);
  box(ssd1, [2.0, .34, 7.4], [0, .21, .1], standard(0x3a3f45, .7, .35), .06);
  const fins = []; for (let z = -3.4; z <= 3.4; z += .27) fins.push([0, .43, z]); instances(ssd1, new T.BoxGeometry(1.85, .1, .09), standard(0x3a3f45, .7, .35), fins);
  decal(ssd1, 'NVMe', .9, [0, .5, 3.6], '#c4cad0', .22);
  const ssd2 = part('ssd2', board, [4.75, .3, -1.0], [.45, 1.8, 0], [.4, .82], [4.75, .1, -3.2], true);
  box(ssd2, [2.1, .1, 8.0], [0, 0, 0], m.module, .03);
  for (let i = 0; i < 4; i++) box(ssd2, [1.5, .1, 1.3], [0, .1, -2.4 + i * 1.7], m.chip, .03);
  box(ssd2, [.9, .12, .9], [0, .11, 3.1], m.chip, .03);
  decal(ssd2, 'PCIe 4.0 ×4', 1.5, [0, .06, 3.1], '#9ea6a0', .3);
  // 08 M.2 2230 Wi-Fi 6E / Bluetooth 5.2 module (not used by Ludus). It sits at
  // the front end of the drive bay, under the first SSD, with the antenna leads
  // routed to the shell rather than stopping in mid-air.
  const wifi = part('wifi', board, [3.6, .4, 4.1], [0, 1.0, 0], [.36, .76], [3.6, .1, 4.1]);
  box(wifi, [3.0, .08, 2.2], [0, 0, 0], m.module, .03);
  box(wifi, [1.7, .16, 1.5], [0, .11, -.1], m.steel, .04);
  for (const x of [-.6, .6]) {
    disc(wifi, .13, .1, [x, .1, .85], m.gold, 12);
    tube(wifi, [[x, .14, .85], [x - .2, .2, 1.4], [x - .3, .1, 2.1]], .03, m.dark);
  }
  // 09 Shell: one rounded chassis with a real vent grille per side and real
  // cut-outs at the front and rear, instead of four boxes with painted ports.
  const shell = part('shell', root, [0, SHELL_Y, 0], [0, 11.2, 0], [.15, .6], [-W / 2 + .3, 1.6, D / 2 - .5]);
  const OPT = { depth: TW, bevelEnabled: false, curveSegments: 14 };
  const wall = (entries, holes = []) => {
    const shape = roundedPath(T.Shape, 0, H / 2, W - 2 * RC, H, .1);
    for (const p of entries) {
      if (['dc', 'audio', 'pinhole', 'power'].includes(p.kind)) {
        const c = new T.Path(); c.absarc(p.x, p.y, Math.min(p.w, p.h) / 2, 0, Math.PI * 2, true); shape.holes.push(c);
      } else shape.holes.push(roundedPath(T.Path, p.x, p.y, p.w, p.h, .05));
    }
    for (const h of holes) shape.holes.push(h);
    return new T.ExtrudeGeometry(shape, OPT);
  };
  mesh(shell, wall(rearPorts, [roundedPath(T.Path, -1.0, .2, 7.0, .3, .06)]), m.panel, [0, 0, -D / 2]);
  mesh(shell, wall(frontPorts), m.panel, [0, 0, D / 2 - TW]);
  for (const sx of [-1, 1]) {
    const shape = roundedPath(T.Shape, 0, H / 2, D - 2 * RC, H, .1);
    shape.holes.push(roundedPath(T.Path, 0, 1.55, 5.6, 2.0, .2));
    const w = mesh(shell, new T.ExtrudeGeometry(shape, OPT), m.panel, [sx * W / 2, 0, 0]);
    w.rotation.y = -sx * Math.PI / 2;
    const slats = []; for (let z = -2.66; z <= 2.66; z += .19) slats.push([0, 0, z]);
    const g = instances(shell, new T.BoxGeometry(.05, 1.94, .1), m.grille, slats);
    g.position.set(sx * (W / 2 - TW / 2), 1.55, 0);
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) disc(shell, RC, H, [x * (W / 2 - RC), H / 2, z * (D / 2 - RC)], m.panel, 28);
  // 10 Fan tray: a light grey carrier with the top extractor fan. Lighter than
  // it was, so it no longer disappears into the lid's shadow.
  const tray = part('fan', root, [0, 3.06, 0], [0, 14.6, 0], [.08, .5], [-W / 2 + 1.1, .25, -3.6]);
  const frame = roundedPath(T.Shape, 0, 0, 11.4, 10.3, .3);
  frame.holes.push(new T.Path().absarc(-.6, -.3, 2.85, 0, Math.PI * 2, true));
  const tp = mesh(tray, new T.ExtrudeGeometry(frame, { depth: .1, bevelEnabled: false, curveSegments: 48 }), m.tray, [0, .1, 0]); tp.rotation.x = Math.PI / 2;
  axialFan(tray, 2.75, [-.6, .02, .3]);
  screws(tray, [[-5.2, .1, -4.7], [5.2, .1, -4.7], [-5.2, .1, 4.7], [5.2, .1, 4.7]]);
  const grille = []; for (let z = -4.6; z <= 4.6; z += .42) grille.push([3.6, .1, z]); instances(tray, new T.BoxGeometry(3.6, .02, .12), m.void, grille);
  // 11 Top lid: glossy silver with the GMKtec wordmark.
  const lid = part('lid', root, [0, 3.46, 0], [0, 17.4, 0], [0, .42], [-W / 2 + .4, .4, 0]);
  box(lid, [W, .34, D], [0, .17, 0], m.lid, .34);
  decal(lid, 'GMKtec', 3.4, [0, .356, -.2], '#4e555c', .62);
  decal(lid, 'NucBox K8', 1.9, [3.9, .356, 4.5], '#5f6670', .3, TOP, 400);
  const ease = (v, [a, b]) => { const x = T.MathUtils.clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const worldAnchor = (id, out = new T.Vector3()) => anchors[id].getWorldPosition(out);
  return {
    root, anchor: worldAnchor,
    explode(v) {
      for (const { g, start, offset, stage } of moves) g.position.copy(start).addScaledVector(offset, ease(v, stage));
      plug.visible = v < .04;
    },
  };
}
