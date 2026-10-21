import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {wrap} from './race.js';
const v=(x,y,z)=>new T.Vector3(x,y,z);
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,...extra});
export function makeTrack(){
 const curve=new T.CatmullRomCurve3([v(0,0,0),v(0,0,135),v(85,0,220),v(220,0,200),v(285,0,100),v(230,0,0),v(270,0,-115),v(180,0,-210),v(50,0,-185),v(-80,0,-200),v(-165,0,-100),v(-120,0,0)],true,'catmullrom',.36);
 const length=curve.getLength(),N=1200,points=curve.getSpacedPoints(N).slice(0,N);
 const samples=points.map((p,i)=>{const t=points[(i+1)%N].clone().sub(points[wrap(i-1,N)]).normalize();return{x:p.x,z:p.z,nx:t.z,nz:-t.x,heading:Math.atan2(t.x,t.z),s:i/N*length};});
 function at(s){const a=wrap(s,length)/length*N,i=Math.floor(a),f=a-i,p=samples[i],q=samples[(i+1)%N];return{x:T.MathUtils.lerp(p.x,q.x,f),z:T.MathUtils.lerp(p.z,q.z,f),nx:p.nx,nz:p.nz,heading:p.heading,s:wrap(s,length)};}
 function nearest(x,z){let idx=0,d=Infinity;for(let i=0;i<N;i++){const p=samples[i],dd=(p.x-x)**2+(p.z-z)**2;if(dd<d){d=dd;idx=i;}}const p=samples[idx];return{...p,offset:(x-p.x)*p.nx+(z-p.z)*p.nz,distance:Math.sqrt(d)};}
 return{curve,length,samples,at,nearest,width:18};
}
function mesh(g,m,x=0,y=0,z=0,parent){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,m,w,h,d,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
function ellipsoid(parent,m,sx,sy,sz,x,y,z){const o=mesh(new T.SphereGeometry(1,24,16),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;}
function shell(parent,m,rows){const verts=[],indices=[];for(const [z,width,y,h]of rows){for(let j=0;j<12;j++){let a=j/12*Math.PI*2;verts.push(Math.cos(a)*width,y+Math.sin(a)*h,z);}}for(let i=0;i<rows.length-1;i++)for(let j=0;j<12;j++){const a=i*12+j,b=i*12+(j+1)%12,c=b+12,d=a+12;indices.push(a,b,c,a,c,d);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,m,0,0,0,parent);}
export function createCar(color='#e8b84d',jewels=true){
 const car=new T.Group(),body=new T.Group();car.add(body);
 const gold=mat(color,{metalness:.85,roughness:.19,envMapIntensity:1.8}),dark=mat('#071319',{metalness:.75,roughness:.22}),rubber=mat('#111416',{roughness:.93}),chrome=mat('#f1e6bc',{metalness:1,roughness:.15}),glass=mat('#182b36',{metalness:.95,roughness:.12}),rearLight=new T.MeshBasicMaterial({color:'#ff3a2a'}),light=new T.MeshBasicMaterial({color:'#fff5c5'});
 shell(body,gold,[[-2.6,.85,.65,.26],[-2.2,1.14,.77,.4],[-1.3,1.13,.81,.42],[0,1.06,.65,.30],[1.35,1.15,.69,.38],[2.3,1.07,.61,.30],[2.65,.65,.54,.17]]);
 // Sweeping windscreen, roof and rear glass form a low teardrop cabin.
 shell(body,glass,[[-1.65,.66,1.02,.08],[-.98,.73,1.28,.28],[.2,.69,1.35,.32],[1.22,.79,1.02,.08]]);
 shell(body,gold,[[-1.10,.59,1.51,.025],[-.9,.65,1.58,.035],[-.2,.63,1.62,.035],[.15,.59,1.60,.025]]);
 for(const side of [-1,1]){
  const rail=box(body,gold,.07,.07,1.6,side*.74,1.30,.34);rail.rotation.x=.40;
  box(body,gold,.09,.08,1.65,side*.74,1.29,-.61).rotation.x=-.36;
  ellipsoid(body,gold,.19,.12,.34,side*1.21,1.1,.54);
  box(body,dark,.05,.35,.95,side*1.1,.70,-.15).rotation.x=-.2;
  box(body,gold,.09,.10,1.85,side*1.14,.38,0);
  ellipsoid(body,dark,.34,.12,.52,side*.77,.89,1.82);
  for(let n=0;n<3;n++)ellipsoid(body,light,.075,.055,.12,side*(.60+n*.14),.95-n*.03,1.90-n*.16);
  box(body,dark,.82,.31,.08,side*.56,.54,2.48).rotation.y=side*.13;
  for(let j=0;j<6;j++)box(body,chrome,.025,.28,.025,side*(.22+j*.13),.54,2.54).rotation.z=.62;
  box(body,rearLight,.76,.075,.07,side*.61,.90,-2.38);
  for(let j=0;j<2;j++){const exhaust=mesh(new T.CylinderGeometry(.11,.11,.20,12),chrome,side*(.65+j*.25),.43,-2.49,body);exhaust.rotation.x=Math.PI/2;}
  for(const z of [-1.65,1.6])ellipsoid(body,gold,.36,.28,.73,side*.99,.92,z);
 }
 // Sculpted center hood and rear diffuser.
 shell(body,gold,[[.82,.57,.99,.04],[1.5,.53,.94,.03],[2.47,.14,.79,.02]]);
 box(body,dark,1.65,.12,.35,0,.28,-2.4);box(body,dark,1.95,.08,.30,0,.30,2.35);
 for(let j=-3;j<=3;j++)box(body,dark,.05,.24,.38,j*.20,.27,-2.44);
 const badge=mesh(new T.ConeGeometry(.10,.14,3),chrome,0,.81,2.39,body);badge.rotation.x=Math.PI/2;
 const wheels=[];for(const side of [-1,1])for(const z of [-1.62,1.55]){
  const pivot=new T.Group();pivot.position.set(side*1.1,.55,z);car.add(pivot);const wheel=new T.Group();pivot.add(wheel);
  const tire=mesh(new T.CylinderGeometry(.53,.53,.32,24),rubber,0,0,0,wheel);tire.rotation.z=Math.PI/2;
  const rim=mesh(new T.CylinderGeometry(.405,.405,.335,24),gold,0,0,0,wheel);rim.rotation.z=Math.PI/2;
  const inner=mesh(new T.CylinderGeometry(.32,.32,.345,24),dark,0,0,0,wheel);inner.rotation.z=Math.PI/2;
  for(let j=0;j<10;j++){let a=j/10*Math.PI*2;const spoke=box(wheel,gold,.36,.045,.66,0,0,0);spoke.rotation.x=a;}
  const hub=mesh(new T.CylinderGeometry(.12,.12,.37,16),chrome,0,0,0,wheel);hub.rotation.z=Math.PI/2;
  wheels.push({pivot,wheel,front:z>0});
 }
 if(jewels){
  const gem=new T.InstancedMesh(new T.IcosahedronGeometry(.055,0),mat('#dbe9df',{metalness:.8,roughness:.13,envMapIntensity:2.4}),2000);const dummy=new T.Object3D();let i=0;
  for(const side of [-1,1])for(const zc of [-1.65,1.6])for(let row=0;row<18;row++)for(let col=0;col<22;col++){
   const z=zc+(row/17-.5)*1.45,a=(col/21)*Math.PI;dummy.position.set(side*(.98+Math.cos(a)*.32),.94+Math.sin(a)*.27,z);dummy.rotation.set(row*.7,col*.9,row+col);dummy.scale.setScalar(.7+((row*7+col*13)%10)/22);dummy.updateMatrix();gem.setMatrixAt(i,dummy.matrix);gem.setColorAt(i,new T.Color((row+col)%4===0?'#e4b951':(row+col)%3===0?'#b0d7df':'#f3f5df'));i++;
  }
  for(let row=0;row<12;row++)for(let col=0;col<26;col++) {dummy.position.set((col/25-.5)*1.20,1.66,-1.02+row*.07);dummy.rotation.set(col,row,col*row);dummy.scale.setScalar(.75);dummy.updateMatrix();gem.setMatrixAt(i,dummy.matrix);gem.setColorAt(i,new T.Color('#e4e7d7'));i++;}
  gem.count=i;body.add(gem);
 }
 car.userData={body,wheels,rearLight};return car;
}
export function createWorld(canvas,track){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 const scene=new T.Scene();scene.background=new T.Color('#97b5bd');scene.fog=new T.FogExp2('#a6bcc0',.00165);
 const camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,.15,2200);
 const env=new RoomEnvironment();const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.04).texture;env.dispose();pmrem.dispose();
 const hemi=new T.HemisphereLight('#d1e8fc','#8c6742',2);scene.add(hemi);const sun=new T.DirectionalLight('#ffe1a1',3.5);sun.position.set(-170,220,120);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;sun.shadow.camera.far=600;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
 const sky=new T.Mesh(new T.SphereGeometry(1400,32,16),new T.ShaderMaterial({side:T.BackSide,uniforms:{top:{value:new T.Color('#6599b2')},bottom:{value:new T.Color('#f4c9a1')}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top;uniform vec3 bottom;void main(){float h=normalize(p).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.06,.65,h)),1.);}'}));scene.add(sky);
 const sunDisc=mesh(new T.SphereGeometry(40,24,12),new T.MeshBasicMaterial({color:'#fff0c2'}),-650,160,-650,scene);sunDisc.castShadow=false;
 const water=mesh(new T.PlaneGeometry(3500,3500),mat('#417d89',{metalness:.65,roughness:.28}),0,-5,0,scene);water.rotation.x=-Math.PI/2;water.castShadow=false;
 const island=mesh(new T.CylinderGeometry(355,390,15,70),mat('#9e9275',{roughness:1}),60,-8,-5,scene);island.scale.z=.88;
 const grass=mesh(new T.CircleGeometry(350,70),mat('#737e5c',{roughness:1}),60,-.4,-5,scene);grass.rotation.x=-Math.PI/2;grass.scale.y=.88;
 // Continuous road ribbons avoid seams and collision gaps.
 function ribbon(start,end,material,y){let pos=[],uv=[],idx=[];for(let i=0;i<=track.samples.length;i++){const p=track.samples[i%track.samples.length];pos.push(p.x+p.nx*start,y,p.z+p.nz*start,p.x+p.nx*end,y,p.z+p.nz*end);uv.push(0,i/8,1,i/8);if(i<track.samples.length){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();let m=mesh(g,material,0,0,0,scene);m.castShadow=false;}
 const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=128;const cx=textureCanvas.getContext('2d');cx.fillStyle='#4b5353';cx.fillRect(0,0,128,128);let seed=17;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};for(let i=0;i<7500;i++){cx.fillStyle=`rgba(${rnd()>.5?'255,255,255':'0,0,0'},${rnd()*.12})`;cx.fillRect(rnd()*128,rnd()*128,1,1);}const texture=new T.CanvasTexture(textureCanvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,6);texture.anisotropy=4;
 ribbon(-12,12,mat('#b5a88b'),-.04);ribbon(-9,9,mat('#8b9290',{map:texture,roughness:.96}),.01);ribbon(-8.75,-8.57,mat('#eee4c8'),.03);ribbon(8.57,8.75,mat('#eee4c8'),.03);
 const cream=mat('#e8dfc7'),red=mat('#ad5b3e'),barrier=mat('#454f50',{metalness:.4,roughness:.6}),gold=mat('#d5ae63',{metalness:.55,roughness:.4});
 const boxes=[];
 for(let s=0;s<track.length;s+=4){let p=track.at(s);for(const side of [-1,1]){boxes.push({p,x:p.x+p.nx*side*9.35,z:p.z+p.nz*side*9.35,m:Math.floor(s/4)%2?cream:red,w:.8,h:.14,d:4.2});}}
 function batchBox(entries){const geo=new T.BoxGeometry(1,1,1);for(const material of new Set(entries.map(e=>e.m))){let group=entries.filter(e=>e.m===material),inst=new T.InstancedMesh(geo,material,group.length),d=new T.Object3D();group.forEach((e,i)=>{d.position.set(e.x,e.y??.07,e.z);d.rotation.set(0,e.p.heading,0);d.scale.set(e.w,e.h,e.d);d.updateMatrix();inst.setMatrixAt(i,d.matrix);});inst.receiveShadow=true;scene.add(inst);}}
 batchBox(boxes);
 const rails=[];for(let s=0;s<track.length;s+=5){const p=track.at(s);for(const side of [-1,1]){rails.push({p,x:p.x+p.nx*side*11.5,z:p.z+p.nz*side*11.5,y:.68,m:barrier,w:.25,h:.58,d:5.2});if(Math.floor(s/5)%3===0)rails.push({p,x:p.x+p.nx*side*11.5,z:p.z+p.nz*side*11.5,y:.6,m:gold,w:.3,h:1.3,d:.3});}if(Math.floor(s/5)%3===0)rails.push({p,x:p.x,z:p.z,y:.035,m:cream,w:.15,h:.01,d:4});}batchBox(rails);
 // Start/finish checkerboard and architectural gantry.
 const start=track.at(0),gate=new T.Group();gate.position.set(start.x,0,start.z);gate.rotation.y=start.heading;scene.add(gate);
 for(let x=0;x<18;x++)for(let z=0;z<4;z++)box(gate,(x+z)%2?cream:barrier,1,.025,1,x-8.5,.045,z-1.5);
 for(const x of [-11,11])box(gate,gold,.6,8,.7,x,4,0);box(gate,barrier,23,1.8,.8,0,7.5,0);
 function sign(text,width=1024,height=128){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.fillStyle='#17272d';ctx.fillRect(0,0,width,height);ctx.fillStyle='#ead19b';ctx.font='500 56px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,height/2);return new T.CanvasTexture(c);}
 const banner=mesh(new T.PlaneGeometry(20,1.6),new T.MeshBasicMaterial({map:sign('A U R E L   /   C R O W N   C I R C U I T'),side:T.DoubleSide}),0,7.5,-.42,gate);
 const checkpoints=[];for(let i=1;i<8;i++){const p=track.at(track.length*i/8);const g=new T.Group();g.position.set(p.x,0,p.z);g.rotation.y=p.heading;scene.add(g);for(const side of [-1,1]){box(g,gold,.18,4,.18,side*10,2,0);const flag=mesh(new T.PlaneGeometry(1,2.3),new T.MeshBasicMaterial({color:'#dfbb6f',side:T.DoubleSide,transparent:true,opacity:.85}),side*10,3,0,g);flag.rotation.y=side*.2;}checkpoints.push(g);}
 // Mediterranean rock outcrops, hills and a distant coastal skyline.
 const rockMats=[mat('#8d927e'),mat('#7e8a7d'),mat('#a7a88e')];for(let i=0;i<80;i++){const a=rnd()*Math.PI*2,r=370+rnd()*300,x=70+Math.sin(a)*r,z=-80+Math.cos(a)*r;if(x< -280)continue;const m=mesh(new T.ConeGeometry(40+rnd()*75,45+rnd()*130,5),rockMats[i%3],x,0,z,scene);m.rotation.y=rnd()*6;m.position.y=8;}
 const trunk=mat('#786c4d'),leaf=mat('#354f3d');
 for(let i=0;i<140;i++){let x=-220+rnd()*580,z=-280+rnd()*550;if(track.nearest(x,z).distance<20||Math.hypot(x-60,(z+5)/.88)>330)continue;let h=6+rnd()*11;mesh(new T.CylinderGeometry(.3,.6,h,5),trunk,x,h/2-.3,z,scene);let c=mesh(new T.ConeGeometry(2+rnd()*2,h*.8,7),leaf,x,h*.9,z,scene);c.scale.z=.8;}
 // Palms along the opening straight.
 for(let s=15;s<160;s+=20)for(const side of [-1,1]){const p=track.at(s),x=p.x+p.nx*side*20,z=p.z+p.nz*side*20,h=10+rnd()*4;mesh(new T.CylinderGeometry(.3,.5,h,7),trunk,x,h/2,z,scene);for(let n=0;n<7;n++){let a=n/7*Math.PI*2;let frond=mesh(new T.SphereGeometry(1,8,5),leaf,x+Math.sin(a)*2.4,h,z+Math.cos(a)*2.4,scene);frond.scale.set(.7,.25,4);frond.rotation.set(.22,a,0);}}
 const buildingMat=mat('#d7c9aa');for(let i=0;i<28;i++){let x=80+rnd()*130,z=-40+rnd()*90;if(track.nearest(x,z).distance<35)continue;const h=4+rnd()*11;box(scene,buildingMat,8+rnd()*8,h,8+rnd()*8,x,h/2,z);box(scene,cream,10,.5,10,x,h+.2,z);}
 // Roadside chevrons make the braking zones legible.
 const chev=sign('›  ›  ›',256,128);for(let s=170;s<track.length;s+=115){const p=track.at(s),g=new T.Group();g.position.set(p.x+p.nx*14,0,p.z+p.nz*14);g.rotation.y=p.heading-Math.PI*.35;scene.add(g);box(g,barrier,.15,3,.15,0,1.5,0);mesh(new T.PlaneGeometry(3,1.5),new T.MeshBasicMaterial({map:chev,side:T.DoubleSide}),0,3,0,g);}
 return{renderer,scene,camera,sun,sky};
}
