import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Video, Upload, Download, MessageCircle, Clock, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useProfiles, type Profile } from "@/hooks/use-profiles";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({
    meta: [
      { title: "Videos Diarios — Nuestro Espacio" },
      { name: "description", content: "Videos de lo que hacemos en el día." },
    ],
  }),
  component: VideosPage,
});

type VideoRow = {
  id: string;
  user_id: string;
  titulo: string;
  descripcion: string | null;
  file_path: string;
  file_size: number;
  created_at: string;
};

type ComentarioRow = {
  id: string;
  user_id: string;
  contenido: string;
  created_at: string;
};

function VideosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  useRealtime("videos_diarios", "video_comentarios");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos_diarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VideoRow[];
    },
  });

  const subirVideo = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Sin sesión");
      if (!titulo.trim()) throw new Error("Agrega un título");

      setSubiendo(true);
      const ext = file.name.split(".").pop() || "mp4";
      const filePath = `${user.id}/videos/${crypto.randomUUID()}.${ext}`;

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Guardar metadata en DB
      const { error: dbError } = await supabase.from("videos_diarios").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      // Notificar a la pareja
      const other = profiles?.find((p: Profile) => p.id !== user.id);
      if (other) {
        await notifyPartner({
          toUserId: other.id,
          type: "video",
          title: "Nuevo video diario",
          message: `${profiles?.find((p: Profile) => p.id === user.id)?.name} subió un video: ${titulo.trim()}`,
          link: "/videos",
        });
      }
    },
    onSuccess: () => {
      toast.success("¡Video subido!");
      setTitulo("");
      setDescripcion("");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setSubiendo(false),
  });

  const agregarComentario = useMutation({
    mutationFn: async ({ videoId, contenido }: { videoId: string; contenido: string }) => {
      if (!user || !contenido.trim()) throw new Error("Escribe un comentario");
      
      const { error } = await supabase.from("video_comentarios").insert({
        video_id: videoId,
        user_id: user.id,
        contenido: contenido.trim(),
      });
      
      if (error) throw error;
      
      // Obtener dueño del video para notificar
      const video = videos?.find((v: VideoRow) => v.id === videoId);
      if (video && video.user_id !== user.id) {
        await notifyPartner({
          toUserId: video.user_id,
          type: "comentario_video",
          title: "Comentaron tu video",
          message: titulo,
          link: `/videos#video-${videoId}`,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-comentarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Solo se permiten archivos de video");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("El video no puede pesar más de 50MB");
        return;
      }
      subirVideo.mutate(file);
    }
    e.target.value = "";
  };

  const nameOf = (uid: string) => profiles?.find((p: Profile) => p.id === uid)?.name ?? "Alguien";

  const borrarVideo = useMutation({
    mutationFn: async (video: VideoRow) => {
      const { error } = await supabase.from("videos_diarios").delete().eq("id", video.id);
      if (error) throw new Error("Solo quien subió el video puede borrarlo");
      await supabase.storage.from("media").remove([video.file_path]);
    },
    onSuccess: () => {
      toast.success("Video borrado");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const term = busqueda.trim().toLowerCase();
  const visibles = (videos ?? []).filter(
    (v) =>
      !term ||
      v.titulo.toLowerCase().includes(term) ||
      (v.descripcion ?? "").toLowerCase().includes(term),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">
          <Video className="size-7" /> Videos Diarios
        </h1>
        <p className="text-sm text-muted-foreground">
          Compartí momentos de tu día en video
        </p>
      </header>

      {/* Formulario de subida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" /> Subir nuevo video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Qué estás haciendo?"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntale qué pasó en ese momento…"
              maxLength={500}
              rows={2}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            className="w-full rounded-full sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendo || !titulo.trim()}
          >
            {subiendo ? (
              <>Subiendo...</>
            ) : (
              <>
                <Upload className="mr-2 size-4" /> Seleccionar video
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Máximo 50MB. Formatos: MP4, WebM, MOV
          </p>
        </CardContent>
      </Card>

      {/* Lista de videos */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-64 animate-pulse" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video: VideoRow) => (
            <VideoCard
              key={video.id}
              video={video}
              profiles={profiles ?? []}
              nameOf={nameOf}
              onComentar={(contenido) =>
                agregarComentario.mutate({ videoId: video.id, contenido })
              }
            />
          ))}
        </div>
      ) : (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Video className="size-12 text-muted-foreground" />
          <p className="font-display text-xl">No hay videos todavía</p>
          <p className="text-sm text-muted-foreground">
            ¡Sé el primero en compartir un momento!
          </p>
        </div>
      )}
    </div>
  );
}

function VideoCard({ 
  video, 
  profiles, 
  nameOf, 
  onComentar 
}: { 
  video: VideoRow; 
  profiles: Profile[]; 
  nameOf: (id: string) => string;
  onComentar: (contenido: string) => void;
}) {
  const [comentario, setComentario] = useState("");
  const [showComentarios, setShowComentarios] = useState(
    () => typeof window !== "undefined" && window.location.hash === `#video-${video.id}`,
  );
  
  const { data: url } = useSignedUrl(video.file_path);
  
  const { data: comentarios } = useQuery({
    queryKey: ["video-comentarios", video.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comentarios")
        .select("*, user_id")
        .eq("video_id", video.id)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as ComentarioRow[];
    },
  });

  const formatSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `video_${video.id}.mp4`;
    a.click();
  };

  return (
    <Card id={`video-${video.id}`} className="scroll-mt-24 overflow-hidden target:ring-2 target:ring-primary">
      <div className="aspect-video bg-black">
        {url && (
          <video src={url} controls className="h-full w-full" />
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold">{video.titulo}</h3>
            <p className="text-xs text-muted-foreground">
              Por {nameOf(video.user_id)} • {formatSize(video.file_size)}
            </p>
          </div>
          <Badge variant="secondary">
            <Clock className="mr-1 size-3" />
            {new Date(video.created_at).toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-w-0 flex-1 rounded-full"
            onClick={handleDownload}
          >
            <Download className="mr-1 size-4" /> Descargar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowComentarios(!showComentarios)}
          >
            <MessageCircle className="size-4" />
            {comentarios?.length ?? 0}
          </Button>
        </div>

        {showComentarios && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-semibold">Comentarios</h4>
            {comentarios && comentarios.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comentarios.map((c: ComentarioRow) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{nameOf(c.user_id)}:</span>{" "}
                    {c.contenido}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin comentarios</p>
            )}
            <div className="flex gap-2">
              <Input className="min-w-0" 
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comentario.trim()) {
                    onComentar(comentario);
                    setComentario("");
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (comentario.trim()) {
                    onComentar(comentario);
                    setComentario("");
                  }
                }}
              >
                Enviar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook para URLs firmadas
function useSignedUrl(filePath: string) {
  return useQuery({
    queryKey: ["signed-url", filePath],
    queryFn: async () => {
      if (!filePath) return null;
      const { data } = await supabase.storage
        .from("media")
        .createSignedUrl(filePath, 60 * 60); // 1 hora
      return data?.signedUrl ?? null;
    },
    enabled: !!filePath,
  });
}
