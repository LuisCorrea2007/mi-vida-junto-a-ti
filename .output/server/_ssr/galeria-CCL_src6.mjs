import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { a as validateImage, i as useSignedUrl, n as imageSize, r as uploadMedia, t as compressImage } from "./media-DkFqNmQI.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Download, E as MessageCircle, H as Images, W as Heart, i as Upload, l as Star, o as Trash2, ot as ChevronRight, st as ChevronLeft, t as X } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { i as REACTIONS } from "./content-IdYYa_dU.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B2qHqcPM.mjs";
import { t as Route } from "./galeria-BTcFdK-F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/galeria-CCL_src6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Tile({ photo, onOpen }) {
	const { data: url } = useSignedUrl(photo.file_path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: onOpen,
		className: "group relative mb-3 block w-full overflow-hidden rounded-xl bg-muted",
		children: [url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: photo.caption ?? "Recuerdo compartido",
			loading: "lazy",
			className: "w-full object-cover transition-transform duration-500 group-hover:scale-105"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 w-full" }), photo.is_favorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "absolute right-2 top-2 size-4 fill-primary text-primary drop-shadow" })]
	});
}
function PhotoPanel({ photo, userId }) {
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	useRealtime("photo_comments", "photo_reactions");
	const [text, setText] = (0, import_react.useState)("");
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	const { data: comments } = useQuery({
		queryKey: ["photo-comments", photo.id],
		queryFn: async () => {
			const { data, error } = await supabase.from("photo_comments").select("id, content, user_id, created_at").eq("photo_id", photo.id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: reactions } = useQuery({
		queryKey: ["photo-reactions", photo.id],
		queryFn: async () => {
			const { data, error } = await supabase.from("photo_reactions").select("id, reaction_type, user_id").eq("photo_id", photo.id);
			if (error) throw error;
			return data ?? [];
		}
	});
	const addComment = useMutation({
		mutationFn: async () => {
			const content = text.trim().slice(0, 1e3);
			if (!content) throw new Error("Escribe algo primero");
			const { error } = await supabase.from("photo_comments").insert({
				photo_id: photo.id,
				user_id: userId,
				content
			});
			if (error) throw error;
			const other = profiles?.find((p) => p.id !== userId);
			if (other) await notifyPartner({
				toUserId: other.id,
				type: "comentario_foto",
				title: "Comentaron una foto",
				message: content.slice(0, 140),
				link: `/galeria?foto=${photo.id}`
			});
		},
		onSuccess: () => {
			setText("");
			qc.invalidateQueries({ queryKey: ["photo-comments", photo.id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleReaction = useMutation({
		mutationFn: async (type) => {
			const mine = reactions?.find((r) => r.user_id === userId && r.reaction_type === type);
			if (mine) {
				await supabase.from("photo_reactions").delete().eq("id", mine.id);
				return;
			}
			await supabase.from("photo_reactions").insert({
				photo_id: photo.id,
				user_id: userId,
				reaction_type: type
			});
			const other = profiles?.find((p) => p.id !== userId);
			const emoji = REACTIONS.find((r) => r.type === type)?.emoji ?? "❤️";
			if (other && photo.user_id === other.id) await notifyPartner({
				toUserId: other.id,
				type: "reaccion_foto",
				title: `Reaccionaron ${emoji} a tu foto`,
				message: photo.caption,
				link: `/galeria?foto=${photo.id}`
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["photo-reactions", photo.id] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-4 text-left",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: REACTIONS.map((r) => {
					const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
					const mine = reactions?.some((x) => x.reaction_type === r.type && x.user_id === userId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => toggleReaction.mutate(r.type),
						"aria-label": r.label,
						className: `rounded-full border px-3 py-1 text-sm transition-transform hover:scale-105 ${mine ? "border-primary bg-primary/15" : "border-border"}`,
						children: [
							r.emoji,
							" ",
							count > 0 && count
						]
					}, r.type);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 space-y-2 overflow-y-auto",
				children: comments?.length ? comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/60 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: [
							nameOf(c.user_id),
							" ·",
							" ",
							new Date(c.created_at).toLocaleString("es", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 whitespace-pre-wrap text-sm",
						children: c.content
					})]
				}, c.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Sé la primera persona en comentar."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: text,
					maxLength: 1e3,
					placeholder: "Escribe un comentario…",
					onChange: (e) => setText(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							addComment.mutate();
						}
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					className: "shrink-0 rounded-full",
					"aria-label": "Enviar comentario",
					onClick: () => addComment.mutate(),
					disabled: addComment.isPending,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" })
				})]
			})
		]
	});
}
function Lightbox({ photos, index, userId, onClose, onMove, onFavorite, onDelete, canDelete }) {
	const photo = photos[index];
	const { data: url } = useSignedUrl(photo.file_path);
	const [showPanel, setShowPanel] = (0, import_react.useState)(true);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-background/95 backdrop-blur-sm md:flex-row",
		onKeyDown: (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") onMove(1);
			if (e.key === "ArrowLeft") onMove(-1);
		},
		tabIndex: -1,
		ref: (el) => el?.focus(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 items-center justify-center p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "absolute right-3 top-3 z-10 rounded-full bg-background/60",
					onClick: onClose,
					"aria-label": "Cerrar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60",
					onClick: () => onMove(-1),
					"aria-label": "Anterior",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/60",
					onClick: () => onMove(1),
					"aria-label": "Siguiente",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
				}),
				url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: url,
					alt: photo.caption ?? "Recuerdo",
					className: "max-h-full max-w-full rounded-xl object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-64 rounded-xl" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "surface mx-3 mb-3 flex max-h-[46dvh] min-w-0 flex-col gap-4 rounded-2xl p-4 md:my-4 md:ml-0 md:mr-4 md:max-h-none md:w-80",
			children: [
				photo.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: photo.caption
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "rounded-full",
							onClick: onFavorite,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: photo.is_favorite ? "mr-1 size-4 fill-primary text-primary" : "mr-1 size-4" }), "Favorita"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "rounded-full",
							onClick: download,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-4" }), " Descargar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "rounded-full md:hidden",
							onClick: () => setShowPanel((v) => !v),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "mr-1 size-4" }),
								" ",
								showPanel ? "Ocultar" : "Reacciones"
							]
						}),
						canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "rounded-full",
							onClick: onDelete,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 size-4" }), " Eliminar"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `${showPanel ? "flex" : "hidden"} min-h-0 flex-1 md:flex`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPanel, {
						photo,
						userId
					}, photo.id)
				})
			]
		})]
	});
}
function GalleryPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	useRealtime("photos", "albums");
	const fileRef = (0, import_react.useRef)(null);
	const [album, setAlbum] = (0, import_react.useState)("todos");
	const [onlyFav, setOnlyFav] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [lightbox, setLightbox] = (0, import_react.useState)(null);
	const [albumOpen, setAlbumOpen] = (0, import_react.useState)(false);
	const [albumName, setAlbumName] = (0, import_react.useState)("");
	const { foto } = Route.useSearch();
	const { data: albums } = useQuery({
		queryKey: ["albums"],
		queryFn: async () => {
			const { data, error } = await supabase.from("albums").select("id, name").order("name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: photos, isLoading } = useQuery({
		queryKey: ["photos"],
		queryFn: async () => {
			const { data, error } = await supabase.from("photos").select("id, file_path, caption, is_favorite, album_id, user_id, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const visible = (photos ?? []).filter((p) => (album === "todos" || p.album_id === album) && (!onlyFav || p.is_favorite));
	(0, import_react.useEffect)(() => {
		if (!foto || !photos) return;
		setAlbum("todos");
		setOnlyFav(false);
		const i = photos.findIndex((p) => p.id === foto);
		if (i >= 0) setLightbox(i);
	}, [foto, photos]);
	async function handleFiles(files) {
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
					file_size: blob.size
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
			const { error } = await supabase.from("albums").insert({
				user_id: user.id,
				name: albumName.trim().slice(0, 80)
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setAlbumName("");
			setAlbumOpen(false);
			qc.invalidateQueries({ queryKey: ["albums"] });
			toast.success("Álbum creado");
		},
		onError: (e) => toast.error(e.message)
	});
	async function toggleFavorite(p) {
		await supabase.from("photos").update({ is_favorite: !p.is_favorite }).eq("id", p.id);
		qc.invalidateQueries({ queryKey: ["photos"] });
	}
	async function removePhoto(p) {
		const { error } = await supabase.from("photos").delete().eq("id", p.id);
		if (error) {
			toast.error("Solo quien subió la foto puede eliminarla");
			return;
		}
		await supabase.storage.from("media").remove([p.file_path]);
		setLightbox(null);
		qc.invalidateQueries({ queryKey: ["photos"] });
		toast.success("Foto eliminada");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Galería"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Cada foto, una historia de las suyas."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "rounded-full",
							onClick: () => setAlbumOpen(true),
							children: "Nuevo álbum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							disabled: uploading,
							onClick: () => fileRef.current?.click(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 size-4" }),
								" ",
								uploading ? "Subiendo…" : "Subir fotos"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: "image/*",
							multiple: true,
							className: "hidden",
							onChange: (e) => handleFiles(e.target.files)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: album,
					onValueChange: setAlbum,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full sm:w-52",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "todos",
						children: "Todos los álbumes"
					}), albums?.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: a.id,
						children: a.name
					}, a.id))] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: onlyFav ? "default" : "outline",
					className: "rounded-full",
					onClick: () => setOnlyFav((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mr-1 size-4" }), " Favoritas"]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "columns-2 gap-3 sm:columns-3",
				children: [
					0,
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-3 h-48 w-full rounded-xl" }, i))
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-8 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Sin fotos todavía"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Suban esa foto que siempre se mandan por chat."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "columns-2 gap-3 sm:columns-3",
				children: visible.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					photo: p,
					onOpen: () => setLightbox(i)
				}, p.id))
			}),
			lightbox !== null && visible[lightbox] && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
				photos: visible,
				index: lightbox,
				userId: user.id,
				onClose: () => setLightbox(null),
				onMove: (d) => setLightbox((i) => ((i ?? 0) + d + visible.length) % visible.length),
				onFavorite: () => toggleFavorite(visible[lightbox]),
				onDelete: () => removePhoto(visible[lightbox]),
				canDelete: visible[lightbox].user_id === user?.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: albumOpen,
				onOpenChange: setAlbumOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display",
						children: "Nuevo álbum"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "album",
							children: "Nombre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "album",
							maxLength: 80,
							value: albumName,
							onChange: (e) => setAlbumName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "rounded-full",
						onClick: () => createAlbum.mutate(),
						children: "Crear"
					}) })
				] })
			})
		]
	});
}
//#endregion
export { GalleryPage as component };
