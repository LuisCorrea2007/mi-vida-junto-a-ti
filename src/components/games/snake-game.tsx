import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { box, createScene, disc, gameColors } from '@/lib/games/scene';
import type { Level } from '@/lib/games/board';
import type { Mode } from './board-game';
type Point = [number, number];
export function SnakeGame({ mode, level }: { mode: Mode; level: Level }) {
  const host = useRef<HTMLDivElement>(null), dirs = useRef<Point[]>([[1,0],[-1,0]]), pausedRef = useRef(false);
  const [paused, setPaused] = useState(false), [round, setRound] = useState(0), [result, setResult] = useState<string | null>(null), [scores, setScores] = useState([0,0]);
  pausedRef.current = paused;
  const steer = (player: number, dir: Point) => {
    const current = dirs.current[player];
    if (current && !(current[0] === -dir[0] && current[1] === -dir[1])) dirs.current[player] = dir;
  };
  useEffect(() => {
    if (!host.current) return;
    const view = createScene(host.current, 17, 17), colors = gameColors(), N = 16;
    dirs.current = [[1,0],[-1,0]];
    const base = box(N + 0.4, 0.3, N + 0.4, colors.mint); base.position.y = -0.3; view.scene.add(base);
    for (let i = 0; i < N; i++) {
      const line = box(0.025, 0.01, N, colors.ice); line.position.set(i - 7.5, -0.13, 0); view.scene.add(line);
      const cross = box(N, 0.01, 0.025, colors.ice); cross.position.set(0, -0.13, i - 7.5); view.scene.add(cross);
    }
    const snakes: Point[][] = [[[3,8],[2,8],[1,8]], [[12,7],[13,7],[14,7]]];
    const count = mode === 'solo' ? 1 : 2;
    let food: Point = [8,3], time = 0, over = false, pts = [0,0];
    const meshes: THREE.Mesh[] = [];
    const fruit = disc(0.3, 0.5, colors.gold); view.scene.add(fruit);
    const occupied = (x: number, y: number) => snakes.slice(0,count).some(s => s.some(p => p[0] === x && p[1] === y));
    const placeFood = () => {
      const free: Point[] = [];
      for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (!occupied(x,y)) free.push([x,y]);
      const next = free[Math.floor(Math.random() * free.length)];
      if (next) food = next; else { over = true; setResult('Llenaste el jardín. ¡Victoria!'); }
    };
    const draw = () => {
      for (const m of meshes) { view.scene.remove(m); m.geometry.dispose(); if (m.material instanceof THREE.Material) m.material.dispose(); } meshes.length = 0;
      for (let p = 0; p < count; p++) snakes[p]?.forEach((point, i) => {
        const segment = box(0.82, i ? 0.45 : 0.65, 0.82, p ? colors.gold : colors.rose); segment.position.set(point[0] - 7.5, 0.17, point[1] - 7.5); view.scene.add(segment); meshes.push(segment);
        if (!i) for (const offset of [-0.18, 0.18]) {
          const eye = disc(0.09, 0.05, colors.ink); eye.position.set(point[0] - 7.5 + offset, 0.51, point[1] - 7.5 - 0.18); view.scene.add(eye); meshes.push(eye);
        }
      });
      fruit.position.set(food[0] - 7.5, 0.25, food[1] - 7.5);
    };
    const keys = (e: KeyboardEvent) => {
      const map: Record<string, [number, Point]> = { w:[0,[0,-1]],s:[0,[0,1]],a:[0,[-1,0]],d:[0,[1,0]],ArrowUp:[mode === 'local' ? 1 : 0,[0,-1]],ArrowDown:[mode === 'local' ? 1 : 0,[0,1]],ArrowLeft:[mode === 'local' ? 1 : 0,[-1,0]],ArrowRight:[mode === 'local' ? 1 : 0,[1,0]] };
      const action = map[e.key]; if (action) { e.preventDefault(); steer(action[0], action[1]); }
    };
    window.addEventListener('keydown', keys);
    draw();
    view.animate(dt => {
      if (over || pausedRef.current) return;
      time += dt;
      if (time < (level === 'facil' ? 0.22 : level === 'media' ? 0.17 : 0.13)) return;
      time = 0;
      if (mode === 'bot') {
        const head = snakes[1]?.[0], current = dirs.current[1];
        if (head && current) {
          // Flood-fill measures safe space; distance to food breaks ties.
          const options: Point[] = [[1,0],[-1,0],[0,1],[0,-1]];
          let best = current, rating = -Infinity;
          for (const dir of options) {
            if (dir[0] === -current[0] && dir[1] === -current[1]) continue;
            const x = (head[0] + dir[0] + N) % N, y = (head[1] + dir[1] + N) % N;
            if (occupied(x,y)) continue;
            const seen = new Set<string>(), queue: Point[] = [[x,y]];
            while (queue.length && seen.size < (level === 'dificil' ? 100 : 35)) {
              const point = queue.shift(); if (!point) break;
              const key = point.join(','); if (seen.has(key) || occupied(point[0],point[1])) continue; seen.add(key);
              for (const d of options) queue.push([(point[0]+d[0]+N)%N,(point[1]+d[1]+N)%N]);
            }
            const distance = Math.min(Math.abs(x-food[0]), N-Math.abs(x-food[0])) + Math.min(Math.abs(y-food[1]),N-Math.abs(y-food[1]));
            const score = seen.size * 0.3 - distance + (level === 'facil' ? Math.random()*10 : 0);
            if (score > rating) { rating = score; best = dir; }
          }
          dirs.current[1] = best;
        }
      }
      const heads = snakes.slice(0,count).map((s,p): Point => { const head = s[0] ?? [0,0], dir = dirs.current[p] ?? [1,0]; return [(head[0]+dir[0]+N)%N,(head[1]+dir[1]+N)%N]; });
      const dead = heads.map((head,p) => snakes.slice(0,count).some(s => s.slice(0, (head[0] === food[0] && head[1] === food[1]) ? s.length : -1).some(c => c[0] === head[0] && c[1] === head[1])) || heads.some((h,q) => q !== p && h[0] === head[0] && h[1] === head[1]));
      if (dead.some(Boolean)) { over = true; setResult(count === 1 ? `Recogiste ${pts[0]} frutos` : dead.every(Boolean) ? 'Empate' : `Ganó ${dead[0] ? mode === 'bot' ? 'el bot' : 'Oro' : 'Rosa'}`); return; }
      heads.forEach((head,p) => {
        const snake = snakes[p]; if (!snake) return;
        snake.unshift(head);
        if (head[0] === food[0] && head[1] === food[1]) { pts = pts.map((n,i) => i === p ? n+1 : n); setScores([...pts]); placeFood(); } else snake.pop();
      }); draw();
    });
    return () => { window.removeEventListener('keydown', keys); view.dispose(); };
  }, [mode, level, round]);
  const reset = () => { setScores([0,0]); setResult(null); setPaused(false); setRound(r => r+1); };
  const pad = (p: number) => <div className="flex justify-center gap-1">{([[[0,-1],ArrowUp,'Arriba'],[[-1,0],ArrowLeft,'Izquierda'],[[0,1],ArrowDown,'Abajo'],[[1,0],ArrowRight,'Derecha']] as const).map(([dir,Icon,label]) => <Button key={label} variant="outline" size="icon" title={`${p ? 'Oro' : 'Rosa'}: ${label}`} aria-label={`${p ? 'Oro' : 'Rosa'}: ${label}`} disabled={!!result || paused} onClick={() => steer(p,[dir[0],dir[1]])}><Icon /></Button>)}</div>;
  return <div className="space-y-3"><div className="flex items-center justify-between gap-2"><p role="status" className="text-sm">{result ?? (paused ? 'Partida en pausa' : `Rosa ${scores[0]}${mode !== 'solo' ? ` · ${mode === 'bot' ? 'Bot' : 'Oro'} ${scores[1]}` : ''}`)}</p><div className="flex"><Button variant="ghost" size="icon" aria-label="Pausar o continuar" title="Pausar o continuar" onClick={() => setPaused(p => !p)}>{paused ? <Play/> : <Pause/>}</Button><Button variant="ghost" size="icon" aria-label="Revancha" title="Revancha" onClick={reset}><RotateCcw/></Button></div></div>{mode === 'local' && pad(1)}<div ref={host} className="game-scene aspect-square w-full"/>{pad(0)}</div>;
}
