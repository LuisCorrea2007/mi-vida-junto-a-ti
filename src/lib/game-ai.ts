/** Lógica pura de los juegos contra el bot (sin pantalla). */
export type Difficulty = "facil" | "normal" | "dificil";
export type Cell = 0 | 1 | 2; // 0 vacío, 1 jugador, 2 bot

const rand = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)]!;

export function lineWinner(b: Cell[], cols: number, rows: number, need: number): { who: Cell; cells: number[] } | null {
  const at = (r: number, c: number) => (r >= 0 && r < rows && c >= 0 && c < cols ? b[r * cols + c] : 0);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = at(r, c);
      if (!v) continue;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]] as const) {
        const cells = [r * cols + c];
        while (cells.length < need && at(r + dr * cells.length, c + dc * cells.length) === v)
          cells.push((r + dr * cells.length) * cols + c + dc * cells.length);
        if (cells.length === need) return { who: v, cells };
      }
    }
  return null;
}

/* ---------- Tres en raya ---------- */
function tttScore(b: Cell[], turn: Cell, depth: number): number {
  const w = lineWinner(b, 3, 3, 3);
  if (w) return w.who === 2 ? 10 - depth : depth - 10;
  if (b.every(Boolean)) return 0;
  const scores = b.flatMap((v, i) => {
    if (v) return [];
    const n = [...b];
    n[i] = turn;
    return [tttScore(n, turn === 2 ? 1 : 2, depth + 1)];
  });
  return turn === 2 ? Math.max(...scores) : Math.min(...scores);
}

export function tttBotMove(b: Cell[], d: Difficulty): number {
  const free = b.flatMap((v, i) => (v ? [] : [i]));
  const smart = d === "dificil" ? 1 : d === "normal" ? 0.6 : 0.15;
  if (Math.random() > smart) return rand(free);
  let best = -Infinity;
  let moves: number[] = [];
  for (const i of free) {
    const n = [...b];
    n[i] = 2;
    const s = tttScore(n, 1, 1);
    if (s > best) { best = s; moves = [i]; } else if (s === best) moves.push(i);
  }
  return rand(moves);
}

/* ---------- Conecta 4 ---------- */
export const C4_COLS = 7;
export const C4_ROWS = 6;

export function c4Drop(b: Cell[], col: number, p: Cell): { board: Cell[]; cell: number } | null {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    const i = r * C4_COLS + col;
    if (!b[i]) {
      const board = [...b];
      board[i] = p;
      return { board, cell: i };
    }
  }
  return null;
}

function c4Eval(b: Cell[]): number {
  let s = 0;
  for (let r = 0; r < C4_ROWS; r++) if (b[r * C4_COLS + 3] === 2) s += 3; else if (b[r * C4_COLS + 3] === 1) s -= 3;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;
  for (let r = 0; r < C4_ROWS; r++)
    for (let c = 0; c < C4_COLS; c++)
      for (const [dr, dc] of dirs) {
        let bot = 0, me = 0, ok = true;
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= C4_ROWS || cc < 0 || cc >= C4_COLS) { ok = false; break; }
          const v = b[rr * C4_COLS + cc];
          if (v === 2) bot++; else if (v === 1) me++;
        }
        if (!ok || (bot && me)) continue;
        s += [0, 1, 5, 50, 0][bot]! - [0, 1, 6, 80, 0][me]!;
      }
  return s;
}

function c4Search(b: Cell[], depth: number, alpha: number, beta: number, turn: Cell): number {
  const w = lineWinner(b, C4_COLS, C4_ROWS, 4);
  if (w) return w.who === 2 ? 100000 + depth : -100000 - depth;
  if (depth === 0 || b.every(Boolean)) return c4Eval(b);
  const order = [3, 2, 4, 1, 5, 0, 6];
  if (turn === 2) {
    let v = -Infinity;
    for (const c of order) {
      const m = c4Drop(b, c, 2);
      if (!m) continue;
      v = Math.max(v, c4Search(m.board, depth - 1, alpha, beta, 1));
      alpha = Math.max(alpha, v);
      if (alpha >= beta) break;
    }
    return v;
  }
  let v = Infinity;
  for (const c of order) {
    const m = c4Drop(b, c, 1);
    if (!m) continue;
    v = Math.min(v, c4Search(m.board, depth - 1, alpha, beta, 2));
    beta = Math.min(beta, v);
    if (alpha >= beta) break;
  }
  return v;
}

export function c4BotMove(b: Cell[], d: Difficulty): number {
  const cols = [0, 1, 2, 3, 4, 5, 6].filter((c) => c4Drop(b, c, 2));
  if (d === "facil" && Math.random() < 0.5) return rand(cols);
  const depth = d === "dificil" ? 6 : d === "normal" ? 3 : 1;
  let best = -Infinity;
  let moves: number[] = [];
  for (const c of cols) {
    const s = c4Search(c4Drop(b, c, 2)!.board, depth - 1, -Infinity, Infinity, 1);
    if (s > best) { best = s; moves = [c]; } else if (s === best) moves.push(c);
  }
  return rand(moves);
}

/* ---------- Batalla naval ---------- */
export function navalBotShot(shots: Record<number, boolean>, d: Difficulty): number {
  const free = Array.from({ length: 100 }, (_, i) => i).filter((i) => !(i in shots));
  if (d !== "facil") {
    const near: number[] = [];
    for (const [k, hit] of Object.entries(shots)) {
      if (!hit) continue;
      const i = Number(k), r = Math.floor(i / 10), c = i % 10;
      for (const [n, ok] of [[i - 10, r > 0], [i + 10, r < 9], [i - 1, c > 0], [i + 1, c < 9]] as const)
        if (ok && !(n in shots)) near.push(n);
    }
    if (near.length) return rand(near);
    if (d === "dificil") {
      const parity = free.filter((i) => (Math.floor(i / 10) + (i % 10)) % 2 === 0);
      if (parity.length) return rand(parity);
    }
  }
  return rand(free);
}

/* ---------- Piedra, papel o tijera ---------- */
export type Rps = "piedra" | "papel" | "tijera";
export const BEATS: Record<Rps, Rps> = { piedra: "tijera", papel: "piedra", tijera: "papel" };
const COUNTER: Record<Rps, Rps> = { piedra: "papel", papel: "tijera", tijera: "piedra" };

export function rpsBotMove(history: Rps[], d: Difficulty): Rps {
  const all: Rps[] = ["piedra", "papel", "tijera"];
  const smart = d === "dificil" ? 0.75 : d === "normal" ? 0.4 : 0;
  if (!history.length || Math.random() > smart) return rand(all);
  const last = history.slice(-6);
  const freq = all.map((m) => [m, last.filter((x) => x === m).length] as const).sort((a, b) => b[1] - a[1]);
  return COUNTER[freq[0]![0]];
}

export function rpsResult(me: Rps, bot: Rps): "w" | "l" | "d" {
  if (me === bot) return "d";
  return BEATS[me] === bot ? "w" : "l";
}
