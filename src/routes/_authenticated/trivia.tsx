import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Check, Eye, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { celebrate } from "@/lib/celebrate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trivia")({
  head: () => ({
    meta: [
      { title: "¿Cuánto me conoces? — Nuestro Espacio" },
      { name: "description", content: "Preguntas sobre nosotros: adivina lo que tu pareja respondió." },
      { property: "og:title", content: "¿Cuánto me conoces? — Nuestro Espacio" },
      { property: "og:description", content: "Trivia de pareja con puntos de complicidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TriviaPage,
});

const IDEAS = [
  "¿Cuál es mi comida favorita?",
  "¿Qué canción me pone de buen humor?",
  "¿Dónde fue nuestra primera cita?",
  "¿Qué me da más miedo?",
  "¿Cuál es mi sueño más grande?",
  "¿Qué detalle tuyo me enamora más?",
];

type Q = { id: string; user_id: string; question: string; answer: string; guess: string | null; correct: boolean | null; created_at: string };

function TriviaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("trivia_questions");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const { data: items = [] } = useQuery({
    queryKey: ["trivia"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("trivia_questions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Q[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["trivia"] });

  const forMe = items.filter((q) => q.user_id !== user?.id);
  const mine = items.filter((q) => q.user_id === user?.id);
  const score = useMemo(() => {
    const judged = forMe.filter((q) => q.correct !== null);
    return { hits: judged.filter((q) => q.correct).length, total: judged.length };
  }, [forMe]);

  async function add() {
    if (!question.trim() || !answer.trim() || !user) return;
    const { error } = await supabase.from("trivia_questions").insert({ user_id: user.id, question: question.trim(), answer: answer.trim() });
    if (error) return toast.error("No se pudo guardar la pregunta");
    notifyPartner(user.id, { type: "trivia", title: "Te dejé una pregunta: ¿cuánto me conoces?", message: question.trim(), link: "/trivia" }).catch(() => {});
    setQuestion(""); setAnswer(""); refresh();
    toast.success("Pregunta enviada. A ver si te conoce…");
  }

  async function guess(q: Q) {
    const g = guesses[q.id]?.trim();
    if (!g) return;
    const { error } = await supabase.from("trivia_questions").update({ guess: g, guessed_at: new Date().toISOString() }).eq("id", q.id);
    if (error) return toast.error("No se pudo enviar");
    notifyPartner(user!.id, { type: "trivia", title: "Respondió tu pregunta", message: q.question, link: "/trivia" }).catch(() => {});
    refresh();
  }

  async function judge(q: Q, correct: boolean) {
    await supabase.from("trivia_questions").update({ correct }).eq("id", q.id);
    if (correct) celebrate(24);
    refresh();
  }

  async function remove(id: string) {
    await supabase.from("trivia_questions").delete().eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Risas</p>
          <h1 className="font-display text-3xl font-semibold">¿Cuánto me conoces?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escribe una pregunta sobre ti con tu respuesta secreta. Tu pareja adivina y luego se revela.</p>
        </div>
        <div className="surface px-5 py-3 text-center">
          <p className="font-display text-2xl font-semibold text-primary">{score.hits}/{score.total}</p>
          <p className="text-[11px] text-muted-foreground">tus aciertos</p>
        </div>
      </header>

      <section className="surface space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setQuestion(i)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">{i}</button>
          ))}
        </div>
        <Input placeholder="Tu pregunta" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Input placeholder="Tu respuesta (solo se ve al revelar)" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <Button onClick={add} disabled={!question.trim() || !answer.trim()}><Plus className="size-4" /> Enviar pregunta</Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Para que adivines</h2>
        {forMe.length === 0 && <p className="text-sm text-muted-foreground">Cuando tu pareja te deje una pregunta, aparecerá aquí.</p>}
        {forMe.map((q) => (
          <article key={q.id} className="surface space-y-2 p-4">
            <p className="flex items-center gap-2 font-medium"><Brain className="size-4 text-primary" /> {q.question}</p>
            {q.guess ? (
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>Tu respuesta: <span className="text-foreground">{q.guess}</span></p>
                <p>Su respuesta: <span className="font-semibold text-primary">{q.answer}</span></p>
                <p className={cn("text-xs", q.correct ? "text-primary" : "text-muted-foreground")}>
                  {q.correct === null ? "Esperando que diga si acertaste…" : q.correct ? "¡Acertaste! Te conoce el corazón." : "Casi… ahora ya lo sabes."}
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="¿Qué crees que respondió?" value={guesses[q.id] ?? ""} onChange={(e) => setGuesses({ ...guesses, [q.id]: e.target.value })} />
                <Button onClick={() => guess(q)}><Eye className="size-4" /> Revelar</Button>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Mis preguntas</h2>
        {mine.map((q) => (
          <article key={q.id} className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{q.question}</p>
              <p className="text-xs text-muted-foreground">Tu respuesta: {q.answer} · {q.guess ? `Dijo: ${q.guess}` : "Aún no responde"}</p>
            </div>
            {q.guess && q.correct === null && (
              <>
                <Button size="sm" onClick={() => judge(q, true)}><Check className="size-4" /> Acertó</Button>
                <Button size="sm" variant="outline" onClick={() => judge(q, false)}><X className="size-4" /> No</Button>
              </>
            )}
            {q.correct !== null && <span className="text-xs text-primary">{q.correct ? "Acertó" : "No acertó"}</span>}
            <Button size="icon" variant="ghost" aria-label="Borrar" onClick={() => remove(q.id)}><Trash2 className="size-4" /></Button>
          </article>
        ))}
      </section>
    </div>
  );
}
