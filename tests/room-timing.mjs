import {writeFile} from 'node:fs/promises';
const base=process.argv[2],results=[];
for(let i=0;i<10;i++){
 const at=performance.now();
 try{const r=await fetch(base+'/api/create',{method:'POST',signal:AbortSignal.timeout(12000)});const body=await r.json();results.push({ms:performance.now()-at,status:r.status,timing:r.headers.get('server-timing'),code:body.code});}
 catch(e){results.push({ms:performance.now()-at,error:String(e)});}
 console.log(results.at(-1));await writeFile('docs/room-timing.json',JSON.stringify(results,null,2)+'\n');
}
