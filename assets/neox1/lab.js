import * as THREE from 'three';
import { OrbitControls } from '../lib/three-r180/OrbitControls.js';
import { RoomEnvironment } from '../lib/three-r180/RoomEnvironment.js';
import { host, gpu, egpuDock, rack, switchBoard, riserBoard, powerSupply, group, box, tube, materials } from './models.js';
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
const rackHost=host({openSide:true});rackHost.root.rotation.z=-Math.PI/2;
mount('host',rackHost.root,[-1.72,1.69,.30],[0,0,1.1]);
const switchModel=switchBoard();
const switchMount=group(rackHost.pcieSlot,'installed PEX88096');switchMount.userData.part='switch';switchMount.add(switchModel);assemblies.switch=switchMount;
const protoAMD=gpu('amd'),protoNVIDIA=gpu('nvidia');
['nv1','nv2','amd1','amd2'].forEach((id,i)=>{
  const card=(i<2?protoNVIDIA:protoAMD).clone(true),x=[-1.92,-.78,.36,1.5][i];
  mount(id,card,[x,6.77,.12],[(i-1.5)*1.3,.7+(i%2)*1.3,.15],-Math.PI/2);
  const support=riserBoard();support.name='riser';support.position.y=-.73;assemblies[id].add(support);
});
const dock=egpuDock();mount('nv3',dock,[1.78,.85,.10],[.8,.15,1.25],-Math.PI/2);
// The switch is a child of the motherboard socket, seated when separation is zero.
mount('power',powerSupply(),[3.12,5.98,-.9],[2.5,.1,-.2]);
const powerBracket=group(rig,'PSU support',[3.1,5.93,-.9]);box(powerBracket,[1.5,.07,1.95],[0,0,0],materials.dark);
const cables=group(rig,'illustrative cable routes');
const gpuIds=['nv1','nv2','amd1','amd2'],portPairs=[[0,1],[2,3],[4,5],[7,8]];
const worldPosition=object=>object.getWorldPosition(new THREE.Vector3());
const switchPort=index=>switchModel.getObjectByName(`downstream-${index}`).getObjectByName('cable-seat');
for(let i=0;i<4;i++){
  const x=[-1.92,-.78,.36,1.5][i];
  for(let n=0;n<2;n++){
    const start=worldPosition(assemblies[gpuIds[i]].getObjectByName(`riser-port-${n}`).getObjectByName('cable-seat'));
    const end=worldPosition(switchPort(portPairs[i][n]));
    tube(cables,[start.toArray(),[x+(n-.5)*.09,6.16,2.7],[x+(n-.5)*.09,5.2,2.7],[x*.6+(n-.5)*.09,3.5,2.6],[end.x,2.85,end.z+.16],end.toArray()],.027,materials.graphite);
  }
  const powerLeads=[];assemblies[gpuIds[i]].traverse(o=>{if(o.name==='power-lead')powerLeads.push(o);});
  powerLeads.forEach((lead,n)=>{const start=worldPosition(lead);tube(cables,[start.toArray(),[x,7.8,start.z],[2.7,7.1,-.9],[3.0,6.5,-.2+n*.15]],.035);});
}
const hostOCuLink=rackHost.root.getObjectByName('host-oculink').getObjectByName('cable-seat');
const dockOCuLink=dock.getObjectByName('dock-oculink').getObjectByName('cable-seat');
const ocStart=worldPosition(hostOCuLink),ocEnd=worldPosition(dockOCuLink);
const ocCable=tube(cables,[ocStart.toArray(),[ocStart.x,2.85,ocStart.z],[.7,2.92,.85],[1.09,2.8,.6],[1.10,1.45,ocEnd.z],ocEnd.toArray()],.032);
ocCable.name='single OCuLink host cable';
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
  host:{title:'01 / GMKtec NEO-X1 Pro',dim:'350 × 165 × 265 mm · body',note:'Lime mesh · carry handles · dual-fan AIO',corner:0,part:'host',url:'https://www.gmktec.uk/products/gmktec-neo-x1-series-amd-ryzen%E2%84%A2-9-9955hx-9955hx3d-modt-gaming-pc?variant=47533365100715'},
  amd:{title:'02 / Gigabyte Radeon AI PRO R9700',dim:'267 × 111 × 40 mm · 32 GB',note:'AI TOP · dual-slot blower · 16-pin power',corner:0,part:'amd1',url:'https://www.gigabyte.com/uk/Graphics-Card/GV-R9700AI-TOP-32GD-rev-10'},
  nvidia:{title:'03 / ASUS TUF Gaming RTX 3090 OC',dim:'299.9 × 126.9 × 51.7 mm · 24 GB',note:'Three axial fans · 2.7 slots · dual 8-pin power',corner:0,part:'nv1',url:'https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx3090-o24g-gaming/'},
  switch:{title:'04 / PEX88096 PCIe expansion card',dim:'10 SFF-8654 connectors · active cooling',note:'Photo-derived proportions · plugs into the motherboard',corner:0,part:'switch',url:null},
  dock:{title:'05 / ZOTAC Twin Edge OC + AOOSTAR AG03',dim:'5070: 241.5 × 120.1 × 40.6 mm · 12 GB',note:'AG03: integrated 800 W PSU · one OCuLink host connection',corner:0,part:'nv3',url:'https://www.zotac.com/product/graphics_card/zotac-gaming-geforce-rtx-5070-twin-edge-oc',secondaryUrl:'https://aoostar.com/products/aoostar-ag03-egpu-dock'},
  rig:{title:'06 / The complete inference lab',dim:'12U · 520 × 512 × 604 mm rack',note:'Open-sided host · upright PCIe switch · separate AG03 dock',corner:0,part:'host',url:null}
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
resize();setView('host');renderer.render(scene,camera);$('fallback').hidden=true;viewport.dataset.ready='true';
