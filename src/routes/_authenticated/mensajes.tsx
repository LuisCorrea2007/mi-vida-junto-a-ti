import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CornerUpLeft, Send, SmilePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useRealtime } from "@/hooks/use-realtime";
import { useProfiles } from "@/hooks/use-profiles";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes — Nuestro Espacio" },
      { name: "description", content: "Nuestro chat privado para escribirnos, responder y reaccionar." },
      { property: "og:title", content: "Mensajes — Nuestro Espacio" },
      { property: "og:description", content: "Un chat solo para los dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MensajesPage,
});

const EMOJIS = ["❤️", "😂", "😍", "🥺", "👍", "🔥"];

type Msg = { id: string; user_id: string; content: string; reply_to: string | null; read_at: string | null; created_at: string };
type Reaction = { id: string; message_id: string; user_id: string; emoji: string };

function MensajesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles = [] } = useProfiles();
  useRealtime("private_messages", "private_message_reactions");

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [picker, setPicker] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: msgs = [] } = useQuery({
    queryKey: ["private_messages"],
    queryFn: async (): Promise<Msg[]> => {
      const { data, error } = await supabase.from("private_messages").select("*").order("created_at", { ascending: true }).limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: reactions = [] } = useQuery({
    queryKey: ["private_message_reactions"],
    queryFn: async (): Promise<Reaction[]> => {
      const { data, error } = await supabase.from("private_message_reactions").select("id,message_id,user_id,emoji");
      if (error) throw error;
      return data ?? [];
    },
  });

  const byId = useMemo(() => new Map(msgs.map((m) => [m.id, m])), [msgs]);
  const nameOf = (id: string) => (id === user?.id ? "Tú" : profiles.find((p) => p.id === id)?.name || "Tu pareja");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  // Marcar como leídos los mensajes de la pareja
  useEffect(() => {
    if (!user) return;
    const unread = msgs.filter((m) => m.user_id !== user.id && !m.read_at).map((m) => m.id);
    if (unread.length) {
      void supabase.from("private_messages").update({ read_at: new Date().toISOString() }).in("id", unread);
    }
  }, [msgs, user]);

  const send = useMutation({
    mutationFn: async () => {
      const content = text.trim();
      if (!user || !content) return;
      const { error } = await supabase.from("private_messages").insert({ user_id: user.id, content, reply_to: replyTo?.id ?? null });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({ toUserId: couple.partnerId, type: "mensaje", title: "Nuevo mensaje 💬", message: content.slice(0, 80), link: "/mensajes" });
      }
    },
    onSuccess: () => {
      setText("");
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ["private_messages"] });
    },
    onError: () => toast.error("No se pudo enviar"),
  });

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    setPicker(null);
    const mine = reactions.find((r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    const { error } = mine
      ? await supabase.from("private_message_reactions").delete().eq("id", mine.id)
      : await supabase.from("private_message_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
    if (error) toast.error("No se pudo reaccionar");
    qc.invalidateQueries({ queryKey: ["private_message_reactions"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("private_messages").delete().eq("id", id);
    if (error) toast.error("No se pudo borrar");
    qc.invalidateQueries({ queryKey: ["private_messages"] });
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col gap-3">
      <header>
        <h1 className="font-display text-3xl font-semibold">Mensajes</h1>
        <p className="text-sm text-muted-foreground">Solo para los dos. Toca un mensaje para responder o reaccionar.</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4">
        {msgs.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Aún no hay mensajes. ¡Escribe el primero! 💌</p>}
        {msgs.map((m) => {
          const mine = m.user_id === user?.id;
          const parent = m.reply_to ? byId.get(m.reply_to) : null;
          const groups = EMOJIS.map((e) => ({ e, list: reactions.filter((r) => r.message_id === m.id && r.emoji === e) })).filter((g) => g.list.length);
          return (
            <div key={m.id} className={cn("group flex flex-col", mine ? "items-end" : "items-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                {parent && (
                  <div className="mb-1 border-l-2 border-current/40 pl-2 text-xs opacity-75">
                    <span className="font-medium">{nameOf(parent.user_id)}:</span> {parent.content.slice(0, 80)}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {new Date(m.created_at).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
                  {mine && (m.read_at ? " · Visto" : " · Enviado")}
                </p>
              </div>
              {groups.length > 0 && (
                <div className="-mt-1 flex gap-1">
                  {groups.map((g) => (
                    <button
                      key={g.e}
                      onClick={() => toggleReaction(m.id, g.e)}
                      className={cn("rounded-full border border-border bg-card px-2 text-xs", g.list.some((r) => r.user_id === user?.id) && "border-primary")}
                    >
                      {g.e} {g.list.length > 1 ? g.list.length : ""}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-1 flex gap-1 opacity-70 transition group-hover:opacity-100">
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Responder" onClick={() => setReplyTo(m)}>
                  <CornerUpLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Reaccionar" onClick={() => setPicker(picker === m.id ? null : m.id)}>
                  <SmilePlus className="h-3.5 w-3.5" />
                </Button>
                {mine && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Borrar" onClick={() => remove(m.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {picker === m.id && (
                <div className="flex gap-1 rounded-full border border-border bg-card px-2 py-1">
                  {EMOJIS.map((e) => (
                    <button key={e} className="text-lg transition hover:scale-125" onClick={() => toggleReaction(m.id, e)}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {replyTo && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <span className="truncate">
            Respondiendo a <b>{nameOf(replyTo.user_id)}</b>: {replyTo.content.slice(0, 60)}
          </span>
          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Cancelar respuesta" onClick={() => setReplyTo(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate();
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send.mutate();
            }
          }}
          placeholder="Escribe algo bonito…"
          rows={1}
          className="min-h-11 resize-none"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!text.trim() || send.isPending} aria-label="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
