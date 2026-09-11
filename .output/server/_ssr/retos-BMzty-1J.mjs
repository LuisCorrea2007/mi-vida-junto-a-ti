import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles } from "./use-profiles-BF23D9k9.mjs";
import { t as useCouple } from "./use-couple-DkHteiG_.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Y as Flame, a as Trophy, d as Sparkles, lt as Check, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { c as pickOfTheDay } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { t as useHearts } from "./hearts-BQnLKLIB.mjs";
import { t as CHALLENGE_IDEAS } from "./romance-Dmd8xZIU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/retos-BMzty-1J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function RetosPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: couple } = useCouple(user?.id);
	const { data: profiles } = useProfiles();
	const { burst, hearts } = useHearts();
	useRealtime("challenges", "challenge_completions");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const { data: challenges = [] } = useQuery({
		queryKey: ["challenges"],
		queryFn: async () => {
			const { data, error } = await supabase.from("challenges").select("id, user_id, title, description").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: completions = [] } = useQuery({
		queryKey: ["challenge_completions"],
		queryFn: async () => {
			const { data, error } = await supabase.from("challenge_completions").select("id, challenge_id, user_id, day").order("day", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async (input) => {
			if (!user) throw new Error("Inicia sesión");
			if (!input.title.trim()) throw new Error("Escribe el reto");
			const { error } = await supabase.from("challenges").insert({
				user_id: user.id,
				title: input.title.trim(),
				description: input.description?.trim() || null
			});
			if (error) throw error;
			if (couple?.partnerId) await notifyPartner({
				toUserId: couple.partnerId,
				type: "reto",
				title: "Nuevo reto para nosotros ✨",
				message: input.title.trim(),
				link: "/retos"
			});
		},
		onSuccess: () => {
			setOpen(false);
			setTitle("");
			setDescription("");
			toast.success("Reto añadido");
			qc.invalidateQueries({ queryKey: ["challenges"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggle = useMutation({
		mutationFn: async (challenge) => {
			if (!user) throw new Error("Inicia sesión");
			const mine = completions.find((c) => c.challenge_id === challenge.id && c.user_id === user.id && c.day === today());
			if (mine) {
				const { error } = await supabase.from("challenge_completions").delete().eq("id", mine.id);
				if (error) throw error;
				return false;
			}
			const { error } = await supabase.from("challenge_completions").insert({
				challenge_id: challenge.id,
				user_id: user.id,
				day: today()
			});
			if (error) throw error;
			if (couple?.partnerId) await notifyPartner({
				toUserId: couple.partnerId,
				type: "reto",
				title: "¡Cumplí un reto! 🏆",
				message: challenge.title,
				link: "/retos"
			});
			return true;
		},
		onSuccess: (done) => {
			if (done) burst(12);
			qc.invalidateQueries({ queryKey: ["challenge_completions"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("challenges").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
		onError: (e) => toast.error(e.message)
	});
	const idea = pickOfTheDay(CHALLENGE_IDEAS, 1);
	const nameOf = (id) => id === user?.id ? "Tú" : profiles?.find((p) => p.id === id)?.name ?? "Tu pareja";
	const myTotal = completions.filter((c) => c.user_id === user?.id).length;
	const partnerTotal = completions.filter((c) => c.user_id !== user?.id).length;
	/** Días seguidos con al menos un reto cumplido por los dos. */
	const streak = (() => {
		const days = new Set(completions.map((c) => c.day));
		let count = 0;
		const cursor = /* @__PURE__ */ new Date();
		while (days.has(cursor.toISOString().slice(0, 10))) {
			count += 1;
			cursor.setDate(cursor.getDate() - 1);
		}
		return count;
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			hearts,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface warm-gradient p-5 text-center sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Misiones de amor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold sm:text-4xl",
						children: "Retos de pareja"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center justify-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4 text-primary" }),
								" ",
								streak,
								" ",
								streak === 1 ? "día" : "días",
								" de racha"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4 text-primary" }),
								" Tú ",
								myTotal,
								" · Ella ",
								partnerTotal
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-6 rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Crear reto"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nuevo reto" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ch-title",
										children: "Reto"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ch-title",
										value: title,
										onChange: (e) => setTitle(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ch-desc",
										children: "Detalle (opcional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "ch-desc",
										rows: 3,
										value: description,
										onChange: (e) => setDescription(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full rounded-full",
									disabled: create.isPending,
									onClick: () => create.mutate({
										title,
										description
									}),
									children: "Guardar"
								})
							]
						})] })]
					})
				]
			}),
			idea && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Reto sugerido de hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xl",
						children: idea.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: idea.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "mt-4 rounded-full",
						disabled: create.isPending,
						onClick: () => create.mutate({
							title: idea.title,
							description: idea.description
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), " Añadirlo a nuestros retos"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Nuestros retos"
				}), challenges.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-4 sm:grid-cols-2",
					children: challenges.map((c) => {
						const mineToday = completions.some((x) => x.challenge_id === c.id && x.user_id === user?.id && x.day === today());
						const partnerToday = completions.some((x) => x.challenge_id === c.id && x.user_id !== user?.id && x.day === today());
						const total = completions.filter((x) => x.challenge_id === c.id).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							id: c.id,
							className: "surface scroll-mt-24 p-5 target:ring-2 target:ring-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold",
									children: c.title
								}),
								c.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: c.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: [
										"Propuesto por ",
										nameOf(c.user_id),
										" · cumplido ",
										total,
										" ",
										total === 1 ? "vez" : "veces"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: mineToday ? "default" : "outline",
											className: "rounded-full",
											onClick: () => toggle.mutate(c),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), mineToday ? "Cumplido hoy" : "Lo cumplí hoy"]
										}),
										partnerToday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-primary/15 px-3 py-1 text-xs text-primary",
											children: "Ella también lo hizo hoy 💗"
										}),
										c.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "ml-auto text-xs text-muted-foreground hover:text-destructive",
											onClick: () => remove.mutate(c.id),
											"aria-label": "Borrar reto",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})
									]
								})
							]
						}, c.id);
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "surface p-8 text-center text-sm text-muted-foreground",
					children: "Empiecen con el reto sugerido de hoy."
				})]
			})
		]
	});
}
//#endregion
export { RetosPage as component };
