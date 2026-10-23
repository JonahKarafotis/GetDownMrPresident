import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.argv[2];if(!base?.startsWith('https://'))throw Error('Pass HTTPS deployment URL');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const p95=a=>[...a].sort((a,b)=>a-b)[Math.ceil(a.length*.95)-1];
const report={at:new Date().toISOString(),base,scope:'single-machine scripted transport; not browser rendering benchmark',createMs:[],serverTiming:[],joinMs:[],rttMs:[],assetDownloads:[],events:[],counts:{}};
const watchdog=setTimeout(()=>{console.error('Benchmark timed out');process.exit(1);},90000);
let clients=[];
async function create(){const at=performance.now();const r=await fetch(base+'/api/create',{method:'POST',signal:AbortSignal.timeout(15000)});assert.equal(r.status,200);const room=await r.json();report.createMs.push(performance.now()-at);report.serverTiming.push(r.headers.get("server-timing"));console.log(`create ${report.createMs.length}: ${report.createMs.at(-1).toFixed(0)} ms`);return room.code;}
async function connect(code){return new Promise((resolve,reject)=>{
 const at=performance.now(),ws=new WebSocket(base.replace('https:','wss:')+'/api/room/'+code);
 const c={ws,state:null,events:[],bytes:0,messages:0};clients.push(c);
 const timeout=setTimeout(()=>reject(Error('Join timeout')),5000);
 ws.onopen=()=>ws.send(JSON.stringify({type:'hello',version:1}));ws.onerror=reject;
 ws.onmessage=e=>{c.bytes+=Buffer.byteLength(e.data);c.messages++;const m=JSON.parse(e.data);
 if(m.type==='welcome'){clearTimeout(timeout);report.joinMs.push(performance.now()-at);resolve(c);}
 if(m.type==='snapshot')c.state=m;
 if(m.type==='pong')report.rttMs.push(performance.now()-m.sent);
 if(m.type==='events')c.events.push(...m.events);
 };
});}
try {
 for(let i=0;i<(process.argv[3]?0:20);i++){const code=await create();const c=await connect(code);c.ws.close();}
 const html=await (await fetch(base)).text();
 const paths=[...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css))"/g)].map(m=>m[1]);
 for(const path of ['/',...paths]){const at=performance.now();const r=await fetch(new URL(path,base));const bytes=(await r.arrayBuffer()).byteLength;report.assetDownloads.push({path,ms:performance.now()-at,decodedBytes:bytes});}
 const code=process.argv[3]??await create(),a=await connect(code),b=await connect(code);
 await wait(100);a.ws.send(JSON.stringify({type:'start'}));await wait(150);
 let seq=0;const started=performance.now();
 for(let i=0;i<225;i++){
  for(const c of [a,b]){
   c.ws.send(JSON.stringify({type:'input',epoch:c.state.epoch,input:{seq:++seq,move:0,jump:false,action:c===b&&i%30===0}}));
   if(i<100)c.ws.send(JSON.stringify({type:'ping',sent:performance.now()}));
  }
  await wait(1000/15);
 }
 await wait(100);assert.deepEqual(a.events,b.events);assert.ok(a.events.some(e=>e.kind==='block'));
 report.events=a.events;report.counts={durationSeconds:(performance.now()-started)/1000,incoming:a.state.metrics.incoming,outgoingBytes:a.state.metrics.outgoingBytes,receivedBytes:a.bytes+b.bytes,simulationSteps:a.state.metrics.ticks};
 report.summary={createP95:p95(report.createMs),joinP95:p95(report.joinMs),rttP95:p95(report.rttMs),rttSamples:report.rttMs.length};
 await writeFile('docs/hosted-metrics.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));console.log(JSON.stringify(report.counts));
}catch(error){report.error=String(error);await writeFile('docs/hosted-metrics.json',JSON.stringify(report,null,2)+'\n');throw error;}finally{clearTimeout(watchdog);for(const c of clients)c.ws.close();}
