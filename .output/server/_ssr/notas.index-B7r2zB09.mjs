import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { W as Heart, h as Search, l as Star, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { r as NOTE_CATEGORIES, s as labelFor } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B2qHqcPM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notas.index-B7r2zB09.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotesPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	useRealtime("notes", "note_attachments", "note_replies", "note_reactions");
	const [search, setSearch] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("todas");
	const [archived, setArchived] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		content: "",
		category: "amor",
		scheduled: ""
	});
	const { data: notes, isLoading } = useQuery({
		queryKey: ["notes", { archived }],
		queryFn: async () => {
			const { data, error } = await supabase.from("notes").select("id, title, content, category, is_favorite, created_at, user_id, scheduled_date").eq("is_archived", archived).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.title.trim()) throw new Error("Ponle un título");
			const { data: created, error } = await supabase.from("notes").insert({
				user_id: user.id,
				title: form.title.trim().slice(0, 140),
				content: form.content.slice(0, 8e3),
				category: form.category,
				scheduled_date: form.scheduled || null
			}).select("id").single();
			if (error) throw error;
			const other = profiles?.find((p) => p.id !== user.id);
			if (other) await notifyPartner({
				toUserId: other.id,
				type: "nota",
				title: "Tienes una nota nueva",
				message: form.title.trim().slice(0, 140),
				link: `/notas/${created.id}`
			});
		},
		onSuccess: () => {
			toast.success("Nota guardada");
			setForm({
				title: "",
				content: "",
				category: "amor",
				scheduled: ""
			});
			setOpen(false);
			qc.invalidateQueries({ queryKey: ["notes"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const visible = (notes ?? []).filter((n) => {
		const q = search.trim().toLowerCase();
		const matchQ = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
		const matchC = category === "todas" || n.category === category;
		return matchQ && matchC;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Notas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Lo que se quieren decir, guardado para siempre."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nueva nota"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Escribir una nota"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "t",
										children: "Título"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "t",
										maxLength: 140,
										value: form.title,
										onChange: (e) => setForm({
											...form,
											title: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "c",
										children: "Contenido"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "c",
										rows: 6,
										maxLength: 8e3,
										value: form.content,
										onChange: (e) => setForm({
											...form,
											content: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Categoría" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.category,
											onValueChange: (v) => setForm({
												...form,
												category: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: NOTE_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c.value,
												children: c.label
											}, c.value)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "s",
											children: "Programar (opcional)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "s",
											type: "date",
											value: form.scheduled,
											onChange: (e) => setForm({
												...form,
												scheduled: e.target.value
											})
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "rounded-full",
							onClick: () => create.mutate(),
							disabled: create.isPending,
							children: "Guardar nota"
						}) })
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-0 basis-full sm:min-w-52 sm:basis-auto sm:flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Buscar en las notas",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: category,
						onValueChange: setCategory,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-full sm:w-44",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "todas",
							children: "Todas"
						}), NOTE_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.value,
							children: c.label
						}, c.value))] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: archived ? "default" : "outline",
						className: "rounded-full",
						onClick: () => setArchived((a) => !a),
						children: archived ? "Viendo archivadas" : "Archivadas"
					})
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					0,
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-36 rounded-2xl" }, i))
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-8 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Aquí no hay nada todavía"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "La primera nota siempre es la más bonita."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: visible.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/notas/$id",
					params: { id: n.id },
					className: "surface animate-fade-up p-5 transition-shadow hover:shadow-[var(--shadow-lift)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-semibold",
								children: n.title
							}), n.is_favorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 shrink-0 fill-primary text-primary" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-3 text-sm text-muted-foreground",
							children: n.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: labelFor(NOTE_CATEGORIES, n.category)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								profiles?.find((p) => p.id === n.user_id)?.name ?? "Alguien",
								" ·",
								" ",
								new Date(n.created_at).toLocaleDateString("es", {
									day: "numeric",
									month: "long"
								})
							] })]
						})
					]
				}, n.id))
			})
		]
	});
}
//#endregion
export { NotesPage as component };
