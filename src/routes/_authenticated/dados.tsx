import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dices, Flame, Heart, MapPin, Shuffle, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dados")({
  head: () => ({
    meta: [
      { title: "Dados del amor — Nuestro Espacio" },
      { name: "description", content: "Lanza los dados y dejen que el azar les regale un momento: un gesto, un lugar y el tiempo para disfrutarlo." },
      { property: "og:title", content: "Dados del amor — Nuestro Espacio" },
      { property: "og:description", content: "Un gesto, un lugar y un tiempo elegidos por el azar para los dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DadosPage,
});

const DECKS = {
  tierno: {
    label: "Tierno", icon: Heart,
    action: ["Un abrazo largo", "Un beso en la frente", "Decirse tres cosas que admiran", "Bailar una canción lenta", "Mirarse a los ojos sin hablar", "Una caricia en el cabello"],
    place: ["en el sofá", "en la cocina", "bajo una manta", "junto a la ventana", "en la cama", "donde estén ahora"],
  },
  atrevido: {
    label: "Atrevido", icon: Flame,
    action: ["Un beso en el cuello", "Un masaje en la espalda", "Susurrar un deseo al oído", "Un beso lento", "Quitarse una prenda", "Elegir dónde te besan"],
    place: ["con la luz apagada", "en la ducha", "contra la pared", "en la cama", "con música suave", "donde nadie mire"],
  },
} as const;
const TIMES = ["10 segundos", "30 segundos", "1 minuto", "2 minutos", "5 minutos", "lo que quieran"];
const LIKELY = [
  "¿Quién se enamoró primero?", "¿Quién pide perdón más rápido?", "¿Quién se ríe en el peor momento?", "¿Quién planearía una escapada sorpresa?",
  "¿Quién llora con una película?", "¿Quién se come el último bocado?", "¿Quién se duerme primero?", "¿Quién diría «te amo» en público?",
  "¿Quién recuerda mejor nuestras fechas?", "¿Quién baila peor?", "¿Quién se pone celoso por nada?", "¿Quién cocinaría para sorprender?",
];
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!;

function DadosPage() {
  const [deck, setDeck] = useState<keyof typeof DECKS>("tierno");
  const [roll, setRoll] = useState<{ action: string; place: string; time: string } | null>(null);
  const [spin, setSpin] = useState(0);
  const [question, setQuestion] = useState(LIKELY[0]!);
  const [qSpin, setQSpin] = useState(0);

  function throwDice() {
    const d = DECKS[deck];
    setRoll({ action: pick(d.action), place: pick(d.place), time: pick(TIMES) });
    setSpin((n) => n + 1);
  }
  const faces = [
    { icon: Heart, label: "El gesto", value: roll?.action },
    { icon: MapPin, label: "El lugar", value: roll?.place },
    { icon: Timer, label: "El tiempo", value: roll?.time },
  ];

  return (
    <div className="space-y-10">
      <header className="animate-fade-up">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Dados del amor</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Que el azar decida cómo quererse hoy</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Elijan el tono, lancen los dados y cumplan lo que salga. Sin trampas, sin excusas, con muchas ganas.</p>
      </header>

      <section className="surface space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DECKS) as (keyof typeof DECKS)[]).map((k) => {
            const D = DECKS[k];
            return <Button key={k} variant={deck === k ? "default" : "outline"} className="rounded-full" onClick={() => setDeck(k)}><D.icon className="size-4" /> {D.label}</Button>;
          })}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {faces.map((f, i) => (
            <div key={`${f.label}-${spin}`} style={{ animationDelay: `${i * 90}ms` }} className={cn("flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background/40 p-5 text-center", spin > 0 && "animate-dice")}>
              <f.icon className="size-7 text-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</p>
              <p className="font-display text-xl font-semibold">{f.value ?? "?"}</p>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={throwDice}><Dices className="size-5" /> {roll ? "Lanzar otra vez" : "Lanzar los dados"}</Button>
      </section>

      <section className="surface space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-medium"><Users className="size-4 text-primary" /> ¿Quién es más probable?</div>
        <p className="text-sm text-muted-foreground">A la cuenta de tres, señalen a quien crean. Si no coinciden, el que pierda da un beso.</p>
        <p key={qSpin} className="animate-fade-up font-display text-2xl font-semibold sm:text-3xl">{question}</p>
        <Button variant="outline" onClick={() => { let q = pick(LIKELY); while (q === question) q = pick(LIKELY); setQuestion(q); setQSpin((n) => n + 1); }}><Shuffle className="size-4" /> Otra pregunta</Button>
      </section>
    </div>
  );
}
