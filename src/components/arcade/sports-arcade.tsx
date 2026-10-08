import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Bot, Check, Expand, Flag, Pause, Play, RotateCcw, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import cover from "@/assets/arcade-world.jpg";
import golfCover from "@/assets/golf-cover.jpg";
import bowlingCover from "@/assets/bowling-cover.jpg";
import curlingCover from "@/assets/curling-cover.jpg";
import basketCover from "@/assets/basket-cover.jpg";
import { botAim, SPORTS, type Sport, type SportDifficulty } from "@/lib/arcade-sports";
import type { Shot, ShotResult } from "./sports-scene";

const Scene = lazy(() => import("./sports-scene"));
const covers = {golf:golfCover,bowling:bowlingCover,curling:curlingCover,basket:basketCover};
class SceneBoundary extends Component<{ children: ReactNode; onExit: () => void }, { error: boolean }> {
  override state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  override render() { return this.state.error ? <div className="absolute inset-0 grid place-content-center gap-4 bg-background p-8 text-center"><p>No pudimos abrir este escenario 3D en tu dispositivo.</p><Button onClick={this.props.onExit}>Volver a Juegos</Button></div> : this.props.children; }
}
export function SportsArcade() {
  const [selected, setSelected] = useState<Sport|null>(null);
  const [mode, setMode] = useState<"bot"|"local">("bot");
  const [difficulty, setDifficulty] = useState<SportDifficulty>("normal");
  const [avatar, setAvatar] = useState(0);
  const [session, setSession] = useState(0);
  const [records, setRecords] = useState<Record<string,number>>({});
  useEffect(() => { try { setRecords(JSON.parse(localStorage.getItem("sports-arcade-records")??"{}")); } catch { /* no records */ } }, []);
  const save = useCallback((sport: Sport, score: number) => { setRecords(prev => { const next={...prev,[sport]:Math.max(prev[sport]??0,score)}; try { localStorage.setItem("sports-arcade-records",JSON.stringify(next)); } catch { /* unavailable */ } return next; }); }, []);
  return <section className="space-y-5">
    <div className="arcade-cover relative isolate overflow-hidden rounded-lg">
      <img src={cover} width={1536} height={1024} alt="Isla de juegos con minigolf, bolos y curling" className="absolute inset-0 h-full w-full object-cover" />
      <div className="arcade-cover-shade absolute inset-0" />
      <div className="relative flex min-h-72 flex-col justify-end gap-3 p-6 sm:min-h-80 sm:p-8">
        <span className="text-sm font-semibold text-arcade-yellow">NUESTRO ARCADE</span>
        <h2 className="font-display text-4xl font-semibold text-arcade-white">Una partida más, juntos.</h2>
        <div className="flex flex-wrap gap-3 text-sm text-arcade-white"><span className="flex items-center gap-1.5"><Flag className="size-4" /> 4 deportes 3D</span><span className="flex items-center gap-1.5"><Users className="size-4" /> 2 jugadores</span><span className="flex items-center gap-1.5"><Bot className="size-4" /> Rival con dificultad</span></div>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-1 rounded-lg bg-secondary p-1" aria-label="Modo de juego">
        <Button size="sm" variant={mode==="bot" ? "default" : "ghost"} onClick={()=>setMode("bot")}><Bot className="size-4" /> Contra el bot</Button>
        <Button size="sm" variant={mode==="local" ? "default" : "ghost"} onClick={()=>setMode("local")}><Users className="size-4" /> Dos en este dispositivo</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {mode==="bot" && <select aria-label="Dificultad de deportes" value={difficulty} onChange={e=>setDifficulty(e.target.value as SportDifficulty)} className="h-9 rounded-lg border bg-background px-3 text-sm"><option value="facil">Fácil</option><option value="normal">Normal</option><option value="dificil">Difícil</option></select>}
        <div className="flex gap-1" aria-label="Tu personaje">{[0,1].map(id=><Button key={id} size="sm" variant={avatar===id ? "secondary" : "ghost"} onClick={()=>setAvatar(id)}>{avatar===id && <Check className="size-3" />}{id===0 ? "Leo" : "Luna"}</Button>)}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SPORTS.map(sport=><Button key={sport.id} variant="ghost" onClick={()=>{setSelected(sport.id);setSession(s=>s+1);}} className="group h-auto flex-col items-stretch gap-0 overflow-hidden rounded-lg border bg-card p-0 text-left whitespace-normal">
        <div className="relative aspect-[4/3] overflow-hidden"><img src={covers[sport.id]} width={768} height={512} loading="lazy" alt={sport.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-2 top-2 rounded bg-arcade-ink/80 px-2 py-1 text-xs text-arcade-white">3D</span></div>
        <div className="space-y-1 p-3"><h3 className="font-display text-base font-semibold">{sport.name}</h3><p className="text-xs text-muted-foreground">{sport.tag} · {mode==="bot" ? "Bot" : "2 jugadores"}</p><div className="flex items-center justify-between pt-2 text-xs text-primary"><span>{records[sport.id]!==undefined ? `Récord local: ${records[sport.id]}` : "Jugar"}</span><Play className="size-4" /></div></div>
      </Button>)}
    </div>
    {selected && <Match key={session} sport={selected} mode={mode} difficulty={difficulty} avatar={avatar} onExit={()=>setSelected(null)} onRecord={save} />}
  </section>;
}
function Match({sport,mode,difficulty,avatar,onExit,onRecord}: {sport: Sport; mode:"bot"|"local"; difficulty:SportDifficulty; avatar:number; onExit:()=>void; onRecord:(sport:Sport,score:number)=>void}) {
  const definition = SPORTS.find(s=>s.id===sport);
  const [ready,setReady] = useState(false); const [paused,setPaused] = useState(false); const [shot,setShot] = useState<Shot|null>(null);
  const [angle,setAngle] = useState(0); const [power,setPower] = useState(sport==="basket" ? 62 : sport==="curling" ? 24 : sport==="bowling" ? 85 : 57);
  const [player,setPlayer] = useState(0); const [round,setRound] = useState(1); const [score,setScore] = useState<[number,number]>([0,0]);
  const [strokes,setStrokes] = useState(0); const [position,setPosition] = useState<[number,number]>([0,5]); const [result,setResult] = useState<string|null>(null); const [finished,setFinished] = useState(false); const [version,setVersion] = useState(0);
  const lock = useRef(false); const shotId = useRef(0); const root = useRef<HTMLDivElement>(null);
  const onReady = useCallback(()=>setReady(true),[]);
  useEffect(()=>{ const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};},[]);
  useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.code==="Escape") setPaused(p=>!p);};window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);},[]);
  const launch = useCallback((a:number,p:number)=>{if(lock.current || !ready || paused || finished) return;lock.current=true;setResult(null);setShot({id:++shotId.current,angle:a,power:p,player,start:position});},[ready,paused,finished,player,position]);
  useEffect(()=>{if(mode!=="bot" || player!==1 || shot || paused || finished || !ready) return; const timer=window.setTimeout(()=>{const aim=botAim(sport,round,difficulty);if(sport==="golf"){aim.angle=Math.atan2(([0,1.15,-1.15][(round-1)%3]??0)-position[0],position[1]+4)*180/Math.PI;aim.power=Math.min(95,Math.hypot(position[0],position[1]+4)*6.3);}launch(aim.angle,aim.power);},1100);return()=>window.clearTimeout(timer);},[mode,player,shot,paused,finished,ready,sport,round,difficulty,launch,position]);
  const finishShot = useCallback((r:ShotResult)=>{
    if(!lock.current) return;lock.current=false;
    setShot(null);setVersion(v=>v+1);
    const count=strokes+1;
    if(sport==="golf" && !r.hole && count<6){setStrokes(count);setPosition([r.x,r.z]);setResult(`Cerca del hoyo · ${count} ${count===1 ? "golpe" : "golpes"}`);return;}
    const points=sport==="golf" ? r.hole ? 7-count : 0 : r.points;
    const next:[number,number]=[...score];next[player]=(next[player]??0)+points;setScore(next);setResult(sport==="golf" ? r.hole ? `¡Al hoyo! +${points}` : "Límite de golpes" : points>0 ? `¡+${points} puntos!` : "Sin puntos esta vez");
    setStrokes(0);setPosition([0,5]);setAngle(0);
    if(player===0) setPlayer(1); else if(round>=(definition?.rounds??3)){setFinished(true);onRecord(sport,next[0]);}else{setRound(n=>n+1);setPlayer(0);}
  },[strokes,sport,score,player,round,definition,onRecord]);
  function restart(){lock.current=false;setShot(null);setScore([0,0]);setRound(1);setPlayer(0);setStrokes(0);setPosition([0,5]);setFinished(false);setResult(null);setPaused(false);setVersion(v=>v+1);}
  const names=["Tú",mode==="bot" ? "Bot" : "Jugador 2"];
  return <div ref={root} role="dialog" aria-modal="true" aria-label={definition?.name} className="fixed inset-0 z-[100] flex flex-col bg-background">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-3 py-3 sm:px-6">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onExit} aria-label="Volver a Juegos"><ArrowLeft className="size-5" /></Button><div><h2 className="font-display text-base font-semibold sm:text-xl">{definition?.name}</h2><p className="text-xs text-muted-foreground">Ronda {round}/{definition?.rounds} · {mode==="bot" ? `Bot · ${difficulty==="facil" ? "Fácil" : difficulty==="dificil" ? "Difícil" : "Normal"}` : "Dos en este dispositivo"}</p></div></div>
      <div className="flex items-center gap-1"><Button size="icon" variant="ghost" aria-label={paused ? "Continuar" : "Pausar"} onClick={()=>setPaused(p=>!p)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</Button><Button size="icon" variant="ghost" aria-label="Reiniciar partida" onClick={restart}><RotateCcw className="size-4" /></Button><Button size="icon" variant="ghost" aria-label="Pantalla completa" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else root.current?.requestFullscreen?.().catch(()=>{});}}><Expand className="size-4" /></Button></div>
    </header>
    <div className="relative min-h-0 flex-1 bg-arcade-sky">
      <SceneBoundary onExit={onExit}><Suspense fallback={<div className="absolute inset-0 grid place-items-center text-arcade-ink">Preparando escenario…</div>}><Scene key={version} sport={sport} round={round} shot={shot} paused={paused} avatar={avatar} onReady={onReady} onFinish={finishShot} /></Suspense></SceneBoundary>
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center gap-2">{names.map((name,i)=><div key={name} className={cn("min-w-24 rounded-lg border bg-background/90 px-4 py-2 text-center shadow-soft",player===i && !finished && "border-primary")}><p className="text-xs text-muted-foreground">{name}</p><p className="font-display text-2xl font-semibold">{score[i]}</p></div>)}</div>
      {paused && !finished && <div className="absolute inset-0 grid place-content-center bg-background/25"><Button onClick={()=>setPaused(false)}><Play className="size-5" /> Continuar partida</Button></div>}
      {finished && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/55 backdrop-blur-sm"><Trophy className="size-12 text-arcade-yellow" /><h3 className="font-display text-3xl font-semibold">{score[0]===score[1] ? "¡Empate!" : score[0]>score[1] ? "¡Ganaste!" : `Ganó ${names[1]}`}</h3><p>{score[0]} — {score[1]}</p><Button onClick={restart}><RotateCcw className="size-4" /> Revancha</Button><Button variant="secondary" onClick={onExit}>Volver a Juegos</Button></div>}
    </div>
    <footer className="space-y-3 border-t bg-background px-4 pb-5 pt-3 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><p className="font-semibold">{finished ? "Partida terminada" : shot ? `${names[player]} está lanzando…` : player===1 && mode==="bot" ? "El bot prepara su lanzamiento…" : `Turno de ${names[player]}`}</p><p className="text-primary" aria-live="polite">{result??(sport==="golf" ? `Golpe ${strokes+1}/6` : "")}</p></div>
      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 sm:gap-6">
        <label className="min-w-0 text-xs text-muted-foreground">Dirección {angle}°<input aria-label="Dirección" type="range" min={-28} max={28} value={angle} onChange={e=>setAngle(Number(e.target.value))} disabled={!!shot||paused||finished||(player===1&&mode==="bot")} className="mt-2 block w-full accent-primary" /></label>
        <label className="min-w-0 text-xs text-muted-foreground">Fuerza {power}%<input aria-label="Fuerza" type="range" min={10} max={100} value={power} onChange={e=>setPower(Number(e.target.value))} disabled={!!shot||paused||finished||(player===1&&mode==="bot")} className="mt-2 block w-full accent-primary" /></label>
        <Button disabled={!ready||!!shot||paused||finished||(player===1&&mode==="bot")} onClick={()=>launch(angle,power)}><Play className="size-4" /><span>Lanzar</span></Button>
      </div>
    </footer>
  </div>;
}