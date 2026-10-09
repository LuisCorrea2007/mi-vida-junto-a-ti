export type BoardKind = 't3' | 'c4' | 'damas';
export type Level = 'facil' | 'media' | 'dificil';
export type Player = 1 | 2;
export type BoardState = { cells: number[]; turn: Player; winner: number | null; chain: number | null };
export type Move = { from?: number; to: number; capture?: number };
export const BOARD_NAMES = { t3: 'Tres en raya', c4: 'Conecta 4', damas: 'Damas' };
export function initialBoard(kind: BoardKind): BoardState {
  const cells = Array(kind === 't3' ? 9 : kind === 'c4' ? 42 : 64).fill(0) as number[];
  if (kind === 'damas') for (let i = 0; i < 64; i++) {
    const r = Math.floor(i / 8);
    if ((r + i % 8) % 2 === 1) cells[i] = r < 3 ? 2 : r > 4 ? 1 : 0;
  }
  return { cells, turn: 1, winner: null, chain: null };
}
const owner = (value: number) => value ? (value % 2 ? 1 : 2) : 0;
function pieceMoves(cells: number[], i: number): Move[] {
  const piece = cells[i] ?? 0;
  if (!piece) return [];
  const row = Math.floor(i / 8), col = i % 8;
  const directions = piece > 2 ? [-1, 1] : [owner(piece) === 1 ? -1 : 1];
  const moves: Move[] = [];
  for (const dr of directions) for (const dc of [-1, 1]) {
    const r = row + dr, c = col + dc;
    if (r < 0 || r > 7 || c < 0 || c > 7) continue;
    const to = r * 8 + c;
    if (!cells[to]) moves.push({ from: i, to });
    else if (owner(cells[to] ?? 0) !== owner(piece)) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && !cells[rr * 8 + cc]) moves.push({ from: i, to: rr * 8 + cc, capture: to });
    }
  }
  return moves;
}
export function legalMoves(kind: BoardKind, state: BoardState): Move[] {
  if (state.winner !== null) return [];
  if (kind === 't3') return state.cells.flatMap((v, to) => v ? [] : [{ to }]);
  if (kind === 'c4') return [3, 2, 4, 1, 5, 0, 6].flatMap(col => {
    for (let r = 5; r >= 0; r--) if (!state.cells[r * 7 + col]) return [{ to: r * 7 + col }];
    return [];
  });
  const moves = state.cells.flatMap((v, i) => owner(v) === state.turn && (state.chain === null || state.chain === i) ? pieceMoves(state.cells, i) : []);
  return state.chain !== null || moves.some(m => m.capture !== undefined) ? moves.filter(m => m.capture !== undefined) : moves;
}
export function boardWinner(kind: BoardKind, cells: number[]): number | null {
  if (kind === 'damas') return null;
  const rows = kind === 't3' ? 3 : 6, cols = kind === 't3' ? 3 : 7, count = kind === 't3' ? 3 : 4;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = cells[r * cols + c];
    if (!v) continue;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      if (dr === undefined || dc === undefined) continue;
      let win = true;
      for (let k = 1; k < count; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= rows || cc < 0 || cc >= cols || cells[rr * cols + cc] !== v) win = false;
      }
      if (win) return v;
    }
  }
  return cells.every(Boolean) ? 0 : null;
}
export function applyMove(kind: BoardKind, state: BoardState, requested: Move): BoardState {
  const move = legalMoves(kind, state).find(m => m.to === requested.to && m.from === requested.from);
  if (!move) return state;
  const cells = [...state.cells];
  const next: Player = state.turn === 1 ? 2 : 1;
  if (kind !== 'damas') {
    cells[move.to] = state.turn;
    return { cells, turn: next, winner: boardWinner(kind, cells), chain: null };
  }
  if (move.from === undefined) return state;
  let piece = cells[move.from] ?? 0;
  cells[move.from] = 0;
  if (move.capture !== undefined) cells[move.capture] = 0;
  const crowned = piece <= 2 && ((piece === 1 && move.to < 8) || (piece === 2 && move.to >= 56));
  if (crowned) piece += 2;
  cells[move.to] = piece;
  const chain = move.capture !== undefined && !crowned && pieceMoves(cells, move.to).some(m => m.capture !== undefined) ? move.to : null;
  const updated: BoardState = { cells, turn: chain === null ? next : state.turn, chain, winner: null };
  if (!legalMoves(kind, updated).length) updated.winner = state.turn;
  return updated;
}
function evaluate(kind: BoardKind, state: BoardState, player: Player): number {
  if (state.winner !== null) return state.winner === 0 ? 0 : state.winner === player ? 100000 : -100000;
  if (kind === 'damas') return state.cells.reduce((s, v, i) => s + (owner(v) === player ? 1 : -1) * (v ? (v > 2 ? 180 : 100) + (3.5 - Math.abs(i % 8 - 3.5)) * 3 : 0), 0);
  const rows = kind === 't3' ? 3 : 6, cols = kind === 't3' ? 3 : 7, count = kind === 't3' ? 3 : 4;
  let score = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
    if (dr === undefined || dc === undefined) continue;
    let mine = 0, theirs = 0, valid = true;
    for (let k = 0; k < count; k++) {
      const rr = r + k * dr, cc = c + k * dc;
      if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) { valid = false; break; }
      const v = state.cells[rr * cols + cc];
      if (v === player) mine++; else if (v) theirs++;
    }
    if (valid && !theirs) score += 4 ** mine;
    if (valid && !mine) score -= 4 ** theirs;
  }
  return score;
}
export function chooseMove(kind: BoardKind, state: BoardState, level: Level): Move | null {
  const moves = legalMoves(kind, state);
  if (!moves.length) return null;
  if (level === 'facil') return moves[Math.floor(Math.random() * moves.length)] ?? null;
  const player = state.turn;
  const depth = kind === 't3' ? 9 : level === 'media' ? 3 : kind === 'c4' ? 5 : 4;
  function search(s: BoardState, remaining: number, alpha: number, beta: number): number {
    if (!remaining || s.winner !== null) return evaluate(kind, s, player);
    const maximizing = s.turn === player;
    let best = maximizing ? -Infinity : Infinity;
    for (const m of legalMoves(kind, s)) {
      const val = search(applyMove(kind, s, m), remaining - 1, alpha, beta);
      best = maximizing ? Math.max(best, val) : Math.min(best, val);
      if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = moves[0] ?? null, value = -Infinity;
  for (const m of moves) {
    const v = search(applyMove(kind, state, m), depth - 1, -Infinity, Infinity);
    if (v > value) { best = m; value = v; }
  }
  return best;
}
