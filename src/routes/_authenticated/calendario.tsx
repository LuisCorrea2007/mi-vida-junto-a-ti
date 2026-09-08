import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarHeart, Check, Plus, Trash2, X, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { EVENT_CATEGORIES, labelFor } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendario")({
  head: () => ({
    meta: [
      { title: "Citas — Nuestro Espacio" },
      { name: "description", content: "Calendario de citas, planes y aniversarios de la pareja." },
      { property: "og:title", content: "Citas — Nuestro Espacio" },
      { property: "og:description", content: "Planes y fechas importantes de los dos." },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return cells;
}

function CalendarPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: today.toISOString().slice(0, 10),
    time: "",
    location: "",
    category: "romantica",
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, date, time, location, category, user_id, countdown_enabled")
        .order("date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: responses } = useQuery({
    queryKey: ["event-responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_responses")
        .select("id, event_id, user_id, response_status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.title.trim()) throw new Error("Ponle un título al plan");
      const { error } = await supabase.from("events").insert({
        user_id: user.id,
        title: form.title.trim().slice(0, 140),
        description: form.description.slice(0, 2000) || null,
        date: form.date,
        time: form.time || null,
        location: form.location.slice(0, 160) || null,
        category: form.category,
      });
      if (error) throw error;
      const other = profiles?.find((p) => p.id !== user.id);
      if (other) {
        await supabase.from("notifications").insert({
          user_id: other.id,
          type: "cita",
          title: "Nueva propuesta de cita",
          message: form.title.trim().slice(0, 140),
        });
      }
    },
    onSuccess: () => {
      toast.success("Plan propuesto");
      setOpen(false);
      setForm({ ...form, title: "", description: "", time: "", location: "" });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const respond = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      if (!user) return;
      const mine = responses?.find((r) => r.event_id === eventId && r.user_id === user.id);
      if (mine) {
        await supabase.from("event_responses").update({ response_status: status }).eq("id", mine.id);
      } else {
        await supabase
          .from("event_responses")
          .insert({ event_id: eventId, user_id: user.id, response_status: status });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-responses"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Plan eliminado");
    },
    onError: () => toast.error("Solo quien creó el plan puede eliminarlo"),
  });

  // Cuenta regresiva para eventos próximos
  function Countdown({ targetDate, time }: { targetDate: string; time?: string | null }) {
    const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const calculate = () => {
        const target = new Date(`${targetDate}T${time || "00:00:00"}`);
        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
          setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      };

      calculate();
      const interval = setInterval(calculate, 1000);
      return () => clearInterval(interval);
    }, [targetDate, time]);

    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="size-4 text-primary" />
        <span className="font-medium">
          {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
        </span>
      </div>
    );
  }

  // Exportar a Google Calendar
  const exportToGoogleCalendar = (event: any) => {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      details: event.description || "",
      location: event.location || "",
      dates: `${event.date.replace(/-/g, "")}T${(event.time || "000000").replace(":", "")}00/${event.date.replace(/-/g, "")}T${(event.time || "235959").replace(":", "")}00`,
    });
    window.open(`${baseUrl}?${params.toString()}`, "_blank");
  };

  // Agregar al calendario del dispositivo (iCal)
  const addToDeviceCalendar = (event: any) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nuestro Espacio//ES
BEGIN:VEVENT
UID:${event.id}@nuestroespacio
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${event.date.replace(/-/g, "")}T${(event.time || "000000").replace(":", "")}00
DTEND:${event.date.replace(/-/g, "")}T${(event.time || "235959").replace(":", "")}00
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cells = monthMatrix(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });
  const todayStr = today.toISOString().slice(0, 10);
  const dayEvents = (d: string) => (events ?? []).filter((e) => e.date === d);
  const listed = selected ? dayEvents(selected) : (events ?? []).filter((e) => e.date >= todayStr);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Citas</h1>
          <p className="text-sm text-muted-foreground">Propón, acepten y no olviden ninguna fecha.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 size-4" /> Proponer plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Nuevo plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="et">Título</Label>
                <Input
                  id="et"
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ed">Fecha</Label>
                  <Input
                    id="ed"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eh">Hora</Label>
                  <Input
                    id="eh"
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="el">Lugar</Label>
                <Input
                  id="el"
                  maxLength={160}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edesc">Detalles</Label>
                <Textarea
                  id="edesc"
                  rows={3}
                  maxLength={2000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="rounded-full" onClick={() => create.mutate()}>
                Proponer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <section className="surface p-5">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))
            }
          >
            Anterior
          </Button>
          <p className="font-display text-lg font-semibold capitalize">{monthLabel}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))
            }
          >
            Siguiente
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) =>
            d === null ? (
              <span key={`e${i}`} />
            ) : (
              <button
                key={d}
                onClick={() => setSelected(selected === d ? null : d)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent",
                  d === todayStr && "border border-primary",
                  selected === d && "bg-primary text-primary-foreground",
                )}
              >
                {Number(d.slice(-2))}
                {dayEvents(d).length > 0 && (
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary" />
                )}
              </button>
            ),
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">
          {selected
            ? new Date(`${selected}T00:00:00`).toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : "Próximos planes"}
        </h2>
        {isLoading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : listed.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 p-12 text-center">
            <CalendarHeart className="size-7 text-primary" />
            <p className="text-sm text-muted-foreground">Nada agendado. Propongan algo rico.</p>
          </div>
        ) : (
          listed.map((e) => {
            const mine = responses?.find((r) => r.event_id === e.id && r.user_id === user?.id);
            return (
              <article key={e.id} className="surface animate-fade-up p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{labelFor(EVENT_CATEGORIES, e.category)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(`${e.date}T00:00:00`).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                    })}
                    {e.time ? ` · ${e.time}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </span>
                  {e.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      aria-label="Eliminar plan"
                      onClick={() => remove.mutate(e.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">{e.title}</h3>
                {e.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                )}
                {/* Cuenta regresiva para eventos futuros */}
                {new Date(`${e.date}T${e.time || "00:00:00"}`) > new Date() && e.countdown_enabled !== false && (
                  <div className="mt-2">
                    <Countdown targetDate={e.date} time={e.time} />
                  </div>
                )}
                {/* Botones de calendario */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => exportToGoogleCalendar(e)}
                  >
                    <ExternalLink className="mr-1 size-4" /> Google Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => addToDeviceCalendar(e)}
                  >
                    <CalendarHeart className="mr-1 size-4" /> Descargar .ics
                  </Button>
                </div>
                {e.user_id !== user?.id && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant={mine?.response_status === "aceptada" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => respond.mutate({ eventId: e.id, status: "aceptada" })}
                    >
                      <Check className="mr-1 size-4" /> Acepto
                    </Button>
                    <Button
                      size="sm"
                      variant={mine?.response_status === "rechazada" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => respond.mutate({ eventId: e.id, status: "rechazada" })}
                    >
                      <X className="mr-1 size-4" /> Ahora no
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
