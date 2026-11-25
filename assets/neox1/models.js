import * as T from 'three';
import { RoundedBoxGeometry } from '../lib/three-r180/RoundedBoxGeometry.js';

// Photo-derived models. One scene unit = 100 mm. Published outer dimensions
// constrain the cases; concealed components are explanatory reconstructions.
// Revised 2026-11-21 against the owner's build photos (see NEOX1-IMAGES.md).
const standard = (color, metalness = .5, roughness = .38) => new T.MeshStandardMaterial({ color, metalness, roughness });
export const materials = {
  graphite: standard(0x35383d, .7, .33), dark: standard(0x171a1d, .5, .38),
  rubber: standard(0x111316, .05, .7), steel: standard(0xa1a5aa, .92, .29),
  silver: standard(0xb7bbc3, .78, .32), lime: standard(0x7ab82e, .12, .55),
  pcb: standard(0x172525, .25, .65), chip: standard(0x1d2127, .2, .55),
  gold: standard(0xd2ae59, .8, .3), copper: standard(0xc38652, .85, .3),
  led: new T.MeshStandardMaterial({ color: 0x86c81e, emissive: 0x86c81e, emissiveIntensity: .35 }),
  // Added for the 2026-11 revision.
  black: standard(0x0c0d0f, .25, .62), gunmetal: standard(0x70747a, .82, .34),
  panel: standard(0x2a2d32, .6, .46), shroud: standard(0x2c2e32, .55, .42),
  backplate: standard(0x24262a, .78, .44), fin: standard(0x7b7f85, .9, .36),
  finDark: standard(0x3b3e43, .85, .42), bluePcb: standard(0x183a72, .3, .55),
  greenPcb: standard(0x1d6a38, .3, .58), brass: standard(0xb9923c, .85, .32),
  dock: standard(0xb5b9bf, .86, .3), greyPlastic: standard(0xb9bdc2, .1, .6),
  white: standard(0xe9e9e4, .05, .7), blade: standard(0x101214, .05, .66),
  tuf: standard(0x47484c, .78, .42), tufFacet: standard(0x5f6166, .8, .4), finMid: standard(0x52555a, .85, .45),
  bracket: standard(0x202226, .5, .55), psu: standard(0x101113, .15, .85),
  shelf: standard(0x16181b, .15, .8), louvre: standard(0x1b1d20, 0, .95),
  cavity: new T.MeshBasicMaterial({ color: 0x060607 }),
};
const m = materials;
m.blade.side = T.DoubleSide;
const xyz = new T.Object3D();
export function group(parent, name, position = [0, 0, 0]) {
  const g = new T.Group(); g.name = name; g.position.set(...position); parent?.add(g); return g;
}
function mesh(parent, geometry, material, position = [0, 0, 0]) {
  const o = new T.Mesh(geometry, material); o.position.set(...position);
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
export function box(parent, size, position, material = m.dark, radius = 0) {
  return mesh(parent, radius ? new RoundedBoxGeometry(...size, 2, Math.min(radius, ...size.map(v => v / 2))) : new T.BoxGeometry(...size), material, position);
}
function plane(parent, w, h, material, position) { return mesh(parent, new T.PlaneGeometry(w, h), material, position); }
function disc(parent, radius, depth, position, material = m.dark, segments = 48) {
  const o = mesh(parent, new T.CylinderGeometry(radius, radius, depth, segments), material, position);
  o.rotation.x = Math.PI / 2; return o;
}
// A cylinder lying along the X axis (heatpipe tips, thumbscrews seen end-on).
function pin(parent, radius, length, position, material = m.steel) {
  const o = mesh(parent, new T.CylinderGeometry(radius, radius, length, 20), material, position);
  o.rotation.z = Math.PI / 2; return o;
}
function ring(parent, r, thickness, position, material = m.steel) {
  return mesh(parent, new T.TorusGeometry(r, thickness, 6, 64), material, position);
}
export function tube(parent, points, radius = .025, material = m.rubber) {
  return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 48, radius, 6, false), material);
}
function instances(parent, geometry, material, transforms, rotation = [0, 0, 0]) {
  const o = new T.InstancedMesh(geometry, material, transforms.length);
  transforms.forEach((p, i) => { xyz.position.set(...p); xyz.rotation.set(...rotation); xyz.updateMatrix(); o.setMatrixAt(i, xyz.matrix); });
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function screws(parent, positions, radius = .023, material = m.steel) {
  const geo = new T.CylinderGeometry(radius, radius, .015, 12); geo.rotateX(Math.PI / 2);
  instances(parent, geo, material, positions);
  instances(parent, new T.BoxGeometry(radius * 1.1, .006, .003), m.dark, positions.map(([x,y,z]) => [x,y,z+.009]));
}
const decalCache = new Map();
function decal(parent, text, width, position, color = '#c8ccd0', height = width / 6, rotation = [0,0,0], glow = 0) {
  const key = text + color + glow;
  if (!decalCache.has(key)) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const c = canvas.getContext('2d'); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 100px Arial, sans-serif';
    // Fill the decal width for short wordmarks too (e.g. AG03's "03").
    c.translate(512,83);c.scale(1000/Math.max(1,c.measureText(text).width),1);c.fillText(text,0,0);
    const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
    const mat = new T.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: .65, metalness: .2, polygonOffset: true, polygonOffsetFactor: -1 });
    if (glow) { mat.emissive = new T.Color(0xffffff); mat.emissiveMap = map; mat.emissiveIntensity = glow; }
    decalCache.set(key, mat);
  }
  const d = plane(parent, width, height, decalCache.get(key), position); d.rotation.set(...rotation); d.castShadow = false; return d;
}
// Free-form surface art (logos, labels, silkscreen): draw(context, width, height).
function art(parent, w, h, position, draw, { rotation = [0,0,0], px = 200, glow = 0 } = {}) {
  const canvas = document.createElement('canvas'); canvas.height = px; canvas.width = Math.min(2048, Math.max(8, Math.round(px * w / h)));
  draw(canvas.getContext('2d'), canvas.width, canvas.height);
  const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
  const mat = new T.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: .6, metalness: .2, polygonOffset: true, polygonOffsetFactor: -1 });
  if (glow) { mat.emissive = new T.Color(0xffffff); mat.emissiveMap = map; mat.emissiveIntensity = glow; }
  const p = plane(parent, w, h, mat, position); p.rotation.set(...rotation); p.castShadow = false; return p;
}
// Alpha-tested perforations have actual see-through holes, rather than painted dots.
function perforatedMaterial(material, w, h, mode = 'all') {
  const canvas = document.createElement('canvas'); canvas.width = Math.round(w * 420); canvas.height = Math.round(h * 420);
  const c = canvas.getContext('2d'); c.fillStyle = 'white'; c.fillRect(0, 0, canvas.width, canvas.height); c.fillStyle = 'black';
  // Canvas x runs along the panel; y is measured down from its top edge.
  const tests = {
    all: () => true,
    // One perforated rectangle inside a solid sheet-metal border.
    field: (x, y) => x > .2 && x < w-.2 && y > .2 && y < h-.2,
    // NEO-X1 Pro right side: a round vent towards the upper rear and a low band.
    right: (x, y) => (x - w*.63)**2 + (y - h*.40)**2 < .5**2 || (y > h-.36 && y < h-.12 && x > .5 && x < w-.14),
    // NEO-X1 Pro left side: a tall radiator field above a separate low band.
    left: (x, y) => (x > .22 && x < w-.22 && y > .2 && y < h*.68) || (y > h-.36 && y < h-.12 && x > .22 && x < w-.22),
  };
  const test = tests[mode] || tests.all;
  for (let y = .08, row = 0; y < h - .08; y += .046, row++) for (let x = .08 + (row % 2) * .023; x < w - .08; x += .046) {
    if (test(x, y)) { c.beginPath(); c.arc(x*420,y*420,5.0,0,Math.PI*2); c.fill(); }
  }
  const map = new T.CanvasTexture(canvas); map.anisotropy = 8;
  const mat = material.clone(); mat.alphaMap = map; mat.alphaTest = .5; mat.side = T.DoubleSide;
  return mat;
}
function edgedPanel(parent, w, h, position, material, mode = 'all', withScrews = true) {
  const panel = group(parent, 'panel', position);
  plane(panel, w, h, perforatedMaterial(material,w,h,mode), [0,0,0]);
  for (const y of [-h/2,h/2]) box(panel,[w,.025,.025],[0,y,0],material,.009);
  for (const x of [-w/2,w/2]) box(panel,[.025,h,.025],[x,0,0],material,.009);
  if (withScrews) screws(panel,[[-w/2+.06,-h/2+.06,.012],[w/2-.06,-h/2+.06,.012],[-w/2+.06,h/2-.06,.012],[w/2-.06,h/2-.06,.012]],.016);
  return panel;
}
// Outline of a rounded rectangle, counter-clockwise, for extrude().
function roundRect(w, h, r, cx = 0, cy = 0, seg = 5) {
  const pts = [], corners = [[cx+w/2-r,cy+h/2-r,0],[cx-w/2+r,cy+h/2-r,Math.PI/2],[cx-w/2+r,cy-h/2+r,Math.PI],[cx+w/2-r,cy-h/2+r,Math.PI*1.5]];
  for (const [x,y,a0] of corners) for (let i = 0; i <= seg; i++) { const a = a0 + i/seg*Math.PI/2; pts.push([x+Math.cos(a)*r, y+Math.sin(a)*r]); }
  return pts;
}
// holes: [x, y, radius] circles, or point lists for polygonal openings.
function extrude(parent, points, holes, depth, material, position, bevel = .012) {
  const shape = new T.Shape(); shape.moveTo(...points[0]); points.slice(1).forEach(p => shape.lineTo(...p)); shape.closePath();
  for (const h of holes) {
    const hole = new T.Path();
    if (Array.isArray(h[0])) { hole.moveTo(...h[0]); h.slice(1).forEach(p => hole.lineTo(...p)); hole.closePath(); }
    else hole.absarc(h[0],h[1],h[2],0,Math.PI*2,true);
    shape.holes.push(hole);
  }
  return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:48}),material,position);
}
// hub: text, or a function(fanGroup, radius) that draws an emblem on the hub.
function axialFan(parent, radius, position, hub = '', reverse = false, bladeCount = 9, backing = false) {
  const f = group(parent,'axial-fan',position);
  // Swept, pitched airfoils. A flat extrusion makes axial blades look like petals.
  const vertices=[],indices=[],rows=14,cols=8;
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
    const u=i/rows,v=j/cols,r=radius*(.23+.74*u);
    const a=-.85*u+(v-.5)*(6.1/bladeCount-.10*u);
    vertices.push(r*Math.cos(a),r*Math.sin(a),radius*(.20*(v-.5)*(.3+.7*u)+.025*Math.sin(u*Math.PI)));
  }
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  if(reverse){geometry.scale(1,-1,1);geometry.computeVertexNormals();}
  const blades=new T.InstancedMesh(geometry,m.blade,bladeCount);blades.castShadow=true;blades.receiveShadow=true;
  for(let i=0;i<bladeCount;i++){xyz.position.set(0,0,0);xyz.rotation.set(0,0,i*Math.PI*2/bladeCount);xyz.updateMatrix();blades.setMatrixAt(i,xyz.matrix);}f.add(blades);
  // A dark well behind the blades, so bright fins do not show between them.
  if(backing)disc(f,radius*.985,.008,[0,0,-radius*.14],m.black);
  ring(f,radius*.975,.012,[0,0,.025],m.dark);
  disc(f,radius*.26,.055,[0,0,.045],m.graphite);
  if(typeof hub==='function')hub(f,radius);
  else if(hub)decal(f,hub,radius*.42,[0,0,.075],'#d6d9dd',radius*.14);
  return f;
}
function finStack(parent, length, height, depth, position, material = m.fin) {
  const p = group(parent,'heatsink',position), positions=[];
  for(let x=-length/2;x<=length/2;x+=.027)positions.push([x,0,0]);
  instances(p,new T.BoxGeometry(.009,height,depth),material,positions); return p;
}
function edgeConnector(parent, x, y, z, length) {
  box(parent,[length,.1,.022],[x,y,z],m.gold);
  const contacts=[]; for(let p=x-length/2+.025;p<x+length/2;p+=.027)contacts.push([p,y,z+.015]);
  instances(parent,new T.BoxGeometry(.006,.085,.004),m.pcb,contacts);
  box(parent,[.045,.1,.025],[x-length*.29,y,z],m.dark);
}
function socket(parent, position, pins = 8) {
  const g=group(parent,'power-socket',position); box(g,[pins===16?.22:pins===6?.15:.19,.105,.12],[0,0,0],m.black,.008);
  const count=pins===16?6:pins===6?3:4;
  for(let x=0;x<count;x++)for(let y=0;y<2;y++)box(g,[.021,.024,.006],[(x-(count-1)/2)*.032,(y-.5)*.038,.063],m.chip);
  group(g,'power-lead',[0,0,.075]);return g;
}
// style 'ports': a column of outputs beside a column of small vents.
// style 'blower': four outputs beside two large exhaust openings (R9700).
function ioBracket(parent, x, h, d, ports, style = 'ports', y = 0) {
  const g=group(parent,'io-bracket',[x,y,0]); g.rotation.y=-Math.PI/2;
  box(g,[d,h,.025],[0,0,0],m.steel,.008);
  for(let i=0;i<ports;i++) { const y=-h*.34+i*h*(style==='blower'?.19:.135); box(g,[d*.42,.075,.03],[-d*.19,y,.017],m.dark,.009); box(g,[d*.35,.045,.035],[-d*.19,y,.022],m.chip); }
  if(style==='blower'){
    for(const y of [-h*.19,h*.19])box(g,[d*.3,h*.33,.006],[d*.24,y,.016],m.black,.012);
  }else{
    const slots=[]; for(let y=-h*.35;y<h*.4;y+=.1)slots.push([d*.25,y,.018]);
    instances(g,new T.BoxGeometry(d*.27,.045,.006),m.dark,slots);
  }
  box(g,[d,.055,.05],[0,h/2+.02,0],m.steel);
  screws(g,[[0,-h/2+.05,.022],[0,h/2-.05,.022]],.019);
}
// Simplified brand emblems, drawn rather than copied.
const tufEmblem=color=>(c,w,h)=>{
  c.fillStyle=color;c.translate(w/2,h/2);const s=h;
  for(const sx of [-1,1]){
    c.beginPath();c.moveTo(sx*.05*s,-.42*s);c.lineTo(sx*.46*s,-.42*s);c.lineTo(sx*.46*s,-.14*s);c.lineTo(sx*.05*s,.06*s);c.closePath();c.fill();
    c.beginPath();c.moveTo(sx*.05*s,.17*s);c.lineTo(sx*.46*s,-.03*s);c.lineTo(sx*.30*s,.25*s);c.lineTo(sx*.05*s,.44*s);c.closePath();c.fill();
  }
};
const zotacEmblem=(color,solid=false)=>(c,w,h)=>{
  // Two mirrored wings either side of a central gap.
  c.strokeStyle=color;c.fillStyle=color;c.lineWidth=h*.045;c.lineJoin='miter';c.translate(w/2,h/2);const s=h*.44;
  for(const sx of [-1,1]){
    c.beginPath();c.moveTo(sx*.09*s,-.92*s);c.lineTo(sx*.92*s,-.62*s);c.lineTo(sx*.62*s,.25*s);c.lineTo(sx*.09*s,.96*s);c.lineTo(sx*.09*s,.32*s);c.lineTo(sx*.42*s,-.05*s);c.lineTo(sx*.09*s,-.3*s);c.closePath();
    solid?c.fill():c.stroke();
  }
};
const hubEmblem=(draw,size=.34)=>(f,radius)=>{
  disc(f,radius*.24,.008,[0,0,.076],m.steel);
  art(f,radius*size,radius*size,[0,0,.082],draw,{px:128});
};
// The GMKtec wordmark: grey letters with the right-hand stem of the M in lime.
function gmktecLogo(parent, width, position, rotation = [0,0,0], grey = '#9a9fa4') {
  return art(parent, width, width*.2, position, (c,W,H) => {
    c.font=`700 ${H*.84}px Arial, sans-serif`;c.textBaseline='middle';
    const text='GMKtec',x0=(W-c.measureText(text).width)/2,gm=c.measureText('GM').width,stem=H*.15;
    c.fillStyle=grey;c.fillText(text,x0,H*.54);
    c.fillStyle='#8fd12a';c.fillRect(x0+gm-stem-H*.045,H*.235,stem,H*.61);
  }, { rotation });
}
export function gpu(kind = 'amd') {
  return kind === '5070' ? zotac5070() : kind === 'amd' ? r9700() : tuf3090();
}
function r9700(){
  // Gigabyte Radeon AI PRO R9700 AI TOP 32G: 267 x 111 x 40 mm. A closed silver
  // unibody with one blower in a dark well; the back is silver too, not black.
  const L=2.67,H=1.11,D=.40,g=group(null,'R9700 AI TOP'),fx=.79,fr=.39;
  box(g,[L-.12,H-.07,.022],[0,-.045,-D*.28],m.pcb,.008);
  edgeConnector(g,-.35,-H/2-.025,-D*.28,.9);
  // Rounded shell, closed at the tail. It stops short of the front so the thick
  // front plate can carry a real opening for the blower.
  box(g,[L-.03,H-.03,D-.13],[.005,0,-.04],m.silver,.055);
  extrude(g,roundRect(L-.035,H-.035,.07),[[fx,0,fr]],.058,m.silver,[.005,0,D/2-.1],.006);
  // The fan third stands slightly proud of the rest of the face.
  extrude(g,roundRect(L*.39,H-.07,.07,L/2-L*.195-.02,0),[[fx,0,fr]],.01,m.silver,[.005,0,D/2-.032],.004);
  disc(g,fr+.02,.006,[fx,0,D/2-.098],m.black);
  ring(g,fr,.008,[fx,0,D/2-.02],m.graphite);
  const rotor=group(g,'blower',[fx,0,D/2-.07]);
  const vanes=new T.InstancedMesh(new T.BoxGeometry(.012,.15,.05),m.graphite,52);vanes.castShadow=true;vanes.receiveShadow=true;
  for(let i=0;i<52;i++){const a=i*Math.PI*2/52;xyz.position.set(Math.cos(a)*.31,Math.sin(a)*.31,0);xyz.rotation.set(0,0,a-.5);xyz.updateMatrix();vanes.setMatrixAt(i,xyz.matrix);}rotor.add(vanes);
  // Silver hub with the iridescent AI TOP sticker.
  disc(rotor,.17,.05,[0,0,.012],m.steel);
  art(rotor,.3,.3,[0,0,.04],(c,w,h)=>{c.translate(w/2,h/2);const R=h*.48;const grad=c.createLinearGradient(-R,-R,R,R);grad.addColorStop(0,'#dfe4ea');grad.addColorStop(.5,'#f5f6f8');grad.addColorStop(1,'#c9d0d8');c.fillStyle=grad;c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.fill();c.lineWidth=h*.035;[['#e79a4f',.62,.3],['#5b8fe0',.46,2.2],['#58c9a8',.3,4.1],['#d76fb0',.54,5.2]].forEach(([col,rr,a0])=>{c.strokeStyle=col;c.beginPath();c.arc(0,0,R*rr,a0,a0+1.7);c.stroke();});c.fillStyle='#3f6fd0';c.beginPath();c.moveTo(-R*.12,R*.3);c.lineTo(R*.02,-R*.34);c.lineTo(R*.2,R*.3);c.lineTo(R*.06,R*.3);c.lineTo(R*.02,R*.02);c.lineTo(-R*.02,R*.3);c.closePath();c.fill();},{px:160});
  // Front face: only the small vertical wordmark beside the bracket.
  decal(g,'GIGABYTE  A.I. TOP',.62,[-L/2+.13,0,D/2-.03],'#6f747c',.05,[0,0,Math.PI/2]);
  // Top spine: RADEON, the lit AI TOP mark, GIGABYTE, then the 16-pin socket
  // set flush into the tail corner.
  const top=H/2-.009;
  decal(g,'RADEON',.46,[-.9,top,.01],'#3b3f45',.07,[-Math.PI/2,0,0]);
  decal(g,'AI TOP',.42,[.02,top,.01],'#f4f8ff',.085,[-Math.PI/2,0,0],.55);
  decal(g,'GIGABYTE',.5,[.72,top,.01],'#3b3f45',.07,[-Math.PI/2,0,0]);
  socket(g,[L/2-.17,H/2-.062,-.06],16).rotation.x=-Math.PI/2;
  // Back: silver plate, raised AMD RADEON square, contour lines, and a round
  // vent whose swept guard spokes sit over the recessed blower housing.
  const back=group(g,'silver backplate',[0,0,-D/2+.022]);back.rotation.y=Math.PI;
  art(back,1.5,H-.14,[-.15,0,.012],(c,w,h)=>{
    c.strokeStyle='rgba(120,126,134,.55)';c.lineWidth=h*.008;
    for(let i=0;i<9;i++){c.beginPath();c.ellipse(w*.52,h*(.5+.03*i),w*(.1+.055*i),h*(.16+.07*i),-.25,0,Math.PI*2);c.stroke();}
  },{px:256});
  box(back,[.6,.6,.014],[.3,.02,.012],m.silver,.05);
  decal(back,'AMD RADEON',.4,[.3,.12,.022],'#30343a',.07);
  art(back,.34,.11,[.3,-.14,.022],(c,w,h)=>{c.fillStyle='#f3f3f0';c.fillRect(0,0,w,h);c.fillStyle='#22262b';for(let x=w*.08;x<w*.6;x+=w*.035)c.fillRect(x,h*.2,w*.014,h*.6);c.fillRect(w*.66,h*.25,w*.26,h*.14);c.fillRect(w*.66,h*.55,w*.2,h*.14);},{px:96});
  disc(back,.37,.006,[-fx,0,.006],m.fin);
  for(const r of [.2,.3])ring(back,r,.007,[-fx,0,.01],m.finDark);
  ring(back,.37,.014,[-fx,0,.016],m.silver);
  for(let i=0;i<5;i++){
    const a0=i*Math.PI*2/5+.3,left=[],right=[];
    for(let k=0;k<=5;k++){const t=k/5,r=.11+.26*t,a=a0+.8*t,w=.034+.012*t,cx=Math.cos(a)*r,cy=Math.sin(a)*r,nx=-Math.sin(a),ny=Math.cos(a);left.push([cx+nx*w,cy+ny*w]);right.unshift([cx-nx*w,cy-ny*w]);}
    extrude(back,[...left,...right],[],.01,m.silver,[-fx,0,.012],.003);
  }
  disc(back,.13,.016,[-fx,0,.02],m.silver);decal(back,'AI TOP',.18,[-fx,0,.03],'#4f545b',.05);
  decal(back,'GIGABYTE',.5,[L/2-.14,0,.014],'#f1f3f5',.06,[0,0,Math.PI/2]);
  screws(back,[[-L/2+.12,-H/2+.1,.014],[L/2-.3,-H/2+.1,.014],[-L/2+.12,H/2-.1,.014],[L/2-.3,H/2-.1,.014]],.014);
  ioBracket(g,-L/2-.012,1.2,D,4,'blower',-.005);
  return g;
}
function tuf3090(){
  // ASUS TUF Gaming RTX 3090 OC: 299.9 x 126.9 x 51.7 mm.
  const L=2.999,H=1.269,D=.517,g=group(null,'TUF RTX 3090');
  // The PCB stops short of the tail, where the cooler overhangs it.
  box(g,[L-.74,H-.08,.025],[-.33,0,-D*.28],m.pcb,.008);
  edgeConnector(g,-.35,-H/2-.025,-D*.28,.9);
  // Fins sit behind the fans' dark wells, so none show between the blades.
  finStack(g,2.2,H-.36,.2,[-.26,.07,-.03],m.finMid);
  finStack(g,.52,H-.36,.14,[L/2-.4,.07,0],m.finMid);
  // Components on the strip of PCB that shows below the shroud.
  const strip=[];for(let i=0;i<14;i++)strip.push([-1.3+i*.15,-.535,-D*.28+.02]);
  instances(g,new T.BoxGeometry(.06,.045,.02),m.chip,strip);
  // Gunmetal shroud over the upper 108 mm of the card; a strip of PCB shows
  // below it. Three near-touching 11-blade fans fill most of its height, with
  // the fins visible between the blades.
  const centers=[-.972,0,.972],r=.47,yb=-.46,yt=H/2-.03,fy=.07;
  const pts=[[-L/2+.14,yb],[L/2-.2,yb],[L/2-.03,yb+.17],[L/2-.03,yt-.17],[L/2-.2,yt],[-L/2+.14,yt],[-L/2+.03,yt-.11],[-L/2+.03,yb+.11]];
  extrude(g,pts,centers.map(x=>[x,fy,r+.01]),.055,m.tuf,[0,0,D/2-.068]);
  const asusHub=(f,radius)=>{disc(f,radius*.24,.008,[0,0,.076],m.steel);decal(f,'ASUS',radius*.34,[0,0,.082],'#2b2e33',radius*.1,[0,0,Math.PI]);};
  centers.forEach((x,i)=>axialFan(g,r,[x,fy,D/2-.085],i===1?asusHub:hubEmblem(tufEmblem('#3a3d42')),i===1,11));
  // Faceted relief in a lighter brushed tone: chamfer plates at the corners
  // and angular bridges between the fans.
  const facet=points=>extrude(g,points,[],.006,m.tufFacet,[0,0,D/2-.008],.002);
  for(const sx of [-1,1])for(const sy of [-1,1]){
    const e=sy>0?yt:yb;
    facet([[sx*(L/2-.07),e-sy*.29],[sx*(L/2-.07),e-sy*.18],[sx*(L/2-.21),e-sy*.04],[sx*(L/2-.44),e-sy*.04]]);
    facet([[sx*.486-.27,e-sy*.04],[sx*.486+.27,e-sy*.04],[sx*.486+.05,e-sy*.31],[sx*.486-.05,e-sy*.31]]);
  }
  // Slanted vents: seven along the lower edge, three by the wordmark tab.
  const slashes=[];for(let i=0;i<7;i++)slashes.push([-.9+i*.13,yb+.035,D/2+.003]);
  for(let i=0;i<3;i++)slashes.push([.12+i*.09,yt-.045,D/2+.003]);
  instances(g,new T.BoxGeometry(.03,.07,.004),m.black,slashes,[0,0,-.6]);
  // The wordmark tab stands a little proud of the top edge above the third fan.
  box(g,[1.0,.13,.03],[.82,yt+.015,D/2-.03],m.tuf,.02);
  decal(g,'TUF GAMING',.5,[.82,yt+.02,D/2-.012],'#f0f1f2',.06);
  box(g,[L-.36,.06,.2],[0,yb+.03,.12],m.tuf,.012);
  // Top spine: the shroud wraps over the bracket-side half and carries the
  // wordmark; fins and heatpipes show behind it; power and the lit badge sit
  // towards the tail.
  box(g,[L*.56,.06,D*.56],[-L*.2,H/2-.03,.075],m.shroud,.012);
  decal(g,'GEFORCE RTX',1.2,[-L*.2,H/2+.002,.075],'#eceef0',.13,[-Math.PI/2,0,0]);
  for(const z of [-.16,-.1,-.04])tube(g,[[-L/2+.25,H/2-.035,z],[0,H/2-.02,z],[L/2-.3,H/2-.035,z]],.022,m.steel);
  socket(g,[.42,H/2+.02,-.16]).rotation.x=-Math.PI/2;socket(g,[.64,H/2+.02,-.16]).rotation.x=-Math.PI/2;
  const badge=group(g,'lit TUF badge',[L/2-.34,H/2-.005,.09]);badge.rotation.x=-Math.PI/2;
  extrude(badge,[[-.24,-.12],[.2,-.12],[.28,.12],[-.24,.12]],[],.02,m.black,[0,0,0],.006);
  art(badge,.2,.2,[.0,0,.03],tufEmblem('#b65cff'),{px:128,glow:.7});
  // Tail: dark slashed flank on the shroud side, recessed fin edges, and the
  // heatpipe tips in the half next to the backplate.
  for(const y of [-H/2+.09,H/2-.09])box(g,[.08,.16,D*.8],[L/2-.045,y,.01],m.shroud,.015);
  box(g,[.07,H-.3,D*.34],[L/2-.05,0,.14],m.shroud,.012);
  const flank=[];for(let i=0;i<5;i++)flank.push([L/2-.012,-.34+i*.17,.14]);
  instances(g,new T.BoxGeometry(.006,.13,.03),m.black,flank,[.5,0,0]);
  box(g,[.02,H-.3,D*.4],[L/2-.085,0,-.07],m.finDark);
  const tailFins=[];for(let y=-H/2+.2;y<=H/2-.2;y+=.045)tailFins.push([L/2-.072,y,-.07]);
  instances(g,new T.BoxGeometry(.012,.012,D*.38),m.fin,tailFins);
  for(let i=0;i<6;i++)pin(g,.026,.05,[L/2-.02,-.36+i*.145,-.12]);
  for(let i=0;i<5;i++)pin(g,.026,.05,[L/2-.02,-.29+i*.145,-.03]);
  // Backplate: an open capacitor window inside a retention ring whose four
  // arms run outwards, two tail windows over recessed fins, the vertical
  // wordmark at the bracket end.
  const back=group(g,'backplate',[0,0,-D/2+.036]);back.rotation.y=Math.PI;
  const sq=.2,win=[[-L/2+.12,.05],[-L/2+.6,.05],[-L/2+.6,H/2-.12],[-L/2+.12,H/2-.12]],win2=[[-L/2+.12,-H/2+.12],[-L/2+.5,-H/2+.12],[-L/2+.68,-.05],[-L/2+.12,-.05]];
  const plate=extrude(back,roundRect(L-.06,H-.07,.035),[[[.36-sq,-sq],[.36+sq,-sq],[.36+sq,sq],[.36-sq,sq]],win,win2],.02,m.backplate,[0,0,0],.005);
  plate.name='backplate';
  box(back,[.42,.42,.008],[.36,0,-.008],m.pcb);
  const caps=[],smalls=[];
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)caps.push([.36+(i-1.5)*.075,(j-1)*.095,.002]);
  for(let i=0;i<5;i++)for(const y of [-.16,.16])smalls.push([.36+(i-2)*.07,y,.0]);
  instances(back,new T.BoxGeometry(.05,.065,.012),m.gold,caps);
  instances(back,new T.BoxGeometry(.03,.02,.008),m.fin,smalls);
  extrude(back,[[-.26,-.26],[.26,-.26],[.26,.26],[-.26,.26]],[[[-.2,-.2],[.2,-.2],[.2,.2],[-.2,.2]]],.014,m.steel,[.36,0,.02],.003);
  for(const sx of [-1,1])for(const sy of [-1,1]){const arm=box(back,[.36,.065,.014],[.36+sx*.385,sy*.385,.027],m.steel,.012);arm.rotation.z=sx*sy>0?Math.PI/4:-Math.PI/4;}
  // Recessed fins seen through the tail windows: bright edges over a dark gap.
  box(g,[.6,H-.22,.02],[L/2-.42,0,-.1],m.cavity);
  const windowFins=[];for(let x=L/2-.69;x<=L/2-.13;x+=.04)windowFins.push([x,0,-.118]);
  instances(g,new T.BoxGeometry(.007,H-.24,.012),m.fin,windowFins);
  decal(back,'GEFORCE RTX',1.02,[L/2-.2,0,.03],'#f0f2f3',.15,[0,0,Math.PI/2]);
  decal(back,'TUF GAMING',.6,[-.55,.2,.03],'#e4e6e8',.075,[0,0,-.72]);
  screws(back,[[-L/2+.1,-H/2+.1,.03],[L/2-.4,-H/2+.1,.03],[-L/2+.1,H/2-.08,.03],[L/2-.4,H/2-.1,.03],[.9,-.45,.03],[-.2,.45,.03]],.016);
  ioBracket(g,-L/2-.015,1.2,D,5,'ports',-.085);
  for(let i=0;i<4;i++)tube(g,[[-L/2+.12,-.35+i*.15,-.02],[-L/2+.03,-.36+i*.15,.05],[-L/2+.14,-.36+i*.15,.13]],.024,m.steel);
  return g;
}
function zotac5070(){
  // Twin Edge OC, ZT-B50700H-10P: 241.5 x 120.1 x 40.6 mm.
  // Separate geometry: the compact striped shroud is not a shortened TUF cooler.
  const g=group(null,'ZOTAC GAMING RTX 5070 Twin Edge OC'),L=2.415,H=1.201,D=.406;
  const outline=[[-1.19,-.46],[-1.08,-.56],[1.05,-.56],[1.18,-.43],[1.18,.43],[1.05,.56],[-1.08,.56],[-1.19,.45]];
  // The short PCB leaves the tail heatsink visible through the backplate vent.
  box(g,[1.48,1.02,.023],[-.40,-.015,-.14],m.pcb,.01);
  edgeConnector(g,-.32,-H/2+.025,-.14,.86);
  group(g,'card-edge-seat',[-.32,-H/2+.025,-.14]);
  finStack(g,2.25,.97,.15,[0,0,-.05],m.finDark);
  // Ribs run one way above the diagonal band and the other way below it.
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle='#4a4d51';c.fillRect(0,0,1024,512);
  const band=x=>512-(x-390)*512/250;                 // the band's centre line, bottom-left to top-right
  c.lineWidth=3;c.strokeStyle='#23262a';
  c.save();c.beginPath();c.moveTo(0,0);c.lineTo(640-40,0);c.lineTo(390-40,512);c.lineTo(0,512);c.closePath();c.clip();
  for(let i=-520;i<1550;i+=15){c.beginPath();c.moveTo(i,0);c.lineTo(i+512,512);c.stroke();}c.restore();
  c.save();c.beginPath();c.moveTo(640+40,0);c.lineTo(1024,0);c.lineTo(1024,512);c.lineTo(390+40,512);c.closePath();c.clip();
  for(let i=-520;i<1550;i+=15){c.beginPath();c.moveTo(i+512,0);c.lineTo(i,512);c.stroke();}c.restore();
  c.strokeStyle='#8b9196';c.lineWidth=3;for(const d of [-40,40]){c.beginPath();c.moveTo(390+d,512);c.lineTo(640+d,0);c.stroke();}
  void band;
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  // Extrude UVs are in scene units. Match the 2.4 x 1.12 front envelope.
  map.repeat.set(1/2.4,1/1.12);map.offset.set(.5,.5);
  const shroud=new T.MeshStandardMaterial({map,bumpMap:map,bumpScale:.006,metalness:.48,roughness:.42});
  const fr=.49;
  extrude(g,outline,[[-.57,0,fr+.006],[.54,0,fr+.006]],.05,shroud,[0,0,.14],.009);
  for(const x of [-.57,.54])axialFan(g,fr,[x,0,.118],hubEmblem(zotacEmblem('#f2f4f5',true),.4),false,9,true);
  for(const y of [-.55,.55])box(g,[2.15,.055,.22],[0,y,.07],m.graphite,.018);
  // Backplate: black tail frame with an open X-brace, grey plate with the
  // diagonal wordmark and the outlined emblem.
  const back=group(g,'vented metal backplate',[0,0,-D/2+.03]);back.rotation.y=Math.PI;
  // The tail opening is split by an X of integral webs; beside it a field of
  // slanted slots cut through the plate.
  const plateOutline=[[-1.16,-.5],[-1.16,.42],[-1.04,.55],[1.08,.55],[1.18,.43],[1.18,-.47],[1.08,-.55],[-1.08,-.55]];
  const openings=[[[-.95,.37],[-.43,.37],[-.69,.08]],[[-.95,-.38],[-.44,-.38],[-.69,-.08]],[[-1.02,-.3],[-1.02,.29],[-.78,0]],[[-.36,-.3],[-.355,.29],[-.6,0]]];
  for(let row=0;row<5;row++)for(let col=0;col<6;col++){
    const cx=-.26+col*.085+row*.02,cy=-.1+row*.1,a=-.95,dx=Math.cos(a)*.055,dy=Math.sin(a)*.055,nx=-Math.sin(a)*.011,ny=Math.cos(a)*.011;
    openings.push([[cx-dx-nx,cy-dy-ny],[cx+dx-nx,cy+dy-ny],[cx+dx+nx,cy+dy+ny],[cx-dx+nx,cy-dy+ny]]);
  }
  extrude(back,plateOutline,openings,.018,m.graphite,[0,0,0],.004);
  box(back,[.16,1.0,.008],[-1.1,0,.02],m.black,.02);
  decal(back,'GEFORCE RTX',.9,[.48,.0,.025],'#9aa0a5',.115,[0,0,Math.PI*1.27]);
  art(back,.46,.46,[.9,-.02,.025],zotacEmblem('#9aa0a5'),{px:160});
  decal(back,'ZOTAC GAMING',.6,[-1.1,0,.026],'#e8eaec',.05,[0,0,Math.PI/2]);
  screws(back,[[-1.08,-.47,.03],[-1.08,.46,.03],[1.07,-.44,.03],[1.07,.43,.03],[-.01,-.34,.03],[.4,.34,.03]],.019);
  // Top spine: wordmark over a silver accent bar, then the lit ZOTAC GAMING
  // and emblem towards the tail (lit white in the owner's rack photo).
  const label=group(g,'top branding',[0,H/2-.035,0]);label.rotation.x=-Math.PI/2;
  box(label,[.98,.03,.012],[-.55,-.075,.002],m.silver);
  decal(label,'GEFORCE RTX',.94,[-.55,0,.01],'#d0d4d7',.105);
  decal(label,'ZOTAC GAMING',.5,[.62,0,.01],'#ffffff',.07,[0,0,0],1.3);
  art(label,.13,.13,[1.0,0,.01],zotacEmblem('#ffffff',true),{px:96,glow:1.3});
  decal(g,'ZOTAC GAMING',.4,[-.015,0,.2],'#b6bbbf',.055,[0,0,1.117]);
  socket(g,[.27,H/2-.035,-.12],16).rotation.x=-Math.PI/2;
  ioBracket(g,-L/2+.015,1.2,D,4,'ports',-.05);
  return g;
}
export function egpuDock(){
  // AOOSTAR AG03 photographs constrain the shape; dock dimensions are approximate.
  // Silver body with a black top. The card's bracket end has the retention post,
  // thumbscrew and vent slots; the tail end has the supply's dark inset module
  // with its small fan and the mains inlet.
  const g=group(null,'AOOSTAR AG03 with ZOTAC Twin Edge OC'),TOP=.68,SEAT=TOP+.05;
  box(g,[2.30,.64,1.05],[0,.36,0],m.dock,.08);
  box(g,[2.20,.016,.95],[0,TOP+.002,0],m.black,.05);
  for(const x of [-.95,.95])for(const z of [-.38,.38])box(g,[.17,.06,.17],[x,.03,z],m.rubber,.04);
  const slot=group(g,'AG03 PCIe slot',[-.32,SEAT,-.14]);
  box(slot,[.94,.065,.095],[0,0,0],m.black,.012);box(slot,[.87,.015,.036],[0,.035,0],m.rubber,.004);
  box(slot,[.075,.10,.12],[.51,.035,0],m.dark,.012);
  const card=gpu('5070');card.name='docked Zotac RTX 5070';card.position.y=SEAT+1.201/2-.025;g.add(card);
  group(slot,'dock-card-seat');
  // Positions below are measured off AOOSTAR's front-on and rear-on pictures
  // (body 228 x 64 mm, scaled from the 89 mm slot).
  // Bracket end (-X): knurled thumbscrew on a short stainless hook just behind
  // the card's bracket, and vent slots low on the end face.
  box(g,[.03,.2,.16],[-1.165,.6,-.3],m.steel,.008);
  pin(g,.04,.06,[-1.19,.535,-.3],m.black);
  pin(g,.085,.07,[-1.25,.535,-.3],m.steel);pin(g,.05,.02,[-1.295,.535,-.3],m.silver);
  const bracketEnd=group(g,'bracket-end vents',[-1.153,.26,0]);bracketEnd.rotation.y=-Math.PI/2;
  for(let row=0;row<4;row++)for(const x of [-.2,.2])box(bracketEnd,[.3,.035,.008],[x,-.12+row*.08,0],m.black,.015);
  // Front, from the bracket end: power button, OCuLink, two Thunderbolt 5
  // ports in a high row, then the outlined 03 over the wordmark. The owner's
  // unit has yellow warning stickers under the ports.
  disc(g,.066,.02,[-.695,.52,.524],m.steel);ring(g,.046,.005,[-.695,.52,.536],m.graphite);ring(g,.026,.004,[-.695,.52,.536],m.graphite);
  const port=group(g,'dock-oculink',[-.24,.575,.526]);
  box(port,[.15,.055,.012],[0,0,0],m.steel,.01);box(port,[.13,.032,.014],[0,0,.002],m.cavity,.006);group(port,'cable-seat',[0,0,.02]);
  const warning=(c,w,h)=>{c.fillStyle='#15171a';c.fillRect(0,0,w,h);c.fillStyle='#e8c21e';c.fillRect(w*.06,h*.2,w*.5,h*.14);c.fillRect(w*.06,h*.5,w*.7,h*.1);c.fillRect(w*.06,h*.72,w*.4,h*.1);c.beginPath();c.moveTo(w*.86,h*.25);c.lineTo(w*.96,h*.8);c.lineTo(w*.76,h*.8);c.closePath();c.fill();};
  art(g,.2,.07,[-.2,.47,.5265],warning,{px:64});
  for(const x of [.27,.47]){box(g,[.1,.035,.012],[x,.545,.526],m.steel,.015);box(g,[.078,.016,.014],[x,.545,.528],m.cavity,.007);}
  art(g,.3,.07,[.37,.455,.5265],warning,{px:64});
  art(g,.27,.23,[.82,.285,.5265],(c,w,h)=>{c.strokeStyle='#6a6f75';c.lineWidth=h*.035;c.lineJoin='round';c.font=`700 ${h*.92}px Arial, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.strokeText('03',w/2,h*.55);},{px:200});
  decal(g,'AOOSTAR',.26,[.82,.135,.5265],'#6a6f75',.032);
  // Tail end (+X): dark inset module with the small supply fan towards the
  // rear, and the mains inlet with its cord-retaining clip towards the front.
  const tail=group(g,'integrated 800 W PSU',[1.151,.36,0]);tail.rotation.y=Math.PI/2;
  box(tail,[.9,.5,.01],[0,0,-.004],m.black,.05);
  box(tail,[.4,.4,.02],[.22,0,.004],m.black,.02);
  axialFan(tail,.17,[.22,0,.012],'',false,7,true);
  disc(tail,.07,.012,[.22,0,.03],m.white);
  for(const r of [.09,.14,.19])ring(tail,r,.005,[.22,0,.04],m.steel);
  for(const a of [0,Math.PI/2]){const bar=box(tail,[.4,.008,.008],[.22,0,.041],m.steel);bar.rotation.z=a;}
  box(tail,[.28,.22,.02],[-.2,-.04,.004],m.rubber,.03);
  for(const x of [-.26,-.2,-.14])box(tail,[.02,.06,.012],[x,x===-.2?-.01:-.06,.016],m.steel);
  tube(tail,[[-.34,-.1,.01],[-.36,-.1,.13],[-.04,-.1,.13],[-.06,-.1,.01]],.008,m.steel);
  // Rear: three recessed 8-pin outputs towards the tail; nothing else on that wall.
  const back=group(g,'dock power outputs',[0,0,-.535]);back.rotation.y=Math.PI;
  for(let i=0;i<3;i++){socket(back,[-.766+i*.214,.52,-.052]);box(back,[.09,.03,.02],[-.766+i*.214,.455,-.002],m.cavity);}
  // Local two-8-pin adapter: power stays within this dock/card assembly.
  const powerEnd=card.getObjectByName('power-lead');
  g.updateMatrixWorld(true);const target=powerEnd.getWorldPosition(new T.Vector3());
  for(let i=0;i<2;i++){
    box(g,[.17,.1,.1],[.766-i*.214,.52,-.57],m.black,.01);
    tube(g,[[.766-i*.214,.52,-.6],[.7-i*.12,.9,-.66],[.46-i*.06,TOP+1.36,-.58],[.3,TOP+1.46,-.14],target.toArray()],.025);
  }
  return g;
}
function handle(parent,z,y,invert=false){
  const s=new T.Shape();s.moveTo(-.69,0);s.lineTo(-.69,.14);s.quadraticCurveTo(-.69,.3,-.54,.3);s.lineTo(.54,.3);s.quadraticCurveTo(.69,.3,.69,.14);s.lineTo(.69,0);s.lineTo(.59,0);s.lineTo(.59,.14);s.quadraticCurveTo(.59,.2,.54,.2);s.lineTo(-.54,.2);s.quadraticCurveTo(-.59,.2,-.59,.14);s.lineTo(-.59,0);s.closePath();
  const o=mesh(parent,new T.ExtrudeGeometry(s,{depth:.1,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:3,steps:1}),m.black,[0,y,z]);if(invert)o.rotation.z=Math.PI;
}
// Outline of the radiator bracket's fan opening: two 115 mm circles 120 mm
// apart, joined through a wide waist. Each long side dips in by about 9 mm at
// the middle, where the pairs of fan screws sit.
function twinLobe(R=.575,c=.6,dip=.095){
  const flat=.09,ramp=.36,edge=x=>{const u=Math.abs(x);return R-dip*(u<flat?1:u<ramp?.5*(1+Math.cos(Math.PI*(u-flat)/(ramp-flat))):0);};
  const pts=[],arc=(cx,a0)=>{for(let i=0;i<16;i++){const a=a0+i/16*Math.PI/2;pts.push([cx+R*Math.cos(a),R*Math.sin(a)]);}};
  arc(c,0);for(let i=0;i<40;i++){const x=c-2*c*i/40;pts.push([x,edge(x)]);}
  arc(-c,Math.PI/2);arc(-c,Math.PI);for(let i=0;i<40;i++){const x=-c+2*c*i/40;pts.push([x,-edge(x)]);}
  arc(c,Math.PI*1.5);return pts;
}
// A square-framed case fan: frame, blades, and four struts carrying the hub
// label. Local +Z is the strut side.
function caseFan(parent,size,position,rotationX=0,blades=7){
  const f=group(parent,'case-fan',position),h=size/2;f.rotation.x=rotationX;
  extrude(f,roundRect(size,size,.07),[[0,0,h-.035]],.21,m.dark,[0,0,-.105],.012);
  axialFan(f,h-.06,[0,0,-.02],'',false,blades);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.5,s=box(f,[h*.78,.022,.012],[Math.cos(a)*h*.6,Math.sin(a)*h*.6,.1],m.dark);s.rotation.z=a;}
  disc(f,h*.3,.012,[0,0,.1],m.black);
  decal(f,'GMKtec',h*.4,[0,0,.108],'#aab0b5',h*.1);
  return f;
}
// Internal SFX supply (125 x 63.5 x 100 mm, 850 W). It stands in the top
// front corner with its 63.5 mm side along the case length: mains inlet up,
// leads leaving downwards, rating label towards the left panel (it shows
// through the bracket's oblong slot). The face towards the board is plain in
// the owner's photo, so the fan is taken to face the front shell.
function internalPSU(parent,position){
  const W=1.25,H=1.0,D=.62,psu=group(parent,'internal-psu',position);
  box(psu,[W,H,D-.09],[0,0,-.045],m.psu,.02);
  extrude(psu,roundRect(W,H,.02),[[0,0,.43]],.07,m.psu,[0,0,D/2-.082],.008);
  const face=group(psu,'psu-fan-face',[0,0,D/2-.05]);
  axialFan(face,.4,[0,0,0],'',false,7);
  for(const r of [.13,.24,.34,.43])ring(face,r,.007,[0,0,.05],m.graphite);
  for(const a of [Math.PI/4,-Math.PI/4]){const spoke=box(face,[.88,.016,.012],[0,0,.05],m.graphite);spoke.rotation.z=a;}
  screws(face,[[-.54,-.42,.05],[.54,-.42,.05],[-.54,.42,.05],[.54,.42,.05]],.02);
  // Top end: honeycomb exhaust and the mains inlet with its right-angle plug.
  art(psu,W-.1,D-.1,[0,H/2+.002,0],(c,w,h)=>{c.fillStyle='#22252a';c.fillRect(0,0,w,h);c.fillStyle='#050506';const s=h/8;
    for(let y=s*.8,row=0;y<h-s*.5;y+=s*.86,row++)for(let x=w*.36+(row%2)*s*.5;x<w-s*.5;x+=s){c.beginPath();c.arc(x,y,s*.38,0,Math.PI*2);c.fill();}},{rotation:[-Math.PI/2,0,0],px:160});
  box(psu,[.34,.09,.3],[-.4,H/2+.045,0],m.black,.02);
  // Bottom end: the leads leave downwards.
  box(psu,[.9,.06,.3],[0,-H/2-.03,0],m.rubber,.015);
  // Left side: the green rating label, towards the front of the face.
  const label=art(psu,.32,.84,[-W/2-.003,-.04,.11],(c,w,h)=>{c.fillStyle='#1a6c38';c.fillRect(0,0,w,h);c.fillStyle='#111214';c.fillRect(w*.62,0,w*.38,h);
    c.fillStyle='#d8362b';c.beginPath();c.moveTo(w*.81,h*.33);c.lineTo(w*.95,h*.46);c.lineTo(w*.67,h*.46);c.closePath();c.fill();
    c.fillStyle='#9ea3a8';for(let i=0;i<6;i++)c.fillRect(w*.69,h*(.5+i*.03),w*.24,h*.01);
    c.translate(w*.31,h*.5);c.rotate(Math.PI/2);c.fillStyle='#f2f4f1';c.strokeStyle='#f2f4f1';c.textAlign='center';c.textBaseline='middle';
    c.font=`700 ${w*.26}px Arial, sans-serif`;c.fillText('CE',-h*.4,0);c.fillText('CB',-h*.11,0);
    c.lineWidth=w*.025;c.beginPath();c.arc(-h*.255,0,w*.13,0,Math.PI*2);c.stroke();
    c.font=`700 ${w*.15}px Arial, sans-serif`;c.fillText('UK CA',h*.08,0);
    c.font=`600 ${w*.085}px Arial, sans-serif`;c.fillText('MADE IN CHINA',h*.33,0);},{rotation:[0,-Math.PI/2,0],px:420});
  label.material.roughness=.95;label.material.metalness=0;
  decal(psu,'850 W',.34,[.3,.3,-D/2-.003],'#8d9399',.085,[0,Math.PI,0]);
  return psu;
}
function motherboard(parent,moving=null){
  // The board is on the right side wall; its component side faces the left
  // panel, the one taken off in the rack. Board x runs towards the front, y up
  // the case and z off the board. Laid out from the owner's photos of the
  // board and a reviewer's photo of the open case: ports, a tall black VRM
  // heatsink, the pump block, two upright SO-DIMMs and the 24-pin input across
  // the upper board; M.2_1, the x16 slot, M.2_2 and the x1 slot below, all
  // starting at the rear edge.
  const g=group(parent,'motherboard',[.62,1.24,-.45]);g.rotation.y=-Math.PI/2;
  box(g,[2.2,2.12,.035],[-.1,0,0],m.pcb,.015);
  // Geometric traces and solder points, drawn once and reused as a surface map.
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const c=canvas.getContext('2d');
  c.fillStyle='#131819';c.fillRect(0,0,1024,1024);c.strokeStyle='#303a37';c.lineWidth=1;
  for(let i=0;i<130;i++){const x=(i*97)%1000,y=(i*63)%1000;c.beginPath();c.moveTo(x,y);c.lineTo(x+28,y);c.lineTo(x+60,y+32);c.lineTo(x+60,y+100);c.stroke();c.fillStyle='#8f8975';c.fillRect(x,y,3,3);}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  plane(g,2.19,2.11,new T.MeshStandardMaterial({map,roughness:.6,metalness:.35}),[-.1,0,.019]);
  // Parts that lift off the board in the studio explosion; static in the rack.
  const part=(name,position,offset,stage)=>moving?moving(name,position,offset,stage,g):group(g,name,position);
  const post=(r,h)=>{const geo=new T.CylinderGeometry(r,r,h,16);geo.rotateX(Math.PI/2);return geo;};
  const tag=(text,w,h,position,upright=false)=>art(g,w,h,position,(k,cw,ch)=>{k.fillStyle='#f1f1ee';k.fillRect(0,0,cw,ch);k.fillStyle='#22262b';k.textAlign='center';k.textBaseline='middle';
    if(upright){k.translate(cw/2,ch/2);k.rotate(-Math.PI/2);k.font=`600 ${cw*.56}px Arial, sans-serif`;k.fillText(text,0,0);}
    else{k.font=`600 ${ch*.6}px Arial, sans-serif`;k.fillText(text,cw/2,ch/2);}},{px:upright?220:56});
  // Rear I/O: shielded port housings along the rear edge, audio jacks last.
  for(const [y,h,z] of [[.86,.15,.07],[.68,.15,.07],[.53,.09,.045],[.37,.15,.16],[.14,.18,.27],[-.09,.18,.27],[-.29,.13,.13]])
    {box(g,[.26,h,z],[-1.06,y,.018+z/2],y<-.2?m.chip:m.steel,.008);if(y>-.2)box(g,[.09,h*.8,z*.5],[-.895,y,.018+z*.25],m.steel,.006);}
  // VRM: a tall black heatsink between the ports and the CPU, a short one above.
  box(g,[.42,1.0,.05],[-.65,.44,.043],m.black,.008);finStack(g,.4,1.0,.17,[-.65,.44,.15],m.backplate);
  box(g,[.52,.14,.04],[-.16,.97,.038],m.black,.008);instances(g,new T.BoxGeometry(.5,.009,.12),m.backplate,[-.054,-.027,0,.027,.054].map(y=>[-.16,.97+y,.115]));
  // Mobile-on-desktop CPU: soldered package under the pump block, which is a
  // rounded square with a lit outline on its cap. Package lid is illustrative.
  const CPU=[-.05,.45];
  box(g,[.6,.6,.025],[CPU[0],CPU[1],.03],standard(0x223a2e,.2,.6),.008);
  box(g,[.36,.36,.03],[CPU[0],CPU[1],.055],m.steel,.012);decal(g,'RYZEN 9',.25,[CPU[0],CPU[1],.072],'#4b5156',.05);
  const pump=part('CPU cooling block',[CPU[0],CPU[1],.07],[0,0,.8],[.35,.85]);
  box(pump,[.5,.5,.03],[0,0,.015],m.copper,.008);
  for(const a of [Math.PI/4,-Math.PI/4]){const arm=box(pump,[1.12,.15,.02],[0,0,.04],m.steel,.008);arm.rotation.z=a;}
  const springs=[];for(const sx of [-1,1])for(const sy of [-1,1])springs.push([sx*.37,sy*.37,.075]);
  instances(pump,post(.04,.09),m.steel,springs);
  box(pump,[.7,.7,.36],[0,0,.23],m.graphite,.12);
  art(pump,.42,.42,[0,0,.413],(k,w,h)=>{k.lineWidth=h*.035;k.strokeStyle='#e9ecee';const r=h*.2,a=h*.1,b=h*.9;k.beginPath();k.moveTo(a+r,a);k.arcTo(b,a,b,b,r);k.arcTo(b,b,a,b,r);k.arcTo(a,b,a,a,r);k.arcTo(a,a,b,a,r);k.closePath();
    k.fillStyle='#0b0c0e';k.fill();k.stroke();k.fillStyle='#cfd4d8';k.font=`700 ${h*.15}px Arial, sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillText('GMKtec',w/2,h/2);},{px:256});
  // Hose fittings on the pump's lower side.
  for(const x of [-.14,.1])mesh(pump,new T.CylinderGeometry(.05,.05,.12,16),m.black,[x,-.38,.2]);
  // Two SO-DIMMs standing upright in vertical sockets, long axis down the
  // board, between the pump and the 24-pin input.
  for(let n=0;n<2;n++){
    const x=.565+n*.145,y=.275;
    box(g,[.075,.74,.07],[x,y,.053],m.black,.006);box(g,[.012,.7,.05],[x-.045,y,.06],m.steel);
    for(const e of [-1,1])box(g,[.085,.05,.17],[x,y+e*.385,.1],m.black,.008);
    const ram=part('SO-DIMM',[x,y,.09],[0,0,.75+n*.3],[.45+n*.08,.9+n*.05]);
    box(ram,[.014,.696,.3],[0,0,.15],m.pcb);box(ram,[.016,.66,.02],[0,0,.012],m.gold);
    for(let i=0;i<4;i++)box(ram,[.022,.12,.14],[.014,-.25+i*.165,.17],m.chip);
    art(ram,.16,.5,[-.009,.02,.17],(k,w,h)=>{k.fillStyle='#1b5fc4';k.fillRect(0,0,w,h);k.translate(w/2,h/2);k.rotate(-Math.PI/2);k.fillStyle='#f4f6f8';k.textAlign='center';k.textBaseline='middle';
      k.font=`700 ${w*.34}px Arial, sans-serif`;k.fillText('DDR5 48GB',0,-w*.16);k.font=`600 ${w*.2}px Arial, sans-serif`;k.fillText('SO-DIMM 5600',0,w*.22);},{rotation:[0,-Math.PI/2,0],px:256});
  }
  // 24-pin ATX input at the front edge; USB 3 header and SATA ports below it.
  const atx=group(g,'atx-24pin',[.925,.41,.02]);box(atx,[.1,.52,.13],[0,0,.065],m.black,.006);
  box(g,[.09,.2,.1],[.93,-.02,.07],m.chip,.006);box(g,[.15,.16,.12],[.92,-.44,.078],m.black,.006);
  // Lower board, top to bottom as in the owner's photos: M.2_1 with the SSD
  // under a finned heatsink, the steel-clad PCIe x16 slot, M.2_2 (which holds
  // the M.2-to-OCuLink adapter in this build) and a short PCIe x1 slot.
  const ssd=part('M.2 SSD',[-.52,-.25,.07],[0,0,.3],[.5,.95]);box(ssd,[.8,.22,.03],[0,0,0],m.black,.008);
  const ssdFins=[];for(let y=-.09;y<=.091;y+=.03)ssdFins.push([-.045,y,.028]);
  instances(ssd,new T.BoxGeometry(.69,.012,.03),m.backplate,ssdFins);
  for(const x of [-.26,.19])box(ssd,[.035,.225,.036],[x,0,.03],m.rubber);
  box(ssd,[.09,.22,.012],[.355,0,-.006],m.greenPcb);instances(ssd,post(.03,.02),m.steel,[[.37,0,.012]]);
  art(ssd,.2,.11,[-.035,0,.046],(k,w,h)=>{k.fillStyle='#f1f1ee';k.fillRect(0,0,w,h);k.fillStyle='#22262b';k.font=`600 ${h*.42}px Arial, sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillText('NVMe 2TB',w/2,h/2);},{px:64});
  const socketFrame=group(g,'PCIe socket assembly',[-.45,-.44,.07]);
  // Steel collar round an open contact channel 89 mm long, split by the key
  // into a short rear opening and a long front one; black latch at the front.
  extrude(socketFrame,roundRect(.95,.105,.012),[roundRect(.115,.042,.006,-.3875,0,2),roundRect(.74,.042,.006,.075,0,2)],.092,m.steel,[0,0,-.046],.004);
  box(socketFrame,[.9,.05,.03],[0,0,-.03],m.cavity);
  const contacts=[];for(let x=-.435;x<.44;x+=.02)if(x<-.335||x>-.29)for(const y of [-.017,.017])contacts.push([x,y,-.012]);
  instances(socketFrame,new T.BoxGeometry(.008,.006,.02),m.gold,contacts);
  box(socketFrame,[.13,.115,.1],[.54,0,0],m.black,.01);box(socketFrame,[.06,.125,.15],[.6,0,.025],m.black,.012);
  const slot=group(socketFrame,'motherboard-pcie-slot',[0,0,.05]);slot.rotation.x=Math.PI/2;
  // M.2_2 with the adapter board: the OCuLink receptacle sits near the socket
  // end and the cable leaves along the board, towards the front.
  box(g,[.81,.22,.016],[-.56,-.65,.045],m.black,.006);
  const oculink=group(g,'host-oculink',[-.8,-.65,.085]);
  box(oculink,[.11,.16,.07],[0,0,0],m.steel,.008);box(oculink,[.012,.13,.035],[.056,0,0],m.dark,.004);
  const ocSeat=group(oculink,'cable-seat',[.06,0,0]);ocSeat.rotation.y=Math.PI/2;
  const x1=group(g,'pcie-x1-slot',[-.82,-.85,.06]);
  extrude(x1,roundRect(.3,.09,.008),[roundRect(.105,.036,.004,-.08,0,2),roundRect(.09,.036,.004,.035,0,2)],.08,m.chip,[0,0,-.04],.004);
  box(x1,[.27,.045,.02],[0,0,-.03],m.cavity);
  for(const y of [-.25,-.65])tag('M.2 PCIe 5.0x4',.05,.24,[-.985,y,.02],true);
  tag('GMK_NEO-X1_V01-P',.5,.06,[-.55,-1.0,.02]);
  // Capacitors, chokes, the coin cell and the board controller.
  const caps=[[-.41,.31],[-.41,.23],[-.41,.15],[-.41,.07],[.5,.84],[.62,.9],[.74,.84],[.56,.76],[-1.0,-.4],[-1.0,-.53],[.3,.9]];
  instances(g,post(.032,.075),m.chip,caps.map(([x,y])=>[x,y,.055]));instances(g,post(.029,.004),m.steel,caps.map(([x,y])=>[x,y,.094]));
  for(const [x,y] of [[.33,-.27],[.56,-.27],[.1,.9]])box(g,[.08,.08,.05],[x,y,.043],m.fin,.006);
  instances(g,post(.1,.03),m.steel,[[.72,-.8,.035]]);
  box(g,[.16,.16,.02],[.45,-.62,.03],m.chip);box(g,[.1,.1,.02],[.05,-.84,.03],m.chip);
  screws(g,[[-1.1,-.98,.04],[.9,-.98,.04],[-1.1,.98,.04],[.9,.98,.04]],.025);
  return g;
}
export function host({openSide=false}={}){
  // GMKtec NEO-X1 Pro, 350 x 165 x 265 mm body. Front is +Z, the motherboard
  // side is +X. The left (-X) panel covers the side-mounted radiator and the
  // GPU bay; the rack build runs with that panel off (openSide).
  const root=group(null,'GMKtec NEO-X1 Pro');
  // Studio explosion, staged like GMKtec's render: panels and handles first,
  // then the cooling, supply and board components. stage=[start,end] of t.
  const moves=[];
  function moving(name,pos,offset,stage=[0,1],parent=root){const g=group(parent,name,pos);moves.push({g,start:g.position.clone(),offset:new T.Vector3(...offset),stage});return g;}
  // Open internal frame: corner posts joined by top and bottom rails.
  for(const x of [-.76,.76])for(const z of [-1.64,1.5])box(root,[.06,2.55,.06],[x,1.31,z],m.graphite,.01);
  for(const y of [.08,2.56]){
    for(const x of [-.76,.76])box(root,[.05,.05,3.14],[x,y,-.07],m.graphite,.01);
    for(const z of [-1.64,1.5])box(root,[1.46,.05,.05],[0,y,z],m.graphite,.01);
  }
  const bottom=moving('bottom-panel',[0,.025,-.07],[0,-.42,0],[0,.5]);
  const bp=edgedPanel(bottom,1.61,3.3,[0,0,0],m.panel,'field',false);bp.rotation.x=Math.PI/2;
  // Two full-width U-bar feet, the same section as the carry handles.
  const feet=moving('bottom-handles',[0,0,.07],[0,-.28,0],[.25,.75],bottom);
  handle(feet,1.5,.01,true);handle(feet,-1.6,.01,true);
  const board=motherboard(root,moving);
  // 850 W SFX supply in the top front corner, behind the bracket's oblong slot.
  internalPSU(moving('psu-assembly',[-.035,1.96,1.17],[0,.8,.7],[.4,.95]),[0,0,0]);
  // Five case fans: two 92 mm under the lime top, one 120 mm on the floor
  // below the front of the GPU bay, and two 120 mm on the radiator.
  const topFans=moving('top-fans',[-.05,2.415,-.25],[0,.75,0],[.3,.9]);
  for(const z of [-.46,.46])caseFan(topFans,.92,[0,0,z],Math.PI/2,7);
  caseFan(moving('bottom-fan',[-.05,.2,.6],[0,-.16,0],[.3,.8]),1.2,[0,0,0],-Math.PI/2,9);
  // Side-mounted 240 mm radiator behind the left panel. Positions are measured
  // off a reviewer's photo of the open side: the bracket fills the upper half
  // of the opening, the fan cut-out sits towards the rear and the oblong slot
  // that shows the supply's label towards the front.
  const rad=moving('radiator',[-.62,1.66,-.36],[-.95,0,-.95],[.15,.7]);
  box(rad,[.27,1.2,2.38],[.005,0,-.01],m.black,.01);
  box(rad,[.27,1.22,.14],[.005,0,-1.27],m.dark,.02);
  for(const y of [.35,.12])pin(rad,.045,.1,[.19,y,-1.27],m.black);
  // Black core seen through the cut-out: flat tubes with folded fins between.
  const core=art(rad,2.34,1.16,[-.132,0,-.01],(c,w,h)=>{c.fillStyle='#050506';c.fillRect(0,0,w,h);const p=h/13;
    for(let r=0;r<13;r++){const y=r*p;c.fillStyle='#17191c';c.fillRect(0,y,w,p*.2);c.strokeStyle='#121417';c.lineWidth=1.4;c.beginPath();
      for(let x=0;x<w;x+=p*.3){c.moveTo(x,y+p*.24);c.lineTo(x+p*.15,y+p*.97);c.lineTo(x+p*.3,y+p*.24);}c.stroke();}
  },{rotation:[0,-Math.PI/2,0],px:512});
  core.material.roughness=1;core.material.metalness=0;
  const bracket=group(rad,'radiator-bracket',[-.15,0,0]);bracket.rotation.y=-Math.PI/2;
  extrude(bracket,roundRect(3.05,1.28,.05,.265,0),[twinLobe(),roundRect(.38,.94,.19,1.46,0,10)],.022,m.bracket,[0,0,0],.005);
  // Pressed rim round the slot.
  extrude(bracket,roundRect(.52,1.08,.26,1.46,0,10),[roundRect(.41,.97,.205,1.46,0,10)],.01,m.bracket,[0,0,.024],.006);
  screws(bracket,[[-.075,.525,.03],[.075,.525,.03],[-.075,-.525,.03],[.075,-.525,.03],[1.125,.525,.03],[1.125,-.525,.03],[-1.125,.525,.03],[-1.125,-.525,.03],[1.735,.45,.03],[1.735,-.45,.03]],.022,m.graphite);
  const radFans=moving('radiator-fans',[.265,0,0],[.4,0,0],[.5,1],rad);
  for(const z of [-.6,.6]){const f=group(radFans,'radiator-fan',[0,0,z]);f.rotation.y=Math.PI/2;
    extrude(f,[[-.59,-.59],[.59,-.59],[.59,.59],[-.59,.59]],[[0,0,.54]],.2,m.dark,[0,0,-.1],.015);axialFan(f,.52,[0,0,0]);
  }
  // Mains: the rear inlet feeds the supply through a lead along the top left edge.
  box(root,[.46,.3,.1],[-.26,2.35,-1.655],m.black,.02);
  // Leads and hoses that join parts which separate in the explosion would
  // dangle, so they hide once it opens: the two coolant hoses from the pump to
  // the radiator's rear tank, the mains lead, and the 24-pin lead from the
  // supply's lower end to the board.
  const loose=[
    tube(root,[[.35,1.33,-.64],[.34,1.2,-.72],[.2,1.2,-1.1],[-.02,1.5,-1.5],[-.2,1.9,-1.62],[-.4,2.01,-1.63]],.038),
    tube(root,[[.35,1.33,-.4],[.33,1.14,-.48],[.16,1.1,-1.0],[-.08,1.28,-1.48],[-.22,1.62,-1.62],[-.4,1.78,-1.63]],.038),
    tube(root,[[-.3,2.35,-1.59],[-.55,2.42,-1.42],[-.66,2.47,-1.0],[-.66,2.47,.5],[-.62,2.5,.9],[-.46,2.5,1.03]],.035),
    box(root,[.14,.52,.11],[.425,1.65,.475],m.black,.012),
  ];
  const lead=[[.12,1.4,1.14],[.12,1.18,1.1],[.15,1.02,.86],[.06,1.25,.63],[.22,1.58,.51],[.38,1.65,.478]];
  for(let k=0;k<6;k++){const s=k-2.5;loose.push(tube(root,lead.map(([x,y,z],i)=>{const t=i/(lead.length-1);return [x+s*.05*(1-t),y+s*.08*t,z+(k%2)*.035*Math.sin(Math.PI*t)];}),.03));}
  // Front shell: lighter gunmetal that wraps round both vertical corners.
  const front=moving('front-panel',[0,1.325,1.63],[1.15,0,1.15],[0,.55]);
  box(front,[1.69,2.65,.3],[0,0,0],m.gunmetal,.11);
  gmktecLogo(front,.8,[.05,.5,.152]);
  // The owner's unit carries AMD's orange Ryzen 9 HX3D sticker.
  art(front,.2,.2,[-.55,1.08,.152],(c,w,h)=>{c.fillStyle='#17181a';c.fillRect(0,0,w,h);c.fillStyle='#e8612a';c.fillRect(0,0,w,h*.36);c.fillStyle='#f2f2f0';c.font=`700 ${h*.2}px Arial, sans-serif`;c.textAlign='center';c.fillText('AMD',w/2,h*.27);c.fillText('RYZEN',w/2,h*.62);c.fillStyle='#e8612a';c.fillText('9 HX3D',w/2,h*.88);},{px:128});
  const dots=[];for(let x=-.62;x<=.62;x+=.035)dots.push([x,-.9,.152]);
  instances(front,new T.BoxGeometry(.012,.008,.002),m.graphite,dots);
  disc(front,.074,.025,[-.48,-1.03,.153],m.led);
  ring(front,.031,.003,[-.48,-1.03,.169],m.graphite);
  box(front,[.004,.029,.003],[-.48,-1.002,.172],m.graphite);
  disc(front,.024,.012,[-.24,-1.03,.153],m.steel);disc(front,.017,.016,[-.24,-1.03,.16],m.rubber);
  for(const x of [-.04,.19]){box(front,[.07,.15,.018],[x,-1.03,.151],m.steel,.008);box(front,[.045,.125,.02],[x,-1.03,.161],m.dark,.006);box(front,[.016,.09,.022],[x-.008,-1.03,.164],m.chip);}
  box(front,[.04,.085,.02],[.43,-1.03,.155],m.steel,.018);box(front,[.023,.063,.025],[.43,-1.03,.16],m.dark,.01);
  decal(front,'AUDIO     USB      USB      TYPE-C',.85,[.09,-1.16,.151],'#8b9190',.04);
  // Side panels: darker than the front shell, no visible screws.
  const side=moving('right-panel',[.817,1.325,-.11],[1.05,0,0],[0,.55]);
  const p=edgedPanel(side,3.2,2.6,[0,0,0],m.panel,'right',false);p.rotation.y=Math.PI/2;
  const left=moving('left-panel',[-.817,1.325,-.11],[-1.75,0,-1.75],[0,.55]);
  const lp=edgedPanel(left,3.2,2.6,[0,0,0],m.panel,'left',false);lp.rotation.y=-Math.PI/2;
  left.visible=!openSide;
  // Lime top with a lip that shows along the upper edge of each side.
  const top=moving('lime-top',[0,2.66,-.05],[0,1.5,0],[0,.55]);
  const tp=edgedPanel(top,1.61,3.44,[0,0,0],m.lime,'all',false);tp.rotation.x=-Math.PI/2;
  for(const x of [-.825,.825])box(top,[.04,.1,3.5],[x,-.035,0],m.lime,.012);
  for(const z of [-1.75,1.75])box(top,[1.66,.1,.04],[0,-.035,z],m.lime,.012);
  const topHandles=moving('top-handles',[0,0,0],[0,.5,0],[.3,.8],top);
  handle(topHandles,1.5,.01);handle(topHandles,-1.6,.01);
  // Rear: dark I/O column on the board side, mains inlet over a mesh grille,
  // four slot covers along the bottom.
  const rear=group(root,'rear-io',[0,1.31,-1.72]);rear.rotation.y=Math.PI;
  box(rear,[1.62,2.6,.03],[0,0,0],m.panel,.01);
  box(rear,[.5,1.62,.02],[-.5,.42,.02],m.black,.01);
  decal(rear,'GMKtec',.6,[-.32,.78,.032],'#6f757b',.09,[0,0,-Math.PI/2]);
  for(const [y,w] of [[1.06,.16],[.86,.16],[.7,.08]])box(rear,[w,.07,.03],[-.6,y,.03],m.chip,.01);
  for(const x of [-.66,-.54])box(rear,[.07,.14,.03],[x,.5,.03],m.chip,.008);
  for(const x of [-.66,-.56])box(rear,[.07,.14,.03],[x,.28,.03],standard(0x2d61a4,.3,.5),.008);
  box(rear,[.14,.14,.03],[-.42,.28,.03],m.steel,.01);box(rear,[.1,.09,.032],[-.42,.275,.032],m.black,.006);
  for(const x of [-.64,-.46]){disc(rear,.035,.12,[x,.06,.08],m.brass);disc(rear,.045,.03,[x,.06,.03],m.brass,6);}
  [[0xd77a8a,-.66],[0x7ccf4a,-.56],[0x4a90d9,-.46]].forEach(([color,x])=>disc(rear,.03,.02,[x,-.12,.03],standard(color,.2,.5)));
  box(rear,[.46,.3,.05],[.26,1.04,.03],m.black,.04);
  for(const x of [.16,.26,.36])box(rear,[.03,.08,.02],[x,1.04+(x===.26?.04:-.02),.058],m.steel);
  plane(rear,1.0,1.2,perforatedMaterial(m.black,1.0,1.2,'all'),[.26,.2,.022]);
  for(let i=0;i<4;i++){box(rear,[1.34,.17,.02],[-.02,-.6-i*.2,.02],m.black,.01);plane(rear,1.26,.12,perforatedMaterial(m.graphite,1.26,.12,'all'),[-.02,-.6-i*.2,.034]);}
  box(rear,[.05,.86,.05],[.7,-.9,.04],m.black,.01);pin(rear,.045,.06,[.7,-.62,.09],m.steel).rotation.set(Math.PI/2,0,0);
  const ease=(t,[a,b])=>{const x=T.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
  return {root,pcieSlot:board.getObjectByName('motherboard-pcie-slot'),explode(t){
    for(const {g,start,offset,stage} of moves)g.position.copy(start).addScaledVector(offset,ease(t,stage));
    // Lift the chassis so the bottom panel and feet clear the studio floor.
    root.position.y=.72*ease(t,[0,.5]);for(const o of loose)o.visible=t<.02;
  }};
}
// Shelf heights (centre of each platform). The lower shelf sits above a 1U
// power strip, as in the owner's rack.
export const SHELF = { lower: 1.42, upper: 5.96, thickness: .045 };
export function rack(){
  // TecMojo 12U: 520 W x 512 D x 534 body H; 604 H including casters.
  // Exactly TWO shelves: bottom and top. There is no intermediate shelf.
  const g=group(null,'TecMojo 12U');
  for(const x of [-2.47,2.47])for(const z of [-2.43,2.43]){
    box(g,[.22,5.34,.05],[x,3.37,z],m.dark,.012);box(g,[.05,5.34,.23],[x+(x>0?.09:-.09),3.37,z+(z>0?-.09:.09)],m.dark,.009);
    const holes=[];for(let u=0;u<12;u++)for(const d of [0,.15875,.3175])holes.push([x,.94+u*.4445+d,z+(z>0?.028:-.028)]);
    instances(g,new T.BoxGeometry(.09,.09,.006),m.rubber,holes);
    const labels=group(g,'rack-unit-numbers',[x+(x>0?-.11:.11),0,z+.03]);
    if(z>0)for(let u=0;u<12;u++)decal(labels,String(u+1),.065,[0,1.01+u*.4445,0],'#b4b9bc',.045);
    const wheel=group(g,'caster',[x,.28,z]);disc(wheel,.21,.14,[0,0,0],m.rubber);disc(wheel,.10,.15,[0,0,0],m.steel);box(wheel,[.11,.34,.20],[0,.2,0],m.graphite,.02);box(wheel,[.3,.045,.32],[0,.43,0],m.dark,.015);
    if(z>0)box(wheel,[.17,.05,.28],[0,.16,.15],m.graphite,.015);
  }
  // Bottom frame rails joining the casters.
  for(const z of [-2.43,2.43])box(g,[5.16,.08,.06],[0,.72,z],m.dark,.012);
  for(const x of [-2.47,2.47])box(g,[.06,.08,4.9],[x,.72,0],m.dark,.012);
  for(const y of [SHELF.lower,SHELF.upper]){
    box(g,[5.16,SHELF.thickness,5.08],[0,y,0],m.shelf,.015);
    // Vented shelf: slots across the platform.
    if(y===SHELF.lower){
      const shelfSlots=[];for(let x=-2.1;x<=2.1;x+=.6)for(let z=-2.0;z<=2.0;z+=.5)shelfSlots.push([x,y+SHELF.thickness/2+.001,z]);
      instances(g,new T.BoxGeometry(.34,.004,.07),m.black,shelfSlots);
    }
    for(const z of [-2.54,2.54]){
      // Front and rear crossbars with slot grids either side of the badge.
      box(g,[5.2,.42,.045],[0,y-.16,z],m.graphite,.012);
      const vents=[];for(const sx of [-1,1])for(let col=0;col<4;col++)for(const yy of [-.24,-.1])vents.push([sx*(.75+col*.42),y+yy,z+(z>0?.024:-.024)]);
      instances(g,new T.BoxGeometry(.3,.055,.006),m.black,vents);
      if(z>0)decal(g,'Tec MOJO',.7,[0,y-.17,z+.027],'#e1e3e1',.15);
      const s=group(g,'rack-screws',[0,0,z+.03]);screws(s,[[-2.46,y-.02,0],[2.46,y-.02,0]],.045);
    }
    for(const x of [-2.56,2.56])box(g,[.06,.13,5.1],[x,y+.04,0],m.graphite,.009);
  }
  for(const x of [-1.68,1.68]){const r=ring(g,.15,.035,[x,SHELF.upper+.032,-2.18],m.rubber);r.rotation.x=-Math.PI/2;}
  // 1U surge-protected power strip on the front rails under the lower shelf.
  const pdu=group(g,'rack power strip',[0,1.0,2.36]);
  box(pdu,[4.6,.4,.5],[0,0,0],m.black,.02);
  for(const x of [-2.36,2.36])box(pdu,[.2,.44,.03],[x,0,.24],m.dark,.008);
  [[0x3fd255,.11],[0xe2452f,0],[0xe8a531,-.11]].forEach(([color,y])=>disc(pdu,.022,.01,[-1.55,y,.252],new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8})));
  art(pdu,1.0,.3,[-.9,0,.252],(c,w,h)=>{c.strokeStyle='#8f9498';c.lineWidth=2;c.strokeRect(2,2,w-4,h-4);c.fillStyle='#c9cdd0';c.font=`600 ${h*.2}px Arial, sans-serif`;c.textBaseline='middle';c.fillText('SURGE PROTECTIVE DEVICE',w*.06,h*.3);c.font=`400 ${h*.13}px Arial, sans-serif`;c.fillText('Lightning protection for power supply systems',w*.06,h*.66);},{px:96});
  disc(pdu,.11,.03,[-.05,0,.255],m.rubber);
  for(let i=0;i<4;i++){box(pdu,[.42,.3,.012],[.55+i*.5,0,.252],m.rubber,.03);for(const [dx,dy] of [[0,.07],[-.07,-.05],[.07,-.05]])box(pdu,[.035,.06,.006],[.55+i*.5+dx,dy,.26],m.black);}
  return g;
}
export function switchBoard(){
  // The owner's PEX88096 card (board code RBE16A54C-V11A): blue add-in card,
  // ten side-entry SlimSAS (SFF-8654) receptacles, one low cooler with a fin
  // block and a blower. Laid out from the owner's photos of it; length scaled
  // from the 89 mm x16 edge. Origin is the edge connector's insertion centre;
  // the card rises along +Y and its bracket is at -X.
  const g=group(null,'PEX88096 expansion card');
  const X0=-.837,W=2.70,Y0=.07,HH=1.10,cx=X0+W/2,cy=Y0+HH/2;
  box(g,[W,HH,.035],[cx,cy,0],m.bluePcb,.015);
  edgeConnector(g,0,.035,0,.99);
  box(g,[.04,1.37,.26],[X0-.02,.60,.07],m.steel,.008);
  box(g,[.18,.045,.29],[X0-.07,1.29,.07],m.steel,.008);
  const bracketVents=[];for(let row=0;row<9;row++)for(const z of [.01,.13])bracketVents.push([X0-.041,.14+row*.125,z]);
  instances(g,new T.BoxGeometry(.004,.075,.08),m.black,bracketVents);
  const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=580;const c=canvas.getContext('2d');
  c.fillStyle='#16366c';c.fillRect(0,0,1400,580);c.strokeStyle='#355f9e';c.lineWidth=1;
  for(let i=0;i<60;i++){const y=250+i*4;c.beginPath();c.moveTo(560,y);c.lineTo(760+i*3,y);c.lineTo(900+i*3,90+(i%6)*15);c.stroke();}
  for(let i=0;i<130;i++){const x=20+(i*61)%1340,y=30+(i*97)%510;c.fillStyle=i%3?'#c2c9c4':'#5e7fa6';c.fillRect(x,y,5,2);}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  plane(g,W-.02,HH-.02,new T.MeshStandardMaterial({map,roughness:.58,metalness:.25}),[cx,cy,.019]);
  // downstream-0..5 run along the top edge from the bracket (A2 A1 B2 B1 E2 E1);
  // 6 is D2 on the right edge; 7, 8 and 9 are C1, C2 and D1 along the bottom.
  const ports=[[-.532,1.03,'A2'],[-.095,1.03,'A1'],[.343,1.03,'B2'],[.761,1.03,'B1'],[1.207,1.03,'E2'],[1.66,1.03,'E1'],[1.66,.66,'D2'],[.799,.26,'C1'],[1.25,.26,'C2'],[1.66,.26,'D1']];
  ports.forEach(([x,y,label],i)=>{
    slimSAS(g,`downstream-${i}`,[x,y,.02]);
    art(g,.1,.1,[x+((i<5||i===7||i===8)?.17:-.18),y+.07,.021],(k,w,h)=>{k.strokeStyle='#f4f7fa';k.fillStyle='#f4f7fa';k.lineWidth=h*.07;k.beginPath();k.arc(w/2,h/2,h*.42,0,Math.PI*2);k.stroke();k.font=`700 ${h*.42}px Arial, sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillText(label,w/2,h*.53);},{px:64});
  });
  // One low cooler over the switch chip: a stack of horizontal fins towards
  // the bracket and a blower in a pale rounded housing, on a copper base.
  box(g,[.5,.56,.02],[.24,.41,.028],m.copper,.01);box(g,[.4,.62,.02],[-.283,.41,.028],m.steel,.01);
  const fins=[];for(let y=.12;y<=.7;y+=.03)fins.push([-.283,y,.093]);
  instances(g,new T.BoxGeometry(.37,.01,.11),m.steel,fins);
  extrude(g,roundRect(.6,.62,.25,.215,.41),[[.256,.41,.2]],.1,m.greyPlastic,[0,0,.04],.006);
  disc(g,.2,.012,[.256,.41,.05],m.copper);
  const blades=new T.InstancedMesh(new T.BoxGeometry(.008,.07,.06),m.black,30);blades.castShadow=true;
  for(let i=0;i<30;i++){const a=i*Math.PI*2/30;xyz.position.set(.256+Math.cos(a)*.15,.41+Math.sin(a)*.15,.1);xyz.rotation.set(0,0,a-.45);xyz.updateMatrix();blades.setMatrixAt(i,xyz.matrix);}g.add(blades);
  disc(g,.095,.07,[.256,.41,.105],m.black);
  screws(g,[[-.03,.16,.152],[.46,.16,.152],[-.03,.66,.152],[.46,.66,.152]],.02);
  tube(g,[[-.02,.2,.08],[-.2,.12,.05],[-.42,.12,.04]],.008,m.gold);
  // Bracket end: mode switch, capacitors, inductors and the printed mode table.
  box(g,[.12,.08,.04],[-.7,1.06,.04],m.black,.006);for(let i=0;i<3;i++)box(g,[.02,.04,.014],[-.735+i*.035,1.065,.064],m.white);
  for(let i=0;i<5;i++)disc(g,.036,.085,[-.72+(i%2)*.1,.34+i*.11,.06],m.steel,20);
  for(const y of [.5,.68])box(g,[.13,.11,.06],[-.58,y,.05],m.fin,.01);
  art(g,.3,.15,[-.66,.15,.021],(k,w,h)=>{k.strokeStyle='#eef2f6';k.fillStyle='#eef2f6';k.lineWidth=1.5;k.strokeRect(1,1,w-2,h-2);for(let i=1;i<4;i++){k.beginPath();k.moveTo(1,h*i/4);k.lineTo(w-1,h*i/4);k.stroke();}for(const x of [.24,.48,.72]){k.beginPath();k.moveTo(w*x,1);k.lineTo(w*x,h-1);k.stroke();}k.font=`600 ${h*.15}px Arial, sans-serif`;k.textBaseline='middle';['X16','X8X8','X4X4X4X4'].forEach((t,i)=>k.fillText(t,w*.74,h*(i+1.5)/4));},{px:96});
  // Three retimers between the socket rows, and the board code silkscreen.
  for(const x of [.98,1.17,1.36])box(g,[.11,.11,.02],[x,.66,.027],m.chip,.004);
  decal(g,'RBE16A54C-V11A',.34,[.62,.8,.021],'#e9f0f6',.035);
  decal(g,'PFINGERX1',.2,[.15,.1,.021],'#e9f0f6',.028);
  screws(g,[[X0+.1,.14,.025],[X0+.1,1.1,.025],[1.45,.48,.025],[1.0,.46,.025]],.022);
  g.scale.setScalar(.9);return g;
}
// SlimSAS 8i receptacle, side entry: a low cage lying on the board, dark body
// and silver mouth. The plug goes in along -X towards the bracket, so its
// cable leaves along +X, parallel to the board (seat +Z is the way out).
function slimSAS(parent,name,position){
  const s=group(parent,name,position);
  box(s,[.12,.26,.085],[-.04,0,.0425],m.black,.008);
  box(s,[.08,.26,.09],[.06,0,.045],m.steel,.008);
  box(s,[.006,.215,.04],[.101,0,.048],m.black);
  for(const y of [-.08,.08])box(s,[.03,.03,.004],[.06,y,.092],m.dark);
  const seat=group(s,'cable-seat',[.104,0,.048]);seat.rotation.y=Math.PI/2;
  return s;
}
export function riserBoard(){
  // The green breakout each card stands in (model label RBS-16G4-2P54), laid
  // out from the owner's photo of the bare board. +X is the end that faces the
  // rack front. Along one long edge: the PCIe x16 slot, then the 6-pin power
  // input at the +X end. Two SlimSAS cages lie flat beside the slot with their
  // mouths towards +X, so both cables leave along the board. Capacitors and
  // the fan header are at the -X end.
  const g=group(null,'dual-SFF-8654 GPU breakout');
  box(g,[1.80,.03,.48],[0,0,0],m.greenPcb,.01);
  box(g,[1.09,.11,.085],[-.275,.07,-.12],m.black);
  box(g,[.98,.01,.03],[-.275,.127,-.12],m.rubber);
  [-.3,.26].forEach((x,i)=>{const s=slimSAS(g,`riser-port-${i}`,[x,.015,.06]);s.rotation.x=-Math.PI/2;});
  const power=group(g,'riser-power',[.74,.085,-.12]);
  box(power,[.2,.14,.17],[0,0,0],m.black,.01);
  for(let y=0;y<2;y++)for(let z=0;z<3;z++)box(power,[.006,.03,.03],[.101,(y-.5)*.06,(z-1)*.05],m.chip);
  group(power,'power-lead',[.11,0,0]);
  box(g,[.09,.07,.14],[-.78,.05,.12],m.white,.005);
  for(const x of [-.74,-.62])mesh(g,new T.CylinderGeometry(.035,.035,.09,20),m.steel,[x,.06,-.02]);
  box(g,[.07,.05,.07],[-.66,.04,.08],m.fin,.006);
  mesh(g,new T.CylinderGeometry(.045,.045,.004,24),m.white,[-.02,.018,.09]);
  art(g,.26,.14,[.6,.017,.1],(c,w,h)=>{c.fillStyle='#f3f3f0';c.fillRect(0,0,w,h);c.fillStyle='#22262b';c.font=`600 ${h*.2}px Arial, sans-serif`;c.textBaseline='middle';c.fillText('Model No:',w*.06,h*.2);c.fillText('RBS-16G4-2P54',w*.06,h*.46);for(let x=w*.06;x<w*.6;x+=w*.03)c.fillRect(x,h*.66,w*.012,h*.24);},{px:72,rotation:[-Math.PI/2,0,0]});
  const standoffs=[];for(const x of [-.82,.82])for(const z of [-.19,.19])standoffs.push([x,.02,z]);
  instances(g,new T.CylinderGeometry(.022,.022,.012,12),m.steel,standoffs);
  return g;
}
// Black aluminium-extrusion frame that holds the four cards upright.
// cards: [{x, z, postZ, postHeight}] in the frame's own space (y = 0 is the shelf).
export function gpuFrame(cards,front,rear){
  const g=group(null,'four-card frame'),rail=.2,xs=cards.map(c=>c.x);
  const x0=Math.min(...xs)-.3,x1=Math.max(...xs)+.3;
  for(const z of [rear,front])box(g,[x1-x0,rail,rail],[(x0+x1)/2,rail/2,z],m.black,.012);
  const standoffs=[];
  for(const card of cards){
    for(const dx of [-.19,.19]){
      box(g,[rail*.9,rail,front-rear-rail],[card.x+dx,rail/2,(front+rear)/2],m.black,.012);
      for(const dz of [-.8,.8])standoffs.push([card.x+dx,rail+.05,card.z+dz]);
    }
    // Upright post behind the card's bracket, with the two thumbscrews.
    box(g,[.2,card.postHeight,.035],[card.x,card.postHeight/2,card.postZ-.05],m.black,.008);
    box(g,[.34,.03,.16],[card.x,card.postHeight+.015,card.postZ-.01],m.black,.008);
    for(const dx of [-.09,.09]){const t=mesh(g,new T.CylinderGeometry(.04,.04,.06,16),m.steel,[card.x+dx,card.postHeight+.06,card.postZ]);t.castShadow=true;}
  }
  instances(g,new T.CylinderGeometry(.03,.03,.1,12),m.brass,standoffs);
  return g;
}
export function powerSupply(){
  // Cooler Master X Mighty Platinum 2000: 150 W x 86 H x 180 L mm. Built in
  // its natural pose, fan grille up; the rack stands it on a side panel.
  // The modular face is +Z and carries the cable anchors psu-out-0..9.
  const g=group(null,'external power'),W=1.5,H=.86,L=1.8;
  box(g,[W,H,L],[0,H/2,0],m.black,.02);
  const top=group(g,'psu-fan-grille',[0,H+.003,.06]);top.rotation.x=-Math.PI/2;
  disc(top,.64,.006,[0,0,0],m.rubber);
  axialFan(top,.58,[0,0,-.03],'',false,9);
  for(const r of [.14,.26,.38,.5,.62])ring(top,r,.008,[0,0,.012],m.graphite);
  for(let i=0;i<4;i++){const bar=box(top,[1.26,.014,.014],[0,0,.014],m.graphite);bar.rotation.z=i*Math.PI/4;}
  disc(top,.13,.012,[0,0,.02],m.dark);
  // Modular face: two rows of sockets.
  const face=group(g,'psu-modular-face',[0,H/2,L/2+.002]);
  box(face,[W-.1,H-.1,.006],[0,0,0],m.dark,.01);
  for(let row=0;row<2;row++)for(let col=0;col<5;col++){
    const x=-.54+col*.27,y=.17-row*.34;
    box(face,[.2,.2,.02],[x,y,.008],m.rubber,.01);
    for(let i=0;i<4;i++)for(let j=0;j<2;j++)box(face,[.024,.024,.006],[x+(i-1.5)*.04,y+(j-.5)*.07,.02],m.chip);
    group(face,`psu-out-${row*5+col}`,[x,y,.03]);
  }
  decal(face,'X SERIES',.4,[0,-.37,.006],'#8d9296',.045);
  // Branding along both side panels.
  for(const sx of [-1,1]){
    const side=group(g,'psu-side-label',[sx*(W/2+.002),H/2,0]);side.rotation.y=sx*Math.PI/2;
    decal(side,'X MIGHTY',.62,[-.42,.0,0],'#e9ebed',.13);
    decal(side,'PLATINUM',.3,[.1,.0,0],'#c9cdd0',.05);
    decal(side,'2000',.44,[.55,.0,0],'#e9ebed',.15);
  }
  // Rear: mains inlet and rocker switch.
  const rear=group(g,'psu-inlet',[0,H/2,-L/2-.002]);rear.rotation.y=Math.PI;
  box(rear,[.34,.26,.03],[-.38,0,0],m.rubber,.03);for(const x of [-.46,-.38,-.3])box(rear,[.025,.07,.02],[x,0,.02],m.steel);
  box(rear,[.16,.24,.04],[.02,0,0],m.rubber,.015);box(rear,[.1,.1,.02],[.02,.05,.025],m.graphite,.01);
  plane(rear,.6,.66,perforatedMaterial(m.dark,.6,.66,'all'),[.42,0,.004]);
  return g;
}
// Black clip-on desk fan that sits on top of the power supply: a rounded
// two-jaw clamp, a short yoke and a thick slotted housing that tilts in it.
export function clipFan(){
  const g=group(null,'clip-on fan');
  box(g,[.46,.1,.66],[0,.05,0],m.black,.05);
  box(g,[.4,.08,.5],[0,.14,-.05],m.black,.04);
  pin(g,.05,.44,[0,.12,.27],m.black);
  const yaw=group(g,'fan-yaw',[0,.2,0]);
  box(yaw,[1.42,.07,.16],[0,.06,0],m.black,.03);
  for(const x of [-.68,.68])box(yaw,[.07,.72,.16],[x,.4,0],m.black,.03);
  const head=group(yaw,'fan-head',[0,.74,0]);
  for(const x of [-.64,.64])pin(head,.075,.1,[x,0,0],m.black);
  const band=new T.Mesh(new T.CylinderGeometry(.6,.6,.38,48,1,true),m.blade);band.rotation.x=Math.PI/2;band.castShadow=true;head.add(band);
  const ribs=[];for(let i=0;i<28;i++){const a=i*Math.PI*2/28;ribs.push([Math.cos(a)*.607,Math.sin(a)*.607,0]);}
  instances(head,new T.BoxGeometry(.035,.035,.3),m.shroud,ribs);
  for(const z of [-.19,.19]){
    for(const r of [.2,.36,.5,.6])ring(head,r,.012,[0,0,z],m.black);
    for(let i=0;i<6;i++){const bar=box(head,[1.2,.012,.012],[0,0,z],m.black);bar.rotation.z=i*Math.PI/6;}
  }
  disc(head,.16,.3,[0,0,-.02],m.black);
  axialFan(head,.52,[0,0,.06],'',false,5);
  return g;
}
// 120 mm case fan behind the cards: grey frame with brown corner pads, a wire
// guard, in an arched black stand.
export function rearFan(){
  const g=group(null,'rear 120 mm fan'),frame=standard(0x85888c,.15,.65),pad=standard(0x6a4b3a,.05,.8);
  extrude(g,roundRect(1.2,1.2,.08),[[0,0,.56]],.25,frame,[0,.72,-.125],.008);
  for(const x of [-.52,.52])for(const y of [-.52,.52])box(g,[.13,.13,.27],[x,.72+y,0],pad,.03);
  axialFan(g,.54,[0,.72,.02],'',false,7);
  for(const r of [.14,.28,.42,.56])ring(g,r,.01,[0,.72,.15],m.black);
  for(let i=0;i<4;i++){const bar=box(g,[1.14,.012,.012],[0,.72,.15],m.black);bar.rotation.z=i*Math.PI/4;}
  tube(g,[[-.7,.02,0],[-.72,.9,0],[-.52,1.44,0],[0,1.53,0],[.52,1.44,0],[.72,.9,0],[.7,.02,0]],.035,m.black);
  box(g,[1.56,.05,.45],[0,.025,0],m.black,.02);
  return g;
}
