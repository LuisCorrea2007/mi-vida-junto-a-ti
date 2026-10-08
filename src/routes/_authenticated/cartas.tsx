import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Feather, Flame, HeartHandshake, Mail, MailOpen, Moon, Send, Sparkles, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/cartas")({
  head: () => ({
    meta: [
      { title: "Cartas de amor — Nuestro Espacio" },
      { name: "description", content: "Cartas escritas con calma para la persona que amas, guardadas en un sobre que solo ella abre." },
      { property: "og:title", content: "Cartas de amor — Nuestro Espacio" },
      { property: "og:description", content: "Palabras que merecen un sobre: cartas privadas para los dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartasPage,
});

const MOODS = [
  { value: "ternura", label: "Ternura", icon: HeartHandshake },
  { value: "pasion", label: "Pasión", icon: Flame },
  { value: "gratitud", label: "Gratitud", icon: Sparkles },
  { value: "nostalgia", label: "Nostalgia", icon: Moon },
] as const;
const moodOf = (v: string) => MOODS.find((m) => m.value === v) ?? MOODS[0];

type Letter = { id: string; user_id: string; title: string; content: string; mood: string; opened_at: string | null; created_at: string };

function CartasPage() {
  const { user } = useAuth();
  const { data: couple } = useCouple(user?.id);
  const qc = useQueryClient();
  useRealtime("love_letters");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("ternura");
  const [tab, setTab] = useState<"recibidas" | "enviadas">("recibidas");
  const [reading, setReading] = useState<Letter | null>(null);

  const { data: letters = [], isPending } = useQuery({
    queryKey: ["love-letters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("love_letters").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Letter[];
    },
  });
  const received = letters.filter((l) => l.user_id !== user?.id);
  const sent = letters.filter((l) => l.user_id === user?.id);
  const list = tab === "recibidas" ? received : sent;
  const unread = received.filter((l) => !l.opened_at).length;

  const send = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("love_letters").insert({ user_id: user.id, title: title.trim(), content: content.trim(), mood });
      if (error) throw error;
      if (couple?.partnerId) await notifyPartner({ toUserId: couple.partnerId, type: "carta", title: "Tienes una carta esperándote", message: title.trim(), link: "/cartas" });
    },
    onSuccess: () => {
      setTitle(""); setContent(""); setTab("enviadas");
      void qc.invalidateQueries({ queryKey: ["love-letters"] });
      toast.success("Tu carta ya va en camino");
    },
    onError: () => toast.error("La carta no pudo salir. Inténtalo otra vez."),
  });

  async function open(letter: Letter) {
    setReading(letter);
    if (letter.user_id !== user?.id && !letter.opened_at) {
      await supabase.rpc("open_love_letter", { _id: letter.id });
      void qc.invalidateQueries({ queryKey: ["love-letters"] });
    }
  }
  async function remove(letter: Letter) {
    if (!window.confirm("¿Guardar silencio y borrar esta carta?")) return;
    const { error } = await supabase.from("love_letters").delete().eq("id", letter.id);
    if (error) toast.error("No se pudo borrar."); else { setReading(null); void qc.invalidateQueries({ queryKey: ["love-letters"] }); }
  }

  return (
    <div className="space-y-8">
      <header className="animate-fade-up">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Cartas de amor</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Lo que el corazón dice despacio</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Escribe sin prisa. Tu carta llega en un sobre cerrado y solo se abre cuando tu amor decide leerla.</p>
      </header>

      <form className="surface animate-fade-up space-y-4 p-5 [animation-delay:80ms]" onSubmit={(e) => { e.preventDefault(); if (title.trim() && content.trim()) send.mutate(); }}>
        <div className="flex items-center gap-2 text-sm font-medium"><Feather className="size-4 text-primary" /> Nueva carta</div>
        <Input maxLength={120} placeholder="Para la persona que me cambió la vida…" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Título" />
        <Textarea maxLength={8000} rows={7} placeholder="Hoy quiero contarte algo que no siempre sé decir en voz alta…" value={content} onChange={(e) => setContent(e.target.value)} aria-label="Carta" className="font-serif text-base leading-relaxed" />
        <div className="flex flex-wrap items-center gap-2">
          {MOODS.map((m) => (
            <button type="button" key={m.value} onClick={() => setMood(m.value)} className={cn("flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-all", mood === m.value ? "border-primary bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <m.icon className="size-4" /> {m.label}
            </button>
          ))}
          <Button type="submit" className="ml-auto" disabled={send.isPending || !title.trim() || !content.trim()}><Send className="size-4" /> Cerrar el sobre y enviar</Button>
        </div>
      </form>

      <div className="flex gap-2">
        <Button variant={tab === "recibidas" ? "default" : "outline"} onClick={() => setTab("recibidas")}>Para mí {unread > 0 && <span className="rounded-full bg-background/30 px-2 text-xs">{unread} sin abrir</span>}</Button>
        <Button variant={tab === "enviadas" ? "default" : "outline"} onClick={() => setTab("enviadas")}>Las que escribí ({sent.length})</Button>
      </div>

      {isPending ? <p className="text-muted-foreground">Buscando sus sobres…</p> : list.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{tab === "recibidas" ? "Aún no llega ninguna carta. Quizás hoy sea el día en que escribas tú primero." : "Todavía no has escrito ninguna. Una frase sincera basta para empezar."}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l, i) => {
            const M = moodOf(l.mood);
            const sealed = !l.opened_at && l.user_id !== user?.id;
            return (
              <button key={l.id} onClick={() => void open(l)} style={{ animationDelay: `${i * 50}ms` }} className="surface animate-fade-up group space-y-3 p-5 text-left">
                <div className="flex items-center justify-between">
                  <span className={cn("flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110", sealed && "animate-heartbeat")}>{sealed ? <Mail className="size-5" /> : <MailOpen className="size-5" />}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><M.icon className="size-3.5" /> {M.label}</span>
                </div>
                <h2 className="break-words font-display text-lg font-semibold">{l.title}</h2>
                <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })} · {sealed ? "Sobre cerrado" : l.opened_at ? "Leída" : "Aún sin abrir"}</p>
              </button>
            );
          })}
        </div>
      )}

      {reading && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md" onClick={() => setReading(null)}>
          <article className="surface animate-fade-up max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-10" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{moodOf(reading.mood).label}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">{reading.title}</h2>
            <p className="mt-6 whitespace-pre-wrap font-serif text-lg leading-relaxed">{reading.content}</p>
            <div className="mt-8 flex gap-2">
              <Button variant="outline" onClick={() => setReading(null)}>Guardar en el corazón</Button>
              {reading.user_id === user?.id && <Button variant="ghost" size="icon" aria-label="Borrar carta" onClick={() => void remove(reading)}><Trash2 className="size-4" /></Button>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
