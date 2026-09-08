import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hourglass, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { MOODS, timeUntil } from "@/lib/romance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MoodRow = {
  id: string;
  user_id: string;
  emoji: string;
  label: string;
  note: string | null;
  created_at: string;
};

/** Cómo se sienten hoy los dos, más el botón de "pensando en ti". */
export function MoodBar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  const [note, setNote] = useState("");
  useRealtime("moods");

  const { data: moods = [] } = useQuery({
    queryKey: ["moods"],
    queryFn: async (): Promise<MoodRow[]> => {
      const { data, error } = await supabase
        .from("moods")
        .select("id, user_id, emoji, label, note, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const mine = moods.find((m) => m.user_id === user?.id);
  const partner = moods.find((m) => m.user_id !== user?.id);
  const partnerName = profiles?.find((p) => p.id === partner?.user_id)?.name ?? "Tu pareja";

  const setMood = useMutation({
    mutationFn: async (mood: { emoji: string; label: string }) => {
      if (!user) throw new Error("Inicia sesión");
      const { error } = await supabase.from("moods").insert({
        user_id: user.id,
        emoji: mood.emoji,
        label: mood.label,
        note: note.trim() || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "animo",
          title: `Se siente ${mood.label.toLowerCase()} ${mood.emoji}`,
          message: note.trim() || undefined,
          link: "/panel",
        });
      }
    },
    onSuccess: () => {
      setNote("");
      toast.success("Ánimo actualizado");
      qc.invalidateQueries({ queryKey: ["moods"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const thinking = useMutation({
    mutationFn: async () => {
      if (!couple?.partnerId) throw new Error("Aún no están vinculados");
      await notifyPartner({
        toUserId: couple.partnerId,
        type: "pensando",
        title: "Está pensando en ti 💭",
        message: "Un abrazo desde donde estoy.",
        link: "/cerca",
      });
    },
    onSuccess: () => {
      burst(16);
      toast.success("Se lo enviamos 💗");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="surface p-6">
      {hearts}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">¿Cómo se sienten hoy?</h2>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={thinking.isPending}
          onClick={() => thinking.mutate()}
        >
          <Send className="mr-2 size-4" /> Pensando en ti 💭
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Tú</p>
          <p className="mt-2 text-sm">
            {mine ? `${mine.emoji} ${mine.label}` : "Todavía no elegiste tu ánimo"}
          </p>
          {mine?.note && <p className="mt-1 text-xs text-muted-foreground">{mine.note}</p>}
        </div>
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">{partnerName}</p>
          <p className="mt-2 text-sm">
            {partner ? `${partner.emoji} ${partner.label}` : "Sin ánimo por ahora"}
          </p>
          {partner?.note && <p className="mt-1 text-xs text-muted-foreground">{partner.note}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.label}
            title={m.label}
            disabled={setMood.isPending}
            onClick={() => setMood.mutate(m)}
            className={cn(
              "rounded-full bg-muted/60 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
              mine?.label === m.label && "bg-primary/20",
            )}
          >
            {m.emoji} <span className="text-xs text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>

      <Input
        className="mt-3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="¿Quieres contar por qué? (opcional)"
      />
    </section>
  );
}

/** Próxima cápsula del tiempo por abrirse. */
export function NextCapsule() {
  useRealtime("time_capsules");
  const { data: next } = useQuery({
    queryKey: ["time_capsules", "next"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_capsules")
        .select("id, title, open_at, user_id")
        .order("open_at")
        .limit(20);
      if (error) throw error;
      const now = Date.now();
      return (data ?? []).find((c) => new Date(c.open_at).getTime() > now) ?? null;
    },
  });

  return (
    <section className="surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Próxima cápsula</h2>
        <Link to="/capsulas" className="text-xs text-primary hover:underline">
          Ver todas
        </Link>
      </div>
      {next ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
          <Hourglass className="mt-0.5 size-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Hay una cápsula sellada</p>
            <p className="text-xs text-muted-foreground">Se abre {timeUntil(next.open_at)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Sellen una carta para abrirla en una fecha especial.
        </p>
      )}
      <Button asChild variant="outline" className="mt-4 rounded-full">
        <Link to="/capsulas">
          <Sparkles className="mr-2 size-4" /> Crear cápsula
        </Link>
      </Button>
    </section>
  );
}
