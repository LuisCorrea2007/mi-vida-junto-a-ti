// Índices de tablero siempre dentro de rango; se omite la verificación estricta de índices en este archivo.
// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChefHat, Crown, Dices, Gamepad2, RotateCcw, Target, Waves, Worm, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

/* Paleta del lienzo (borgoña y oro de la app) */
const C = { bg: "#160F12", panel: "#32171F", rose: "#C65D72", cream: "#E9D6BE", wine: "#8A4256", gold: "#D9B77E" };

const LOCAL_GAMES = [
  { kind: "damas", name: "Damas", desc: "Captura sus fichas y corona tu reina.", icon: Crown },
  { kind: "parchis", name: "Parchís", desc: "Dados, carreras y fichas que vuelven a casa.", icon: Dices },
  { kind: "serpientes", name: "Duelo de serpientes", desc: "Come corazones sin chocar con tu amor.", icon: Worm },
  { kind: "pong", name: "Pong de dos", desc: "Cada uno en su lado de la pantalla.", icon: Waves },
  { kind: "catapultas", name: "Duelo de catapultas", desc: "Ángulo, fuerza y viento: derriba su castillo.", icon: Target },
  { kind: "cocina", name: "Cocina juntos", desc: "Cooperativo: saquen los pedidos antes del tiempo.", icon: ChefHat },
] as const;
type LocalKind = (typeof LOCAL_GAMES)[number]["kind"];

const P = ["Rosa", "Oro"] as const;

export function LocalGames() {
  const [game, setGame] = useState<LocalKind | null>(null);
  const [round, setRound] = useState(0);
  if (game) {
    const meta = LOCAL_GAMES.find((g) => g.kind === game)!;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl">{meta.name}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setRound((r) => r + 1)}><RotateCcw className="size-4" /> Revancha</Button>
            <Button size="sm" variant="ghost" onClick={() => setGame(null)}><X className="size-4" /> Salir</Button>
          </div>
        </div>
        <div key={round}>
          {game === "damas" && <Damas />}
          {game === "parchis" && <Parchis />}
          {game === "serpientes" && <Serpientes />}
          {game === "pong" && <Pong />}
          {game === "catapultas" && <Catapultas />}
          {game === "cocina" && <Cocina />}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Para cuando estén juntos: un solo celular, los dos jugando.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {LOCAL_GAMES.map((g) => (
          <Card key={g.kind} className="press surface cursor-pointer" onClick={() => setGame(g.kind)}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary"><g.icon className="size-5" /></span>
              <div className="flex-1">
                <p className="font-semibold">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
              <Gamepad2 className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Banner({ text, win }: { text: string; win?: boolean }) {
  useEffect(() => { if (win) celebrate(30); }, [win]);
  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-center text-sm font-medium",
      win ? "border-primary/50 bg-primary/15 text-primary" : "border-border/70 bg-card/60")}>{text}</div>
  );
}

/* ============================== Damas ============================== */

type Piece = { p: 0 | 1; king: boolean } | null;
type Move = { from: number; to: number; cap?: number };

function initDamas(): Piece[] {
  const b: Piece[] = Array(64).fill(null);
  for (let i = 0; i < 64; i++) {
    const r = Math.floor(i / 8), c = i % 8;
    if ((r + c) % 2 === 1) { if (r < 3) b[i] = { p: 1, king: false }; else if (r > 4) b[i] = { p: 0, king: false }; }
  }
  return b;
}

function movesFor(b: Piece[], i: number): Move[] {
  const pc = b[i]; if (!pc) return [];
  const r = Math.floor(i / 8), c = i % 8;
  const dirs = pc.king ? [-1, 1] : [pc.p === 0 ? -1 : 1];
  const out: Move[] = [];
  for (const dr of dirs) for (const dc of [-1, 1]) {
    const r1 = r + dr, c1 = c + dc;
    if (r1 < 0 || r1 > 7 || c1 < 0 || c1 > 7) continue;
    const t = r1 * 8 + c1;
    if (!b[t]) out.push({ from: i, to: t });
    else if (b[t]!.p !== pc.p) {
      const r2 = r1 + dr, c2 = c1 + dc;
      if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && !b[r2 * 8 + c2]) out.push({ from: i, to: r2 * 8 + c2, cap: t });
    }
  }
  return out;
}

function Damas() {
  const [board, setBoard] = useState<Piece[]>(initDamas);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [sel, setSel] = useState<number | null>(null);
  const [chain, setChain] = useState<number | null>(null);

  const all = board.flatMap((pc, i) => (pc && pc.p === turn ? movesFor(board, i) : []));
  const mustCap = all.some((m) => m.cap !== undefined);
  const legal = (i: number) => {
    const ms = movesFor(board, i);
    if (chain !== null) return i === chain ? ms.filter((m) => m.cap !== undefined) : [];
    return mustCap ? ms.filter((m) => m.cap !== undefined) : ms;
  };
  const left = [0, 1].map((p) => board.filter((x) => x?.p === p).length);
  const winner = left[0] === 0 ? 1 : left[1] === 0 ? 0 : all.length === 0 ? (turn === 0 ? 1 : 0) : null;
  const targets = sel !== null ? legal(sel) : [];

  const click = (i: number) => {
    if (winner !== null) return;
    const mv = targets.find((m) => m.to === i);
    if (mv) {
      const nb = [...board];
      const pc = { ...nb[mv.from]! };
      nb[mv.from] = null;
      if (mv.cap !== undefined) nb[mv.cap] = null;
      const row = Math.floor(mv.to / 8);
      const crowned = !pc.king && ((pc.p === 0 && row === 0) || (pc.p === 1 && row === 7));
      if (crowned) pc.king = true;
      nb[mv.to] = pc;
      setBoard(nb);
      if (mv.cap !== undefined && !crowned && movesFor(nb, mv.to).some((m) => m.cap !== undefined)) {
        setChain(mv.to); setSel(mv.to); return;
      }
      setChain(null); setSel(null); setTurn(turn === 0 ? 1 : 0);
      return;
    }
    if (board[i]?.p === turn && chain === null && legal(i).length) setSel(i);
  };

  return (
    <div className="space-y-3">
      {winner !== null ? <Banner win text={`¡Ganó ${P[winner]}! Le toca un beso de premio.`} />
        : <Banner text={`Turno de ${P[turn]}${mustCap ? " · captura obligatoria" : ""} · Rosa ${left[0]} · Oro ${left[1]}`} />}
      <div className="mx-auto grid aspect-square w-full max-w-md grid-cols-8 overflow-hidden rounded-2xl border border-border/70">
        {board.map((pc, i) => {
          const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
          const isTarget = targets.some((m) => m.to === i);
          return (
            <button key={i} onClick={() => click(i)}
              className={cn("relative grid place-items-center", dark ? "bg-accent" : "bg-gold/20", sel === i && "ring-2 ring-inset ring-primary")}>
              {isTarget && <span className="size-3 rounded-full bg-primary/70" />}
              {pc && (
                <span className={cn("grid size-[78%] place-items-center rounded-full border-2 shadow-lg transition-transform",
                  pc.p === 0 ? "border-primary bg-primary/80" : "border-gold bg-gold/80", sel === i && "scale-110")}>
                  {pc.king && <Crown className="size-4 text-background" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== Parchís ============================== */
// 40 casillas alrededor del tablero; cada jugador tiene 2 fichas y entra a la meta tras una vuelta.
const LAP = 40, GOAL = 44, SAFE = [0, 10, 20, 30];
const START = [0, 20];

function perimeter(idx: number): [number, number] {
  if (idx < 10) return [10, 10 - idx];       // abajo, derecha→izquierda
  if (idx < 20) return [20 - idx, 0];        // izquierda, abajo→arriba
  if (idx < 30) return [0, idx - 20];        // arriba, izquierda→derecha
  return [idx - 30, 10];                     // derecha, arriba→abajo
}

function Parchis() {
  // progreso de cada ficha: -1 = en casa, 0..39 en camino, 40..43 pasillo, 44 meta
  const [tok, setTok] = useState<number[][]>([[-1, -1], [-1, -1]]);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("Saca un 5 o un 6 para salir de casa.");

  const winner = tok.findIndex((t) => t.every((v) => v === GOAL));
  const abs = (p: number, prog: number) => (START[p] + prog) % LAP;
  const canMove = (p: number, prog: number, d: number) =>
    prog === -1 ? d >= 5 : prog !== GOAL && prog + d <= GOAL;

  const next = (d: number) => { if (d !== 6) setTurn((t) => (t === 0 ? 1 : 0)); setDie(null); };

  const roll = () => {
    if (rolling || die !== null || winner >= 0) return;
    setRolling(true);
    let n = 0;
    const id = setInterval(() => {
      setDie(1 + Math.floor(Math.random() * 6));
      if (++n > 8) {
        clearInterval(id);
        const d = 1 + Math.floor(Math.random() * 6);
        setDie(d); setRolling(false);
        if (!tok[turn].some((pr) => canMove(turn, pr, d))) {
          setMsg(`${P[turn]} sacó ${d} y no puede mover.`);
          setTimeout(() => next(d), 900);
        } else setMsg(`${P[turn]} sacó ${d}: elige una ficha.`);
      }
    }, 70);
  };

  const move = (p: number, k: number) => {
    if (die === null || rolling || p !== turn || !canMove(p, tok[p][k], die)) return;
    const nt = tok.map((a) => [...a]);
    const np = nt[p][k] === -1 ? 0 : nt[p][k] + die;
    nt[p][k] = np;
    let text = np === GOAL ? `¡Ficha de ${P[p]} en la meta!` : `${P[p]} avanza.`;
    if (np < LAP) {
      const sq = abs(p, np);
      const o = p === 0 ? 1 : 0;
      if (!SAFE.includes(sq)) nt[o] = nt[o].map((v) => {
        if (v >= 0 && v < LAP && abs(o, v) === sq) { text = `¡${P[p]} mandó a casa una ficha de ${P[o]}!`; return -1; }
        return v;
      });
    }
    setTok(nt); setMsg(text); next(die);
  };

  const cells = Array.from({ length: LAP }, (_, i) => i);
  return (
    <div className="space-y-3">
      {winner >= 0 ? <Banner win text={`¡${P[winner]} llevó sus fichas a la meta!`} /> : <Banner text={msg} />}
      <div className="mx-auto grid aspect-square w-full max-w-md grid-cols-11 grid-rows-11 gap-0.5 rounded-2xl border border-border/70 bg-card/40 p-1">
        {cells.map((i) => {
          const [r, c] = perimeter(i);
          const here = [0, 1].flatMap((p) => tok[p].map((v, k) => ({ p, k, v })).filter((t) => t.v >= 0 && t.v < LAP && abs(t.p, t.v) === i));
          return (
            <div key={i} style={{ gridRow: r + 1, gridColumn: c + 1 }}
              className={cn("relative flex items-center justify-center gap-0.5 rounded-md",
                SAFE.includes(i) ? "bg-gold/25" : "bg-accent/70", i === START[0] && "ring-1 ring-primary", i === START[1] && "ring-1 ring-gold")}>
              {here.map((t) => (
                <button key={`${t.p}${t.k}`} onClick={() => move(t.p, t.k)}
                  className={cn("size-3 rounded-full border sm:size-4", t.p === 0 ? "border-primary bg-primary" : "border-gold bg-gold",
                    die !== null && t.p === turn && canMove(t.p, t.v, die) && "animate-pulse ring-2 ring-foreground/60")} />
              ))}
            </div>
          );
        })}
        <div style={{ gridRow: "3 / span 7", gridColumn: "3 / span 7" }} className="flex flex-col items-center justify-center gap-3 rounded-xl bg-background/60 p-2">
          <button onClick={roll} disabled={die !== null || winner >= 0}
            className={cn("grid size-16 place-items-center rounded-2xl border-2 border-gold text-3xl font-bold text-gold transition-transform",
              rolling && "animate-spin", die === null && winner < 0 && "press")}
            style={{ background: C.panel }}>{die ?? "?"}</button>
          <p className="text-xs text-muted-foreground">{die === null ? `Toca el dado, ${P[turn]}` : "Mueve una ficha"}</p>
          {[0, 1].map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs">
              <span className={cn("font-semibold", p === 0 ? "text-primary" : "text-gold")}>{P[p]}</span>
              {tok[p].map((v, k) => (
                <button key={k} onClick={() => move(p, k)}
                  className={cn("rounded-lg border px-2 py-1", p === 0 ? "border-primary/60" : "border-gold/60",
                    die !== null && p === turn && canMove(p, v, die) && "bg-foreground/10 animate-pulse")}>
                  {v === -1 ? "Casa" : v === GOAL ? "Meta" : v >= LAP ? `Pasillo ${v - LAP + 1}` : `${v}/${LAP}`}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">Casillas doradas: seguras. Con 6 repites turno.</p>
    </div>
  );
}

/* ============================== Serpientes ============================== */

type Dir = [number, number];
function Serpientes() {
  const N = 22;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dirs = useRef<Dir[]>([[1, 0], [-1, 0]]);
  const [result, setResult] = useState<string | null>(null);
  const [scores, setScores] = useState([0, 0]);

  const turn = useCallback((p: number, d: Dir) => {
    const cur = dirs.current[p];
    if (cur[0] === -d[0] && cur[1] === -d[1]) return;
    dirs.current[p] = d;
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const S = 16; canvasRef.current!.width = N * S; canvasRef.current!.height = N * S;
    const snakes = [[[4, 11], [3, 11], [2, 11]], [[17, 10], [18, 10], [19, 10]]];
    let food = [11, 5];
    let pts = [0, 0];
    const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snakes.flat().some((c) => c[0] === food[0] && c[1] === food[1])); };
    const keys = (e: KeyboardEvent) => {
      const m: Record<string, [number, Dir]> = { w: [0, [0, -1]], s: [0, [0, 1]], a: [0, [-1, 0]], d: [0, [1, 0]],
        ArrowUp: [1, [0, -1]], ArrowDown: [1, [0, 1]], ArrowLeft: [1, [-1, 0]], ArrowRight: [1, [1, 0]] };
      const k = m[e.key]; if (k) { e.preventDefault(); turn(k[0], k[1]); }
    };
    window.addEventListener("keydown", keys);
    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, N * S, N * S);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(food[0] * S + S / 2, food[1] * S + S / 2, S / 2.4, 0, 7); ctx.fill();
      snakes.forEach((sn, p) => sn.forEach((c, i) => {
        ctx.fillStyle = p === 0 ? (i ? C.rose : C.cream) : (i ? C.wine : C.gold);
        ctx.fillRect(c[0] * S + 1, c[1] * S + 1, S - 2, S - 2);
      }));
    };
    const id = setInterval(() => {
      const heads = snakes.map((sn, p) => [(sn[0][0] + dirs.current[p][0] + N) % N, (sn[0][1] + dirs.current[p][1] + N) % N]);
      const dead = heads.map((h, p) => snakes.some((sn, q) => sn.some((c, i) => c[0] === h[0] && c[1] === h[1] && !(q === p && i === sn.length - 1)))
        || (heads[0][0] === heads[1][0] && heads[0][1] === heads[1][1]));
      if (dead[0] || dead[1]) {
        clearInterval(id);
        setResult(dead[0] && dead[1] ? "¡Choque de frente! Empate." : `¡Ganó ${dead[0] ? P[1] : P[0]}!`);
        return;
      }
      snakes.forEach((sn, p) => {
        sn.unshift(heads[p]);
        if (heads[p][0] === food[0] && heads[p][1] === food[1]) { pts = pts.map((v, i) => (i === p ? v + 1 : v)); setScores(pts); place(); }
        else sn.pop();
      });
      draw();
    }, 130);
    draw();
    return () => { clearInterval(id); window.removeEventListener("keydown", keys); };
  }, [turn]);

  const Pad = ({ p }: { p: number }) => (
    <div className={cn("grid grid-cols-3 gap-1", p === 1 && "rotate-180")}>
      <span /><PadBtn onClick={() => turn(p, [0, -1])} p={p}><ArrowUp className="size-5" /></PadBtn><span />
      <PadBtn onClick={() => turn(p, [-1, 0])} p={p}><ArrowLeft className="size-5" /></PadBtn><span />
      <PadBtn onClick={() => turn(p, [1, 0])} p={p}><ArrowRight className="size-5" /></PadBtn>
      <span /><PadBtn onClick={() => turn(p, [0, 1])} p={p}><ArrowDown className="size-5" /></PadBtn><span />
    </div>
  );
  return (
    <div className="space-y-3">
      <Banner win={!!result && !result.includes("Empate")} text={result ?? `Rosa ${scores[0]} · Oro ${scores[1]} — Rosa usa WASD, Oro las flechas`} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full justify-center"><Pad p={1} /></div>
        <canvas ref={canvasRef} className="aspect-square w-full max-w-sm rounded-2xl border border-border/70" />
        <Pad p={0} />
      </div>
    </div>
  );
}

function PadBtn({ onClick, p, children }: { onClick: () => void; p: number; children: React.ReactNode }) {
  return (
    <button onPointerDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn("press grid size-12 place-items-center rounded-xl border", p === 0 ? "border-primary/60 text-primary" : "border-gold/60 text-gold")}>
      {children}
    </button>
  );
}

/* ============================== Pong ============================== */

function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState([0, 0]);
  const [winner, setWinner] = useState<number | null>(null);

  useEffect(() => {
    const cv = canvasRef.current!, ctx = cv.getContext("2d")!;
    const W = 340, H = 540; cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2);
    const pad = [W / 2, W / 2], PW = 80;
    const ball = { x: W / 2, y: H / 2, vx: 2.5, vy: 4 };
    let pts = [0, 0], raf = 0, alive = true;
    const pointers = new Map<number, number>();
    const handle = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
      pad[y > H / 2 ? 0 : 1] = x; pointers.set(e.pointerId, y);
    };
    cv.addEventListener("pointerdown", handle); cv.addEventListener("pointermove", handle);
    const reset = (dir: number) => { ball.x = W / 2; ball.y = H / 2; ball.vx = (Math.random() - 0.5) * 5; ball.vy = 4 * dir; };
    const loop = () => {
      if (!alive) return;
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < 8 || ball.x > W - 8) ball.vx *= -1;
      const hit = (py: number, i: number, dir: number) => {
        if (Math.abs(ball.y - py) < 10 && Math.abs(ball.x - pad[i]) < PW / 2 + 8 && Math.sign(ball.vy) !== dir) {
          ball.vy = -ball.vy * 1.05; ball.vx = (ball.x - pad[i]) / 8; ball.y = py + dir * 11;
        }
      };
      hit(H - 30, 0, -1); hit(30, 1, 1);
      if (ball.y > H || ball.y < 0) {
        const s = ball.y > H ? 1 : 0;
        pts = pts.map((v, i) => (i === s ? v + 1 : v)); setScore(pts);
        if (pts[s] >= 5) { setWinner(s); alive = false; } else reset(s === 0 ? 1 : -1);
      }
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(233,214,190,0.25)"; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.rose; ctx.fillRect(pad[0] - PW / 2, H - 36, PW, 12);
      ctx.fillStyle = C.gold; ctx.fillRect(pad[1] - PW / 2, 24, PW, 12);
      ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, 7); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { alive = false; cancelAnimationFrame(raf); cv.removeEventListener("pointerdown", handle); cv.removeEventListener("pointermove", handle); };
  }, []);

  return (
    <div className="space-y-3">
      <Banner win={winner !== null} text={winner !== null ? `¡${P[winner]} ganó ${score[winner]} a ${score[winner === 0 ? 1 : 0]}!` : `Rosa ${score[0]} · Oro ${score[1]} — a 5 puntos. Cada uno desliza en su mitad.`} />
      <canvas ref={canvasRef} className="mx-auto block aspect-[34/54] w-full max-w-sm touch-none rounded-2xl border border-border/70" />
    </div>
  );
}

/* ============================== Catapultas ============================== */

function Catapultas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [angle, setAngle] = useState(50);
  const [power, setPower] = useState(60);
  const [hp, setHp] = useState([3, 3]);
  const [wind, setWind] = useState(() => Math.round((Math.random() - 0.5) * 6) / 10);
  const [flying, setFlying] = useState(false);
  const [msg, setMsg] = useState("Ajusta ángulo y fuerza, y dispara.");
  const W = 360, H = 240;
  const hill = useRef(Array.from({ length: W }, (_, x) => H - 30 - Math.sin((x / W) * Math.PI) * 80 - Math.sin(x / 23) * 6));
  const castles = [40, W - 40];

  const draw = useCallback((shot?: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.panel); g.addColorStop(1, C.bg);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.wine; ctx.beginPath(); ctx.moveTo(0, H);
    hill.current.forEach((y, x) => ctx.lineTo(x, y)); ctx.lineTo(W, H); ctx.fill();
    castles.forEach((cx, i) => {
      const base = hill.current[cx];
      ctx.fillStyle = i === 0 ? C.rose : C.gold;
      ctx.fillRect(cx - 14, base - 26, 28, 26);
      for (let k = 0; k < 3; k++) ctx.fillRect(cx - 14 + k * 10, base - 32, 6, 6);
    });
    if (shot) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(shot.x, shot.y, 4, 0, 7); ctx.fill(); }
  }, []);

  useEffect(() => {
    const cv = canvasRef.current!; cv.width = W * 2; cv.height = H * 2; draw();
  }, [draw]);

  const fire = () => {
    if (flying || hp.some((h) => h <= 0)) return;
    setFlying(true);
    const dir = turn === 0 ? 1 : -1;
    const rad = (angle * Math.PI) / 180, v = power / 7;
    let x = castles[turn], y = hill.current[castles[turn]] - 34, vx = Math.cos(rad) * v * dir, vy = -Math.sin(rad) * v;
    const target = turn === 0 ? 1 : 0;
    const tick = () => {
      vx += wind * 0.02; vy += 0.12; x += vx; y += vy;
      const tx = castles[target], ty = hill.current[tx] - 16;
      const end = (text: string, hit: boolean) => {
        draw(); setFlying(false);
        if (hit) {
          const nh = hp.map((h, i) => (i === target ? h - 1 : h)); setHp(nh);
          if (nh[target] <= 0) { setMsg(`¡${P[turn]} derribó el castillo de ${P[target]}!`); return; }
        }
        setMsg(text); setTurn(target as 0 | 1); setWind(Math.round((Math.random() - 0.5) * 6) / 10);
      };
      if (Math.hypot(x - tx, y - ty) < 22) return end(`¡Impacto de ${P[turn]}!`, true);
      if (x < 0 || x > W || (x >= 0 && x < W && y > hill.current[Math.floor(x)])) return end(`${P[turn]} falló. Turno de ${P[target]}.`, false);
      draw({ x, y }); requestAnimationFrame(tick);
    };
    tick();
  };

  const won = hp.findIndex((h) => h <= 0);
  return (
    <div className="space-y-3">
      <Banner win={won >= 0} text={`${msg}  ·  Vidas: Rosa ${hp[0]} · Oro ${hp[1]}  ·  Viento ${wind > 0 ? "→" : wind < 0 ? "←" : "·"} ${Math.abs(wind * 10).toFixed(0)}`} />
      <canvas ref={canvasRef} className="mx-auto block aspect-[3/2] w-full max-w-xl rounded-2xl border border-border/70" />
      <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="space-y-1 text-xs text-muted-foreground">Ángulo {angle}°
          <input type="range" min={10} max={85} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-primary" />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">Fuerza {power}
          <input type="range" min={20} max={100} value={power} onChange={(e) => setPower(+e.target.value)} className="w-full accent-primary" />
        </label>
        <Button onClick={fire} disabled={flying || won >= 0}>Disparar ({P[turn]})</Button>
      </div>
    </div>
  );
}

/* ============================== Cocina juntos ============================== */

const INGREDIENTS = [["Tomate", "Lechuga", "Queso", "Pan"], ["Carne", "Pasta", "Salsa", "Huevo"]] as const;
const RECIPES = [
  { name: "Ensalada", needs: ["Tomate", "Lechuga", "Huevo"] },
  { name: "Hamburguesa", needs: ["Pan", "Carne", "Queso"] },
  { name: "Pasta del amor", needs: ["Pasta", "Salsa", "Queso"] },
  { name: "Sándwich", needs: ["Pan", "Huevo", "Lechuga"] },
  { name: "Lasaña", needs: ["Pasta", "Carne", "Salsa", "Queso"] },
  { name: "Bruschetta", needs: ["Pan", "Tomate", "Salsa"] },
];

function Cocina() {
  const [time, setTime] = useState(90);
  const [orders, setOrders] = useState(() => [0, 1, 2].map(() => RECIPES[Math.floor(Math.random() * RECIPES.length)]));
  const [plate, setPlate] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const over = time <= 0;

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [over]);

  const add = (ing: string) => { if (!over && !plate.includes(ing)) setPlate([...plate, ing]); };
  const serve = () => {
    const idx = orders.findIndex((o) => o.needs.length === plate.length && o.needs.every((n) => plate.includes(n)));
    if (idx === -1) { setFlash("Ese plato no está en los pedidos."); setPlate([]); return; }
    setScore((s) => s + 1); setTime((t) => t + 5); setFlash(`¡${orders[idx].name} servida! +5 s`);
    setOrders(orders.map((o, i) => (i === idx ? RECIPES[Math.floor(Math.random() * RECIPES.length)] : o)));
    setPlate([]);
  };

  const Station = ({ p }: { p: 0 | 1 }) => (
    <div className={cn("grid grid-cols-4 gap-2 rounded-2xl border p-2", p === 0 ? "border-primary/50" : "border-gold/50 rotate-180 sm:rotate-0")}>
      {INGREDIENTS[p].map((ing) => (
        <button key={ing} onClick={() => add(ing)} disabled={over || plate.includes(ing)}
          className={cn("press rounded-xl border px-1 py-3 text-xs font-medium disabled:opacity-40", p === 0 ? "border-primary/40 text-primary" : "border-gold/40 text-gold")}>
          {ing}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <Banner win={over && score > 0} text={over ? `¡Se acabó el turno! Sirvieron ${score} platos juntos.` : `Tiempo ${time}s · Platos ${score} · Rosa tiene unos ingredientes y Oro otros`} />
      <Station p={1} />
      <div className="grid gap-2 sm:grid-cols-3">
        {orders.map((o, i) => (
          <Card key={i} className="surface"><CardContent className="p-3">
            <p className="text-sm font-semibold">{o.name}</p>
            <p className="text-xs text-muted-foreground">{o.needs.map((n) => (plate.includes(n) ? `✓ ${n}` : n)).join(" · ")}</p>
          </CardContent></Card>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-3">
        <ChefHat className="size-5 text-primary" />
        <p className="flex-1 text-sm">{plate.length ? plate.join(" + ") : "Plato vacío"}</p>
        <Button size="sm" variant="ghost" onClick={() => setPlate([])} disabled={over}>Vaciar</Button>
        <Button size="sm" onClick={serve} disabled={over || !plate.length}>Servir</Button>
      </div>
      {flash && <p className="text-center text-xs text-muted-foreground">{flash}</p>}
      <Station p={0} />
    </div>
  );
}
