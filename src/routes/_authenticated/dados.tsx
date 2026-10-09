import { useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Dices, Flame, Heart, MapPin, Timer, Users, LockKeyhole, LockKeyholeOpen, Check, SkipForward, RotateCcw, Bookmark, Play, Pause, ShieldCheck, ChevronRight, Shuffle, MessageCircle, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useCouple } from '@/hooks/use-couple';
import { useProfiles } from '@/hooks/use-profiles';
import { celebrate } from '@/lib/celebrate';
import { cn } from '@/lib/utils';
import { DICE_LEVELS, DICE_PLACES, DICE_DURATIONS, DICE_TRUTHS, LIKELY_QUESTIONS, diceCombinations, availableRolls, nextPlayer, canStartChallenge, roundComplete, type DiceLevel, type DiceMode, type LoveRoll } from '@/lib/love-dice';

export const Route = createFileRoute('/_authenticated/dados')({
  head: () => ({ meta: [
    { title: 'Dados del amor — Nuestro Espacio' },
    { name: 'description', content: 'Dados, verdad o reto: cuatro intensidades para compartir besos, coqueteo y momentos elegidos por ambos.' },
    { property: 'og:title', content: 'Dados del amor — Nuestro Espacio' },
    { property: 'og:description', content: 'Momentos elegidos por el azar, al ritmo de los dos.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }), component: DadosPage,
});
const LEVEL_ICONS = { tierno: Heart, caliente: Sparkles, atrevido: Flame, 'muy-atrevido': Flame };
const levelKeys: DiceLevel[] = ['tierno', 'caliente', 'atrevido', 'muy-atrevido'];
const modes = [{ key: 'dados' as const, label: 'Dados', icon: Dices }, { key: 'verdad' as const, label: 'Verdad', icon: MessageCircle }, { key: 'reto' as const, label: 'Reto', icon: Flame }];
function duration(seconds: number) { return seconds < 60 ? `${seconds} segundos` : `${seconds / 60} ${seconds === 60 ? 'minuto' : 'minutos'}`; }
function clock(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }

function DadosPage() {
  const { user } = useAuth();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles = [] } = useProfiles();
  const [names, setNames] = useState<[string, string]>(['', '']);
  const players = [names[0].trim() || profiles.find(p => p.id === user?.id)?.name || 'Tú', names[1].trim() || profiles.find(p => p.id === couple?.partnerId)?.name || 'Tu pareja'];
  const [deck, setDeck] = useState<DiceLevel>('tierno');
  const [mode, setMode] = useState<DiceMode>('dados');
  const [ready, setReady] = useState<[boolean, boolean]>([false, false]);
  const [target, setTarget] = useState(10);
  const [truthsSeen, setTruthsSeen] = useState<Record<DiceLevel, string[]>>({ tierno: [], caliente: [], atrevido: [], 'muy-atrevido': [] });
  const [roll, setRoll] = useState<LoveRoll | null>(null);
  const [turn, setTurn] = useState(0);
  const [points, setPoints] = useState<[number, number]>([0, 0]);
  const [seen, setSeen] = useState<Record<DiceLevel, string[]>>({ tierno: [], caliente: [], atrevido: [], 'muy-atrevido': [] });
  const [locks, setLocks] = useState({ action: false, place: false, seconds: false });
  const [place, setPlace] = useState('all');
  const [maxTime, setMaxTime] = useState(120);
  const [spinning, setSpinning] = useState(false);
  const [serial, setSerial] = useState(0);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [favorites, setFavorites] = useState<(LoveRoll & { level: DiceLevel })[]>([]);
  const [history, setHistory] = useState<{ action: string; name: string; status: string }[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [votes, setVotes] = useState<[number | null, number | null]>([null, null]);
  const [notice, setNotice] = useState('');
  const pool = useMemo(() => diceCombinations(DICE_LEVELS[deck].actions, place === 'all' ? DICE_PLACES : [place], DICE_DURATIONS.filter(s => s <= maxTime)), [deck, place, maxTime]);
  const constrained = roll ? { ...(locks.action ? { action: roll.action } : {}), ...(locks.place ? { place: roll.place } : {}), ...(locks.seconds ? { seconds: roll.seconds } : {}) } : {};
  const candidates = availableRolls(pool, seen[deck], mode === 'dados' ? constrained : {});
  const truths = DICE_TRUTHS[deck].filter(q => !truthsSeen[deck].includes(q));
  const permitted = canStartChallenge(deck, ready);
  const complete = roundComplete(points, target);
  const optionsLeft = mode === 'verdad' ? truths.length : candidates.length;
  const saved = roll && favorites.some(f => f.id === roll.id && f.level === deck);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setLeft(s => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!spinning) return;
    const timer = window.setTimeout(() => setSpinning(false), 650);
    return () => window.clearTimeout(timer);
  }, [spinning]);

  function throwDice() {
    if (spinning || !permitted || complete) return;
    const truth = truths[Math.floor(Math.random() * truths.length)];
    const chosen = mode === 'verdad' ? (truth ? { id: truth, action: truth, place: 'Entre los dos, sin distracciones', seconds: maxTime } : undefined) : candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) { setNotice('Ya exploraron estas combinaciones. Liberen un dado o reinicien la ronda.'); return; }
    setNotice(''); setRoll(chosen); setLeft(chosen.seconds); setRunning(false); setDone(false); setSpinning(true); setSerial(s => s + 1);
    if (mode === 'verdad') setTruthsSeen(s => ({ ...s, [deck]: [...s[deck], chosen.id] }));
    else setSeen(s => ({ ...s, [deck]: [...s[deck], chosen.id] }));
  }
  function finish(completed: boolean) {
    if (!roll || done || spinning) return;
    setHistory(h => [{ action: roll.action, name: players[turn] ?? 'Tu pareja', status: completed ? 'Compartido' : 'Pasado' }, ...h].slice(0, 12));
    if (completed) { setPoints(p => turn === 0 ? [p[0] + 1, p[1]] : [p[0], p[1] + 1]); celebrate(16); }
    setTurn(nextPlayer(turn)); setDone(true); setRunning(false);
  }
  function resetRoll() { setRoll(null); setDone(false); setRunning(false); setLocks({ action: false, place: false, seconds: false }); setNotice(''); }
  function newRound() {
    setSeen({ tierno: [], caliente: [], atrevido: [], 'muy-atrevido': [] });
    setTruthsSeen({ tierno: [], caliente: [], atrevido: [], 'muy-atrevido': [] });
    setPoints([0, 0]); setHistory([]); setTurn(0); setReady([false, false]); resetRoll();
  }
  const faces = [
    { key: 'action' as const, icon: Heart, label: 'El gesto', value: roll?.action ?? 'Un momento por descubrir' },
    { key: 'place' as const, icon: MapPin, label: 'El lugar', value: roll?.place ?? 'Su rincón favorito' },
    { key: 'seconds' as const, icon: Timer, label: 'El tiempo', value: roll ? duration(roll.seconds) : 'Sin mirar el reloj' },
  ];

  return <div className="space-y-8 pb-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div><p className="mb-2 flex items-center gap-2 text-sm text-primary"><Dices className="size-5" /> Un juego de los dos</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Dados del amor.<br /><span className="text-primary">La chispa la ponen ustedes.</span></h1>
        <p className="mt-3 text-sm text-muted-foreground">Una mirada que invita. Un beso que se hace esperar. Esta noche, los dos.</p></div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Un pase siempre está bien. Sin perder puntos.</div>
    </header>

    <div className="flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Tipo de juego">{modes.map(m => <Button key={m.key} variant={mode === m.key ? 'default' : 'outline'} aria-pressed={mode === m.key} disabled={spinning} onClick={() => { setMode(m.key); resetRoll(); }}><m.icon className="size-4" />{m.label}</Button>)}</div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Nivel de los dados">
      {levelKeys.map((k, index) => { const Icon = LEVEL_ICONS[k]; const selected = deck === k; return <Button key={k} variant={selected ? 'default' : 'outline'} aria-pressed={selected} disabled={spinning} className="h-auto min-h-36 items-start justify-start gap-3 whitespace-normal rounded-lg p-4 text-left" onClick={() => { setDeck(k); setReady([false, false]); resetRoll(); }}>
        <Icon className="mt-1 size-5 shrink-0" /><span className="min-w-0"><span className="block text-base font-semibold">{DICE_LEVELS[k].label}</span><span className="mt-1 block text-xs font-normal">{DICE_LEVELS[k].description}</span><span className="mt-2 block text-xs">{mode === 'verdad' ? `${DICE_TRUTHS[k].length} preguntas` : '3.000 combinaciones · 25 gestos'}</span><span className="mt-3 flex gap-1" aria-label={`Intensidad ${index + 1} de 4`}>{levelKeys.map((_, i) => <span key={i} className={cn('h-1 w-5 rounded-full', i <= index ? 'bg-current' : 'bg-current opacity-20')} />)}</span></span>
      </Button>; })}
    </div>

    {deck !== 'tierno' && <section className="space-y-3 border-y border-border py-4" aria-label="Elegir juntos"><p className="flex items-center gap-2 text-sm"><ShieldCheck className="size-4 text-primary" /> ¿A ambos les apetece este nivel?</p><div className="flex flex-wrap gap-2">{players.map((name, i) => <Button key={i} variant={ready[i] ? 'default' : 'outline'} aria-pressed={ready[i]} disabled={spinning} onClick={() => { setReady(r => i === 0 ? [!r[0], r[1]] : [r[0], !r[1]]); resetRoll(); }}><Check className="size-4" />{name}: {ready[i] ? 'sí, me apetece' : 'elegir'}</Button>)}</div></section>}

    <section className="space-y-5" aria-label="Partida en pareja">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm"><Users className="size-4 text-primary" /> Turno de <strong className="break-all">{players[turn]}</strong><ChevronRight className="size-4 text-muted-foreground" /></p>
        <span className="text-xs text-muted-foreground">{points[0] + points[1]} de {target} momentos · {optionsLeft.toLocaleString('es')} disponibles</span>
      </div>
      <div className="flex flex-wrap gap-3">{players.map((name, i) => <span key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><Heart className="size-3 text-primary" />{name} · {points[i]}</span>)}</div>
      {complete && <div role="status" className="flex flex-wrap items-center gap-3 border-y border-primary py-5"><Trophy className="size-6 text-gold" /><div><p className="font-display text-xl">Una ronda para recordar.</p><p className="text-sm text-muted-foreground">{points[0] + points[1]} momentos que eligieron compartir.</p></div><Button variant="outline" onClick={newRound}><RotateCcw className="size-4" /> Otra ronda juntos</Button></div>}
      <div className={cn('grid gap-4', mode === 'dados' && 'md:grid-cols-[1.5fr_1fr_0.8fr]')} aria-live="polite">
        {(mode === 'dados' ? faces : faces.slice(0, 1)).map(f => <div key={`${f.key}-${serial}`} className={cn('relative flex min-h-56 flex-col justify-between rounded-lg border border-border bg-card p-5', spinning && 'animate-dice', locks[f.key] && 'border-primary')}>
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><f.icon className="size-4 text-primary" />{mode === 'verdad' ? 'Una verdad entre los dos' : mode === 'reto' ? 'Tu reto de esta noche' : f.label}</span>{mode === 'dados' && <Button variant="ghost" size="icon" className="size-8" aria-label={`${locks[f.key] ? 'Liberar' : 'Fijar'} ${f.label.toLowerCase()}`} title={`${locks[f.key] ? 'Liberar' : 'Fijar'} ${f.label.toLowerCase()}`} disabled={!roll || spinning} onClick={() => setLocks(l => ({ ...l, [f.key]: !l[f.key] }))}>{locks[f.key] ? <LockKeyhole className="size-4" /> : <LockKeyholeOpen className="size-4" />}</Button>}</div>
          <p className="my-5 font-display text-2xl leading-snug">{spinning ? 'El azar está eligiendo…' : f.value}</p>
          <span className="text-xs text-muted-foreground">{mode === 'reto' && roll ? `${roll.place} · ${duration(roll.seconds)}` : locks[f.key] ? 'Se queda para el próximo lanzamiento' : 'A su ritmo, si ambos quieren'}</span>
        </div>)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" disabled={spinning || !optionsLeft || !permitted || complete} onClick={throwDice}><Dices className={cn('size-5', spinning && 'animate-spin')} />{spinning ? 'Eligiendo…' : mode === 'verdad' ? 'Descubrir una verdad' : mode === 'reto' ? 'Descubrir un reto' : roll ? 'Lanzar otra vez' : 'Lanzar los dados'}</Button>
        {roll && <><Button variant="outline" disabled={done || spinning} onClick={() => finish(true)}><Check className="size-4" /> Lo compartimos</Button><Button variant="ghost" disabled={done || spinning} onClick={() => finish(false)}><SkipForward className="size-4" /> Pasar</Button><Button variant="ghost" disabled={spinning} aria-label={saved ? 'Quitar favorito' : 'Guardar favorito'} onClick={() => setFavorites(f => saved ? f.filter(v => !(v.id === roll.id && v.level === deck)) : [...f, { ...roll, level: deck }])}><Bookmark className={cn('size-4', saved && 'fill-primary text-primary')} />{saved ? 'Guardado' : 'Guardar'}</Button></>}
      </div>
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      {!optionsLeft && <p role="status" className="text-sm text-primary">Ya descubrieron estas opciones. Pueden cambiar de nivel o empezar otra ronda.</p>}
      {done && <p role="status" className="text-sm text-primary">Ahora el azar le espera a {players[turn]}.</p>}
      {roll && !spinning && <div className="flex flex-wrap items-center gap-3 border-y border-border py-3"><Timer className="size-4 text-muted-foreground" /><span className="min-w-14 font-mono text-xl tabular-nums">{clock(left)}</span><Button variant="ghost" size="sm" disabled={done || left === 0} onClick={() => setRunning(r => !r)}>{running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? 'Pausar' : 'Iniciar tiempo'}</Button><Button size="icon" variant="ghost" aria-label="Reiniciar tiempo" onClick={() => { setLeft(roll.seconds); setRunning(false); }}><RotateCcw className="size-4" /></Button><p className="text-xs text-muted-foreground">{left === 0 ? 'El reloj termina; el momento lo deciden ustedes.' : 'El tiempo es una invitación, no una obligación.'}</p></div>}
    </section>

    <details className="border-y border-border py-4"><summary className="cursor-pointer text-sm font-medium">Preparar nuestro momento</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
      {players.map((p, i) => <label key={i} className="space-y-2 text-xs text-muted-foreground">{i === 0 ? 'Tu nombre en la partida' : 'Nombre de tu pareja'}<Input className="mt-2" value={names[i]} placeholder={p ?? ''} maxLength={40} onChange={e => setNames(n => i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value])} /></label>)}
      <label className="text-xs text-muted-foreground">Nuestro lugar<select aria-label="Nuestro lugar" className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground" value={place} disabled={spinning} onChange={e => { setPlace(e.target.value); resetRoll(); }}><option value="all">Todos nuestros rincones</option>{DICE_PLACES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
      <label className="text-xs text-muted-foreground">Tiempo máximo<select aria-label="Tiempo máximo" className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground" value={maxTime} disabled={spinning} onChange={e => { setMaxTime(Number(e.target.value)); resetRoll(); }}>{DICE_DURATIONS.map(s => <option key={s} value={s}>{duration(s)}</option>)}</select></label>
      <label className="text-xs text-muted-foreground">Momentos por ronda<select aria-label="Momentos por ronda" className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground" value={target} disabled={spinning} onChange={e => { setTarget(Number(e.target.value)); newRound(); }}>{[5, 10, 20].map(n => <option key={n} value={n}>{n} momentos</option>)}</select></label>
      <Button variant="outline" disabled={spinning} onClick={newRound}><RotateCcw className="size-4" /> Nueva ronda</Button>
    </div></details>

    <section className="space-y-4 border-b border-border pb-6">
      <h2 className="flex items-center gap-2 font-display text-xl"><Users className="size-5 text-primary" /> ¿Quién de los dos?</h2>
      <p className="font-display text-2xl">{LIKELY_QUESTIONS[questionIndex]}</p>
      <div className="grid gap-4 sm:grid-cols-2">{players.map((p, i) => <div key={i}><p className="mb-2 break-all text-xs text-muted-foreground">Elige {p}</p><div className="flex flex-wrap gap-2">{players.map((name, j) => <Button key={j} size="sm" variant={votes[i] === j ? 'default' : 'outline'} aria-label={`${p} elige a ${name}`} aria-pressed={votes[i] === j} onClick={() => setVotes(v => i === 0 ? [j, v[1]] : [v[0], j])}>{votes[0] === null || votes[1] === null ? (votes[i] === j ? 'Elección guardada' : name) : name}</Button>)}</div></div>)}</div>
      {votes[0] !== null && votes[1] !== null && <p role="status" className="text-sm text-primary">{votes[0] === votes[1] ? `¡Coinciden! Eligieron a ${players[votes[0]]}.` : 'Cada uno lo ve distinto. Hay una historia que contar.'}</p>}
      <Button variant="ghost" onClick={() => { setQuestionIndex(q => (q + 1 + Math.floor(Math.random() * (LIKELY_QUESTIONS.length - 1))) % LIKELY_QUESTIONS.length); setVotes([null, null]); }}><Shuffle className="size-4" /> Otra pregunta</Button>
    </section>

    {(favorites.length > 0 || history.length > 0) && <div className="grid gap-6 sm:grid-cols-2">
      <section><h2 className="mb-3 flex items-center gap-2 font-display text-lg"><Bookmark className="size-4 text-primary" /> Para repetir juntos</h2><p className="mb-3 text-xs text-muted-foreground">Favoritos de esta sesión.</p>{favorites.map(f => <div key={`${f.level}-${f.id}`} className="mb-2 rounded-xl border border-border p-3"><p className="text-sm">{f.action}</p><p className="mt-1 text-xs text-muted-foreground">{f.place} · {duration(f.seconds)} · {DICE_LEVELS[f.level].label}</p><Button variant="ghost" size="sm" onClick={() => setFavorites(v => v.filter(x => x !== f))}>Quitar</Button></div>)}</section>
      <section><h2 className="mb-3 font-display text-lg">Esta noche, nosotros</h2><ul className="space-y-3">{history.map((h, i) => <li key={i} className="border-b border-border pb-3"><p className="text-sm">{h.action}</p><p className="mt-1 text-xs text-muted-foreground">{h.name} · {h.status}</p></li>)}</ul></section>
    </div>}
  </div>;
}
