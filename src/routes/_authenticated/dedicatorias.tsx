import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Link2,
  Mail,
  MessageCircle,
  Paperclip,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { notifyPartner } from "@/lib/notify";
import { useSignedUrl } from "@/lib/media";
import { REACTIONS } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dedicatorias")({
  head: () => ({
    meta: [
      { title: "Dedicatorias — Nuestro Espacio" },
      { name: "description", content: "Cartas, enlaces y archivos que se dedican el uno al otro, para siempre." },
      { property: "og:title", content: "Dedicatorias — Nuestro Espacio" },
      { property: "og:description", content: "Lo que nos dedicamos, guardado para siempre." },
    ],
  }),
  component: DedicationsPage,
});

type Kind = "carta" | "enlace" | "archivo";

type Dedication = {
  id: string;
  user_id: string;
  kind: Kind;
  title: string;
  content: string | null;
  url: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
};

type Comment = { id: string; user_id: string; content: string; created_at: string };
type Reaction = { id: string; user_id: string; reaction_type: string };

const KIND_META: Record<Kind, { label: string; icon: typeof Mail }> = {
  carta: { label: "Carta", icon: Mail },
  enlace: { label: "Enlace", icon: Link2 },
  archivo: { label: "Archivo", icon: Paperclip },
};

function formatSize(bytes?: number | null) {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function DedicationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  const { data: couple } = useCouple(user?.id);
  useRealtime("dedications", "dedication_comments", "dedication_reactions");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"todas" | Kind | "favoritas">("todas");
  const [query, setQuery] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["dedications"],
    queryFn: async (): Promise<Dedication[]> => {
      const { data, error } = await supabase
        .from("dedications")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Dedication[];
    },
  });

  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";

  const toggleFavorite = useMutation({
    mutationFn: async (d: Dedication) => {
      const { error } = await supabase
        .from("dedications")
        .update({ is_favorite: !d.is_favorite })
        .eq("id", d.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dedications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async (d: Dedication) => {
      const { error } = await supabase
        .from("dedications")
        .update({ is_archived: true })
        .eq("id", d.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dedications"] });
      toast.success("Dedicatoria archivada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = items ?? [];
    if (filter === "favoritas") list = list.filter((d) => d.is_favorite);
    else if (filter !== "todas") list = list.filter((d) => d.kind === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        [d.title, d.content ?? "", d.url ?? ""].join(" ").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, query]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Para siempre</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Dedicatorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cartas, canciones y archivos que se dedican el uno al otro.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Gift className="mr-2 size-4" /> Dedicar algo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <NewDedicationForm
              userId={user?.id}
              partnerId={couple?.partnerId ?? null}
              myName={nameOf(user?.id ?? "")}
              onDone={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "todas", label: "Todas" },
            { value: "carta", label: "Cartas" },
            { value: "enlace", label: "Enlaces" },
            { value: "archivo", label: "Archivos" },
            { value: "favoritas", label: "Favoritas" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              filter === f.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DedicationCard
              key={d.id}
              d={d}
              mine={d.user_id === user?.id}
              nameOf={nameOf}
              onFavorite={() => toggleFavorite.mutate(d)}
              onArchive={() => archive.mutate(d)}
            />
          ))}
        </div>
      ) : (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Gift className="size-12 text-muted-foreground" />
          <p className="font-display text-xl">Aún no hay dedicatorias</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Dedícale una carta, esa canción que los describe o el video que siempre ven juntos.
          </p>
        </div>
      )}
    </div>
  );
}

function NewDedicationForm({
  userId,
  partnerId,
  myName,
  onDone,
}: {
  userId: string | undefined;
  partnerId: string | null;
  myName: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("carta");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const create = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sin sesión");
      if (!title.trim()) throw new Error("Ponle un título");
      let filePath: string | null = null;
      let fileType: string | null = null;
      let fileSize: number | null = null;

      if (kind === "archivo") {
        if (!file) throw new Error("Elige un archivo");
        if (file.size > 50 * 1024 * 1024) throw new Error("Máximo 50 MB");
        const ext = file.name.split(".").pop() || "bin";
        filePath = `dedicatorias/${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("media")
          .upload(filePath, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        fileType = file.type;
        fileSize = file.size;
      }
      if (kind === "enlace") {
        const u = url.trim();
        if (!u) throw new Error("Pega el enlace");
        try {
          new URL(u.startsWith("http") ? u : `https://${u}`);
        } catch {
          throw new Error("Ese enlace no parece válido");
        }
      }
      if (kind === "carta" && !content.trim()) throw new Error("Escribe la carta");

      const { error } = await supabase.from("dedications").insert({
        user_id: userId,
        kind,
        title: title.trim(),
        content: kind === "carta" ? content.trim() : content.trim() || null,
        url: kind === "enlace" ? (url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`) : null,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
      });
      if (error) throw error;

      if (partnerId) {
        await notifyPartner({
          toUserId: partnerId,
          type: "dedicatoria",
          title: `${myName} te dedicó algo`,
          message: title.trim(),
          link: "/dedicatorias",
        });
      }
    },
    onSuccess: () => {
      toast.success("¡Dedicatoria guardada para siempre!");
      qc.invalidateQueries({ queryKey: ["dedications"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">Dedicar algo especial</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(KIND_META) as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-colors",
              kind === k
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {(() => {
              const Icon = KIND_META[k].icon;
              return <Icon className="size-5" />;
            })()}
            {KIND_META[k].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ded-title">Título</Label>
        <Input
          id="ded-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "carta" ? "Para mi amor…" : "¿Qué le dedicas?"}
          maxLength={120}
        />
      </div>

      {kind === "carta" && (
        <div className="space-y-2">
          <Label htmlFor="ded-content">Tu carta</Label>
          <Textarea
            id="ded-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escríbele con el corazón…"
            rows={7}
          />
        </div>
      )}

      {kind === "enlace" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ded-url">Enlace</Label>
            <Input
              id="ded-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… (canción, video, página)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ded-note">¿Por qué se lo dedicas? (opcional)</Label>
            <Textarea
              id="ded-note"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Esta canción me recuerda a…"
              rows={2}
            />
          </div>
        </>
      )}

      {kind === "archivo" && (
        <>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="video/*,image/*,audio/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Upload className="size-4" />
            {file ? `${file.name} · ${formatSize(file.size)}` : "Elegir video, foto, audio o PDF"}
          </button>
          <div className="space-y-2">
            <Label htmlFor="ded-note2">Dedicatoria (opcional)</Label>
            <Textarea
              id="ded-note2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Un mensajito para acompañarlo…"
              rows={2}
            />
          </div>
        </>
      )}

      <DialogFooter>
        <Button className="rounded-full" disabled={create.isPending} onClick={() => create.mutate()}>
          {create.isPending ? "Guardando…" : "Guardar para siempre"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function DedicationCard({
  d,
  mine,
  nameOf,
  onFavorite,
  onArchive,
}: {
  d: Dedication;
  mine: boolean;
  nameOf: (id: string) => string;
  onFavorite: () => void;
  onArchive: () => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = KIND_META[d.kind].icon;

  return (
    <>
      <article
        id={`ded-${d.id}`}
        className="surface group flex flex-col p-5 transition-shadow target:ring-2 target:ring-primary hover:shadow-[var(--shadow-lift)]"
      >
        <button className="flex-1 text-left" onClick={() => setOpen(true)}>
          <div className="flex items-start justify-between gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon className="size-5" />
            </span>
            {d.is_favorite && <Star className="size-4 fill-primary text-primary" />}
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{d.title}</h3>
          {d.content && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.content}</p>
          )}
          {d.kind === "enlace" && d.url && (
            <p className="mt-2 flex items-center gap-1 truncate text-xs text-primary">
              <Link2 className="size-3 shrink-0" /> {new URL(d.url).hostname}
            </p>
          )}
          {d.kind === "archivo" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Archivo {d.file_type?.split("/")[1]?.toUpperCase() ?? ""} · {formatSize(d.file_size)}
            </p>
          )}
        </button>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-[11px] text-muted-foreground">
            {nameOf(d.user_id)} ·{" "}
            {new Date(d.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}
          </p>
          <div className="flex items-center gap-1">
            {mine && (
              <>
                <button
                  onClick={onFavorite}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Favorita"
                >
                  <Star className={cn("size-4", d.is_favorite && "fill-primary text-primary")} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("¿Archivar esta dedicatoria? Dejará de verse en la lista.")) onArchive();
                  }}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Archivar"
                >
                  <Archive className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </article>
      <DedicationDetail d={d} open={open} onOpenChange={setOpen} mine={mine} nameOf={nameOf} />
    </>
  );
}

function DedicationDetail({
  d,
  open,
  onOpenChange,
  mine,
  nameOf,
}: {
  d: Dedication;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mine: boolean;
  nameOf: (id: string) => string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: fileUrl } = useSignedUrl(d.file_path);
  const [comment, setComment] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["dedication-comments", d.id],
    enabled: open,
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("dedication_comments")
        .select("id, user_id, content, created_at")
        .eq("dedication_id", d.id)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
  });

  const { data: reactions } = useQuery({
    queryKey: ["dedication-reactions", d.id],
    enabled: open,
    queryFn: async (): Promise<Reaction[]> => {
      const { data, error } = await supabase
        .from("dedication_reactions")
        .select("id, user_id, reaction_type")
        .eq("dedication_id", d.id);
      if (error) throw error;
      return (data ?? []) as Reaction[];
    },
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      if (!user || !text.trim()) return;
      const { error } = await supabase.from("dedication_comments").insert({
        dedication_id: d.id,
        user_id: user.id,
        content: text.trim(),
      });
      if (error) throw error;
      if (d.user_id !== user.id) {
        await notifyPartner({
          toUserId: d.user_id,
          type: "comentario_dedicatoria",
          title: "Comentaron tu dedicatoria",
          message: `${d.title}: ${text.trim()}`,
          link: `/dedicatorias#ded-${d.id}`,
        });
      }
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["dedication-comments", d.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleReaction = useMutation({
    mutationFn: async (type: string) => {
      if (!user) return;
      const existing = reactions?.find((r) => r.user_id === user.id && r.reaction_type === type);
      if (existing) {
        const { error } = await supabase.from("dedication_reactions").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dedication_reactions").insert({
          dedication_id: d.id,
          user_id: user.id,
          reaction_type: type,
        });
        if (error) throw error;
        if (d.user_id !== user.id) {
          const r = REACTIONS.find((x) => x.type === type);
          await notifyPartner({
            toUserId: d.user_id,
            type: "reaccion_dedicatoria",
            title: `Reaccionaron a tu dedicatoria ${r?.emoji ?? ""}`,
            message: d.title,
            link: `/dedicatorias#ded-${d.id}`,
          });
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dedication-reactions", d.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("dedications").delete().eq("id", d.id);
      if (error) throw error;
      if (d.file_path) await supabase.storage.from("media").remove([d.file_path]);
    },
    onSuccess: () => {
      toast.success("Dedicatoria eliminada");
      qc.invalidateQueries({ queryKey: ["dedications"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function download() {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = d.title;
    a.rel = "noopener";
    a.click();
  }

  const isVideo = d.file_type?.startsWith("video/");
  const isImage = d.file_type?.startsWith("image/");
  const isAudio = d.file_type?.startsWith("audio/");
  const isPdf = d.file_type === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-7 font-display text-xl sm:text-2xl">
            <Badge variant="secondary">{KIND_META[d.kind].label}</Badge>
            {d.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Dedicado por {nameOf(d.user_id)} ·{" "}
            {new Date(d.created_at).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </DialogHeader>

        {d.kind === "carta" && (
          <div className="rounded-2xl border border-primary/25 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)] p-4 sm:p-8">
            <Mail className="mb-4 size-6 text-primary" />
            <p className="whitespace-pre-wrap font-display text-lg italic leading-relaxed">
              {d.content}
            </p>
            <p className="mt-6 text-right font-display text-sm text-muted-foreground">
              — {nameOf(d.user_id)}
            </p>
          </div>
        )}

        {d.kind === "enlace" && d.url && (
          <a
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(d.url).hostname}&sz=64`}
              alt=""
              className="size-8 rounded-md"
              loading="lazy"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{d.url}</span>
              <span className="text-xs text-muted-foreground">Abrir en una pestaña nueva</span>
            </span>
            <ExternalLink className="size-4 shrink-0 text-primary" />
          </a>
        )}

        {d.kind === "archivo" && (
          <div className="space-y-3">
            {isVideo && fileUrl && (
              <video src={fileUrl} controls className="w-full rounded-xl bg-black" />
            )}
            {isImage && fileUrl && (
              <img src={fileUrl} alt={d.title} className="w-full rounded-xl" loading="lazy" />
            )}
            {isAudio && fileUrl && <audio src={fileUrl} controls className="w-full" />}
            {isPdf && fileUrl && (
              <iframe src={fileUrl} title={d.title} className="h-96 w-full rounded-xl border" />
            )}
            {!fileUrl && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" /> Cargando archivo…
              </div>
            )}
            <Button variant="outline" className="rounded-full" onClick={download} disabled={!fileUrl}>
              <Download className="mr-2 size-4" /> Descargar {formatSize(d.file_size)}
            </Button>
          </div>
        )}

        {d.kind !== "carta" && d.content && (
          <p className="rounded-xl bg-muted/50 p-4 text-sm italic text-muted-foreground">
            “{d.content}”
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {REACTIONS.map((r) => {
            const mine_r = reactions?.some((x) => x.user_id === user?.id && x.reaction_type === r.type);
            const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
            return (
              <button
                key={r.type}
                onClick={() => toggleReaction.mutate(r.type)}
                title={r.label}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-transform hover:scale-110",
                  mine_r ? "border-primary bg-primary/15" : "border-border",
                )}
              >
                {r.emoji}
                {count > 0 && <span className="text-xs">{count}</span>}
              </button>
            );
          })}
          {mine && (
            <button
              className="ml-auto rounded-full p-2 text-muted-foreground hover:text-destructive"
              aria-label="Eliminar"
              onClick={() => {
                if (window.confirm("¿Eliminar esta dedicatoria para siempre?")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        <div className="space-y-3 border-t border-border/60 pt-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="size-4" /> Comentarios
          </p>
          {comments?.length ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium">{nameOf(c.user_id)}:</span> {c.content}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
          )}
          <div className="flex gap-2">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe algo bonito…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && comment.trim()) addComment.mutate(comment);
              }}
            />
            <Button
              size="sm"
              className="rounded-full"
              disabled={!comment.trim() || addComment.isPending}
              onClick={() => addComment.mutate(comment)}
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
