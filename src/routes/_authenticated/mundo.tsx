import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Heart, Home, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/mundo")({
  head: () => ({ meta: [{ title: "Nuestro Mundo — Nuestro Espacio" }, { name: "description", content: "Un pequeño universo pixel art para construir juntos." }] }),
  component: MundoPage,
});

const WIDTH = 16;
const HEIGHT = 11;
type Furniture = "🌳" | "🌷" | "🪑" | "🧸" | "💡" | "🎁" | "🌻" | "🪴" | "⛲" | "🐈";
type World = { furniture: Record<string, Furniture>; name: string };
const ITEMS: { icon: Furniture; label: string }[] = [
  { icon: "🌳", label: "Árbol" },{ icon: "🌷", label: "Flores" },{ icon: "🪑", label: "Banco" },
  { icon: "🧸", label: "Osito" },{ icon: "💡", label: "Farola" },{ icon: "🎁", label: "Regalo" },
  { icon: "🌻", label: "Girasol" },{ icon: "🪴", label: "Planta" },{ icon: "⛲", label: "Fuente" },{ icon: "🐈", label: "Gato" },
];
const DEFAULT_WORLD: World = { name: "Nuestro jardín", furniture: {
  "2,2": "🌳", "13,2": "🌳", "3,8": "🌷", "12,8": "🌻", "8,8": "🪑", "5,2": "🪴",
}};
const house = new Set(["6,3","7,3","8,3","9,3","6,4","7,4","8,4","9,4"]);
const key = (x:number,y:number) => `${x},${y}`;
const allowed = (x:number,y:number) => x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && !house.has(key(x,y));
const defaultWorld = ():World => ({name:DEFAULT_WORLD.name,furniture:{...DEFAULT_WORLD.furniture}});
function safeWorld(value: unknown): World {
  if (!value || typeof value !== "object") return defaultWorld();
  const source = value as Partial<World>;
  const furniture:Record<string,Furniture> = {};
  for (const [position,icon] of Object.entries(source.furniture ?? {})) {
    const [x,y]=position.split(",").map(Number);
    if (Number.isInteger(x) && Number.isInteger(y) && allowed(x,y) && ITEMS.some(item=>item.icon===icon)) furniture[position]=icon;
  }
  return { name:typeof source.name==="string" ? source.name.slice(0,50) : DEFAULT_WORLD.name, furniture };
}
function MundoPage() {
  const { user } = useAuth();
  const {data:couple}=useCouple(user?.id);
  const [world,setWorld]=useState<World>(defaultWorld);
  const [avatar,setAvatar]=useState({x:8,y:7});
  const [editing,setEditing]=useState(false);
  const [selected,setSelected]=useState<Furniture>("🌷");
  const [loading,setLoading]=useState(false);
  const [sync,setSync]=useState<"local"|"shared"|"loading">("loading");
  const [remoteVersion,setRemoteVersion]=useState<string|null>(null);
  const worldRef=useRef(world);

  const storageId=couple?.coupleId ? `ne-world-${couple.coupleId}` : `ne-world-${user?.id ?? "guest"}`;
  useEffect(()=>{worldRef.current=world;},[world]);

  // Local-first: the garden remains playable before the migration is deployed.
  useEffect(()=>{
    if(!user)return;
    let cancelled=false;
    setRemoteVersion(null);
    try{const saved=localStorage.getItem(storageId);setWorld(saved?safeWorld(JSON.parse(saved)):defaultWorld());}catch{setWorld(defaultWorld());}

    setSync("local");
    if(!couple?.coupleId)return;
    const load=async()=>{
      try{
        const {data,error}=await supabase.from("couple_worlds" as any).select("world,updated_at").eq("couple_id",couple.coupleId!).maybeSingle();
        if(cancelled)return;
        if(error){setSync("local");return;}
        if(data){const row=data as unknown as {world:unknown;updated_at:string};const latest=safeWorld(row.world);setWorld(latest);localStorage.setItem(storageId,JSON.stringify(latest));setRemoteVersion(row.updated_at);}
        setSync("shared");
      }catch{if(!cancelled)setSync("local");}
    };
    void load();
    return()=>{cancelled=true;};
  },[user?.id,couple?.coupleId,storageId]);

  const move=useCallback((dx:number,dy:number)=>setAvatar(p=>{
    const x=p.x+dx,y=p.y+dy;return allowed(x,y)?{x,y}:p;
  }),[]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)return;
      const directions:Record<string,[number,number]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
      const direction=directions[e.key];
      if(direction){e.preventDefault();move(...direction);}
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[move]);

  const change=useCallback((next:World)=>{
    worldRef.current=next;setWorld(next);
    try{localStorage.setItem(storageId,JSON.stringify(next));}catch{toast.error("No se pudo guardar en este dispositivo");}
  },[storageId]);
  const place=(x:number,y:number)=>{
    if(!allowed(x,y)){toast.info("Aquí no se puede construir");return;}
    if(!editing){setAvatar({x,y});return;}
    const furniture={...worldRef.current.furniture};
    if(furniture[key(x,y)]===selected)delete furniture[key(x,y)];
    else furniture[key(x,y)]=selected;
    change({...worldRef.current,furniture});
  };
  const save=async()=>{
    if(!couple?.coupleId){toast.info("Vincula a tu pareja para sincronizar el mundo");return;}
    if(!user)return;
    setLoading(true);
    try{
      // Optimistic concurrency protects against silently overwriting partner edits.
      const payload={couple_id:couple.coupleId,world:worldRef.current,updated_by:user.id};
      let query=supabase.from("couple_worlds" as any);
      const result=remoteVersion
        ? await query.update({world:payload.world,updated_by:user.id} as any).eq("couple_id",couple.coupleId).eq("updated_at",remoteVersion).select("updated_at").maybeSingle()
        : await query.insert(payload as any).select("updated_at").maybeSingle();
      if(result.error)throw result.error;
      if(!result.data){toast.error("Tu pareja cambió el jardín. Recarga para ver sus cambios.");return;}
      setRemoteVersion((result.data as {updated_at:string}).updated_at);
setSync("shared");toast.success("Jardín sincronizado con tu pareja");
    }catch{toast.error("No se pudo sincronizar. Tu jardín sigue guardado en este dispositivo.");setSync("local");}
    finally{setLoading(false);}
  };
  const cells=useMemo(()=>Array.from({length:WIDTH*HEIGHT},(_,i)=>({x:i%WIDTH,y:Math.floor(i/WIDTH)})),[]);
  return <main className="mx-auto max-w-6xl space-y-5 pb-12">
    <header className="surface warm-gradient flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
      <div><p className="text-xs uppercase tracking-[.2em] text-primary">Nuestro pequeño universo</p><h1 className="mt-2 flex items-center gap-2 font-display text-3xl sm:text-5xl"><Home className="text-primary"/>Nuestro Mundo</h1><p className="mt-2 text-sm text-muted-foreground">Explora el jardín, decóralo y guarda su historia.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to="/libro"><BookOpen className="mr-2 size-4"/>Álbum</Link></Button><Button onClick={()=>void save()} disabled={loading}><Save className="mr-2 size-4"/>{loading?"Guardando…":"Guardar para dos"}</Button></div>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">{world.name}</span><span role="status" className="text-muted-foreground">{sync==="shared"?"Conexión compartida disponible · guarda para publicar cambios":sync==="loading"?"Conectando…":"Modo local · cambios guardados en este dispositivo"}</span></div>
    <section className="overflow-x-auto rounded-2xl border border-border bg-[#253b3c] p-2 shadow-xl sm:p-4" aria-label="Jardín pixel art">
      <div className="relative mx-auto grid min-w-[480px] max-w-[900px] overflow-hidden rounded-xl border-[6px] border-[#6b503d]" style={{gridTemplateColumns:`repeat(${WIDTH},minmax(0,1fr))`}}>
        {cells.map(({x,y})=>{
          const position=key(x,y),isHouse=house.has(position),isPlayer=avatar.x===x&&avatar.y===y;
          const path=(x===7||x===8)&&y>=5;
          return <button key={position} type="button" onClick={()=>place(x,y)} disabled={isHouse} aria-label={`${x+1},${y+1}${world.furniture[position]?": "+world.furniture[position]:""}`} className="relative flex aspect-square items-center justify-center border border-black/5 text-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:text-2xl" style={{background:isHouse?"#a37658":path?"#c9aa78":(x+y)%3===0?"#82ac70":"#90b979",imageRendering:"pixelated"}}>
            {isHouse?<span aria-hidden="true" className="text-xl sm:text-3xl">{x===7&&y===4?"🚪":y===3?"🏠":"🧱"}</span>:isPlayer?<span className="animate-bounce drop-shadow-lg" aria-label="Tu personaje">🧑</span>:<span aria-hidden="true">{world.furniture[position] ?? ((x+y)%7===0 ? "·" : "")}</span>}
          </button>;
        })}
      </div>
      <p className="mt-2 text-center text-xs text-white/80">Usa WASD o las flechas. Toca una casilla para caminar o colocar objetos.</p>
    </section>
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <section className="surface space-y-3 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary"/>Personaliza el jardín</h2><Button size="sm" variant={editing?"default":"outline"} onClick={()=>setEditing(e=>!e)}>{editing?"Terminar decoración":"Decorar"}</Button></div>
      {editing?<div className="flex flex-wrap gap-2">{ITEMS.map(item=><button key={item.icon} onClick={()=>setSelected(item.icon)} aria-pressed={selected===item.icon} title={item.label} className={`rounded-xl border px-3 py-2 text-xl ${selected===item.icon?"border-primary bg-primary/15":"border-border"}`}>{item.icon}<span className="ml-2 text-xs">{item.label}</span></button>)}</div>:<p className="text-sm text-muted-foreground">Activa «Decorar», elige un objeto y toca una casilla para colocarlo. Toca el mismo objeto de nuevo para retirarlo.</p>}
      <label className="block text-xs text-muted-foreground">Nombre del lugar<input value={world.name} maxLength={50} onChange={e=>change({...worldRef.current,name:e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"/></label>
      <p className="text-xs text-muted-foreground">El guardado compartido requiere la migración `couple_worlds` en Supabase; mientras tanto funciona localmente.</p>
      </section>
      <section className="surface flex items-center justify-center p-5"><div className="grid grid-cols-3 gap-2">{[[null,0,null],[0,1,0],[null,0,null]].map((row,j)=>row.map((_,i)=>{const dirs:[number,number][][]=[[[0,0],[0,-1],[0,0]],[[-1,0],[0,0],[1,0]],[[0,0],[0,1],[0,0]]];const [dx,dy]=dirs[j][i];const icons=[null,ArrowUp,null,ArrowLeft,null,ArrowRight,null,ArrowDown,null];const Icon=icons[j*3+i];return Icon?<Button key={j*3+i} variant="outline" size="icon" aria-label={`Mover ${j*3+i}`} onClick={()=>move(dx,dy)}><Icon/></Button>:<span key={j*3+i} className="size-9"/>;}))}</div></section>
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Heart className="size-4 text-primary"/>El jardín se guarda automáticamente en tu dispositivo. Puedes jugar sin conexión.</div>
  </main>;
}
