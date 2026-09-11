import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { t as Label } from "./label-_AN6BsJs.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { W as Heart, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { c as pickOfTheDay, t as DAILY_QUESTIONS } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diario-BN-vWgRc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DiaryPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	useRealtime("milestones");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const { data: milestones, isLoading } = useQuery({
		queryKey: ["milestones"],
		queryFn: async () => {
			const { data, error } = await supabase.from("milestones").select("id, title, description, date, user_id").order("date", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.title.trim()) throw new Error("Ponle nombre al momento");
			const { error } = await supabase.from("milestones").insert({
				user_id: user.id,
				title: form.title.trim().slice(0, 140),
				description: form.description.slice(0, 2e3) || null,
				date: form.date
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Momento guardado");
			setOpen(false);
			setForm({
				title: "",
				description: "",
				date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			});
			qc.invalidateQueries({ queryKey: ["milestones"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("milestones").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["milestones"] }),
		onError: () => toast.error("Solo quien lo añadió puede eliminarlo")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Diario"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "La historia de los dos, momento a momento."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Añadir momento"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Nuevo momento"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "mt",
										children: "¿Qué pasó?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "mt",
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
										htmlFor: "md",
										children: "Fecha"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "md",
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "mdesc",
										children: "Cómo lo recuerdan"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "mdesc",
										rows: 4,
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
							children: "Guardar"
						}) })
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.25em] text-primary",
					children: "Pregunta para hablar hoy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-display text-xl",
					children: pickOfTheDay(DAILY_QUESTIONS, 3)
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl" }) : !milestones?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface flex flex-col items-center gap-3 p-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-8 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Su historia empieza aquí"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Añadan el primer día, el primer viaje, el primer “te quiero”."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "relative space-y-6 border-l border-border pl-6",
				children: milestones.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					id: m.id,
					className: "animate-fade-up relative scroll-mt-24 target:ring-2 target:ring-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -left-[31px] top-2 size-3 rounded-full bg-primary ring-4 ring-background" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: (/* @__PURE__ */ new Date(`${m.date}T00:00:00`)).toLocaleDateString("es", {
									day: "numeric",
									month: "long",
									year: "numeric"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-xl font-semibold",
								children: m.title
							})] }), m.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Eliminar momento",
								onClick: () => remove.mutate(m.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
							})]
						}), m.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm text-muted-foreground",
							children: m.description
						})]
					})]
				}, m.id))
			})
		]
	});
}
//#endregion
export { DiaryPage as component };
