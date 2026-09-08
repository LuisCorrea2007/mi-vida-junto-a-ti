import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Laugh, Lightbulb, Brain, HelpCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/_authenticated/diversion")({
  head: () => ({
    meta: [
      { title: "Diversión — Nuestro Espacio" },
      { name: "description", content: "Chistes, adivinanzas, trivia y preguntas divertidas para la pareja." },
      { property: "og:title", content: "Diversión — Nuestro Espacio" },
      { property: "og:description", content: "Momentos divertidos compartidos." },
    ],
  }),
  component: FunPage,
});

const FUN_CATEGORIES = [
  { value: "chiste", label: "Chiste", icon: Laugh },
  { value: "adivinanza", label: "Adivinanza", icon: Lightbulb },
  { value: "trivia", label: "Trivia", icon: Brain },
  { value: "pregunta", label: "Pregunta", icon: HelpCircle },
] as const;

type FunCategory = typeof FUN_CATEGORIES[number]["value"];

interface FunItem {
  id: string;
  category: string;
  content: string;
  answer?: string | null;
  options?: string[] | null;
  user_id: string;
  created_at: string;
}

function FunPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState<FunCategory | "todas">("todas");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    category: FunCategory;
    content: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  }>({
    category: "chiste",
    content: "",
    answer: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["fun-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fun_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.content.trim()) throw new Error("Escribe algo divertido");

      const options = form.category === "trivia" 
        ? [form.option1, form.option2, form.option3, form.option4].filter(o => o.trim())
        : null;

      const { error } = await supabase.from("fun_items").insert({
        user_id: user.id,
        category: form.category,
        content: form.content.trim(),
        answer: form.category !== "chiste" ? form.answer.trim() : null,
        options: options?.length ? options : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("¡Agregado!");
      setForm({ category: "chiste", content: "", answer: "", option1: "", option2: "", option3: "", option4: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["fun-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fun_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["fun-items"] });
    },
  });

  const visible = (items ?? []).filter((i) => category === "todas" || i.category === category);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Diversión</h1>
          <p className="text-sm text-muted-foreground">Ríanse, jueguen y conozcan cosas nuevas del otro.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 size-4" /> Agregar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Agregar algo divertido</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v: FunCategory) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUN_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  rows={4}
                  maxLength={1000}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={
                    form.category === "chiste" ? "Escribe el chiste..." :
                    form.category === "adivinanza" ? "Escribe la adivinanza..." :
                    form.category === "trivia" ? "Escribe la pregunta..." :
                    "Escribe tu pregunta..."
                  }
                />
              </div>
              {form.category !== "chiste" && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Respuesta correcta</Label>
                  <Input
                    id="answer"
                    maxLength={200}
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    placeholder="La respuesta es..."
                  />
                </div>
              )}
              {form.category === "trivia" && (
                <div className="space-y-2">
                  <Label>Opciones (mínimo 2)</Label>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Opción A"
                      value={form.option1}
                      onChange={(e) => setForm({ ...form, option1: e.target.value })}
                    />
                    <Input
                      placeholder="Opción B"
                      value={form.option2}
                      onChange={(e) => setForm({ ...form, option2: e.target.value })}
                    />
                    <Input
                      placeholder="Opción C (opcional)"
                      value={form.option3}
                      onChange={(e) => setForm({ ...form, option3: e.target.value })}
                    />
                    <Input
                      placeholder="Opción D (opcional)"
                      value={form.option4}
                      onChange={(e) => setForm({ ...form, option4: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button className="rounded-full" onClick={() => create.mutate()} disabled={create.isPending}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={category === "todas" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setCategory("todas")}
        >
          Todos
        </Button>
        {FUN_CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Button
              key={c.value}
              variant={category === c.value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCategory(c.value)}
            >
              <Icon className="mr-1 size-4" /> {c.label}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Laugh className="size-8 text-primary" />
          <p className="font-display text-xl">¡Agreguen algo divertido!</p>
          <p className="text-sm text-muted-foreground">Empiecen con un chiste malo 😄</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <FunCard
              key={item.id}
              item={item}
              canDelete={item.user_id === user?.id}
              onDelete={() => remove.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FunCard({ item, canDelete, onDelete }: { item: FunItem; canDelete: boolean; onDelete: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const CategoryIcon = FUN_CATEGORIES.find((c) => c.value === item.category)?.icon || HelpCircle;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (item.answer && option === item.answer) {
      toast.success("¡Correcto! 🎉");
    } else if (item.answer) {
      toast.error(`Incorrecto. La respuesta era: ${item.answer}`);
    }
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon className="size-5 text-primary" />
            <Badge variant="secondary">
              {FUN_CATEGORIES.find((c) => c.value === item.category)?.label}
            </Badge>
          </div>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{item.content}</p>
        
        {item.category === "trivia" && item.options && (
          <div className="mt-4 space-y-2">
            <RadioGroup value={selectedOption ?? ""}>
              {item.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`opt-${item.id}-${idx}`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!selectedOption}
                  />
                  <Label htmlFor={`opt-${item.id}-${idx}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {selectedOption && item.answer && (
              <p className={`mt-2 text-sm font-medium ${
                selectedOption === item.answer ? "text-green-600" : "text-red-600"
              }`}>
                {selectedOption === item.answer ? "✅ ¡Correcto!" : `❌ La respuesta era: ${item.answer}`}
              </p>
            )}
          </div>
        )}

        {(item.category === "adivinanza" || item.category === "pregunta") && item.answer && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? "Ocultar respuesta" : "Ver respuesta"}
            </Button>
            {showAnswer && (
              <p className="mt-2 text-sm font-medium text-primary">{item.answer}</p>
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Agregado {new Date(item.created_at).toLocaleDateString("es", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
