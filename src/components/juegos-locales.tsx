import { BoardGame, type Mode } from '@/components/games/board-game';
import { SportsGame } from '@/components/games/sports-game';
import { SnakeGame } from '@/components/games/snake-game';
import type { BoardKind, Level } from '@/lib/games/board';
export type GameKind = BoardKind | 'hockey' | 'fichas' | 'pong' | 'serpientes';
export function LocalGames({ kind, mode, level }: { kind: GameKind; mode: Mode; level: Level }) {
  if (kind === 't3' || kind === 'c4' || kind === 'damas') return <BoardGame kind={kind} mode={mode} level={level} />;
  if (kind === 'serpientes') return <SnakeGame mode={mode} level={level} />;
  return <SportsGame kind={kind} mode={mode} level={level} />;
}
