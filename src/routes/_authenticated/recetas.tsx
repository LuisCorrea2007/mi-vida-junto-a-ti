import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Clock, Heart, Plus, Search, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/recetas")({
  head: () => ({
    meta: [
      { title: "Cocinamos juntos — Nuestro Espacio" },
      { name: "description", content: "Nuestro recetario: los platos que nos unen en la cocina." },
      { property: "og:title", content: "Cocinamos juntos — Nuestro Espacio" },
      { property: "og:description", content: "Recetario privado de la pareja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecetasPage,
});

const LEVELS = [
  { value: "facil", label: "Sencilla" },
  { value: "media", label: "Con cariño" },
  { value: "dificil", label: "Reto de chef" },
];

type Recipe = {
  id: string;
  user_id: string;
  title: string;
  ingredients: string | null;
  steps: string | null;
  minutes: number | null;
  difficulty: string;
  favorite: boolean;
  cooked_count: number;
  created_at: string;
};

function RecetasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("recipes");
  const [form, setForm] = useState({ title: "", ingredients: "", steps: "", minutes: "", difficulty: "facil" });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Recipe[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["recipes"] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("recipes").insert({
        user_id: user!.id,
        title: form.title.trim(),
        ingredients: form.ingredients.trim() || null,
        steps: form.steps.trim() || null,
        minutes: form.minutes ? Number(form.minutes) : null,
        difficulty: form.difficulty,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Receta guardada en nuestro recetario");
      notifyPartner(user!.id, "Nueva receta para cocinar juntos", form.title.trim(), "/recetas").catch(() => {});
      setForm({ title: "", ingredients: "", steps: "", minutes: "", difficulty: "facil" });
      setOpen(false);
      refresh();
    },
    onError: () => toast.error("No pudimos guardar la receta"),
  });

  async function patch(id: string, values: Partial<Recipe>) {
    const { error } = await supabase.from("recipes").update(values).eq("id", id);
    if (error) toast.error("No se pudo actualizar");
    refresh();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) toast.error("No se pudo borrar");
    refresh();
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter(
      (r) => (!onlyFav || r.favorite) && (!q || `${r.title} ${r.ingredients ?? ""}`.toLowerCase().includes(q)),
    );
  }, [recipes, query, onlyFav]);
  const totalCooked = recipes.reduce((s, r) => s + r.cooked_count, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Vida juntos</p>
          <h1 className="font-display text-3xl font-semibold">Cocinamos juntos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada plato que preparamos a cuatro manos sabe a hogar. {recipes.length} recetas · {totalCooked} veces cocinadas.
          </p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}><Plus className="size-4" /> Nueva receta</Button>
      </header>

      {open && (
        <form
          className="grid gap-3 rounded-3xl border border-border bg-card/60 p-4 backdrop-blur"
          onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) add.mutate(); }}
        >
          <Input placeholder="Nombre del plato" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Ingredientes (uno por línea)" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          <Textarea placeholder="Pasos y secretos del chef" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
          <div className="flex flex-wrap gap-2">
            <Input type="number" min={1} placeholder="Minutos" className="w-28" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
            {LEVELS.map((l) => (
              <Button key={l.value} type="button" size="sm" variant={form.difficulty === l.value ? "default" : "outline"} onClick={() => setForm({ ...form, difficulty: l.value })}>{l.label}</Button>
            ))}
          </div>
          <Button type="submit" disabled={add.isPending || !form.title.trim()}>Guardar receta</Button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar plato o ingrediente" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button variant={onlyFav ? "default" : "outline"} onClick={() => setOnlyFav((v) => !v)}><Heart className="size-4" /> Favoritas</Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <ChefHat className="mx-auto mb-3 size-8 text-primary" />
          Aún no hay recetas. Guarden ese plato que siempre les sale perfecto.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <article key={r.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-card/60 p-4 backdrop-blur transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{r.title}</h2>
                <button aria-label="Favorita" onClick={() => patch(r.id, { favorite: !r.favorite })}>
                  <Heart className={cn("size-5", r.favorite ? "fill-primary text-primary" : "text-muted-foreground")} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {r.minutes && <span className="flex items-center gap-1"><Clock className="size-3.5" /> {r.minutes} min</span>}
                <span>{LEVELS.find((l) => l.value === r.difficulty)?.label}</span>
                <span className="flex items-center gap-1"><Utensils className="size-3.5" /> {r.cooked_count} veces</span>
              </div>
              {expanded === r.id && (
                <div className="space-y-2 text-sm">
                  {r.ingredients && <ul className="list-disc pl-5">{r.ingredients.split("\n").filter(Boolean).map((i, k) => <li key={k}>{i}</li>)}</ul>}
                  {r.steps && <p className="whitespace-pre-wrap text-muted-foreground">{r.steps}</p>}
                </div>
              )}
              <div className="mt-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>{expanded === r.id ? "Ocultar" : "Ver receta"}</Button>
                <Button size="sm" onClick={() => { patch(r.id, { cooked_count: r.cooked_count + 1 }); toast.success("¡Buen provecho, amores!"); }}>La cocinamos</Button>
                {r.user_id === user?.id && (
                  <Button size="icon" variant="ghost" className="ml-auto" aria-label="Borrar" onClick={() => remove(r.id)}><Trash2 className="size-4" /></Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
