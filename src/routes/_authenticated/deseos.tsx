import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle, Plus, Stars, ThumbsUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { WISH_CATEGORIES, labelFor } from "@/lib/content";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/deseos")({
  head: () => ({
    meta: [
      { title: "Deseos — Nuestro Espacio" },
      { name: "description", content: "Lista compartida de lugares, planes y antojos pendientes." },
      { property: "og:title", content: "Deseos — Nuestro Espacio" },
      { property: "og:description", content: "Lista de deseos de la pareja con votos." },
    ],
  }),
  component: WishesPage,
});

function WishesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const [open, setOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "lugar",
    budget: "",
    deadline: "",
  });

  const { data: wishes, isLoading } = useQuery({
    queryKey: ["wishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishes")
        .select("id, title, description, category, is_completed, budget, deadline, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: votes } = useQuery({
    queryKey: ["wish-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wish_votes").select("id, wish_id, user_id");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["wish-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wish_comments")
        .select("id, wish_id, user_id, content, created_at")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.title.trim()) throw new Error("Escribe el deseo");
      const { error } = await supabase.from("wishes").insert({
        user_id: user.id,
        title: form.title.trim().slice(0, 140),
        description: form.description.slice(0, 2000) || null,
        category: form.category,
        budget: form.budget ? Number(form.budget) : null,
        deadline: form.deadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deseo añadido");
      setOpen(false);
      setForm({ title: "", description: "", category: "lugar", budget: "", deadline: "" });
      qc.invalidateQueries({ queryKey: ["wishes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleVote = useMutation({
    mutationFn: async (wishId: string) => {
      if (!user) return;
      const mine = votes?.find((v) => v.wish_id === wishId && v.user_id === user.id);
      if (mine) {
        await supabase.from("wish_votes").delete().eq("id", mine.id);
      } else {
        await supabase.from("wish_votes").insert({ wish_id: wishId, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wish-votes"] }),
  });

  const complete = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("wishes").update({ is_completed: done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishes"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wishes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishes"] }),
    onError: () => toast.error("Solo quien lo añadió puede eliminarlo"),
  });

  const addComment = useMutation({
    mutationFn: async (wishId: string) => {
      if (!user || !comment.trim()) throw new Error("Escribe un comentario");
      const { error } = await supabase
        .from("wish_comments")
        .insert({ wish_id: wishId, user_id: user.id, content: comment.trim().slice(0, 1000) });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["wish-comments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
  const visible = (wishes ?? [])
    .filter((w) => w.is_completed === showDone)
    .sort(
      (a, b) =>
        (votes?.filter((v) => v.wish_id === b.id).length ?? 0) -
        (votes?.filter((v) => v.wish_id === a.id).length ?? 0),
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Deseos</h1>
          <p className="text-sm text-muted-foreground">Todo lo que quieren hacer juntos, priorizado.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showDone ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setShowDone((v) => !v)}
          >
            {showDone ? "Viendo cumplidos" : "Cumplidos"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-1 size-4" /> Nuevo deseo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Añadir deseo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wt">¿Qué queremos?</Label>
                  <Input
                    id="wt"
                    maxLength={140}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WISH_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wb">Presupuesto</Label>
                    <Input
                      id="wb"
                      type="number"
                      min="0"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wd">Fecha límite</Label>
                    <Input
                      id="wd"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wdesc">Detalles</Label>
                  <Textarea
                    id="wdesc"
                    rows={3}
                    maxLength={2000}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="rounded-full" onClick={() => create.mutate()}>
                  Añadir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Stars className="size-8 text-primary" />
          <p className="font-display text-xl">La lista está vacía</p>
          <p className="text-sm text-muted-foreground">Empiecen por ese lugar que siempre mencionan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((w) => {
            const count = votes?.filter((v) => v.wish_id === w.id).length ?? 0;
            const voted = votes?.some((v) => v.wish_id === w.id && v.user_id === user?.id);
            const wc = comments?.filter((c) => c.wish_id === w.id) ?? [];
            return (
              <article key={w.id} className="surface animate-fade-up p-5">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleVote.mutate(w.id)}
                    className={cn(
                      "flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 transition-colors",
                      voted ? "border-primary bg-primary/10 text-primary" : "border-border",
                    )}
                    aria-label="Votar"
                  >
                    <ThumbsUp className="size-4" />
                    <span className="mt-1 text-sm font-semibold">{count}</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{labelFor(WISH_CATEGORIES, w.category)}</Badge>
                      {w.budget != null && (
                        <span className="text-xs text-muted-foreground">≈ {w.budget}</span>
                      )}
                      {w.deadline && (
                        <span className="text-xs text-muted-foreground">
                          antes del{" "}
                          {new Date(`${w.deadline}T00:00:00`).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <h2
                      className={cn(
                        "mt-2 font-display text-lg font-semibold",
                        w.is_completed && "line-through opacity-60",
                      )}
                    >
                      {w.title}
                    </h2>
                    {w.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{w.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => complete.mutate({ id: w.id, done: !w.is_completed })}
                      >
                        <Check className="mr-1 size-4" />
                        {w.is_completed ? "Reabrir" : "Cumplido"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setCommentFor(commentFor === w.id ? null : w.id)}
                      >
                        <MessageCircle className="mr-1 size-4" /> {wc.length}
                      </Button>
                      {w.user_id === user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          onClick={() => remove.mutate(w.id)}
                          aria-label="Eliminar deseo"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {commentFor === w.id && (
                      <div className="mt-4 space-y-2 border-t pt-4">
                        {wc.map((c) => (
                          <p key={c.id} className="text-sm">
                            <span className="text-muted-foreground">{nameOf(c.user_id)}: </span>
                            {c.content}
                          </p>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={comment}
                            maxLength={1000}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comentar…"
                          />
                          <Button className="rounded-full" onClick={() => addComment.mutate(w.id)}>
                            Enviar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
