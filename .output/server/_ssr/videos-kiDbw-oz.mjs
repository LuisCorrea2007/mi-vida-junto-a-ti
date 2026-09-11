import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Download, E as MessageCircle, i as Upload, n as Video, nt as Clock } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-XqsetAbP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/videos-kiDbw-oz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VideosPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	useRealtime("videos_diarios", "video_comentarios");
	const [titulo, setTitulo] = (0, import_react.useState)("");
	const [subiendo, setSubiendo] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	const { data: videos, isLoading } = useQuery({
		queryKey: ["videos"],
		queryFn: async () => {
			const { data, error } = await supabase.from("videos_diarios").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const subirVideo = useMutation({
		mutationFn: async (file) => {
			if (!user) throw new Error("Sin sesión");
			if (!titulo.trim()) throw new Error("Agrega un título");
			setSubiendo(true);
			const ext = file.name.split(".").pop() || "mp4";
			const filePath = `${user.id}/videos/${crypto.randomUUID()}.${ext}`;
			const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, {
				upsert: true,
				contentType: file.type
			});
			if (uploadError) throw uploadError;
			const { error: dbError } = await supabase.from("videos_diarios").insert({
				user_id: user.id,
				titulo: titulo.trim(),
				file_path: filePath,
				file_type: file.type,
				file_size: file.size
			});
			if (dbError) throw dbError;
			const other = profiles?.find((p) => p.id !== user.id);
			if (other) await notifyPartner({
				toUserId: other.id,
				type: "video",
				title: "Nuevo video diario",
				message: `${profiles?.find((p) => p.id === user.id)?.name} subió un video: ${titulo.trim()}`,
				link: "/videos"
			});
		},
		onSuccess: () => {
			toast.success("¡Video subido!");
			setTitulo("");
			qc.invalidateQueries({ queryKey: ["videos"] });
		},
		onError: (e) => toast.error(e.message),
		onSettled: () => setSubiendo(false)
	});
	const agregarComentario = useMutation({
		mutationFn: async ({ videoId, contenido }) => {
			if (!user || !contenido.trim()) throw new Error("Escribe un comentario");
			const { error } = await supabase.from("video_comentarios").insert({
				video_id: videoId,
				user_id: user.id,
				contenido: contenido.trim()
			});
			if (error) throw error;
			const video = videos?.find((v) => v.id === videoId);
			if (video && video.user_id !== user.id) await notifyPartner({
				toUserId: video.user_id,
				type: "comentario_video",
				title: "Comentaron tu video",
				message: titulo,
				link: `/videos#video-${videoId}`
			});
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["video-comentarios"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("video/")) {
				toast.error("Solo se permiten archivos de video");
				return;
			}
			if (file.size > 52428800) {
				toast.error("El video no puede pesar más de 50MB");
				return;
			}
			subirVideo.mutate(file);
		}
		e.target.value = "";
	};
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-7" }), " Videos Diarios"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Compartí momentos de tu día en video"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5" }), " Subir nuevo video"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "titulo",
							children: "Título"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "titulo",
							value: titulo,
							onChange: (e) => setTitulo(e.target.value),
							placeholder: "¿Qué estás haciendo?",
							maxLength: 100
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						accept: "video/*",
						className: "hidden",
						onChange: handleFileSelect
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full rounded-full sm:w-auto",
						onClick: () => fileInputRef.current?.click(),
						disabled: subiendo || !titulo.trim(),
						children: subiendo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Subiendo..." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 size-4" }), " Seleccionar video"] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Máximo 50MB. Formatos: MP4, WebM, MOV"
					})
				]
			})] }),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { className: "h-64 animate-pulse" }, i))
			}) : videos && videos.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: videos.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video,
					profiles: profiles ?? [],
					nameOf,
					onComentar: (contenido) => agregarComentario.mutate({
						videoId: video.id,
						contenido
					})
				}, video.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-12 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "No hay videos todavía"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "¡Sé el primero en compartir un momento!"
					})
				]
			})
		]
	});
}
function VideoCard({ video, profiles, nameOf, onComentar }) {
	const [comentario, setComentario] = (0, import_react.useState)("");
	const [showComentarios, setShowComentarios] = (0, import_react.useState)(() => typeof window !== "undefined" && window.location.hash === `#video-${video.id}`);
	const { data: url } = useSignedUrl(video.file_path);
	const { data: comentarios } = useQuery({
		queryKey: ["video-comentarios", video.id],
		queryFn: async () => {
			const { data, error } = await supabase.from("video_comentarios").select("*, user_id").eq("video_id", video.id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const formatSize = (bytes) => {
		const sizes = [
			"B",
			"KB",
			"MB",
			"GB"
		];
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: `video-${video.id}`,
		className: "scroll-mt-24 overflow-hidden target:ring-2 target:ring-primary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aspect-video bg-black",
			children: url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: url,
				controls: true,
				className: "h-full w-full"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-semibold",
							children: video.titulo
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Por ",
								nameOf(video.user_id),
								" • ",
								formatSize(video.file_size)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 size-3" }), new Date(video.created_at).toLocaleTimeString("es", {
							hour: "2-digit",
							minute: "2-digit"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "min-w-0 flex-1 rounded-full",
						onClick: handleDownload,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-4" }), " Descargar"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						onClick: () => setShowComentarios(!showComentarios),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), comentarios?.length ?? 0]
					})]
				}),
				showComentarios && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 pt-3 border-t",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold",
							children: "Comentarios"
						}),
						comentarios && comentarios.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2 max-h-40 overflow-y-auto",
							children: comentarios.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: [nameOf(c.user_id), ":"]
									}),
									" ",
									c.contenido
								]
							}, c.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Sin comentarios"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "min-w-0",
								value: comentario,
								onChange: (e) => setComentario(e.target.value),
								placeholder: "Escribe un comentario...",
								onKeyDown: (e) => {
									if (e.key === "Enter" && comentario.trim()) {
										onComentar(comentario);
										setComentario("");
									}
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => {
									if (comentario.trim()) {
										onComentar(comentario);
										setComentario("");
									}
								},
								children: "Enviar"
							})]
						})
					]
				})
			]
		})]
	});
}
function useSignedUrl(filePath) {
	return useQuery({
		queryKey: ["signed-url", filePath],
		queryFn: async () => {
			if (!filePath) return null;
			const { data } = await supabase.storage.from("media").createSignedUrl(filePath, 3600);
			return data?.signedUrl ?? null;
		},
		enabled: !!filePath
	});
}
//#endregion
export { VideosPage as component };
