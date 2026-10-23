import {describe,it,expect} from 'vitest';
import {initialState,step,stepPlayer,contact,parseInput,type Input} from '../shared/simulation';
const idle:Input={seq:1,move:0,jump:false,action:false};
describe('authoritative interception',()=>{
  it('uses swept contact for fast projectiles',()=>{expect(contact(0,0,1000,0,500,0,20,20)).toBeCloseTo(.49);});
  it('blocks before the president and removes the tomato exactly once',()=>{
    const s=initialState();s.tomatoes=[{id:1,x:800,y:570,vx:-12000,vy:0,life:2}];step(s,[idle,idle]);
    expect(s.composure).toBe(5);expect(s.events[0].kind).toBe('block');expect(s.tomatoes).toHaveLength(0);
    step(s,[idle,idle]);expect(s.events).toHaveLength(0);
  });
  it('damages when the guard is not on the path',()=>{
    const s=initialState();s.players[0].x=400;s.tomatoes=[{id:1,x:690,y:570,vx:-6000,vy:0,life:2}];step(s,[idle,idle]);expect(s.composure).toBe(4);expect(s.events[0].kind).toBe('hit');
  });
  it('rejects overlapping throws without spending cooldown',()=>{const s=initialState();s.players[1].x=640;step(s,[idle,{...idle,action:true}]);expect(s.tomatoes).toHaveLength(0);expect(s.players[1].cooldown).toBe(0);});
  it('does not allow a cooldown action to restart a dive',()=>{const p=initialState().players[0];stepPlayer(p,{...idle,action:true});for(let i=0;i<60;i++)stepPlayer(p,idle);stepPlayer(p,{...idle,action:true});expect(p.dive).toBe(0);expect(p.cooldown).toBeGreaterThan(2);});
  it('rejects malformed and nonfinite input',()=>{expect(parseInput({...idle,seq:NaN})).toBeNull();expect(parseInput({...idle,move:'1'})).toBeNull();expect(parseInput({...idle,action:1})).toBeNull();});
});
