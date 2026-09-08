import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { NOTE_CATEGORIES, labelFor } from "@/lib/content";
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

export const Route = createFileRoute("/_authenticated/notas/")({
  head: () => ({
    meta: [
      { title: "Notas — Nuestro Espacio" },
      { name: "description", content: "Cartas, agradecimientos y recuerdos escritos entre los dos." },
      { property: "og:title", content: "Notas — Nuestro Espacio" },
      { property: "og:description", content: "Notas compartidas de la pareja." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [archived, setArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "amor", scheduled: "" });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", { archived }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, category, is_favorite, created_at, user_id, scheduled_date")
        .eq("is_archived", archived)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.title.trim()) throw new Error("Ponle un título");
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title: form.title.trim().slice(0, 140),
        content: form.content.slice(0, 8000),
        category: form.category,
        scheduled_date: form.scheduled || null,
      });
      if (error) throw error;
      const other = profiles?.find((p) => p.id !== user.id);
      if (other) {
        await supabase.from("notifications").insert({
          user_id: other.id,
          type: "nota",
          title: "Tienes una nota nueva",
          message: form.title.trim().slice(0, 140),
        });
      }
    },
    onSuccess: () => {
      toast.success("Nota guardada");
      setForm({ title: "", content: "", category: "amor", scheduled: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = (notes ?? []).filter((n) => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchC = category === "todas" || n.category === category;
    return matchQ && matchC;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Notas</h1>
          <p className="text-sm text-muted-foreground">Lo que se quieren decir, guardado para siempre.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 size-4" /> Nueva nota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Escribir una nota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="t">Título</Label>
                <Input
                  id="t"
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c">Contenido</Label>
                <Textarea
                  id="c"
                  rows={6}
                  maxLength={8000}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                      {NOTE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s">Programar (opcional)</Label>
                  <Input
                    id="s"
                    type="date"
                    value={form.scheduled}
                    onChange={(e) => setForm({ ...form, scheduled: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="rounded-full"
                onClick={() => create.mutate()}
                disabled={create.isPending}
              >
                Guardar nota
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en las notas"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {NOTE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={archived ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setArchived((a) => !a)}
        >
          {archived ? "Viendo archivadas" : "Archivadas"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Heart className="size-8 text-primary" />
          <p className="font-display text-xl">Aquí no hay nada todavía</p>
          <p className="text-sm text-muted-foreground">La primera nota siempre es la más bonita.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((n) => (
            <Link
              key={n.id}
              to="/notas/$id"
              params={{ id: n.id }}
              className="surface animate-fade-up p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">{n.title}</h2>
                {n.is_favorite && <Star className="size-4 shrink-0 fill-primary text-primary" />}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.content}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{labelFor(NOTE_CATEGORIES, n.category)}</Badge>
                <span>
                  {profiles?.find((p) => p.id === n.user_id)?.name ?? "Alguien"} ·{" "}
                  {new Date(n.created_at).toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
