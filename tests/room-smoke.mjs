// Requires a running Wrangler emulator or an explicitly supplied hosted URL.
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8787';
const response=await fetch(`${base}/api/create`,{method:'POST'});assert.equal(response.status,200);
const {code}=await response.json();
const connect=()=>new Promise((resolve,reject)=>{
 const ws=new WebSocket(`${base.replace(/^http/,'ws')}/api/room/${code}`);
 const data={ws,snap:null,events:[],slot:-1,rtts:[]};
 ws.addEventListener('open',()=>ws.send(JSON.stringify({type:'hello',version:1})));
 ws.addEventListener('error',reject);
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='welcome'){data.slot=m.slot;resolve(data);}if(m.type==='snapshot')data.snap=m;if(m.type==='events')data.events.push(...m.events);if(m.type==='pong')data.rtts.push(performance.now()-m.sent);});
});
const a=await connect(),b=await connect();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 a.ws.send(JSON.stringify({type:'start'}));await wait(150);
 assert.equal(a.snap.running,true);assert.equal(b.snap.running,true);
 let seq=0;
 for(let frame=0;frame<120;frame++){
  for(const p of [a,b])p.ws.send(JSON.stringify({type:'input',epoch:p.snap.epoch,input:{seq:++seq,move:0,jump:false,action:p===b&&frame===0}}));
  if(frame%30===0)for(const p of [a,b])p.ws.send(JSON.stringify({type:'ping',sent:performance.now()}));
  await wait(17);
 }
 assert.ok(a.events.some(e=>e.kind==='block'),'guard intercepts tomato');
 assert.deepEqual(a.events,b.events,'both clients receive identical events');
 assert.equal(a.snap.state.composure,5);assert.equal(b.snap.state.composure,5);
 b.ws.close();await wait(200);assert.equal(a.snap.running,false,'disconnect interrupts');
 console.log(JSON.stringify({passed:true,transport:'two scripted WebSocket clients; not two human devices',code,events:a.events,rttMs:a.rtts,metrics:a.snap.metrics},null,2));
}finally{a.ws.close();b.ws.close();}
