import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookHeart, Check, DoorOpen, Heart, Moon, RotateCcw, Save, Sparkles, Sun, Undo2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { WorldCanvas } from "@/components/world-canvas";
import { mergeWorlds } from "@/lib/world-merge";
import {
  ITEMS, WORLD_W, WORLD_H, pointKey, canWalk, canPlace, findPath,
  initialWorld, parseWorld, outsideSpawn, insideSpawn,
  type Point, type Scene, type Skin, type DecorId, type WorldDoc
} from "@/lib/couple-world";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/mundo")({
  head:()=>({meta:[
    {title:"Nuestro Mundo — Nuestro Espacio"},
    {name:"description",content:"Explora una casa pixel art, decora el jardín y comparte el mundo con tu pareja."}
  ]}),
  component: MundoPage
});

type Peer = {id:string;x:number;y:number;scene:Scene;skin:Skin;name:string;updated_at:string};
const skins:{id:Skin;label:string;color:string}[] = [
  {id:"rose",label:"Rosa",color:"#e6789d"},
  {id:"mint",label:"Menta",color:"#63b8aa"},
  {id:"lavender",label:"Lila",color:"#a38bd4"},
  {id:"gold",label:"Miel",color:"#e6af5f"},
];
const needsDoor=(scene:Scene,p:Point)=>scene==="garden"
  ? Math.abs(p.x-13)<=1&&Math.abs(p.y-13)<=1
  : Math.abs(p.x-13)<=1&&p.y>=15;
const formatStatus=(v:string)=>v==="ready"?"Guardado compartido disponible":v==="connecting"?"Conectando con el espacio de pareja…":"Jugando en modo local";

function MundoPage(){
  const {user}=useAuth();
  const {data:couple}=useCouple(user?.id);
  const [world,setWorld]=useState<WorldDoc>(initialWorld);
  const [scene,setScene]=useState<Scene>("garden");
  const [hero,setHero]=useState<Point>(outsideSpawn);
  const [skin,setSkin]=useState<Skin>("rose");
  const [partner,setPartner]=useState<Peer>();
  const [editing,setEditing]=useState(false);
  const [selected,setSelected]=useState<DecorId>("flowers");
  const [night,setNight]=useState(false);
  const [status,setStatus]=useState("connecting");
  const [dirty,setDirty]=useState(false);
  const [saving,setSaving]=useState(false);
  const [remoteVersion,setRemoteVersion]=useState<string|null>(null);
  const [conflict,setConflict]=useState(false);
  const [steps,setSteps]=useState(0);
  const worldRef=useRef(world);
  const baseRef=useRef<WorldDoc>(initialWorld());
  const pendingRemote=useRef<{world:WorldDoc;updated_at:string}|null>(null);
  const sceneRef=useRef(scene);
  const heroRef=useRef(hero);
  const skinRef=useRef(skin);
  const dirtyRef=useRef(false);
  const savedVersion=useRef<string|null>(null);
  const walkingRef=useRef<Point[]>([]);
  const undoRef=useRef<WorldDoc[]>([]);
  const timer=useRef<ReturnType<typeof setInterval>|null>(null);
  const bucket=couple?.coupleId?"ne-world-"+couple.coupleId:"ne-world-"+(user?.id||"guest");
  const decor=scene==="garden"?world.garden:world.home;

  useEffect(()=>{sceneRef.current=scene;},[scene]);
  useEffect(()=>{heroRef.current=hero;},[hero]);
  useEffect(()=>{skinRef.current=skin;},[skin]);
  useEffect(()=>{worldRef.current=world;},[world]);

  const apply=useCallback((next:WorldDoc)=>{
    undoRef.current=[...undoRef.current.slice(-19),worldRef.current];
    worldRef.current=next;dirtyRef.current=true;setWorld(next);setDirty(true);
    try{localStorage.setItem(bucket,JSON.stringify(next));localStorage.setItem(bucket+":dirty","1");}
    catch{toast.error("No se pudo guardar la versión local");}
  },[bucket]);
  const undo=()=>{
    const previous=undoRef.current.pop();
    if(!previous)return;
    worldRef.current=previous;dirtyRef.current=true;setDirty(true);setWorld(previous);
    try{localStorage.setItem(bucket,JSON.stringify(previous));localStorage.setItem(bucket+":dirty","1");}catch{}
  };

  const loadRemote=useCallback(async()=>{
    if(!couple?.coupleId)return;
    try{
      const {data,error}=await supabase.from("couple_worlds" as any)
        .select("world,updated_at").eq("couple_id",couple.coupleId).maybeSingle();
      if(error)throw error;
      const row=data as {world:unknown;updated_at:string}|null;
      if(row){
        const remote=parseWorld(row.world);
        if(dirtyRef.current){
          if(savedVersion.current!==row.updated_at){
            pendingRemote.current={world:remote,updated_at:row.updated_at};
            setConflict(true);
          }
        }else{
          pendingRemote.current=null;
          worldRef.current=remote;setWorld(remote);
          baseRef.current=remote;
          savedVersion.current=row.updated_at;setRemoteVersion(row.updated_at);
          setConflict(false);
          try{localStorage.setItem(bucket,JSON.stringify(remote));localStorage.setItem(bucket+":base",JSON.stringify(remote));localStorage.setItem(bucket+":version",row.updated_at);localStorage.setItem(bucket+":dirty","0");}catch{}
        }
      }
      setStatus("ready");
    }catch{setStatus("local");}
  },[couple?.coupleId,bucket]);

  useEffect(()=>{
    if(!user)return;
    let next=initialWorld(),lastVersion:string|null=null,isDirty=false;
    try{
      const cached=localStorage.getItem(bucket);
      if(cached)next=parseWorld(JSON.parse(cached));
      const base=localStorage.getItem(bucket+":base");
      baseRef.current=base?parseWorld(JSON.parse(base)):initialWorld();
      lastVersion=localStorage.getItem(bucket+":version");
      isDirty=!!cached&&(localStorage.getItem(bucket+":dirty")==="1"||!lastVersion);
    }catch{baseRef.current=initialWorld();}
    worldRef.current=next;setWorld(next);
    dirtyRef.current=isDirty;setDirty(isDirty);setConflict(false);
    pendingRemote.current=null;
    savedVersion.current=lastVersion;setRemoteVersion(lastVersion);undoRef.current=[];
    try{const saved=localStorage.getItem("ne-world-skin-"+user.id) as Skin | null;
      if(saved&&skins.some(v=>v.id===saved))setSkin(saved);
    }catch{}
    setStatus(couple?.coupleId?"connecting":"local");
    if(couple?.coupleId)void loadRemote();
  },[user?.id,couple?.coupleId,bucket,loadRemote]);

  // Load partner's presence through a table restricted by couple membership RLS.
  useEffect(()=>{
    if(!user||!couple?.coupleId)return;
    let active=true;
    const refresh=async()=>{
      if(!active||!couple.partnerId)return;
      try{
        const {data,error}=await supabase.from("couple_world_players" as any)
          .select("user_id,x,y,scene,skin,name,updated_at")
          .eq("couple_id",couple.coupleId).eq("user_id",couple.partnerId).maybeSingle();
        if(error||!active)return;
        const p=data as {user_id:string;x:number;y:number;scene:string;skin:string;name:string;updated_at:string}|null;
        if(!p||Date.now()-Date.parse(p.updated_at)>20000||!["home","garden"].includes(p.scene)){setPartner(undefined);return;}
        setPartner({id:p.user_id,x:p.x,y:p.y,scene:p.scene as Scene,
          skin:skins.find(s=>s.id===p.skin)?.id??"mint",name:p.name,updated_at:p.updated_at});
      }catch{}
    };
    const presence=async()=>{
      if(!active||document.visibilityState!=="visible")return;
      try{
        const pos=heroRef.current;
        await supabase.from("couple_world_players" as any).upsert({
          couple_id:couple.coupleId,user_id:user.id,x:pos.x,y:pos.y,
          scene:sceneRef.current,skin:skinRef.current,name:"Mi amor"
        } as any,{onConflict:"couple_id,user_id"});
      }catch{}
    };
    const channel=supabase.channel("couple-world-db-"+couple.coupleId);
    channel.on("postgres_changes",{event:"*",schema:"public",table:"couple_world_players",filter:"couple_id=eq."+couple.coupleId},()=>void refresh());
    channel.on("postgres_changes",{event:"*",schema:"public",table:"couple_worlds",filter:"couple_id=eq."+couple.coupleId},()=>void loadRemote());
    channel.subscribe();
    void refresh();void presence();
    const handle=setInterval(()=>{void presence();void refresh();},4000);
    const onVisible=()=>{if(document.visibilityState==="visible"){void refresh();void loadRemote();void presence();}};
    document.addEventListener("visibilitychange",onVisible);
    return()=>{active=false;clearInterval(handle);void supabase.removeChannel(channel);document.removeEventListener("visibilitychange",onVisible);};
  },[user?.id,couple?.coupleId,couple?.partnerId,loadRemote]);

  const step=useCallback((dx:number,dy:number)=>{
    const next={x:heroRef.current.x+dx,y:heroRef.current.y+dy};
    const map=sceneRef.current==="garden"?worldRef.current.garden:worldRef.current.home;
    if(!canWalk(sceneRef.current,next.x,next.y,map))return false;
    heroRef.current=next;setHero(next);setSteps(n=>n+1);return true;
  },[]);
  const stop=()=>{walkingRef.current=[];if(timer.current){clearInterval(timer.current);timer.current=null;}};
  const visit=useCallback((p:Point)=>{
    const area=sceneRef.current,map=area==="garden"?worldRef.current.garden:worldRef.current.home;
    if(!canWalk(area,p.x,p.y,map))return;
    walkingRef.current=findPath(area,heroRef.current,p,map);
    if(timer.current)clearInterval(timer.current);
    timer.current=setInterval(()=>{
      const next=walkingRef.current.shift();
      if(!next){if(timer.current)clearInterval(timer.current);timer.current=null;return;}
      heroRef.current=next;setHero(next);setSteps(n=>n+1);
    },120);
  },[]);
  useEffect(()=>()=>{if(timer.current)clearInterval(timer.current);},[]);
  const changeScene=()=>{
    stop();const next=sceneRef.current==="garden"?"home":"garden";
    sceneRef.current=next;setScene(next);
    const spawn=next==="garden"?outsideSpawn:insideSpawn;
    heroRef.current=spawn;setHero(spawn);
  };
  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{
      if(event.repeat && editing)return;
      if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement&&event.target.isContentEditable))return;
      const key=event.key.toLowerCase();
      const direction:Record<string,[number,number]>={
        arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],
        arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],
      };
      if(direction[key]){event.preventDefault();stop();step(...direction[key]);}
      if(key==="e"&&needsDoor(sceneRef.current,heroRef.current)){event.preventDefault();changeScene();}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[step,editing]);
  const clickTile=(p:Point)=>{
    if(editing){
      if(!canPlace(scene,p.x,p.y,selected)){toast.info("Ese objeto no cabe aquí");return;}
      if(hero.x===p.x&&hero.y===p.y){toast.info("Muévete antes de decorar esa casilla");return;}
      const existing=worldRef.current[scene],next={...existing};
      if(next[pointKey(p.x,p.y)]===selected)delete next[pointKey(p.x,p.y)];
      else next[pointKey(p.x,p.y)]=selected;
      apply({...worldRef.current,[scene]:next});return;
    }
    if(scene==="garden"&&p.x>=10&&p.x<=17&&p.y>=6&&p.y<=12){
      if(needsDoor(scene,heroRef.current))changeScene();
      else toast.info("Acércate a la puerta y pulsa E para entrar");
      return;
    }
    visit(p);
  };
  const save=async()=>{
    if(!user||!couple?.coupleId){toast.info("Vincula a tu pareja para guardar el mundo en común");return;}
    setSaving(true);
    try{
      const payload={couple_id:couple.coupleId,world:worldRef.current,updated_by:user.id};
      const table=supabase.from("couple_worlds" as any);
      const {data,error}=remoteVersion
        ? await table.update({world:payload.world,updated_by:user.id} as any)
          .eq("couple_id",couple.coupleId).eq("updated_at",remoteVersion)
          .select("updated_at").maybeSingle()
        : await table.insert(payload as any).select("updated_at").maybeSingle();
      if(error)throw error;
      if(!data){setConflict(true);toast.error("Tu pareja guardó otra versión. Guarda una copia local antes de recargar.");return;}
      const version=(data as {updated_at:string}).updated_at;
      savedVersion.current=version;setRemoteVersion(version);dirtyRef.current=false;
      baseRef.current=worldRef.current;pendingRemote.current=null;
      try{localStorage.setItem(bucket+":version",version);localStorage.setItem(bucket+":base",JSON.stringify(worldRef.current));localStorage.setItem(bucket+":dirty","0");}catch{}
      setDirty(false);setConflict(false);setStatus("ready");toast.success("Mundo guardado para los dos");
    }catch{
      setStatus("local");toast.error("No se pudo sincronizar con el servidor. La versión local se conserva.");
    }finally{setSaving(false);}
  };
  const exportBackup=()=>{
    const blob=new Blob([JSON.stringify(worldRef.current,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="nuestro-mundo-respaldo.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const combineChanges=()=>{
    const latest=pendingRemote.current;
    if(!latest)return;
    const {merged,conflicts}=mergeWorlds(baseRef.current,worldRef.current,latest.world);
    if(conflicts.length){
      toast.info("Se combinaron los cambios. En "+conflicts.length+" casilla(s) disputadas se conservaron los tuyos.");
    }else toast.success("Se unieron los cambios de ambos.");
    baseRef.current=latest.world;worldRef.current=merged;setWorld(merged);
    savedVersion.current=latest.updated_at;setRemoteVersion(latest.updated_at);
    pendingRemote.current=null;setConflict(false);dirtyRef.current=true;setDirty(true);
    try{
      localStorage.setItem(bucket,JSON.stringify(merged));
      localStorage.setItem(bucket+":base",JSON.stringify(latest.world));
      localStorage.setItem(bucket+":version",latest.updated_at);
      localStorage.setItem(bucket+":dirty","1");
    }catch{}
  };
  const chooseSkin=(skin:Skin)=>{
    skinRef.current=skin;setSkin(skin);
    try{if(user)localStorage.setItem("ne-world-skin-"+user.id,skin);}catch{}
  };
  const options=ITEMS.filter(item=>item.scene==="both"||item.scene===scene);
  return <main className="mx-auto max-w-6xl space-y-5 pb-16">
    <section className="surface warm-gradient flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
      <div><p className="text-xs uppercase tracking-[.25em] text-primary">Un pequeño universo para dos</p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl sm:text-5xl"><Heart className="size-8 fill-primary/20 text-primary"/>Nuestro Mundo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Caminen, decoren su casa y creen recuerdos en su propio mundo pixel art.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to="/libro"><BookHeart className="mr-2 size-4"/>Álbum de recuerdos</Link></Button>
        <Button disabled={saving||!dirty} onClick={()=>void save()}><Save className="mr-2 size-4"/>{saving?"Guardando…":dirty?"Guardar cambios":"Guardado"}</Button>
      </div>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">{world.name || "Nuestro rincón"}</span>
        <span className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">{scene==="garden"?"🌷 Jardín":"🏠 Casa"}</span>
        <span className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">{steps} pasos</span></div>
      <span role="status" className="text-xs text-muted-foreground">{formatStatus(status)}{partner&&partner.scene===scene?" · Tu pareja está aquí":""}</span>
    </div>
    {conflict && <div role="alert" className="space-y-2 rounded-xl border border-amber-400/40 bg-amber-100/10 p-4 text-sm">
      <p><strong>Hay cambios en otro dispositivo.</strong> Tu versión local está protegida. Puedes guardar una copia y combinar las decoraciones de ambos.</p>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={exportBackup}>Descargar respaldo</Button><Button size="sm" onClick={combineChanges}>Combinar cambios</Button></div>
    </div>}
    <div className="relative rounded-[1.5rem] border border-border bg-[#2b3741] p-2 shadow-xl sm:p-4">
      <WorldCanvas scene={scene} hero={hero} skin={skin} partner={partner?.scene===scene?{id:partner.id,x:partner.x,y:partner.y,skin:partner.skin,name:partner.name}:undefined}
        decor={decor} editing={editing} night={night} onTile={clickTile}/>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
        <span>WASD / flechas: moverte · Toca el mapa: caminar · E: entrar o salir</span>
        <span>{partner?.scene===scene?"💗 Los dos en el mismo lugar":"🌿 Explora a tu ritmo"}</span>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <section className="surface space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="size-5 text-primary"/>Tu mundo, tus reglas</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={()=>setNight(x=>!x)}>{night?<Sun className="mr-1 size-4"/>:<Moon className="mr-1 size-4"/>}{night?"Día":"Noche"}</Button>
            <Button size="sm" variant={editing?"default":"outline"} onClick={()=>{stop();setEditing(x=>!x);}}>{editing?<Check className="mr-1 size-4"/>:<Sparkles className="mr-1 size-4"/>}{editing?"Listo":"Decorar"}</Button>
          </div>
        </div>
        {editing ? <><div className="flex flex-wrap gap-2" role="group" aria-label="Muebles y decoraciones">
          {options.map(item=><button type="button" key={item.id} onClick={()=>setSelected(item.id)} title={item.name} aria-pressed={selected===item.id}
            className={"flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:scale-[1.03] "+(selected===item.id?"border-primary bg-primary/15":"border-border bg-background")}>
              <span aria-hidden="true" className="text-lg">{item.icon}</span>{item.name}
            </button>)}
          </div><div className="flex justify-between gap-2 text-xs text-muted-foreground"><span>Toca el mapa para colocar o retirar el objeto seleccionado.</span><Button size="sm" variant="ghost" disabled={!undoRef.current.length} onClick={undo}><Undo2 className="mr-1 size-4"/>Deshacer</Button></div></> :
          <p className="text-sm text-muted-foreground">Entra a la casa desde la puerta del jardín. Decora su interior, crea un pequeño parque o prepara un rincón para sus recuerdos.</p>}
        <label className="block max-w-sm text-sm font-medium">Nombre de su mundo
          <input type="text" maxLength={48} value={world.name} onChange={event=>apply({...worldRef.current,name:event.target.value})}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"/>
        </label>
        <div><p className="mb-2 text-sm font-medium">Personaliza tu personaje</p>
          <div className="flex flex-wrap gap-2">{skins.map(option=><button key={option.id} type="button" title={option.label} aria-label={"Atuendo "+option.label}
            aria-pressed={skin===option.id} onClick={()=>chooseSkin(option.id)}
            className={"flex size-11 items-center justify-center rounded-xl border-2 "+(skin===option.id?"border-primary":"border-border")}
            ><span className="size-6 rounded-lg shadow-sm" style={{backgroundColor:option.color}}/></button>)}</div>
        </div>
      </section>
      <aside className="surface flex flex-col items-center justify-center gap-3 p-5">
        <div className="flex gap-2"><Button variant="outline" onClick={changeScene}><DoorOpen className="mr-2 size-4"/>{scene==="garden"?"Entrar a casa":"Volver al jardín"}</Button></div>
        <p className="text-xs text-muted-foreground">Controles táctiles</p>
        <div className="grid grid-cols-3 gap-2">
          <span/><Button size="icon" variant="outline" aria-label="Arriba" onClick={()=>{stop();step(0,-1);}}><ArrowUp/></Button><span/>
          <Button size="icon" variant="outline" aria-label="Izquierda" onClick={()=>{stop();step(-1,0);}}><ArrowLeft/></Button>
          <Button size="icon" variant="outline" aria-label="Centro" onClick={()=>{stop();const spawn=scene==="garden"?outsideSpawn:insideSpawn;heroRef.current=spawn;setHero(spawn);}}><RotateCcw/></Button>
          <Button size="icon" variant="outline" aria-label="Derecha" onClick={()=>{stop();step(1,0);}}><ArrowRight/></Button>
          <span/><Button size="icon" variant="outline" aria-label="Abajo" onClick={()=>{stop();step(0,1);}}><ArrowDown/></Button><span/>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="size-4"/>{couple?.partnerId?"Espacio vinculado":"Vincula a tu pareja en Ajustes"}</div>
      </aside>
    </div>
    <p className="text-center text-xs text-muted-foreground">Tu jardín siempre se guarda en este dispositivo. Para verlo desde dos dispositivos, despliega la migración SQL y utiliza «Guardar cambios».</p>
  </main>;
}
