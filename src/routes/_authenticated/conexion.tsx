import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Handshake, Brain, CalendarHeart, Send, Plus, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCheckIns, useAgreements, useDeepQuestions, useCouplePlans } from "@/hooks/use-conexion";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conexion")({
  head: () => ({
    meta: [
      { title: "Conexión — Nuestro Espacio" },
      { name: "description", content: "Check-ins, acuerdos, preguntas profundas y planes para dos." },
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

function CheckInSection() {
  const { myCheckIns, createCheckIn } = useCheckIns();
  const [emotion, setEmotion] = useState("");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");
  const [supportType, setSupportType] = useState<typeof SUPPORT_TYPES[number]["value"]>("escuchar");

  const handleSubmit = () => {
    if (!emotion) { toast.error("Elige una emoción"); return; }
    createCheckIn.mutate(
      { emotion, energy_level: energy, need: null, note: note || null, support_type: supportType },
      { onSuccess: () => { toast.success("Check-in guardado 💕"); setEmotion(""); setNote(""); setEnergy(5); }, onError: () => toast.error("Error al guardar") }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">¿Cómo estás hoy?</CardTitle><CardDescription>Comparte tu estado emocional con tu pareja</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Emoción</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <Button key={e} variant={emotion === e ? "default" : "outline"} size="sm" onClick={() => setEmotion(e)} className="rounded-full">{e}</Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Nivel de energía: {energy}/10</Label>
            <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} className="mt-2 w-full" />
          </div>
          <div>
            <Label>¿Qué necesitas de tu pareja?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPORT_TYPES.map((t) => (
                <Button key={t.value} variant={supportType === t.value ? "default" : "outline"} size="sm" onClick={() => setSupportType(t.value)} className="rounded-full">
                  {t.label}{supportType === t.value && <Check className="ml-1 size-3" />}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Nota opcional</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cuéntale más..." className="mt-2" />
          </div>
          <Button onClick={handleSubmit} disabled={!emotion || createCheckIn.isPending} className="w-full">
            {createCheckIn.isPending ? "Guardando..." : "Compartir"}<Send className="ml-2 size-4" />
          </Button>
        </CardContent>
      </Card>
      {myCheckIns && myCheckIns.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">Check-ins recientes</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-48">{myCheckIns.slice(0, 5).map((c) => (
            <div key={c.id} className="mb-3 rounded-lg border p-3">
              <p className="font-medium">{c.emotion}</p>
              <p className="text-sm text-muted-foreground">Energía: {c.energy_level}/10 · {c.support_type}{c.note && ` · ${c.note}`}</p>
              <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("es", { weekday: "long", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          ))}</ScrollArea></CardContent>
        </Card>
      )}
    </div>
  );
}

function AgreementsSection() {
  const { agreements, createAgreement, updateAgreement } = useAgreements();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewDate, setReviewDate] = useState("");

  const handleCreate = () => {
    if (!title.trim()) { toast.error("El acuerdo necesita un título"); return; }
    createAgreement.mutate({ title: title.trim(), description: description.trim() || null, status: "propuesto", review_date: reviewDate ? new Date(reviewDate).toISOString() : null, completed_at: null }, {
      onSuccess: () => { toast.success("Acuerdo creado 🤝"); setTitle(""); setDescription(""); setReviewDate(""); },
      onError: () => toast.error("Error al crear")
    });
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateAgreement.mutate({ id, updates: { status: newStatus, completed_at: newStatus === "cumplido" ? new Date().toISOString() : null } }, { onSuccess: () => toast.success("Estado actualizado") });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Nuevo acuerdo</CardTitle><CardDescription>Creen metas o compromisos juntos</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Llamar los domingos..." /></div>
          <div><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles..." /></div>
          <div><Label>Fecha de revisión</Label><Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} /></div>
          <Button onClick={handleCreate} disabled={createAgreement.isPending} className="w-full">{createAgreement.isPending ? "Creando..." : "Crear acuerdo"}<Plus className="ml-2 size-4" /></Button>
        </CardContent>
      </Card>
      {agreements && agreements.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">Acuerdos</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-64">{agreements.map((a) => (
            <div key={a.id} className="mb-4 rounded-lg border p-4">
              <div className="flex items-center justify-between"><p className="font-medium">{a.title}</p><Badge variant={a.status === "cumplido" ? "default" : "secondary"}>{a.status.replace("_", " ")}</Badge></div>
              {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {a.status === "propuesto" && <Button size="sm" variant="outline" onClick={() => handleStatusChange(a.id, "aceptado")}>Aceptar</Button>}
                {a.status === "aceptado" && <Button size="sm" onClick={() => handleStatusChange(a.id, "en_progreso")}>Iniciar</Button>}
                {a.status === "en_progreso" && <Button size="sm" onClick={() => handleStatusChange(a.id, "cumplido")}>Cumplido</Button>}
              </div>
            </div>
          ))}</ScrollArea></CardContent>
        </Card>
      )}
    </div>
  );
}

function QuestionsSection() {
  const { questions, responses, saveResponse } = useDeepQuestions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const filteredQuestions = selectedCategory ? questions?.filter((q) => q.category === selectedCategory) : questions;

  const handleSave = (questionId: string) => {
    if (!currentAnswer.trim()) { toast.error("Escribe una respuesta"); return; }
    saveResponse.mutate({ questionId, answer: currentAnswer.trim() }, { onSuccess: () => { toast.success("Respuesta guardada 💭"); setCurrentAnswer(""); setActiveQuestionId(null); }, onError: () => toast.error("Error") });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Preguntas profundas</CardTitle><CardDescription>Descubran cosas nuevas</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={!selectedCategory ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>Todas</Button>
            {(Object.keys(QUESTION_CATEGORIES) as Array<string>).map((cat) => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{QUESTION_CATEGORIES[cat as keyof typeof QUESTION_CATEGORIES]}</Button>
            ))}
          </div>
          <ScrollArea className="h-96">
            {filteredQuestions?.map((q) => {
              const myResponse = responses?.find((r) => r.question_id === q.id);
              const isExpanded = activeQuestionId === q.id;
              return (
                <div key={q.id} className="mb-4 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{QUESTION_CATEGORIES[q.category as keyof typeof QUESTION_CATEGORIES]}</Badge>
                      <p className="font-medium">{q.question}</p>
                      {q.is_daily && <Badge className="mt-1">Diaria</Badge>}
                    </div>
                    {myResponse && <Check className="size-5 text-green-500" />}
                  </div>
                  {isExpanded && !myResponse && (
                    <div className="mt-3 space-y-2">
                      <Textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Tu respuesta..." className="min-h-[80px]" />
                      <div className="flex gap-2"><Button size="sm" onClick={() => handleSave(q.id)} disabled={saveResponse.isPending}>Guardar</Button><Button size="sm" variant="outline" onClick={() => setActiveQuestionId(null)}>Cancelar</Button></div>
                    </div>
                  )}
                  {!isExpanded && !myResponse && <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveQuestionId(q.id)}>Responder</Button>}
                  {myResponse && <div className="mt-2 rounded bg-muted p-2 text-sm italic">"{myResponse.answer}"</div>}
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function PlansSection() {
  const { plans, createPlan, votePlan } = useCouplePlans();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState({ time_available: "tarde", budget: "bajo", location_type: "casa", mood: "relajado" });
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) { toast.error("El plan necesita un título"); return; }
    createPlan.mutate({ title: title.trim(), description: description.trim() || null, ...filters } as any, {
      onSuccess: () => { toast.success("Plan creado 📅"); setTitle(""); setDescription(""); setShowForm(false); },
      onError: () => toast.error("Error")
    });
  };

  const handleVote = (planId: string, vote: "yes" | "maybe" | "no") => {
    votePlan.mutate({ planId, voteType: vote }, { onSuccess: () => toast.success("Voto registrado") });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="text-lg">Planes para dos</CardTitle><CardDescription>Propongan citas y voten</CardDescription></div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 size-4" />{showForm ? "Cancelar" : "Nuevo"}</Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Noche de películas..." /></div>
            <div><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tiempo</Label><select className="mt-1 w-full rounded-md border bg-background p-2 text-sm" value={filters.time_available} onChange={(e) => setFilters({ ...filters, time_available: e.target.value })}><option value="manana">Mañana</option><option value="tarde">Tarde</option><option value="noche">Noche</option><option value="fin_de_semana">Fin de semana</option></select></div>
              <div><Label>Presupuesto</Label><select className="mt-1 w-full rounded-md border bg-background p-2 text-sm" value={filters.budget} onChange={(e) => setFilters({ ...filters, budget: e.target.value })}><option value="gratis">Gratis</option><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select></div>
              <div><Label>Lugar</Label><select className="mt-1 w-full rounded-md border bg-background p-2 text-sm" value={filters.location_type} onChange={(e) => setFilters({ ...filters, location_type: e.target.value })}><option value="casa">Casa</option><option value="fuera">Fuera</option><option value="cercania">Cercanía</option></select></div>
              <div><Label>Ánimo</Label><select className="mt-1 w-full rounded-md border bg-background p-2 text-sm" value={filters.mood} onChange={(e) => setFilters({ ...filters, mood: e.target.value })}><option value="relajado">Relajado</option><option value="activo">Activo</option><option value="romantico">Romántico</option><option value="divertido">Divertido</option></select></div>
            </div>
            <Button onClick={handleCreate} disabled={createPlan.isPending} className="w-full">{createPlan.isPending ? "Creando..." : "Proponer plan"}</Button>
          </CardContent>
        )}
      </Card>
      {plans && plans.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">Planes propuestos</CardTitle></CardHeader>
          <CardContent><ScrollArea className="h-80">{plans.map((p) => (
            <div key={p.id} className="mb-4 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{p.title}</p>
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1"><Badge variant="outline">{p.time_available}</Badge><Badge variant="outline">{p.budget}</Badge><Badge variant="outline">{p.location_type}</Badge><Badge variant="outline">{p.mood}</Badge></div>
                </div>
                <Badge variant={p.status === "planificado" ? "default" : "secondary"}>{p.status.replace("_", " ")}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleVote(p.id, "yes")}>👍 Sí</Button>
                <Button size="sm" variant="outline" onClick={() => handleVote(p.id, "maybe")}>🤔 Quizás</Button>
                <Button size="sm" variant="outline" onClick={() => handleVote(p.id, "no")}>👎 No</Button>
              </div>
            </div>
          ))}</ScrollArea></CardContent>
        </Card>
      )}
    </div>
  );
}

function ConexionPage() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 text-center"><h1 className="text-2xl font-bold">Conexión</h1><p className="text-muted-foreground">Nuevas formas de conectar como pareja</p></div>
      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkin" className="flex items-center gap-2"><Heart className="size-4" /><span className="hidden sm:inline">Check-in</span></TabsTrigger>
          <TabsTrigger value="acuerdos" className="flex items-center gap-2"><Handshake className="size-4" /><span className="hidden sm:inline">Acuerdos</span></TabsTrigger>
          <TabsTrigger value="preguntas" className="flex items-center gap-2"><Brain className="size-4" /><span className="hidden sm:inline">Preguntas</span></TabsTrigger>
          <TabsTrigger value="planes" className="flex items-center gap-2"><CalendarHeart className="size-4" /><span className="hidden sm:inline">Planes</span></TabsTrigger>
        </TabsList>
        <TabsContent value="checkin" className="mt-4"><CheckInSection /></TabsContent>
        <TabsContent value="acuerdos" className="mt-4"><AgreementsSection /></TabsContent>
        <TabsContent value="preguntas" className="mt-4"><QuestionsSection /></TabsContent>
        <TabsContent value="planes" className="mt-4"><PlansSection /></TabsContent>
      </Tabs>
    </div>
  );
}
