import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCouple } from "@/hooks/use-couple";
import type { RealtimeChannel } from "@supabase/supabase-js";

/** Botón "Te estoy pensando": envía un latido en vivo a la pantalla de la pareja. */
export function ThinkingOfYou({ userId, name }: { userId: string; name?: string | null }) {
  const { data: couple } = useCouple(userId);
  const channel = useRef<RealtimeChannel | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!couple?.coupleId) return;
    const ch = supabase.channel(`latido-${couple.coupleId}`, { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "latido" }, ({ payload }) => {
      if (payload?.from === userId) return;
      setPulse(String(payload?.name ?? "Tu amor"));
      navigator.vibrate?.([120, 80, 120]);
      window.setTimeout(() => setPulse(null), 3200);
    }).subscribe();
    channel.current = ch;
    return () => { void supabase.removeChannel(ch); channel.current = null; };
  }, [couple?.coupleId, userId]);

  function send() {
    if (!channel.current || !couple?.partnerId) {
      toast("Cuando tu pareja se una, sus latidos viajarán aquí.");
      return;
    }
    void channel.current.send({ type: "broadcast", event: "latido", payload: { from: userId, name: name ?? "Tu amor" } });
    setSent(true);
    window.setTimeout(() => setSent(false), 1200);
    toast.success("Tu latido ya llegó a su corazón");
  }

  return (
    <>
      <button
        type="button"
        onClick={send}
        aria-label="Te estoy pensando"
        title="Te estoy pensando"
        className="press flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
      >
        <Heart className={sent ? "size-5 fill-primary animate-heartbeat" : "size-5"} />
      </button>
      {pulse && (
        <div role="status" className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
          <div className="latido-glow absolute inset-0" />
          <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
            <Heart className="latido-heart size-24 fill-primary text-primary" />
            <p className="font-display text-2xl font-semibold">{pulse} está pensando en ti</p>
          </div>
        </div>
      )}
    </>
  );
}
