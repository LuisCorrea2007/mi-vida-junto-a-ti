import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices, Coins, Sparkles, Timer, Plus, Trash2 } from "lucide-react";
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

type Item = { id: string; user_id: string; category: string; content: string };

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

function RuletaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("roulette_items");
  const [cat, setCat] = useState("cita");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [coin, setCoin] = useState<string | null>(null);
  const [secs, setSecs] = useState<number | null>(null);

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
  const items = all.filter((i) => i.category === cat);

  async function add() {
    const content = text.trim();
    if (!content || !user) return;
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

  function spin() {
    if (items.length === 0) { toast("Primero agreguen opciones"); return; }
    setSpinning(true);
    let n = 0;
    const t = window.setInterval(() => {
      setResult(pick(items).content);
      if (++n > 12) {
        window.clearInterval(t);
        setSpinning(false);
      }
    }, 80);
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
          </div>
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center font-display text-xl">
            {result ?? (items.length ? "Toca girar ✨" : "Aún no hay opciones aquí")}
          </div>
          <Button className="w-full" onClick={spin} disabled={spinning}><Sparkles className="size-4" /> Girar</Button>

          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Nueva opción para "${CATS[cat]}"`} maxLength={200} />
            <Button type="submit" size="icon" aria-label="Agregar"><Plus className="size-4" /></Button>
          </form>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm">
                <span className="flex-1">{i.content}</span>
                <span className="text-[11px] text-muted-foreground">{i.user_id === user?.id ? "Tuya" : "De tu pareja"}</span>
                {i.user_id === user?.id && (
                  <button onClick={() => remove(i.id)} aria-label="Eliminar" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="size-5 text-primary" /> ¿Quién elige?</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-center font-display text-2xl">{coin ?? "🪙"}</p>
            <Button variant="outline" className="w-full" onClick={() => setCoin(pick(["¡Tú eliges! 💖", "¡Yo elijo! 😎"]))}>Lanzar moneda</Button>
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
