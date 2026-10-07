import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { randomFleet } from "@/components/naval-game";
import {
  C4_COLS, C4_ROWS, c4BotMove, c4Drop, lineWinner, navalBotShot, rpsBotMove, rpsResult, tttBotMove,
  type Cell, type Difficulty, type Rps,
} from "@/lib/game-ai";

type Result = "w" | "l" | "d";
type GameProps = { difficulty: Difficulty; onEnd: (r: Result) => void };
type Score = Record<string, { w: number; l: number; d: number }>;

const LEVELS: { id: Difficulty; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "normal", label: "Normal" },
  { id: "dificil", label: "Difícil" },
];

const ARCADE = [
  { id: "ttt", name: "Tres en raya", emoji: "❌", desc: "El bot difícil nunca pierde.", Comp: TicTacToe },
  { id: "c4", name: "Conecta 4", emoji: "🔴", desc: "Fichas que caen con animación.", Comp: ConnectFour },
  { id: "naval", name: "Batalla naval", emoji: "🚢", desc: "Hunde la flota del bot.", Comp: Naval },
  { id: "memoria", name: "Memoria", emoji: "🃏", desc: "Cartas que giran en 3D.", Comp: Memory },
  { id: "dados", name: "Dados 3D", emoji: "🎲", desc: "Suma más que el bot en 5 rondas.", Comp: Dice },
  { id: "rps", name: "Piedra, papel o tijera", emoji: "✊", desc: "El bot aprende tus jugadas.", Comp: RockPaperScissors },
  { id: "ahorcado", name: "Ahorcado", emoji: "💌", desc: "Adivina la palabra romántica.", Comp: Hangman },
  { id: "reflejos", name: "Reflejos", emoji: "⚡", desc: "Toca más corazones que el bot.", Comp: Reflexes },
] as const;

const delay = (d: Difficulty) => (d === "dificil" ? 450 : 700);

export function BotArcade() {
  const [game, setGame] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState<Score>({});

  useEffect(() => {
    try { setScore(JSON.parse(window.localStorage.getItem("arcade-score") ?? "{}")); } catch { /* sin marcador previo */ }
  }, []);

  const current = ARCADE.find((g) => g.id === game);
  const key = `${game}:${difficulty}`;

  function end(r: Result) {
    setResult(r);
    setScore((s) => {
      const prev = s[key] ?? { w: 0, l: 0, d: 0 };
      const next = { ...s, [key]: { ...prev, [r]: prev[r] + 1 } };
      window.localStorage.setItem("arcade-score", JSON.stringify(next));
      return next;
    });
  }

  function restart() { setResult(null); setRound((n) => n + 1); }

  const totals = Object.values(score).reduce((a, s) => ({ w: a.w + s.w, l: a.l + s.l }), { w: 0, l: 0 });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Bot className="size-5 text-primary" /> Contra el bot</h2>
          <p className="text-sm text-muted-foreground">Practica sola o solo cuando tu pareja no esté. Tú {totals.w} · Bot {totals.l}</p>
        </div>
        <div className="flex rounded-full border bg-card/60 p-1">
          {LEVELS.map((l) => (
            <button key={l.id} onClick={() => { setDifficulty(l.id); restart(); }}
              className={cn("rounded-full px-3 py-1 text-xs font-medium transition", difficulty === l.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ARCADE.map((g, i) => {
          const s = score[`${g.id}:${difficulty}`];
          return (
            <motion.button key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, rotateX: 6 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setGame(g.id); restart(); }}
              className={cn("rounded-2xl border bg-card/60 p-4 text-left [transform-style:preserve-3d]", game === g.id && "border-primary/70 bg-accent/40")}>
              <p className="text-3xl">{g.emoji}</p>
              <p className="mt-2 text-sm font-semibold">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
              {s && <p className="mt-2 text-[11px] text-primary">{s.w}G · {s.l}P · {s.d}E</p>}
            </motion.button>
          );
        })}
      </div>

      {current && (
        <motion.div key={`${key}:${round}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="relative space-y-4 overflow-hidden rounded-3xl border bg-card/70 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg font-semibold">{current.emoji} {current.name}</p>
            <Button size="sm" variant="secondary" onClick={restart}><RefreshCw className="size-4" /> Reiniciar</Button>
          </div>
          <current.Comp difficulty={difficulty} onEnd={end} />
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                <motion.p initial={{ scale: 0.3, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="text-6xl">
                  {result === "w" ? "🏆" : result === "l" ? "🤖" : "🤝"}
                </motion.p>
                <p className="font-display text-2xl font-semibold">{result === "w" ? "¡Ganaste!" : result === "l" ? "Ganó el bot" : "Empate"}</p>
                <Button onClick={restart}><Trophy className="size-4" /> Otra partida</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

/** Ejecuta el turno del bot con una pequeña pausa para que se vea "pensando". */
function useBotTurn(active: boolean, d: Difficulty, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => ref.current(), delay(d));
    return () => window.clearTimeout(t);
  }, [active, d]);
}

function Status({ text }: { text: string }) {
  return <p className="text-center text-sm text-muted-foreground">{text}</p>;
}

/* ---------- Tres en raya ---------- */
function TicTacToe({ difficulty, onEnd }: GameProps) {
  const [b, setB] = useState<Cell[]>(Array(9).fill(0));
  const [botTurn, setBotTurn] = useState(false);
  const win = lineWinner(b, 3, 3, 3);
  const over = !!win || b.every(Boolean);

  function after(n: Cell[]) {
    setB(n);
    const w = lineWinner(n, 3, 3, 3);
    if (w) return onEnd(w.who === 1 ? "w" : "l");
    if (n.every(Boolean)) return onEnd("d");
  }
  useBotTurn(botTurn && !over, difficulty, () => {
    const n = [...b]; n[tttBotMove(b, difficulty)] = 2; setBotTurn(false); after(n);
  });

  return (
    <div className="space-y-3">
      <Status text={botTurn ? "El bot está pensando…" : "Tu turno (✕)"} />
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
        {b.map((v, i) => (
          <button key={i} disabled={!!v || botTurn || over}
            onClick={() => { const n = [...b]; n[i] = 1; setBotTurn(true); after(n); }}
            className={cn("flex aspect-square items-center justify-center rounded-2xl bg-secondary/60 font-display text-5xl transition hover:bg-accent", win?.cells.includes(i) && "bg-primary/30")}>
            <AnimatePresence>{v !== 0 && (
              <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={v === 1 ? "text-primary" : "text-foreground/80"}>{v === 1 ? "✕" : "◯"}</motion.span>
            )}</AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Conecta 4 ---------- */
function ConnectFour({ difficulty, onEnd }: GameProps) {
  const [b, setB] = useState<Cell[]>(Array(C4_COLS * C4_ROWS).fill(0));
  const [botTurn, setBotTurn] = useState(false);
  const win = lineWinner(b, C4_COLS, C4_ROWS, 4);
  const over = !!win || b.every(Boolean);

  function after(n: Cell[]) {
    setB(n);
    const w = lineWinner(n, C4_COLS, C4_ROWS, 4);
    if (w) return onEnd(w.who === 1 ? "w" : "l");
    if (n.every(Boolean)) return onEnd("d");
  }
  useBotTurn(botTurn && !over, difficulty, () => {
    const m = c4Drop(b, c4BotMove(b, difficulty), 2); setBotTurn(false); if (m) after(m.board);
  });

  return (
    <div className="space-y-3">
      <Status text={botTurn ? "El bot está pensando…" : "Tu turno: toca una columna (🔴)"} />
      <div className="mx-auto grid max-w-md grid-cols-7 gap-1.5 rounded-2xl bg-primary/15 p-2">
        {b.map((v, i) => {
          const row = Math.floor(i / C4_COLS);
          return (
            <button key={i} disabled={botTurn || over}
              onClick={() => { const m = c4Drop(b, i % C4_COLS, 1); if (!m) return; setBotTurn(true); after(m.board); }}
              className={cn("relative aspect-square overflow-hidden rounded-full bg-background/80", win?.cells.includes(i) && "ring-2 ring-primary")}>
              {v !== 0 && (
                <motion.span initial={{ y: -(row + 1) * 56 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute inset-1 flex items-center justify-center rounded-full text-xl sm:text-2xl">{v === 1 ? "🔴" : "🟡"}</motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Batalla naval ---------- */
function Naval({ difficulty, onEnd }: GameProps) {
  const [mine, setMine] = useState(() => new Set(randomFleet().flat()));
  const botFleet = useMemo(() => new Set(randomFleet().flat()), []);
  const [myShots, setMyShots] = useState<Record<number, boolean>>({});
  const [botShots, setBotShots] = useState<Record<number, boolean>>({});
  const [botTurn, setBotTurn] = useState(false);
  const started = Object.keys(myShots).length > 0;
  const myHits = Object.values(myShots).filter(Boolean).length;
  const botHits = Object.values(botShots).filter(Boolean).length;
  const over = myHits >= 17 || botHits >= 17;

  useBotTurn(botTurn && !over, difficulty, () => {
    const c = navalBotShot(botShots, difficulty);
    const hit = mine.has(c);
    const n = { ...botShots, [c]: hit };
    setBotShots(n);
    if (Object.values(n).filter(Boolean).length >= 17) { setBotTurn(false); onEnd("l"); return; }
    if (!hit) setBotTurn(false);
    else setBotShots({ ...n }); // vuelve a disparar
  });

  function fire(i: number) {
    if (botTurn || over || i in myShots) return;
    const hit = botFleet.has(i);
    const n = { ...myShots, [i]: hit };
    setMyShots(n);
    if (Object.values(n).filter(Boolean).length >= 17) return onEnd("w");
    if (!hit) setBotTurn(true);
  }

  const grid = (shots: Record<number, boolean>, ships: Set<number> | null, click?: (i: number) => void) => (
    <div className="grid grid-cols-10 gap-0.5 rounded-xl bg-secondary/60 p-1">
      {Array.from({ length: 100 }, (_, i) => (
        <button key={i} disabled={!click} onClick={() => click?.(i)}
          className={cn("relative flex aspect-square items-center justify-center rounded-[4px] bg-background/70 text-[11px] sm:text-sm",
            ships?.has(i) && "bg-primary/45", click && !(i in shots) && "hover:bg-accent")}>
          {i in shots && (
            <motion.span initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{shots[i] ? "💥" : "•"}</motion.span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <Status text={botTurn ? "El bot apunta…" : "Tu turno: dispara en sus aguas. Si aciertas, repites."} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1"><p className="text-sm font-medium">Aguas del bot · {myHits}/17</p>{grid(myShots, null, fire)}</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Tus barcos · te tocaron {botHits}/17</p>
            {!started && <Button size="sm" variant="ghost" onClick={() => setMine(new Set(randomFleet().flat()))}>Mover barcos</Button>}
          </div>
          {grid(botShots, mine)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Memoria ---------- */
const MEMO = ["💖", "🌹", "🍓", "🌙", "🎵", "🍷", "🦋", "🌻"];
function Memory({ difficulty, onEnd }: GameProps) {
  const [cards] = useState(() => [...MEMO, ...MEMO].sort(() => Math.random() - 0.5));
  const [open, setOpen] = useState<number[]>([]);
  const [owner, setOwner] = useState<Record<number, 1 | 2>>({});
  const [botTurn, setBotTurn] = useState(false);
  const seen = useRef(new Map<number, string>());
  const memoryChance = difficulty === "dificil" ? 0.95 : difficulty === "normal" ? 0.6 : 0.2;
  const me = Object.values(owner).filter((o) => o === 1).length / 2;
  const bot = Object.values(owner).filter((o) => o === 2).length / 2;

  function remember(i: number) { if (Math.random() < memoryChance) seen.current.set(i, cards[i]!); }

  function resolve(pair: number[], who: 1 | 2) {
    const [a, c] = pair as [number, number];
    window.setTimeout(() => {
      if (cards[a] === cards[c]) {
        const n = { ...owner, [a]: who, [c]: who };
        setOwner(n);
        seen.current.delete(a); seen.current.delete(c);
        if (Object.keys(n).length === cards.length) {
          const m = Object.values(n).filter((o) => o === 1).length;
          onEnd(m > 8 ? "w" : m < 8 ? "l" : "d");
        } else if (who === 2) setBotTurn(true);
      } else setBotTurn(who === 1);
      setOpen([]);
    }, 900);
  }

  function flip(i: number) {
    if (botTurn || open.length === 2 || open.includes(i) || owner[i]) return;
    remember(i);
    const n = [...open, i];
    setOpen(n);
    if (n.length === 2) { setBotTurn(true); resolve(n, 1); }
  }

  useEffect(() => {
    if (!botTurn || open.length) return;
    const t = window.setTimeout(() => {
      const hidden = cards.map((_, i) => i).filter((i) => !owner[i]);
      if (!hidden.length) return;
      const known = [...seen.current.entries()].filter(([i]) => !owner[i]);
      let pair: number[] | null = null;
      for (const [i, v] of known) { const j = known.find(([k, w]) => k !== i && w === v); if (j) { pair = [i, j[0]]; break; } }
      if (!pair) {
        const first = hidden.filter((i) => !seen.current.has(i))[0] ?? hidden[0]!;
        const match = known.find(([k, v]) => k !== first && v === cards[first]);
        const second = match ? match[0] : hidden.filter((i) => i !== first)[Math.floor(Math.random() * (hidden.length - 1))]!;
        pair = [first, second];
      }
      pair.forEach(remember);
      setOpen(pair);
      resolve(pair, 2);
    }, delay(difficulty) + 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botTurn, open.length, owner]);

  return (
    <div className="space-y-3">
      <Status text={`Tú ${me} · Bot ${bot} — ${botTurn ? "turno del bot" : "tu turno"}`} />
      <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 [perspective:800px]">
        {cards.map((c, i) => {
          const shown = open.includes(i) || !!owner[i];
          return (
            <motion.button key={i} onClick={() => flip(i)} animate={{ rotateY: shown ? 180 : 0 }} transition={{ duration: 0.45 }}
              className="relative aspect-square [transform-style:preserve-3d]">
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/70 text-2xl [backface-visibility:hidden]">💗</span>
              <span className={cn("absolute inset-0 flex items-center justify-center rounded-xl bg-secondary text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]",
                owner[i] === 1 && "ring-2 ring-primary", owner[i] === 2 && "opacity-60")}>{c}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Dados 3D ---------- */
const FACE_ROT: Record<number, { x: number; y: number }> = { 1: { x: 0, y: 0 }, 2: { x: 0, y: -90 }, 3: { x: -90, y: 0 }, 4: { x: 90, y: 0 }, 5: { x: 0, y: 90 }, 6: { x: 0, y: 180 } };
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const FACES = [
  { n: 1, t: "translateZ(32px)" }, { n: 6, t: "rotateY(180deg) translateZ(32px)" }, { n: 2, t: "rotateY(90deg) translateZ(32px)" },
  { n: 5, t: "rotateY(-90deg) translateZ(32px)" }, { n: 3, t: "rotateX(90deg) translateZ(32px)" }, { n: 4, t: "rotateX(-90deg) translateZ(32px)" },
];

function Die3D({ value, spin }: { value: number; spin: number }) {
  const r = FACE_ROT[value]!;
  return (
    <div className="size-16 [perspective:400px]">
      <motion.div animate={{ rotateX: r.x + spin * 720, rotateY: r.y + spin * 720 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1] }}
        className="relative size-16 [transform-style:preserve-3d]">
        {FACES.map((f) => (
          <div key={f.n} style={{ transform: f.t }} className="absolute inset-0 grid grid-cols-3 gap-0.5 rounded-xl border border-primary/30 bg-card p-2 [backface-visibility:hidden]">
            {Array.from({ length: 9 }, (_, k) => <span key={k} className={cn("m-auto size-2 rounded-full", PIPS[f.n]!.includes(k) && "bg-primary")} />)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const roll = () => 1 + Math.floor(Math.random() * 6);
function Dice({ difficulty, onEnd }: GameProps) {
  const [round, setRound] = useState(1);
  const [me, setMe] = useState<[number, number]>([1, 1]);
  const [bot, setBot] = useState<[number, number]>([1, 1]);
  const [spin, setSpin] = useState(0);
  const [phase, setPhase] = useState<"tirar" | "decidir" | "fin">("tirar");
  const [rerolled, setRerolled] = useState(false);
  const [wins, setWins] = useState({ me: 0, bot: 0 });

  function throwMine() { setMe([roll(), roll()]); setSpin((s) => s + 1); setPhase("decidir"); setRerolled(false); }

  function finish(mine: [number, number]) {
    let b: [number, number] = [roll(), roll()];
    const limit = difficulty === "dificil" ? 7 : difficulty === "normal" ? 5 : 0;
    if (b[0] + b[1] < limit) b = [roll(), roll()];
    setBot(b); setSpin((s) => s + 1);
    const ms = mine[0] + mine[1], bs = b[0] + b[1];
    const w = { me: wins.me + (ms > bs ? 1 : 0), bot: wins.bot + (bs > ms ? 1 : 0) };
    setWins(w);
    window.setTimeout(() => {
      if (round >= 5) { setPhase("fin"); onEnd(w.me > w.bot ? "w" : w.me < w.bot ? "l" : "d"); }
      else { setRound((r) => r + 1); setPhase("tirar"); }
    }, 1200);
  }

  return (
    <div className="space-y-4 text-center">
      <Status text={`Ronda ${round}/5 · Tú ${wins.me} – ${wins.bot} Bot`} />
      <div className="flex flex-wrap items-center justify-center gap-10">
        <div className="space-y-2"><p className="text-sm font-medium">Tú · {me[0] + me[1]}</p><div className="flex gap-3"><Die3D value={me[0]} spin={spin} /><Die3D value={me[1]} spin={spin} /></div></div>
        <div className="space-y-2"><p className="text-sm font-medium">Bot · {bot[0] + bot[1]}</p><div className="flex gap-3"><Die3D value={bot[0]} spin={spin} /><Die3D value={bot[1]} spin={spin} /></div></div>
      </div>
      <div className="flex justify-center gap-2">
        {phase === "tirar" && <Button onClick={throwMine}>🎲 Tirar dados</Button>}
        {phase === "decidir" && (<>
          <Button onClick={() => finish(me)}>Me quedo</Button>
          <Button variant="secondary" disabled={rerolled} onClick={() => { const n: [number, number] = [roll(), roll()]; setMe(n); setSpin((s) => s + 1); setRerolled(true); window.setTimeout(() => finish(n), 950); }}>Arriesgar (volver a tirar)</Button>
        </>)}
      </div>
    </div>
  );
}

/* ---------- Piedra, papel o tijera ---------- */
const RPS_EMOJI: Record<Rps, string> = { piedra: "✊", papel: "✋", tijera: "✌️" };
function RockPaperScissors({ difficulty, onEnd }: GameProps) {
  const [history, setHistory] = useState<Rps[]>([]);
  const [last, setLast] = useState<{ me: Rps; bot: Rps; r: Result } | null>(null);
  const [wins, setWins] = useState({ me: 0, bot: 0 });

  function play(m: Rps) {
    const b = rpsBotMove(history, difficulty);
    const r = rpsResult(m, b);
    setHistory([...history, m]);
    setLast({ me: m, bot: b, r });
    const w = { me: wins.me + (r === "w" ? 1 : 0), bot: wins.bot + (r === "l" ? 1 : 0) };
    setWins(w);
    if (w.me === 3) onEnd("w"); else if (w.bot === 3) onEnd("l");
  }

  return (
    <div className="space-y-4 text-center">
      <Status text={`Al mejor de 5 · Tú ${wins.me} – ${wins.bot} Bot`} />
      <div className="flex items-center justify-center gap-8 text-6xl">
        <motion.span key={`m${history.length}`} initial={{ x: -40, rotate: -30, opacity: 0 }} animate={{ x: 0, rotate: 0, opacity: 1 }}>{last ? RPS_EMOJI[last.me] : "❔"}</motion.span>
        <span className="text-xl text-muted-foreground">vs</span>
        <motion.span key={`b${history.length}`} initial={{ x: 40, rotate: 30, opacity: 0 }} animate={{ x: 0, rotate: 0, opacity: 1 }}>{last ? RPS_EMOJI[last.bot] : "🤖"}</motion.span>
      </div>
      {last && <p className="font-medium">{last.r === "w" ? "¡Punto para ti!" : last.r === "l" ? "Punto para el bot" : "Empate"}</p>}
      <div className="flex justify-center gap-3">
        {(Object.keys(RPS_EMOJI) as Rps[]).map((m) => (
          <motion.button key={m} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => play(m)}
            className="rounded-2xl border bg-secondary/60 px-4 py-3 text-3xl">{RPS_EMOJI[m]}<span className="block text-xs capitalize text-muted-foreground">{m}</span></motion.button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Ahorcado ---------- */
const WORDS: Record<Difficulty, string[]> = {
  facil: ["AMOR", "BESO", "ROSA", "CITA", "LUNA", "MIEL"],
  normal: ["ABRAZO", "TERNURA", "CARIÑO", "CORAZON", "PAREJA", "DETALLE"],
  dificil: ["ANIVERSARIO", "COMPLICIDAD", "ENAMORADOS", "MARIPOSAS", "PROMETIDOS", "SERENATA"],
};
const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
function Hangman({ difficulty, onEnd }: GameProps) {
  const [word] = useState(() => { const l = WORDS[difficulty]; return l[Math.floor(Math.random() * l.length)]!; });
  const [guess, setGuess] = useState<string[]>([]);
  const lives = difficulty === "facil" ? 8 : difficulty === "normal" ? 6 : 5;
  const misses = guess.filter((g) => !word.includes(g)).length;

  function pick(l: string) {
    const n = [...guess, l];
    setGuess(n);
    if (word.split("").every((c) => n.includes(c))) onEnd("w");
    else if (n.filter((g) => !word.includes(g)).length >= lives) onEnd("l");
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-2xl">{"❤️".repeat(lives - misses)}{"🤍".repeat(misses)}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {word.split("").map((c, i) => (
          <span key={i} className="flex h-12 w-9 items-end justify-center border-b-2 border-primary font-display text-2xl">
            {guess.includes(c) && <motion.span initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{c}</motion.span>}
          </span>
        ))}
      </div>
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-1.5">
        {ALPHABET.map((l) => (
          <button key={l} disabled={guess.includes(l)} onClick={() => pick(l)}
            className={cn("size-9 rounded-lg bg-secondary/70 text-sm font-semibold transition hover:bg-accent disabled:opacity-30",
              guess.includes(l) && word.includes(l) && "bg-primary/40 opacity-100")}>{l}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reflejos ---------- */
function Reflexes({ difficulty, onEnd }: GameProps) {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(20);
  const [pos, setPos] = useState({ x: 50, y: 50, id: 0 });
  const [pts, setPts] = useState({ me: 0, bot: 0 });
  const ptsRef = useRef(pts);
  ptsRef.current = pts;
  const botSpeed = difficulty === "dificil" ? 750 : difficulty === "normal" ? 1050 : 1500;

  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => setTime((t) => t - 1), 1000);
    return () => window.clearInterval(tick);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      const p = ptsRef.current;
      onEnd(p.me > p.bot ? "w" : p.me < p.bot ? "l" : "d");
      return;
    }
  }, [time, running, onEnd]);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => { setPts((p) => ({ ...p, bot: p.bot + 1 })); move(); }, botSpeed + Math.random() * 300);
    return () => window.clearTimeout(t);
  }, [pos.id, running, botSpeed]);

  function move() { setPos((p) => ({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 80, id: p.id + 1 })); }

  return (
    <div className="space-y-3">
      <Status text={running ? `⏱ ${time}s · Tú ${pts.me} – ${pts.bot} Bot` : "Toca el corazón antes que el bot. 20 segundos."} />
      <div className="relative h-72 overflow-hidden rounded-2xl bg-secondary/50">
        {running ? (
          <motion.button key={pos.id} initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 1.4 }}
            onClick={() => { setPts((p) => ({ ...p, me: p.me + 1 })); move(); }}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 text-4xl">💖</motion.button>
        ) : (
          <div className="flex h-full items-center justify-center"><Button onClick={() => { setPts({ me: 0, bot: 0 }); setTime(20); setRunning(true); move(); }}>Empezar</Button></div>
        )}
      </div>
    </div>
  );
}
