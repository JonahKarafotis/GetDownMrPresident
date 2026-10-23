import { DurableObject } from 'cloudflare:workers';
import { initialState, parseInput, step, DT, PROTOCOL, type Input } from '../shared/simulation';
interface Env { ROOMS: DurableObjectNamespace<GameRoom>; ASSETS: Fetcher }
const blank = ():Input => ({seq:0,move:0,jump:false,action:false});
export default {
  async fetch(request:Request,env:Env):Promise<Response> {
    const u=new URL(request.url);
    if(u.pathname==='/api/create' && request.method==='POST') {
      for(let attempt=0;attempt<5;attempt++) {
        const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>alphabet[n%32]).join('');
        const response=await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(new Request('https://room/init',{method:'POST'}));
        if(response.ok) return Response.json({code});
      }
      return new Response('Try again',{status:503});
    }
    const match=u.pathname.match(/^\/api\/room\/([A-Z2-9]{6})$/);
    if(match) return env.ROOMS.get(env.ROOMS.idFromName(match[1])).fetch(request);
    if(u.pathname.startsWith('/api/'))return new Response('Not found',{status:404});
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
export class GameRoom extends DurableObject<Env> {
  state=initialState();
  sockets: (WebSocket|null)[]=[null,null];
  inputs=[blank(),blank()];
  lastInput=[0,0]; lastSeen=[0,0];
  timer: ReturnType<typeof setInterval>|undefined;
  running=false; epoch=crypto.randomUUID();
  accumulator=0; previous=0; incoming=0; outgoingBytes=0; simulationMs=0; ticks=0;
  constructor(ctx:DurableObjectState,env:Env){super(ctx,env);}
  async fetch(request:Request) {
    if(new URL(request.url).pathname==='/init') {
      return await this.ctx.blockConcurrencyWhile(async()=>{
        if(await this.ctx.storage.get('created'))return new Response('Conflict',{status:409});
        await this.ctx.storage.put('created',Date.now());
        await this.ctx.storage.setAlarm(Date.now()+30*60*1000);
        return new Response('Created');
      });
    }
    if(!await this.ctx.storage.get('created'))return new Response('Room not found',{status:404});
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
    const origin=request.headers.get('Origin');
    if(origin && origin!==new URL(request.url).origin)return new Response('Origin rejected',{status:403});
    const slot=this.sockets.findIndex(s=>s===null);
    if(slot<0)return new Response('Room is full',{status:409});
    const pair=new WebSocketPair(),client=pair[0],socket=pair[1];
    socket.accept();this.sockets[slot]=socket;
    this.lastSeen[slot]=performance.now();this.lastInput[slot]=0;
    let verified=false, count=0, windowStart=performance.now();
    socket.addEventListener('message',event=>{
      const now=performance.now();
      if(now-windowStart>1000){windowStart=now;count=0;}
      if(++count>180 || typeof event.data!=='string' || event.data.length>2048){socket.close(1008,'Message limit');return;}
      this.incoming++;
      try {
        const m=JSON.parse(event.data);
        if(m.type==='hello') {
          if(m.version!==PROTOCOL){socket.close(1008,'Game updated — refresh to continue');return;}
          verified=true;this.send(socket,{type:'welcome',slot,epoch:this.epoch});this.broadcast();return;
        }
        if(!verified)return;
        this.lastSeen[slot]=now;
        if(m.type==='ping'){this.send(socket,{type:'pong',sent:m.sent});return;}
        if(m.type==='input' && this.running && m.epoch===this.epoch) {
          const input=parseInput(m.input);
          if(input && input.seq>this.inputs[slot].seq){
            // Fold action edges until next simulation tick; held input uses newest sample.
            input.jump ||= this.inputs[slot].jump; input.action ||= this.inputs[slot].action;
            this.inputs[slot]=input;this.lastInput[slot]=now;
          }
        }
        if(m.type==='start' && this.sockets.every(Boolean))this.start();
      } catch { /* Invalid messages never mutate simulation state. */ }
    });
    const disconnect=()=>{
      if(this.sockets[slot]!==socket)return;
      this.sockets[slot]=null;this.stop();this.state=initialState();this.epoch=crypto.randomUUID();this.broadcast();
      if(this.sockets.every(s=>!s))void this.ctx.storage.setAlarm(Date.now()+30*60*1000);
    };
    socket.addEventListener('close',disconnect);socket.addEventListener('error',disconnect);
    this.broadcast();
    return new Response(null,{status:101,webSocket:client});
  }
  start(){
    if(this.running)return;
    this.state=initialState();this.epoch=crypto.randomUUID();this.inputs=[blank(),blank()];
    this.running=true;this.previous=performance.now();this.accumulator=0;this.broadcast();
    this.timer=setInterval(()=>this.tick(),1000/60);
  }
  stop(){if(this.timer)clearInterval(this.timer);this.timer=undefined;this.running=false;}
  tick(){
    const now=performance.now();
    try {
      this.sockets.forEach((s,i)=>{if(s&&now-this.lastSeen[i]>10000)s.close(1001,'Connection timed out');});
      this.inputs.forEach((input,i)=>{if(now-this.lastInput[i]>500){input.move=0;input.jump=false;input.action=false;}});
      this.accumulator+=Math.min((now-this.previous)/1000,0.1);this.previous=now;
      const events=[];
      const begin=performance.now();
      while(this.accumulator>=DT){
        step(this.state,this.inputs);events.push(...this.state.events);
        this.inputs.forEach(i=>{i.jump=false;i.action=false;});this.accumulator-=DT;this.ticks++;
      }
      this.simulationMs+=performance.now()-begin;
      if(events.length)this.publish({type:'events',epoch:this.epoch,events});
      if(this.state.tick%3===0)this.broadcast();
    } catch {this.stop();this.publish({type:'error',message:'Simulation interrupted. Start a fresh test.'});}
  }
  send(s:WebSocket,data:unknown){const message=JSON.stringify(data);try{s.send(message);this.outgoingBytes+=message.length;}catch{/* close handler cleans up */}}
  publish(data:unknown){this.sockets.forEach(s=>{if(s)this.send(s,data);});}
  broadcast(){this.publish({type:'snapshot',epoch:this.epoch,running:this.running,connected:this.sockets.map(Boolean),state:this.state,metrics:{incoming:this.incoming,outgoingBytes:this.outgoingBytes,simulationMs:this.simulationMs,ticks:this.ticks}});}
  async alarm(){if(this.sockets.some(Boolean))return;this.stop();await this.ctx.storage.deleteAll();}
}
