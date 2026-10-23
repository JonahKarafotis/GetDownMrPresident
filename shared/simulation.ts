// Pure fixed-step rules: no browser, Phaser, or hosting dependencies.
export const DT = 1 / 60;
export const FLOOR = 600;
export const PROTOCOL = 1;
export type Role = 'bodyguard' | 'protester';
export type Input = { seq: number; move: -1 | 0 | 1; jump: boolean; action: boolean };
export type Player = { role: Role; x: number; y: number; vx: number; vy: number; facing: -1 | 1; cooldown: number; dive: number; recovery: number; ack: number };
export type Tomato = { id: number; x: number; y: number; vx: number; vy: number; life: number };
export type GameEvent = { id: number; tick: number; kind: 'block' | 'hit'; x: number; y: number };
export type State = { tick: number; players: Player[]; tomatoes: Tomato[]; composure: number; nextId: number; events: GameEvent[] };
export const president = { x: 640, y: FLOOR - 32, w: 30, h: 64 };
export function initialState(): State {
  return { tick: 0, players: [player('bodyguard', 730, -1), player('protester', 1000, -1)], tomatoes: [], composure: 5, nextId: 1, events: [] };
}
function player(role: Role, x: number, facing: -1 | 1): Player {
  return { role, x, y: FLOOR - 30, vx: 0, vy: 0, facing, cooldown: 0, dive: 0, recovery: 0, ack: -1 };
}
export function dimensions(p: Player) { return { w: p.dive > 0 ? 80 : 30, h: p.dive > 0 ? 28 : 60 }; }
export function overlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}
export function stepPlayer(p: Player, input: Input): boolean {
  p.cooldown = Math.max(0, p.cooldown - DT);
  p.recovery = Math.max(0, p.recovery - DT);
  const wasDiving = p.dive > 0;
  p.dive = Math.max(0, p.dive - DT);
  if (wasDiving && p.dive === 0) p.recovery = 0.5;
  if (!wasDiving && input.move) p.facing = input.move;
  if (input.jump && p.y >= FLOOR - 30 && !wasDiving && p.recovery === 0) p.vy = -570;
  let throwRequested = false;
  if (input.action && p.cooldown === 0 && p.recovery === 0 && !wasDiving) {
    if (p.role === 'bodyguard') { p.dive = 0.45; p.cooldown = 4; }
    else throwRequested = true;
  }
  p.vx = p.dive > 0 ? p.facing * 650 : input.move * (p.recovery > 0 ? 120 : 300);
  p.x = Math.max(20, Math.min(1260, p.x + p.vx * DT));
  p.vy += 1500 * DT;
  p.y = Math.min(FLOOR - 30, p.y + p.vy * DT);
  if (p.y === FLOOR - 30) p.vy = 0;
  if (p.role === 'bodyguard') {
    const d = dimensions(p);
    if (overlap(p.x, p.y, d.w, d.h, president.x, president.y, president.w, president.h))
      p.x = president.x + (p.x < president.x ? -1 : 1) * (d.w + president.w) / 2;
  }
  p.ack = input.seq;
  return throwRequested;
}
// Slab intersection returns first contact fraction, preventing fast tomatoes tunneling.
export function contact(x: number, y: number, nx: number, ny: number, cx: number, cy: number, w: number, h: number): number | null {
  let enter = 0, leave = 1;
  for (const [a, delta, min, max] of [[x, nx-x, cx-w/2, cx+w/2], [y, ny-y, cy-h/2, cy+h/2]]) {
    if (Math.abs(delta) < 1e-10) { if (a < min || a > max) return null; }
    else { const t1=(min-a)/delta, t2=(max-a)/delta; enter=Math.max(enter,Math.min(t1,t2)); leave=Math.min(leave,Math.max(t1,t2)); }
  }
  return enter <= leave ? enter : null;
}
export function step(s: State, inputs: Input[]) {
  s.tick++; s.events = [];
  s.players.forEach((p, i) => {
    if (!stepPlayer(p, inputs[i])) return;
    const x=p.x+p.facing*25, y=p.y-16;
    if (overlap(p.x,p.y,30,60,president.x,president.y,30,64) || overlap(x,y,14,14,president.x,president.y,30,64)) return;
    p.cooldown=0.9;
    s.tomatoes.push({id:s.nextId++,x,y,vx:p.facing*500,vy:-170,life:3});
  });
  const guard=s.players[0], d=dimensions(guard);
  s.tomatoes = s.tomatoes.filter(t => {
    t.life-=DT; t.vy+=650*DT;
    const nx=t.x+t.vx*DT, ny=t.y+t.vy*DT;
    const block=contact(t.x,t.y,nx,ny,guard.x,guard.y,d.w+14,d.h+14);
    const hit=contact(t.x,t.y,nx,ny,president.x,president.y,44,78);
    if (block!==null || hit!==null) {
      const kind=block!==null && (hit===null || block<=hit) ? 'block':'hit';
      const at=kind==='block'?block!:hit!;
      s.events.push({id:s.nextId++,tick:s.tick,kind,x:t.x+(nx-t.x)*at,y:t.y+(ny-t.y)*at});
      if(kind==='hit') s.composure=Math.max(0,s.composure-1);
      return false;
    }
    t.x=nx;t.y=ny;
    return t.life>0 && ny<FLOOR && nx>-30 && nx<1310;
  });
}
export function parseInput(value: unknown): Input | null {
  if (!value || typeof value!=='object') return null;
  const v=value as Record<string, unknown>;
  if(!Number.isSafeInteger(v.seq)||Number(v.seq)<0||![-1,0,1].includes(Number(v.move))||typeof v.move!=='number'||typeof v.jump!=='boolean'||typeof v.action!=='boolean')return null;
  return {seq:v.seq as number,move:v.move as Input['move'],jump:v.jump,action:v.action};
}
