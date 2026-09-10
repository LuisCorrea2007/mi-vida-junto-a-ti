import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Images, Star, Trash2, Upload, X, Download, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useProfiles } from "@/hooks/use-profiles";
import { notifyPartner } from "@/lib/notify";
import { compressImage, imageSize, uploadMedia, useSignedUrl, validateImage } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REACTIONS } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/galeria")({
  validateSearch: (search: Record<string, unknown>): { foto?: string } =>
    typeof search["foto"] === "string" ? { foto: search["foto"] } : {},
  head: () => ({
    meta: [
      { title: "Galería — Nuestro Espacio" },
      { name: "description", content: "Fotos y recuerdos de la pareja organizados en álbumes." },
      { property: "og:title", content: "Galería — Nuestro Espacio" },
      { property: "og:description", content: "Álbumes y fotos compartidas." },
    ],
  }),
  component: GalleryPage,
});

type Photo = {
  id: string;
  file_path: string;
  caption: string | null;
  is_favorite: boolean;
  album_id: string | null;
  user_id: string;
  created_at: string;
};

function Tile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const { data: url } = useSignedUrl(photo.file_path);
  return (
    <button
      onClick={onOpen}
      className="group relative mb-3 block w-full overflow-hidden rounded-xl bg-muted"
    >
      {url ? (
        <img
          src={url}
          alt={photo.caption ?? "Recuerdo compartido"}
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Skeleton className="h-52 w-full" />
      )}
      {photo.is_favorite && (
        <Star className="absolute right-2 top-2 size-4 fill-primary text-primary drop-shadow" />
      )}
    </button>
  );
}

function PhotoPanel({ photo, userId }: { photo: Photo; userId: string }) {
  const qc = useQueryClient();
  const { data: profiles } = useProfiles();
  useRealtime("photo_comments", "photo_reactions");
  const [text, setText] = useState("");
  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";

  const { data: comments } = useQuery({
    queryKey: ["photo-comments", photo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_comments")
        .select("id, content, user_id, created_at")
        .eq("photo_id", photo.id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reactions } = useQuery({
    queryKey: ["photo-reactions", photo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_reactions")
        .select("id, reaction_type, user_id")
        .eq("photo_id", photo.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const content = text.trim().slice(0, 1000);
      if (!content) throw new Error("Escribe algo primero");
      const { error } = await supabase
        .from("photo_comments")
        .insert({ photo_id: photo.id, user_id: userId, content });
      if (error) throw error;
      const other = profiles?.find((p) => p.id !== userId);
      if (other) {
        await notifyPartner({
          toUserId: other.id,
          type: "comentario_foto",
          title: "Comentaron una foto",
          message: content.slice(0, 140),
          link: `/galeria?foto=${photo.id}`,
        });
      }
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["photo-comments", photo.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleReaction = useMutation({
    mutationFn: async (type: string) => {
      const mine = reactions?.find((r) => r.user_id === userId && r.reaction_type === type);
      if (mine) {
        await supabase.from("photo_reactions").delete().eq("id", mine.id);
        return;
      }
      await supabase
        .from("photo_reactions")
        .insert({ photo_id: photo.id, user_id: userId, reaction_type: type });
      const other = profiles?.find((p) => p.id !== userId);
      const emoji = REACTIONS.find((r) => r.type === type)?.emoji ?? "❤️";
      if (other && photo.user_id === other.id) {
        await notifyPartner({
          toUserId: other.id,
          type: "reaccion_foto",
          title: `Reaccionaron ${emoji} a tu foto`,
          message: photo.caption,
          link: `/galeria?foto=${photo.id}`,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photo-reactions", photo.id] }),
  });

  return (
    <div className="flex h-full flex-col gap-4 text-left">
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => {
          const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
          const mine = reactions?.some((x) => x.reaction_type === r.type && x.user_id === userId);
          return (
            <button
              key={r.type}
              onClick={() => toggleReaction.mutate(r.type)}
              aria-label={r.label}
              className={`rounded-full border px-3 py-1 text-sm transition-transform hover:scale-105 ${
                mine ? "border-primary bg-primary/15" : "border-border"
              }`}
            >
              {r.emoji} {count > 0 && count}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {comments?.length ? (
          comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-muted/60 p-3">
              <p className="text-[11px] text-muted-foreground">
                {nameOf(c.user_id)} ·{" "}
                {new Date(c.created_at).toLocaleString("es", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sé la primera persona en comentar.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={text}
          maxLength={1000}
          placeholder="Escribe un comentario…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addComment.mutate();
            }
          }}
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          aria-label="Enviar comentario"
          onClick={() => addComment.mutate()}
          disabled={addComment.isPending}
        >
          <MessageCircle className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function Lightbox({
  photos,
  index,
  userId,
  onClose,
  onMove,
  onFavorite,
  onDelete,
  canDelete,
}: {
  photos: Photo[];
  index: number;
  userId: string;
  onClose: () => void;
  onMove: (delta: number) => void;
  onFavorite: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const photo = photos[index]!;
  const { data: url } = useSignedUrl(photo.file_path);
  const [showPanel, setShowPanel] = useState(true);

  async function download() {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = photo.file_path.split("/").pop() || "foto";
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-background/95 backdrop-blur-sm md:flex-row"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") onMove(1);
        if (e.key === "ArrowLeft") onMove(-1);
      }}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 rounded-full bg-background/60"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60"
          onClick={() => onMove(-1)}
          aria-label="Anterior"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60"
          onClick={() => onMove(1)}
          aria-label="Siguiente"
        >
          <ChevronRight />
        </Button>
        {url ? (
          <img
            src={url}
            alt={photo.caption ?? "Recuerdo"}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        ) : (
          <Skeleton className="h-64 w-64 rounded-xl" />
        )}
      </div>

      <aside className="surface mx-3 mb-3 flex max-h-[46dvh] min-w-0 flex-col gap-4 rounded-2xl p-4 md:my-4 md:ml-0 md:mr-4 md:max-h-none md:w-80">
        {photo.caption && <p className="text-sm">{photo.caption}</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={onFavorite}>
            <Star className={photo.is_favorite ? "mr-1 size-4 fill-primary text-primary" : "mr-1 size-4"} />
            Favorita
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full" onClick={download}>
            <Download className="mr-1 size-4" /> Descargar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full md:hidden"
            onClick={() => setShowPanel((v) => !v)}
          >
            <Heart className="mr-1 size-4" /> {showPanel ? "Ocultar" : "Reacciones"}
          </Button>
          {canDelete && (
            <Button variant="secondary" size="sm" className="rounded-full" onClick={onDelete}>
              <Trash2 className="mr-1 size-4" /> Eliminar
            </Button>
          )}
        </div>
        <div className={`${showPanel ? "flex" : "hidden"} min-h-0 flex-1 md:flex`}>
          <PhotoPanel key={photo.id} photo={photo} userId={userId} />
        </div>
      </aside>
    </div>
  );
}

function GalleryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtime("photos", "albums");
  const fileRef = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState("todos");
  const [onlyFav, setOnlyFav] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const { foto } = Route.useSearch();

  const { data: albums } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("albums").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: photos, isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: async (): Promise<Photo[]> => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, file_path, caption, is_favorite, album_id, user_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const visible = (photos ?? []).filter(
    (p) => (album === "todos" || p.album_id === album) && (!onlyFav || p.is_favorite),
  );

  // Abre directamente la foto que viene en un aviso (/galeria?foto=…).
  useEffect(() => {
    if (!foto || !photos) return;
    setAlbum("todos");
    setOnlyFav(false);
    const i = photos.findIndex((p) => p.id === foto);
    if (i >= 0) setLightbox(i);
  }, [foto, photos]);


  async function handleFiles(files: FileList | null) {
    if (!files?.length || !user) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      const invalid = validateImage(file);
      if (invalid) {
        toast.error(`${file.name}: ${invalid}`);
        continue;
      }
      try {
        const size = await imageSize(file);
        const blob = await compressImage(file);
        const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
        const path = await uploadMedia("photos", user.id, blob, ext);
        const { error } = await supabase.from("photos").insert({
          user_id: user.id,
          file_path: path,
          album_id: album === "todos" ? null : album,
          width: size?.width ?? null,
          height: size?.height ?? null,
          file_size: blob.size,
        });
        if (error) throw error;
        ok++;
      } catch {
        toast.error(`No pudimos subir ${file.name}`);
      }
    }
    setUploading(false);
    if (ok) {
      toast.success(`${ok} ${ok === 1 ? "foto subida" : "fotos subidas"}`);
      qc.invalidateQueries({ queryKey: ["photos"] });
    }
  }

  const createAlbum = useMutation({
    mutationFn: async () => {
      if (!user || !albumName.trim()) throw new Error("Ponle un nombre al álbum");
      const { error } = await supabase
        .from("albums")
        .insert({ user_id: user.id, name: albumName.trim().slice(0, 80) });
      if (error) throw error;
    },
    onSuccess: () => {
      setAlbumName("");
      setAlbumOpen(false);
      qc.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Álbum creado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function toggleFavorite(p: Photo) {
    await supabase.from("photos").update({ is_favorite: !p.is_favorite }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["photos"] });
  }

  async function removePhoto(p: Photo) {
    const { error } = await supabase.from("photos").delete().eq("id", p.id);
    if (error) { toast.error("Solo quien subió la foto puede eliminarla"); return; }
    await supabase.storage.from("media").remove([p.file_path]);
    setLightbox(null);
    qc.invalidateQueries({ queryKey: ["photos"] });
    toast.success("Foto eliminada");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Galería</h1>
          <p className="text-sm text-muted-foreground">Cada foto, una historia de las suyas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setAlbumOpen(true)}>
            Nuevo álbum
          </Button>
          <Button
            className="rounded-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-1 size-4" /> {uploading ? "Subiendo…" : "Subir fotos"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <Select value={album} onValueChange={setAlbum}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los álbumes</SelectItem>
            {albums?.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={onlyFav ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setOnlyFav((v) => !v)}
        >
          <Star className="mr-1 size-4" /> Favoritas
        </Button>
      </div>

      {isLoading ? (
        <div className="columns-2 gap-3 sm:columns-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="mb-3 h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 p-14 text-center">
          <Images className="size-8 text-primary" />
          <p className="font-display text-xl">Sin fotos todavía</p>
          <p className="text-sm text-muted-foreground">
            Suban esa foto que siempre se mandan por chat.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3">
          {visible.map((p, i) => (
            <Tile key={p.id} photo={p} onOpen={() => setLightbox(i)} />
          ))}
        </div>
      )}

      {lightbox !== null && visible[lightbox] && user && (
        <Lightbox
          photos={visible}
          index={lightbox}
          userId={user.id}
          onClose={() => setLightbox(null)}
          onMove={(d) => setLightbox((i) => ((i ?? 0) + d + visible.length) % visible.length)}
          onFavorite={() => toggleFavorite(visible[lightbox]!)}
          onDelete={() => removePhoto(visible[lightbox]!)}
          canDelete={visible[lightbox]!.user_id === user?.id}
        />
      )}

      <Dialog open={albumOpen} onOpenChange={setAlbumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo álbum</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="album">Nombre</Label>
            <Input
              id="album"
              maxLength={80}
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button className="rounded-full" onClick={() => createAlbum.mutate()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
