import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as string } from "../_libs/zod.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Download, L as Link$1, Q as ExternalLink, T as Mic, X as FileText, Z as Eye, _t as ArrowLeft, b as Pause, bt as ArchiveRestore, l as Star, o as Trash2, u as Square, x as Paperclip, y as Play } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { i as REACTIONS, r as NOTE_CATEGORIES, s as labelFor } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { t as Route } from "./notas._id-zTT7S7w7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notas._id-COMIn43p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatSize(bytes) {
	if (!bytes) return "";
	const sizes = [
		"B",
		"KB",
		"MB",
		"GB"
	];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
function formatClock(seconds) {
	if (!Number.isFinite(seconds)) return "0:00";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
function whenLabel(iso) {
	return new Date(iso).toLocaleString("es", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
}
/** Barras decorativas fijas para que cada audio tenga su propia "onda". */
var BARS = Array.from({ length: 28 }, (_, i) => 30 + Math.round(60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .6))));
function VoiceNote({ attachment, author, mine, canDelete, onDelete }) {
	const { data: url } = useSignedUrl(attachment.file_path);
	const audioRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [current, setCurrent] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
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
		} else a.play().then(() => setPlaying(true)).catch(() => toast.error("No pudimos reproducir el audio"));
	}
	function seek(e) {
		const a = audioRef.current;
		if (!a || !a.duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		a.currentTime = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * a.duration;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-3 rounded-2xl border p-3", mine ? "border-primary/30 bg-primary/10" : "border-border bg-muted/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audioRef,
				src: url ?? void 0,
				preload: "metadata"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: toggle,
				disabled: !url,
				"aria-label": playing ? "Pausar" : "Reproducir",
				className: "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:opacity-50",
				children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-8 cursor-pointer items-end gap-[3px]",
					onClick: seek,
					role: "slider",
					"aria-label": "Posición del audio",
					"aria-valuenow": Math.round(progress * 100),
					children: BARS.map((h, i) => {
						const active = i / BARS.length <= progress;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("w-full rounded-full transition-colors", active ? "bg-primary" : "bg-foreground/25", playing && active && "animate-pulse"),
							style: { height: `${h}%` }
						}, i);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [
							author,
							" · ",
							whenLabel(attachment.created_at)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: formatClock(playing || current > 0 ? current : duration)
					})]
				})]
			}),
			canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "shrink-0",
				"aria-label": "Eliminar audio",
				onClick: onDelete,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		]
	});
}
function DocumentCard({ attachment, author, canDelete, onDelete }) {
	const { data: url } = useSignedUrl(attachment.file_path);
	if (attachment.attachment_type === "link" && attachment.url) {
		let host = attachment.url;
		try {
			host = new URL(attachment.url).hostname.replace(/^www\./, "");
		} catch {}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
						alt: "",
						width: 24,
						height: 24,
						loading: "lazy",
						className: "size-6"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: attachment.url,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "block truncate text-sm font-semibold hover:underline",
							children: host
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: attachment.url
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-[11px] text-muted-foreground",
							children: [
								author,
								" · ",
								whenLabel(attachment.created_at)
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "icon",
					variant: "outline",
					className: "shrink-0 rounded-full",
					"aria-label": "Abrir enlace",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: attachment.url,
						target: "_blank",
						rel: "noopener noreferrer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
					})
				}),
				canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "shrink-0",
					"aria-label": "Eliminar enlace",
					onClick: onDelete,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
				})
			]
		});
	}
	const name = attachment.file_path.split("/").pop() || "documento.pdf";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-destructive" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: "Documento PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-xs text-muted-foreground",
						children: [
							formatSize(attachment.file_size),
							formatSize(attachment.file_size) ? " · " : "",
							author,
							" · ",
							whenLabel(attachment.created_at)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							className: "h-7 rounded-full px-3 text-xs",
							disabled: !url,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: url ?? "#",
								target: "_blank",
								rel: "noopener noreferrer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1 size-3.5" }), " Ver"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							className: "h-7 rounded-full px-3 text-xs",
							disabled: !url,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: url ?? "#",
								download: name,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-3.5" }), " Descargar"]
							})
						})]
					})
				]
			}),
			canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "shrink-0",
				"aria-label": "Eliminar documento",
				onClick: onDelete,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		]
	});
}
function NoteDetail() {
	const { id } = Route.useParams();
	const { user } = useAuth();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const { data: profiles } = useProfiles();
	useRealtime("notes", "note_replies", "note_reactions", "note_attachments");
	const [reply, setReply] = (0, import_react.useState)("");
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	const { data: note, isLoading } = useQuery({
		queryKey: ["note", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: replies } = useQuery({
		queryKey: ["note-replies", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("note_replies").select("id, content, user_id, created_at").eq("note_id", id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: reactions } = useQuery({
		queryKey: ["note-reactions", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("note_reactions").select("id, reaction_type, user_id").eq("note_id", id);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: attachments } = useQuery({
		queryKey: ["note-attachments", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("note_attachments").select("id, file_path, file_type, file_size, attachment_type, created_at, user_id, url").eq("note_id", id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const addReply = useMutation({
		mutationFn: async () => {
			if (!user || !reply.trim()) throw new Error("Escribe algo primero");
			const { error } = await supabase.from("note_replies").insert({
				note_id: id,
				user_id: user.id,
				content: reply.trim().slice(0, 4e3)
			});
			if (error) throw error;
			const other = profiles?.find((p) => p.id !== user.id);
			if (other && note) await notifyPartner({
				toUserId: other.id,
				type: "respuesta",
				title: "Respondieron tu nota",
				message: note.title,
				link: `/notas/${id}#respuestas`
			});
		},
		onSuccess: () => {
			setReply("");
			qc.invalidateQueries({ queryKey: ["note-replies", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleReaction = useMutation({
		mutationFn: async (type) => {
			if (!user) return;
			const mine = reactions?.find((r) => r.user_id === user.id && r.reaction_type === type);
			if (mine) await supabase.from("note_reactions").delete().eq("id", mine.id);
			else await supabase.from("note_reactions").insert({
				note_id: id,
				user_id: user.id,
				reaction_type: type
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["note-reactions", id] })
	});
	const update = useMutation({
		mutationFn: async (patch) => {
			const { error } = await supabase.from("notes").update(patch).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["note", id] });
			qc.invalidateQueries({ queryKey: ["notes"] });
		}
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
		onError: () => toast.error("Solo quien escribió la nota puede eliminarla")
	});
	const uploadAttachment = useMutation({
		mutationFn: async (file) => {
			if (!user) throw new Error("Sin sesión");
			const ext = file.name.split(".").pop() || "file";
			const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
			let attachmentType = "image";
			if (file.type.startsWith("audio/")) attachmentType = "audio";
			else if (file.type === "application/pdf") attachmentType = "pdf";
			else if (file.type.startsWith("image/")) attachmentType = "image";
			const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, { upsert: true });
			if (uploadError) throw uploadError;
			const { error: dbError } = await supabase.from("note_attachments").insert({
				note_id: id,
				user_id: user.id,
				file_path: filePath,
				file_type: file.type,
				file_size: file.size,
				attachment_type: attachmentType
			});
			if (dbError) throw dbError;
		},
		onSuccess: () => {
			toast.success("Archivo adjuntado");
			qc.invalidateQueries({ queryKey: ["note-attachments", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteAttachment = useMutation({
		mutationFn: async (attachmentId) => {
			const { error } = await supabase.from("note_attachments").delete().eq("id", attachmentId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Archivo eliminado");
			qc.invalidateQueries({ queryKey: ["note-attachments", id] });
		}
	});
	const fileInputRef = (0, import_react.useRef)(null);
	const [linkOpen, setLinkOpen] = (0, import_react.useState)(false);
	const [linkUrl, setLinkUrl] = (0, import_react.useState)("");
	const addLink = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			const parsed = string().trim().url().max(2e3).safeParse(linkUrl);
			if (!parsed.success || !/^https?:\/\//i.test(parsed.data)) throw new Error("Escribe una dirección válida que empiece con http:// o https://");
			const { error } = await supabase.from("note_attachments").insert({
				note_id: id,
				user_id: user.id,
				file_path: "",
				attachment_type: "link",
				url: parsed.data
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Enlace guardado");
			setLinkUrl("");
			setLinkOpen(false);
			qc.invalidateQueries({ queryKey: ["note-attachments", id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [recSeconds, setRecSeconds] = (0, import_react.useState)(0);
	const recorderRef = (0, import_react.useRef)(null);
	const timerRef = (0, import_react.useRef)(null);
	async function startRecording() {
		if (typeof MediaRecorder === "undefined") {
			toast.error("Este navegador no permite grabar audio");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
			const rec = new MediaRecorder(stream, { mimeType: mime });
			const chunks = [];
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
			timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1e3);
		} catch {
			toast.error("Necesitamos permiso para usar el micrófono");
		}
	}
	function stopRecording() {
		recorderRef.current?.stop();
	}
	const audios = attachments?.filter((a) => a.attachment_type === "audio") ?? [];
	const docs = attachments?.filter((a) => a.attachment_type !== "audio") ?? [];
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-2xl" });
	if (!note) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface p-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl",
			children: "Esta nota ya no existe"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "mt-4 rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/notas",
				children: "Volver a las notas"
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/notas",
				className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Notas"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "surface animate-fade-up p-4 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: labelFor(NOTE_CATEGORIES, note.category)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								nameOf(note.user_id),
								" ·",
								" ",
								new Date(note.created_at).toLocaleDateString("es", {
									day: "numeric",
									month: "long",
									year: "numeric"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold",
						children: note.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90",
						children: note.content
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-7 rounded-3xl border border-border/70 bg-background/40 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-8 items-center justify-center rounded-full bg-primary/15",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4 text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg font-semibold leading-tight",
									children: "Notas de voz"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: audios.length ? `${audios.length} audio${audios.length > 1 ? "s" : ""}` : "Aún no hay audios"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: recording ? "destructive" : "default",
								size: "sm",
								className: cn("rounded-full", recording && "animate-pulse"),
								onClick: recording ? stopRecording : startRecording,
								disabled: uploadAttachment.isPending,
								children: [recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-1 size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "mr-1 size-4" }), recording ? `Detener · ${formatClock(recSeconds)}` : "Grabar"]
							})]
						}), audios.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2",
							children: audios.map((att) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceNote, {
								attachment: att,
								author: nameOf(att.user_id),
								mine: att.user_id === user?.id,
								canDelete: att.user_id === user?.id,
								onDelete: () => deleteAttachment.mutate(att.id)
							}, att.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Graba un mensaje con tu voz para acompañar la nota."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-3xl border border-border/70 bg-background/40 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-8 items-center justify-center rounded-full bg-primary/15",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4 text-primary" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-lg font-semibold leading-tight",
										children: "Documentos y enlaces"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: docs.length ? `${docs.length} guardado${docs.length > 1 ? "s" : ""}` : "PDF y páginas web"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileInputRef,
											type: "file",
											accept: "application/pdf",
											className: "hidden",
											onChange: (e) => {
												const file = e.target.files?.[0];
												if (file) uploadAttachment.mutate(file);
												e.target.value = "";
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											className: "rounded-full",
											onClick: () => fileInputRef.current?.click(),
											disabled: uploadAttachment.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 size-4" }), " PDF"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: linkOpen ? "secondary" : "outline",
											size: "sm",
											className: "rounded-full",
											onClick: () => setLinkOpen((v) => !v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { className: "mr-1 size-4" }), " Enlace"]
										})
									]
								})]
							}),
							linkOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								onSubmit: (e) => {
									e.preventDefault();
									addLink.mutate();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "url",
									value: linkUrl,
									onChange: (e) => setLinkUrl(e.target.value),
									placeholder: "https://…",
									maxLength: 2e3,
									autoFocus: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "rounded-full",
									disabled: addLink.isPending,
									children: "Guardar"
								})]
							}),
							docs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-2",
								children: docs.map((att) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentCard, {
									attachment: att,
									author: nameOf(att.user_id),
									canDelete: att.user_id === user?.id,
									onDelete: () => deleteAttachment.mutate(att.id)
								}, att.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: "Sube un PDF o guarda un enlace de una página web."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-2",
						children: [REACTIONS.map((r) => {
							const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
							const mine = reactions?.some((x) => x.reaction_type === r.type && x.user_id === user?.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => toggleReaction.mutate(r.type),
								"aria-label": r.label,
								className: `rounded-full border px-3 py-1 text-sm transition-transform hover:scale-105 ${mine ? "border-primary bg-primary/10" : "border-border"}`,
								children: [
									r.emoji,
									" ",
									count > 0 && count
								]
							}, r.type);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Favorita",
									onClick: () => update.mutate({ is_favorite: !note.is_favorite }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: note.is_favorite ? "size-4 fill-primary text-primary" : "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Archivar",
									onClick: () => update.mutate({ is_archived: !note.is_archived }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { className: "size-4" })
								}),
								note.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Eliminar",
									onClick: () => remove.mutate(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Respuestas"
					}),
					replies?.length ? replies.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								nameOf(r.user_id),
								" ·",
								" ",
								new Date(r.created_at).toLocaleString("es", {
									day: "numeric",
									month: "short",
									hour: "2-digit",
									minute: "2-digit"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 whitespace-pre-wrap text-sm",
							children: r.content
						})]
					}, r.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Todavía no hay respuestas."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							maxLength: 4e3,
							value: reply,
							onChange: (e) => setReply(e.target.value),
							placeholder: "Escribe tu respuesta…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3 rounded-full",
							onClick: () => addReply.mutate(),
							disabled: addReply.isPending,
							children: "Responder"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { NoteDetail as component };
