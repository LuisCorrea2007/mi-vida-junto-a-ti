import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";
const MAX_BYTES = 10 * 1024 * 1024;

/** Devuelve un mensaje de error si el archivo no es una imagen válida, o null. */
export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Solo se permiten imágenes";
  if (file.size > MAX_BYTES) return "La imagen supera los 10 MB";
  return null;
}

export async function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (typeof window === "undefined") return null;
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("No pudimos leer la imagen"));
      img.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Redimensiona y comprime a webp. Si algo falla, devuelve el archivo original. */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (typeof document === "undefined") return file;
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("No pudimos leer la imagen"));
      img.src = url;
    });
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Sube un archivo al bucket privado y devuelve su ruta. */
export async function uploadMedia(
  folder: string,
  userId: string,
  blob: Blob,
  ext = "webp",
): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${userId}/${name}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** URL firmada (1 hora) para una ruta del bucket privado. */
export function useSignedUrl(filePath?: string | null) {
  return useQuery({
    queryKey: ["signed-url", filePath],
    enabled: !!filePath,
    staleTime: 50 * 60 * 1000,
    queryFn: async (): Promise<string | null> => {
      if (!filePath) return null;
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(filePath, 60 * 60);
      if (error) throw error;
      return data?.signedUrl ?? null;
    },
  });
}
