export const TAU=Math.PI*2;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wrap=(v,n)=>((v%n)+n)%n;
export function angle(v){return Math.atan2(Math.sin(v),Math.cos(v));}
export function formatTime(t){if(!Number.isFinite(t))return '—:——.——';return `${Math.floor(t/60)}:${(t%60).toFixed(2).padStart(5,'0')}`;}
export class Race {
 constructor(length,laps=3){this.length=length;this.laps=laps;this.reset();}
 reset(){this.state='grid';this.countdown=3.4;this.elapsed=0;this.lapStart=0;this.lapTimes=[];this.lap=1;this.nextCheckpoint=1;this.lastS=0;this.travel=0;this.finished=false;}
 start(){this.reset();this.state='countdown';}
 tick(dt){if(this.state==='countdown'){this.countdown-=dt;if(this.countdown<=0)this.state='racing';}else if(this.state==='racing')this.elapsed+=dt;}
 advance(s){if(this.state!=='racing')return null;let d=s-this.lastS;if(d>this.length/2)d-=this.length;if(d< -this.length/2)d+=this.length;this.lastS=s;if(Math.abs(d)>15)return null;this.travel+=d;
 const fraction=s/this.length;
 if(this.nextCheckpoint<8&&fraction>=this.nextCheckpoint/8&&fraction<this.nextCheckpoint/8+.04&&d>0){this.nextCheckpoint++;return 'checkpoint';}
 if(this.nextCheckpoint===8&&s<15&&d>0&&this.travel>this.length*.92){this.lapTimes.push(this.elapsed-this.lapStart);this.lapStart=this.elapsed;this.nextCheckpoint=1;this.travel=0;if(this.lap===this.laps){this.finished=true;this.state='finished';return 'finish';}this.lap++;return 'lap';}return null;
 }
}
export function drive(p,input,dt){
 const accel=input.throttle?22:0, brake=input.brake?38:0;
 if(input.brake&&p.speed<.2)p.speed=Math.max(-9,p.speed-12*dt);
 else p.speed+= (accel-brake-Math.sign(p.speed)*(1.8+.004*p.speed*p.speed))*dt;
 if(!input.throttle&&!input.brake&&Math.abs(p.speed)<.1)p.speed=0;
 p.speed=clamp(p.speed,-9,64);
 const target=input.steer*.50/(1+Math.abs(p.speed)*.012);
 p.steering+=(target-p.steering)*(1-Math.exp(-dt*9));
 p.heading+=p.steering*p.speed/5.1*dt*(input.drift?1.30:1);
 const grip=input.drift?3.2:10;
 p.vx+=(Math.sin(p.heading)*p.speed-p.vx)*(1-Math.exp(-grip*dt));
 p.vz+=(Math.cos(p.heading)*p.speed-p.vz)*(1-Math.exp(-grip*dt));
 if(input.drift)p.speed*=Math.exp(-.20*dt);
 p.x+=p.vx*dt;p.z+=p.vz*dt;
}
export function pilot(p,track,lane=0,targetSpeed=43){
 const near=track.nearest(p.x,p.z),look=track.at(near.s+11+Math.abs(p.speed)*.42);
 const tx=look.x+look.nx*lane,tz=look.z+look.nz*lane;
 const error=angle(Math.atan2(tx-p.x,tz-p.z)-p.heading);
 const ahead=track.at(near.s+45),bend=Math.abs(angle(ahead.heading-near.heading));
 const desired=Math.min(targetSpeed,51/(1+bend*1.7));
 return {steer:clamp(error*2.6,-1,1),throttle:p.speed<desired,brake:p.speed>desired+3,drift:false};
}
