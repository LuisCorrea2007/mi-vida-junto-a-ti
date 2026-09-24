import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dices, Coins, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/ruleta")({
  head: () => ({
    meta: [
      { title: "Ruleta de ideas · Nuestro Espacio" },
      { name: "description", content: "Ideas al azar para citas, retos, verdad o reto y decisiones en pareja." },
      { property: "og:title", content: "Ruleta de ideas · Nuestro Espacio" },
      { property: "og:description", content: "Ideas al azar para citas, retos y decisiones en pareja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RuletaPage,
});

const LISTS: Record<string, { label: string; items: string[] }> = {
  cita: {
    label: "Cita",
    items: [
      "Picnic en el parque con sus snacks favoritos",
      "Noche de películas con fuerte de cobijas",
      "Cocinar juntos una receta nueva",
      "Paseo al atardecer sin celulares",
      "Karaoke en casa",
      "Visitar un café que no conozcan",
      "Noche de juegos de mesa",
      "Ver las estrellas desde un lugar alto",
      "Recrear su primera cita",
      "Día de spa en casa",
    ],
  },
  verdad: {
    label: "Verdad",
    items: [
      "¿Qué fue lo primero que te gustó de mí?",
      "¿Cuál es tu recuerdo favorito conmigo?",
      "¿Qué sueño aún no me has contado?",
      "¿Cuándo supiste que me querías?",
      "¿Qué canción te recuerda a mí?",
      "¿Qué te gustaría que hiciéramos más seguido?",
    ],
  },
  reto: {
    label: "Reto",
    items: [
      "Dame un abrazo de 20 segundos",
      "Escríbeme una nota de amor ahora mismo",
      "Imita cómo me conociste",
      "Baila conmigo una canción lenta",
      "Dime tres cosas que amas de mí",
      "Envíame la foto más bonita que tengas de nosotros",
    ],
  },
  comida: {
    label: "¿Qué comemos?",
    items: ["Pizza", "Sushi", "Hamburguesas", "Tacos", "Comida casera", "Pasta", "Pollo", "Ensalada y postre", "Desayuno para cenar"],
  },
};

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

function RuletaPage() {
  const [cat, setCat] = useState("cita");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [coin, setCoin] = useState<string | null>(null);
  const [secs, setSecs] = useState<number | null>(null);

  function spin() {
    setSpinning(true);
    let n = 0;
    const t = window.setInterval(() => {
      setResult(pick((LISTS[cat]?.items ?? [""])));
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
        <p className="text-muted-foreground">Cuando no sepan qué hacer, dejen que el azar decida.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dices className="size-5 text-primary" /> Gira la ruleta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(LISTS).map(([k, v]) => (
              <Button key={k} size="sm" variant={cat === k ? "default" : "outline"} className="rounded-full" onClick={() => { setCat(k); setResult(null); }}>
                {v.label}
              </Button>
            ))}
          </div>
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center font-display text-xl">
            {result ?? "Toca girar ✨"}
          </div>
          <Button className="w-full" onClick={spin} disabled={spinning}><Sparkles className="size-4" /> Girar</Button>
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
