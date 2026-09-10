import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Laugh,
  Lightbulb,
  Brain,
  HelpCircle,
  Plus,
  Trash2,
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { cn } from "@/lib/utils";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const REACTIONS = [
  { type: "risa", emoji: "😂", label: "Me hizo reír" },
  { type: "amor", emoji: "❤️", label: "Me encanta" },
  { type: "sorpresa", emoji: "😮", label: "No me lo esperaba" },
  { type: "aplauso", emoji: "👏", label: "Bien hecho" },
  { type: "fuego", emoji: "🔥", label: "Buenísimo" },
] as const;

type FunCategory = typeof FUN_CATEGORIES[number]["value"];

interface FunItem {
  id: string;
  category: string;
  content: string;
  answer?: string | null;
  options?: string[] | null;
  is_favorite: boolean;
  user_id: string;
  created_at: string;
}

type Reaction = { id: string; fun_item_id: string; user_id: string; reaction_type: string };
type Comment = { id: string; fun_item_id: string; user_id: string; content: string; created_at: string };
type Rating = { id: string; fun_item_id: string; user_id: string; score: number };

function FunPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("fun_items", "fun_comments", "fun_reactions", "fun_ratings");
  const { data: profiles } = useProfiles();
  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");
  const partnerId = profiles?.find((p) => p.id !== user?.id)?.id ?? null;

  const [category, setCategory] = useState<FunCategory | "todas">("todas");
  const [sort, setSort] = useState<"recientes" | "mejores">("recientes");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
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
    queryFn: async (): Promise<FunItem[]> => {
      const { data, error } = await supabase
        .from("fun_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FunItem[];
    },
  });

  const { data: reactions } = useQuery({
    queryKey: ["fun-reactions"],
    queryFn: async (): Promise<Reaction[]> => {
      const { data, error } = await supabase
        .from("fun_reactions")
        .select("id, fun_item_id, user_id, reaction_type");
      if (error) throw error;
      return (data ?? []) as Reaction[];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["fun-comments"],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("fun_comments")
        .select("id, fun_item_id, user_id, content, created_at")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
  });

  const { data: ratings } = useQuery({
    queryKey: ["fun-ratings"],
    queryFn: async (): Promise<Rating[]> => {
      const { data, error } = await supabase
        .from("fun_ratings")
        .select("id, fun_item_id, user_id, score");
      if (error) throw error;
      return (data ?? []) as Rating[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.content.trim()) throw new Error("Escribe algo divertido");

      const options =
        form.category === "trivia"
          ? [form.option1, form.option2, form.option3, form.option4].filter((o) => o.trim())
          : null;

      const { error } = await supabase.from("fun_items").insert({
        user_id: user.id,
        category: form.category,
        content: form.content.trim(),
        answer: form.category !== "chiste" ? form.answer.trim() : null,
        options: options?.length ? options : null,
      });
      if (error) throw error;
      if (partnerId) {
        const label = FUN_CATEGORIES.find((c) => c.value === form.category)?.label ?? "algo";
        await notifyPartner({
          toUserId: partnerId,
          type: "diversion_nuevo",
          title: `Nuevo ${label.toLowerCase()} para ti 😄`,
          message: form.content.trim().slice(0, 120),
          link: "/diversion",
        });
      }
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
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFavorite = useMutation({
    mutationFn: async (item: FunItem) => {
      const { error } = await supabase
        .from("fun_items")
        .update({ is_favorite: !item.is_favorite })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-items"] }),
    onError: () => toast.error("Solo puedes marcar como favorito lo que escribiste tú"),
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ item, type }: { item: FunItem; type: string }) => {
      if (!user) return;
      const existing = reactions?.find(
        (r) => r.fun_item_id === item.id && r.user_id === user.id && r.reaction_type === type,
      );
      if (existing) {
        const { error } = await supabase.from("fun_reactions").delete().eq("id", existing.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("fun_reactions")
        .insert({ fun_item_id: item.id, user_id: user.id, reaction_type: type });
      if (error) throw error;
      if (item.user_id !== user.id) {
        const r = REACTIONS.find((x) => x.type === type);
        await notifyPartner({
          toUserId: item.user_id,
          type: "diversion_reaccion",
          title: `Reaccionaron a lo que escribiste ${r?.emoji ?? ""}`,
          message: item.content.slice(0, 120),
          link: "/diversion",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-reactions"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rate = useMutation({
    mutationFn: async ({ item, score }: { item: FunItem; score: number }) => {
      if (!user) return;
      const existing = ratings?.find((r) => r.fun_item_id === item.id && r.user_id === user.id);
      if (existing) {
        const { error } = await supabase.from("fun_ratings").update({ score }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("fun_ratings")
          .insert({ fun_item_id: item.id, user_id: user.id, score });
        if (error) throw error;
      }
      if (item.user_id !== user.id) {
        await notifyPartner({
          toUserId: item.user_id,
          type: "diversion_puntuacion",
          title: `Le pusieron ${score} de 5 ⭐ a lo que escribiste`,
          message: item.content.slice(0, 120),
          link: "/diversion",
        });
      }
    },
    onSuccess: () => {
      toast.success("¡Puntuado!");
      qc.invalidateQueries({ queryKey: ["fun-ratings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addComment = useMutation({
    mutationFn: async ({ item, text }: { item: FunItem; text: string }) => {
      if (!user || !text.trim()) return;
      const { error } = await supabase
        .from("fun_comments")
        .insert({ fun_item_id: item.id, user_id: user.id, content: text.trim() });
      if (error) throw error;
      if (item.user_id !== user.id) {
        await notifyPartner({
          toUserId: item.user_id,
          type: "diversion_comentario",
          title: "Comentaron lo que escribiste 💬",
          message: text.trim().slice(0, 120),
          link: "/diversion",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-comments"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fun_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-comments"] }),
  });

  const averageOf = (id: string) => {
    const list = (ratings ?? []).filter((r) => r.fun_item_id === id);
    if (list.length === 0) return null;
    return {
      avg: list.reduce((s, r) => s + r.score, 0) / list.length,
      votes: list.length,
    };
  };

  const visible = useMemo(() => {
    let list = (items ?? []).filter((i) => category === "todas" || i.category === category);
    if (onlyFavorites) list = list.filter((i) => i.is_favorite);
    if (sort === "mejores") {
      list = list.slice().sort((a, b) => (averageOf(b.id)?.avg ?? 0) - (averageOf(a.id)?.avg ?? 0));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ratings, category, onlyFavorites, sort]);

  function surpriseMe() {
    const pool = (items ?? []).filter((i) => i.user_id !== user?.id);
    const list = pool.length > 0 ? pool : (items ?? []);
    if (list.length === 0) {
      toast.error("Agreguen algo primero 😄");
      return;
    }
    const pick = list[Math.floor(Math.random() * list.length)]!;
    setCategory("todas");
    setOnlyFavorites(false);
    setHighlight(pick.id);
    setTimeout(() => {
      document.getElementById(`fun-${pick.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    setTimeout(() => setHighlight(null), 4000);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Diversión</h1>
          <p className="text-sm text-muted-foreground">Ríanse, jueguen y conozcan cosas nuevas del otro.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={surpriseMe}>
            <Sparkles className="mr-1 size-4" /> Sorpréndeme
          </Button>
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
                      form.category === "chiste"
                        ? "Escribe el chiste..."
                        : form.category === "adivinanza"
                          ? "Escribe la adivinanza..."
                          : form.category === "trivia"
                            ? "Escribe la pregunta..."
                            : "Escribe tu pregunta..."
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
        </div>
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
        <Button
          variant={onlyFavorites ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setOnlyFavorites((v) => !v)}
        >
          <Heart className={cn("mr-1 size-4", onlyFavorites && "fill-current")} /> Favoritos
        </Button>
        <Button
          variant="ghost"
          className="rounded-full"
          onClick={() => setSort((s) => (s === "recientes" ? "mejores" : "recientes"))}
        >
          <Star className="mr-1 size-4" />
          {sort === "recientes" ? "Más recientes" : "Mejor puntuados"}
        </Button>
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
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <FunCard
              key={item.id}
              item={item}
              mine={item.user_id === user?.id}
              highlighted={highlight === item.id}
              authorName={nameOf(item.user_id)}
              nameOf={nameOf}
              myId={user?.id}
              rating={averageOf(item.id)}
              myScore={ratings?.find((r) => r.fun_item_id === item.id && r.user_id === user?.id)?.score ?? null}
              reactions={(reactions ?? []).filter((r) => r.fun_item_id === item.id)}
              comments={(comments ?? []).filter((c) => c.fun_item_id === item.id)}
              onDelete={() => remove.mutate(item.id)}
              onToggleFavorite={() => toggleFavorite.mutate(item)}
              onReact={(type) => toggleReaction.mutate({ item, type })}
              onRate={(score) => rate.mutate({ item, score })}
              onComment={(text) => addComment.mutate({ item, text })}
              onDeleteComment={(id) => removeComment.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stars({
  value,
  onPick,
}: {
  value: number | null;
  onPick: (score: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value ?? 0;
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Puntuar con ${n}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onPick(n)}
          className="p-0.5 transition-transform hover:scale-125"
        >
          <Star
            className={cn(
              "size-4",
              n <= active ? "fill-gold text-gold" : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function FunCard({
  item,
  mine,
  highlighted,
  authorName,
  nameOf,
  myId,
  rating,
  myScore,
  reactions,
  comments,
  onDelete,
  onToggleFavorite,
  onReact,
  onRate,
  onComment,
  onDeleteComment,
}: {
  item: FunItem;
  mine: boolean;
  highlighted: boolean;
  authorName: string;
  nameOf: (id: string) => string;
  myId: string | undefined;
  rating: { avg: number; votes: number } | null;
  myScore: number | null;
  reactions: Reaction[];
  comments: Comment[];
  onDelete: () => void;
  onToggleFavorite: () => void;
  onReact: (type: string) => void;
  onRate: (score: number) => void;
  onComment: (text: string) => void;
  onDeleteComment: (id: string) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
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
    <Card
      id={`fun-${item.id}`}
      className={cn(
        "animate-fade-up scroll-mt-24 transition-shadow target:ring-2 target:ring-primary",
        highlighted && "ring-2 ring-primary shadow-[0_0_35px_-8px_var(--primary)]",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryIcon className="size-5 text-primary" />
            <Badge variant="secondary">
              {FUN_CATEGORIES.find((c) => c.value === item.category)?.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {mine && (
              <Button variant="ghost" size="icon" aria-label="Favorito" onClick={onToggleFavorite}>
                <Heart className={cn("size-4", item.is_favorite ? "fill-primary text-primary" : "text-muted-foreground")} />
              </Button>
            )}
            {mine && (
              <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={onDelete}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
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
                  <Label htmlFor={`opt-${item.id}-${idx}`} className="cursor-pointer text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {selectedOption && item.answer && (
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  selectedOption === item.answer ? "text-primary" : "text-destructive",
                )}
              >
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
            {showAnswer && <p className="mt-2 text-sm font-medium text-primary">{item.answer}</p>}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {REACTIONS.map((r) => {
            const mineR = reactions.some((x) => x.user_id === myId && x.reaction_type === r.type);
            const count = reactions.filter((x) => x.reaction_type === r.type).length;
            return (
              <button
                key={r.type}
                title={r.label}
                onClick={() => onReact(r.type)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-transform hover:scale-110",
                  mineR ? "border-primary bg-primary/15" : "border-border",
                )}
              >
                {r.emoji}
                {count > 0 && <span className="text-xs">{count}</span>}
              </button>
            );
          })}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="ml-auto flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            <MessageCircle className="size-3.5" /> {comments.length}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Stars value={myScore} onPick={onRate} />
          <p className="text-xs text-muted-foreground">
            {rating ? `${rating.avg.toFixed(1)} ★ · ${rating.votes} ${rating.votes === 1 ? "voto" : "votos"}` : "Sin puntuar"}
          </p>
        </div>

        {showComments && (
          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            {comments.length > 0 ? (
              <ul className="max-h-40 space-y-2 overflow-y-auto">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium">{nameOf(c.user_id)}:</span> {c.content}
                    </span>
                    {c.user_id === myId && (
                      <button
                        aria-label="Borrar comentario"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteComment(c.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Sé el primero en comentar.</p>
            )}
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un comentario…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) {
                    onComment(text);
                    setText("");
                  }
                }}
              />
              <Button
                size="icon"
                className="rounded-full"
                aria-label="Enviar comentario"
                disabled={!text.trim()}
                onClick={() => {
                  onComment(text);
                  setText("");
                }}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Por {authorName} ·{" "}
          {new Date(item.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}
        </p>
      </CardContent>
    </Card>
  );
}
