import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw, Trophy, Gamepad2, Heart, Dices, Brain, Flame, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/juegos")({
  head: () => ({ meta: [{ title: "Centro de juegos — Nuestro Espacio" }, { name: "description", content: "Minijuegos para compartir un rato juntos." }] }),
  component: GamesHub,
});

type Mark = "X" | "O";
type Square = Mark | null;
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(board: Square[]): Mark | "empate" | null {
  for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  return board.every(Boolean) ? "empate" : null;
}
const icons = ["💗","🌹","🎁","💌","🌷","✨"];
function shuffleDeck() {
  return [...icons, ...icons].map((icon,id)=>({icon,id,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(({icon,id})=>({icon,id}));
}
function GamesHub() {
  const [tab,setTab] = useState<"gato"|"memoria">("gato");
  const [board,setBoard] = useState<Square[]>(Array(9).fill(null));
  const [turn,setTurn] = useState<Mark>("X");
  const [score,setScore] = useState({X:0,O:0,empate:0});
  const outcome=winner(board);
  const [deck,setDeck]=useState(shuffleDeck);
  const [shown,setShown]=useState<number[]>([]);
  const [matched,setMatched]=useState<number[]>([]);
  const [moves,setMoves]=useState(0);
  const [locked,setLocked]=useState(false);
  const finished=matched.length===deck.length;
  const [round,setRound]=useState(0);
  const resetBoard=()=>{setBoard(Array(9).fill(null));setTurn("X");};
  const play=(i:number)=>{
    if(board[i] || outcome)return;
    const next=[...board];next[i]=turn;setBoard(next);
    const result=winner(next);
    if(result)setScore(s=>({...s,[result]:s[result]+1}));
    setTurn(turn==="X"?"O":"X");
  };
  const resetMemory=()=>{setDeck(shuffleDeck());setShown([]);setMatched([]);setMoves(0);setLocked(false);setRound(r=>r+1);};
  const reveal=(i:number)=>{
    if(locked || shown.includes(i) || matched.includes(i) || finished)return;
    if(shown.length===0){setShown([i]);return;}
    const first=shown[0];
    setMoves(n=>n+1);
    setShown([first,i]);
    if(deck[first].icon===deck[i].icon){
      setMatched(m=>[...m,first,i]);setShown([]);
    }else{
      setLocked(true);
      // The timeout is limited to transient UI state; reset changes the round token.
      window.setTimeout(()=>{
        if(activeRound.current===round){setShown([]);setLocked(false);}
      },850);
    }
  };
  const activeRound=useMemo(()=>({current:round}),[round]);
  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div className="surface warm-gradient p-6 sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">Un ratito para los dos</p>
      <h1 className="mt-3 flex items-center gap-3 font-display text-3xl sm:text-5xl"><Gamepad2 className="size-9 text-primary"/>Centro de juegos</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Jueguen en el mismo dispositivo, lleven la puntuación y descubran nuevas actividades. Estas partidas son locales: no se sincronizan entre dispositivos.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <button onClick={()=>setTab("gato")} aria-pressed={tab==="gato"} className={`surface p-5 text-left transition hover:border-primary/60 ${tab==="gato"?"ring-2 ring-primary":""}`}><Dices className="mb-2 text-primary"/><h2 className="font-semibold">Tres en raya</h2><p className="text-sm text-muted-foreground">Dos jugadores por turnos</p></button>
      <button onClick={()=>setTab("memoria")} aria-pressed={tab==="memoria"} className={`surface p-5 text-left transition hover:border-primary/60 ${tab==="memoria"?"ring-2 ring-primary":""}`}><Heart className="mb-2 text-primary"/><h2 className="font-semibold">Memoria romántica</h2><p className="text-sm text-muted-foreground">Encuentra las seis parejas</p></button>
    </div>
    {tab==="gato"?<section className="surface space-y-5 p-5 sm:p-8" aria-label="Tres en raya">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Tres en raya</h2><p role="status" className="text-sm text-muted-foreground">{outcome===null?`Turno del jugador ${turn}`:outcome==="empate"?"¡Empate!":`¡Ganó el jugador ${outcome}!`}</p></div><Button variant="outline" onClick={resetBoard}><RotateCcw className="mr-2 size-4"/>Nueva ronda</Button></div>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">{board.map((mark,i)=><button key={i} onClick={()=>play(i)} disabled={!!mark||!!outcome} aria-label={`Casilla ${i+1}: ${mark||"vacía"}`} className="flex aspect-square items-center justify-center rounded-xl border border-border bg-background text-4xl font-bold text-primary transition hover:bg-primary/10 disabled:cursor-default">{mark}</button>)}</div>
      <div className="flex justify-center gap-5 text-center text-sm"><div>Jugador X <strong className="block text-2xl">{score.X}</strong></div><div>Empates <strong className="block text-2xl">{score.empate}</strong></div><div>Jugador O <strong className="block text-2xl">{score.O}</strong></div></div>
    </section>:<section className="surface space-y-5 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Memoria romántica</h2><p role="status" className="text-sm text-muted-foreground">{finished?`¡Completado en ${moves} intentos!`:`${matched.length/2} de 6 parejas · ${moves} intentos`}</p></div><Button variant="outline" onClick={resetMemory}><RotateCcw className="mr-2 size-4"/>Mezclar</Button></div>
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">{deck.map((card,i)=>{const visible=shown.includes(i)||matched.includes(i);return <button key={card.id} onClick={()=>reveal(i)} disabled={visible||locked} aria-label={visible?`Carta ${i+1}: ${card.icon}`:`Voltear carta ${i+1}`} className="aspect-square rounded-xl border border-border bg-primary/10 text-3xl transition hover:scale-105 disabled:cursor-default sm:text-4xl">{visible?card.icon:"?"}</button>;})}</div>
    </section>}
    <section className="space-y-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="size-5 text-primary"/>Más experiencias</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[{to:"/dados",label:"Dados",icon:Dices},{to:"/trivia",label:"Trivia",icon:Brain},{to:"/retos",label:"Retos",icon:Flame},{to:"/diversion",label:"Diversión",icon:Laugh}].map(item=><Link key={item.to} to={item.to} className="surface flex items-center gap-3 p-4 transition hover:border-primary"><item.icon className="size-5 text-primary"/><span className="font-medium">{item.label}</span></Link>)}
    </div></section>
  </div>;
}
