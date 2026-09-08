import { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveRestore,
  ArrowLeft,
  Star,
  Trash2,
  Mic,
  FileText,
  Download,
  Link as LinkIcon,
  ExternalLink,
  Square,
  Paperclip,
  Play,
  Pause,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useProfiles } from "@/hooks/use-profiles";
import { NOTE_CATEGORIES, REACTIONS, labelFor } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignedUrl } from "@/lib/media";
import { notifyPartner } from "@/lib/notify";
import { cn } from "@/lib/utils";

type Attachment = {
  id: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  attachment_type: string;
  created_at: string;
  user_id: string;
  url: string | null;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function whenLabel(iso: string) {
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Barras decorativas fijas para que cada audio tenga su propia "onda". */
const BARS = Array.from({ length: 28 }, (_, i) => 30 + Math.round(60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))));

function VoiceNote({
  attachment,
  author,
  mine,
  canDelete,
  onDelete,
}: {
  attachment: Attachment;
  author: string;
  mine: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { data: url } = useSignedUrl(attachment.file_path);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setCurrent(a.currentTime);
      if (a.duration && Number.isFinite(a.duration)) setProgress(a.currentTime / a.duration);
    };
    const onMeta = () => Number.isFinite(a.duration) && setDuration(a.duration);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [url]);

  function toggle() {
    const a = audioRef.current;
    if (!a || !url) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => toast.error("No pudimos reproducir el audio"));
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * a.duration;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3",
        mine ? "border-primary/30 bg-primary/10" : "border-border bg-muted/40",
      )}
    >
      <audio ref={audioRef} src={url ?? undefined} preload="metadata" />
      <button
        onClick={toggle}
        disabled={!url}
        aria-label={playing ? "Pausar" : "Reproducir"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:opacity-50"
      >
        {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className="flex h-8 cursor-pointer items-end gap-[3px]"
          onClick={seek}
          role="slider"
          aria-label="Posición del audio"
          aria-valuenow={Math.round(progress * 100)}
        >
          {BARS.map((h, i) => {
            const active = i / BARS.length <= progress;
            return (
              <span
                key={i}
                className={cn(
                  "w-full rounded-full transition-colors",
                  active ? "bg-primary" : "bg-foreground/25",
                  playing && active && "animate-pulse",
                )}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate">
            {author} · {whenLabel(attachment.created_at)}
          </span>
          <span className="font-mono">
            {formatClock(playing || current > 0 ? current : duration)}
          </span>
        </div>
      </div>
      {canDelete && (
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Eliminar audio" onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}

function DocumentCard({
  attachment,
  author,
  canDelete,
  onDelete,
}: {
  attachment: Attachment;
  author: string;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { data: url } = useSignedUrl(attachment.file_path);

  if (attachment.attachment_type === "link" && attachment.url) {
    let host = attachment.url;
    try {
      host = new URL(attachment.url).hostname.replace(/^www\./, "");
    } catch {
      /* se muestra tal cual */
    }
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background">
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
            alt=""
            width={24}
            height={24}
            loading="lazy"
            className="size-6"
          />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-semibold hover:underline"
          >
            {host}
          </a>
          <p className="truncate text-xs text-muted-foreground">{attachment.url}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {author} · {whenLabel(attachment.created_at)}
          </p>
        </div>
        <Button asChild size="icon" variant="outline" className="shrink-0 rounded-full" aria-label="Abrir enlace">
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
          </a>
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Eliminar enlace" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  }

  const name = attachment.file_path.split("/").pop() || "documento.pdf";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
        <FileText className="size-5 text-destructive" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Documento PDF</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatSize(attachment.file_size)}
          {formatSize(attachment.file_size) ? " · " : ""}
          {author} · {whenLabel(attachment.created_at)}
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" disabled={!url}>
            <a href={url ?? "#"} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-1 size-3.5" /> Ver
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" disabled={!url}>
            <a href={url ?? "#"} download={name}>
              <Download className="mr-1 size-3.5" /> Descargar
            </a>
          </Button>
        </div>
      </div>
      {canDelete && (
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Eliminar documento" onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/notas/$id")({
  head: () => ({
    meta: [
      { title: "Nota — Nuestro Espacio" },
      { name: "description", content: "Una nota compartida con sus respuestas y reacciones." },
      { property: "og:title", content: "Nota — Nuestro Espacio" },
      { property: "og:description", content: "Nota compartida de la pareja." },
    ],
  }),
  component: NoteDetail,
});

function NoteDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: profiles } = useProfiles();
  useRealtime("notes", "note_replies", "note_reactions", "note_attachments");
  const [reply, setReply] = useState("");

  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: replies } = useQuery({
    queryKey: ["note-replies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_replies")
        .select("id, content, user_id, created_at")
        .eq("note_id", id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reactions } = useQuery({
    queryKey: ["note-reactions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_reactions")
        .select("id, reaction_type, user_id")
        .eq("note_id", id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: attachments } = useQuery({
    queryKey: ["note-attachments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_attachments")
        .select("id, file_path, file_type, file_size, attachment_type, created_at, user_id, url")
        .eq("note_id", id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const addReply = useMutation({
    mutationFn: async () => {
      if (!user || !reply.trim()) throw new Error("Escribe algo primero");
      const { error } = await supabase
        .from("note_replies")
        .insert({ note_id: id, user_id: user.id, content: reply.trim().slice(0, 4000) });
      if (error) throw error;
      const other = profiles?.find((p) => p.id !== user.id);
      if (other && note) {
        await notifyPartner({
          toUserId: other.id,
          type: "respuesta",
          title: "Respondieron tu nota",
          message: note.title,
          link: `/notas/${id}#respuestas`,
        });
      }
    },
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["note-replies", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleReaction = useMutation({
    mutationFn: async (type: string) => {
      if (!user) return;
      const mine = reactions?.find((r) => r.user_id === user.id && r.reaction_type === type);
      if (mine) {
        await supabase.from("note_reactions").delete().eq("id", mine.id);
      } else {
        await supabase
          .from("note_reactions")
          .insert({ note_id: id, user_id: user.id, reaction_type: type });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["note-reactions", id] }),
  });

  const update = useMutation({
    mutationFn: async (patch: { is_favorite?: boolean; is_archived?: boolean }) => {
      const { error } = await supabase.from("notes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note", id] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota eliminada");
      qc.invalidateQueries({ queryKey: ["notes"] });
      navigate({ to: "/notas" });
    },
    onError: () => toast.error("Solo quien escribió la nota puede eliminarla"),
  });

  const uploadAttachment = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Sin sesión");
      const ext = file.name.split(".").pop() || "file";
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      let attachmentType: "image" | "audio" | "pdf" | "link" = "image";
      if (file.type.startsWith("audio/")) attachmentType = "audio";
      else if (file.type === "application/pdf") attachmentType = "pdf";
      else if (file.type.startsWith("image/")) attachmentType = "image";

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("note_attachments").insert({
        note_id: id,
        user_id: user.id,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        attachment_type: attachmentType,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Archivo adjuntado");
      qc.invalidateQueries({ queryKey: ["note-attachments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await supabase.from("note_attachments").delete().eq("id", attachmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Archivo eliminado");
      qc.invalidateQueries({ queryKey: ["note-attachments", id] });
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enlaces web
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const addLink = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      const parsed = z.string().trim().url().max(2000).safeParse(linkUrl);
      if (!parsed.success || !/^https?:\/\//i.test(parsed.data)) {
        throw new Error("Escribe una dirección válida que empiece con http:// o https://");
      }
      const { error } = await supabase.from("note_attachments").insert({
        note_id: id,
        user_id: user.id,
        file_path: "",
        attachment_type: "link",
        url: parsed.data,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enlace guardado");
      setLinkUrl("");
      setLinkOpen(false);
      qc.invalidateQueries({ queryKey: ["note-attachments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Grabación de voz
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    if (typeof MediaRecorder === "undefined") {
      toast.error("Este navegador no permite grabar audio");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setRecording(false);
        const blob = new Blob(chunks, { type: mime });
        if (blob.size < 1024) {
          toast.error("La grabación quedó vacía, inténtalo de nuevo");
          return;
        }
        const ext = mime === "audio/webm" ? "webm" : "m4a";
        uploadAttachment.mutate(new File([blob], `voz-${Date.now()}.${ext}`, { type: mime }));
      };
      recorderRef.current = rec;
      rec.start();
      setRecSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Necesitamos permiso para usar el micrófono");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  const audios = attachments?.filter((a) => a.attachment_type === "audio") ?? [];
  const docs = attachments?.filter((a) => a.attachment_type !== "audio") ?? [];


  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!note)
    return (
      <div className="surface p-12 text-center">
        <p className="font-display text-xl">Esta nota ya no existe</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/notas">Volver a las notas</Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/notas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Notas
      </Link>

      <article className="surface animate-fade-up p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{labelFor(NOTE_CATEGORIES, note.category)}</Badge>
          <span className="text-xs text-muted-foreground">
            {nameOf(note.user_id)} ·{" "}
            {new Date(note.created_at).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold">{note.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {note.content}
        </p>

        {/* Notas de voz */}
        <div className="mt-7 rounded-3xl border border-border/70 bg-background/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15">
                <Mic className="size-4 text-primary" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">Notas de voz</h3>
                <p className="text-[11px] text-muted-foreground">
                  {audios.length ? `${audios.length} audio${audios.length > 1 ? "s" : ""}` : "Aún no hay audios"}
                </p>
              </div>
            </div>
            <Button
              variant={recording ? "destructive" : "default"}
              size="sm"
              className={cn("rounded-full", recording && "animate-pulse")}
              onClick={recording ? stopRecording : startRecording}
              disabled={uploadAttachment.isPending}
            >
              {recording ? <Square className="mr-1 size-4" /> : <Mic className="mr-1 size-4" />}
              {recording ? `Detener · ${formatClock(recSeconds)}` : "Grabar"}
            </Button>
          </div>
          {audios.length > 0 ? (
            <div className="mt-4 space-y-2">
              {audios.map((att) => (
                <VoiceNote
                  key={att.id}
                  attachment={att}
                  author={nameOf(att.user_id)}
                  mine={att.user_id === user?.id}
                  canDelete={att.user_id === user?.id}
                  onDelete={() => deleteAttachment.mutate(att.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Graba un mensaje con tu voz para acompañar la nota.
            </p>
          )}
        </div>

        {/* Documentos y enlaces */}
        <div className="mt-4 rounded-3xl border border-border/70 bg-background/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15">
                <Paperclip className="size-4 text-primary" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">Documentos y enlaces</h3>
                <p className="text-[11px] text-muted-foreground">
                  {docs.length ? `${docs.length} guardado${docs.length > 1 ? "s" : ""}` : "PDF y páginas web"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAttachment.mutate(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachment.isPending}
              >
                <FileText className="mr-1 size-4" /> PDF
              </Button>
              <Button
                variant={linkOpen ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setLinkOpen((v) => !v)}
              >
                <LinkIcon className="mr-1 size-4" /> Enlace
              </Button>
            </div>
          </div>

          {linkOpen && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addLink.mutate();
              }}
            >
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                maxLength={2000}
                autoFocus
              />
              <Button type="submit" size="sm" className="rounded-full" disabled={addLink.isPending}>
                Guardar
              </Button>
            </form>
          )}

          {docs.length > 0 ? (
            <div className="mt-4 space-y-2">
              {docs.map((att) => (
                <DocumentCard
                  key={att.id}
                  attachment={att}
                  author={nameOf(att.user_id)}
                  canDelete={att.user_id === user?.id}
                  onDelete={() => deleteAttachment.mutate(att.id)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Sube un PDF o guarda un enlace de una página web.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {REACTIONS.map((r) => {
            const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
            const mine = reactions?.some((x) => x.reaction_type === r.type && x.user_id === user?.id);
            return (
              <button
                key={r.type}
                onClick={() => toggleReaction.mutate(r.type)}
                aria-label={r.label}
                className={`rounded-full border px-3 py-1 text-sm transition-transform hover:scale-105 ${
                  mine ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {r.emoji} {count > 0 && count}
              </button>
            );
          })}
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Favorita"
              onClick={() => update.mutate({ is_favorite: !note.is_favorite })}
            >
              <Star className={note.is_favorite ? "size-4 fill-primary text-primary" : "size-4"} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Archivar"
              onClick={() => update.mutate({ is_archived: !note.is_archived })}
            >
              <ArchiveRestore className="size-4" />
            </Button>
            {note.user_id === user?.id && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar"
                onClick={() => remove.mutate()}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Respuestas</h2>
        {replies?.length ? (
          replies.map((r) => (
            <div key={r.id} className="surface p-4">
              <p className="text-xs text-muted-foreground">
                {nameOf(r.user_id)} ·{" "}
                {new Date(r.created_at).toLocaleString("es", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{r.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
        )}

        <div className="surface p-4">
          <Textarea
            rows={3}
            maxLength={4000}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escribe tu respuesta…"
          />
          <Button
            className="mt-3 rounded-full"
            onClick={() => addReply.mutate()}
            disabled={addReply.isPending}
          >
            Responder
          </Button>
        </div>
      </section>
    </div>
  );
}
