import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Flame, Plus, Search, Sparkles, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { CHALLENGE_IDEAS } from "@/lib/romance";
import { pickOfTheDay } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/retos")({
  head: () => ({
    meta: [
      { title: "Retos de pareja — Nuestro Espacio" },
      { name: "description", content: "Pequeñas misiones románticas para cumplir cada día juntos." },
      { property: "og:title", content: "Retos de pareja — Nuestro Espacio" },
      { property: "og:description", content: "Misiones diarias para consentirse." },
    ],
  }),
  component: RetosPage,
});

type Challenge = { id: string; user_id: string; title: string; description: string | null };
type Completion = { id: string; challenge_id: string; user_id: string; day: string };

const today = () => new Date().toISOString().slice(0, 10);

function RetosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("challenges", "challenge_completions");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "pendientes" | "hechos" | "mios">("todos");

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, user_id, title, description")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["challenge_completions"],
    queryFn: async (): Promise<Completion[]> => {
      const { data, error } = await supabase
        .from("challenge_completions")
        .select("id, challenge_id, user_id, day")
        .order("day", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (input: { title: string; description: string | null }) => {
      if (!user) throw new Error("Inicia sesión");
      if (!input.title.trim()) throw new Error("Escribe el reto");
      const { error } = await supabase.from("challenges").insert({
        user_id: user.id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "reto",
          title: "Nuevo reto para nosotros ✨",
          message: input.title.trim(),
          link: "/retos",
        });
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Reto añadido");
      qc.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (challenge: Challenge) => {
      if (!user) throw new Error("Inicia sesión");
      const mine = completions.find(
        (c) => c.challenge_id === challenge.id && c.user_id === user.id && c.day === today(),
      );
      if (mine) {
        const { error } = await supabase.from("challenge_completions").delete().eq("id", mine.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("challenge_completions")
        .insert({ challenge_id: challenge.id, user_id: user.id, day: today() });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "reto",
          title: "¡Cumplí un reto! 🏆",
          message: challenge.title,
          link: "/retos",
        });
      }
      return true;
    },
    onSuccess: (done) => {
      if (done) burst(12);
      qc.invalidateQueries({ queryKey: ["challenge_completions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const idea = pickOfTheDay(CHALLENGE_IDEAS, 1);
  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const myTotal = completions.filter((c) => c.user_id === user?.id).length;
  const partnerTotal = completions.filter((c) => c.user_id !== user?.id).length;

  /** Días seguidos con al menos un reto cumplido por los dos. */
  const streak = (() => {
    const days = new Set(completions.map((c) => c.day));
    let count = 0;
    const cursor = new Date();
    while (days.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const doneToday = (id: string) =>
    completions.some((x) => x.challenge_id === id && x.user_id === user?.id && x.day === today());
  const q = search.trim().toLowerCase();
  const visible = challenges.filter((c) => {
    if (q && !`${c.title} ${c.description ?? ""}`.toLowerCase().includes(q)) return false;
    if (filter === "pendientes") return !doneToday(c.id);
    if (filter === "hechos") return doneToday(c.id);
    if (filter === "mios") return c.user_id === user?.id;
    return true;
  });

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-5 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Misiones de amor</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Retos de pareja</h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5">
            <Flame className="size-4 text-primary" /> {streak} {streak === 1 ? "día" : "días"} de racha
          </span>
          <span className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5">
            <Trophy className="size-4 text-primary" /> Tú {myTotal} · Ella {partnerTotal}
          </span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Crear reto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo reto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ch-title">Reto</Label>
                <Input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ch-desc">Detalle (opcional)</Label>
                <Textarea
                  id="ch-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={create.isPending}
                onClick={() => create.mutate({ title, description })}
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {idea && (
        <section className="surface p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Reto sugerido de hoy</p>
          <p className="mt-3 font-display text-xl">{idea.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            disabled={create.isPending}
            onClick={() => create.mutate({ title: idea.title, description: idea.description })}
          >
            <Sparkles className="mr-2 size-4" /> Añadirlo a nuestros retos
          </Button>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Nuestros retos</h2>
        <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar un reto..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "todos", label: "Todos" },
                { key: "pendientes", label: "Pendientes hoy" },
                { key: "hechos", label: "Cumplidos hoy" },
                { key: "mios", label: "Míos" },
              ] as const
            ).map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{visible.length} de {challenges.length}</p>
        </div>
        {visible.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {visible.map((c) => {
              const mineToday = completions.some(
                (x) => x.challenge_id === c.id && x.user_id === user?.id && x.day === today(),
              );
              const partnerToday = completions.some(
                (x) => x.challenge_id === c.id && x.user_id !== user?.id && x.day === today(),
              );
              const total = completions.filter((x) => x.challenge_id === c.id).length;
              return (
                <li key={c.id} id={c.id} className="surface scroll-mt-24 p-5 target:ring-2 target:ring-primary">
                  <p className="font-display text-lg font-semibold">{c.title}</p>
                  {c.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Propuesto por {nameOf(c.user_id)} · cumplido {total}{" "}
                    {total === 1 ? "vez" : "veces"}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={mineToday ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => toggle.mutate(c)}
                    >
                      <Check className="mr-1 size-4" />
                      {mineToday ? "Cumplido hoy" : "Lo cumplí hoy"}
                    </Button>
                    {partnerToday && (
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
                        Ella también lo hizo hoy 💗
                      </span>
                    )}
                    {c.user_id === user?.id && (
                      <button
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => remove.mutate(c.id)}
                        aria-label="Borrar reto"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="surface p-8 text-center text-sm text-muted-foreground">
            Empiecen con el reto sugerido de hoy.
          </p>
        )}
      </section>
    </div>
  );
}
