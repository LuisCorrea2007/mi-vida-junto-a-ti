import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarHeart, Gift, Lock, LockOpen, PartyPopper, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/sorpresas")({
  head: () => ({
    meta: [
      { title: "Sorpresas — Nuestro Espacio" },
      { name: "description", content: "Mensajes sorpresa que se desbloquean en una fecha especial." },
      { property: "og:title", content: "Sorpresas — Nuestro Espacio" },
      { property: "og:description", content: "Escríbele algo bonito que solo podrá abrir cuando llegue el día." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SorpresasPage,
});

type Surprise = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  emoji: string;
  unlock_date: string;
  opened_at: string | null;
  created_at: string;
};

const EMOJIS = ["🎁", "💌", "🌹", "🎂", "✈️", "💍", "⭐", "🎉"];
const today = () => new Date().toISOString().slice(0, 10);

function SorpresasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  useRealtime("surprises");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState<string>("🎁");
  const [unlockDate, setUnlockDate] = useState("");
  const [tab, setTab] = useState<"paraMi" | "enviadas">("paraMi");
  const [q, setQ] = useState("");
  const [opened, setOpened] = useState<Surprise | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["surprises"],
    queryFn: async (): Promise<Surprise[]> => {
      const { data, error } = await supabase.from("surprises").select("*").order("unlock_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim() || !message.trim()) throw new Error("Escribe título y mensaje");
      if (!unlockDate) throw new Error("Elige la fecha en que podrá abrirla");
      const { error } = await supabase.from("surprises").insert({
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        emoji,
        unlock_date: unlockDate,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "sorpresa",
          title: "Tienes una sorpresa esperando 🎁",
          message: `Se desbloquea el ${unlockDate}`,
          link: "/sorpresas",
        });
      }
    },
    onSuccess: () => {
      setShowForm(false);
      setTitle("");
      setMessage("");
      setUnlockDate("");
      toast.success("Sorpresa guardada");
      qc.invalidateQueries({ queryKey: ["surprises"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const open = useMutation({
    mutationFn: async (s: Surprise) => {
      const { error } = await supabase.from("surprises").update({ opened_at: new Date().toISOString() }).eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surprises"] }),
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("surprises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surprises"] }),
    onError: (e) => toast.error(e.message),
  });

  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const filtered = useMemo(() => {
    const mine = tab === "enviadas";
    return items.filter((s) => {
      if (mine ? s.user_id !== user?.id : s.user_id === user?.id) return false;
      if (q && !`${s.title} ${s.message}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, tab, q, user?.id]);

  const readyCount = items.filter(
    (s) => s.user_id !== user?.id && !s.opened_at && s.unlock_date <= today(),
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
          <PartyPopper className="size-5" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold">Sorpresas</h1>
          <p className="text-sm text-muted-foreground">
            Mensajes que solo se pueden abrir cuando llega el día.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 size-4" /> Nueva sorpresa
        </Button>
      </header>

      {readyCount > 0 && (
        <p className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          🎉 Tienes {readyCount} {readyCount === 1 ? "sorpresa lista" : "sorpresas listas"} para abrir.
        </p>
      )}

      {showForm && (
        <section className="surface space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "grid size-10 place-items-center rounded-full text-xl transition",
                  emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/60",
                )}
                aria-label={`Emoji ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej. Para nuestro aniversario)" maxLength={80} />
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe el mensaje que verá ese día…" rows={4} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarHeart className="size-4" /> Se abre el
            </label>
            <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} className="w-auto" min={today()} />
            <Button className="ml-auto rounded-full" disabled={add.isPending} onClick={() => add.mutate()}>
              Guardar sorpresa
            </Button>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-muted/60 p-1 text-sm">
          {(["paraMi", "enviadas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("rounded-full px-4 py-1.5 transition", tab === t && "bg-card shadow")}
            >
              {t === "paraMi" ? "Para mí" : "Enviadas por mí"}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-44 rounded-full pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="surface p-10 text-center text-sm text-muted-foreground">
          {tab === "paraMi" ? "Aún no tienes sorpresas. ¡Quizá tu pareja esté preparando una!" : "Todavía no has preparado ninguna sorpresa."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => {
            const isMine = s.user_id === user?.id;
            const unlocked = s.unlock_date <= today();
            return (
              <li key={s.id} className="surface space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      De {nameOf(s.user_id)} · se abre el {s.unlock_date}
                    </p>
                  </div>
                  {isMine && (
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove.mutate(s.id)}
                      aria-label="Borrar sorpresa"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                {!isMine && unlocked && !s.opened_at ? (
                  <Button
                    className="w-full rounded-full"
                    onClick={() => {
                      setOpened(s);
                      open.mutate(s);
                    }}
                  >
                    <LockOpen className="mr-2 size-4" /> Abrir sorpresa
                  </Button>
                ) : !isMine && unlocked && s.opened_at ? (
                  <button
                    className="w-full rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground"
                    onClick={() => setOpened(s)}
                  >
                    Ver de nuevo
                  </button>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-4" />
                    {isMine ? "Tu pareja podrá abrirla cuando llegue el día." : `Faltan ${Math.max(0, Math.ceil((new Date(`${s.unlock_date}T00:00:00`).getTime() - Date.now()) / 86400000))} días.`}
                  </p>
                )}
                {isMine && s.opened_at && (
                  <p className="text-xs text-primary">✓ Tu pareja ya la abrió</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {opened && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur" onClick={() => setOpened(null)}>
          <div className="surface max-w-md space-y-4 p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <Gift className="mx-auto size-10 text-primary" />
            <p className="text-4xl">{opened.emoji}</p>
            <h2 className="font-display text-2xl font-semibold">{opened.title}</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{opened.message}</p>
            <Button className="rounded-full" onClick={() => setOpened(null)}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
