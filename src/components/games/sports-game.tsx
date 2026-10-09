import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Matter from 'matter-js';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { box, createScene, disc, gameColors } from '@/lib/games/scene';
import type { Level } from '@/lib/games/board';
import type { Mode } from './board-game';
import { celebrate } from '@/lib/celebrate';
export type Sport = 'hockey' | 'fichas' | 'pong';
export function SportsGame({ kind, mode, level }: { kind: Sport; mode: Mode; level: Level }) {
  const host = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0), [score, setScore] = useState([0, 0]), [turn, setTurn] = useState(0), [winner, setWinner] = useState<number | null>(null), [paused, setPaused] = useState(false);
  const pause = useRef(false); pause.current = paused;
  useEffect(() => {
    if (!host.current) return;
    const view = createScene(host.current, 8, 12), colors = gameColors();
    const { Engine, Bodies, Body, Composite } = Matter;
    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    const surface = box(8.2, 0.4, 12.2, kind === 'fichas' ? colors.grass : colors.ice); surface.position.y = -0.3; view.scene.add(surface);
    const line = box(7.8, 0.01, 0.045, colors.white); line.position.y = -0.04; view.scene.add(line);
    for (const x of [-4.1, 4.1]) {
      const wall = Bodies.rectangle(x, 0, 0.2, 12.4, { isStatic: true, restitution: 0.95 }); Composite.add(engine.world, wall);
      const rim = box(0.18, 0.24, 12.4, colors.wood); rim.position.set(x, 0.04, 0); view.scene.add(rim);
    }
    for (const y of [-6.1, 6.1]) for (const x of [-2.9, 2.9]) {
      if (kind !== 'pong') Composite.add(engine.world, Bodies.rectangle(x, y, 2.2, 0.2, { isStatic: true, restitution: 0.9 }));
      const rim = box(2.2, 0.24, 0.18, colors.wood); rim.position.set(x, 0.04, y); view.scene.add(rim);
    }
    const entities: { body: Matter.Body; mesh: THREE.Mesh; team: number }[] = [];
    function add(x: number, y: number, radius: number, team: number, fixed = false) {
      const body = Bodies.circle(x, y, radius, { isStatic: fixed, restitution: 0.96, friction: 0, frictionAir: kind === 'fichas' ? 0.035 : 0.002, density: team === 2 ? 0.001 : 0.002 });
      const mesh = disc(radius, team === 2 ? 0.17 : 0.3, team === 0 ? colors.rose : team === 1 ? colors.gold : colors.white);
      mesh.position.set(x, 0.16, y); view.scene.add(mesh); Composite.add(engine.world, body);
      const entity = { body, mesh, team }; entities.push(entity); return entity;
    }
    const ball = add(0, 0, kind === 'hockey' ? 0.3 : 0.22, 2);
    const players: typeof entities = [];
    if (kind === 'fichas') {
      for (let team = 0; team < 2; team++) for (let i = 0; i < 3; i++) players.push(add((i - 1) * 2.2, team ? -3.8 : 3.8, 0.48, team));
    } else if (kind === 'hockey') {
      players.push(add(0, 4.6, 0.65, 0, true), add(0, -4.6, 0.65, 1, true));
    } else {
      for (let team = 0; team < 2; team++) {
        const body = Bodies.rectangle(0, team ? -5.1 : 5.1, 2.2, 0.28, { isStatic: true, restitution: 1 });
        const mesh = box(2.2, 0.3, 0.28, team ? colors.gold : colors.rose); mesh.position.set(0, 0.15, body.position.y);
        Composite.add(engine.world, body); view.scene.add(mesh);
        const entity = { body, mesh, team }; entities.push(entity); players.push(entity);
      }
    }
    let scores = [0, 0], current = 0, over = false, moving = false, botWait = 0, accumulator = 0;
    const target = kind === 'fichas' ? 3 : 5;
    const pointerTeam = new Map<number, number>();
    let drag: { entity: typeof ball; x: number; y: number } | null = null;
    let arrow: THREE.ArrowHelper | null = null;
    const resetPositions = () => {
      Body.setPosition(ball.body, { x: 0, y: 0 }); Body.setVelocity(ball.body, { x: 0, y: 0 });
      players.forEach((p, i) => { Body.setPosition(p.body, { x: kind === 'fichas' ? (i % 3 - 1) * 2.2 : 0, y: (p.team ? -1 : 1) * (kind === 'fichas' ? 3.8 : kind === 'hockey' ? 4.6 : 5.1) }); Body.setVelocity(p.body, { x: 0, y: 0 }); });
      if (kind !== 'fichas') Body.setVelocity(ball.body, { x: 0.035, y: current ? 0.08 : -0.08 });
    };
    resetPositions();
    const botShot = () => {
      // Score each contact point by goal alignment and travel distance.
      const candidates = players.filter(p => p.team === 1);
      let best = candidates[0]; let rating = -Infinity;
      for (const p of candidates) {
        const dx = ball.body.position.x - p.body.position.x, dy = ball.body.position.y - p.body.position.y;
        const value = dy / (Math.hypot(dx, dy) || 1) * 4 - Math.hypot(dx, dy) * 0.25;
        if (value > rating) { best = p; rating = value; }
      }
      if (!best) return;
      const distance = Math.hypot(ball.body.position.x, 6 - ball.body.position.y) || 1;
      const contact = { x: ball.body.position.x + ball.body.position.x / distance * 0.6, y: ball.body.position.y - (6 - ball.body.position.y) / distance * 0.6 };
      const error = level === 'facil' ? 0.6 : level === 'media' ? 0.18 : 0.02;
      const dx = contact.x - best.body.position.x + (Math.random() - 0.5) * error, dy = contact.y - best.body.position.y;
      const length = Math.hypot(dx, dy) || 1;
      Body.setVelocity(best.body, { x: dx / length * 0.35, y: dy / length * 0.35 }); moving = true;
    };
    const down = (e: PointerEvent) => {
      if (over || pause.current) return;
      const point = view.point(e); if (!point) return;
      const team = mode === 'local' ? (point.z < 0 ? 1 : 0) : 0;
      if (kind === 'fichas') {
        if (moving || current !== team) return;
        const entity = players.find(p => p.team === team && Math.hypot(point.x - p.body.position.x, point.z - p.body.position.y) < 0.75);
        if (entity) drag = { entity, x: point.x, y: point.z };
      } else pointerTeam.set(e.pointerId, team);
      view.renderer.domElement.setPointerCapture(e.pointerId); move(e);
    };
    const move = (e: PointerEvent) => {
      if (pause.current || over) return;
      const point = view.point(e); if (!point) return;
      if (drag) {
        drag.x = point.x; drag.y = point.z;
        if (arrow) view.scene.remove(arrow);
        const dir = new THREE.Vector3(drag.entity.body.position.x - point.x, 0, drag.entity.body.position.y - point.z);
        const length = Math.min(dir.length(), 3); dir.normalize();
        arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(drag.entity.body.position.x, 0.4, drag.entity.body.position.y), length, colors.white, 0.25, 0.18); view.scene.add(arrow);
      } else {
        const team = pointerTeam.get(e.pointerId); if (team === undefined) return;
        const p = players.find(p => p.team === team); if (!p) return;
        const x = Math.max(-2.8, Math.min(2.8, point.x));
        const y = kind === 'pong' ? p.body.position.y : team ? Math.max(-5.2, Math.min(-0.8, point.z)) : Math.max(0.8, Math.min(5.2, point.z));
        Body.setPosition(p.body, { x, y });
      }
    };
    const up = (e: PointerEvent) => {
      pointerTeam.delete(e.pointerId);
      if (drag) {
        const dx = drag.entity.body.position.x - drag.x, dy = drag.entity.body.position.y - drag.y, d = Math.hypot(dx, dy);
        if (d > 0.08 && !pause.current) { const power = Math.min(d, 3) * 0.15; Body.setVelocity(drag.entity.body, { x: dx / d * power, y: dy / d * power }); moving = true; }
        drag = null;
      }
      if (arrow) { view.scene.remove(arrow); arrow.dispose(); arrow = null; }
    };
    const canvas = view.renderer.domElement;
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    const onVisibility = () => { if (document.hidden) setPaused(true); }; document.addEventListener('visibilitychange', onVisibility);
    view.animate(dt => {
      if (!pause.current && !over) {
        if (kind !== 'fichas' && mode === 'bot') {
          const bot = players.find(p => p.team === 1);
          if (bot) {
            const speed = level === 'facil' ? 1.5 : level === 'media' ? 2.8 : 4.5;
            // Predict impact rather than follow the ball's current position.
            const b = ball.body, ahead = b.velocity.y < 0 ? Math.max(0, (-5 - b.position.y) / b.velocity.y) : 0;
            let predicted = b.position.x + b.velocity.x * ahead;
            const span = 7.2; predicted = ((predicted + 3.6) % (span * 2) + span * 2) % (span * 2); predicted = predicted > span ? span * 2 - predicted : predicted; predicted -= 3.6;
            const x = bot.body.position.x + Math.max(-speed * dt, Math.min(speed * dt, predicted - bot.body.position.x));
            Body.setPosition(bot.body, { x: Math.max(-2.8, Math.min(2.8, x)), y: kind === 'hockey' && b.position.y < 0 ? Math.max(-5.1, Math.min(-0.8, b.position.y - 0.8)) : -5.1 });
          }
        }
        if (mode === 'solo' && kind !== 'fichas') {
          const p = players.find(p => p.team === 1); if (p) Body.setPosition(p.body, { x: ball.body.position.x, y: -5.1 });
        }
        if (kind === 'fichas' && current === 1 && !moving && mode === 'bot') { botWait += dt; if (botWait > 0.65) { botShot(); botWait = 0; } }
        accumulator += dt;
        while (accumulator >= 1 / 60) { Engine.update(engine, 1000 / 60); accumulator -= 1 / 60; }
        const y = ball.body.position.y;
        if (Math.abs(y) > 6.5) {
          const team = y < 0 ? 0 : 1;
          scores = scores.map((s, i) => i === team ? s + 1 : s); setScore([...scores]);
          if ((scores[team] ?? 0) >= target && mode !== 'solo') { over = true; setWinner(team); celebrate(24); }
          current = team === 0 ? 1 : 0; setTurn(current); moving = false; resetPositions();
        }
        if (kind === 'fichas' && moving && entities.every(e => Math.hypot(e.body.velocity.x, e.body.velocity.y) < 0.012)) {
          for (const e of entities) Body.setVelocity(e.body, { x: 0, y: 0 });
          moving = false; current = mode === 'solo' ? 0 : 1 - current; setTurn(current);
        }
        // Keep a serve alive after a stationary hockey collision.
        if (kind === 'hockey' && Math.hypot(ball.body.velocity.x, ball.body.velocity.y) < 0.005) Body.setVelocity(ball.body, { x: 0.03, y: 0.045 });
      }
      for (const e of entities) { e.mesh.position.x = e.body.position.x; e.mesh.position.z = e.body.position.y; e.mesh.rotation.y = -e.body.angle; }
    });
    return () => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); document.removeEventListener('visibilitychange', onVisibility); view.dispose(); Composite.clear(engine.world, false); Engine.clear(engine); };
  }, [kind, mode, level, round]);
  const reset = () => { setScore([0,0]); setWinner(null); setTurn(0); setPaused(false); setRound(r => r + 1); };
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex gap-6"><span className="text-primary text-xl font-semibold">Rosa {score[0]}</span><span className="text-gold text-xl font-semibold">{mode === 'bot' ? 'Bot' : mode === 'solo' ? 'Práctica' : 'Oro'} {score[1]}</span></div>
      <div className="flex"><Button variant="ghost" size="icon" aria-label="Pausar o continuar" title="Pausar o continuar" onClick={() => setPaused(p => !p)}>{paused ? <Play /> : <Pause />}</Button><Button variant="ghost" size="icon" title="Revancha" aria-label="Revancha" onClick={reset}><RotateCcw /></Button></div>
    </div>
    <p role="status" className="text-sm text-muted-foreground">{winner !== null ? `Ganó ${winner ? mode === 'bot' ? 'el bot' : 'Oro' : 'Rosa'}` : paused ? 'Partida en pausa' : kind === 'fichas' ? `Turno de ${turn ? mode === 'bot' ? 'el bot' : 'Oro' : 'Rosa'}` : mode === 'solo' ? 'Práctica libre' : `Primero en llegar a ${kind === 'fichas' ? 3 : 5}`}</p>
    <div ref={host} className="game-scene aspect-[2/3] max-h-[680px] w-full" />
  </div>;
}
