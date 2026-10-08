import { useMemo, useState } from "react";
import { Glyph } from "@/components/glyph";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, MapPinned, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/lugares")({
  head: () => ({
    meta: [
      { title: "Nuestros lugares — Nuestro Espacio" },
      { name: "description", content: "Los lugares que queremos conocer y los que ya visitamos juntos." },
      { property: "og:title", content: "Nuestros lugares — Nuestro Espacio" },
      { property: "og:description", content: "Mapa de lugares pendientes y visitados de la pareja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LugaresPage,
});

const KINDS = [
  { value: "restaurante", label: "Restaurante", emoji: "food" },
  { value: "cafe", label: "Café", emoji: "coffee" },
  { value: "viaje", label: "Viaje", emoji: "plane" },
  { value: "naturaleza", label: "Naturaleza", emoji: "nature" },
  { value: "plan", label: "Plan", emoji: "ticket" },
  { value: "otro", label: "Otro", emoji: "star" },
];
const kindOf = (v: string) => KINDS.find((k) => k.value === v) ?? KINDS[5]!;

type Place = {
  id: string;
  user_id: string;
  name: string;
  city: string | null;
  note: string | null;
  kind: string;
  visited: boolean;
  rating: number | null;
  visited_on: string | null;
  created_at: string;
};

function LugaresPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  useRealtime("places");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState("restaurante");
  const [tab, setTab] = useState<"pendientes" | "visitados">("pendientes");
  const [filter, setFilter] = useState("todos");
  const [q, setQ] = useState("");

  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: async (): Promise<Place[]> => {
      const { data, error } = await supabase.from("places").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !name.trim()) return;
      const { error } = await supabase.from("places").insert({
        user_id: user.id,
        name: name.trim(),
        city: city.trim() || null,
        note: note.trim() || null,
        kind,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "lugar",
          title: "Nuevo lugar para ir juntos",
          message: name.trim(),
          link: "/lugares",
        });
      }
    },
    onSuccess: () => {
      setName(""); setCity(""); setNote("");
      qc.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lugar guardado");
    },
    onError: () => toast.error("No se pudo guardar"),
  });

  async function update(id: string, patch: Partial<Place>) {
    const { error } = await supabase.from("places").update(patch).eq("id", id);
    if (error) { toast.error("Solo quien lo agregó puede cambiarlo"); return; }
    qc.invalidateQueries({ queryKey: ["places"] });
  }
  async function remove(id: string) {
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) { toast.error("No se pudo borrar"); return; }
    qc.invalidateQueries({ queryKey: ["places"] });
  }

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return places.filter(
      (p) =>
        p.visited === (tab === "visitados") &&
        (filter === "todos" || p.kind === filter) &&
        (!term || `${p.name} ${p.city ?? ""} ${p.note ?? ""}`.toLowerCase().includes(term)),
    );
  }, [places, tab, filter, q]);

  const visitedCount = places.filter((p) => p.visited).length;
  const pct = places.length ? Math.round((visitedCount / places.length) * 100) : 0;
  const pending = places.filter((p) => !p.visited);

  function randomPick() {
    const p = pending[Math.floor(Math.random() * pending.length)];
    if (!p) { toast("Aún no hay lugares pendientes"); return; }
    toast.success(`¡Vamos a ${p.name}! ${kindOf(p.kind).emoji}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
            <MapPinned className="size-7 text-primary" /> Nuestros lugares
          </h1>
          <p className="text-sm text-muted-foreground">Donde queremos ir y donde ya fuimos felices.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={randomPick}>¿A dónde vamos?</Button>
      </header>

      <div className="rounded-2xl border bg-card/60 p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>{visitedCount} de {places.length} visitados</span>
          <span className="text-primary">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <form
        className="grid gap-3 rounded-2xl border bg-card/60 p-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <Input placeholder="Nombre del lugar" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Ciudad o zona (opcional)" value={city} onChange={(e) => setCity(e.target.value)} />
        <Textarea className="sm:col-span-2" placeholder="¿Por qué queremos ir?" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {KINDS.map((k) => (
            <button type="button" key={k.value} onClick={() => setKind(k.value)}
              className={cn("rounded-full border px-3 py-1 text-xs", kind === k.value && "border-primary bg-primary/15 text-primary")}>
              <Glyph name={k.emoji} /> {k.label}
            </button>
          ))}
        </div>
        <Button type="submit" className="rounded-full sm:col-span-2" disabled={!name.trim() || add.isPending}>
          <Plus className="size-4" /> Agregar lugar
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {(["pendientes", "visitados"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
        <select className="h-9 rounded-full border bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <div className="relative ml-auto w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nada por aquí todavía.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const mine = p.user_id === user?.id;
            const k = kindOf(p.kind);
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.city ?? ""}`)}`;
            return (
              <li key={p.id} className="space-y-2 rounded-2xl border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold"><Glyph name={k.emoji} /> {p.name}</p>
                    {p.city && <p className="text-xs text-muted-foreground">{p.city}</p>}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{mine ? "Tuyo" : "De tu pareja"}</span>
                </div>
                {p.note && <p className="text-sm text-muted-foreground">{p.note}</p>}
                {p.visited && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} disabled={!mine} onClick={() => update(p.id, { rating: n })} aria-label={`${n} estrellas`}>
                        <Star className={cn("size-4", (p.rating ?? 0) >= n ? "fill-primary text-primary" : "text-muted-foreground")} />
                      </button>
                    ))}
                    {p.visited_on && <span className="ml-2 text-[11px] text-muted-foreground">{new Date(p.visited_on + "T12:00").toLocaleDateString("es")}</span>}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-8 rounded-full" asChild>
                    <a href={maps} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" /> Mapa</a>
                  </Button>
                  {mine && (
                    <>
                      <Button size="sm" variant={p.visited ? "outline" : "default"} className="h-8 rounded-full"
                        onClick={() => update(p.id, p.visited ? { visited: false, visited_on: null } : { visited: true, visited_on: new Date().toISOString().slice(0, 10) })}>
                        <Check className="size-3.5" /> {p.visited ? "Pendiente" : "¡Fuimos!"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => remove(p.id)} aria-label="Borrar">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
