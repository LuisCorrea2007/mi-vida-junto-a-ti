import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Crown, Lightbulb, Pause, Play, RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyMove, chooseMove, initialBoard, legalMoves, type BoardKind, type BoardState, type Level, type Move } from '@/lib/games/board';
import { box, createScene, disc, gameColors } from '@/lib/games/scene';
import { celebrate } from '@/lib/celebrate';
export type Mode = 'bot' | 'local' | 'solo' | 'online';
function BoardScene({ kind, state, selected, hint, onMove, disabled }: { kind: BoardKind; state: BoardState; selected: number | null; hint: Move | null; onMove: (i: number) => void; disabled: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onMove); callback.current = onMove;
  useEffect(() => {
    if (!host.current) return;
    const cols = kind === 't3' ? 3 : kind === 'c4' ? 7 : 8, rows = kind === 't3' ? 3 : kind === 'c4' ? 6 : 8;
    const view = createScene(host.current, cols + 1, rows + 1), colors = gameColors();
    const base = box(cols + 0.6, 0.4, rows + 0.6, colors.wood); base.position.y = -0.3; view.scene.add(base);
    const clickable: THREE.Object3D[] = [], falling: THREE.Mesh[] = [];
    state.cells.forEach((v, i) => {
      const x = i % cols - (cols - 1) / 2, z = Math.floor(i / cols) - (rows - 1) / 2;
      const tile = box(0.96, 0.1, 0.96, kind === 'damas' ? (Math.floor(i / cols) + i % cols) % 2 ? colors.mint : colors.ice : colors.ice);
      tile.position.set(x, 0, z); tile.userData['index'] = i; clickable.push(tile); view.scene.add(tile);
      if (selected === i || hint?.to === i || hint?.from === i) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: colors.gold }));
        ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.1, z); view.scene.add(ring);
      }
      if (v) {
        const p = disc(kind === 't3' ? 0.31 : 0.38, 0.22, v % 2 ? colors.rose : colors.gold);
        p.position.set(x, kind === 'c4' ? 0.8 : 0.18, z); p.userData['index'] = i; clickable.push(p); view.scene.add(p);
        if (kind === 'c4') falling.push(p);
        if (v > 2 || kind === 't3') {
          const cap = disc(v > 2 ? 0.2 : 0.12, 0.09, colors.white); cap.position.set(x, 0.34, z); view.scene.add(cap);
        }
      }
    });
    const click = (event: PointerEvent) => {
      if (disabled) return;
      const target = view.ray(event).intersectObjects(clickable)[0];
      if (target) callback.current(Number(target.object.userData['index']));
    };
    view.renderer.domElement.addEventListener('pointerdown', click);
    view.animate(dt => { for (const p of falling) p.position.y = Math.max(0.18, p.position.y - dt * 2.5); });
    return () => { view.renderer.domElement.removeEventListener('pointerdown', click); view.dispose(); };
  }, [kind, state, selected, hint, disabled]);
  return <div ref={host} className="game-scene aspect-square w-full" />;
}
export function BoardGame({ kind, mode, level, remote, onSave, locked = false }: { kind: BoardKind; mode: Mode; level: Level; remote?: BoardState; onSave?: (state: BoardState) => void; locked?: boolean }) {
  const [local, setLocal] = useState(() => initialBoard(kind));
  const state = remote ?? local;
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<Move | null>(null);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [paused, setPaused] = useState(false);
  const moves = legalMoves(kind, state);
  const botTurn = mode === 'bot' && state.turn === 2 && state.winner === null;
  const commit = (m: Move) => {
    const next = applyMove(kind, state, m);
    if (next === state) return;
    if (onSave) onSave(next); else { setHistory(h => [...h, state]); setLocal(next); }
    setSelected(next.chain); setHint(null);
  };
  useEffect(() => {
    if (!botTurn || paused) return;
    const timer = setTimeout(() => { const move = chooseMove(kind, state, level); if (move) commit(move); }, 450);
    return () => clearTimeout(timer);
  }, [botTurn, state, level, paused]);
  useEffect(() => { if (state.winner && state.winner > 0) celebrate(24); }, [state.winner]);
  const disabled = locked || paused || botTurn || state.winner !== null;
  const play = (index: number) => {
    if (disabled) return;
    if (kind === 'damas') {
      const move = moves.find(m => m.from === selected && m.to === index);
      if (move) commit(move); else if (moves.some(m => m.from === index)) setSelected(index);
    } else {
      const move = moves.find(m => kind === 'c4' ? m.to % 7 === index % 7 : m.to === index);
      if (move) commit(move);
    }
  };
  const reset = () => { setLocal(initialBoard(kind)); setSelected(null); setHistory([]); setHint(null); setPaused(false); };
  const undo = () => {
    const index = Math.max(0, history.length - (mode === 'bot' && state.turn === 1 ? 2 : 1));
    const previous = history[index];
    if (previous) { setLocal(previous); setHistory(history.slice(0, index)); setSelected(null); setHint(null); }
  };
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
      <p className="text-sm font-medium" role="status">{state.winner !== null ? state.winner === 0 ? 'Empate. ¿Otra juntos?' : `Ganó ${state.winner === 1 ? 'Rosa' : 'Oro'}` : paused ? 'Partida en pausa' : botTurn ? 'El bot está pensando…' : `Turno de ${state.turn === 1 ? 'Rosa' : 'Oro'}`}{kind === 'damas' && moves.some(m => m.capture !== undefined) && state.winner === null ? ' · captura obligatoria' : ''}</p>
      <div className="flex gap-1">
        {mode !== 'online' && <><Button variant="ghost" size="icon" title="Pausar o continuar" aria-label="Pausar o continuar" onClick={() => setPaused(p => !p)}>{paused ? <Play /> : <Pause />}</Button><Button variant="ghost" size="icon" title="Deshacer jugada" aria-label="Deshacer jugada" disabled={!history.length || botTurn} onClick={undo}><Undo2 /></Button><Button variant="ghost" size="icon" title="Revancha" aria-label="Revancha" onClick={reset}><RotateCcw /></Button></>}
        <Button variant="outline" size="icon" title="Sugerir jugada" aria-label="Sugerir jugada" disabled={disabled} onClick={() => setHint(chooseMove(kind, state, 'dificil'))}><Lightbulb /></Button>
      </div>
    </div>
    <BoardScene kind={kind} state={state} selected={selected} hint={hint} onMove={play} disabled={disabled} />
    <div className="flex flex-wrap justify-center gap-1" aria-label="Movimientos disponibles">
      {(kind === 'damas' ? moves.filter(m => selected === m.from) : moves).map(m => <Button key={`${m.from}-${m.to}`} size="sm" variant={hint?.to === m.to ? 'default' : 'outline'} disabled={disabled} onClick={() => commit(m)}>{kind === 'c4' ? `Columna ${m.to % 7 + 1}` : `Casilla ${m.to + 1}`}</Button>)}
      {kind === 'damas' && selected === null && state.winner === null && <Crown className="size-4 text-gold" />}
    </div>
  </div>;
}
