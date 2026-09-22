import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PiggyBank, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas juntos — Nuestro Espacio" },
      { name: "description", content: "Sueños con fecha y ahorro compartido: viajes, casa, sorpresas." },
      { property: "og:title", content: "Metas juntos — Nuestro Espacio" },
      { property: "og:description", content: "Planeen sus sueños y guarden el avance del ahorro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MetasPage,
});

type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string;
  target_amount: number | null;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
};
type Contribution = { id: string; goal_id: string; user_id: string; amount: number; note: string | null; created_at: string };

const IDEAS = [
  { emoji: "✈️", title: "Nuestro primer viaje juntos" },
  { emoji: "🏡", title: "Nuestra casa" },
  { emoji: "💍", title: "El anillo" },
  { emoji: "🐶", title: "Adoptar una mascota" },
  { emoji: "🎸", title: "Un concierto de los dos" },
  { emoji: "📷", title: "Una sesión de fotos" },
];

function MetasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("couple_goals", "goal_contributions");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"activas" | "cumplidas">("activas");
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const { data: goals = [] } = useQuery({
    queryKey: ["couple_goals"],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("couple_goals")
        .select("id, user_id, title, description, emoji, target_amount, deadline, is_completed, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Goal[];
    },
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ["goal_contributions"],
    queryFn: async (): Promise<Contribution[]> => {
      const { data, error } = await supabase
        .from("goal_contributions")
        .select("id, goal_id, user_id, amount, note, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Contribution[];
    },
  });

  const savedOf = (id: string) =>
    contributions.filter((c) => c.goal_id === id).reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim()) throw new Error("Escribe qué quieren lograr");
      const { error } = await supabase.from("couple_goals").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        emoji: emoji || "🎯",
        target_amount: target ? Number(target) : null,
        deadline: deadline || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "meta",
          title: "Nueva meta juntos 🎯",
          message: `${emoji} ${title.trim()}`,
          link: "/metas",
        });
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setDescription("");
      setTarget("");
      setDeadline("");
      burst(12);
      toast.success("Meta guardada");
      qc.invalidateQueries({ queryKey: ["couple_goals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addMoney = useMutation({
    mutationFn: async (goal: Goal) => {
      if (!user) throw new Error("Inicia sesión");
      const value = Number(amounts[goal.id]);
      if (!value || value <= 0) throw new Error("Escribe cuánto guardaron");
      const { error } = await supabase
        .from("goal_contributions")
        .insert({ goal_id: goal.id, user_id: user.id, amount: value });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "meta",
          title: "Avanzamos en una meta 💰",
          message: `${goal.emoji} ${goal.title}`,
          link: "/metas",
        });
      }
    },
    onSuccess: (_d, goal) => {
      setAmounts((prev) => ({ ...prev, [goal.id]: "" }));
      burst(10);
      toast.success("¡Un paso más cerca!");
      qc.invalidateQueries({ queryKey: ["goal_contributions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleDone = useMutation({
    mutationFn: async (goal: Goal) => {
      const { error } = await supabase
        .from("couple_goals")
        .update({ is_completed: !goal.is_completed })
        .eq("id", goal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      burst(16);
      qc.invalidateQueries({ queryKey: ["couple_goals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("couple_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Meta borrada");
      qc.invalidateQueries({ queryKey: ["couple_goals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return goals.filter((g) => {
      if (tab === "activas" && g.is_completed) return false;
      if (tab === "cumplidas" && !g.is_completed) return false;
      if (!q) return true;
      return `${g.title} ${g.description ?? ""}`.toLowerCase().includes(q);
    });
  }, [goals, search, tab]);

  const totalSaved = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-5 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Sueños con fecha</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Metas juntos</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Un viaje, una casa, un concierto… anótenlo, pongan cuánto cuesta y vayan guardando de a poco.
        </p>
        <p className="mt-4 text-sm">
          Han guardado <span className="font-semibold text-primary">${totalSaved.toLocaleString("es")}</span> en{" "}
          {goals.length} {goals.length === 1 ? "meta" : "metas"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Nueva meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ideas</Label>
                <div className="flex flex-wrap gap-2">
                  {IDEAS.map((i) => (
                    <button
                      key={i.title}
                      onClick={() => {
                        setTitle(i.title);
                        setEmoji(i.emoji);
                      }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                    >
                      {i.emoji} {i.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-title">¿Qué quieren lograr?</Label>
                <Input id="g-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-desc">Detalles (opcional)</Label>
                <Textarea id="g-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="g-emoji">Emoji</Label>
                  <Input id="g-emoji" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g-target">Cuánto cuesta</Label>
                  <Input id="g-target" type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g-deadline">Para cuándo</Label>
                  <Input id="g-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <Button className="w-full rounded-full" disabled={create.isPending} onClick={() => create.mutate()}>
                Guardar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "activas", label: "En camino" },
              { key: "cumplidas", label: "Cumplidas" },
            ] as const
          ).map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar meta..." />
        </div>
        <p className="text-xs text-muted-foreground">{visible.length} en la lista</p>
      </section>

      {visible.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {visible.map((g) => {
            const saved = savedOf(g.id);
            const pct = g.target_amount ? Math.min(100, Math.round((saved / Number(g.target_amount)) * 100)) : null;
            const mine = g.user_id === user?.id;
            const own = contributions.filter((c) => c.goal_id === g.id).slice(0, 4);
            return (
              <li key={g.id} id={g.id} className={cn("surface p-5 scroll-mt-24", g.is_completed && "opacity-70")}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{g.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{g.title}</p>
                    {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Idea de {nameOf(g.user_id)}
                      {g.deadline &&
                        ` · para el ${new Date(`${g.deadline}T00:00:00`).toLocaleDateString("es", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`}
                    </p>
                  </div>
                  {mine && (
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Borrar meta"
                      onClick={() => remove.mutate(g.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {g.target_amount ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        ${saved.toLocaleString("es")} de ${Number(g.target_amount).toLocaleString("es")}
                      </span>
                      <span className="font-semibold text-primary">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ) : (
                  saved > 0 && (
                    <p className="mt-4 text-xs text-muted-foreground">Guardado: ${saved.toLocaleString("es")}</p>
                  )
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Input
                    className="h-9 w-28"
                    type="number"
                    min={0}
                    placeholder="Monto"
                    value={amounts[g.id] ?? ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                  />
                  <Button size="sm" className="rounded-full" disabled={addMoney.isPending} onClick={() => addMoney.mutate(g)}>
                    <PiggyBank className="mr-1 size-4" /> Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant={g.is_completed ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => toggleDone.mutate(g)}
                  >
                    <CheckCircle2 className="mr-1 size-4" />
                    {g.is_completed ? "Cumplida" : "Marcar cumplida"}
                  </Button>
                </div>

                {own.length > 0 && (
                  <ul className="mt-4 divide-y divide-border/60 text-xs text-muted-foreground">
                    {own.map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-2">
                        <span>
                          {nameOf(c.user_id)} guardó ${Number(c.amount).toLocaleString("es")}
                        </span>
                        <span>{new Date(c.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="surface p-8 text-center text-sm text-muted-foreground">
          {tab === "activas" ? "Aún no hay metas. ¡Sueñen algo juntos!" : "Todavía no han cumplido metas."}
        </p>
      )}
    </div>
  );
}
