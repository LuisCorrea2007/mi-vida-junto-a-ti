import { describe, expect, test } from 'bun:test';
import { applyMove, boardWinner, chooseMove, initialBoard, legalMoves, type BoardState } from './board';
describe('Board rules and local AI', () => {
  test('expert tic tac toe bot takes a win', () => {
    const s: BoardState = { cells:[2,2,0,1,1,0,0,0,0],turn:2,winner:null,chain:null };
    expect(chooseMove('t3',s,'dificil')?.to).toBe(2);
  });
  test('expert tic tac toe bot blocks immediate loss', () => {
    const s: BoardState = { cells:[1,1,0,0,2,0,0,0,0],turn:2,winner:null,chain:null };
    expect(chooseMove('t3',s,'dificil')?.to).toBe(2);
  });
  test('connect four falls to the lowest empty cell', () => {
    const s = initialBoard('c4');
    const m = legalMoves('c4',s).find(m => m.to % 7 === 3);
    expect(m?.to).toBe(38);
    if (!m) throw new Error('Missing move');
    const next = applyMove('c4',s,m);
    expect(next.cells[38]).toBe(1);
    expect(legalMoves('c4',next).find(m => m.to % 7 === 3)?.to).toBe(31);
  });
  test('connect four detects diagonal victory', () => {
    const cells = Array(42).fill(0); for (const i of [35,29,23,17]) cells[i] = 2;
    expect(boardWinner('c4',cells)).toBe(2);
  });
  test('checkers forces captures instead of ordinary moves', () => {
    const s = initialBoard('damas'); s.cells.fill(0); s.cells[42] = 1; s.cells[33] = 2; s.cells[60] = 1;
    expect(legalMoves('damas',s)).toEqual([{from:42,to:24,capture:33}]);
  });
  test('checkers keeps turn during a capture chain', () => {
    const s = initialBoard('damas'); s.cells.fill(0); s.cells[42]=1; s.cells[33]=2; s.cells[17]=2;
    const next = applyMove('damas',s,{from:42,to:24});
    expect(next.turn).toBe(1); expect(next.chain).toBe(24);
    expect(legalMoves('damas',next)).toEqual([{from:24,to:10,capture:17}]);
  });
  test('illegal moves do not mutate the board', () => {
    const s = initialBoard('c4'); expect(applyMove('c4',s,{to:3})).toBe(s);
  });
});