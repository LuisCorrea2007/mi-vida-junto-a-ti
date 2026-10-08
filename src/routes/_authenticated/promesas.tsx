import { useMemo, useState } from "react";
import { Glyph } from "@/components/glyph";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, HandHeart, Plus, Search, Trash2, Undo2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/promesas")({
  head: () => ({
    meta: [
      { title: "Promesas — Nuestro Espacio" },
      { name: "description", content: "Las promesas que nos hacemos y las que ya cumplimos." },
      { property: "og:title", content: "Promesas — Nuestro Espacio" },
      { property: "og:description", content: "Promesas de pareja pendientes y cumplidas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PromesasPage,
});

const EMOJIS = ["promise", "heart", "home", "plane", "ring", "flower", "star", "hug"];

type Promise_ = {
  id: string;
  user_id: string;
  title: string;
  detail: string | null;
  emoji: string;
  due_date: string | null;
  kept_at: string | null;
  created_at: string;
};

function PromesasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  useRealtime("promises");

  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emoji, setEmoji] = useState("");
  const [due, setDue] = useState("");
  const [tab, setTab] = useState<"pendientes" | "cumplidas">("pendientes");
  const [q, setQ] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["promises"],
    queryFn: async (): Promise<Promise_[]> => {
      const { data, error } = await supabase.from("promises").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !title.trim()) return;
      const { error } = await supabase.from("promises").insert({
        user_id: user.id,
        title: title.trim(),
        detail: detail.trim() || null,
        emoji,
        due_date: due || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "promesa",
          title: "Te hicieron una promesa",
          message: title.trim(),
          link: "/promesas",
        });
      }
    },
    onSuccess: () => {
      setTitle(""); setDetail(""); setDue("");
      qc.invalidateQueries({ queryKey: ["promises"] });
      toast.success("Promesa guardada");
    },
    onError: () => toast.error("No se pudo guardar"),
  });

  async function update(id: string, patch: Partial<Promise_>) {
    const { error } = await supabase.from("promises").update(patch).eq("id", id);
    if (error) { toast.error("Solo quien la hizo puede cambiarla"); return; }
    qc.invalidateQueries({ queryKey: ["promises"] });
  }
  async function remove(id: string) {
    const { error } = await supabase.from("promises").delete().eq("id", id);
    if (error) { toast.error("No se pudo borrar"); return; }
    qc.invalidateQueries({ queryKey: ["promises"] });
  }

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (p) =>
        (p.kept_at ? "cumplidas" : "pendientes") === tab &&
        (!term || `${p.title} ${p.detail ?? ""}`.toLowerCase().includes(term)),
    );
  }, [items, tab, q]);

  const kept = items.filter((p) => p.kept_at).length;
  const pct = items.length ? Math.round((kept / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
          <HandHeart className="size-7 text-primary" /> Promesas
        </h1>
        <p className="text-sm text-muted-foreground">Lo que nos prometemos… y lo que ya cumplimos.</p>
      </header>

      <div className="rounded-2xl border bg-card/60 p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>{kept} de {items.length} cumplidas</span>
          <span className="text-primary">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <form
        className="grid gap-3 rounded-2xl border bg-card/60 p-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <Input placeholder="¿Qué prometes?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Fecha límite (opcional)" />
        <Textarea className="sm:col-span-2" placeholder="Detalle (opcional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {EMOJIS.map((e) => (
            <button type="button" key={e} onClick={() => setEmoji(e)}
              className={cn("rounded-full border px-3 py-1 text-sm", emoji === e && "border-primary bg-primary/15")}>
              <Glyph name={e} />
            </button>
          ))}
        </div>
        <Button type="submit" className="rounded-full sm:col-span-2" disabled={!title.trim() || add.isPending}>
          <Plus className="size-4" /> Hacer promesa
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {(["pendientes", "cumplidas"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nada por aquí todavía.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const mine = p.user_id === user?.id;
            const late = !p.kept_at && p.due_date && p.due_date < new Date().toISOString().slice(0, 10);
            return (
              <li key={p.id} className="space-y-2 rounded-2xl border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold"><Glyph name={p.emoji} /> {p.title}</p>
                  <span className="text-[11px] text-muted-foreground">{mine ? "Tuya" : "De tu pareja"}</span>
                </div>
                {p.detail && <p className="text-sm text-muted-foreground">{p.detail}</p>}
                {p.due_date && (
                  <p className={cn("flex items-center gap-1 text-xs", late ? "text-destructive" : "text-muted-foreground")}>
                    <CalendarClock className="size-3.5" />
                    {late ? "Atrasada · " : "Para el "}
                    {new Date(p.due_date + "T12:00").toLocaleDateString("es")}
                  </p>
                )}
                {p.kept_at && (
                  <p className="text-xs text-primary">
                    Cumplida el {new Date(p.kept_at).toLocaleDateString("es")}
                  </p>
                )}
                {mine && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Button size="sm" variant={p.kept_at ? "outline" : "default"} className="h-8 rounded-full"
                      onClick={() => update(p.id, { kept_at: p.kept_at ? null : new Date().toISOString() })}>
                      {p.kept_at ? <Undo2 className="size-3.5" /> : <Check className="size-3.5" />}
                      {p.kept_at ? "Pendiente" : "¡Cumplida!"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => remove(p.id)} aria-label="Borrar">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
