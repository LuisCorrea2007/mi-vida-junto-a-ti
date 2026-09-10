import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarHeart,
  Flame,
  Heart,
  Hourglass,
  Images,
  Laugh,
  Loader2,
  Mail,
  MessageCircleHeart,
  Music,
  NotebookPen,
  Quote,
  Search,
  Star,
  Stars,
  Video,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Result = {
  kind: string;
  label: string;
  icon: typeof NotebookPen;
  id: string;
  title: string;
  sub?: string | null;
  to: string;
};

const KIND_ORDER = [
  "Notas",
  "Dedicatorias",
  "Fotos",
  "Videos",
  "Citas",
  "Deseos",
  "Diversión",
  "Canciones",
  "Frases",
  "Cápsulas",
  "Retos",
  "Diario",
  "Consejero",
];

async function searchAll(q: string): Promise<Result[]> {
  const like = `%${q}%`;
  const [
    notes,
    deds,
    photos,
    videos,
    events,
    wishes,
    fun,
    songs,
    quotes,
    capsules,
    challenges,
    milestones,
    advisorThreads,
  ] = await Promise.all([
    supabase.from("notes").select("id, title, category").ilike("title", like).limit(6),
    supabase.from("dedications").select("id, title, kind").ilike("title", like).limit(6),
    supabase.from("photos").select("id, caption").ilike("caption", like).limit(6),
    supabase.from("videos_diarios").select("id, titulo").ilike("titulo", like).limit(6),
    supabase.from("events").select("id, title, date").ilike("title", like).limit(6),
    supabase.from("wishes").select("id, title").ilike("title", like).limit(6),
    supabase.from("fun_items").select("id, content, category").ilike("content", like).limit(6),
    supabase.from("songs").select("id, title, artist").ilike("title", like).limit(6),
    supabase.from("quotes").select("id, content, author").ilike("content", like).limit(6),
    supabase.from("time_capsules").select("id, title, open_at").ilike("title", like).limit(6),
    supabase.from("challenges").select("id, title, description").ilike("title", like).limit(6),
    supabase.from("milestones").select("id, title, date").ilike("title", like).limit(6),
    supabase.from("advisor_threads").select("id, title, is_shared").ilike("title", like).limit(6),
  ]);
  const out: Result[] = [];
  for (const n of notes.data ?? [])
    out.push({ kind: "Notas", label: "Nota", icon: NotebookPen, id: n.id, title: n.title, to: `/notas/${n.id}` });
  for (const d of deds.data ?? [])
    out.push({ kind: "Dedicatorias", label: "Dedicatoria", icon: Mail, id: d.id, title: d.title, to: `/dedicatorias#ded-${d.id}` });
  for (const p of photos.data ?? [])
    out.push({ kind: "Fotos", label: "Foto", icon: Images, id: p.id, title: p.caption ?? "Foto", to: `/galeria?foto=${p.id}` });
  for (const v of videos.data ?? [])
    out.push({ kind: "Videos", label: "Video", icon: Video, id: v.id, title: v.titulo, to: `/videos#video-${v.id}` });
  for (const e of events.data ?? [])
    out.push({
      kind: "Citas",
      label: "Cita",
      icon: CalendarHeart,
      id: e.id,
      title: e.title,
      sub: new Date(`${e.date}T00:00:00`).toLocaleDateString("es", { day: "numeric", month: "long" }),
      to: `/calendario#${e.id}`,
    });
  for (const w of wishes.data ?? [])
    out.push({ kind: "Deseos", label: "Deseo", icon: Stars, id: w.id, title: w.title, to: `/deseos#${w.id}` });
  for (const f of fun.data ?? [])
    out.push({
      kind: "Diversión",
      label: "Diversión",
      icon: Laugh,
      id: f.id,
      title: f.content.slice(0, 60),
      to: `/diversion#fun-${f.id}`,
    });
  for (const s of songs.data ?? [])
    out.push({
      kind: "Canciones",
      label: "Canción",
      icon: Music,
      id: s.id,
      title: s.title,
      sub: s.artist,
      to: `/canciones#${s.id}`,
    });
  for (const q of quotes.data ?? [])
    out.push({
      kind: "Frases",
      label: "Frase",
      icon: Quote,
      id: q.id,
      title: q.content.slice(0, 70),
      sub: q.author,
      to: `/canciones#quote-${q.id}`,
    });
  for (const cap of capsules.data ?? [])
    out.push({
      kind: "Cápsulas",
      label: "Cápsula",
      icon: Hourglass,
      id: cap.id,
      title: cap.title,
      sub: new Date(cap.open_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }),
      to: `/capsulas#${cap.id}`,
    });
  for (const challenge of challenges.data ?? [])
    out.push({
      kind: "Retos",
      label: "Reto",
      icon: Flame,
      id: challenge.id,
      title: challenge.title,
      sub: challenge.description,
      to: `/retos#${challenge.id}`,
    });
  for (const milestone of milestones.data ?? [])
    out.push({
      kind: "Diario",
      label: "Momento",
      icon: Heart,
      id: milestone.id,
      title: milestone.title,
      sub: new Date(`${milestone.date}T00:00:00`).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }),
      to: `/diario#${milestone.id}`,
    });
  for (const thread of advisorThreads.data ?? [])
    out.push({
      kind: "Consejero",
      label: thread.is_shared ? "Charla compartida" : "Charla privada",
      icon: MessageCircleHeart,
      id: thread.id,
      title: thread.title,
      to: `/consejero/${thread.id}`,
    });
  return out;
}

async function loadFavorites(): Promise<Result[]> {
  const [notes, photos, deds] = await Promise.all([
    supabase.from("notes").select("id, title").eq("is_favorite", true).limit(10),
    supabase.from("photos").select("id, caption").eq("is_favorite", true).limit(10),
    supabase.from("dedications").select("id, title").eq("is_favorite", true).limit(10),
  ]);
  const out: Result[] = [];
  for (const n of notes.data ?? [])
    out.push({ kind: "Notas", label: "Nota", icon: NotebookPen, id: n.id, title: n.title, to: `/notas/${n.id}` });
  for (const d of deds.data ?? [])
    out.push({ kind: "Dedicatorias", label: "Dedicatoria", icon: Mail, id: d.id, title: d.title, to: `/dedicatorias#ded-${d.id}` });
  for (const p of photos.data ?? [])
    out.push({ kind: "Fotos", label: "Foto", icon: Images, id: p.id, title: p.caption ?? "Foto", to: `/galeria?foto=${p.id}` });
  return out;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: results, isFetching } = useQuery({
    queryKey: ["buscar", q],
    enabled: open,
    queryFn: () => (q.trim() ? searchAll(q.trim()) : loadFavorites()),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    for (const r of results ?? []) {
      map.set(r.kind, [...(map.get(r.kind) ?? []), r]);
    }
    return KIND_ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)!] as const);
  }, [results]);

  function go(r: Result) {
    setOpen(false);
    setQ("");
    navigate({ href: r.to });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full transition-transform hover:scale-110"
        aria-label="Buscar en todo"
        onClick={() => setOpen(true)}
      >
        <Search className="size-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-4 max-w-lg translate-y-0 p-0 sm:top-[15%]">
          <DialogTitle className="sr-only">Buscar</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            {isFetching ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Search className="size-4 text-muted-foreground" />
            )}
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca en todo su espacio…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Limpiar">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {!q.trim() && (
              <p className="flex items-center gap-1.5 px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" /> Sus favoritos
              </p>
            )}
            {grouped.length === 0 && !isFetching && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {q.trim() ? `Nada encontrado para “${q}”.` : "Aún no hay favoritos."}
              </p>
            )}
            {grouped.map(([kind, items]) => (
              <div key={kind} className="mb-1">
                {q.trim() && (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {kind}
                  </p>
                )}
                {items.map((r) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    onClick={() => go(r)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent",
                    )}
                  >
                    <r.icon className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      {r.sub && <span className="text-xs text-muted-foreground">{r.sub}</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{r.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
