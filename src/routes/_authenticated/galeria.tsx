import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Images, Star, Trash2, Upload, X, Download, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { compressImage, imageSize, uploadMedia, useSignedUrl, validateImage } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function Lightbox({
  photos,
  index,
  onClose,
  onMove,
  onFavorite,
  onDelete,
  canDelete,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onMove: (delta: number) => void;
  onFavorite: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const photo = photos[index]!;
  const { data: url } = useSignedUrl(photo.file_path);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") onMove(1);
        if (e.key === "ArrowLeft") onMove(-1);
      }}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-background"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-3 text-background"
        onClick={() => onMove(-1)}
        aria-label="Anterior"
      >
        <ChevronLeft />
      </Button>
      <div className="max-h-full max-w-3xl text-center">
        {url && (
          <img
            src={url}
            alt={photo.caption ?? "Recuerdo"}
            className="mx-auto max-h-[75vh] rounded-xl object-contain"
          />
        )}
        <p className="mt-3 text-sm text-background/90">{photo.caption}</p>
        <div className="mt-3 flex justify-center gap-2">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={onFavorite}>
            <Star className={photo.is_favorite ? "mr-1 size-4 fill-primary text-primary" : "mr-1 size-4"} />
            Favorita
          </Button>
          {canDelete && (
            <Button variant="secondary" size="sm" className="rounded-full" onClick={onDelete}>
              <Trash2 className="mr-1 size-4" /> Eliminar
            </Button>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 text-background"
        onClick={() => onMove(1)}
        aria-label="Siguiente"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

function GalleryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState("todos");
  const [onlyFav, setOnlyFav] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");

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
          <SelectTrigger className="w-52">
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

      {lightbox !== null && visible[lightbox] && (
        <Lightbox
          photos={visible}
          index={lightbox}
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
