import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, ListChecks, Plus, Search, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tareas")({
  head: () => ({
    meta: [
      { title: "Nuestra lista — Nuestro Espacio" },
      { name: "description", content: "Tareas, compras y pendientes compartidos entre los dos." },
      { property: "og:title", content: "Nuestra lista — Nuestro Espacio" },
      { property: "og:description", content: "Repartan pendientes y compras sin olvidar nada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TareasPage,
});

type Task = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  assigned_to: string | null;
  due_date: string | null;
  is_done: boolean;
  done_by: string | null;
  done_at: string | null;
  created_at: string;
};

const CATEGORIES = [
  { value: "casa", label: "Casa", emoji: "🏠" },
  { value: "compras", label: "Compras", emoji: "🛒" },
  { value: "pareja", label: "Nosotros", emoji: "💗" },
  { value: "papeles", label: "Trámites", emoji: "📄" },
  { value: "salud", label: "Salud", emoji: "🩺" },
] as const;

function TareasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("couple_tasks");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("casa");
  const [assigned, setAssigned] = useState<string>("");
  const [due, setDue] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pendientes" | "mias" | "hechas">("pendientes");

  const { data: tasks = [] } = useQuery({
    queryKey: ["couple_tasks"],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("couple_tasks")
        .select("id, user_id, title, category, assigned_to, due_date, is_done, done_by, done_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });

  const nameOf = (id: string | null) =>
    !id ? "Sin asignar" : id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim()) throw new Error("Escribe el pendiente");
      const { error } = await supabase.from("couple_tasks").insert({
        user_id: user.id,
        title: title.trim(),
        category,
        assigned_to: assigned || null,
        due_date: due || null,
      });
      if (error) throw error;
      if (couple?.partnerId && (assigned === couple.partnerId || !assigned)) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "tarea",
          title: "Nuevo pendiente en la lista ✅",
          message: title.trim(),
          link: "/tareas",
        });
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setDue("");
      setAssigned("");
      toast.success("Pendiente añadido");
      qc.invalidateQueries({ queryKey: ["couple_tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: Task) => {
      if (!user) throw new Error("Inicia sesión");
      const done = !t.is_done;
      const { error } = await supabase
        .from("couple_tasks")
        .update({ is_done: done, done_by: done ? user.id : null, done_at: done ? new Date().toISOString() : null })
        .eq("id", t.id);
      if (error) throw error;
      if (done && couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "tarea",
          title: "Ya está hecho ✅",
          message: t.title,
          link: "/tareas",
        });
      }
    },
    onSuccess: (_d, t) => {
      if (!t.is_done) burst(8);
      qc.invalidateQueries({ queryKey: ["couple_tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("couple_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pendiente borrado");
      qc.invalidateQueries({ queryKey: ["couple_tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (tab === "pendientes" && t.is_done) return false;
      if (tab === "hechas" && !t.is_done) return false;
      if (tab === "mias" && (t.is_done || t.assigned_to !== user?.id)) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [tasks, search, tab, user?.id]);

  const pending = tasks.filter((t) => !t.is_done).length;
  const mine = tasks.filter((t) => !t.is_done && t.assigned_to === user?.id).length;
  const doneWeek = tasks.filter(
    (t) => t.is_done && t.done_at && Date.now() - new Date(t.done_at).getTime() < 7 * 86400000,
  ).length;

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-5 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Todo en orden</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Nuestra lista</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Compras, cosas de la casa, trámites y planes: repártanlos y márquenlos cuando estén hechos.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-3">
            <p className="font-display text-xl font-semibold text-primary">{pending}</p>
            <p className="text-xs text-muted-foreground">pendientes</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-3">
            <p className="font-display text-xl font-semibold text-primary">{mine}</p>
            <p className="text-xs text-muted-foreground">para ti</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-3">
            <p className="font-display text-xl font-semibold text-primary">{doneWeek}</p>
            <p className="text-xs text-muted-foreground">hechos esta semana</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Añadir pendiente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo pendiente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="t-title">¿Qué hay que hacer?</Label>
                <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                        category === c.value && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>¿Quién lo hace?</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAssigned("")}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                      assigned === "" && "border-primary bg-primary/15 text-primary",
                    )}
                  >
                    Cualquiera
                  </button>
                  {user && (
                    <button
                      onClick={() => setAssigned(user.id)}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                        assigned === user.id && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      Yo
                    </button>
                  )}
                  {couple?.partnerId && (
                    <button
                      onClick={() => setAssigned(couple.partnerId!)}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                        assigned === couple.partnerId && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {nameOf(couple.partnerId)}
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-due">Fecha límite (opcional)</Label>
                <Input id="t-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
              <Button className="w-full rounded-full" disabled={create.isPending} onClick={() => create.mutate()}>
                Añadir a la lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "pendientes", label: "Pendientes" },
              { key: "mias", label: "Para mí" },
              { key: "hechas", label: "Hechas" },
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
          <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pendiente..." />
        </div>
        <p className="text-xs text-muted-foreground">{visible.length} en la lista</p>
      </section>

      {visible.length ? (
        <ul className="surface divide-y divide-border/60">
          {visible.map((t) => {
            const cat = CATEGORIES.find((c) => c.value === t.category);
            const late = !t.is_done && t.due_date && new Date(`${t.due_date}T23:59:59`).getTime() < Date.now();
            return (
              <li key={t.id} id={t.id} className="flex items-center gap-3 px-4 py-3 scroll-mt-24">
                <button
                  onClick={() => toggle.mutate(t)}
                  aria-label={t.is_done ? "Marcar pendiente" : "Marcar hecho"}
                  className={cn("shrink-0 text-muted-foreground transition-colors hover:text-primary", t.is_done && "text-primary")}
                >
                  {t.is_done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", t.is_done && "text-muted-foreground line-through")}>
                    {cat?.emoji} {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {nameOf(t.assigned_to)}
                    {t.due_date &&
                      ` · ${late ? "venció" : "para"} el ${new Date(`${t.due_date}T00:00:00`).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                      })}`}
                    {t.is_done && t.done_by && ` · hecho por ${nameOf(t.done_by)}`}
                  </p>
                </div>
                {late && <span className="shrink-0 text-xs font-medium text-destructive">Atrasado</span>}
                {t.user_id === user?.id && (
                  <button
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Borrar pendiente"
                    onClick={() => remove.mutate(t.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="surface flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
          <ListChecks className="size-6 text-primary" />
          {tab === "hechas" ? "Aún no han marcado nada como hecho." : "¡Todo al día! No hay pendientes."}
        </p>
      )}
    </div>
  );
}
