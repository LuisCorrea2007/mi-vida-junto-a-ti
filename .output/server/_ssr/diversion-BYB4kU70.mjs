import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as MessageCircle, V as Laugh, W as Heart, d as Sparkles, it as CircleQuestionMark, l as Star, m as Send, o as Trash2, pt as Brain, rt as Circle, v as Plus, z as Lightbulb } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B2qHqcPM.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-XqsetAbP.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "../_libs/radix-ui__react-radio-group.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diversion-BYB4kU70.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	});
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-3.5 w-3.5 fill-primary" })
		})
	});
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
var FUN_CATEGORIES = [
	{
		value: "chiste",
		label: "Chiste",
		icon: Laugh
	},
	{
		value: "adivinanza",
		label: "Adivinanza",
		icon: Lightbulb
	},
	{
		value: "trivia",
		label: "Trivia",
		icon: Brain
	},
	{
		value: "pregunta",
		label: "Pregunta",
		icon: CircleQuestionMark
	}
];
var REACTIONS = [
	{
		type: "risa",
		emoji: "😂",
		label: "Me hizo reír"
	},
	{
		type: "amor",
		emoji: "❤️",
		label: "Me encanta"
	},
	{
		type: "sorpresa",
		emoji: "😮",
		label: "No me lo esperaba"
	},
	{
		type: "aplauso",
		emoji: "👏",
		label: "Bien hecho"
	},
	{
		type: "fuego",
		emoji: "🔥",
		label: "Buenísimo"
	}
];
function FunPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	useRealtime("fun_items", "fun_comments", "fun_reactions", "fun_ratings");
	const { data: profiles } = useProfiles();
	const nameOf = (id) => id === user?.id ? "Tú" : profiles?.find((p) => p.id === id)?.name ?? "Tu pareja";
	const partnerId = profiles?.find((p) => p.id !== user?.id)?.id ?? null;
	const [category, setCategory] = (0, import_react.useState)("todas");
	const [sort, setSort] = (0, import_react.useState)("recientes");
	const [onlyFavorites, setOnlyFavorites] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [highlight, setHighlight] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		category: "chiste",
		content: "",
		answer: "",
		option1: "",
		option2: "",
		option3: "",
		option4: ""
	});
	const { data: items, isLoading } = useQuery({
		queryKey: ["fun-items"],
		queryFn: async () => {
			const { data, error } = await supabase.from("fun_items").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: reactions } = useQuery({
		queryKey: ["fun-reactions"],
		queryFn: async () => {
			const { data, error } = await supabase.from("fun_reactions").select("id, fun_item_id, user_id, reaction_type");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: comments } = useQuery({
		queryKey: ["fun-comments"],
		queryFn: async () => {
			const { data, error } = await supabase.from("fun_comments").select("id, fun_item_id, user_id, content, created_at").order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: ratings } = useQuery({
		queryKey: ["fun-ratings"],
		queryFn: async () => {
			const { data, error } = await supabase.from("fun_ratings").select("id, fun_item_id, user_id, score");
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.content.trim()) throw new Error("Escribe algo divertido");
			const options = form.category === "trivia" ? [
				form.option1,
				form.option2,
				form.option3,
				form.option4
			].filter((o) => o.trim()) : null;
			const { error } = await supabase.from("fun_items").insert({
				user_id: user.id,
				category: form.category,
				content: form.content.trim(),
				answer: form.category !== "chiste" ? form.answer.trim() : null,
				options: options?.length ? options : null
			});
			if (error) throw error;
			if (partnerId) {
				const label = FUN_CATEGORIES.find((c) => c.value === form.category)?.label ?? "algo";
				await notifyPartner({
					toUserId: partnerId,
					type: "diversion_nuevo",
					title: `Nuevo ${label.toLowerCase()} para ti 😄`,
					message: form.content.trim().slice(0, 120),
					link: "/diversion"
				});
			}
		},
		onSuccess: () => {
			toast.success("¡Agregado!");
			setForm({
				category: "chiste",
				content: "",
				answer: "",
				option1: "",
				option2: "",
				option3: "",
				option4: ""
			});
			setOpen(false);
			qc.invalidateQueries({ queryKey: ["fun-items"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("fun_items").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Eliminado");
			qc.invalidateQueries({ queryKey: ["fun-items"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleFavorite = useMutation({
		mutationFn: async (item) => {
			const { error } = await supabase.from("fun_items").update({ is_favorite: !item.is_favorite }).eq("id", item.id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-items"] }),
		onError: () => toast.error("Solo puedes marcar como favorito lo que escribiste tú")
	});
	const toggleReaction = useMutation({
		mutationFn: async ({ item, type }) => {
			if (!user) return;
			const existing = reactions?.find((r) => r.fun_item_id === item.id && r.user_id === user.id && r.reaction_type === type);
			if (existing) {
				const { error } = await supabase.from("fun_reactions").delete().eq("id", existing.id);
				if (error) throw error;
				return;
			}
			const { error } = await supabase.from("fun_reactions").insert({
				fun_item_id: item.id,
				user_id: user.id,
				reaction_type: type
			});
			if (error) throw error;
			if (item.user_id !== user.id) {
				const r = REACTIONS.find((x) => x.type === type);
				await notifyPartner({
					toUserId: item.user_id,
					type: "diversion_reaccion",
					title: `Reaccionaron a lo que escribiste ${r?.emoji ?? ""}`,
					message: item.content.slice(0, 120),
					link: "/diversion"
				});
			}
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-reactions"] }),
		onError: (e) => toast.error(e.message)
	});
	const rate = useMutation({
		mutationFn: async ({ item, score }) => {
			if (!user) return;
			const existing = ratings?.find((r) => r.fun_item_id === item.id && r.user_id === user.id);
			if (existing) {
				const { error } = await supabase.from("fun_ratings").update({ score }).eq("id", existing.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("fun_ratings").insert({
					fun_item_id: item.id,
					user_id: user.id,
					score
				});
				if (error) throw error;
			}
			if (item.user_id !== user.id) await notifyPartner({
				toUserId: item.user_id,
				type: "diversion_puntuacion",
				title: `Le pusieron ${score} de 5 ⭐ a lo que escribiste`,
				message: item.content.slice(0, 120),
				link: "/diversion"
			});
		},
		onSuccess: () => {
			toast.success("¡Puntuado!");
			qc.invalidateQueries({ queryKey: ["fun-ratings"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const addComment = useMutation({
		mutationFn: async ({ item, text }) => {
			if (!user || !text.trim()) return;
			const { error } = await supabase.from("fun_comments").insert({
				fun_item_id: item.id,
				user_id: user.id,
				content: text.trim()
			});
			if (error) throw error;
			if (item.user_id !== user.id) await notifyPartner({
				toUserId: item.user_id,
				type: "diversion_comentario",
				title: "Comentaron lo que escribiste 💬",
				message: text.trim().slice(0, 120),
				link: "/diversion"
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-comments"] }),
		onError: (e) => toast.error(e.message)
	});
	const removeComment = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("fun_comments").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["fun-comments"] })
	});
	const averageOf = (id) => {
		const list = (ratings ?? []).filter((r) => r.fun_item_id === id);
		if (list.length === 0) return null;
		return {
			avg: list.reduce((s, r) => s + r.score, 0) / list.length,
			votes: list.length
		};
	};
	const visible = (0, import_react.useMemo)(() => {
		let list = (items ?? []).filter((i) => category === "todas" || i.category === category);
		if (onlyFavorites) list = list.filter((i) => i.is_favorite);
		if (sort === "mejores") list = list.slice().sort((a, b) => (averageOf(b.id)?.avg ?? 0) - (averageOf(a.id)?.avg ?? 0));
		return list;
	}, [
		items,
		ratings,
		category,
		onlyFavorites,
		sort
	]);
	function surpriseMe() {
		const pool = (items ?? []).filter((i) => i.user_id !== user?.id);
		const list = pool.length > 0 ? pool : items ?? [];
		if (list.length === 0) {
			toast.error("Agreguen algo primero 😄");
			return;
		}
		const pick = list[Math.floor(Math.random() * list.length)];
		setCategory("todas");
		setOnlyFavorites(false);
		setHighlight(pick.id);
		setTimeout(() => {
			document.getElementById(`fun-${pick.id}`)?.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}, 60);
		setTimeout(() => setHighlight(null), 4e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Diversión"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Ríanse, jueguen y conozcan cosas nuevas del otro."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "rounded-full",
						onClick: surpriseMe,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 size-4" }), " Sorpréndeme"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Agregar"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
							className: "max-h-[90vh] overflow-y-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "font-display",
									children: "Agregar algo divertido"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Categoría" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: form.category,
												onValueChange: (v) => setForm({
													...form,
													category: v
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FUN_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c.value,
													children: c.label
												}, c.value)) })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "content",
												children: "Contenido"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												id: "content",
												rows: 4,
												maxLength: 1e3,
												value: form.content,
												onChange: (e) => setForm({
													...form,
													content: e.target.value
												}),
												placeholder: form.category === "chiste" ? "Escribe el chiste..." : form.category === "adivinanza" ? "Escribe la adivinanza..." : form.category === "trivia" ? "Escribe la pregunta..." : "Escribe tu pregunta..."
											})]
										}),
										form.category !== "chiste" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "answer",
												children: "Respuesta correcta"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "answer",
												maxLength: 200,
												value: form.answer,
												onChange: (e) => setForm({
													...form,
													answer: e.target.value
												}),
												placeholder: "La respuesta es..."
											})]
										}),
										form.category === "trivia" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Opciones (mínimo 2)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														placeholder: "Opción A",
														value: form.option1,
														onChange: (e) => setForm({
															...form,
															option1: e.target.value
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														placeholder: "Opción B",
														value: form.option2,
														onChange: (e) => setForm({
															...form,
															option2: e.target.value
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														placeholder: "Opción C (opcional)",
														value: form.option3,
														onChange: (e) => setForm({
															...form,
															option3: e.target.value
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														placeholder: "Opción D (opcional)",
														value: form.option4,
														onChange: (e) => setForm({
															...form,
															option4: e.target.value
														})
													})
												]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "rounded-full",
									onClick: () => create.mutate(),
									disabled: create.isPending,
									children: "Guardar"
								}) })
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: category === "todas" ? "default" : "outline",
						className: "rounded-full",
						onClick: () => setCategory("todas"),
						children: "Todos"
					}),
					FUN_CATEGORIES.map((c) => {
						const Icon = c.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: category === c.value ? "default" : "outline",
							className: "rounded-full",
							onClick: () => setCategory(c.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mr-1 size-4" }),
								" ",
								c.label
							]
						}, c.value);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: onlyFavorites ? "default" : "outline",
						className: "rounded-full",
						onClick: () => setOnlyFavorites((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("mr-1 size-4", onlyFavorites && "fill-current") }), " Favoritos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "rounded-full",
						onClick: () => setSort((s) => s === "recientes" ? "mejores" : "recientes"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mr-1 size-4" }), sort === "recientes" ? "Más recientes" : "Mejor puntuados"]
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
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl" }, i))
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laugh, { className: "size-8 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "¡Agreguen algo divertido!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Empiecen con un chiste malo 😄"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid items-start gap-4 sm:grid-cols-2",
				children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunCard, {
					item,
					mine: item.user_id === user?.id,
					highlighted: highlight === item.id,
					authorName: nameOf(item.user_id),
					nameOf,
					myId: user?.id,
					rating: averageOf(item.id),
					myScore: ratings?.find((r) => r.fun_item_id === item.id && r.user_id === user?.id)?.score ?? null,
					reactions: (reactions ?? []).filter((r) => r.fun_item_id === item.id),
					comments: (comments ?? []).filter((c) => c.fun_item_id === item.id),
					onDelete: () => remove.mutate(item.id),
					onToggleFavorite: () => toggleFavorite.mutate(item),
					onReact: (type) => toggleReaction.mutate({
						item,
						type
					}),
					onRate: (score) => rate.mutate({
						item,
						score
					}),
					onComment: (text) => addComment.mutate({
						item,
						text
					}),
					onDeleteComment: (id) => removeComment.mutate(id)
				}, item.id))
			})
		]
	});
}
function Stars$1({ value, onPick }) {
	const [hover, setHover] = (0, import_react.useState)(null);
	const active = hover ?? value ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-0.5",
		onMouseLeave: () => setHover(null),
		children: [
			1,
			2,
			3,
			4,
			5
		].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": `Puntuar con ${n}`,
			onMouseEnter: () => setHover(n),
			onClick: () => onPick(n),
			className: "p-0.5 transition-transform hover:scale-125",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", n <= active ? "fill-gold text-gold" : "text-muted-foreground") })
		}, n))
	});
}
function FunCard({ item, mine, highlighted, authorName, nameOf, myId, rating, myScore, reactions, comments, onDelete, onToggleFavorite, onReact, onRate, onComment, onDeleteComment }) {
	const [showAnswer, setShowAnswer] = (0, import_react.useState)(false);
	const [selectedOption, setSelectedOption] = (0, import_react.useState)(null);
	const [showComments, setShowComments] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const CategoryIcon = FUN_CATEGORIES.find((c) => c.value === item.category)?.icon || CircleQuestionMark;
	const handleOptionSelect = (option) => {
		setSelectedOption(option);
		if (item.answer && option === item.answer) toast.success("¡Correcto! 🎉");
		else if (item.answer) toast.error(`Incorrecto. La respuesta era: ${item.answer}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: `fun-${item.id}`,
		className: cn("animate-fade-up scroll-mt-24 transition-shadow target:ring-2 target:ring-primary", highlighted && "ring-2 ring-primary shadow-[0_0_35px_-8px_var(--primary)]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryIcon, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: FUN_CATEGORIES.find((c) => c.value === item.category)?.label
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Favorito",
						onClick: onToggleFavorite,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", item.is_favorite ? "fill-primary text-primary" : "text-muted-foreground") })
					}), mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Eliminar",
						onClick: onDelete,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed",
				children: item.content
			}),
			item.category === "trivia" && item.options && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
					value: selectedOption ?? "",
					children: item.options.map((option, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center space-x-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
							value: option,
							id: `opt-${item.id}-${idx}`,
							onClick: () => handleOptionSelect(option),
							disabled: !!selectedOption
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `opt-${item.id}-${idx}`,
							className: "cursor-pointer text-sm",
							children: option
						})]
					}, idx))
				}), selectedOption && item.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-2 text-sm font-medium", selectedOption === item.answer ? "text-primary" : "text-destructive"),
					children: selectedOption === item.answer ? "✅ ¡Correcto!" : `❌ La respuesta era: ${item.answer}`
				})]
			}),
			(item.category === "adivinanza" || item.category === "pregunta") && item.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					className: "rounded-full",
					onClick: () => setShowAnswer(!showAnswer),
					children: showAnswer ? "Ocultar respuesta" : "Ver respuesta"
				}), showAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm font-medium text-primary",
					children: item.answer
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3",
				children: [REACTIONS.map((r) => {
					const mineR = reactions.some((x) => x.user_id === myId && x.reaction_type === r.type);
					const count = reactions.filter((x) => x.reaction_type === r.type).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						title: r.label,
						onClick: () => onReact(r.type),
						className: cn("flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-transform hover:scale-110", mineR ? "border-primary bg-primary/15" : "border-border"),
						children: [r.emoji, count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: count
						})]
					}, r.type);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowComments((v) => !v),
					className: "ml-auto flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }),
						" ",
						comments.length
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars$1, {
					value: myScore,
					onPick: onRate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: rating ? `${rating.avg.toFixed(1)} ★ · ${rating.votes} ${rating.votes === 1 ? "voto" : "votos"}` : "Sin puntuar"
				})]
			}),
			showComments && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2 border-t border-border/60 pt-3",
				children: [comments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-40 space-y-2 overflow-y-auto",
					children: comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [nameOf(c.user_id), ":"]
							}),
							" ",
							c.content
						] }), c.user_id === myId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Borrar comentario",
							className: "shrink-0 text-muted-foreground hover:text-destructive",
							onClick: () => onDeleteComment(c.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						})]
					}, c.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Sé el primero en comentar."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: "Escribe un comentario…",
						onKeyDown: (e) => {
							if (e.key === "Enter" && text.trim()) {
								onComment(text);
								setText("");
							}
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						className: "rounded-full",
						"aria-label": "Enviar comentario",
						disabled: !text.trim(),
						onClick: () => {
							onComment(text);
							setText("");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"Por ",
					authorName,
					" ·",
					" ",
					new Date(item.created_at).toLocaleDateString("es", {
						day: "numeric",
						month: "short"
					})
				]
			})
		] })]
	});
}
//#endregion
export { FunPage as component };
