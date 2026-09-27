import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CalendarHeart,
  Flame,
  Gift,
  Heart,
  Hourglass,
  Images,
  Laugh,
  ListChecks,
  Music,
  NotebookPen,
  PiggyBank,
  Smile,
  Stars,
  Ticket,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/estadisticas")({
  head: () => ({
    meta: [
      { title: "Nuestras estadísticas — Nuestro Espacio" },
      { name: "description", content: "Los números de su historia: recuerdos, notas, canciones y más." },
      { property: "og:title", content: "Nuestras estadísticas — Nuestro Espacio" },
      { property: "og:description", content: "Los números de su historia de amor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EstadisticasPage,
});

const SECTIONS = [
  { key: "notes", label: "Notas", icon: NotebookPen },
  { key: "photos", label: "Fotos", icon: Images },
  { key: "videos_diarios", label: "Videos", icon: Video },
  { key: "events", label: "Citas", icon: CalendarHeart },
  { key: "wishes", label: "Deseos", icon: Stars },
  { key: "dedications", label: "Dedicatorias", icon: Gift },
  { key: "songs", label: "Canciones", icon: Music },
  { key: "time_capsules", label: "Cápsulas", icon: Hourglass },
  { key: "challenges", label: "Retos", icon: Flame },
  { key: "fun_items", label: "Diversión", icon: Laugh },
  { key: "coupons", label: "Cupones", icon: Ticket },
  { key: "couple_goals", label: "Metas", icon: PiggyBank },
  { key: "couple_tasks", label: "Pendientes", icon: ListChecks },
  { key: "gratitudes", label: "Gratitudes", icon: Heart },
  { key: "milestones", label: "Hitos", icon: BookOpen },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

type MoodRow = { emoji: string; label: string; created_at: string };

function EstadisticasPage() {
  const { user } = useAuth();
  const { data: myProfile } = useMyProfile(user?.id);
  useRealtime("moods", "notes", "photos", "wishes", "songs");

  const { data: counts } = useQuery({
    queryKey: ["stats-counts"],
    queryFn: async () => {
      const entries = await Promise.all(
        SECTIONS.map(async (s) => {
          const { count, error } = await supabase
            .from(s.key)
            .select("id", { count: "exact", head: true });
          if (error) return [s.key, 0] as const;
          return [s.key, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<SectionKey, number>;
    },
  });

  const { data: moods = [] } = useQuery({
    queryKey: ["stats-moods"],
    queryFn: async (): Promise<MoodRow[]> => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data, error } = await supabase
        .from("moods")
        .select("emoji, label, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = useMemo(
    () => (counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0),
    [counts],
  );

  const daysTogether = useMemo(() => {
    const d = myProfile?.anniversary_date;
    if (!d) return null;
    const start = new Date(`${d}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
  }, [myProfile?.anniversary_date]);

  const moodStats = useMemo(() => {
    const map = new Map<string, { emoji: string; label: string; n: number }>();
    for (const m of moods) {
      const k = `${m.emoji} ${m.label}`;
      const cur = map.get(k);
      if (cur) cur.n += 1;
      else map.set(k, { emoji: m.emoji, label: m.label, n: 1 });
    }
    return [...map.values()].sort((a, b) => b.n - a.n).slice(0, 6);
  }, [moods]);

  const maxMood = moodStats[0]?.n ?? 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <header className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
          <BarChart3 className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Nuestras estadísticas</h1>
          <p className="text-sm text-muted-foreground">Los números de su historia.</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
          <p className="text-xs text-muted-foreground">Días juntos</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">
            {daysTogether ?? "—"}
          </p>
          {daysTogether == null && (
            <p className="mt-1 text-xs text-muted-foreground">Pongan su fecha en Ajustes.</p>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
          <p className="text-xs text-muted-foreground">Recuerdos guardados</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">Sumando todas las secciones.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
          <p className="text-xs text-muted-foreground">Ánimos del mes</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">{moods.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Registros de los últimos 30 días.</p>
        </div>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <Smile className="size-5 text-primary" /> Cómo se han sentido
        </h2>
        {moodStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay ánimos este mes. Regístrenlos en Conexión.
          </p>
        ) : (
          <div className="space-y-2">
            {moodStats.map((m) => (
              <div key={`${m.emoji}${m.label}`} className="flex items-center gap-3">
                <span className="w-32 truncate text-sm">
                  {m.emoji} {m.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round((m.n / maxMood) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{m.n}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const n = counts?.[s.key] ?? 0;
          return (
            <div
              key={s.key}
              className={cn(
                "rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur transition-colors",
                n > 0 && "hover:border-primary/40",
              )}
            >
              <Icon className="size-5 text-primary" />
              <p className="mt-2 font-display text-2xl font-semibold">{n}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
