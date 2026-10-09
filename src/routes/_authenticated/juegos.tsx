import { lazy, Suspense, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bot, Circle, Crown, Gamepad2, Grid3x3, Loader2, Swords, Trophy, Users, Waves, Worm, UserRound, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCouple } from '@/hooks/use-couple';
import { useRealtime } from '@/hooks/use-realtime';
import { notifyPartner } from '@/lib/notify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BOARD_NAMES, initialBoard, type BoardKind, type BoardState, type Level } from '@/lib/games/board';
import type { GameKind } from '@/components/juegos-locales';
import type { Mode } from '@/components/games/board-game';
import room from '@/assets/arcade-room.jpg';
const LocalGames = lazy(() => import('@/components/juegos-locales').then(m => ({ default: m.LocalGames })));
const BoardGame = lazy(() => import('@/components/games/board-game').then(m => ({ default: m.BoardGame })));
export const Route = createFileRoute('/_authenticated/juegos')({
  component: JuegosPage,
  head: () => ({ meta: [
    { title: 'Juegos para dos — Nuestro Espacio' },
    { name: 'description', content: 'Su mesa de juegos: tableros 3D, duelos en pareja y práctica con bots estratégicos.' },
    { property: 'og:title', content: 'Juegos para dos — Nuestro Espacio' },
    { property: 'og:description', content: 'Un momento para jugar, reír y compartir en Nuestro Espacio.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
  ] }),
});
type GameRow = { id: string; kind: string; user_id: string; opponent_id: string; turn: string; winner: string | null; board: Record<string, unknown>; updated_at: string };
const GAMES = [
  { kind:'t3', name:'Tres en raya', icon:Grid3x3, note:'Una pequeña mesa, una gran revancha.', online:true },
  { kind:'c4', name:'Conecta 4', icon:Circle, note:'La siguiente ficha puede cambiarlo todo.', online:true },
  { kind:'damas', name:'Damas', icon:Crown, note:'Estrategia, capturas y coronas.', online:true },
  { kind:'hockey', name:'Air hockey', icon:Waves, note:'Discos, rebotes y reflejos.', online:false },
  { kind:'fichas', name:'Fútbol de fichas', icon:Flag, note:'Un tiro a la vez, hasta el último gol.', online:false },
  { kind:'pong', name:'Pong', icon:Swords, note:'El duelo que siempre pide otra ronda.', online:false },
  { kind:'serpientes', name:'Serpientes', icon:Worm, note:'Dos caminos en el mismo jardín.', online:false },
] as const;
const LEVELS: [Level,string][] = [['facil','Tranquilo'],['media','Parejo'],['dificil','Experto']];
const MODES: [Mode,string,typeof Users][] = [['local','Juntos',Users],['bot','Contra el bot',Bot],['solo','A solas',UserRound],['online','A distancia',Gamepad2]];
const fallback = <div className="grid h-80 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
function JuegosPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const couple = useCouple(userId), partnerId = couple.data?.partnerId;
  const qc = useQueryClient();
  const [mode,setMode] = useState<Mode>('local'), [level,setLevel] = useState<Level>('media'), [kind,setKind] = useState<GameKind | null>(null), [activeId,setActiveId] = useState<string | null>(null);
  useRealtime('couple_games');
  const { data: games = [] } = useQuery({ queryKey:['couple-games',userId], enabled:!!userId, queryFn:async () => {
    const { data,error } = await supabase.from('couple_games').select('*').in('kind',['t3','c4','damas']).order('updated_at',{ascending:false});
    if (error) throw error; return (data ?? []) as unknown as GameRow[];
  } });
  const create = useMutation({ mutationFn:async (gameKind: BoardKind) => {
    if (!userId || !partnerId) throw new Error('Vincula a tu pareja en Ajustes para invitarla.');
    const board = initialBoard(gameKind);
    const { data,error } = await supabase.from('couple_games').insert({ user_id:userId,opponent_id:partnerId,kind:gameKind,board:board as never,turn:userId }).select().single();
    if (error) throw error;
    try { await notifyPartner({ toUserId:partnerId,type:'game',title:'¿Jugamos juntos?',message:`Te espera una partida de ${BOARD_NAMES[gameKind]}.`,link:'/juegos' }); } catch { toast.warning('La partida está lista; no pudimos enviar el aviso.'); }
    return data as unknown as GameRow;
  }, onSuccess:g => { void qc.invalidateQueries({queryKey:['couple-games']}); setActiveId(g.id); }, onError:e => toast.error(e.message) });
  const active = games.find(g => g.id === activeId) ?? (create.data?.id === activeId ? create.data : null);
  const save = useMutation({ mutationFn:async (state:BoardState) => {
    if (!active || !userId || active.turn !== userId || active.winner) throw new Error('Espera tu turno.');
    const nextUser = state.turn === 1 ? active.user_id : active.opponent_id;
    const winner = state.winner === null ? null : state.winner === 0 ? 'draw' : state.winner === 1 ? active.user_id : active.opponent_id;
    const { data,error } = await supabase.from('couple_games').update({board:state as never,turn:nextUser,winner}).eq('id',active.id).eq('turn',userId).eq('updated_at',active.updated_at).is('winner',null).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('La partida cambió. Actualizamos el tablero.');
  }, onSettled:() => { void qc.invalidateQueries({queryKey:['couple-games']}); }, onError:e => toast.error(e.message) });
  const selected = GAMES.find(g => g.kind === kind);
  const back = () => { setKind(null); setActiveId(null); };
  if (active && userId) {
    const gameKind = active.kind as BoardKind;
    const source = active.board['cells'];
    const cells = Array.isArray(source) ? source.map(v => v === 'X' ? 1 : v === 'O' ? 2 : typeof v === 'number' ? v : 0) : initialBoard(gameKind).cells;
    const state: BoardState = { cells, turn:active.turn === active.user_id ? 1 : 2, winner:active.winner ? active.winner === 'draw' ? 0 : active.winner === active.user_id ? 1 : 2 : null, chain:typeof active.board['chain'] === 'number' ? active.board['chain'] : null };
    return <div className="mx-auto max-w-3xl space-y-4 pb-8"><Button variant="ghost" onClick={back}><ArrowLeft/>Volver a la mesa</Button><h1 className="font-display text-3xl">{BOARD_NAMES[gameKind]}</h1><p className="text-sm text-muted-foreground">Tú juegas con {active.user_id === userId ? 'Rosa' : 'Oro'} · {active.turn === userId ? 'Tu turno' : 'Turno de tu amor'}</p><Suspense fallback={fallback}><BoardGame kind={gameKind} mode="online" level={level} remote={state} onSave={s => save.mutate(s)} locked={active.turn !== userId || save.isPending}/></Suspense>{active.winner && <Button disabled={create.isPending} onClick={() => create.mutate(gameKind)}><RotateIcon/>Revancha con tu amor</Button>}</div>;
  }
  if (kind && selected) return <div className="mx-auto max-w-3xl space-y-4 pb-8"><div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" onClick={back}><ArrowLeft/>Volver a la mesa</Button><span className="text-sm text-muted-foreground">{MODES.find(m => m[0] === mode)?.[1]}{mode === 'bot' ? ` · ${LEVELS.find(l => l[0] === level)?.[1]}` : ''}</span></div><h1 className="font-display text-3xl">{selected.name}</h1><Suspense fallback={fallback}><LocalGames key={`${kind}-${mode}-${level}`} kind={kind} mode={mode} level={level}/></Suspense></div>;
  const finished = games.filter(g => g.winner);
  return <div className="mx-auto w-full max-w-5xl space-y-7 pb-10">
    <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr] sm:items-center"><div className="space-y-3"><p className="flex items-center gap-2 text-sm text-primary"><Gamepad2 className="size-4"/>Un rato para nosotros</p><h1 className="font-display text-4xl">Nuestra mesa<br/>de juegos</h1><p className="max-w-sm text-muted-foreground">La complicidad también se juega. Elige tu próximo duelo, comparte la mesa y guarda tiempo para la revancha.</p><p className="flex items-center gap-2 text-xs text-gold"><Trophy className="size-4"/>{finished.length} partidas en pareja · {finished.filter(g => g.winner === userId).length} victorias tuyas</p></div><img src={room} width={1536} height={1024} alt="Mesa con juegos tridimensionales en tonos rosa, oro y verde" className="aspect-[3/2] w-full rounded-lg object-cover"/></div>
    <div className="space-y-4 border-y border-border py-4"><div className="flex flex-wrap gap-2" role="group" aria-label="Modo de juego">{MODES.map(([m,label,Icon]) => <Button key={m} variant={mode === m ? 'default':'outline'} aria-pressed={mode === m} onClick={() => setMode(m)}><Icon/>{label}</Button>)}</div>{mode === 'bot' && <div className="flex flex-wrap gap-2" role="group" aria-label="Dificultad">{LEVELS.map(([l,label]) => <Button key={l} size="sm" variant={l === level ? 'secondary':'ghost'} aria-pressed={l === level} onClick={() => setLevel(l)}>{label}</Button>)}</div>}{mode === 'solo' && <p className="text-xs text-muted-foreground">Práctica libre en deportes y Serpientes; en los tableros puedes estudiar ambos lados.</p>}</div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{GAMES.filter(g => mode !== 'online' || g.online).map(g => <article key={g.kind} className="surface flex flex-col gap-4 p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg bg-primary/15 text-primary"><g.icon className="size-5"/></span><h2 className="font-semibold">{g.name}</h2></div><p className="flex-1 text-sm text-muted-foreground">{g.note}</p><div className="flex items-center justify-between"><span className="text-xs text-gold">Mesa 3D</span><Button size="sm" disabled={mode === 'online' && (!partnerId || create.isPending)} onClick={() => mode === 'online' && (g.kind === 't3' || g.kind === 'c4' || g.kind === 'damas') ? create.mutate(g.kind) : setKind(g.kind)}>{mode === 'online' ? 'Invitar a mi amor':'Jugar'}</Button></div></article>)}</div>
    {mode === 'online' && <section className="space-y-3"><h2 className="font-display text-xl">Nos espera una partida</h2>{!partnerId && <p className="text-sm text-muted-foreground">Vincula a tu pareja en Ajustes para jugar a distancia.</p>}{games.filter(g => !g.winner).map(g => <div key={g.id} className="flex items-center justify-between gap-3 border-b border-border py-3"><div><p className="text-sm font-semibold">{BOARD_NAMES[g.kind as BoardKind]}</p><p className="text-xs text-muted-foreground">{g.turn === userId ? 'Tu turno':'Turno de tu amor'}</p></div><Button size="sm" variant="outline" onClick={() => setActiveId(g.id)}>Continuar</Button></div>)}{partnerId && !games.some(g => !g.winner) && <p className="text-sm text-muted-foreground">La mesa está libre para su próxima partida.</p>}</section>}
  </div>;
}
function RotateIcon() { return <Swords className="size-4"/>; }
