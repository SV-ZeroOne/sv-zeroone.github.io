import * as T from 'three';
import { RoundedBoxGeometry } from '../lib/three-r180/RoundedBoxGeometry.js';

// Photo-derived models. One scene unit = 100 mm. Published outer dimensions
// constrain the cases; concealed components are explanatory reconstructions.
const standard = (color, metalness = .5, roughness = .38) => new T.MeshStandardMaterial({ color, metalness, roughness });
export const materials = {
  graphite: standard(0x35383d, .7, .33), dark: standard(0x171a1d, .5, .38),
  rubber: standard(0x111316, .05, .7), steel: standard(0xa1a5aa, .92, .29),
  silver: standard(0xb0b4be, .72, .3), lime: standard(0x81b21e, .22, .44),
  pcb: standard(0x172525, .25, .65), chip: standard(0x1d2127, .2, .55),
  gold: standard(0xd2ae59, .8, .3), copper: standard(0xc38652, .85, .3),
  led: new T.MeshStandardMaterial({ color: 0x80b21a, emissive: 0x81c91e, emissiveIntensity: .12 }),
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
  return mesh(parent, radius ? new RoundedBoxGeometry(...size, 2, Math.min(radius, ...size.map(v => v / 2))) : new T.BoxGeometry(...size), material, position);
}
function plane(parent, w, h, material, position) { return mesh(parent, new T.PlaneGeometry(w, h), material, position); }
function disc(parent, radius, depth, position, material = m.dark, segments = 48) {
  const o = mesh(parent, new T.CylinderGeometry(radius, radius, depth, segments), material, position);
  o.rotation.x = Math.PI / 2; return o;
}
function ring(parent, r, thickness, position, material = m.steel) {
  return mesh(parent, new T.TorusGeometry(r, thickness, 6, 64), material, position);
}
export function tube(parent, points, radius = .025, material = m.rubber) {
  return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 40, radius, 6, false), material);
}
function instances(parent, geometry, material, transforms) {
  const o = new T.InstancedMesh(geometry, material, transforms.length);
  transforms.forEach((p, i) => { xyz.position.set(...p); xyz.rotation.set(0, 0, 0); xyz.updateMatrix(); o.setMatrixAt(i, xyz.matrix); });
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function screws(parent, positions, radius = .023) {
  const geo = new T.CylinderGeometry(radius, radius, .015, 12); geo.rotateX(Math.PI / 2);
  instances(parent, geo, m.steel, positions);
  instances(parent, new T.BoxGeometry(radius * 1.1, .006, .003), m.dark, positions.map(([x,y,z]) => [x,y,z+.009]));
}
const decalCache = new Map();
function decal(parent, text, width, position, color = '#c8ccd0', height = width / 6, rotation = [0,0,0]) {
  const key = text + color;
  if (!decalCache.has(key)) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const c = canvas.getContext('2d'); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 100px Arial, sans-serif';
    // Fill the decal width for short wordmarks too (e.g. AG03's "03").
    c.translate(512,83);c.scale(1000/Math.max(1,c.measureText(text).width),1);c.fillText(text,0,0);
    const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace; map.anisotropy = 8;
    decalCache.set(key, new T.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: .65, metalness: .2, polygonOffset: true, polygonOffsetFactor: -1 }));
  }
  const d = plane(parent, width, height, decalCache.get(key), position); d.rotation.set(...rotation); d.castShadow = false; return d;
}
// Alpha-tested perforations have actual see-through holes, rather than painted dots.
function perforatedMaterial(material, w, h, mode = 'all') {
  const canvas = document.createElement('canvas'); canvas.width = Math.round(w * 420); canvas.height = Math.round(h * 420);
  const c = canvas.getContext('2d'); c.fillStyle = 'white'; c.fillRect(0, 0, canvas.width, canvas.height); c.fillStyle = 'black';
  for (let y = .08, row = 0; y < h - .08; y += .046, row++) for (let x = .08 + (row % 2) * .023; x < w - .08; x += .046) {
    const circle = (x - w*.52)**2 + (y - h*.48)**2 < .48**2;
    const slot = y > h-.26 && y < h-.1 && x > .16 && x < w-.16;
    // 'field': one perforated rectangle inside a solid sheet-metal border.
    const field = x > .2 && x < w-.2 && y > .2 && y < h-.2;
    if (mode === 'all' || (mode === 'field' ? field : circle || slot)) { c.beginPath(); c.arc(x*420,y*420,5.0,0,Math.PI*2); c.fill(); }
  }
  const map = new T.CanvasTexture(canvas); map.anisotropy = 8;
  const mat = material.clone(); mat.alphaMap = map; mat.alphaTest = .5; mat.side = T.DoubleSide;
  return mat;
}
function edgedPanel(parent, w, h, position, material, mode = 'all') {
  const panel = group(parent, 'panel', position);
  plane(panel, w, h, perforatedMaterial(material,w,h,mode), [0,0,0]);
  for (const y of [-h/2,h/2]) box(panel,[w,.025,.025],[0,y,0],material,.009);
  for (const x of [-w/2,w/2]) box(panel,[.025,h,.025],[x,0,0],material,.009);
  screws(panel,[[-w/2+.06,-h/2+.06,.012],[w/2-.06,-h/2+.06,.012],[-w/2+.06,h/2-.06,.012],[w/2-.06,h/2-.06,.012]],.016);
  return panel;
}
function extrude(parent, points, holes, depth, material, position, bevel = .012) {
  const shape = new T.Shape(); shape.moveTo(...points[0]); points.slice(1).forEach(p => shape.lineTo(...p)); shape.closePath();
  for (const [x,y,r] of holes) { const hole = new T.Path(); hole.absarc(x,y,r,0,Math.PI*2,true); shape.holes.push(hole); }
  return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:48}),material,position);
}
function axialFan(parent, radius, position, hubText = '', reverse = false) {
  const f = group(parent,'axial-fan',position);
  // Swept, pitched airfoils. A flat extrusion makes axial blades look like petals.
  const vertices=[],indices=[],rows=14,cols=8;
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
    const u=i/rows,v=j/cols,r=radius*(.21+.74*u);
    const a=-.85*u+(v-.5)*(.68-.10*u);
    vertices.push(r*Math.cos(a),r*Math.sin(a),radius*(.20*(v-.5)*(.3+.7*u)+.025*Math.sin(u*Math.PI)));
  }
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const fanMat = standard(0x171a1e,.08,.48);fanMat.side=T.DoubleSide;
  if(reverse){geometry.scale(1,-1,1);geometry.computeVertexNormals();}
  const blades=new T.InstancedMesh(geometry,fanMat,9);blades.castShadow=true;blades.receiveShadow=true;
  for(let i=0;i<9;i++){xyz.position.set(0,0,0);xyz.rotation.set(0,0,i*Math.PI*2/9);xyz.updateMatrix();blades.setMatrixAt(i,xyz.matrix);}f.add(blades);
  ring(f,radius*.96,.012,[0,0,.025],m.dark);
  disc(f,radius*.25,.055,[0,0,.045],m.graphite);
  if(hubText) decal(f,hubText,radius*.42,[0,0,.075],'#d6d9dd',radius*.14);
  return f;
}
function finStack(parent, length, height, depth, position) {
  const p = group(parent,'heatsink',position), positions=[];
  for(let x=-length/2;x<=length/2;x+=.027)positions.push([x,0,0]);
  instances(p,new T.BoxGeometry(.009,height,depth),m.steel,positions); return p;
}
function edgeConnector(parent, x, y, z, length) {
  box(parent,[length,.1,.022],[x,y,z],m.gold);
  const contacts=[]; for(let p=x-length/2+.025;p<x+length/2;p+=.027)contacts.push([p,y,z+.015]);
  instances(parent,new T.BoxGeometry(.006,.085,.004),m.pcb,contacts);
  box(parent,[.045,.1,.025],[x-length*.29,y,z],m.dark);
}
function socket(parent, position, pins = 8) {
  const g=group(parent,'power-socket',position); box(g,[pins===16?.22:.19,.105,.12],[0,0,0],m.dark,.008);
  const count=pins===16?6:4;
  for(let x=0;x<count;x++)for(let y=0;y<2;y++)box(g,[.021,.024,.006],[(x-(count-1)/2)*.032,(y-.5)*.038,.063],m.chip);
  group(g,'power-lead',[0,0,.075]);return g;
}
function ioBracket(parent, x, h, d, ports) {
  const g=group(parent,'io-bracket',[x,0,0]); g.rotation.y=-Math.PI/2;
  box(g,[d,h,.025],[0,0,0],m.steel,.008);
  for(let i=0;i<ports;i++) { const y=-h*.34+i*h*.135; box(g,[d*.42,.075,.03],[-d*.19,y,.017],m.dark,.009); box(g,[d*.35,.045,.035],[-d*.19,y,.022],m.chip); }
  const slots=[]; for(let y=-h*.35;y<h*.4;y+=.1)slots.push([d*.25,y,.018]);
  instances(g,new T.BoxGeometry(d*.27,.045,.006),m.dark,slots);
  box(g,[d+.08,.07,.05],[0,h/2+.02,0],m.steel);
  screws(g,[[0,-h/2+.05,.022],[0,h/2-.05,.022]],.019);
}
export function gpu(kind = 'amd') {
  if(kind==='5070')return zotac5070();
  const amd=kind==='amd';
  const L=amd?2.67:2.999, H=amd?1.11:1.269, D=amd?.40:.517;
  const g=group(null,amd?'R9700 AI TOP':'TUF RTX 3090');
  box(g,[L-.08,H-.08,.025],[0,0,-D*.28],m.pcb,.008);
  edgeConnector(g,-.35,-H/2-.025,-D*.28,1.12);
  const plate=box(g,[L-.06,H-.07,.025],[0,0,-D/2],amd?m.graphite:m.dark,.025);
  plate.name='backplate';
  decal(g,amd?'GIGABYTE':'GEFORCE RTX',1.0,[-.35,.08,-D/2-.016],'#9ba0a5',.12,[0,Math.PI,0]);
  const backScrews=[];for(const x of [-L/2+.12,-.4,.4,L/2-.12])for(const y of [-H/2+.1,H/2-.1])backScrews.push([x,y,0]);
  const back=group(g,'backplate-screws',[0,0,-D/2-.02]);back.rotation.y=Math.PI;screws(back,backScrews,.016);
  finStack(g,L-.15,H-.15,D*.56,[0,0,-.02]);
  ioBracket(g,-L/2-.015,H+.18,D,amd?4:5);
  // Small PCB components along the exposed lower edge.
  for(let i=0;i<16;i++)box(g,[.04,.035,.028],[-L/2+.16+i*(L-.32)/16,-H/2+.03,-D*.18],m.chip);
  if(amd){
    const points=[[-L/2+.035,-H/2+.04],[L/2-.08,-H/2+.04],[L/2-.025,-H/2+.1],[L/2-.025,H/2-.08],[L/2-.09,H/2-.025],[-L/2+.035,H/2-.025]];
    extrude(g,points,[[.82,.02,.426]],.06,m.silver,[0,0,D/2-.065]);
    // Wrapped side rails and understated face seam, as on the blower housing.
    for(const y of [-H/2+.035,H/2-.03])box(g,[L-.09,.06,D*.82],[0,y,.005],m.silver,.018);
    box(g,[.008,H-.11,.008],[.33,0,D/2+.007],m.graphite);
    disc(g,.418,.14,[.82,.02,.08],m.rubber);
    ring(g,.416,.013,[.82,.02,D/2+.006],m.graphite);
    const bladeGeo=new T.BoxGeometry(.012,.12,.075);
    const rotor=group(g,'blower',[.82,.02,.175]);
    const vanes=new T.InstancedMesh(bladeGeo,m.graphite,48);vanes.castShadow=true;vanes.receiveShadow=true;
    for(let i=0;i<48;i++){const a=i*Math.PI*2/48;xyz.position.set(Math.cos(a)*.31,Math.sin(a)*.31,0);xyz.rotation.set(0,0,a-.5);xyz.updateMatrix();vanes.setMatrixAt(i,xyz.matrix);}rotor.add(vanes);
    disc(rotor,.185,.035,[0,0,.037],m.steel); ring(rotor,.16,.009,[0,0,.06],m.silver);
    decal(g,'GIGABYTE',.62,[-.67,-.37,D/2+.011],'#5b6068',.075);
    decal(g,'RADEON',.5,[-.86,H/2+.007,.01],'#34383e',.075,[-Math.PI/2,0,0]);
    decal(g,'AI TOP',.56,[.1,H/2+.008,.01],'#7c8089',.1,[-Math.PI/2,0,0]);
    socket(g,[.83,H/2+.016,-.06],16).rotation.x=-Math.PI/2;
  } else {
    const centers=[-.99,0,.99], radius=.473;
    const pts=[[-L/2+.12,-H/2+.02],[L/2-.13,-H/2+.02],[L/2-.015,-H/2+.15],[L/2-.015,H/2-.15],[L/2-.13,H/2-.02],[-L/2+.13,H/2-.02],[-L/2+.015,H/2-.15],[-L/2+.015,-H/2+.15]];
    extrude(g,pts,centers.map(x=>[x,0,radius+.012]),.07,m.graphite,[0,0,D/2-.065]);
    centers.forEach((x,i)=>axialFan(g,radius,[x,0,D/2-.045],i===1?'ASUS':'TUF',i===1));
    // Raised angular shroud bridges and diagonal etched seams.
    for(const x of [-.51,.51]) {
      const strip=box(g,[.065,.28,.024],[x,H*.36,D/2+.012],m.dark,.007);strip.rotation.z=-.64;
      const strip2=box(g,[.065,.28,.024],[x,-H*.36,D/2+.012],m.dark,.007);strip2.rotation.z=-.64;
    }
    for(const y of [-H/2+.04,H/2-.04])box(g,[L-.24,.08,.16],[0,y,.1],m.graphite,.015);
    const top=group(g,'upper-wordmark',[0,H/2+.007,0]);top.rotation.x=-Math.PI/2;
    decal(top,'GEFORCE RTX',1.25,[-.42,0,0],'#d8dbdd',.135);
    box(top,[.7,.14,.018],[.94,0,.003],m.dark,.01);
    decal(top,'TUF GAMING',.58,[.94,0,.017],'#bfc4c8',.075);
    const led=new T.MeshStandardMaterial({color:0xe2b758,emissive:0xe0a537,emissiveIntensity:.45});
    box(top,[.62,.019,.02],[.94,-.084,.007],led,.007);
    socket(g,[.7,H/2+.025,-.16]).rotation.x=-Math.PI/2;socket(g,[.92,H/2+.025,-.16]).rotation.x=-Math.PI/2;
    for(let i=0;i<4;i++)tube(g,[[-L/2+.12,-.35+i*.15,-.02],[-L/2+.02,-.36+i*.15,.05],[-L/2+.14,-.36+i*.15,.13]],.028,m.steel);
    screws(g,[[-L/2+.12,-H/2+.11,D/2+.02],[L/2-.12,-H/2+.11,D/2+.02],[-L/2+.12,H/2-.11,D/2+.02],[L/2-.12,H/2-.11,D/2+.02]],.016);
  }
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
  finStack(g,2.25,.97,.23,[0,0,-.035]);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle='#54575a';c.fillRect(0,0,1024,512);
  c.strokeStyle='#26292d';c.lineWidth=3;
  for(let i=-520;i<1550;i+=15){c.beginPath();c.moveTo(i,0);c.lineTo(i+512,512);c.stroke();}
  c.strokeStyle='#899095';c.lineWidth=3;c.beginPath();c.moveTo(320,512);c.lineTo(600,230);c.stroke();
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  // Extrude UVs are in scene units. Match the 2.4 x 1.12 front envelope.
  map.repeat.set(1/2.4,1/1.12);map.offset.set(.5,.5);
  const shroud=new T.MeshStandardMaterial({map,bumpMap:map,bumpScale:.006,metalness:.48,roughness:.42});
  extrude(g,outline,[[-.57,0,.454],[.54,0,.454]],.055,shroud,[0,0,.145],.009);
  for(const x of [-.57,.54])axialFan(g,.45,[x,0,.158],'ZOTAC');
  for(const y of [-.55,.55])box(g,[2.15,.055,.22],[0,y,.07],m.graphite,.018);
  // Cut-through tail on the metal backplate with an X brace.
  const back=group(g,'vented metal backplate',[0,0,-D/2+.012]);back.rotation.y=Math.PI;
  const shape=new T.Shape();shape.moveTo(-1.16,-.5);shape.lineTo(-1.16,.42);shape.lineTo(-1.04,.55);shape.lineTo(1.08,.55);shape.lineTo(1.18,.43);shape.lineTo(1.18,-.47);shape.lineTo(1.08,-.55);shape.lineTo(-1.08,-.55);shape.closePath();
  const hole=new T.Path();hole.moveTo(-1.02,-.38);hole.lineTo(-.40,-.38);hole.lineTo(-.34,.37);hole.lineTo(-1.02,.37);hole.closePath();shape.holes.push(hole);
  mesh(back,new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSize:.008,bevelThickness:.005,bevelSegments:2,steps:1}),m.graphite);
  for(const angle of [-.72,.72]){const brace=box(back,[.045,1.0,.023],[-.69,0,.018],m.graphite,.008);brace.rotation.z=angle;}
  const slots=[];for(let row=0;row<5;row++)for(let col=0;col<7;col++)slots.push([-.3+col*.09,.09+row*.085,.025]);
  const vents=instances(back,new T.BoxGeometry(.022,.058,.005),m.dark,slots);vents.rotation.z=.65;
  decal(back,'GEFORCE RTX',1.05,[.45,-.06,.025],'#92979c',.13,[0,0,-.75]);
  decal(back,'ZOTAC GAMING',.65,[-.91,.02,.025],'#b4b8bc',.055,[0,0,Math.PI/2]);
  screws(back,[[-1.08,-.43,.03],[-1.08,.42,.03],[1.07,-.44,.03],[1.07,.43,.03],[-.01,-.34,.03],[.4,.34,.03]],.019);
  const label=group(g,'top branding',[0,H/2-.035,0]);label.rotation.x=-Math.PI/2;
  decal(label,'GEFORCE RTX',.94,[-.55,0,.01],'#d0d4d7',.105);
  decal(label,'ZOTAC GAMING',.55,[.69,0,.01],'#c4c9cc',.07);
  decal(g,'ZOTAC GAMING',.35,[-.06,.34,.211],'#abb0b4',.055,[0,0,-.75]);
  socket(g,[.27,H/2-.035,-.12],16).rotation.x=-Math.PI/2;
  box(g,[.022,.012,.018],[.43,H/2+.012,-.12],m.led,.004);
  ioBracket(g,-L/2+.015,H+.13,D,4);
  return g;
}
export function egpuDock(){
  // AOOSTAR AG03 photographs constrain the shape; dock dimensions are approximate.
  const g=group(null,'AOOSTAR AG03 with ZOTAC Twin Edge OC');
  const shell=standard(0x555b60,.8,.32);
  box(g,[2.30,.57,1.05],[0,.325,0],shell,.07);
  box(g,[2.285,.018,1.035],[0,.606,0],m.silver,.065);
  box(g,[2.265,.018,1.015],[0,.618,0],m.graphite,.06);
  for(const x of [-.95,.95])for(const z of [-.38,.38])box(g,[.17,.06,.17],[x,.03,z],m.rubber,.04);
  const slot=group(g,'AG03 PCIe slot',[-.32,.66,-.14]);
  box(slot,[.94,.065,.095],[0,0,0],m.steel,.012);box(slot,[.87,.015,.036],[0,.035,0],m.rubber,.004);
  box(slot,[.075,.10,.12],[.51,.035,0],m.dark,.012);
  const card=gpu('5070');card.name='docked Zotac RTX 5070';card.position.y=.66+1.201/2-.025;g.add(card);
  group(slot,'dock-card-seat');
  // Retaining tab behind the I/O bracket and a knurled fastener.
  box(g,[.065,.19,.30],[-1.19,.70,-.08],m.graphite,.018);
  box(g,[.22,.035,.30],[-1.11,.80,-.08],shell,.012);
  const knob=disc(g,.075,.08,[-1.21,.48,.2],m.steel,32);knob.rotation.y=Math.PI/2;
  disc(g,.066,.025,[-.78,.30,.53],m.dark);ring(g,.044,.004,[-.78,.30,.546],m.steel);
  const port=group(g,'dock-oculink',[-.28,.36,.532]);
  box(port,[.195,.06,.018],[0,0,0],m.steel,.01);box(port,[.172,.036,.024],[0,0,.005],m.rubber,.006);group(port,'cable-seat',[0,0,.035]);
  decal(g,'OCuLink',.24,[-.28,.28,.538],'#1c2126',.043);
  for(const x of [.24,.50]){box(g,[.10,.035,.025],[x,.36,.531],m.steel,.015);box(g,[.075,.018,.028],[x,.36,.537],m.rubber,.009);}
  decal(g,'TB5',.15,[.38,.285,.538],'#1c2126',.041);
  decal(g,'03',.38,[.86,.34,.538],'#171c20',.23);decal(g,'AOOSTAR',.38,[.86,.18,.538],'#171c20',.055);
  const end=group(g,'integrated 800 W PSU',[-1.155,.31,0]);end.rotation.y=-Math.PI/2;
  axialFan(end,.195,[.14,0,.01]);for(const r of [.08,.13,.19])ring(end,r,.009,[.14,0,.06],m.steel);
  for(const x of [-.02,.14,.30])box(end,[.012,.36,.015],[x,0,.07],m.graphite);
  box(end,[.19,.25,.028],[-.30,0,.03],m.rubber,.018);
  for(const x of [-.34,-.26])box(end,[.018,.058,.015],[x,0,.051],m.steel);
  tube(end,[[.36,-.17,.02],[.41,-.17,.15],[.41,.17,.15],[.36,.17,.02]],.018,m.dark);
  const other=group(g,'PSU inlet vents',[1.153,.29,0]);other.rotation.y=Math.PI/2;
  for(let i=0;i<4;i++)for(const x of [-.22,.17])box(other,[.31,.025,.009],[x,-.16+i*.055,0],m.dark,.012);
  disc(other,.075,.035,[0,.18,.02],m.steel,32);
  const back=group(g,'dock power outputs',[0,0,-.535]);back.rotation.y=Math.PI;
  for(let i=0;i<3;i++)socket(back,[-.6+i*.24,.47,0]);
  decal(back,'AG03  /  800 W PSU',1.05,[.12,.17,.01],'#b0b5b8',.06);
  // Local two-8-pin adapter: power stays within this dock/card assembly.
  const powerEnd=card.getObjectByName('power-lead');
  g.updateMatrixWorld(true);const target=powerEnd.getWorldPosition(new T.Vector3());
  for(let i=0;i<2;i++)tube(g,[[.6-i*.24,.47,-.61],[.42-i*.08,.8,-.81],[.32-i*.04,1.94,-.70],[.27,2.01,-.12],target.toArray()],.025);
  return g;
}
function handle(parent,z,y,invert=false){
  const s=new T.Shape();s.moveTo(-.69,0);s.lineTo(-.69,.12);s.quadraticCurveTo(-.69,.26,-.54,.26);s.lineTo(.54,.26);s.quadraticCurveTo(.69,.26,.69,.12);s.lineTo(.69,0);s.lineTo(.59,0);s.lineTo(.59,.12);s.quadraticCurveTo(.59,.16,.54,.16);s.lineTo(-.54,.16);s.quadraticCurveTo(-.59,.16,-.59,.12);s.lineTo(-.59,0);s.closePath();
  const o=mesh(parent,new T.ExtrudeGeometry(s,{depth:.1,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:3,steps:1}),m.dark,[0,y,z]);if(invert)o.rotation.z=Math.PI;
}
// Internal supply, styled on the SFX-format unit in GMKtec's exploded render:
// guarded fan face, IEC inlet with rocker switch, vented flank. Body size kept.
function internalPSU(parent,position){
  const psu=group(parent,'internal-psu',position);box(psu,[.95,1.08,1.35],[0,0,0],m.dark,.035);
  const face=group(psu,'psu-fan-face',[.49,0,0]);face.rotation.y=Math.PI/2;
  axialFan(face,.43,[0,0,-.03]);
  for(const r of [.14,.25,.36,.45])ring(face,r,.007,[0,0,.035],m.graphite);
  for(const a of [Math.PI/4,-Math.PI/4]){const spoke=box(face,[.92,.016,.012],[0,0,.035],m.graphite);spoke.rotation.z=a;}
  screws(face,[[-.42,-.42,.02],[.42,-.42,.02],[-.42,.42,.02],[.42,.42,.02]],.022);
  // Rear face: IEC C14 inlet and rocker switch.
  const inlet=group(psu,'psu-inlet',[.18,.22,-.68]);inlet.rotation.y=Math.PI;
  box(inlet,[.27,.19,.03],[0,0,0],m.rubber,.02);
  for(const x of [-.07,0,.07])box(inlet,[.018,.05,.02],[x,x?-.01:.03,.02],m.steel);
  box(inlet,[.1,.16,.04],[-.33,0,0],m.rubber,.015);box(inlet,[.07,.07,.02],[-.33,.035,.025],m.graphite,.01);
  const vents=[];for(let y=-.38;y<=.2;y+=.065)vents.push([0,y,.677]);
  instances(psu,new T.BoxGeometry(.62,.026,.006),m.rubber,vents);
  decal(psu,'850 W',.5,[0,.36,.686],'#9ba1a6',.11);
  return psu;
}
function motherboard(parent,openSide=false,moving=null){
  // In the horizontal rack build the component side faces the removed panel.
  const g=group(parent,'motherboard',[openSide?.65:-.65,1.24,-.04]);g.rotation.y=openSide?-Math.PI/2:Math.PI/2;
  box(g,[2.4,2.12,.035],[0,0,0],m.pcb,.015);
  // Geometric traces and solder points, drawn once and reused as a surface map.
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const c=canvas.getContext('2d');
  c.fillStyle='#192729';c.fillRect(0,0,1024,1024);c.strokeStyle='#46514b';c.lineWidth=1;
  for(let i=0;i<130;i++){const x=(i*97)%1000,y=(i*63)%1000;c.beginPath();c.moveTo(x,y);c.lineTo(x+28,y);c.lineTo(x+60,y+32);c.lineTo(x+60,y+100);c.stroke();c.fillStyle='#99917c';c.fillRect(x,y,3,3);}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  plane(g,2.39,2.11,new T.MeshStandardMaterial({map,roughness:.6,metalness:.35}),[0,0,.019]);
  // Parts that lift off the board in the studio explosion; static in the rack.
  const part=(name,position,offset,stage)=>moving?moving(name,position,offset,stage,g):group(g,name,position);
  // Mobile-on-desktop CPU: soldered package, then a cylindrical pump on a
  // copper cold plate (GMKtec cooling cut-away). Package lid is illustrative.
  box(g,[.6,.6,.025],[-.25,.23,.03],standard(0x223a2e,.2,.6),.008);
  box(g,[.36,.36,.03],[-.25,.23,.055],m.steel,.012);decal(g,'RYZEN 9',.25,[-.25,.23,.072],'#4b5156',.05);
  const pump=part('CPU cooling block',[-.25,.23,.07],[0,0,.8],[.35,.85]);
  disc(pump,.21,.04,[0,0,.02],m.copper);disc(pump,.24,.19,[0,0,.135],m.dark);
  ring(pump,.24,.01,[0,0,.23],m.graphite);disc(pump,.19,.012,[0,0,.236],m.graphite);
  decal(pump,'GMKtec',.28,[0,0,.244],'#c1c7c4',.05);
  // Silver VRM heatsinks on two sides of the CPU.
  box(g,[.6,.17,.03],[-.25,.66,.035],m.steel,.01);finStack(g,.56,.15,.11,[-.25,.66,.1]);
  const vrm=finStack(g,.5,.15,.11,[-.71,.21,.1]);vrm.rotation.z=Math.PI/2;box(g,[.17,.54,.03],[-.71,.21,.035],m.steel,.01);
  for(let n=0;n<2;n++){
    const ram=part('SO-DIMM',[.65,.12+n*.5,.08],[0,0,.75+n*.3],[.45+n*.08,.9+n*.05]);box(ram,[.78,.25,.025],[0,0,0],m.pcb);
    for(let i=0;i<4;i++)box(ram,[.13,.15,.035],[-.27+i*.18,0,.026],m.chip);
    box(ram,[.8,.025,.06],[0,-.14,0],m.dark);box(ram,[.8,.025,.06],[0,.14,0],m.dark);
  }
  for(let n=0;n<2;n++){const ssd=part('M.2 SSD',[.3+n*.35,-.56,.06],[0,0,.3],[.5,.95]);box(ssd,[.23,.8,.035],[0,0,0],m.dark,.01);decal(ssd,n?'M.2':'NVMe',.2,[0,0,.021],'#acb7b4',.055);}
  // The rack's upright switch runs across the host. Rotate the whole socket,
  // including its slot geometry, so the edge connector remains seated.
  const socketFrame=group(g,'PCIe socket assembly',openSide?[1.12,.33,.07]:[-.15,-.9,.07]);
  socketFrame.rotation.z=openSide?Math.PI/2:0;
  box(socketFrame,[1.65,.10,.10],[0,0,0],m.dark);decal(socketFrame,'PCIe x16',.5,[0,0,.06],'#858c90',.06);
  const slot=group(socketFrame,'motherboard-pcie-slot',[0,0,.05]);slot.rotation.x=Math.PI/2;
  const oculink=group(g,'host-oculink',[.65,-.82,.11]);
  box(oculink,[.22,.16,.09],[0,0,0],m.steel,.008);box(oculink,[.18,.035,.015],[0,0,.053],m.dark,.006);group(oculink,'cable-seat',[0,0,.07]);
  for(let i=0;i<10;i++){box(g,[.075,.09,.07],[-.93+i*.17,.94,.06],m.chip,.006);}
  screws(g,[[-1.1,-.98,.04],[1.1,-.98,.04],[-1.1,.98,.04],[1.1,.98,.04]],.025);
  return g;
}
export function host({openSide=false}={}){
  const root=group(null,'GMKtec NEO-X1 Pro');
  // Studio explosion, staged like GMKtec's render: panels and handles first,
  // then the cooling, supply and board components. stage=[start,end] of t.
  const moves=[];
  function moving(name,pos,offset,stage=[0,1],parent=root){const g=group(parent,name,pos);moves.push({g,start:g.position.clone(),offset:new T.Vector3(...offset),stage});return g;}
  // Open internal frame: corner posts joined by top and bottom rails.
  for(const x of [-.76,.76])for(const z of [-1.64,1.64])box(root,[.06,2.55,.06],[x,1.31,z],m.graphite,.01);
  for(const y of [.08,2.56]){
    for(const x of [-.76,.76])box(root,[.05,.05,3.24],[x,y,0],m.graphite,.01);
    for(const z of [-1.64,1.64])box(root,[1.46,.05,.05],[0,y,z],m.graphite,.01);
  }
  const bottom=moving('bottom-panel',[0,.025,0],[0,-.42,0],[0,.5]);
  const bp=edgedPanel(bottom,1.61,3.44,[0,0,0],m.graphite,'field');bp.rotation.x=Math.PI/2;
  const feet=moving('bottom-handles',[0,0,0],[0,-.28,0],[.25,.75],bottom);
  handle(feet,1.42,-.035,true);handle(feet,-1.53,-.035,true);
  const board=motherboard(root,openSide,moving);
  // The exposed rack layout needs clearance along the PCIe slot, including its bracket.
  const psuPosition=[openSide?-.25:.17,openSide?1.51:.58,-.92];
  internalPSU(moving('psu-assembly',psuPosition,[1.05,0,0],[.4,.95]),[0,0,0]);
  const rad=moving('radiator',[0,2.31,-.18],[.45,1.05,0],[.15,.7]);
  box(rad,[1.28,.22,2.56],[0,0,0],m.dark,.035);
  const fins=[];for(let z=-1.2;z<1.2;z+=.04)fins.push([0,.12,z]);
  instances(rad,new T.BoxGeometry(1.12,.035,.012),m.graphite,fins);
  // Mounting bracket with the oval cut-outs visible in both GMKtec renders.
  extrude(rad,[[-.68,-1.4],[.68,-1.4],[.68,1.4],[-.68,1.4]],[],.025,m.graphite,[0,.145,0],.006).rotation.x=-Math.PI/2;
  for(const z of [-.64,.64])box(rad,[.86,.012,.2],[0,.18,z],m.rubber,.006);
  const radFans=moving('radiator-fans',[0,0,0],[0,-.3,0],[.5,1],rad);
  for(const z of [-.64,.64]){const f=group(radFans,'radiator-fan',[0,-.14,z]);f.rotation.x=Math.PI/2;
    extrude(f,[[-.59,-.59],[.59,-.59],[.59,.59],[-.59,.59]],[[0,0,.54]],.07,m.dark,[0,0,0],.015);axialFan(f,.52,[0,0,.04]);screws(f,[[-.53,-.53,.09],[.53,-.53,.09],[-.53,.53,.09],[.53,.53,.09]],.025);
  }
  const hosePoints=points=>points.map(([x,y,z])=>[openSide?-x:x,y,z]);
  const hoses=[tube(root,hosePoints([[-.36,1.47,.18],[.29,1.45,.77],[.48,1.95,.62],[.45,2.25,.9]]),.038),
    tube(root,hosePoints([[-.36,1.32,.18],[.42,1.17,.89],[.62,1.85,.68],[.6,2.25,.9]]),.038)];
  const sideFanMount=moving('side-fan',[.71,1.35,.1],[.62,0,0],[.15,.65]);
  const sideFan=axialFan(sideFanMount,.47,[0,0,0]);sideFan.rotation.y=Math.PI/2;
  extrude(sideFanMount,[[-.56,-.56],[.56,-.56],[.56,.56],[-.56,.56]],[[0,0,.5]],.05,m.dark,[-.06,0,0],.012).rotation.y=Math.PI/2;
  sideFanMount.visible=!openSide;
  const front=moving('front-panel',[0,1.325,1.72],[-1.15,0,1.15],[0,.55]);
  box(front,[1.65,2.65,.12],[0,0,0],m.graphite,.075);
  decal(front,'GMKtec',.91,[0,.78,.067],'#747b78',.16);
  disc(front,.074,.025,[-.48,-1.03,.073],m.led);
  ring(front,.031,.003,[-.48,-1.03,.089],m.graphite);
  box(front,[.004,.029,.003],[-.48,-1.002,.092],m.graphite);
  disc(front,.024,.012,[-.24,-1.03,.073],m.steel);disc(front,.017,.016,[-.24,-1.03,.08],m.rubber);
  for(const x of [-.04,.19]){box(front,[.07,.15,.018],[x,-1.03,.071],m.steel,.008);box(front,[.045,.125,.02],[x,-1.03,.081],m.dark,.006);box(front,[.016,.09,.022],[x-.008,-1.03,.084],m.chip);}
  box(front,[.04,.085,.02],[.43,-1.03,.075],m.steel,.018);box(front,[.023,.063,.025],[.43,-1.03,.08],m.dark,.01);
  decal(front,'AUDIO     USB      USB      TYPE-C',.85,[.09,-1.16,.069],'#8b9190',.04);
  const side=moving('right-panel',[.817,1.325,0],[1.75,0,-1.75],[0,.55]);
  const p=edgedPanel(side,3.43,2.6,[0,0,0],m.graphite,'side');p.rotation.y=Math.PI/2;
  const left=moving('left-panel',[-.817,1.325,0],[-1.05,0,0],[0,.55]);
  const lp=edgedPanel(left,3.43,2.6,[0,0,0],m.graphite,'field');lp.rotation.y=-Math.PI/2;
  left.visible=!openSide;
  const top=moving('lime-top',[0,2.66,0],[0,1.5,0],[0,.55]);
  const tp=edgedPanel(top,1.61,3.44,[0,0,0],m.lime);tp.rotation.x=-Math.PI/2;
  const topHandles=moving('top-handles',[0,0,0],[0,.5,0],[.3,.8],top);
  handle(topHandles,1.42,.01);handle(topHandles,-1.53,.01);
  const rear=group(root,'rear-io',[0,1.31,-1.72]);rear.rotation.y=Math.PI;
  const rp=edgedPanel(rear,1.6,2.6,[0,0,0],m.graphite);
  box(rear,[.57,1.55,.04],[-.44,.45,.025],m.steel,.02);
  for(let i=0;i<6;i++){box(rear,[i<3?.13:.34,.09,.04],[-.44,1.04-i*.21,.055],m.dark,.008);if(i===4)box(rear,[.24,.055,.01],[-.44,.20,.08],standard(0x2d61a4));}
  for(const x of [-.58,-.44,-.30])disc(rear,.035,.018,[x,-.22,.067],m.steel);
  box(rear,[.42,.23,.06],[.42,1.07,.04],m.rubber,.025);
  for(const x of [.30,.42,.54])box(rear,[.025,.07,.02],[x,1.07,.076],m.steel);
  for(let i=0;i<4;i++){box(rear,[1.30,.17,.04],[0,-.55-i*.22,.03],m.dark,.015);decal(rear,i===1?'PCIe EXPANSION':'•  •  •  •  •  •  •',1.14,[0,-.55-i*.22,.052],'#7f868a',.05);}
  const ease=(t,[a,b])=>{const x=T.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
  return {root,pcieSlot:board.getObjectByName('motherboard-pcie-slot'),explode(t){
    for(const {g,start,offset,stage} of moves){const k=ease(t,stage);g.position.copy(start).addScaledVector(offset,k);if(g.name==='radiator')g.rotation.z=1.2*k;}
    // The radiator rolls its fan side towards the viewer. Lift the chassis so
    // the bottom panel and feet clear the studio floor.
    // Fixed hoses would dangle from moved parts, so they hide once it opens.
    root.position.y=.72*ease(t,[0,.5]);for(const hose of hoses)hose.visible=t<.02;
  }};
}
export function rack(){
  // TecMojo 12U: 520 W × 512 D × 534 body H; 604 H including casters.
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
  for(const y of [.82,5.96]){
    box(g,[5.16,.045,5.08],[0,y,0],m.dark,.015);
    for(const z of [-2.54,2.54]){
      box(g,[5.2,.28,.045],[0,y-.09,z],m.graphite,.012);
      const vents=[];for(let x=-2.2;x<2.3;x+=.16)for(const yy of [-.17,-.09,-.01]){if(Math.abs(x)>.4)vents.push([x,y+yy,z+(z>0?.027:-.027)]);}
      instances(g,new T.BoxGeometry(.115,.034,.006),m.rubber,vents);
      if(z>0)decal(g,'Tec MOJO',.7,[0,y-.08,z+.027],'#e1e3e1',.15);
      const s=group(g,'rack-screws',[0,0,z+.03]);screws(s,[[-2.46,y-.02,0],[2.46,y-.02,0]],.045);
    }
    for(const x of [-2.56,2.56])box(g,[.06,.13,5.1],[x,y+.04,0],m.graphite,.009);
  }
  for(const x of [-1.68,1.68]){const r=ring(g,.15,.035,[x,5.992,-2.18],m.rubber);r.rotation.x=-Math.PI/2;}
  return g;
}
export function switchBoard(){
  // Owner-supplied plx-pcie-switch.png: blue add-in card, ten SFF-8654
  // receptacles and a silver blower/heatsink. Size is photo-proportioned, not CAD.
  // Origin is the PCIe edge connector's insertion centre; card rises along +Y.
  const g=group(null,'PEX88096 expansion card'),blue=standard(0x12638b,.28,.56);
  box(g,[2.70,1.10,.035],[-.16,.62,0],blue,.015);
  edgeConnector(g,0,.035,0,1.55);
  box(g,[.04,1.37,.26],[-1.53,.60,.07],m.steel,.008);
  box(g,[.18,.045,.29],[-1.58,1.29,.07],m.steel,.008);
  const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=580;const c=canvas.getContext('2d');
  c.fillStyle='#07577d';c.fillRect(0,0,1400,580);c.strokeStyle='#32839f';c.lineWidth=1;
  for(let i=0;i<70;i++){const y=190+i*3;c.beginPath();c.moveTo(580,y);c.lineTo(700+i*3,y);c.lineTo(810+i*3,60+(i%6)*15);c.stroke();}
  for(let i=0;i<110;i++){const x=20+(i*61)%1320,y=40+(i*97)%470;c.fillStyle=i%3?'#b7c0b1':'#526f7d';c.fillRect(x,y,5,2);}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  plane(g,2.68,1.08,new T.MeshStandardMaterial({map,roughness:.58,metalness:.25}),[-.16,.62,.019]);
  const ports=[[-1.25,1.01],[-.8,1.01],[-.35,1.01],[.1,1.01],[.55,1.01],[1.0,1.01],[1.0,.62],[.1,.24],[.55,.24],[1.0,.24]];
  ports.forEach(([x,y],i)=>{
    const socket=slimSAS(g,`downstream-${i}`,[x,y,.025]);
    decal(g,String(i+1),.065,[x+.12,y+.12,.022],'#d1e0d9',.04);
  });
  finStack(g,.37,.59,.14,[-.79,.46,.12]);
  extrude(g,[[-.57,.16],[.02,.16],[.02,.76],[-.57,.76]],[[-.27,.47,.229]],.055,m.steel,[0,0,.15],.012);
  disc(g,.222,.07,[-.27,.47,.145],m.rubber);
  const blades=new T.InstancedMesh(new T.BoxGeometry(.009,.063,.045),m.copper,32);blades.castShadow=true;
  for(let i=0;i<32;i++){const a=i*Math.PI*2/32;xyz.position.set(-.27+Math.cos(a)*.163,.47+Math.sin(a)*.163,.19);xyz.rotation.set(0,0,a-.45);xyz.updateMatrix();blades.setMatrixAt(i,xyz.matrix);}g.add(blades);
  disc(g,.105,.035,[-.27,.47,.22],m.dark);ring(g,.23,.009,[-.27,.47,.219],m.silver);
  screws(g,[[-.56,.18,.22],[0,.18,.22],[-.56,.74,.22],[0,.74,.22]],.021);
  for(let i=0;i<4;i++){box(g,[.09,.1,.05],[-1.27+(i%2)*.15,.25+Math.floor(i/2)*.19,.05],m.chip,.008);}
  for(let i=0;i<3;i++){disc(g,.035,.055,[-1.35,.40+i*.16,.05],m.steel);}
  decal(g,'PEX88096',.62,[.46,.59,.025],'#d9e8e9',.105);
  decal(g,'PCIe 4.0',.42,[.43,.45,.025],'#b0c9cf',.06);
  screws(g,[[-1.43,.10,.025],[-1.43,1.10,.025],[.85,.1,.025],[.85,1.10,.025]],.024);
  g.scale.setScalar(.9);return g;
}
function slimSAS(parent,name,position){
  const s=group(parent,name,position);
  box(s,[.20,.26,.13],[0,0,.065],m.dark,.01);
  box(s,[.105,.25,.04],[.044,0,.15],m.steel,.008);
  box(s,[.028,.08,.007],[.049,0,.174],m.rubber,.004);
  for(const y of [-.075,.075])box(s,[.025,.034,.006],[.051,y,.174],m.dark,.003);
  group(s,'cable-seat',[0,0,.18]);return s;
}
export function riserBoard(){
  const g=group(null,'dual-SFF-8654 GPU breakout');
  box(g,[1.80,.055,.48],[0,0,0],standard(0x237040,.3,.55),.012);
  box(g,[1.35,.10,.075],[-.13,.07,-.12],m.dark);
  box(g,[1.28,.012,.042],[-.13,.127,-.12],m.silver);
  for(let i=0;i<2;i++){const s=slimSAS(g,`riser-port-${i}`,[-.37+i*.62,.04,.10]);s.rotation.x=-Math.PI/2;}
  box(g,[.15,.12,.20],[.80,.08,.03],m.dark,.012);
  return g;
}
export function powerSupply(){
  const g=group(null,'external power');box(g,[1.5,2.1,1.8],[0,1.05,0],m.dark,.045);
  const face=edgedPanel(g,1.38,1.95,[0,1.05,.908],m.graphite);
  decal(g,'COOLER MASTER',1.1,[0,1.6,.925],'#b4b7ba',.12);decal(g,'2000 W',.75,[0,1.32,.925],'#c6cacc',.17);
  for(let x=0;x<3;x++)for(let y=0;y<3;y++)box(g,[.24,.13,.035],[-.38+x*.38,.4+y*.2,.94],m.rubber,.008);
  box(g,[1.1,.07,.72],[0,2.18,0],m.graphite,.04);box(g,[.1,.35,.12],[0,2.36,0],m.dark,.025);
  const f=axialFan(g,.58,[0,2.93,0]);for(const r of [.2,.32,.44,.59])ring(f,r,.012,[0,0,.09],m.graphite);
  for(let i=0;i<12;i++){const bar=box(f,[.018,1.16,.018],[0,0,.10],m.graphite);bar.rotation.z=i*Math.PI/12;}
  return g;
}
