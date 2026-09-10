import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarHeart, Heart, Images, NotebookPen, Printer, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles, anniversaryOf } from "@/hooks/use-profiles";
import { useSignedUrl } from "@/lib/media";
import { labelFor, NOTE_CATEGORIES, EVENT_CATEGORIES } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/libro")({
  head: () => ({
    meta: [
      { title: "Libro de recuerdos — Nuestro Espacio" },
      { name: "description", content: "El resumen de su historia, listo para imprimir o guardar en PDF." },
      { property: "og:title", content: "Libro de recuerdos — Nuestro Espacio" },
      { property: "og:description", content: "Su historia en un libro imprimible." },
    ],
  }),
  component: BookPage,
});

type Photo = { id: string; file_path: string; caption: string | null; created_at: string; is_favorite: boolean };
type Milestone = { id: string; title: string; description: string | null; date: string };
type EventRow = { id: string; title: string; date: string; category: string; location: string | null };
type NoteRow = { id: string; title: string; content: string; category: string; created_at: string };

function BookPhoto({ path, caption }: { path: string; caption: string | null }) {
  const { data: url } = useSignedUrl(path);
  if (!url) return <Skeleton className="aspect-square w-full rounded-xl" />;
  return (
    <figure className="break-inside-avoid">
      <img src={url} alt={caption ?? "Recuerdo"} className="aspect-square w-full rounded-xl object-cover" />
      {caption && <figcaption className="mt-1 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function BookPage() {
  const { data: profiles } = useProfiles();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [currentYear]);

  const range = { from: `${year}-01-01`, to: `${year}-12-31T23:59:59` };

  const { data, isLoading } = useQuery({
    queryKey: ["libro", year],
    queryFn: async () => {
      const [photos, milestones, events, notes, videos] = await Promise.all([
        supabase
          .from("photos")
          .select("id, file_path, caption, created_at, is_favorite")
          .gte("created_at", range.from)
          .lte("created_at", range.to)
          .order("is_favorite", { ascending: false })
          .order("created_at")
          .limit(12),
        supabase
          .from("milestones")
          .select("id, title, description, date")
          .gte("date", range.from)
          .lte("date", `${year}-12-31`)
          .order("date"),
        supabase
          .from("events")
          .select("id, title, date, category, location")
          .gte("date", range.from)
          .lte("date", `${year}-12-31`)
          .order("date"),
        supabase
          .from("notes")
          .select("id, title, content, category, created_at")
          .gte("created_at", range.from)
          .lte("created_at", range.to)
          .order("is_favorite", { ascending: false })
          .order("created_at")
          .limit(8),
        supabase
          .from("videos_diarios")
          .select("id", { count: "exact", head: true })
          .gte("created_at", range.from)
          .lte("created_at", range.to),
      ]);
      return {
        photos: (photos.data ?? []) as Photo[],
        milestones: (milestones.data ?? []) as Milestone[],
        events: (events.data ?? []) as EventRow[],
        notes: (notes.data ?? []) as NoteRow[],
        videoCount: videos.count ?? 0,
      };
    },
  });

  const anniversary = anniversaryOf(profiles);
  const names = profiles?.map((p) => p.name).filter(Boolean).join(" & ") ?? "Ustedes dos";
  const days = anniversary
    ? Math.max(0, Math.floor((Date.now() - new Date(`${anniversary}T00:00:00`).getTime()) / 86_400_000))
    : null;

  return (
    <div className="space-y-6 print:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Su historia</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Libro de recuerdos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Un resumen de su año, listo para imprimir o guardar como PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={
                  y === year
                    ? "rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary"
                    : "px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {y}
              </button>
            ))}
          </div>
          <Button className="rounded-full" onClick={() => window.print()}>
            <Printer className="mr-2 size-4" /> Imprimir / PDF
          </Button>
        </div>
      </header>

      {isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8 print:space-y-10">
          {/* Portada */}
          <section className="surface warm-gradient break-inside-avoid p-5 text-center sm:p-10 print:rounded-none">
            <BookOpen className="mx-auto size-8 text-primary" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-primary">Nuestro Espacio · {year}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{names}</h2>
            {anniversary && (
              <p className="mt-3 text-sm text-muted-foreground">
                Juntos desde el{" "}
                {new Date(`${anniversary}T00:00:00`).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {days != null && ` · ${days.toLocaleString("es")} días de amor`}
              </p>
            )}
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-center min-[420px]:grid-cols-4">
              {[
                { icon: Images, n: data.photos.length, label: "Fotos" },
                { icon: NotebookPen, n: data.notes.length, label: "Notas" },
                { icon: CalendarHeart, n: data.events.length, label: "Citas" },
                { icon: Video, n: data.videoCount, label: "Videos" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-background/40 p-3">
                  <s.icon className="mx-auto size-4 text-primary" />
                  <p className="mt-1 font-display text-xl font-semibold">{s.n}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fotos */}
          {data.photos.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold">
                <Images className="size-5 text-primary" /> Momentos en fotos
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {data.photos.map((p) => (
                  <BookPhoto key={p.id} path={p.file_path} caption={p.caption} />
                ))}
              </div>
            </section>
          )}

          {/* Hitos */}
          {data.milestones.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold">
                <Heart className="size-5 text-primary" /> Hitos del año
              </h3>
              <ul className="space-y-2">
                {data.milestones.map((m) => (
                  <li key={m.id} className="rounded-xl border border-border/60 p-4">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${m.date}T00:00:00`).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                      })}
                      {m.description ? ` · ${m.description}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Citas */}
          {data.events.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold">
                <CalendarHeart className="size-5 text-primary" /> Citas y celebraciones
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {data.events.map((e) => (
                  <li key={e.id} className="rounded-xl border border-border/60 p-4">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {labelFor(EVENT_CATEGORIES, e.category)} ·{" "}
                      {new Date(`${e.date}T00:00:00`).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                      })}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Notas */}
          {data.notes.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold">
                <NotebookPen className="size-5 text-primary" /> Palabras que se escribieron
              </h3>
              <div className="space-y-3">
                {data.notes.map((n) => (
                  <blockquote
                    key={n.id}
                    className="rounded-xl border-l-2 border-primary bg-muted/40 p-4"
                  >
                    <p className="font-display font-semibold">{n.title}</p>
                    <p className="mt-1 line-clamp-3 text-sm italic text-muted-foreground">
                      “{n.content}”
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {labelFor(NOTE_CATEGORIES, n.category)} ·{" "}
                      {new Date(n.created_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          <p className="pt-4 text-center text-xs text-muted-foreground">
            Hecho con amor en Nuestro Espacio · {year}
          </p>
        </div>
      )}
    </div>
  );
}
