import Phaser from 'phaser';
import './style.css';
import {DT,FLOOR,PROTOCOL,initialState,stepPlayer,dimensions,president,type State,type Input,type Player} from '../shared/simulation';
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
let socket:WebSocket|null=null, slot=-1, epoch='', running=false, state:State=initialState();
let predicted:Player|null=null, sequence=0, pending:Input[]=[], accumulator=0, rtt=0;
let menuReadyMs=0;
let received=performance.now(), totalEvents=0, blockCount=0, hitCount=0;
let connected=[false,false];
const seen=new Set<number>();
const effects:{x:number;y:number;color:number;life:number}[]=[];
const status=(text:string)=>{el('status').textContent=text;};
let bufferedJump=false, bufferedAction=false;
let lastSentMove=0, inputStepsSinceSend=0;
const drawnTomatoes=new Map<number,{x:number;y:number}>();
class Arena extends Phaser.Scene {
  graphics!:Phaser.GameObjects.Graphics; labels!:Phaser.GameObjects.Text; keys!:Record<string,Phaser.Input.Keyboard.Key>;
  smooth:Player[]=structuredClone(state.players);
  create(){
    this.graphics=this.add.graphics();
    this.labels=this.add.text(24,22,'',{fontFamily:'monospace',fontSize:'20px',color:'#f3e9cc'});
    menuReadyMs=performance.now();el('metrics').textContent=`Interactive arena ready in ${menuReadyMs.toFixed(0)} ms`;
    this.keys=this.input.keyboard!.addKeys('A,D,LEFT,RIGHT,SPACE,J') as typeof this.keys;
    this.input.keyboard!.addCapture(['SPACE','LEFT','RIGHT']);
    window.addEventListener('blur',()=>this.release());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.release();});
  }
  release(){bufferedJump=false;bufferedAction=false;Object.values(this.keys).forEach(k=>k.reset());if(socket?.readyState===1)socket.send(JSON.stringify({type:'input',epoch,input:{seq:++sequence,move:0,jump:false,action:false}}));pending=[];}
  update(_time:number,delta:number){
    accumulator+=Math.min(delta/1000,0.1);
    const focused=document.hasFocus()&&!document.hidden;
    bufferedJump ||= focused&&Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    bufferedAction ||= focused&&Phaser.Input.Keyboard.JustDown(this.keys.J);
    while(accumulator>=DT){
      accumulator-=DT;
      if(running&&predicted&&socket?.readyState===1){
        const left=focused&&(this.keys.A.isDown||this.keys.LEFT.isDown),right=focused&&(this.keys.D.isDown||this.keys.RIGHT.isDown);
        const input:Input={seq:++sequence,move:left===right?0:left?-1:1,jump:bufferedJump,action:bufferedAction};bufferedJump=false;bufferedAction=false;
        stepPlayer(predicted,input);pending.push(input);if(pending.length>120)pending.shift();
        // 15 Hz idle/held updates; transitions and action edges are immediate.
        if(++inputStepsSinceSend>=4 || input.move!==lastSentMove || input.jump || input.action){
          socket.send(JSON.stringify({type:'input',epoch,input}));lastSentMove=input.move;inputStepsSinceSend=0;
        }
      }
    }
    const g=this.graphics;g.clear();g.fillStyle(0x192d46);g.fillRect(0,0,1280,720);
    for(let i=0;i<10;i++){g.fillStyle(i%2?0x27445c:0x223c53);g.fillRect(i*140,220+(i%3)*45,115,380);g.fillStyle(0xe2bd73,0.45);for(let y=280;y<500;y+=55)g.fillRect(i*140+25,y,20,25);}
    g.fillStyle(0x56636b);g.fillRect(0,FLOOR,1280,120);g.fillStyle(0xf0d8a0);g.fillRect(0,FLOOR,1280,7);
    g.fillStyle(0xffcd69);g.fillRect(president.x-15,president.y-32,30,64);g.fillStyle(0x452c46);g.fillRect(628,540,24,9);
    state.players.forEach((p,i)=>{
      const draw=i===slot&&predicted?predicted:this.smooth[i];
      if(i!==slot){draw.x+=(p.x-draw.x)*Math.min(1,delta/75);draw.y+=(p.y-draw.y)*Math.min(1,delta/75);draw.dive=p.dive;}
      const d=dimensions(draw);g.fillStyle(i===0?0x70d6cf:0xf37b6a,connected[i]?1:0.3);g.fillRect(draw.x-d.w/2,draw.y-d.h/2,d.w,d.h);
      g.fillStyle(0x152337);g.fillRect(draw.x-10,draw.y-d.h/2+10,20,6);
    });
    for(const id of drawnTomatoes.keys())if(!state.tomatoes.some(t=>t.id===id))drawnTomatoes.delete(id);
    state.tomatoes.forEach(t=>{const d=drawnTomatoes.get(t.id)??{x:t.x,y:t.y};d.x+=(t.x-d.x)*Math.min(1,delta/50);d.y+=(t.y-d.y)*Math.min(1,delta/50);drawnTomatoes.set(t.id,d);g.fillStyle(0xff514d);g.fillCircle(d.x,d.y,7);});
    effects.forEach(e=>{e.life-=delta;g.fillStyle(e.color,Math.max(0,e.life/350));g.fillCircle(e.x,e.y,20*(1-e.life/500));});
    for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);
    this.labels.setText([`COMPOSURE ${state.composure} / 5     ${slot===0?'BODYGUARD':slot===1?'PROTESTER':'JOIN A ROOM'}`,`J ${predicted?Math.max(predicted.cooldown,state.players[slot]?.cooldown??0).toFixed(1):'—'}s   |   Saves ${blockCount}   Hits ${hitCount}`]);
    if(running&&performance.now()-received>2000)status('Connection delayed — awaiting server updates.');
  }
}
new Phaser.Game({type:Phaser.AUTO,width:1280,height:720,parent:'game',backgroundColor:'#192d46',pixelArt:true,scene:Arena,audio:{noAudio:true}});
async function join(code:string){
  if(!/^[A-Z2-9]{6}$/.test(code)){status('Enter a six-character room code.');return;}
  socket?.close();slot=-1;predicted=null;running=false;pending=[];
  const ws=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/api/room/${code}`);socket=ws;
  status('Connecting to game…');
  ws.onopen=()=>{ws.send(JSON.stringify({type:'hello',version:PROTOCOL}));history.replaceState(null,'',`?room=${code}`);el<HTMLInputElement>('code').value=code;};
  ws.onmessage=event=>{
    if(socket!==ws)return;
    const m=JSON.parse(event.data);received=performance.now();
    if(m.type==='welcome'){slot=m.slot;status(`Room ${code} · You are the ${slot===0?'bodyguard':'protester'}.`);}
    if(m.type==='pong'){rtt=performance.now()-m.sent;return;}
    if(m.type==='snapshot'){
      if(epoch!==m.epoch){epoch=m.epoch;pending=[];drawnTomatoes.clear();seen.clear();blockCount=0;hitCount=0;sequence=0;}
      state=m.state;running=m.running;connected=m.connected;
      if(slot>=0){predicted=structuredClone(state.players[slot]);pending=pending.filter(i=>i.seq>predicted!.ack);for(const input of pending)stepPlayer(predicted!,input);}
      if(!running)status(connected.every(Boolean)?'Both players connected. Start the interception test.':'Waiting for the other player. Share the invite link.');
      else status('Test active — move, jump, throw, and dive. Server confirms all impacts.');
      el('metrics').textContent=`Ready ${menuReadyMs.toFixed(0)} ms · RTT ${rtt.toFixed(0)} ms · tick ${state.tick} · confirmed events ${totalEvents} · server steps ${m.metrics.ticks} · sent ${(m.metrics.outgoingBytes/1024).toFixed(1)} KB`;
    }
    if(m.type==='events'&&m.epoch===epoch)for(const event of m.events){if(seen.has(event.id))continue;seen.add(event.id);totalEvents++;if(event.kind==='block')blockCount++;else hitCount++;effects.push({x:event.x,y:event.y,color:event.kind==='block'?0x70d6cf:0xff514d,life:350});}
    if(m.type==='error')status(m.message);
  };
  ws.onclose=e=>{if(socket!==ws)return;running=false;pending=[];status(e.reason||'Connection lost or room unavailable. Retry Join Room.');};
  ws.onerror=()=>{if(socket===ws)status('Unable to connect. Check the room code and try again.');};
}
el('create').onclick=async()=>{try{status('Creating room…');const r=await fetch('/api/create',{method:'POST'});if(!r.ok)throw Error();const data=await r.json() as {code:string};await join(data.code);}catch{status('Multiplayer is temporarily unavailable. Please try again later.');}};
el('join').onclick=()=>void join(el<HTMLInputElement>('code').value.trim().toUpperCase());
el('copy').onclick=()=>{navigator.clipboard.writeText(location.href).then(()=>status('Invite copied.'),()=>status('Copy the address from your browser to invite a friend.'));};
el('start').onclick=()=>{if(socket?.readyState===1)socket.send(JSON.stringify({type:'start'}));};
setInterval(()=>{if(socket?.readyState===1)socket.send(JSON.stringify({type:'ping',sent:performance.now()}));},2000);
const invitation=new URLSearchParams(location.search).get('room');if(invitation)void join(invitation.toUpperCase());
