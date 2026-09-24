import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices, Coins, Sparkles, Timer, Plus, Trash2, History, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/ruleta")({
  head: () => ({
    meta: [
      { title: "Ruleta de ideas · Nuestro Espacio" },
      { name: "description", content: "Su propia ruleta de citas, retos y decisiones en pareja." },
      { property: "og:title", content: "Ruleta de ideas · Nuestro Espacio" },
      { property: "og:description", content: "Su propia ruleta de citas, retos y decisiones en pareja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RuletaPage,
});

const CATS: Record<string, string> = {
  cita: "Cita",
  verdad: "Verdad",
  reto: "Reto",
  comida: "¿Qué comemos?",
};

const IDEAS: Record<string, string[]> = {
  cita: ["Picnic al atardecer", "Cine en casa con mantas", "Cocinar juntos algo nuevo"],
  verdad: ["¿Qué fue lo primero que te gustó de mí?", "¿Cuál es tu recuerdo favorito de nosotros?"],
  reto: ["Canta nuestra canción", "Baile de 1 minuto sin música"],
  comida: ["Pizza casera", "Tacos", "Algo dulce"],
};

type Item = { id: string; user_id: string; category: string; content: string };

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

function RuletaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("roulette_items");
  useRealtime("profiles");
  const [cat, setCat] = useState("cita");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [coin, setCoin] = useState<string | null>(null);
  const [secs, setSecs] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [spinCount, setSpinCount] = useState(0);

  const { data: all = [] } = useQuery({
    queryKey: ["roulette_items"],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("roulette_items")
        .select("id, user_id, category, content")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles", "ruleta"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const nameOf = (uid: string | undefined) =>
    profiles.find((p) => p.user_id === uid)?.display_name?.trim() || null;
  const myName = nameOf(user?.id);
  const partnerName = profiles.find((p) => p.user_id !== user?.id)?.display_name?.trim() || null;

  const isAll = cat === "todas";
  const items = isAll ? all : all.filter((i) => i.category === cat);

  async function add(contentArg?: string) {
    const content = (contentArg ?? text).trim();
    if (!content || !user) return;
    if (isAll) { toast("Elige un tema para agregar opciones"); return; }
    const { error } = await supabase.from("roulette_items").insert({ content, category: cat, user_id: user.id });
    if (error) { toast.error("No se pudo agregar"); return; }
    setText("");
    qc.invalidateQueries({ queryKey: ["roulette_items"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("roulette_items").delete().eq("id", id);
    if (error) { toast.error("No se pudo eliminar"); return; }
    qc.invalidateQueries({ queryKey: ["roulette_items"] });
  }

  function startEdit(i: Item) {
    setEditingId(i.id);
    setEditText(i.content);
  }

  async function saveEdit(id: string) {
    const content = editText.trim();
    if (!content) return;
    const { error } = await supabase.from("roulette_items").update({ content }).eq("id", id);
    if (error) { toast.error("No se pudo guardar"); return; }
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["roulette_items"] });
  }

  function spin() {
    if (items.length === 0) { toast("Primero agreguen opciones"); return; }
    setSpinning(true);
    let n = 0;
    let delay = 70;
    const step = () => {
      setResult(pick(items).content);
      n++;
      if (n > 14) {
        setSpinning(false);
        setResult((final) => {
          if (final) {
            setHistory((h) => [final, ...h].slice(0, 6));
          }
          return final;
        });
        setSpinCount((c) => c + 1);
        return;
      }
      delay += 22;
      window.setTimeout(step, delay);
    };
    window.setTimeout(step, delay);
  }

  function hug() {
    setSecs(20);
    const t = window.setInterval(() => {
      setSecs((s) => {
        if (s === null || s <= 1) {
          window.clearInterval(t);
          return null;
        }
        return s - 1;
      });
    }, 1000);
  }

  const coinOptions = myName && partnerName
    ? [`¡${myName} elige! 💖`, `¡${partnerName} elige! 😎`]
    : ["¡Tú eliges! 💖", "¡Yo elijo! 😎"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Ruleta de ideas</h1>
        <p className="text-muted-foreground">Llénenla con sus propias ideas y dejen que el azar decida.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dices className="size-5 text-primary" /> Gira la ruleta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATS).map(([k, label]) => (
              <Button key={k} size="sm" variant={cat === k ? "default" : "outline"} className="rounded-full" onClick={() => { setCat(k); setResult(null); }}>
                {label} ({all.filter((i) => i.category === k).length})
              </Button>
            ))}
            <Button size="sm" variant={isAll ? "default" : "outline"} className="rounded-full" onClick={() => { setCat("todas"); setResult(null); }}>
              Sorpréndeme ({all.length})
            </Button>
          </div>
          <div className={`flex min-h-28 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center font-display text-xl transition-transform ${spinning ? "scale-[1.02] animate-pulse" : ""}`}>
            {result ?? (items.length ? "Toca girar ✨" : isAll ? "Aún no hay opciones en ningún tema" : "Aún no hay opciones aquí")}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={spin} disabled={spinning}><Sparkles className="size-4" /> {spinning ? "Girando…" : "Girar"}</Button>
            {result && !spinning && (
              <Button variant="outline" onClick={spin}><Dices className="size-4" /> Otra vez</Button>
            )}
          </div>
          {spinCount > 0 && <p className="text-center text-[11px] text-muted-foreground">{spinCount} {spinCount === 1 ? "giro" : "giros"} en esta visita</p>}

          {!isAll && (
            <>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Nueva opción para "${CATS[cat]}"`} maxLength={200} />
                <Button type="submit" size="icon" aria-label="Agregar"><Plus className="size-4" /></Button>
              </form>
              {items.length < 3 && (
                <div className="flex flex-wrap gap-1.5">
                  {(IDEAS[cat] ?? []).map((idea) => (
                    <button key={idea} onClick={() => add(idea)} className="rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground">
                      + {idea}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm">
                {editingId === i.id ? (
                  <>
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={200} className="h-8" autoFocus onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEdit(i.id); } }} />
                    <button onClick={() => saveEdit(i.id)} aria-label="Guardar" className="text-primary"><Check className="size-4" /></button>
                    <button onClick={() => setEditingId(null)} aria-label="Cancelar" className="text-muted-foreground"><X className="size-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{i.content}</span>
                    {isAll && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">{CATS[i.category]}</span>}
                    <span className="text-[11px] text-muted-foreground">{i.user_id === user?.id ? "Tuya" : (partnerName ? `De ${partnerName}` : "De tu pareja")}</span>
                    {i.user_id === user?.id && (
                      <>
                        <button onClick={() => startEdit(i)} aria-label="Editar" className="text-muted-foreground hover:text-primary">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => remove(i.id)} aria-label="Eliminar" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {history.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><History className="size-3.5" /> Últimos resultados</p>
              <ul className="space-y-1 text-sm">
                {history.map((h, idx) => (
                  <li key={idx} className={idx === 0 ? "text-foreground" : "text-muted-foreground"}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="size-5 text-primary" /> ¿Quién elige?</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-center font-display text-2xl">{coin ?? "🪙"}</p>
            <Button variant="outline" className="w-full" onClick={() => setCoin(pick(coinOptions))}>Lanzar moneda</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="size-5 text-primary" /> Abrazo de 20 segundos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-center font-display text-2xl">{secs !== null ? `${secs}s 🤗` : "Listos"}</p>
            <Button variant="outline" className="w-full" onClick={hug} disabled={secs !== null}>Empezar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
