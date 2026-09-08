import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DAILY_QUESTIONS, pickOfTheDay } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({
    meta: [
      { title: "Diario — Nuestro Espacio" },
      { name: "description", content: "Línea de tiempo con los hitos importantes de la relación." },
      { property: "og:title", content: "Diario — Nuestro Espacio" },
      { property: "og:description", content: "Los momentos que marcaron la relación." },
    ],
  }),
  component: DiaryPage,
});

function DiaryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, title, description, date, user_id")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.title.trim()) throw new Error("Ponle nombre al momento");
      const { error } = await supabase.from("milestones").insert({
        user_id: user.id,
        title: form.title.trim().slice(0, 140),
        description: form.description.slice(0, 2000) || null,
        date: form.date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Momento guardado");
      setOpen(false);
      setForm({ title: "", description: "", date: new Date().toISOString().slice(0, 10) });
      qc.invalidateQueries({ queryKey: ["milestones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["milestones"] }),
    onError: () => toast.error("Solo quien lo añadió puede eliminarlo"),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Diario</h1>
          <p className="text-sm text-muted-foreground">La historia de los dos, momento a momento.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 size-4" /> Añadir momento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Nuevo momento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mt">¿Qué pasó?</Label>
                <Input
                  id="mt"
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="md">Fecha</Label>
                <Input
                  id="md"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdesc">Cómo lo recuerdan</Label>
                <Textarea
                  id="mdesc"
                  rows={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="rounded-full" onClick={() => create.mutate()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <section className="surface p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Pregunta para hablar hoy</p>
        <p className="mt-3 font-display text-xl">{pickOfTheDay(DAILY_QUESTIONS, 3)}</p>
      </section>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : !milestones?.length ? (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Heart className="size-8 text-primary" />
          <p className="font-display text-xl">Su historia empieza aquí</p>
          <p className="text-sm text-muted-foreground">
            Añadan el primer día, el primer viaje, el primer “te quiero”.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {milestones.map((m) => (
            <li key={m.id} className="animate-fade-up relative">
              <span className="absolute -left-[31px] top-2 size-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {new Date(`${m.date}T00:00:00`).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold">{m.title}</h2>
                  </div>
                  {m.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar momento"
                      onClick={() => remove.mutate(m.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {m.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {m.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
