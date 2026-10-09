import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Heart, List, Palette } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSignedUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";

export type AlbumStory = {
  id:string; kind:"cover"|"photo"|"milestone"|"note"|"event"|"dedication"|"song";
  title:string; text:string; date?:string; path?:string; favorite?:boolean;
};
type Props = {stories:AlbumStory[]; names:string; year:number};
type Filter="todo"|"photo"|"note"|"milestone"|"dedication";
const cats:{id:Filter;name:string}[]=[
  {id:"todo",name:"Todo"},{id:"photo",name:"Fotos"},
  {id:"note",name:"Cartas y notas"},{id:"milestone",name:"Fechas"},
  {id:"dedication",name:"Dedicatorias"}
];
const textFor:Record<AlbumStory["kind"],string>={
  cover:"Portada",photo:"Fotografía",milestone:"Momento especial",note:"Una nota",
  event:"Plan juntos",dedication:"Dedicatoria",song:"Nuestra canción"
};
function PrivatePhoto({path,title}:{path:string;title:string}){
  const {data:url,isLoading}=useSignedUrl(path);
  return <div className="mx-auto w-full max-w-lg rotate-[-1deg] rounded-[1.1rem] bg-white p-3 pb-8 shadow-2xl">
    {url?<img src={url} alt={title} className="max-h-[440px] w-full rounded-md object-contain" loading="lazy"/>:
      <div role="status" className="flex aspect-[4/3] items-center justify-center bg-[#eedcdb] text-sm text-[#755968]">{isLoading?"Cargando fotografía privada…":"No se pudo cargar la fotografía"}</div>}
  </div>;
}
type Theme = "rose"|"lavender"|"parchment";
const themes:{id:Theme;name:string;background:string}[]=[
  {id:"rose",name:"Rosado",background:"#fff8ef"},
  {id:"lavender",name:"Lavanda",background:"#f8f2ff"},
  {id:"parchment",name:"Clásico",background:"#fff5df"},
];
export function AlbumFlipbook({stories,names,year}:Props){
  const {user}=useAuth();
  const storageKey="ne-album-cover-"+(user?.id??"guest")+"-"+year;
  const [coverTitle,setCoverTitle]=useState("Nuestro álbum");
  const [coverSubtitle,setCoverSubtitle]=useState("Una historia escrita con pequeños momentos que queremos recordar.");
  const [theme,setTheme]=useState<Theme>("rose");
  const [editingCover,setEditingCover]=useState(false);
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(storageKey);
      if(!raw){setCoverTitle("Nuestro álbum");setCoverSubtitle("Una historia escrita con pequeños momentos que queremos recordar.");setTheme("rose");return;}
      const prefs=JSON.parse(raw) as {title?:string;subtitle?:string;theme?:Theme};
      setCoverTitle(typeof prefs.title==="string"?prefs.title.slice(0,80):"Nuestro álbum");
      setCoverSubtitle(typeof prefs.subtitle==="string"?prefs.subtitle.slice(0,240):"");
      setTheme(themes.some(t=>t.id===prefs.theme)?prefs.theme!:"rose");
    }catch{}
  },[storageKey]);
  const saveCover=(data:{title:string;subtitle:string;theme:Theme})=>{
    setCoverTitle(data.title);setCoverSubtitle(data.subtitle);setTheme(data.theme);
    try{localStorage.setItem(storageKey,JSON.stringify(data));}catch{}
  };

  const [filter,setFilter]=useState<Filter>("todo");
  const [favorites,setFavorites]=useState(false);
  const [index,setIndex]=useState(0);
  const [indexOpen,setIndexOpen]=useState(false);
  const filtered=useMemo(()=>stories.filter(s=>s.kind==="cover" ||
    ((filter==="todo" || s.kind===filter || (filter==="milestone"&&s.kind==="event")) &&
    (!favorites || (s.kind==="photo" && s.favorite)))),[stories,filter,favorites]);
  const bounded=Math.min(index,Math.max(0,filtered.length-1));
  const story=filtered[bounded];
  useEffect(()=>{setIndex(0);},[year,filter,favorites]);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement)return;
      if(e.key==="ArrowRight")setIndex(i=>Math.min(filtered.length-1,i+1));
      if(e.key==="ArrowLeft")setIndex(i=>Math.max(0,i-1));
    };
    window.addEventListener("keydown",key);
    return()=>window.removeEventListener("keydown",key);
  },[filtered.length]);
  if(!story)return <div className="surface p-8 text-center">Todavía no hay recuerdos para mostrar.</div>;
  const date=story.date?new Date(story.date).toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"}):"";
  return <section className="mx-auto max-w-5xl space-y-5 print:hidden" aria-label="Álbum de recuerdos interactivo">
    <style>{"@keyframes pageAppear{0%{opacity:.15;transform:perspective(900px) rotateY(-13deg) translateY(9px)}100%{opacity:1;transform:perspective(900px) rotateY(0) translateY(0)}}@media(prefers-reduced-motion:reduce){[style*=pageAppear]{animation:none!important}}"}</style>
    <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar álbum">
        {cats.map(cat=><Button size="sm" key={cat.id} variant={filter===cat.id?"default":"outline"} onClick={()=>setFilter(cat.id)}>{cat.name}</Button>)}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={favorites?"default":"outline"} onClick={()=>setFavorites(v=>!v)}><Heart className="mr-1 size-4"/>Favoritas</Button>
        <Button size="sm" variant="outline" onClick={()=>setEditingCover(v=>!v)}><Palette className="mr-1 size-4"/>Portada</Button>
        <Button size="sm" variant="outline" onClick={()=>setIndexOpen(v=>!v)}><List className="mr-1 size-4"/>Índice</Button>
      </div>
    </div>
    {editingCover&&<div className="surface grid gap-3 p-4 sm:grid-cols-2">
      <label className="text-sm">Título de portada<input maxLength={80} value={coverTitle}
        onChange={e=>saveCover({title:e.target.value,subtitle:coverSubtitle,theme})}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"/></label>
      <label className="text-sm">Dedicatoria<input maxLength={240} value={coverSubtitle}
        onChange={e=>saveCover({title:coverTitle,subtitle:e.target.value,theme})}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"/></label>
      <fieldset className="flex flex-wrap gap-2 sm:col-span-2"><legend className="mb-2 text-sm">Color de portada</legend>
        {themes.map(t=><button type="button" key={t.id} onClick={()=>saveCover({title:coverTitle,subtitle:coverSubtitle,theme:t.id})}
          aria-pressed={theme===t.id} className={"rounded-xl border px-4 py-2 text-sm "+(theme===t.id?"border-primary ring-2 ring-primary/30":"border-border")}
          style={{background:t.background,color:"#583d4b"}}>{t.name}</button>)}
      </fieldset>
      <p className="text-xs text-muted-foreground sm:col-span-2">La portada se conserva en este dispositivo.</p>
    </div>}
    {indexOpen&&<div className="surface grid max-h-48 gap-1 overflow-y-auto p-3 sm:grid-cols-2">
      {filtered.map((s,i)=><button key={s.id} onClick={()=>{setIndex(i);setIndexOpen(false);}}
        className={"rounded-xl p-2 text-left text-sm hover:bg-primary/10 "+(i===bounded?"bg-primary/15 text-primary":"")}>
          {i+1}. {s.title.slice(0,65)}
        </button>)}
    </div>}
    <div className="relative overflow-hidden rounded-[1.6rem] border border-[#e6bdb7] bg-[#ead3c9] p-3 shadow-xl sm:p-8">
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-[#9d637d] via-[#f3c8cb] to-[#9d637d]"/>
      <div key={story.id} className="relative flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-2xl border border-[#dfb4b4] p-5 text-center shadow-inner sm:min-h-[545px] sm:p-9"
        style={{animation:"pageAppear .43s ease both",backgroundColor:themes.find(t=>t.id===theme)?.background??"#fff8ef"}}>
        <div className="pointer-events-none absolute left-5 top-5 text-3xl opacity-30" aria-hidden="true">✿</div>
        <div className="pointer-events-none absolute bottom-5 right-5 text-3xl opacity-30" aria-hidden="true">✿</div>
        <p className="text-xs font-semibold uppercase tracking-[.3em] text-[#a15c78]">{textFor[story.kind]} · {year}</p>
        {story.kind==="cover"?<>
          <BookOpen className="size-16 text-[#a15c78] sm:size-20"/>
          <p className="text-sm tracking-[.2em] text-[#997888]">{coverTitle || "NUESTRO ÁLBUM"}</p>
          <h2 className="max-w-2xl font-display text-4xl font-semibold text-[#553c4c] sm:text-6xl">{names}</h2>
          <p className="text-[#816976]">{coverSubtitle}</p>
        </>:<>
          {story.path&&<PrivatePhoto path={story.path} title={story.title}/>}
          {!story.path && <div className="flex size-16 items-center justify-center rounded-full bg-[#f3d8dd]"><Heart className="size-9 text-[#ad6d85]"/></div>}
          <h2 className="max-w-2xl font-display text-2xl font-semibold text-[#583d4b] sm:text-4xl">{story.title}</h2>
          <p className="max-h-72 max-w-xl overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-[#6c5461] sm:text-base">{story.text}</p>
          {date&&<p className="text-xs uppercase tracking-wider text-[#9e7288]">{date}</p>}
        </>}
        <p className="absolute bottom-3 text-xs text-[#9c7887]">{bounded+1} / {filtered.length}</p>
      </div>
    </div>
    <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
      <Button disabled={bounded===0} variant="outline" onClick={()=>setIndex(i=>Math.max(0,i-1))}><ChevronLeft className="mr-1 size-4"/>Anterior</Button>
      <div className="min-w-[100px] flex-1 text-center">
        <p role="status" className="text-xs font-semibold">{bounded+1} de {filtered.length}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-all" style={{width:(bounded+1)/filtered.length*100+"%"}}/></div>
      </div>
      <Button disabled={bounded>=filtered.length-1} variant="outline" onClick={()=>setIndex(i=>Math.min(filtered.length-1,i+1))}>Siguiente<ChevronRight className="ml-1 size-4"/></Button>
    </div>
    <p className="text-center text-xs text-muted-foreground">Usa las flechas del teclado o los botones para pasar páginas. Las fotos son privadas y se cargan mediante enlaces temporales de tu cuenta.</p>
  </section>;
}
