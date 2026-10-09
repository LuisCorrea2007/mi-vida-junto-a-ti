import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clapperboard, Dices, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pelis")({
  head: () => ({
    meta: [
      { title: "Noche de pelis — Nuestro Espacio" },
      { name: "description", content: "Las películas y series que queremos ver juntos." },
      { property: "og:title", content: "Noche de pelis — Nuestro Espacio" },
      { property: "og:description", content: "Lista compartida de películas y series de la pareja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PelisPage,
});

const KINDS = [
  { value: "pelicula", label: "Película" },
  { value: "serie", label: "Serie" },
  { value: "anime", label: "Anime" },
  { value: "documental", label: "Documental" },
];

type Item = { id: string; user_id: string; title: string; kind: string; platform: string | null; watched: boolean; rating: number | null };

function PelisPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("watchlist");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [kind, setKind] = useState("pelicula");
  const [tab, setTab] = useState<"pendientes" | "vistas">("pendientes");
  const [pick, setPick] = useState<Item | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["watchlist"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("watchlist").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Item[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["watchlist"] });
  const list = useMemo(() => items.filter((i) => (tab === "vistas" ? i.watched : !i.watched)), [items, tab]);

  async function add() {
    if (!title.trim() || !user) return;
    const { error } = await supabase.from("watchlist").insert({ user_id: user.id, title: title.trim(), kind, platform: platform.trim() || null });
    if (error) return toast.error("No se pudo guardar");
    setTitle(""); setPlatform(""); refresh();
  }
  async function patch(id: string, v: Partial<Item>) {
    await supabase.from("watchlist").update(v).eq("id", id);
    refresh();
  }
  function choose() {
    const pending = items.filter((i) => !i.watched);
    if (!pending.length) return toast("Agreguen algo a la lista primero");
    setPick(pending[Math.floor(Math.random() * pending.length)]!);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Vida juntos</p>
          <h1 className="font-display text-3xl font-semibold">Noche de pelis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lo que queremos ver abrazados en el sofá.</p>
        </div>
        <Button variant="outline" onClick={choose}><Dices className="size-4" /> Elegir por nosotros</Button>
      </header>

      {pick && (
        <div className="surface warm-gradient animate-fade-up p-5 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Esta noche vemos</p>
          <p className="mt-2 font-display text-2xl font-semibold">{pick.title}</p>
          {pick.platform && <p className="text-sm text-muted-foreground">en {pick.platform}</p>}
        </div>
      )}

      <section className="surface flex flex-wrap gap-2 p-4">
        <Input className="min-w-48 flex-1" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <Input className="w-40" placeholder="¿Dónde? (Netflix…)" value={platform} onChange={(e) => setPlatform(e.target.value)} />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <Button onClick={add} disabled={!title.trim()}><Plus className="size-4" /> Agregar</Button>
      </section>

      <div className="flex gap-2">
        {(["pendientes", "vistas"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "pendientes" ? `Por ver (${items.filter((i) => !i.watched).length})` : `Vistas (${items.filter((i) => i.watched).length})`}
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <Clapperboard className="mx-auto mb-3 size-8 text-primary" />
          {tab === "pendientes" ? "Agreguen la primera peli para su próxima noche juntos." : "Aún no han marcado ninguna como vista."}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((i) => (
            <li key={i.id} className="surface flex items-center gap-3 p-4">
              <Clapperboard className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">{KINDS.find((k) => k.value === i.kind)?.label}{i.platform ? ` · ${i.platform}` : ""}</p>
                {i.watched && (
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} aria-label={`${n} estrellas`} onClick={() => patch(i.id, { rating: n })}>
                        <Star className={cn("size-4", (i.rating ?? 0) >= n ? "fill-gold text-gold" : "text-muted-foreground")} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" variant={i.watched ? "outline" : "default"} onClick={() => patch(i.id, { watched: !i.watched })}>
                <Check className="size-4" /> {i.watched ? "Por ver" : "La vimos"}
              </Button>
              {i.user_id === user?.id && (
                <Button size="icon" variant="ghost" aria-label="Borrar" onClick={async () => { await supabase.from("watchlist").delete().eq("id", i.id); refresh(); }}><Trash2 className="size-4" /></Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
