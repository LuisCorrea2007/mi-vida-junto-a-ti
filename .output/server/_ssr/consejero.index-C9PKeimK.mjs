import { t as supabase } from "./client-DLsAaqJR.mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as MessageCircleHeart, K as HeartHandshake, o as Trash2, r as Users, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { n as threadTitleFrom, t as ADVISOR_STARTERS } from "./advisor-0nLqBoCo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/consejero.index-C9PKeimK.js
var import_jsx_runtime = require_jsx_runtime();
function ConsejeroIndex() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	useRealtime("advisor_threads");
	const { data: threads } = useQuery({
		queryKey: ["advisor-threads"],
		queryFn: async () => {
			const { data, error } = await supabase.from("advisor_threads").select("id, user_id, title, is_shared, updated_at").order("updated_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async (first) => {
			if (!user) throw new Error("Sin sesión");
			const { data, error } = await supabase.from("advisor_threads").insert({
				user_id: user.id,
				title: first ? threadTitleFrom(first) : "Nueva conversación"
			}).select("id").single();
			if (error) throw error;
			return data.id;
		},
		onSuccess: (id, first) => {
			qc.invalidateQueries({ queryKey: ["advisor-threads"] });
			navigate({
				to: "/consejero/$id",
				params: { id },
				...first ? { search: { inicio: first } } : {}
			});
		},
		onError: () => toast.error("No se pudo abrir la conversación")
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("advisor_threads").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["advisor-threads"] }),
		onError: () => toast.error("No se pudo borrar")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface warm-gradient animate-fade-up p-5 text-center sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "mx-auto size-8 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold sm:text-4xl",
						children: "Consejero"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-sm text-muted-foreground",
						children: "Cuéntale lo que está pasando entre ustedes —una pelea, un mal día, ganas de sorprenderla— y te da consejos pensados para su relación. También puede escribir notas, agendar planes o avisarle a tu amor."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-6 rounded-full",
						disabled: create.isPending,
						onClick: () => create.mutate(void 0),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Cuéntame cómo te sientes"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Para empezar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: ADVISOR_STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: create.isPending,
						onClick: () => create.mutate(s),
						className: "rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
						children: s
					}, s))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Sus conversaciones"
				}), threads?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 divide-y divide-border/60",
					children: threads.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/consejero/$id",
							params: { id: t.id },
							className: "flex min-w-0 flex-1 items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircleHeart, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium",
									children: t.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground",
									children: [new Date(t.updated_at).toLocaleString("es", {
										day: "numeric",
										month: "short",
										hour: "2-digit",
										minute: "2-digit"
									}), t.is_shared && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }), " Compartida"]
									})]
								})]
							})]
						}), t.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Borrar conversación",
							onClick: () => remove.mutate(t.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-muted-foreground" })
						})]
					}, t.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Todavía no hay charlas. Empieza contándole cómo te sientes hoy."
				})]
			})
		]
	});
}
//#endregion
export { ConsejeroIndex as component };
