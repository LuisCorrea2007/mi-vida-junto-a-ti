import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  Clock,
  HeartPulse,
  LocateFixed,
  LocateOff,
  MapPin,
  Navigation as NavigationIcon,
  Send,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isSharingLocation, useProfiles, type Profile } from "@/hooks/use-profiles";
import { useSignedUrl } from "@/lib/media";
import { notifyPartner } from "@/lib/notify";
import type { MapPerson } from "@/components/couple-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const CoupleMap = lazy(() => import("@/components/couple-map"));

export const Route = createFileRoute("/_authenticated/cerca")({
  head: () => ({
    meta: [
      { title: "Ahora — Nuestro Espacio" },
      { name: "description", content: "Un mapa con los dos, la distancia que los separa y un chat que se borra cada 24 horas." },
      { property: "og:title", content: "Ahora — Nuestro Espacio" },
      { property: "og:description", content: "Mapa, distancia en vivo y chat efímero de la pareja." },
    ],
  }),
  component: NowPage,
});

const DAY_MS = 24 * 60 * 60 * 1000;

const SHARE_OPTIONS = [
  { label: "1 hora", hours: 1 },
  { label: "3 horas", hours: 3 },
  { label: "8 horas", hours: 8 },
  { label: "Hasta mañana", hours: 24 },
  { label: "Siempre", hours: 0 },
] as const;

const QUICK_STATUS = [
  "Trabajando 💼",
  "Comiendo 🍽️",
  "En camino 🚗",
  "Descansando 🛋️",
  "Pensando en ti 💭",
  "Ya casi duermo 😴",
];

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

function distanceLabel(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString("es", { maximumFractionDigits: km < 100 ? 1 : 0 })} km`;
}

function distancePhrase(km: number) {
  if (km < 0.3) return "Están juntitos 💞";
  if (km < 5) return "A un salto de distancia";
  if (km < 50) return "En la misma ciudad, cerquita";
  if (km < 500) return "Lejos, pero no tanto";
  return "Lejos de ojos, cerca del corazón";
}

type DrivingRoute = { km: number; minutes: number; line: [number, number][] };

/** Distancia y tiempo por carretera (servicio público de rutas). */
function useDrivingRoute(a: MapPerson | undefined, b: MapPerson | undefined) {
  const key = a && b ? `${a.lat.toFixed(4)},${a.lng.toFixed(4)}-${b.lat.toFixed(4)},${b.lng.toFixed(4)}` : null;
  return useQuery({
    queryKey: ["driving-route", key],
    enabled: !!key,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async (): Promise<DrivingRoute | null> => {
      const url = `https://router.project-osrm.org/route/v1/driving/${a!.lng},${a!.lat};${b!.lng},${b!.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
      };
      const route = json.routes?.[0];
      if (!route) return null;
      return {
        km: route.distance / 1000,
        minutes: Math.max(1, Math.round(route.duration / 60)),
        line: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      };
    },
  });
}

function travelMinutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min en auto`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h${m ? ` ${m} min` : ""} en auto`;
}

function uberLink(from: MapPerson, to: MapPerson) {
  const params = new URLSearchParams({
    action: "setPickup",
    "pickup[latitude]": String(from.lat),
    "pickup[longitude]": String(from.lng),
    "pickup[nickname]": "Donde estoy",
    "dropoff[latitude]": String(to.lat),
    "dropoff[longitude]": String(to.lng),
    "dropoff[nickname]": to.name,
  });
  return `https://m.uber.com/ul/?${params.toString()}`;
}

function mapsLink(from: MapPerson, to: MapPerson) {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
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

function untilLabel(iso: string | null) {
  if (!iso) return "sin límite";
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return `hasta ${sameDay ? "las" : d.toLocaleDateString("es", { weekday: "short" }) + " a las"} ${d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
}

function remaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "se borra ya";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function readPosition() {
  if (!("geolocation" in navigator)) throw new Error("Este dispositivo no comparte ubicación");
  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 30_000,
    }),
  );
}

function PersonChip({ p, mine }: { p: Profile | undefined; mine: boolean }) {
  const { data: avatar } = useSignedUrl(p?.avatar_url);
  const sharing = isSharingLocation(p);
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/50 py-1 pl-1 pr-3">
      <Avatar className={cn("size-8 border-2", mine ? "border-primary" : "border-gold")}>
        <AvatarImage src={avatar ?? undefined} alt="" />
        <AvatarFallback className="bg-secondary text-[10px]">
          {(p?.name ?? "?").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-left leading-tight">
        <p className="text-xs font-medium">{mine ? "Tú" : (p?.name ?? "Tu pareja")}</p>
        <p className="text-[10px] text-muted-foreground">
          {sharing ? `${p?.location ? p.location + " · " : ""}${timeAgo(p?.location_updated_at ?? null)}` : "no comparte ubicación"}
        </p>
      </div>
    </div>
  );
}

function useMapPeople(me: Profile | undefined, partner: Profile | undefined): MapPerson[] {
  const { data: myAvatar } = useSignedUrl(me?.avatar_url);
  const { data: partnerAvatar } = useSignedUrl(partner?.avatar_url);
  const people: MapPerson[] = [];
  if (me && isSharingLocation(me)) {
    people.push({
      id: me.id,
      name: me.name ?? "Tú",
      lat: me.latitude!,
      lng: me.longitude!,
      avatarUrl: myAvatar ?? null,
      mine: true,
      updatedLabel: timeAgo(me.location_updated_at),
    });
  }
  if (partner && isSharingLocation(partner)) {
    people.push({
      id: partner.id,
      name: partner.name ?? "Tu pareja",
      lat: partner.latitude!,
      lng: partner.longitude!,
      avatarUrl: partnerAvatar ?? null,
      mine: false,
      updatedLabel: timeAgo(partner.location_updated_at),
    });
  }
  return people;
}

function DistanceAndMap({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profiles, isLoading } = useProfiles();
  const me = profiles?.find((p) => p.id === userId);
  const partner = profiles?.find((p) => p.id !== userId);
  const [hours, setHours] = useState<number>(3);
  const people = useMapPeople(me, partner);
  const sharing = isSharingLocation(me);

  const share = useMutation({
    mutationFn: async (opts: { hours: number; silent?: boolean }) => {
      const pos = await readPosition();
      const until = opts.hours > 0 ? new Date(Date.now() + opts.hours * 3_600_000).toISOString() : null;
      const { error } = await supabase
        .from("profiles")
        .update({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_updated_at: new Date().toISOString(),
          ...(opts.silent ? {} : { location_shares_until: until }),
        })
        .eq("id", userId);
      if (error) throw error;
      return opts;
    },
    onSuccess: (opts) => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      if (!opts.silent) toast.success("Ubicación compartida");
    },
    onError: (_e, opts) => {
      if (!opts.silent) toast.error("No pudimos leer tu ubicación. Revisa el permiso del navegador.");
    },
  });

  const stop = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ latitude: null, longitude: null, location_shares_until: null })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dejaste de compartir tu ubicación");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Mientras compartes y tienes la página abierta, refrescamos tu posición cada 2 minutos.
  const shareRef = useRef(share);
  shareRef.current = share;
  useEffect(() => {
    if (!sharing) return;
    const id = window.setInterval(() => shareRef.current.mutate({ hours: 0, silent: true }), 120_000);
    return () => window.clearInterval(id);
  }, [sharing]);

  // Actualiza la vista cuando la pareja cambia su ubicación.
  useEffect(() => {
    const channel = supabase
      .channel("profiles-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () =>
        qc.invalidateQueries({ queryKey: ["profiles"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const both = people.length === 2;
  const mePerson = people.find((p) => p.mine);
  const otherPerson = people.find((p) => !p.mine);
  const km = both ? distanceKm(people[0]!.lat, people[0]!.lng, people[1]!.lat, people[1]!.lng) : null;
  const { data: driving } = useDrivingRoute(mePerson, otherPerson);
  const accuracy = me?.location_accuracy ?? null;


  return (
    <section className="surface overflow-hidden">
      <div className="warm-gradient p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Distancia entre los dos</p>
        {isLoading ? (
          <Skeleton className="mx-auto mt-4 h-12 w-40" />
        ) : km !== null ? (
          <>
            <h1 className="mt-2 font-display text-5xl font-semibold">{distanceLabel(km)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{distancePhrase(km)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {driving
                ? `${distanceLabel(driving.km)} por carretera · ${travelMinutesLabel(driving.minutes)}`
                : "En línea recta"}
              {accuracy && accuracy > 80 ? ` · aprox. ±${Math.round(accuracy)} m` : ""}
            </p>
            {mePerson && otherPerson && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button asChild className="rounded-full">
                  <a href={uberLink(mePerson, otherPerson)} target="_blank" rel="noopener noreferrer">
                    <Car className="mr-1 size-4" /> Pedir Uber para verla
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href={mapsLink(mePerson, otherPerson)} target="_blank" rel="noopener noreferrer">
                    <NavigationIcon className="mr-1 size-4" /> Abrir en Maps
                  </a>
                </Button>
              </div>
            )}
          </>
        ) : (
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {!partner
              ? "Vincula a tu pareja en Ajustes"
              : !sharing
                ? "Comparte tu ubicación para ver la distancia"
                : "Esperando la ubicación de tu pareja"}
          </h1>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <PersonChip p={me} mine />
          {partner && <PersonChip p={partner} mine={false} />}
        </div>
      </div>

      <div className="relative h-72 bg-muted sm:h-96">
        {people.length > 0 ? (
          <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
            <CoupleMap people={people} route={driving?.line ?? null} />
          </Suspense>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <MapPin className="size-6 text-primary" />
            El mapa aparecerá cuando alguno comparta su ubicación.
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        {sharing ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              Compartiendo {untilLabel(me?.location_shares_until ?? null)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => share.mutate({ hours: 0, silent: false })}
                disabled={share.isPending}
              >
                <LocateFixed className="mr-1 size-4" /> Actualizar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => stop.mutate()}
                disabled={stop.isPending}
              >
                <LocateOff className="mr-1 size-4" /> Dejar de compartir
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> ¿Hasta cuándo quieres compartir tu ubicación?
            </p>
            <div className="flex flex-wrap gap-2">
              {SHARE_OPTIONS.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setHours(o.hours)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    hours === o.hours
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Button
              className="w-full rounded-full sm:w-auto"
              onClick={() => share.mutate({ hours, silent: false })}
              disabled={share.isPending}
            >
              <LocateFixed className="mr-1 size-4" />
              {share.isPending ? "Buscando…" : "Compartir mi ubicación"}
            </Button>
          </>
        )}
        <p className="text-[11px] text-muted-foreground">
          Solo tu pareja ve dónde estás. Cuando pase la hora elegida, tu ubicación deja de mostrarse.
        </p>
      </div>
    </section>
  );
}

function Heartbeat({ userId }: { userId: string }) {
  const { data: profiles } = useProfiles();
  const me = profiles?.find((p) => p.id === userId);
  const other = profiles?.find((p) => p.id !== userId);
  const [sentAt, setSentAt] = useState(0);
  const beat = useMutation({
    mutationFn: async () => {
      if (!other) throw new Error("Primero vincula a tu pareja");
      await notifyPartner({
        toUserId: other.id,
        type: "latido",
        title: `${me?.name ?? "Tu pareja"} está pensando en ti 💗`,
        message: "Te mandó un latido desde Nuestro Espacio.",
        link: "/cerca",
      });
    },
    onSuccess: () => {
      setSentAt(Date.now());
      toast.success("Latido enviado 💗");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cooling = Date.now() - sentAt < 60_000;
  return (
    <section className="surface flex items-center justify-between gap-4 p-5">
      <div>
        <h2 className="font-display text-lg font-semibold">Mándale un latido</h2>
        <p className="text-xs text-muted-foreground">
          Un toque rápido para decir "pienso en ti", sin escribir nada.
        </p>
      </div>
      <Button
        size="lg"
        className="shrink-0 rounded-full px-5"
        onClick={() => beat.mutate()}
        disabled={beat.isPending || cooling || !other}
      >
        <HeartPulse className={cn("mr-1 size-5", !cooling && "animate-heartbeat")} />
        {cooling ? "Enviado" : "Latido"}
      </Button>
    </section>
  );
}

type ChatRow = { id: string; content: string; user_id: string; created_at: string; expires_at: string };

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - DAY_MS);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}

function EphemeralChat({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const me = profiles?.find((p) => p.id === userId);
  const partner = profiles?.find((p) => p.id !== userId);
  const { data: partnerAvatar } = useSignedUrl(partner?.avatar_url);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [, tick] = useState(0);
  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";

  const { data: messages = [] } = useQuery({
    queryKey: ["chat"],
    queryFn: async (): Promise<ChatRow[]> => {
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
    mutationFn: async (raw: string) => {
      const content = raw.trim().slice(0, 500);
      if (!content) return;
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId,
        content,
        expires_at: new Date(Date.now() + DAY_MS).toISOString(),
      });
      if (error) throw error;
      if (partner) {
        await notifyPartner({
          toUserId: partner.id,
          type: "chat",
          title: `${me?.name ?? "Tu pareja"} dice…`,
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

  const lastPartner = [...messages].reverse().find((m) => m.user_id !== userId);

  return (
    <section id="chat" className="surface flex flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-border">
            <AvatarImage src={partnerAvatar ?? undefined} alt="" />
            <AvatarFallback className="bg-secondary text-xs">
              {(partner?.name ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <h2 className="font-display text-lg font-semibold">¿Qué estás haciendo?</h2>
            <p className="text-[11px] text-muted-foreground">
              {lastPartner
                ? `${partner?.name ?? "Tu pareja"}: "${lastPartner.content.slice(0, 40)}${lastPartner.content.length > 40 ? "…" : ""}"`
                : "Cuéntense qué hacen en este momento"}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
          <Timer className="size-3" /> 24 h
        </span>
      </div>

      <div className="flex max-h-[55vh] min-h-72 flex-col gap-1.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="my-auto text-center">
            <p className="text-3xl">💬</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nada por ahora. Cuéntale qué haces en este momento.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.user_id === userId;
            const prev = messages[i - 1];
            const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
            const grouped = !!prev && prev.user_id === m.user_id && !newDay &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60_000;
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="my-3 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                    {dayLabel(m.created_at)}
                  </p>
                )}
                <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", grouped && "mt-0")}>
                  {!mine && (
                    <Avatar className={cn("size-7 border border-border", grouped && "invisible")}>
                      <AvatarImage src={partnerAvatar ?? undefined} alt="" />
                      <AvatarFallback className="bg-secondary text-[10px]">
                        {nameOf(m.user_id).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "group max-w-[78%] px-4 py-2 shadow-[var(--shadow-soft)]",
                      mine
                        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-2xl rounded-bl-md bg-muted",
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {new Date(m.created_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      <span className="hidden group-hover:inline"> · se borra en {remaining(m.expires_at)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {QUICK_STATUS.map((s) => (
            <button
              key={s}
              onClick={() => send.mutate(s)}
              disabled={send.isPending}
              className="shrink-0 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2 rounded-full border border-border bg-background/60 p-1 pl-4 focus-within:border-primary"
          onSubmit={(e) => {
            e.preventDefault();
            send.mutate(text);
          }}
        >
          <Input
            value={text}
            maxLength={500}
            placeholder="Estoy…"
            onChange={(e) => setText(e.target.value)}
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-full"
            aria-label="Enviar"
            disabled={send.isPending || !text.trim()}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}

function NowPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DistanceAndMap userId={user.id} />
      <Heartbeat userId={user.id} />
      <EphemeralChat userId={user.id} />
    </div>
  );
}
