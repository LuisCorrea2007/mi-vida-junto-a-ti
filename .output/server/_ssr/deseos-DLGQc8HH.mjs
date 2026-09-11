import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as MessageCircle, c as ThumbsUp, d as Sparkles, lt as Check, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { o as WISH_CATEGORIES, s as labelFor } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B2qHqcPM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deseos-DLGQc8HH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WishesPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	useRealtime("wishes", "wish_votes", "wish_comments");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [showDone, setShowDone] = (0, import_react.useState)(false);
	const [commentFor, setCommentFor] = (0, import_react.useState)(null);
	const [comment, setComment] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		category: "lugar",
		budget: "",
		deadline: ""
	});
	const { data: wishes, isLoading } = useQuery({
		queryKey: ["wishes"],
		queryFn: async () => {
			const { data, error } = await supabase.from("wishes").select("id, title, description, category, is_completed, budget, deadline, user_id").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: votes } = useQuery({
		queryKey: ["wish-votes"],
		queryFn: async () => {
			const { data, error } = await supabase.from("wish_votes").select("id, wish_id, user_id");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: comments } = useQuery({
		queryKey: ["wish-comments"],
		queryFn: async () => {
			const { data, error } = await supabase.from("wish_comments").select("id, wish_id, user_id, content, created_at").order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.title.trim()) throw new Error("Escribe el deseo");
			const { error } = await supabase.from("wishes").insert({
				user_id: user.id,
				title: form.title.trim().slice(0, 140),
				description: form.description.slice(0, 2e3) || null,
				category: form.category,
				budget: form.budget ? Number(form.budget) : null,
				deadline: form.deadline || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Deseo añadido");
			setOpen(false);
			setForm({
				title: "",
				description: "",
				category: "lugar",
				budget: "",
				deadline: ""
			});
			qc.invalidateQueries({ queryKey: ["wishes"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleVote = useMutation({
		mutationFn: async (wishId) => {
			if (!user) return;
			const mine = votes?.find((v) => v.wish_id === wishId && v.user_id === user.id);
			if (mine) await supabase.from("wish_votes").delete().eq("id", mine.id);
			else await supabase.from("wish_votes").insert({
				wish_id: wishId,
				user_id: user.id
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["wish-votes"] })
	});
	const complete = useMutation({
		mutationFn: async ({ id, done }) => {
			const { error } = await supabase.from("wishes").update({ is_completed: done }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["wishes"] })
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("wishes").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["wishes"] }),
		onError: () => toast.error("Solo quien lo añadió puede eliminarlo")
	});
	const addComment = useMutation({
		mutationFn: async (wishId) => {
			if (!user || !comment.trim()) throw new Error("Escribe un comentario");
			const { error } = await supabase.from("wish_comments").insert({
				wish_id: wishId,
				user_id: user.id,
				content: comment.trim().slice(0, 1e3)
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setComment("");
			qc.invalidateQueries({ queryKey: ["wish-comments"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	const visible = (wishes ?? []).filter((w) => w.is_completed === showDone).sort((a, b) => (votes?.filter((v) => v.wish_id === b.id).length ?? 0) - (votes?.filter((v) => v.wish_id === a.id).length ?? 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Deseos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Todo lo que quieren hacer juntos, priorizado."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: showDone ? "default" : "outline",
					className: "rounded-full",
					onClick: () => setShowDone((v) => !v),
					children: showDone ? "Viendo cumplidos" : "Cumplidos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nuevo deseo"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Añadir deseo"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "wt",
										children: "¿Qué queremos?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "wt",
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Categoría" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.category,
										onValueChange: (v) => setForm({
											...form,
											category: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: WISH_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.value,
											children: c.label
										}, c.value)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "wb",
											children: "Presupuesto"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "wb",
											type: "number",
											min: "0",
											value: form.budget,
											onChange: (e) => setForm({
												...form,
												budget: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "wd",
											children: "Fecha límite"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "wd",
											type: "date",
											value: form.deadline,
											onChange: (e) => setForm({
												...form,
												deadline: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "wdesc",
										children: "Detalles"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "wdesc",
										rows: 3,
										maxLength: 2e3,
										value: form.description,
										onChange: (e) => setForm({
											...form,
											description: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "rounded-full",
							onClick: () => create.mutate(),
							children: "Añadir"
						}) })
					] })]
				})]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: [
				0,
				1,
				2
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl" }, i))
		}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface flex flex-col items-center gap-3 p-14 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-8 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl",
					children: "La lista está vacía"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Empiecen por ese lugar que siempre mencionan."
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: visible.map((w) => {
				const count = votes?.filter((v) => v.wish_id === w.id).length ?? 0;
				const voted = votes?.some((v) => v.wish_id === w.id && v.user_id === user?.id);
				const wc = comments?.filter((c) => c.wish_id === w.id) ?? [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					id: w.id,
					className: "surface animate-fade-up p-5 target:ring-2 target:ring-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleVote.mutate(w.id),
							className: cn("flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 transition-colors", voted ? "border-primary bg-primary/10 text-primary" : "border-border"),
							"aria-label": "Votar",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 text-sm font-semibold",
								children: count
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											children: labelFor(WISH_CATEGORIES, w.category)
										}),
										w.budget != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: ["≈ ", w.budget]
										}),
										w.deadline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"antes del",
												" ",
												(/* @__PURE__ */ new Date(`${w.deadline}T00:00:00`)).toLocaleDateString("es", {
													day: "numeric",
													month: "short"
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: cn("mt-2 font-display text-lg font-semibold", w.is_completed && "line-through opacity-60"),
									children: w.title
								}),
								w.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: w.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											className: "rounded-full",
											onClick: () => complete.mutate({
												id: w.id,
												done: !w.is_completed
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), w.is_completed ? "Reabrir" : "Cumplido"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											className: "rounded-full",
											onClick: () => setCommentFor(commentFor === w.id ? null : w.id),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mr-1 size-4" }),
												" ",
												wc.length
											]
										}),
										w.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "rounded-full",
											onClick: () => remove.mutate(w.id),
											"aria-label": "Eliminar deseo",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
										})
									]
								}),
								commentFor === w.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 space-y-2 border-t pt-4",
									children: [wc.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [nameOf(c.user_id), ": "]
										}), c.content]
									}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: comment,
											maxLength: 1e3,
											onChange: (e) => setComment(e.target.value),
											placeholder: "Comentar…"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "rounded-full",
											onClick: () => addComment.mutate(w.id),
											children: "Enviar"
										})]
									})]
								})
							]
						})]
					})
				}, w.id);
			})
		})]
	});
}
//#endregion
export { WishesPage as component };
