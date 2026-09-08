import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, LockOpen, MailOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { timeUntil } from "@/lib/romance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/capsulas")({
  head: () => ({
    meta: [
      { title: "Cápsulas del tiempo — Nuestro Espacio" },
      {
        name: "description",
        content: "Cartas selladas que se abren en la fecha que ustedes elijan.",
      },
      { property: "og:title", content: "Cápsulas del tiempo — Nuestro Espacio" },
      { property: "og:description", content: "Mensajes guardados para el futuro de los dos." },
    ],
  }),
  component: CapsulasPage,
});

type Capsule = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  open_at: string;
  opened_at: string | null;
  created_at: string;
};

function CapsulasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("time_capsules");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openAt, setOpenAt] = useState("");

  const { data: capsules = [] } = useQuery({
    queryKey: ["time_capsules"],
    queryFn: async (): Promise<Capsule[]> => {
      const { data, error } = await supabase
        .from("time_capsules")
        .select("id, user_id, title, content, open_at, opened_at, created_at")
        .order("open_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim() || !openAt) throw new Error("Falta el título o la fecha");
      const { error } = await supabase.from("time_capsules").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim() || null,
        open_at: new Date(openAt).toISOString(),
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "capsula",
          title: "Te guardé una cápsula del tiempo 💌",
          message: `Se abre el ${new Date(openAt).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}`,
          link: "/capsulas",
        });
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setContent("");
      setOpenAt("");
      burst(14);
      toast.success("Cápsula sellada");
      qc.invalidateQueries({ queryKey: ["time_capsules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markOpened = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_capsules")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      burst(18);
      qc.invalidateQueries({ queryKey: ["time_capsules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_capsules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cápsula borrada");
      qc.invalidateQueries({ queryKey: ["time_capsules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const now = Date.now();
  const sealed = capsules.filter((c) => new Date(c.open_at).getTime() > now);
  const ready = capsules.filter((c) => new Date(c.open_at).getTime() <= now);

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Para el futuro</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Cápsulas del tiempo</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Escribe algo hoy y déjalo sellado hasta la fecha que elijas. Nadie puede leerlo antes.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Nueva cápsula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sellar una cápsula</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cap-title">Título</Label>
                <Input
                  id="cap-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ábrelo en nuestro aniversario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cap-content">Mensaje</Label>
                <Textarea
                  id="cap-content"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Lo que quieras decirle en el futuro..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cap-date">¿Cuándo se abre?</Label>
                <Input
                  id="cap-date"
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={create.isPending}
                onClick={() => create.mutate()}
              >
                Sellar cápsula
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Listas para abrir</h2>
        {ready.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ready.map((c) => (
              <article key={c.id} id={c.id} className="surface p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      De {nameOf(c.user_id)} ·{" "}
                      {new Date(c.open_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <LockOpen className="size-4 shrink-0 text-primary" />
                </div>
                {c.opened_at ? (
                  <p className="mt-4 whitespace-pre-wrap text-sm">{c.content}</p>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-full"
                    onClick={() => markOpened.mutate(c.id)}
                  >
                    <MailOpen className="mr-2 size-4" /> Abrir ahora
                  </Button>
                )}
                {c.user_id === user?.id && (
                  <button
                    className="mt-3 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate(c.id)}
                  >
                    <Trash2 className="mr-1 inline size-3" /> Borrar
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="surface p-8 text-center text-sm text-muted-foreground">
            Aún no hay cápsulas para abrir. La primera llegará a su fecha.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Selladas</h2>
        {sealed.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sealed.map((c) => (
              <article key={c.id} className="surface sealed p-5 text-center">
                <Lock className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-display text-lg font-semibold">
                  {c.user_id === user?.id ? c.title : "Cápsula sellada"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  De {nameOf(c.user_id)} · se abre {timeUntil(c.open_at)}
                </p>
                {c.user_id === user?.id && (
                  <button
                    className="mt-4 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate(c.id)}
                  >
                    <Trash2 className="mr-1 inline size-3" /> Borrar
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="surface p-8 text-center text-sm text-muted-foreground">
            Sella la primera cápsula y sorpréndanse más adelante.
          </p>
        )}
      </section>
    </div>
  );
}
