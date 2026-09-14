import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Heart,
  Handshake,
  Brain,
  CalendarHeart,
  Send,
  Plus,
  Check,
  Sparkles,
  Star,
  Trash2,
  HeartHandshake,
} from "lucide-react";
import {
  useCheckIns,
  useAgreements,
  useDeepQuestions,
  useCouplePlans,
  useGratitudes,
  type DeepQuestion,
} from "@/hooks/use-conexion";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conexion")({
  head: () => ({
    meta: [
      { title: "Conexión — Nuestro Espacio" },
      {
        name: "description",
        content: "Check-ins, gratitud, acuerdos, preguntas propias y planes para dos.",
      },
      { property: "og:title", content: "Conexión — Nuestro Espacio" },
      {
        property: "og:description",
        content: "Un lugar para cuidarnos: cómo estamos, qué agradecemos y qué soñamos juntos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConexionPage,
});

const EMOTIONS = ["😊 Feliz", "😌 Tranquilo", "😔 Triste", "😤 Estresado", "😴 Cansado", "💪 Energético"];
const SUPPORT_TYPES = [
  { value: "escuchar", label: "Escuchar" },
  { value: "espacio", label: "Dar espacio" },
  { value: "abrazar", label: "Abrazar" },
  { value: "conversar", label: "Conversar" },
  { value: "ayudar", label: "Ayudar" },
] as const;

const QUESTION_CATEGORIES = {
  futuro: "🔮 Futuro",
  cariño: "💕 Cariño",
  confianza: "🤝 Confianza",
  recuerdos: "📸 Recuerdos",
  diversion: "🎉 Diversión",
} as const;

type Category = keyof typeof QUESTION_CATEGORIES;

function fecha(iso: string) {
  return new Date(iso).toLocaleString("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================ CHECK-IN ============================ */

function CheckInSection() {
  const { myCheckIns, partnerCheckIns, createCheckIn } = useCheckIns();
  const [emotion, setEmotion] = useState("");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");
  const [supportType, setSupportType] = useState<(typeof SUPPORT_TYPES)[number]["value"]>("escuchar");

  const racha = useMemo(() => {
    const dias = new Set((myCheckIns ?? []).map((c) => c.created_at.slice(0, 10)));
    let n = 0;
    const d = new Date();
    while (dias.has(d.toISOString().slice(0, 10))) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [myCheckIns]);

  const ultimo = partnerCheckIns?.[0];

  const handleSubmit = () => {
    if (!emotion) {
      toast.error("Elige una emoción");
      return;
    }
    createCheckIn.mutate(
      { emotion, energy_level: energy, need: null, note: note.trim() || null, support_type: supportType },
      {
        onSuccess: () => {
          toast.success("Check-in guardado 💕");
          setEmotion("");
          setNote("");
          setEnergy(5);
        },
        onError: () => toast.error("No se pudo guardar"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {ultimo && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Heart className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Tu amor se siente {ultimo.emotion}</p>
              <p className="text-xs text-muted-foreground">
                Energía {ultimo.energy_level}/10 · necesita {ultimo.support_type} · {fecha(ultimo.created_at)}
              </p>
              {ultimo.note && <p className="mt-1 text-sm italic">“{ultimo.note}”</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">¿Cómo estás hoy?</CardTitle>
              <CardDescription>Comparte tu estado emocional con tu pareja</CardDescription>
            </div>
            {racha > 0 && <Badge variant="secondary">🔥 {racha} día(s) seguidos</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Emoción</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <Button
                  key={e}
                  variant={emotion === e ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmotion(e)}
                  className="rounded-full transition-transform active:scale-95"
                >
                  {e}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Nivel de energía: {energy}/10</Label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <Label>¿Qué necesitas de tu pareja?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPORT_TYPES.map((t) => (
                <Button
                  key={t.value}
                  variant={supportType === t.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSupportType(t.value)}
                  className="rounded-full"
                >
                  {t.label}
                  {supportType === t.value && <Check className="ml-1 size-3" />}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Nota opcional</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cuéntale más..."
              maxLength={500}
              className="mt-2"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!emotion || createCheckIn.isPending}
            className="w-full rounded-full"
          >
            {createCheckIn.isPending ? "Guardando..." : "Compartir"}
            <Send className="ml-2 size-4" />
          </Button>
        </CardContent>
      </Card>

      {myCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tus check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 pr-3">
              {myCheckIns.slice(0, 8).map((c) => (
                <div key={c.id} className="mb-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <p className="font-medium">{c.emotion}</p>
                  <p className="text-sm text-muted-foreground">
                    Energía {c.energy_level}/10 · {c.support_type}
                    {c.note && ` · ${c.note}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{fecha(c.created_at)}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================ GRATITUD ============================ */

const GRATITUD_IDEAS = [
  "Gracias por escucharme cuando estaba cansado.",
  "Gracias por hacerme reír hoy.",
  "Gracias por tu paciencia conmigo.",
  "Gracias por cuidarme sin que te lo pida.",
];

function GratitudeSection() {
  const { gratitudes, createGratitude, toggleGratitudeFavorite, deleteGratitude } = useGratitudes();
  const [content, setContent] = useState("");

  const guardar = () => {
    if (!content.trim()) {
      toast.error("Escribe algo lindo primero");
      return;
    }
    createGratitude.mutate(content.trim(), {
      onSuccess: () => {
        toast.success("Gracias enviadas 💗");
        setContent("");
      },
      onError: () => toast.error("No se pudo guardar"),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gracias por…</CardTitle>
          <CardDescription>Un detalle al día que quieras agradecerle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hoy te agradezco por..."
            maxLength={400}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setContent(GRATITUD_IDEAS[Math.floor(Math.random() * GRATITUD_IDEAS.length)]!)}
            >
              <Sparkles className="mr-1 size-4" /> Sugerencia
            </Button>
            <Button onClick={guardar} disabled={createGratitude.isPending} className="rounded-full">
              {createGratitude.isPending ? "Enviando..." : "Enviar gracias"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {gratitudes && gratitudes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nuestro muro de gratitud</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 pr-3">
              {gratitudes.map((g) => (
                <div key={g.id} className="mb-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <p className="text-sm">{g.content}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{fecha(g.created_at)}</p>
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => toggleGratitudeFavorite.mutate({ id: g.id, isFavorite: !g.is_favorite })}
                        aria-label="Favorito"
                      >
                        <Star className={cn("size-4", g.is_favorite && "fill-primary text-primary")} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => deleteGratitude.mutate(g.id)}
                        aria-label="Borrar"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================ ACUERDOS ============================ */

function AgreementsSection() {
  const { agreements, createAgreement, updateAgreement } = useAgreements();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("El acuerdo necesita un título");
      return;
    }
    createAgreement.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        status: "propuesto",
        review_date: reviewDate ? new Date(reviewDate).toISOString() : null,
        completed_at: null,
      },
      {
        onSuccess: () => {
          toast.success("Acuerdo creado 🤝");
          setTitle("");
          setDescription("");
          setReviewDate("");
          setShowForm(false);
        },
        onError: () => toast.error("No se pudo crear"),
      },
    );
  };

  const handleStatusChange = (id: string, newStatus: "aceptado" | "en_progreso" | "cumplido" | "archivado") => {
    updateAgreement.mutate(
      {
        id,
        updates: {
          status: newStatus,
          completed_at: newStatus === "cumplido" ? new Date().toISOString() : null,
        },
      },
      { onSuccess: () => toast.success("Estado actualizado") },
    );
  };

  const cumplidos = (agreements ?? []).filter((a) => a.status === "cumplido").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Nuestros acuerdos</CardTitle>
              <CardDescription>
                {cumplidos > 0 ? `${cumplidos} cumplidos juntos 🎉` : "Creen metas o compromisos juntos"}
              </CardDescription>
            </div>
            <Button size="sm" className="rounded-full" onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-1 size-4" />
              {showForm ? "Cancelar" : "Nuevo"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Llamar los domingos..."
                maxLength={120}
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles..."
                maxLength={500}
              />
            </div>
            <div>
              <Label>Fecha de revisión</Label>
              <Input className="mt-1" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={createAgreement.isPending} className="w-full rounded-full">
              {createAgreement.isPending ? "Creando..." : "Crear acuerdo"}
            </Button>
          </CardContent>
        )}
      </Card>

      {agreements && agreements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 pr-3">
              {agreements.map((a) => (
                <div key={a.id} className="mb-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{a.title}</p>
                    <Badge variant={a.status === "cumplido" ? "default" : "secondary"}>
                      {a.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                  {a.review_date && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Revisión: {new Date(a.review_date).toLocaleDateString("es")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.status === "propuesto" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleStatusChange(a.id, "aceptado")}>
                        Aceptar
                      </Button>
                    )}
                    {a.status === "aceptado" && (
                      <Button size="sm" className="rounded-full" onClick={() => handleStatusChange(a.id, "en_progreso")}>
                        Iniciar
                      </Button>
                    )}
                    {a.status === "en_progreso" && (
                      <Button size="sm" className="rounded-full" onClick={() => handleStatusChange(a.id, "cumplido")}>
                        Cumplido
                      </Button>
                    )}
                    {a.status !== "archivado" && a.status !== "cumplido" && (
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => handleStatusChange(a.id, "archivado")}>
                        Archivar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================ PREGUNTAS ============================ */

function QuestionsSection() {
  const { questions, responses, partnerResponses, saveResponse, toggleFavorite, createQuestion, deleteQuestion } =
    useDeepQuestions();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [nueva, setNueva] = useState("");
  const [nuevaCat, setNuevaCat] = useState<Category>("cariño");
  const [showForm, setShowForm] = useState(false);

  const lista = useMemo(() => {
    let l: DeepQuestion[] = questions ?? [];
    if (selectedCategory) l = l.filter((q) => q.category === selectedCategory);
    if (soloPendientes) l = l.filter((q) => !responses.some((r) => r.question_id === q.id));
    return l;
  }, [questions, selectedCategory, soloPendientes, responses]);

  const handleSave = (questionId: string) => {
    if (!currentAnswer.trim()) {
      toast.error("Escribe una respuesta");
      return;
    }
    saveResponse.mutate(
      { questionId, answer: currentAnswer.trim() },
      {
        onSuccess: () => {
          toast.success("Respuesta guardada 💭");
          setCurrentAnswer("");
          setActiveQuestionId(null);
        },
        onError: () => toast.error("No se pudo guardar"),
      },
    );
  };

  const crear = () => {
    if (nueva.trim().length < 6) {
      toast.error("Escribe una pregunta más completa");
      return;
    }
    createQuestion.mutate(
      { question: nueva.trim(), category: nuevaCat },
      {
        onSuccess: () => {
          toast.success("Pregunta creada ✨");
          setNueva("");
          setShowForm(false);
        },
        onError: () => toast.error("No se pudo crear"),
      },
    );
  };

  const alAzar = () => {
    const pendientes = (questions ?? []).filter((q) => !responses.some((r) => r.question_id === q.id));
    const q = pendientes[Math.floor(Math.random() * pendientes.length)];
    if (!q) {
      toast.success("¡Ya respondieron todas! Crea una nueva ✨");
      return;
    }
    setSelectedCategory(null);
    setSoloPendientes(false);
    setActiveQuestionId(q.id);
    setCurrentAnswer("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Preguntas profundas</CardTitle>
              <CardDescription>
                {responses.length} respondidas · {partnerResponses.length} de tu amor
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={alAzar}>
                <Sparkles className="mr-1 size-4" /> Al azar
              </Button>
              <Button size="sm" className="rounded-full" onClick={() => setShowForm(!showForm)}>
                <Plus className="mr-1 size-4" />
                {showForm ? "Cancelar" : "Crear"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div>
                <Label>Tu pregunta</Label>
                <Textarea
                  className="mt-1"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  placeholder="¿Qué te gustaría que hiciéramos en cinco años?"
                  maxLength={300}
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(QUESTION_CATEGORIES) as Category[]).map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={nuevaCat === cat ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setNuevaCat(cat)}
                    >
                      {QUESTION_CATEGORIES[cat]}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={crear} disabled={createQuestion.isPending} className="w-full rounded-full">
                {createQuestion.isPending ? "Creando..." : "Agregar pregunta"}
              </Button>
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {(Object.keys(QUESTION_CATEGORIES) as Category[]).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(cat)}
              >
                {QUESTION_CATEGORIES[cat]}
              </Button>
            ))}
            <Button
              variant={soloPendientes ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSoloPendientes(!soloPendientes)}
            >
              Sin responder
            </Button>
          </div>

          <ScrollArea className="h-96 pr-3">
            {lista.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay preguntas aquí. Crea una nueva ✨
              </p>
            )}
            {lista.map((q) => {
              const myResponse = responses.find((r) => r.question_id === q.id);
              const theirResponse = partnerResponses.find((r) => r.question_id === q.id);
              const isExpanded = activeQuestionId === q.id;
              return (
                <div key={q.id} className="mb-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-1">
                        <Badge variant="outline">{QUESTION_CATEGORIES[q.category]}</Badge>
                        {q.is_daily && <Badge>Diaria</Badge>}
                        {q.user_id && <Badge variant="secondary">Nuestra</Badge>}
                      </div>
                      <p className="font-medium">{q.question}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {myResponse && <Check className="size-5 text-primary" />}
                      {q.user_id && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Borrar pregunta"
                          onClick={() => deleteQuestion.mutate(q.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Tu respuesta..."
                        maxLength={1000}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full" onClick={() => handleSave(q.id)} disabled={saveResponse.isPending}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setActiveQuestionId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isExpanded && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 rounded-full"
                      onClick={() => {
                        setActiveQuestionId(q.id);
                        setCurrentAnswer(myResponse?.answer ?? "");
                      }}
                    >
                      {myResponse ? "Editar respuesta" : "Responder"}
                    </Button>
                  )}

                  {myResponse && !isExpanded && (
                    <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-background/60 p-2">
                      <p className="text-sm italic">“{myResponse.answer}”</p>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Favorito"
                        onClick={() => toggleFavorite.mutate({ id: myResponse.id, isFavorite: !myResponse.is_favorite })}
                      >
                        <Star className={cn("size-4", myResponse.is_favorite && "fill-primary text-primary")} />
                      </Button>
                    </div>
                  )}

                  {theirResponse && (
                    <div className="mt-2 rounded-lg bg-primary/10 p-2 text-sm">
                      {myResponse ? (
                        <span className="italic">“{theirResponse.answer}”</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Tu amor ya respondió. Responde tú para verla 💗
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ PLANES ============================ */

const PLAN_FILTERS = {
  time_available: [
    ["manana", "Mañana"],
    ["tarde", "Tarde"],
    ["noche", "Noche"],
    ["fin_de_semana", "Fin de semana"],
  ],
  budget: [
    ["gratis", "Gratis"],
    ["bajo", "Bajo"],
    ["medio", "Medio"],
    ["alto", "Alto"],
  ],
  location_type: [
    ["casa", "Casa"],
    ["fuera", "Fuera"],
    ["cercania", "Cercanía"],
  ],
  mood: [
    ["relajado", "Relajado"],
    ["activo", "Activo"],
    ["romantico", "Romántico"],
    ["divertido", "Divertido"],
  ],
} as const;

function PlansSection() {
  const { plans, votes, createPlan, votePlan, updatePlan, deletePlan } = useCouplePlans();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState({
    time_available: "tarde",
    budget: "bajo",
    location_type: "casa",
    mood: "relajado",
  });
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("El plan necesita un título");
      return;
    }
    createPlan.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        planned_date: null,
        ...filters,
      } as never,
      {
        onSuccess: () => {
          toast.success("Plan creado 📅");
          setTitle("");
          setDescription("");
          setShowForm(false);
        },
        onError: () => toast.error("No se pudo crear"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Planes para dos</CardTitle>
              <CardDescription>Propongan citas y voten</CardDescription>
            </div>
            <Button size="sm" className="rounded-full" onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-1 size-4" />
              {showForm ? "Cancelar" : "Nuevo"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Noche de películas..."
                maxLength={120}
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles..."
                maxLength={500}
              />
            </div>
            {(Object.keys(PLAN_FILTERS) as Array<keyof typeof PLAN_FILTERS>).map((campo) => (
              <div key={campo}>
                <Label>
                  {campo === "time_available"
                    ? "Tiempo"
                    : campo === "budget"
                      ? "Presupuesto"
                      : campo === "location_type"
                        ? "Lugar"
                        : "Ánimo"}
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PLAN_FILTERS[campo].map(([value, label]) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={filters[campo] === value ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setFilters({ ...filters, [campo]: value })}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={handleCreate} disabled={createPlan.isPending} className="w-full rounded-full">
              {createPlan.isPending ? "Creando..." : "Proponer plan"}
            </Button>
          </CardContent>
        )}
      </Card>

      {plans && plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planes propuestos</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-3">
              {plans.map((p) => {
                const planVotes = (votes ?? []).filter((v) => v.plan_id === p.id);
                const yes = planVotes.filter((v) => v.vote_type === "yes").length;
                const match = yes >= 2;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "mb-3 rounded-xl border border-border/70 bg-muted/30 p-4",
                      match && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{p.title}</p>
                        {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="outline">{p.time_available.replace("_", " ")}</Badge>
                          <Badge variant="outline">{p.budget}</Badge>
                          <Badge variant="outline">{p.location_type}</Badge>
                          <Badge variant="outline">{p.mood}</Badge>
                        </div>
                      </div>
                      <Badge variant={p.status === "planificado" ? "default" : "secondary"}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {match && (
                      <p className="mt-2 text-sm text-primary">¡Los dos dijeron sí! 💞 Agéndenlo.</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => votePlan.mutate({ planId: p.id, voteType: "yes" })}>
                        👍 Sí {yes > 0 && `(${yes})`}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => votePlan.mutate({ planId: p.id, voteType: "maybe" })}>
                        🤔 Quizás
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => votePlan.mutate({ planId: p.id, voteType: "no" })}>
                        👎 No
                      </Button>
                      {p.status !== "planificado" && p.status !== "completado" && (
                        <Button size="sm" className="rounded-full" onClick={() => updatePlan.mutate({ id: p.id, updates: { status: "planificado" } })}>
                          Agendar
                        </Button>
                      )}
                      {p.status === "planificado" && (
                        <Button size="sm" className="rounded-full" onClick={() => updatePlan.mutate({ id: p.id, updates: { status: "completado" } })}>
                          Lo hicimos
                        </Button>
                      )}
                      <Button size="icon-sm" variant="ghost" aria-label="Borrar plan" onClick={() => deletePlan.mutate(p.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================ PÁGINA ============================ */

function ConexionPage() {
  useRealtime(
    "couple_checkins",
    "couple_agreements",
    "deep_questions",
    "question_responses",
    "couple_plans",
    "plan_votes",
    "gratitudes",
  );

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold">Conexión</h1>
        <p className="text-sm text-muted-foreground">Cuidarnos todos los días, en pequeñas cosas</p>
      </header>
      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="checkin" className="gap-2">
            <Heart className="size-4" />
            <span className="hidden sm:inline">Check-in</span>
          </TabsTrigger>
          <TabsTrigger value="gratitud" className="gap-2">
            <HeartHandshake className="size-4" />
            <span className="hidden sm:inline">Gratitud</span>
          </TabsTrigger>
          <TabsTrigger value="acuerdos" className="gap-2">
            <Handshake className="size-4" />
            <span className="hidden sm:inline">Acuerdos</span>
          </TabsTrigger>
          <TabsTrigger value="preguntas" className="gap-2">
            <Brain className="size-4" />
            <span className="hidden sm:inline">Preguntas</span>
          </TabsTrigger>
          <TabsTrigger value="planes" className="gap-2">
            <CalendarHeart className="size-4" />
            <span className="hidden sm:inline">Planes</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="checkin" className="mt-4">
          <CheckInSection />
        </TabsContent>
        <TabsContent value="gratitud" className="mt-4">
          <GratitudeSection />
        </TabsContent>
        <TabsContent value="acuerdos" className="mt-4">
          <AgreementsSection />
        </TabsContent>
        <TabsContent value="preguntas" className="mt-4">
          <QuestionsSection />
        </TabsContent>
        <TabsContent value="planes" className="mt-4">
          <PlansSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
