import { t as supabase } from "./client-DLsAaqJR.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-DkFqNmQI.js
var MEDIA_BUCKET = "media";
var MAX_BYTES = 10485760;
/** Devuelve un mensaje de error si el archivo no es una imagen válida, o null. */
function validateImage(file) {
	if (!file.type.startsWith("image/")) return "Solo se permiten imágenes";
	if (file.size > MAX_BYTES) return "La imagen supera los 10 MB";
	return null;
}
async function imageSize(file) {
	if (typeof window === "undefined") return null;
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		await new Promise((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(/* @__PURE__ */ new Error("No pudimos leer la imagen"));
			img.src = url;
		});
		return {
			width: img.naturalWidth,
			height: img.naturalHeight
		};
	} catch {
		return null;
	} finally {
		URL.revokeObjectURL(url);
	}
}
/** Redimensiona y comprime a webp. Si algo falla, devuelve el archivo original. */
async function compressImage(file, maxSize = 1600, quality = .82) {
	if (typeof document === "undefined") return file;
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		await new Promise((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(/* @__PURE__ */ new Error("No pudimos leer la imagen"));
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
		const blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/webp", quality));
		return blob && blob.size < file.size ? blob : file;
	} catch {
		return file;
	} finally {
		URL.revokeObjectURL(url);
	}
}
/** Sube un archivo al bucket privado y devuelve su ruta. */
async function uploadMedia(folder, userId, blob, ext = "webp") {
	const path = `${folder}/${userId}/${`${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`}`;
	const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
		contentType: blob.type || "image/webp",
		upsert: false
	});
	if (error) throw error;
	return path;
}
/** URL firmada (1 hora) para una ruta del bucket privado. */
function useSignedUrl(filePath) {
	return useQuery({
		queryKey: ["signed-url", filePath],
		enabled: !!filePath,
		staleTime: 3e6,
		queryFn: async () => {
			if (!filePath) return null;
			const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(filePath, 3600);
			if (error) throw error;
			return data?.signedUrl ?? null;
		}
	});
}
//#endregion
export { validateImage as a, useSignedUrl as i, imageSize as n, uploadMedia as r, compressImage as t };
