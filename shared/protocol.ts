import { parseInput, type Input } from './simulation';
export type ClientMessage =
  | {type:'hello';version:number}
  | {type:'ping';sent:number}
  | {type:'start'}
  | {type:'input';epoch:string;input:Input};
export function decodeMessage(raw:unknown):ClientMessage|null {
  if(typeof raw!=='string'||raw.length>2048)return null;
  try {
    const m=JSON.parse(raw);
    if(!m||typeof m!=='object'||Array.isArray(m))return null;
    if(m.type==='hello'&&Number.isSafeInteger(m.version))return {type:'hello',version:m.version};
    if(m.type==='ping'&&typeof m.sent==='number'&&Number.isFinite(m.sent)&&m.sent>=0)return {type:'ping',sent:m.sent};
    if(m.type==='start')return {type:'start'};
    if(m.type==='input'&&typeof m.epoch==='string'&&m.epoch.length<=64){const input=parseInput(m.input);if(input)return {type:'input',epoch:m.epoch,input};}
    return null;
  }catch{return null;}
}
