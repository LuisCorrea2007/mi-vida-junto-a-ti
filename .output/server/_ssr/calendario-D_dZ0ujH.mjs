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
import { Q as ExternalLink, dt as CalendarHeart, lt as Check, nt as Clock, o as Trash2, t as X, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { n as EVENT_CATEGORIES, s as labelFor } from "./content-IdYYa_dU.mjs";
import { t as Textarea } from "./textarea-DrdjxuB0.mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B2qHqcPM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendario-D_dZ0ujH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAYS = [
	"L",
	"M",
	"X",
	"J",
	"V",
	"S",
	"D"
];
function monthMatrix(year, month) {
	const offset = (new Date(year, month, 1).getDay() + 6) % 7;
	const days = new Date(year, month + 1, 0).getDate();
	const cells = Array(offset).fill(null);
	for (let d = 1; d <= days; d++) cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
	return cells;
}
function CalendarPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	useRealtime("events", "event_responses");
	const today = /* @__PURE__ */ new Date();
	const [cursor, setCursor] = (0, import_react.useState)({
		y: today.getFullYear(),
		m: today.getMonth()
	});
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		date: today.toISOString().slice(0, 10),
		time: "",
		location: "",
		category: "romantica"
	});
	const { data: events, isLoading } = useQuery({
		queryKey: ["events"],
		queryFn: async () => {
			const { data, error } = await supabase.from("events").select("id, title, description, date, time, location, category, user_id, countdown_enabled").order("date");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: responses } = useQuery({
		queryKey: ["event-responses"],
		queryFn: async () => {
			const { data, error } = await supabase.from("event_responses").select("id, event_id, user_id, response_status");
			if (error) throw error;
			return data ?? [];
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Sin sesión");
			if (!form.title.trim()) throw new Error("Ponle un título al plan");
			const { error } = await supabase.from("events").insert({
				user_id: user.id,
				title: form.title.trim().slice(0, 140),
				description: form.description.slice(0, 2e3) || null,
				date: form.date,
				time: form.time || null,
				location: form.location.slice(0, 160) || null,
				category: form.category
			});
			if (error) throw error;
			const other = profiles?.find((p) => p.id !== user.id);
			if (other) await notifyPartner({
				toUserId: other.id,
				type: "cita",
				title: "Nueva propuesta de cita",
				message: form.title.trim().slice(0, 140),
				link: "/calendario"
			});
		},
		onSuccess: () => {
			toast.success("Plan propuesto");
			setOpen(false);
			setForm({
				...form,
				title: "",
				description: "",
				time: "",
				location: ""
			});
			qc.invalidateQueries({ queryKey: ["events"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const respond = useMutation({
		mutationFn: async ({ eventId, status }) => {
			if (!user) return;
			const mine = responses?.find((r) => r.event_id === eventId && r.user_id === user.id);
			if (mine) await supabase.from("event_responses").update({ response_status: status }).eq("id", mine.id);
			else await supabase.from("event_responses").insert({
				event_id: eventId,
				user_id: user.id,
				response_status: status
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["event-responses"] })
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("events").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["events"] });
			toast.success("Plan eliminado");
		},
		onError: () => toast.error("Solo quien creó el plan puede eliminarlo")
	});
	function Countdown({ targetDate, time }) {
		const [remaining, setRemaining] = (0, import_react.useState)({
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0
		});
		(0, import_react.useEffect)(() => {
			const calculate = () => {
				const target = /* @__PURE__ */ new Date(`${targetDate}T${time || "00:00:00"}`);
				const now = /* @__PURE__ */ new Date();
				const diff = target.getTime() - now.getTime();
				if (diff <= 0) {
					setRemaining({
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					});
					return;
				}
				setRemaining({
					days: Math.floor(diff / 864e5),
					hours: Math.floor(diff % 864e5 / 36e5),
					minutes: Math.floor(diff % 36e5 / 6e4),
					seconds: Math.floor(diff % 6e4 / 1e3)
				});
			};
			calculate();
			const interval = setInterval(calculate, 1e3);
			return () => clearInterval(interval);
		}, [targetDate, time]);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-medium",
				children: [
					remaining.days,
					"d ",
					remaining.hours,
					"h ",
					remaining.minutes,
					"m ",
					remaining.seconds,
					"s"
				]
			})]
		});
	}
	const exportToGoogleCalendar = (event) => {
		const baseUrl = "https://calendar.google.com/calendar/render";
		const params = new URLSearchParams({
			action: "TEMPLATE",
			text: event.title,
			details: event.description || "",
			location: event.location || "",
			dates: `${event.date.replace(/-/g, "")}T${(event.time || "000000").replace(":", "")}00/${event.date.replace(/-/g, "")}T${(event.time || "235959").replace(":", "")}00`
		});
		window.open(`${baseUrl}?${params.toString()}`, "_blank");
	};
	const addToDeviceCalendar = (event) => {
		const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nuestro Espacio//ES
BEGIN:VEVENT
UID:${event.id}@nuestroespacio
DTSTAMP:${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${event.date.replace(/-/g, "")}T${(event.time || "000000").replace(":", "")}00
DTEND:${event.date.replace(/-/g, "")}T${(event.time || "235959").replace(":", "")}00
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
		const blob = new Blob([icsContent], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${event.title}.ics`;
		a.click();
		URL.revokeObjectURL(url);
	};
	const cells = monthMatrix(cursor.y, cursor.m);
	const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("es", {
		month: "long",
		year: "numeric"
	});
	const todayStr = today.toISOString().slice(0, 10);
	const dayEvents = (d) => (events ?? []).filter((e) => e.date === d);
	const listed = selected ? dayEvents(selected) : (events ?? []).filter((e) => e.date >= todayStr);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Citas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Propón, acepten y no olviden ninguna fecha."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Proponer plan"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Nuevo plan"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "et",
										children: "Título"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "et",
										maxLength: 140,
										value: form.title,
										onChange: (e) => setForm({
											...form,
											title: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "ed",
											children: "Fecha"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "ed",
											type: "date",
											value: form.date,
											onChange: (e) => setForm({
												...form,
												date: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "eh",
											children: "Hora"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "eh",
											type: "time",
											value: form.time,
											onChange: (e) => setForm({
												...form,
												time: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "el",
										children: "Lugar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "el",
										maxLength: 160,
										value: form.location,
										onChange: (e) => setForm({
											...form,
											location: e.target.value
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: EVENT_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.value,
											children: c.label
										}, c.value)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "edesc",
										children: "Detalles"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "edesc",
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
							children: "Proponer"
						}) })
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setCursor(({ y, m }) => m === 0 ? {
									y: y - 1,
									m: 11
								} : {
									y,
									m: m - 1
								}),
								children: "Anterior"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-semibold capitalize",
								children: monthLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setCursor(({ y, m }) => m === 11 ? {
									y: y + 1,
									m: 0
								} : {
									y,
									m: m + 1
								}),
								children: "Siguiente"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground",
						children: WEEKDAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d }, d))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 grid grid-cols-7 gap-1",
						children: cells.map((d, i) => d === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}, `e${i}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSelected(selected === d ? null : d),
							className: cn("flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent", d === todayStr && "border border-primary", selected === d && "bg-primary text-primary-foreground"),
							children: [Number(d.slice(-2)), dayEvents(d).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-0.5 size-1.5 rounded-full bg-primary" })]
						}, d))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: selected ? (/* @__PURE__ */ new Date(`${selected}T00:00:00`)).toLocaleDateString("es", {
						weekday: "long",
						day: "numeric",
						month: "long"
					}) : "Próximos planes"
				}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-2xl" }) : listed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface flex flex-col items-center gap-2 p-8 text-center sm:p-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarHeart, { className: "size-7 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nada agendado. Propongan algo rico."
					})]
				}) : listed.map((e) => {
					const mine = responses?.find((r) => r.event_id === e.id && r.user_id === user?.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						id: e.id,
						className: "surface animate-fade-up p-5 target:ring-2 target:ring-primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: labelFor(EVENT_CATEGORIES, e.category)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											(/* @__PURE__ */ new Date(`${e.date}T00:00:00`)).toLocaleDateString("es", {
												day: "numeric",
												month: "long"
											}),
											e.time ? ` · ${e.time}` : "",
											e.location ? ` · ${e.location}` : ""
										]
									}),
									e.user_id === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "ml-auto",
										"aria-label": "Eliminar plan",
										onClick: () => remove.mutate(e.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-lg font-semibold",
								children: e.title
							}),
							e.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: e.description
							}),
							/* @__PURE__ */ new Date(`${e.date}T${e.time || "00:00:00"}`) > /* @__PURE__ */ new Date() && e.countdown_enabled !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
									targetDate: e.date,
									time: e.time
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "rounded-full",
									onClick: () => exportToGoogleCalendar(e),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 size-4" }), " Google Calendar"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "rounded-full",
									onClick: () => addToDeviceCalendar(e),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarHeart, { className: "mr-1 size-4" }), " Descargar .ics"]
								})]
							}),
							e.user_id !== user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: mine?.response_status === "aceptada" ? "default" : "outline",
									className: "rounded-full",
									onClick: () => respond.mutate({
										eventId: e.id,
										status: "aceptada"
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), " Acepto"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: mine?.response_status === "rechazada" ? "default" : "outline",
									className: "rounded-full",
									onClick: () => respond.mutate({
										eventId: e.id,
										status: "rechazada"
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-4" }), " Ahora no"]
								})]
							})
						]
					}, e.id);
				})]
			})
		]
	});
}
//#endregion
export { CalendarPage as component };
