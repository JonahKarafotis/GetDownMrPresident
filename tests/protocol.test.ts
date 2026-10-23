import {expect,it} from 'vitest';
import {decodeMessage} from '../shared/protocol';
it('rejects malformed, oversized, and arbitrary client state',()=>{
 for(const raw of ['null','[]','{','x'.repeat(2049),'{"type":"setComposure","value":0}','{"type":"ping","sent":"42"}'])expect(decodeMessage(raw)).toBeNull();
});
it('accepts narrow input contracts and strips unrelated state',()=>{
 expect(decodeMessage(JSON.stringify({type:'input',epoch:'round',input:{seq:3,move:1,jump:false,action:true,x:9000},composure:0}))).toEqual({type:'input',epoch:'round',input:{seq:3,move:1,jump:false,action:true}});
});
it('accepts finite health-check times and numeric version identifiers',()=>{
 expect(decodeMessage('{"type":"ping","sent":12.5}')).toEqual({type:'ping',sent:12.5});
 expect(decodeMessage('{"type":"hello","version":1}')).toEqual({type:'hello',version:1});
 expect(decodeMessage('{"type":"hello","version":"1"}')).toBeNull();
});
