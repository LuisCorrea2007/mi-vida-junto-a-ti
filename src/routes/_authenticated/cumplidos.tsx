import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Quote, Search, Sparkles, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/cumplidos")({
  head: () => ({
    meta: [
      { title: "Frasco de cumplidos — Nuestro Espacio" },
      { name: "description", content: "Cosas bonitas que nos escribimos para sacar una al azar cuando haga falta." },
      { property: "og:title", content: "Frasco de cumplidos — Nuestro Espacio" },
      { property: "og:description", content: "Un frasco lleno de palabras bonitas de los dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CumplidosPage,
});

type Compliment = {
  id: string;
  user_id: string;
  text: string;
  read_at: string | null;
  created_at: string;
};

function CumplidosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  useRealtime("compliments");

  const [text, setText] = useState("");
  const [tab, setTab] = useState<"paraMi" | "mios">("paraMi");
  const [q, setQ] = useState("");
  const [drawn, setDrawn] = useState<Compliment | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["compliments"],
    queryFn: async (): Promise<Compliment[]> => {
      const { data, error } = await supabase.from("compliments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !text.trim()) return;
      const { error } = await supabase.from("compliments").insert({ user_id: user.id, text: text.trim() });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "cumplido",
          title: "Te dejaron algo bonito en el frasco 💌",
          message: text.trim().slice(0, 80),
          link: "/cumplidos",
        });
      }
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["compliments"] });
      toast.success("Guardado en el frasco");
    },
    onError: () => toast.error("No se pudo guardar"),
  });

  async function markRead(id: string) {
    const { error } = await supabase.from("compliments").update({ read_at: new Date().toISOString() }).eq("id", id);
    if (!error) qc.invalidateQueries({ queryKey: ["compliments"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("compliments").delete().eq("id", id);
    if (error) { toast.error("No se pudo borrar"); return; }
    qc.invalidateQueries({ queryKey: ["compliments"] });
  }

  const forMe = useMemo(() => items.filter((c) => c.user_id !== user?.id), [items, user?.id]);
  const mine = useMemo(() => items.filter((c) => c.user_id === user?.id), [items, user?.id]);
  const unread = forMe.filter((c) => !c.read_at).length;

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = tab === "paraMi" ? forMe : mine;
    return term ? base.filter((c) => c.text.toLowerCase().includes(term)) : base;
  }, [tab, forMe, mine, q]);

  function draw() {
    const pool = forMe.length ? forMe : mine;
    if (!pool.length) { toast("El frasco está vacío: escribe algo bonito primero"); return; }
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    setDrawn(pick);
    if (pick.user_id !== user?.id && !pick.read_at) markRead(pick.id);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
          <Quote className="size-7 text-primary" /> Frasco de cumplidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Escriban cosas bonitas y saquen una al azar cuando el día lo necesite.
          {unread > 0 && <span className="ml-1 text-primary">Tienes {unread} sin leer.</span>}
        </p>
      </header>

      <form
        className="space-y-3 rounded-2xl border bg-card/60 p-4"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <Textarea
          placeholder="Escribe algo bonito para tu pareja…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
        />
        <Button type="submit" className="rounded-full" disabled={!text.trim() || add.isPending}>
          <Plus className="size-4" /> Guardar en el frasco
        </Button>
      </form>

      <div className="rounded-2xl border bg-card/60 p-6 text-center">
        {drawn ? (
          <div className="space-y-3">
            <p className="font-display text-xl">“{drawn.text}”</p>
            <p className="text-xs text-muted-foreground">
              {drawn.user_id === user?.id ? "Lo escribiste tú" : "Lo escribió tu pareja"} · {new Date(drawn.created_at).toLocaleDateString("es")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Toca el botón y deja que el frasco te sorprenda.</p>
        )}
        <Button className="mt-4 rounded-full" onClick={draw}>
          <Sparkles className="size-4" /> {drawn ? "Sacar otro" : "Sacar uno al azar"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([["paraMi", `Para mí (${forMe.length})`], ["mios", `Escritos por mí (${mine.length})`]] as const).map(([v, label]) => (
          <Button key={v} size="sm" variant={tab === v ? "default" : "outline"} className="rounded-full" onClick={() => setTab(v)}>
            {label}
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
          {shown.map((c) => {
            const mineRow = c.user_id === user?.id;
            return (
              <li key={c.id} className={cn("space-y-2 rounded-2xl border bg-card/60 p-4", !c.read_at && !mineRow && "border-primary/50")}>
                <p className="text-sm">“{c.text}”</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{new Date(c.created_at).toLocaleDateString("es")}</span>
                  <span className="flex items-center gap-1">
                    {!mineRow && !c.read_at && (
                      <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => markRead(c.id)}>
                        <Check className="size-3.5" /> Leído
                      </Button>
                    )}
                    {mineRow && (
                      <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => remove(c.id)} aria-label="Borrar">
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
