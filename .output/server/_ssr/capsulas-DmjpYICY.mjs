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
import { A as MailOpen, M as Lock, N as LockOpen, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { t as useHearts } from "./hearts-BQnLKLIB.mjs";
import { a as timeUntil } from "./romance-Dmd8xZIU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capsulas-DmjpYICY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CapsulasPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: couple } = useCouple(user?.id);
	const { data: profiles } = useProfiles();
	const { burst, hearts } = useHearts();
	useRealtime("time_capsules");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [content, setContent] = (0, import_react.useState)("");
	const [openAt, setOpenAt] = (0, import_react.useState)("");
	const { data: capsules = [] } = useQuery({
		queryKey: ["time_capsules"],
		queryFn: async () => {
			const { data, error } = await supabase.from("time_capsules").select("id, user_id, title, content, open_at, opened_at, created_at").order("open_at");
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Inicia sesión");
			if (!title.trim() || !openAt) throw new Error("Falta el título o la fecha");
			const { error } = await supabase.from("time_capsules").insert({
				user_id: user.id,
				title: title.trim(),
				content: content.trim() || null,
				open_at: new Date(openAt).toISOString()
			});
			if (error) throw error;
			if (couple?.partnerId) await notifyPartner({
				toUserId: couple.partnerId,
				type: "capsula",
				title: "Te guardé una cápsula del tiempo 💌",
				message: `Se abre el ${new Date(openAt).toLocaleDateString("es", {
					day: "numeric",
					month: "long",
					year: "numeric"
				})}`,
				link: "/capsulas"
			});
		},
		onSuccess: () => {
			setOpen(false);
			setTitle("");
			setContent("");
			setOpenAt("");
			burst(14);
			toast.success("Cápsula sellada");
			qc.invalidateQueries({ queryKey: ["time_capsules"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const markOpened = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("time_capsules").update({ opened_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			burst(18);
			qc.invalidateQueries({ queryKey: ["time_capsules"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("time_capsules").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Cápsula borrada");
			qc.invalidateQueries({ queryKey: ["time_capsules"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const nameOf = (id) => id === user?.id ? "Tú" : profiles?.find((p) => p.id === id)?.name ?? "Tu pareja";
	const now = Date.now();
	const sealed = capsules.filter((c) => new Date(c.open_at).getTime() > now);
	const ready = capsules.filter((c) => new Date(c.open_at).getTime() <= now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			hearts,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface warm-gradient p-5 text-center sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Para el futuro"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold sm:text-4xl",
						children: "Cápsulas del tiempo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-sm text-muted-foreground",
						children: "Escribe algo hoy y déjalo sellado hasta la fecha que elijas. Nadie puede leerlo antes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-6 rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Nueva cápsula"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Sellar una cápsula" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "cap-title",
										children: "Título"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "cap-title",
										value: title,
										onChange: (e) => setTitle(e.target.value),
										placeholder: "Ábrelo en nuestro aniversario"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "cap-content",
										children: "Mensaje"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "cap-content",
										rows: 5,
										value: content,
										onChange: (e) => setContent(e.target.value),
										placeholder: "Lo que quieras decirle en el futuro..."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "cap-date",
										children: "¿Cuándo se abre?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "cap-date",
										type: "datetime-local",
										value: openAt,
										onChange: (e) => setOpenAt(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full rounded-full",
									disabled: create.isPending,
									onClick: () => create.mutate(),
									children: "Sellar cápsula"
								})
							]
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Listas para abrir"
				}), ready.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: ready.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						id: c.id,
						className: "surface scroll-mt-24 p-5 target:ring-2 target:ring-primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold",
									children: c.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"De ",
										nameOf(c.user_id),
										" ·",
										" ",
										new Date(c.open_at).toLocaleDateString("es", {
											day: "numeric",
											month: "long",
											year: "numeric"
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4 shrink-0 text-primary" })]
							}),
							c.opened_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 whitespace-pre-wrap text-sm",
								children: c.content
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "mt-4 w-full rounded-full",
								onClick: () => markOpened.mutate(c.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailOpen, { className: "mr-2 size-4" }), " Abrir ahora"]
							}),
							c.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "mt-3 text-xs text-muted-foreground hover:text-destructive",
								onClick: () => remove.mutate(c.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 inline size-3" }), " Borrar"]
							})
						]
					}, c.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "surface p-8 text-center text-sm text-muted-foreground",
					children: "Aún no hay cápsulas para abrir. La primera llegará a su fecha."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Selladas"
				}), sealed.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: sealed.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						id: c.id,
						className: "surface sealed scroll-mt-24 p-5 text-center target:ring-2 target:ring-primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto size-6 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-display text-lg font-semibold",
								children: c.user_id === user?.id ? c.title : "Cápsula sellada"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"De ",
									nameOf(c.user_id),
									" · se abre ",
									timeUntil(c.open_at)
								]
							}),
							c.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "mt-4 text-xs text-muted-foreground hover:text-destructive",
								onClick: () => remove.mutate(c.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 inline size-3" }), " Borrar"]
							})
						]
					}, c.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "surface p-8 text-center text-sm text-muted-foreground",
					children: "Sella la primera cápsula y sorpréndanse más adelante."
				})]
			})
		]
	});
}
//#endregion
export { CapsulasPage as component };
