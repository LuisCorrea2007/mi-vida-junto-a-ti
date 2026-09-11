import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { t as useCouple } from "./use-couple-DkHteiG_.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Download, E as MessageCircle, J as Gift, Q as ExternalLink, R as Link2, X as FileText, i as Upload, k as Mail, l as Star, o as Trash2, x as Paperclip, yt as Archive } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { i as REACTIONS } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dedicatorias-DuJ96fZz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_META = {
	carta: {
		label: "Carta",
		icon: Mail
	},
	enlace: {
		label: "Enlace",
		icon: Link2
	},
	archivo: {
		label: "Archivo",
		icon: Paperclip
	}
};
function formatSize(bytes) {
	if (!bytes) return "";
	const sizes = [
		"B",
		"KB",
		"MB",
		"GB"
	];
	const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
function DedicationsPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	const { data: couple } = useCouple(user?.id);
	useRealtime("dedications", "dedication_comments", "dedication_reactions");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("todas");
	const { data: items, isLoading } = useQuery({
		queryKey: ["dedications"],
		queryFn: async () => {
			const { data, error } = await supabase.from("dedications").select("*").eq("is_archived", false).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	const toggleFavorite = useMutation({
		mutationFn: async (d) => {
			const { error } = await supabase.from("dedications").update({ is_favorite: !d.is_favorite }).eq("id", d.id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["dedications"] }),
		onError: (e) => toast.error(e.message)
	});
	const archive = useMutation({
		mutationFn: async (d) => {
			const { error } = await supabase.from("dedications").update({ is_archived: true }).eq("id", d.id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["dedications"] });
			toast.success("Dedicatoria archivada");
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = (0, import_react.useMemo)(() => {
		const list = items ?? [];
		if (filter === "todas") return list;
		if (filter === "favoritas") return list.filter((d) => d.is_favorite);
		return list.filter((d) => d.kind === filter);
	}, [items, filter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Para siempre"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold",
						children: "Dedicatorias"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Cartas, canciones y archivos que se dedican el uno al otro."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "mr-2 size-4" }), " Dedicar algo"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						className: "max-w-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewDedicationForm, {
							userId: user?.id,
							partnerId: couple?.partnerId ?? null,
							myName: nameOf(user?.id ?? ""),
							onDone: () => setOpen(false)
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					{
						value: "todas",
						label: "Todas"
					},
					{
						value: "carta",
						label: "Cartas"
					},
					{
						value: "enlace",
						label: "Enlaces"
					},
					{
						value: "archivo",
						label: "Archivos"
					},
					{
						value: "favoritas",
						label: "Favoritas"
					}
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setFilter(f.value),
					className: cn("rounded-full border px-4 py-1.5 text-xs font-medium transition-colors", filter === f.value ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-accent"),
					children: f.label
				}, f.value))
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 rounded-2xl" }, i))
			}) : filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: filtered.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DedicationCard, {
					d,
					mine: d.user_id === user?.id,
					nameOf,
					onFavorite: () => toggleFavorite.mutate(d),
					onArchive: () => archive.mutate(d)
				}, d.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-12 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Aún no hay dedicatorias"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: "Dedícale una carta, esa canción que los describe o el video que siempre ven juntos."
					})
				]
			})
		]
	});
}
function NewDedicationForm({ userId, partnerId, myName, onDone }) {
	const qc = useQueryClient();
	const [kind, setKind] = (0, import_react.useState)("carta");
	const [title, setTitle] = (0, import_react.useState)("");
	const [content, setContent] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	const create = useMutation({
		mutationFn: async () => {
			if (!userId) throw new Error("Sin sesión");
			if (!title.trim()) throw new Error("Ponle un título");
			let filePath = null;
			let fileType = null;
			let fileSize = null;
			if (kind === "archivo") {
				if (!file) throw new Error("Elige un archivo");
				if (file.size > 52428800) throw new Error("Máximo 50 MB");
				const ext = file.name.split(".").pop() || "bin";
				filePath = `dedicatorias/${userId}/${crypto.randomUUID()}.${ext}`;
				const { error } = await supabase.storage.from("media").upload(filePath, file, {
					contentType: file.type,
					upsert: false
				});
				if (error) throw error;
				fileType = file.type;
				fileSize = file.size;
			}
			if (kind === "enlace") {
				const u = url.trim();
				if (!u) throw new Error("Pega el enlace");
				try {
					new URL(u.startsWith("http") ? u : `https://${u}`);
				} catch {
					throw new Error("Ese enlace no parece válido");
				}
			}
			if (kind === "carta" && !content.trim()) throw new Error("Escribe la carta");
			const { error } = await supabase.from("dedications").insert({
				user_id: userId,
				kind,
				title: title.trim(),
				content: kind === "carta" ? content.trim() : content.trim() || null,
				url: kind === "enlace" ? url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}` : null,
				file_path: filePath,
				file_type: fileType,
				file_size: fileSize
			});
			if (error) throw error;
			if (partnerId) await notifyPartner({
				toUserId: partnerId,
				type: "dedicatoria",
				title: `${myName} te dedicó algo`,
				message: title.trim(),
				link: "/dedicatorias"
			});
		},
		onSuccess: () => {
			toast.success("¡Dedicatoria guardada para siempre!");
			qc.invalidateQueries({ queryKey: ["dedications"] });
			onDone();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-xl",
				children: "Dedicar algo especial"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: Object.keys(KIND_META).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setKind(k),
					className: cn("flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-colors", kind === k ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-accent"),
					children: [(() => {
						const Icon = KIND_META[k].icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" });
					})(), KIND_META[k].label]
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ded-title",
					children: "Título"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "ded-title",
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: kind === "carta" ? "Para mi amor…" : "¿Qué le dedicas?",
					maxLength: 120
				})]
			}),
			kind === "carta" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ded-content",
					children: "Tu carta"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "ded-content",
					value: content,
					onChange: (e) => setContent(e.target.value),
					placeholder: "Escríbele con el corazón…",
					rows: 7
				})]
			}),
			kind === "enlace" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ded-url",
					children: "Enlace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "ded-url",
					value: url,
					onChange: (e) => setUrl(e.target.value),
					placeholder: "https://… (canción, video, página)"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ded-note",
					children: "¿Por qué se lo dedicas? (opcional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "ded-note",
					value: content,
					onChange: (e) => setContent(e.target.value),
					placeholder: "Esta canción me recuerda a…",
					rows: 2
				})]
			})] }),
			kind === "archivo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					className: "hidden",
					accept: "video/*,image/*,audio/*,application/pdf",
					onChange: (e) => setFile(e.target.files?.[0] ?? null)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => fileRef.current?.click(),
					className: "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), file ? `${file.name} · ${formatSize(file.size)}` : "Elegir video, foto, audio o PDF"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ded-note2",
						children: "Dedicatoria (opcional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "ded-note2",
						value: content,
						onChange: (e) => setContent(e.target.value),
						placeholder: "Un mensajito para acompañarlo…",
						rows: 2
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "rounded-full",
				disabled: create.isPending,
				onClick: () => create.mutate(),
				children: create.isPending ? "Guardando…" : "Guardar para siempre"
			}) })
		]
	});
}
function DedicationCard({ d, mine, nameOf, onFavorite, onArchive }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const Icon = KIND_META[d.kind].icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: `ded-${d.id}`,
		className: "surface group flex flex-col p-5 transition-shadow target:ring-2 target:ring-primary hover:shadow-[var(--shadow-lift)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: "flex-1 text-left",
			onClick: () => setOpen(true),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
					}), d.is_favorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-primary text-primary" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-3 font-display text-lg font-semibold leading-snug",
					children: d.title
				}),
				d.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
					children: d.content
				}),
				d.kind === "enlace" && d.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex items-center gap-1 truncate text-xs text-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3 shrink-0" }),
						" ",
						new URL(d.url).hostname
					]
				}),
				d.kind === "archivo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Archivo ",
						d.file_type?.split("/")[1]?.toUpperCase() ?? "",
						" · ",
						formatSize(d.file_size)
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-center justify-between border-t border-border/60 pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					nameOf(d.user_id),
					" ·",
					" ",
					new Date(d.created_at).toLocaleDateString("es", {
						day: "numeric",
						month: "short"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1",
				children: mine && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onFavorite,
					className: "rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary",
					"aria-label": "Favorita",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", d.is_favorite && "fill-primary text-primary") })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						if (window.confirm("¿Archivar esta dedicatoria? Dejará de verse en la lista.")) onArchive();
					},
					className: "rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive",
					"aria-label": "Archivar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "size-4" })
				})] })
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DedicationDetail, {
		d,
		open,
		onOpenChange: setOpen,
		mine,
		nameOf
	})] });
}
function DedicationDetail({ d, open, onOpenChange, mine, nameOf }) {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: fileUrl } = useSignedUrl(d.file_path);
	const [comment, setComment] = (0, import_react.useState)("");
	const { data: comments } = useQuery({
		queryKey: ["dedication-comments", d.id],
		enabled: open,
		queryFn: async () => {
			const { data, error } = await supabase.from("dedication_comments").select("id, user_id, content, created_at").eq("dedication_id", d.id).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: reactions } = useQuery({
		queryKey: ["dedication-reactions", d.id],
		enabled: open,
		queryFn: async () => {
			const { data, error } = await supabase.from("dedication_reactions").select("id, user_id, reaction_type").eq("dedication_id", d.id);
			if (error) throw error;
			return data ?? [];
		}
	});
	const addComment = useMutation({
		mutationFn: async (text) => {
			if (!user || !text.trim()) return;
			const { error } = await supabase.from("dedication_comments").insert({
				dedication_id: d.id,
				user_id: user.id,
				content: text.trim()
			});
			if (error) throw error;
			if (d.user_id !== user.id) await notifyPartner({
				toUserId: d.user_id,
				type: "comentario_dedicatoria",
				title: "Comentaron tu dedicatoria",
				message: `${d.title}: ${text.trim()}`,
				link: `/dedicatorias#ded-${d.id}`
			});
		},
		onSuccess: () => {
			setComment("");
			qc.invalidateQueries({ queryKey: ["dedication-comments", d.id] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleReaction = useMutation({
		mutationFn: async (type) => {
			if (!user) return;
			const existing = reactions?.find((r) => r.user_id === user.id && r.reaction_type === type);
			if (existing) {
				const { error } = await supabase.from("dedication_reactions").delete().eq("id", existing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("dedication_reactions").insert({
					dedication_id: d.id,
					user_id: user.id,
					reaction_type: type
				});
				if (error) throw error;
				if (d.user_id !== user.id) {
					const r = REACTIONS.find((x) => x.type === type);
					await notifyPartner({
						toUserId: d.user_id,
						type: "reaccion_dedicatoria",
						title: `Reaccionaron a tu dedicatoria ${r?.emoji ?? ""}`,
						message: d.title,
						link: `/dedicatorias#ded-${d.id}`
					});
				}
			}
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["dedication-reactions", d.id] }),
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("dedications").delete().eq("id", d.id);
			if (error) throw error;
			if (d.file_path) await supabase.storage.from("media").remove([d.file_path]);
		},
		onSuccess: () => {
			toast.success("Dedicatoria eliminada");
			qc.invalidateQueries({ queryKey: ["dedications"] });
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	function download() {
		if (!fileUrl) return;
		const a = document.createElement("a");
		a.href = fileUrl;
		a.download = d.title;
		a.rel = "noopener";
		a.click();
	}
	const isVideo = d.file_type?.startsWith("video/");
	const isImage = d.file_type?.startsWith("image/");
	const isAudio = d.file_type?.startsWith("audio/");
	const isPdf = d.file_type === "application/pdf";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex flex-wrap items-center gap-2 pr-7 font-display text-xl sm:text-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: KIND_META[d.kind].label
					}), d.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Dedicado por ",
						nameOf(d.user_id),
						" ·",
						" ",
						new Date(d.created_at).toLocaleDateString("es", {
							day: "numeric",
							month: "long",
							year: "numeric"
						})
					]
				})] }),
				d.kind === "carta" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-primary/25 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)] p-4 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mb-4 size-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "whitespace-pre-wrap font-display text-lg italic leading-relaxed",
							children: d.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 text-right font-display text-sm text-muted-foreground",
							children: ["— ", nameOf(d.user_id)]
						})
					]
				}),
				d.kind === "enlace" && d.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: d.url,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `https://www.google.com/s2/favicons?domain=${new URL(d.url).hostname}&sz=64`,
							alt: "",
							className: "size-8 rounded-md",
							loading: "lazy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: d.url
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Abrir en una pestaña nueva"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 shrink-0 text-primary" })
					]
				}),
				d.kind === "archivo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						isVideo && fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: fileUrl,
							controls: true,
							className: "w-full rounded-xl bg-black"
						}),
						isImage && fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: fileUrl,
							alt: d.title,
							className: "w-full rounded-xl",
							loading: "lazy"
						}),
						isAudio && fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
							src: fileUrl,
							controls: true,
							className: "w-full"
						}),
						isPdf && fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							src: fileUrl,
							title: d.title,
							className: "h-96 w-full rounded-xl border"
						}),
						!fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), " Cargando archivo…"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "rounded-full",
							onClick: download,
							disabled: !fileUrl,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }),
								" Descargar ",
								formatSize(d.file_size)
							]
						})
					]
				}),
				d.kind !== "carta" && d.content && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl bg-muted/50 p-4 text-sm italic text-muted-foreground",
					children: [
						"“",
						d.content,
						"”"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [REACTIONS.map((r) => {
						const mine_r = reactions?.some((x) => x.user_id === user?.id && x.reaction_type === r.type);
						const count = reactions?.filter((x) => x.reaction_type === r.type).length ?? 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleReaction.mutate(r.type),
							title: r.label,
							className: cn("flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-transform hover:scale-110", mine_r ? "border-primary bg-primary/15" : "border-border"),
							children: [r.emoji, count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs",
								children: count
							})]
						}, r.type);
					}), mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "ml-auto rounded-full p-2 text-muted-foreground hover:text-destructive",
						"aria-label": "Eliminar",
						onClick: () => {
							if (window.confirm("¿Eliminar esta dedicatoria para siempre?")) remove.mutate();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 border-t border-border/60 pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), " Comentarios"]
						}),
						comments?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "max-h-48 space-y-2 overflow-y-auto",
							children: comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl bg-muted/50 px-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: [nameOf(c.user_id), ":"]
									}),
									" ",
									c.content
								]
							}, c.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Sé el primero en comentar."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: comment,
								onChange: (e) => setComment(e.target.value),
								placeholder: "Escribe algo bonito…",
								onKeyDown: (e) => {
									if (e.key === "Enter" && comment.trim()) addComment.mutate(comment);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "rounded-full",
								disabled: !comment.trim() || addComment.isPending,
								onClick: () => addComment.mutate(comment),
								children: "Enviar"
							})]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { DedicationsPage as component };
