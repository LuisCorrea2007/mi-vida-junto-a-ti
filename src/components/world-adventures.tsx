import { useEffect, useRef, useState } from "react";
import { Fish, Heart, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Scene, type Point } from "@/lib/couple-world";

type Props={userId?:string;scene:Scene;hero:Point;steps:number;furnitureCount:number;};
type Phase="idle"|"waiting"|"bite"|"caught"|"missed";
export function WorldAdventures({userId,scene,hero,steps,furnitureCount}:Props){
  const [phase,setPhase]=useState<Phase>("idle");
  const [caught,setCaught]=useState(0);
  const [walked,setWalked]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const [tries,setTries]=useState(0);
  const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  const lastSteps=useRef(steps);
  const storageKey="ne-world-progress-"+(userId??"guest");
  const nearPond=scene==="garden"&&Math.hypot(hero.x-22,hero.y-16)<6;
  useEffect(()=>{
    try{
      const data=JSON.parse(localStorage.getItem(storageKey)??"null") as {caught?:number;walked?:number}|null;
      if(data){setCaught(Math.max(0,Math.floor(Number(data.caught)||0)));setWalked(Math.max(0,Math.floor(Number(data.walked)||0)));}
    }catch{}
    lastSteps.current=steps;setLoaded(true);
  },[storageKey]);
  useEffect(()=>{
    const delta=Math.max(0,steps-lastSteps.current);
    lastSteps.current=steps;
    if(delta>0)setWalked(v=>v+delta);
  },[steps]);
  useEffect(()=>{if(loaded)try{localStorage.setItem(storageKey,JSON.stringify({caught,walked}));}catch{}},[storageKey,loaded,caught,walked]);
  useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);},[]);
  const start=()=>{
    if(!nearPond || (phase!=="idle"&&phase!=="caught"&&phase!=="missed"))return;
    if(timeout.current)clearTimeout(timeout.current);
    setTries(x=>x+1);setPhase("waiting");
    timeout.current=setTimeout(()=>{
      setPhase("bite");
      timeout.current=setTimeout(()=>setPhase("missed"),2100);
    },800+Math.floor(Math.random()*2300));
  };
  const hook=()=>{
    if(timeout.current)clearTimeout(timeout.current);
    if(phase==="bite"){setCaught(n=>n+1);setPhase("caught");}
    else if(phase==="waiting")setPhase("missed");
  };
  const achievements=[
    {name:"Primer paseo",value:walked,target:100},
    {name:"Jardín creativo",value:furnitureCount,target:12},
    {name:"Primera pesca",value:caught,target:1},
    {name:"Pescadores expertos",value:caught,target:10},
  ];
  const medals=achievements.filter(a=>a.value>=a.target).length;
  return <section className="surface space-y-4 p-5" aria-label="Aventuras y logros">
    <header className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><Trophy className="size-5 text-primary"/>Pequeñas aventuras</h2><span className="text-xs text-muted-foreground">{medals}/4 logros</span></header>
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map(a=><div key={a.name} className="rounded-xl border border-border p-3">
        <p className="text-sm font-medium">{a.value>=a.target?"🏆 ":""}{a.name}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-all" style={{width:Math.min(100,a.value/a.target*100)+"%"}}/></div>
        <p className="mt-1 text-xs text-muted-foreground">{Math.min(a.value,a.target)}/{a.target}</p>
      </div>)}
    </div>
    <div className="rounded-xl border border-border p-4">
      <h3 className="flex items-center gap-2 font-medium"><Fish className="size-4 text-primary"/>Pescar en el estanque</h3>
      <p className="mt-1 text-xs text-muted-foreground">Acércate al lago del jardín para lanzar la caña. Cuando aparezca «¡Picó!», toca el botón antes de que se escape.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phase==="waiting"||phase==="bite"
          ? <Button onClick={hook} variant={phase==="bite"?"default":"outline"}>{phase==="bite"?"🎣 ¡Picó! Recoger":"Esperando… (no te adelantes)"}</Button>
          : <Button onClick={start} disabled={!nearPond}><Fish className="mr-2 size-4"/>Lanzar caña</Button>}
        <span role="status" className="text-xs text-muted-foreground">{phase==="caught"?"¡Conseguiste un pez!":phase==="missed"?"Se escapó, vuelve a intentarlo.":!nearPond?"Acércate al lago para jugar":caught+" peces · "+tries+" lanzamientos"}</span>
      </div>
    </div>
    <p className="flex items-center gap-2 text-xs text-muted-foreground"><Heart className="size-4 text-primary"/>Tus logros y peces se guardan localmente en este dispositivo.</p>
  </section>;
}
