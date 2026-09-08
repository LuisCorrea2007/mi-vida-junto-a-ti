import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Heart, Images, NotebookPen, Sparkles, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrl } from "@/lib/media";

type Memory = {
  kind: "foto" | "nota" | "video";
  id: string;
  title: string;
  date: string;
  path?: string | null;
};

function yearsLabel(then: string): string {
  const now = new Date();
  const past = new Date(then);
  const years = now.getFullYear() - past.getFullYear();
  if (years >= 1) return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
  const months =
    (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth());
  if (months >= 1) return months === 1 ? "Hace 1 mes" : `Hace ${months} meses`;
  return "Hace unos días";
}

function MemoryThumb({ path }: { path: string }) {
  const { data: url } = useSignedUrl(path);
  if (!url) return null;
  return (
    <img
      src={url}
      alt="Recuerdo de un día como hoy"
      loading="lazy"
      className="size-16 shrink-0 rounded-xl object-cover"
    />
  );
}

const KIND_META = {
  foto: { icon: Images, label: "Foto", to: "/galeria" as const },
  nota: { icon: NotebookPen, label: "Nota", to: "/notas" as const },
  video: { icon: Video, label: "Video", to: "/videos" as const },
};

/** Recuerdos automáticos: "un día como hoy" y el resumen del mes en curso. */
export function Recuerdos() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const monthStart = `${today.getFullYear()}-${mm}-01`;

  const { data: memories } = useQuery({
    queryKey: ["recuerdos", "hoy", mm, dd],
    queryFn: async (): Promise<Memory[]> => {
      const [photos, notes, videos] = await Promise.all([
        supabase
          .from("photos")
          .select("id, caption, file_path, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("notes").select("id, title, created_at").limit(200),
        supabase.from("videos_diarios").select("id, titulo, created_at").limit(200),
      ]);
      const out: Memory[] = [];
      const now = new Date().toDateString();
      const sameDay = (iso: string) => {
        const d = new Date(iso);
        return (
          d.toDateString() !== now &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      };
      for (const p of photos.data ?? []) {
        if (!sameDay(p.created_at)) continue;
        out.push({ kind: "foto", id: p.id, title: p.caption ?? "Una foto", date: p.created_at, path: p.file_path });
      }
      for (const n of notes.data ?? []) {
        if (!sameDay(n.created_at)) continue;
        out.push({ kind: "nota", id: n.id, title: n.title, date: n.created_at });
      }
      for (const v of videos.data ?? []) {
        if (!sameDay(v.created_at)) continue;
        out.push({ kind: "video", id: v.id, title: v.titulo, date: v.created_at });
      }
      return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    },
  });

  const { data: resumen } = useQuery({
    queryKey: ["recuerdos", "mes", monthStart],
    queryFn: async () => {
      const since = new Date(`${monthStart}T00:00:00`).toISOString();
      const [p, n, e, v] = await Promise.all([
        supabase.from("photos").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("notes").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("videos_diarios").select("id", { count: "exact", head: true }).gte("created_at", since),
      ]);
      return {
        fotos: p.count ?? 0,
        notas: n.count ?? 0,
        citas: e.count ?? 0,
        videos: v.count ?? 0,
      };
    },
  });

  const monthName = today.toLocaleDateString("es", { month: "long" });
  const totalMes =
    (resumen?.fotos ?? 0) + (resumen?.notas ?? 0) + (resumen?.citas ?? 0) + (resumen?.videos ?? 0);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="surface p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Un día como hoy</h2>
        </div>
        {memories?.length ? (
          <ul className="mt-4 space-y-3">
            {memories.map((m) => {
              const meta = KIND_META[m.kind];
              const link =
                m.kind === "nota"
                  ? { to: "/notas/$id" as const, params: { id: m.id } }
                  : { to: meta.to };
              return (
                <li key={`${m.kind}-${m.id}`}>
                  <Link
                    {...link}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                  >
                    {m.path ? (
                      <MemoryThumb path={m.path} />
                    ) : (
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <meta.icon className="size-5 text-primary" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{m.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {meta.label} · {yearsLabel(m.date)}
                      </span>
                    </span>
                    <Heart className="size-4 shrink-0 text-primary" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Hoy aún no hay recuerdos de otros años… pero es un día perfecto para crear uno nuevo.
          </p>
        )}
      </div>

      <div className="surface p-6">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Su {monthName}</h2>
        </div>
        {totalMes > 0 ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Fotos", value: resumen?.fotos ?? 0, icon: Images },
                { label: "Notas", value: resumen?.notas ?? 0, icon: NotebookPen },
                { label: "Citas", value: resumen?.citas ?? 0, icon: CalendarClock },
                { label: "Videos", value: resumen?.videos ?? 0, icon: Video },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/50 p-4 text-center">
                  <s.icon className="mx-auto size-4 text-primary" />
                  <p className="mt-2 font-display text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs italic text-muted-foreground">
              {totalMes} {totalMes === 1 ? "momento creado" : "momentos creados"} este mes entre los dos.
            </p>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            El mes apenas empieza: suban una foto o escriban algo bonito hoy.
          </p>
        )}
      </div>
    </section>
  );
}
