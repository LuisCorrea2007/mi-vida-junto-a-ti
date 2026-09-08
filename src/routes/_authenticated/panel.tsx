import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, Heart, Images, NotebookPen, Stars, Laugh, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { anniversaryOf, useProfiles } from "@/hooks/use-profiles";
import { DAILY_QUESTIONS, ROMANTIC_QUOTES, pickOfTheDay } from "@/lib/content";
import { useSignedUrl } from "@/lib/media";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel — Nuestro Espacio" },
      { name: "description", content: "Resumen del día: tiempo juntos, próximas citas y últimos recuerdos." },
      { property: "og:title", content: "Panel — Nuestro Espacio" },
      { property: "og:description", content: "Resumen diario de la pareja." },
    ],
  }),
  component: Panel,
});

function useElapsed(since: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!since) return null;
  const start = new Date(`${since}T00:00:00`).getTime();
  const diff = Math.max(0, now - start);
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor(diff / 3_600_000) % 24,
    minutos: Math.floor(diff / 60_000) % 60,
    segundos: Math.floor(diff / 1000) % 60,
  };
}

function PhotoTile({ path, caption }: { path: string; caption: string | null }) {
  const { data: url } = useSignedUrl(path);
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
      {url ? (
        <img
          src={url}
          alt={caption ?? "Recuerdo"}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <Skeleton className="size-full" />
      )}
    </div>
  );
}

function Panel() {
  const { user } = useAuth();
  const { data: profiles } = useProfiles();
  const elapsed = useElapsed(anniversaryOf(profiles));
  const quote = pickOfTheDay(ROMANTIC_QUOTES);
  const question = pickOfTheDay(DAILY_QUESTIONS, 3);

  const { data: notes } = useQuery({
    queryKey: ["notes", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, category, created_at, user_id")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: photos } = useQuery({
    queryKey: ["photos", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, file_path, caption")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, time, location, category")
        .gte("date", today)
        .order("date")
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [n, p, e, w] = await Promise.all([
        supabase.from("notes").select("id", { count: "exact", head: true }),
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("wishes").select("id", { count: "exact", head: true }),
      ]);
      return { notas: n.count ?? 0, fotos: p.count ?? 0, citas: e.count ?? 0, deseos: w.count ?? 0 };
    },
  });

  const me = profiles?.find((p) => p.id === user?.id);

  return (
    <div className="space-y-8">
      <section className="surface warm-gradient animate-fade-up p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">
          Hola{me?.name ? `, ${me.name}` : ""}
        </p>
        {elapsed ? (
          <>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              {elapsed.dias.toLocaleString("es")} días juntos
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {elapsed.horas}h {elapsed.minutos}m {elapsed.segundos}s
            </p>
          </>
        ) : (
          <div className="mt-3">
            <h1 className="font-display text-3xl font-semibold">¿Desde cuándo son ustedes?</h1>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link to="/ajustes">Añadir fecha de aniversario</Link>
            </Button>
          </div>
        )}
        <p className="mx-auto mt-6 max-w-md text-sm italic text-muted-foreground">“{quote}”</p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Notas", value: stats?.notas, icon: NotebookPen, to: "/notas" as const },
          { label: "Fotos", value: stats?.fotos, icon: Images, to: "/galeria" as const },
          { label: "Citas", value: stats?.citas, icon: CalendarHeart, to: "/calendario" as const },
          { label: "Deseos", value: stats?.deseos, icon: Stars, to: "/deseos" as const },
          { label: "Diversión", value: "∞", icon: Laugh, to: "/diversion" as const },
          { label: "Videos", value: "", icon: Video, to: "/videos" as const },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="surface p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
            <s.icon className="size-4 text-primary" />
            <p className="mt-3 font-display text-2xl font-semibold">{s.value ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Próximas citas</h2>
            <Link to="/calendario" className="text-xs text-primary hover:underline">
              Ver todo
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {events?.length ? (
              events.map((e) => (
                <li key={e.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                  <CalendarHeart className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${e.date}T00:00:00`).toLocaleDateString("es", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                      {e.time ? ` · ${e.time}` : ""}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Aún no hay planes. ¡Propón uno!
              </li>
            )}
          </ul>
        </section>

        <section className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Últimas notas</h2>
            <Link to="/notas" className="text-xs text-primary hover:underline">
              Ver todo
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {notes?.length ? (
              notes.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/notas/$id"
                    params={{ id: n.id }}
                    className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                  >
                    <Heart className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString("es", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Escriban su primera nota.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recuerdos recientes</h2>
          <Link to="/galeria" className="text-xs text-primary hover:underline">
            Ver galería
          </Link>
        </div>
        {photos?.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p) => (
              <PhotoTile key={p.id} path={p.file_path} caption={p.caption} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Suban su primera foto juntos.
          </p>
        )}
      </section>

      <section className="surface p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Pregunta de hoy</p>
        <p className="mt-3 font-display text-xl">{question}</p>
        <Button asChild variant="outline" className="mt-5 rounded-full">
          <Link to="/notas">Responder en una nota</Link>
        </Button>
      </section>
    </div>
  );
}
