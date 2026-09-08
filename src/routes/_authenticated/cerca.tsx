import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LocateFixed, MapPin, Send, Timer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cerca")({
  head: () => ({
    meta: [
      { title: "Ahora — Nuestro Espacio" },
      { name: "description", content: "La distancia entre los dos y un chat que se borra cada 24 horas." },
      { property: "og:title", content: "Ahora — Nuestro Espacio" },
      { property: "og:description", content: "Distancia en vivo y chat efímero de la pareja." },
    ],
  }),
  component: NowPage,
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** Distancia en km entre dos coordenadas. */
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function timeAgo(iso: string | null) {
  if (!iso) return "sin ubicación";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

function remaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "se borra ya";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function DistanceCard({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profiles, isLoading } = useProfiles();
  const me = profiles?.find((p) => p.id === userId);
  const partner = profiles?.find((p) => p.id !== userId);

  const share = useMutation({
    mutationFn: async () => {
      if (!("geolocation" in navigator)) throw new Error("Este dispositivo no comparte ubicación");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
        }),
      );
      const { error } = await supabase
        .from("profiles")
        .update({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ubicación actualizada");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: () => toast.error("No pudimos leer tu ubicación. Revisa el permiso del navegador."),
  });

  const both =
    me?.latitude != null && me?.longitude != null && partner?.latitude != null && partner?.longitude != null;
  const km = both ? distanceKm(me.latitude!, me.longitude!, partner.latitude!, partner.longitude!) : null;

  return (
    <section className="surface warm-gradient p-6 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Distancia entre los dos</p>
      {isLoading ? (
        <Skeleton className="mx-auto mt-4 h-12 w-40" />
      ) : km !== null ? (
        <h1 className="mt-3 font-display text-5xl font-semibold">
          {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString("es", { maximumFractionDigits: km < 100 ? 1 : 0 })} km`}
        </h1>
      ) : (
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {partner ? "Falta la ubicación de alguno de los dos" : "Vincula a tu pareja en Ajustes"}
        </h1>
      )}
      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <p>
          <MapPin className="mr-1 inline size-3" />
          {me?.name ?? "Tú"}: {me?.location ? `${me.location} · ` : ""}
          {timeAgo(me?.location_updated_at ?? null)}
        </p>
        {partner && (
          <p>
            <MapPin className="mr-1 inline size-3" />
            {partner.name ?? "Tu pareja"}: {partner.location ? `${partner.location} · ` : ""}
            {timeAgo(partner.location_updated_at ?? null)}
          </p>
        )}
      </div>
      <Button
        className="mt-5 rounded-full"
        onClick={() => share.mutate()}
        disabled={share.isPending}
      >
        <LocateFixed className="mr-1 size-4" />
        {share.isPending ? "Buscando…" : "Actualizar mi ubicación"}
      </Button>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Solo su pareja ve la ubicación, y solo cuando tú la actualizas.
      </p>
    </section>
  );
}

type ChatRow = { id: string; content: string; user_id: string; created_at: string; expires_at: string };

function EphemeralChat({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [, tick] = useState(0);
  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";

  const { data: messages = [] } = useQuery({
    queryKey: ["chat"],
    queryFn: async (): Promise<ChatRow[]> => {
      // Limpia mis mensajes vencidos y trae los vigentes.
      await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId)
        .lt("expires_at", new Date().toISOString());
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, content, user_id, created_at, expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("created_at")
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("chat-24h")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () =>
        qc.invalidateQueries({ queryKey: ["chat"] }),
      )
      .subscribe();
    const id = window.setInterval(() => tick((n) => n + 1), 60_000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(id);
    };
  }, [qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = useMutation({
    mutationFn: async () => {
      const content = text.trim().slice(0, 500);
      if (!content) return;
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId,
        content,
        expires_at: new Date(Date.now() + DAY_MS).toISOString(),
      });
      if (error) throw error;
      const other = profiles?.find((p) => p.id !== userId);
      if (other) {
        await notifyPartner({
          toUserId: other.id,
          type: "chat",
          title: `${nameOf(userId)} dice…`,
          message: content.slice(0, 140),
          link: "/cerca#chat",
        });
      }
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["chat"] });
    },
    onError: () => toast.error("No pudimos enviar el mensaje"),
  });

  return (
    <section id="chat" className="surface flex flex-col p-0">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="font-display text-xl font-semibold">¿Qué estás haciendo?</h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Timer className="size-3" /> Se borra a las 24 h
        </span>
      </div>
      <div className="flex max-h-[55vh] min-h-64 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-muted-foreground">
            Nada por ahora. Cuéntale qué haces en este momento.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.user_id === userId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {!mine && <p className="text-[11px] opacity-70">{nameOf(m.user_id)}</p>}
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.created_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {remaining(m.expires_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate();
        }}
      >
        <Input
          value={text}
          maxLength={500}
          placeholder="Estoy…"
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Enviar" disabled={send.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}

function NowPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DistanceCard userId={user.id} />
      <EphemeralChat userId={user.id} />
    </div>
  );
}
