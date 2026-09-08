import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, ArrowLeft, Star, Trash2, Mic, FileText, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { NOTE_CATEGORIES, REACTIONS, labelFor } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignedUrl } from "@/lib/media";

function AttachmentItem({ attachment, canDelete, onDelete }: { 
  attachment: any; 
  canDelete: boolean; 
  onDelete: () => void;
}) {
  const { data: url } = useSignedUrl(attachment.file_path);
  
  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.file_path.split("/").pop() || "archivo";
    a.click();
  };

  if (attachment.attachment_type === "audio") {
    return (
      <div className="surface flex items-center gap-3 p-3 rounded-lg">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
          <Mic className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Nota de voz</p>
          <p className="text-xs text-muted-foreground">{formatSize(attachment.file_size)}</p>
        </div>
        <audio src={url} controls className="h-8" />
        <Button variant="ghost" size="icon" onClick={handleDownload}>
          <Download className="size-4" />
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  }

  if (attachment.attachment_type === "pdf") {
    return (
      <div className="surface flex items-center gap-3 p-3 rounded-lg">
        <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
          <FileText className="size-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Documento PDF</p>
          <p className="text-xs text-muted-foreground">{formatSize(attachment.file_size)}</p>
        </div>
        {url && (
          <iframe src={`${url}#toolbar=0`} className="w-24 h-12 border rounded" title="PDF preview" />
        )}
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-1 size-4" /> Descargar
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  }

  return null;
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
        await supabase.from("notifications").insert({
          user_id: other.id,
          type: "respuesta",
          title: "Respondieron tu nota",
          message: note.title,
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

        {/* Adjuntos: audios y PDFs */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Adjuntos</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,application/pdf,image/*"
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
            >
              <Mic className="mr-1 size-4" />
              Agregar audio/PDF
            </Button>
          </div>

          {attachments && attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((att) => (
                <AttachmentItem
                  key={att.id}
                  attachment={att}
                  canDelete={att.user_id === user?.id}
                  onDelete={() => deleteAttachment.mutate(att.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin adjuntos todavía</p>
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
