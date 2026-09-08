import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Heart, Images, NotebookPen, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuestro Espacio — el rincón privado de los dos" },
      {
        name: "description",
        content:
          "Un lugar íntimo para guardar notas, fotos, citas y recuerdos de pareja. Privado, cálido y solo para ustedes dos.",
      },
      { property: "og:title", content: "Nuestro Espacio — el rincón privado de los dos" },
      {
        property: "og:description",
        content: "Notas, fotos, citas y recuerdos de pareja en un espacio privado.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: NotebookPen,
    title: "Notas que se responden",
    text: "Cartas, agradecimientos y recuerdos con hilos de conversación y reacciones.",
  },
  {
    icon: Images,
    title: "Galería compartida",
    text: "Fotos organizadas en álbumes, con favoritas, etiquetas y visor a pantalla completa.",
  },
  {
    icon: CalendarHeart,
    title: "Citas y aniversarios",
    text: "Propón planes, acepta invitaciones y no vuelvas a olvidar una fecha importante.",
  },
  {
    icon: Stars,
    title: "Deseos y diario",
    text: "Lista de deseos con votos y una línea de tiempo con los hitos de la relación.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="flex items-center gap-2 font-display text-lg font-semibold">
          <Heart className="size-5 fill-primary text-primary" /> Nuestro Espacio
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="warm-gradient relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.28em] text-primary">
            privado · sin ruido · para dos
          </p>
          <h1 className="animate-fade-up mt-5 font-display text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
            Todo lo nuestro, en un<span className="text-gradient"> solo lugar</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Un espacio íntimo donde guardar las notas que se escriben, las fotos que toman, las
            citas que planean y los hitos que quieren recordar siempre.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 shadow-[var(--shadow-lift)]">
              <Link to="/auth">Crear nuestro espacio</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link to="/auth">Ya tenemos cuenta</Link>
            </Button>
          </div>
          <Heart className="animate-heartbeat mx-auto mt-14 size-8 fill-primary/20 text-primary" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-semibold">
          Lo que pueden hacer juntos
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        Hecho con cariño para dos personas. Sus datos son solo suyos.
      </footer>
    </div>
  );
}
