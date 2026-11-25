import * as THREE from 'three';
import { OrbitControls } from '../lib/three-r180/OrbitControls.js';
import { RoomEnvironment } from '../lib/three-r180/RoomEnvironment.js';
import { host, gpu, egpuDock, rack, switchBoard, riserBoard, powerSupply, clipFan, rearFan, gpuFrame, SHELF, group, box, tube, materials } from './models.js';
import { parts } from './parts.js';

const $ = id => document.getElementById(id);
const viewport = $('viewport'), reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.domElement.setAttribute('aria-hidden', 'true'); viewport.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(room, .04); scene.environment = environment.texture;
scene.environmentIntensity = .85; room.dispose(); pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xeaf0ff,0x292b2e,1.1));
function light(color,intensity,position){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...position);scene.add(l);return l;}
const key=light(0xfff4e5,2.4,[4,10,6]);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-9,right:9,top:12,bottom:-6,near:.1,far:35});key.shadow.bias=-.0004;key.shadow.normalBias=.025;key.shadow.radius=3;
light(0xd7e5ff,1.5,[-6,4,4]);light(0xf0f4ff,2.8,[2,6,-7]);
// True isometric projection: orthographic, equal foreshortening on all three
// axes (camera along a [±1,1,±1] diagonal, 35.264° elevation). Framing is by
// camera.zoom; the camera distance only has to clear the near plane.
const ISO_POLAR=Math.acos(1/Math.sqrt(3)),QUARTER=Math.PI/2,CAMERA_DISTANCE=30;
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,90);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enablePan=false;controls.enableDamping=false;controls.enableZoom=false;
controls.minPolarAngle=.1;controls.maxPolarAngle=Math.PI*.69;controls.minZoom=.05;controls.maxZoom=5;
// Article wheel scrolling stays native. Explicit zoom buttons work everywhere.
controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')controls.enableZoom=true;});
renderer.domElement.addEventListener('pointerup',()=>{controls.enableZoom=false;});
renderer.domElement.addEventListener('pointercancel',()=>{controls.enableZoom=false;});

const rig=group(scene,'full rig'), models=group(scene,'product studio');rig.add(rack());
const assemblies={},moving=[];
function mount(id,object,position,offset=[0,0,0],rotation=0){
  const pivot=group(rig,id,position);pivot.add(object);pivot.rotation.y=rotation;pivot.userData.part=id;
  assemblies[id]=pivot;moving.push({pivot,start:pivot.position.clone(),offset:new THREE.Vector3(...offset),rotation});return pivot;
}
// Layout taken from the owner's rack photos. The lower shelf holds the PC on
// its side (removed panel up) with the dock beside it; the upper shelf holds
// the four-card frame with the power supply standing at the right rear.
const LOWER_TOP=SHELF.lower+SHELF.thickness/2,UPPER_TOP=SHELF.upper+SHELF.thickness/2;
const rackHost=host({openSide:true});rackHost.root.rotation.z=-Math.PI/2;
mount('host',rackHost.root,[-1.72,LOWER_TOP+.83,.55],[0,0,1.1]);
const switchModel=switchBoard();
const switchMount=group(rackHost.pcieSlot,'installed PEX88096');switchMount.userData.part='switch';switchMount.add(switchModel);assemblies.switch=switchMount;
const protoAMD=gpu('amd'),protoNVIDIA=gpu('nvidia');
// Every card stands in a breakout board at the same height, on brass
// standoffs over 20 mm rails, and the brackets line up at the rear.
const BOARD_Y=UPPER_TOP+.2+.1+.015,BRACKET_Z=-.55;
const cardSpecs=[
  {id:'nv1',proto:protoNVIDIA,x:-2.05,L:2.999,H:1.269,edgeZ:-.517*.28,bracketY:-.085},
  {id:'nv2',proto:protoNVIDIA,x:-.91,L:2.999,H:1.269,edgeZ:-.517*.28,bracketY:-.085},
  {id:'amd1',proto:protoAMD,x:.23,L:2.67,H:1.11,edgeZ:-.40*.28,bracketY:-.005},
  {id:'amd2',proto:protoAMD,x:1.37,L:2.67,H:1.11,edgeZ:-.40*.28,bracketY:-.005}];
cardSpecs.forEach((spec,i)=>{
  spec.drop=spec.H/2+.125;spec.y=BOARD_Y+spec.drop;spec.z=BRACKET_Z+spec.L/2;
  mount(spec.id,spec.proto.clone(true),[spec.x,spec.y,spec.z],[(i-1.5)*1.3,.7+(i%2)*1.3,.15],-Math.PI/2);
  // Slot centre under the card's edge connector: x -.275 to -.35, z -.12 to the PCB plane.
  const support=riserBoard();support.name='riser';support.position.set(-.075,-spec.drop,spec.edgeZ+.12);assemblies[spec.id].add(support);
});
const cardFrame=gpuFrame(cardSpecs.map(spec=>({x:spec.x,z:spec.z-.075,postZ:BRACKET_Z,postHeight:spec.y+spec.bracketY+.62-UPPER_TOP})),2.3,BRACKET_Z-.17);
cardFrame.position.y=UPPER_TOP;rig.add(cardFrame);
const dock=egpuDock();mount('nv3',dock,[1.78,LOWER_TOP,.35],[.8,.15,1.25],-Math.PI/2);
// The switch is a child of the motherboard socket, seated when separation is zero.
// Power supply on its side panel at the right rear of the top shelf, fan
// outwards, modular face to the front, with the clip-on fan on top of it.
const psu=powerSupply();psu.rotation.z=-Math.PI/2;psu.position.set(-.43,.75,0);
const psuStand=group(null,'standing power supply');psuStand.add(psu);
const deskFan=clipFan();deskFan.position.set(0,1.5,.25);
deskFan.getObjectByName('fan-yaw').rotation.y=-Math.PI/2-.3;deskFan.getObjectByName('fan-head').rotation.x=.6;psuStand.add(deskFan);
mount('power',psuStand,[2.12,UPPER_TOP,-1.4],[1.6,.4,-.6]);
const backFan=rearFan();backFan.position.set(-.34,UPPER_TOP,-1.6);rig.add(backFan);
const cables=group(rig,'illustrative cable routes');
const gpuIds=cardSpecs.map(spec=>spec.id),portPairs=[[0,1],[2,3],[4,5],[7,8]];
const worldPosition=object=>object.getWorldPosition(new THREE.Vector3());
const switchPort=index=>switchModel.getObjectByName(`downstream-${index}`).getObjectByName('cable-seat');
rig.updateMatrixWorld(true);
// SlimSAS plug: grey body and the pale-blue ribbon tail visible in the photos.
// A seat's +Z is the way the cable leaves; its Y lies along the socket's width.
const ribbon=new THREE.MeshStandardMaterial({color:0x74b6dc,roughness:.6,metalness:.1});
const leaving=seat=>new THREE.Vector3(0,0,1).applyQuaternion(seat.getWorldQuaternion(new THREE.Quaternion()));
function sasPlug(seat){
  const plug=group(cables,'sas-plug');seat.getWorldPosition(plug.position);seat.getWorldQuaternion(plug.quaternion);
  box(plug,[.05,.2,.09],[0,0,.045],materials.graphite,.008);box(plug,[.012,.18,.1],[0,0,.14],ribbon);
}
cardSpecs.forEach((spec,i)=>{
  for(let n=0;n<2;n++){
    const from=assemblies[spec.id].getObjectByName(`riser-port-${n}`).getObjectByName('cable-seat'),to=switchPort(portPairs[i][n]);
    const start=worldPosition(from),end=worldPosition(to),lane=(n-.5)*.1;
    sasPlug(from);sasPlug(to);
    // Each end leaves its socket along the socket's own axis. On the breakout
    // board that is along the board towards the rack front (the rear socket's
    // cable passes over the front socket), then over the shelf edge and down.
    // At the switch it runs along the card before turning up out of the PC.
    const a=start.clone().addScaledVector(leaving(from),.22),b=end.clone().addScaledVector(leaving(to),.26);
    tube(cables,[start.toArray(),a.toArray(),[a.x+lane*.6,a.y+(n?0.02:.12),a.z+(n?.3:.62)],[a.x+lane,UPPER_TOP+.36,2.38],[a.x+.04+lane,UPPER_TOP-.25,2.74],
      [(a.x+b.x)/2-.25+lane,4.35,2.72],[b.x-.12+lane,3.6,b.z+.6],[b.x-.02,b.y+.32,b.z+.2],b.toArray(),end.toArray()],.03,materials.graphite);
  }
});
// Ten power leads from the supply's modular face: two per RTX 3090, one per
// R9700 and one per breakout board. Which socket feeds which is illustrative.
let psuOut=0;
cardSpecs.forEach(spec=>{
  const leads=[];assemblies[spec.id].traverse(o=>{if(o.name==='power-lead')leads.push(o);});
  leads.forEach(lead=>{
    const start=worldPosition(lead),end=worldPosition(psu.getObjectByName(`psu-out-${psuOut}`)),k=psuOut++;
    const low=start.y<UPPER_TOP+.6;
    tube(cables,low
      ?[start.toArray(),[start.x,start.y+.02,start.z+.14],[start.x+.12,UPPER_TOP+.42,2.36],[1.85,UPPER_TOP+.3+k*.01,2.3],[2.3,UPPER_TOP+.34,.5],[end.x,end.y,end.z+.3],end.toArray()]
      :[start.toArray(),[start.x,start.y+.3,start.z],[start.x+.4,start.y+.3,start.z+.45],[1.85,UPPER_TOP+.8+k*.03,2.05],[2.25,UPPER_TOP+.55+k*.02,.55],[end.x,end.y,end.z+.3],end.toArray()],.03);
  });
});
const hostOCuLink=rackHost.root.getObjectByName('host-oculink').getObjectByName('cable-seat');
const dockOCuLink=dock.getObjectByName('dock-oculink').getObjectByName('cable-seat');
const ocStart=worldPosition(hostOCuLink),ocEnd=worldPosition(dockOCuLink);
// The plug lies along the motherboard beside the x16 slot, so the cable first
// runs towards the PC's front below the switch's leads, then rises out of the
// open GPU bay and crosses the bracket to the dock.
const ocA=ocStart.clone().addScaledVector(leaving(hostOCuLink),.3);
const ocCable=tube(cables,[ocStart.toArray(),ocA.toArray(),[ocA.x-.05,ocA.y+.03,.6],[ocA.x-.04,ocA.y+.06,1.3],[ocA.x+.02,ocA.y+.5,1.62],[-.95,LOWER_TOP+1.5,1.66],[-.45,LOWER_TOP+1.85,1.55],
  [.55,LOWER_TOP+1.86,ocEnd.z+.6],[1.1,LOWER_TOP+1.5,ocEnd.z+.25],[1.1,ocEnd.y+.25,ocEnd.z+.03],[ocEnd.x-.1,ocEnd.y,ocEnd.z],ocEnd.toArray()],.032);
ocCable.name='single OCuLink host cable';
// The OCuLink plug and its boot, mated with the adapter's receptacle.
const ocPlug=group(cables,'oculink-plug');hostOCuLink.getWorldPosition(ocPlug.position);hostOCuLink.getWorldQuaternion(ocPlug.quaternion);
box(ocPlug,[.06,.17,.2],[0,0,.1],materials.black,.01);box(ocPlug,[.05,.12,.12],[0,0,.25],materials.rubber,.02);
const studioHost=host();models.add(studioHost.root);
const studioSwitch=switchBoard();studioSwitch.position.y=.16;models.add(studioSwitch);
const studioAMD=protoAMD.clone(true),studioNVIDIA=protoNVIDIA.clone(true);
studioAMD.position.y=.78;studioNVIDIA.position.y=.82;models.add(studioAMD,studioNVIDIA);
const studioDock=egpuDock();models.add(studioDock);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.25}));ground.rotation.x=-Math.PI/2;ground.position.y=-.3;ground.receiveShadow=true;scene.add(ground);
const connectionGroup=group(scene,'PCIe topology');
const linksMaterial=new THREE.LineBasicMaterial({color:0x82d9e5,transparent:true,opacity:.85});
const extraMaterial=new THREE.LineDashedMaterial({color:0xb5e853,transparent:true,opacity:.9,dashSize:.12,gapSize:.07});
const routes=[['host','switch'],...['nv1','nv2','amd1','amd2'].map(id=>['switch',id]),['host','nv3']];
const lines=routes.map((_,i)=>{const l=new THREE.Line(new THREE.BufferGeometry(),i===5?extraMaterial:linksMaterial);connectionGroup.add(l);return l;});
function updateLinks(){
  routes.forEach(([a,b],i)=>{
    // Resolve nested objects in world space so the connection follows the host.
    const start=i===5?worldPosition(hostOCuLink):a==='host'?worldPosition(rackHost.pcieSlot):worldPosition(switchPort(portPairs[i-1][0]));
    const end=i===5?worldPosition(dockOCuLink):worldPosition(assemblies[b]);if(i!==5&&(b.startsWith('nv')||b.startsWith('amd')))end.y-=.6;
    const front=Math.max(start.z,end.z)+1.8;
    const points=i===0?[start,end]:new THREE.CatmullRomCurve3([start,new THREE.Vector3(start.x,start.y+.25,front),new THREE.Vector3(end.x,end.y-.3,front),end]).getPoints(36);
    lines[i].geometry.dispose();lines[i].geometry=new THREE.BufferGeometry().setFromPoints(points);lines[i].computeLineDistances();
  });
}
const viewInfo={
  host:{title:'01 / GMKtec NEO-X1 Pro',dim:'350 × 165 × 265 mm · body',note:'Side-mounted 240 mm radiator · five fans · 850 W SFX supply',corner:-1,part:'host',url:'https://www.gmktec.uk/products/gmktec-neo-x1-series-amd-ryzen%E2%84%A2-9-9955hx-9955hx3d-modt-gaming-pc?variant=47533365100715'},
  amd:{title:'02 / Gigabyte Radeon AI PRO R9700',dim:'267 × 111 × 40 mm · 32 GB',note:'AI TOP · dual-slot blower · 16-pin power',corner:0,part:'amd1',url:'https://www.gigabyte.com/uk/Graphics-Card/GV-R9700AI-TOP-32GD-rev-10'},
  nvidia:{title:'03 / ASUS TUF Gaming RTX 3090 OC',dim:'299.9 × 126.9 × 51.7 mm · 24 GB',note:'Three axial fans · 2.7 slots · dual 8-pin power',corner:0,part:'nv1',url:'https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx3090-o24g-gaming/'},
  switch:{title:'04 / PEX88096 PCIe switch card',dim:'10 SlimSAS (SFF-8654) connectors · active cooling',note:'Board RBE16A54C-V11A · plugs into the PC’s x16 slot',corner:0,part:'switch',url:null},
  dock:{title:'05 / ZOTAC Twin Edge OC + AOOSTAR AG03',dim:'5070: 241.5 × 120.1 × 40.6 mm · 12 GB',note:'AG03: integrated 800 W PSU · one OCuLink host connection',corner:0,part:'nv3',url:'https://www.zotac.com/product/graphics_card/zotac-gaming-geforce-rtx-5070-twin-edge-oc',secondaryUrl:'https://aoostar.com/products/aoostar-ag03-egpu-dock'},
  rig:{title:'06 / The complete inference lab',dim:'12U · 520 × 512 × 604 mm rack',note:'PC on its side, panel off · four cards in a frame · supply on the top shelf',corner:0,part:'host',url:null}
};
let view='host',separation=0,destination=0,scheduled=0,visible=true,lastTime=0,autoFraming=false,turn=0,goalZoom=1;
const goalCamera=new THREE.Vector3(),goalTarget=new THREE.Vector3();
const isoDirection=()=>new THREE.Vector3().setFromSpherical(new THREE.Spherical(1,ISO_POLAR,Math.PI/4+(viewInfo[view].corner+turn)*QUARTER));
function requestRender(){if(!scheduled&&visible&&!document.hidden)scheduled=requestAnimationFrame(render);}
function select(id){$('component').value=id;['part-tag','part-title','part-copy','spec-label','spec-value','part-note'].forEach((field,i)=>{$(field).textContent=parts[id][i];});requestRender();}
function arrange(){
  studioHost.explode(view==='host'?separation:0);
  placeRig(separation);
  cables.visible=separation<.025;if(view==='rig')updateLinks();
}
function placeRig(t){for(const {pivot,start,offset,rotation}of moving){pivot.position.copy(start).addScaledVector(offset,t);pivot.rotation.y=rotation*(1-t*.75);}switchMount.position.y=1.5*t;}
// Screen space the overlaid title, caption and camera buttons occupy, in CSS pixels.
function overlayInsets(){
  // Measure the label text, not .scene-meta itself: on mobile its box spans the scene.
  // Hidden overlays (display:none, e.g. the share-card capture) report empty rects.
  const area=viewport.getBoundingClientRect(),caption=document.querySelector('.model-caption').getBoundingClientRect();
  const metaBottom=Math.max(area.top,...[...document.querySelectorAll('.scene-meta>span')].map(span=>span.getBoundingClientRect()).filter(r=>r.height).map(r=>r.bottom));
  const top=metaBottom-area.top+14,bottom=(caption.height?Math.max(0,area.bottom-caption.top):0)+12,scale=Math.min(1,area.height*.5/(top+bottom));
  return {top:top*scale,bottom:bottom*scale,side:Math.max(14,area.width*.035)};
}
function frame(animate=false){
  const direction=isoDirection();
  const object=view==='rig'?rig:view==='host'?studioHost.root:view==='amd'?studioAMD:view==='switch'?studioSwitch:view==='dock'?studioDock:studioNVIDIA;
  const cablesShown=cables.visible;
  if(view==='host')studioHost.explode(destination);
  if(view==='rig'){placeRig(destination);cables.visible=destination<.025;}
  object.updateMatrixWorld(true);
  // Orthographic fit: project the world-space box of every visible mesh onto
  // the screen axes. traverseVisible skips hidden panels and their children.
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
  const up=new THREE.Vector3().crossVectors(direction,right);
  const min=new THREE.Vector3(Infinity,Infinity,Infinity),max=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
  const box=new THREE.Box3(),point=new THREE.Vector3(),projected=new THREE.Vector3();
  object.traverseVisible(child=>{
    if(!child.isMesh)return;
    if(child.isInstancedMesh){if(!child.boundingBox)child.computeBoundingBox();box.copy(child.boundingBox);}
    else{if(!child.geometry.boundingBox)child.geometry.computeBoundingBox();box.copy(child.geometry.boundingBox);}
    for(let i=0;i<8;i++){
      point.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(child.matrixWorld);
      projected.set(point.dot(right),point.dot(up),point.dot(direction));min.min(projected);max.max(projected);
    }
  });
  if(view==='host')studioHost.explode(separation);
  if(view==='rig'){placeRig(separation);cables.visible=cablesShown;}
  const width=viewport.clientWidth||1,height=viewport.clientHeight||1,inset=overlayInsets();
  const unitsPerPixel=Math.max((max.x-min.x)/Math.max(1,width-2*inset.side),(max.y-min.y)/Math.max(1,height-inset.top-inset.bottom));
  // Centre the model in the clear area between the overlays, not the canvas.
  const lift=(inset.bottom-inset.top)/2*unitsPerPixel;
  goalTarget.set(0,0,0).addScaledVector(right,(min.x+max.x)/2).addScaledVector(up,(min.y+max.y)/2-lift).addScaledVector(direction,(min.z+max.z)/2);
  goalCamera.copy(goalTarget).addScaledVector(direction,CAMERA_DISTANCE);
  goalZoom=2/(height*unitsPerPixel);autoFraming=animate;
  if(!animate){camera.position.copy(goalCamera);controls.target.copy(goalTarget);camera.zoom=goalZoom;camera.updateProjectionMatrix();controls.update();}
  updateProjectionLabel();requestRender();
}
let projectionLabel='';
function updateProjectionLabel(){
  // Isometric only while looking down a true [±1,1,±1] diagonal.
  const s=new THREE.Spherical().setFromVector3((autoFraming?goalCamera:camera.position).clone().sub(autoFraming?goalTarget:controls.target));
  const offCorner=Math.abs(THREE.MathUtils.euclideanModulo(s.theta-Math.PI/4+QUARTER/2,QUARTER)-QUARTER/2);
  const label=Math.abs(s.phi-ISO_POLAR)<.004&&offCorner<.004?'ISOMETRIC':'FREE ORBIT';
  if(label!==projectionLabel){projectionLabel=label;$('projection').textContent=label;}
}
function setView(next){
  view=next;rig.visible=view==='rig';models.visible=view!=='rig';studioHost.root.visible=view==='host';studioAMD.visible=view==='amd';studioNVIDIA.visible=view==='nvidia';studioSwitch.visible=view==='switch';studioDock.visible=view==='dock';
  ground.position.y=view==='rig'?0:-.3;connectionGroup.visible=view==='rig'&&$('links').checked;
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  $('view-title').textContent=viewInfo[view].title;$('view-dimensions').textContent=viewInfo[view].dim;$('view-description').textContent=viewInfo[view].note;
  $('reference-link').hidden=!viewInfo[view].url;if(viewInfo[view].url)$('reference-link').href=viewInfo[view].url;
  $('dock-reference-link').hidden=!viewInfo[view].secondaryUrl;if(viewInfo[view].secondaryUrl)$('dock-reference-link').href=viewInfo[view].secondaryUrl;
  const canExplode=view==='rig'||view==='host';$('explode').disabled=!canExplode;$('separation').disabled=!canExplode;$('links').disabled=view!=='rig';
  $('explosion-hint').textContent=view==='host'?'Enclosure study. In the rack, the upward-facing side panel is removed.':view==='rig'?'The switch is seated in the motherboard. Separate the build to trace its connections.':view==='switch'?'Inspect the blue PCB, blower cooler and ten cable connectors.':view==='dock'?'Orbit to inspect the twin-fan card, dock ports and integrated PSU. Dock proportions and cable routing are photo-derived.':'Orbit to inspect the fan face, backplate and connectors.';
  viewport.dataset.view=view;turn=0;separation=0;setSeparation(0);select(viewInfo[view].part);arrange();frame();
}
function setSeparation(value){
  destination=value/100;$('separation').value=value;$('separation-value').value=`${value}%`;
  $('explode').textContent=destination>.5?'Reassemble ↙':view==='host'?'Open the chassis ↗':'Explode the build ↗';
  if(reducedMotion.matches){separation=destination;arrange();}if(view==='host'||view==='rig')frame(!reducedMotion.matches);requestRender();
}
function render(time){
  scheduled=0;const delta=Math.min((time-lastTime)/1000,.05);lastTime=time;
  if(Math.abs(destination-separation)>.001){separation=reducedMotion.matches?destination:THREE.MathUtils.damp(separation,destination,9,delta);arrange();requestRender();}
  else if(separation!==destination){separation=destination;arrange();}
  if(autoFraming){
    // Turn around the vertical axis (turntable), not through the chord.
    const alpha=1-Math.exp(-9*delta);
    const now=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const goal=new THREE.Spherical().setFromVector3(goalCamera.clone().sub(goalTarget));
    const dTheta=THREE.MathUtils.euclideanModulo(goal.theta-now.theta+Math.PI,2*Math.PI)-Math.PI;
    now.theta+=dTheta*alpha;now.phi+=(goal.phi-now.phi)*alpha;now.radius+=(goal.radius-now.radius)*alpha;
    controls.target.lerp(goalTarget,alpha);camera.position.setFromSpherical(now).add(controls.target);
    camera.zoom+=(goalZoom-camera.zoom)*alpha;
    if(Math.abs(dTheta)<1e-4&&Math.abs(goal.phi-now.phi)<1e-4&&controls.target.distanceToSquared(goalTarget)<1e-6&&Math.abs(goalZoom-camera.zoom)<goalZoom*1e-4){
      camera.position.copy(goalCamera);controls.target.copy(goalTarget);camera.zoom=goalZoom;autoFraming=false;
    }
    camera.updateProjectionMatrix();controls.update();requestRender();
  }
  renderer.render(scene,camera);
}
function resize(){
  const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);
  // Unit half-height frustum; camera.zoom sets the visible scale.
  Object.assign(camera,{left:-w/h,right:w/h,top:1,bottom:-1});camera.updateProjectionMatrix();frame();
}
// Quarter-turns step between the four isometric corners and refit the model.
function rotate(direction){turn+=direction;frame(!reducedMotion.matches);}
function zoom(factor){autoFraming=false;camera.zoom=THREE.MathUtils.clamp(camera.zoom/factor,controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();controls.update();requestRender();}
controls.addEventListener('change',()=>{updateProjectionLabel();requestRender();});
controls.addEventListener('start',()=>{autoFraming=false;});
$('separation').addEventListener('input',e=>setSeparation(Number(e.target.value)));$('explode').addEventListener('click',()=>setSeparation(destination>.5?0:100));
$('component').addEventListener('change',e=>{const id=e.target.value;if(view!=='rig')setView('rig');select(id);});
$('links').addEventListener('change',e=>{connectionGroup.visible=view==='rig'&&e.target.checked;requestRender();});$('reset-view').addEventListener('click',()=>{turn=0;frame(!reducedMotion.matches);});
$('rotate-left').addEventListener('click',()=>rotate(-1));$('rotate-right').addEventListener('click',()=>rotate(1));$('zoom-in').addEventListener('click',()=>zoom(.85));$('zoom-out').addEventListener('click',()=>zoom(1/.85));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-1:1);}if(e.key==='+'||e.key==='=')zoom(.85);if(e.key==='-')zoom(1/.85);});
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let press=null;
renderer.domElement.addEventListener('pointerdown',e=>{press=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{
  if(view!=='rig'||!press||Math.hypot(press[0]-e.clientX,press[1]-e.clientY)>5)return;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
  for(const hit of ray.intersectObjects(Object.values(assemblies),true)){
    let object=hit.object,hidden=false;
    for(let parent=object;parent;parent=parent.parent)if(!parent.visible){hidden=true;break;}
    if(hidden)continue; // Removed panels must not intercept a click on the switch.
    while(object&&!object.userData.part)object=object.parent;
    if(object){select(object.userData.part);break;}
  }
});
new ResizeObserver(resize).observe(viewport);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestRender();else{cancelAnimationFrame(scheduled);scheduled=0;}}).observe(viewport);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestRender();else{cancelAnimationFrame(scheduled);scheduled=0;}});
renderer.domElement.addEventListener('webglcontextlost',e=>{
  e.preventDefault();$('fallback').hidden=false;renderer.domElement.hidden=true;$('load-status').textContent='The 3D context was interrupted. Reload to retry; the connection diagram remains available.';
  document.querySelectorAll('button,select,input').forEach(c=>c.disabled=true);cancelAnimationFrame(scheduled);scheduled=0;visible=false;
});
document.querySelectorAll('button,select,input').forEach(c=>c.disabled=false);
// ?view=<id> opens on that view, so an article can link straight to one part.
const query=new URLSearchParams(location.search),firstView=viewInfo[query.get('view')]?query.get('view'):'host';
resize();setView(firstView);renderer.render(scene,camera);$('fallback').hidden=true;viewport.dataset.ready='true';
// ?debug exposes the camera to scripted screenshots that need a detail framed
// (tmp/neox1-blog/capture_views.py). It changes nothing a visitor sees.
if(query.has('debug'))window.neox1={THREE,scene,camera,controls,assemblies,look(target,direction,zoom){
  autoFraming=false;controls.target.set(...target);camera.position.set(...target).addScaledVector(new THREE.Vector3(...direction).normalize(),CAMERA_DISTANCE);
  camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();renderer.render(scene,camera);}};
