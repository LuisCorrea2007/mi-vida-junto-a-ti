import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles, t as anniversaryOf } from "./use-profiles-BF23D9k9.mjs";
import { t as useCouple } from "./use-couple-DkHteiG_.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as MessageCircleHeart, H as Images, S as NotebookPen, U as Hourglass, V as Laugh, W as Heart, d as Sparkles, dt as CalendarHeart, ft as CalendarClock, m as Send, n as Video, xt as Activity } from "../_libs/lucide-react.mjs";
import { t as useRealtime } from "./use-realtime-CbcWwiQW.mjs";
import { a as ROMANTIC_QUOTES, c as pickOfTheDay, t as DAILY_QUESTIONS } from "./content-IdYYa_dU.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
import { t as useHearts } from "./hearts-BQnLKLIB.mjs";
import { a as timeUntil, i as greeting, n as MOODS, r as daysToAnniversary, t as CHALLENGE_IDEAS } from "./romance-Dmd8xZIU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/panel-DOhOxvEf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function yearsLabel(then) {
	const now = /* @__PURE__ */ new Date();
	const past = new Date(then);
	const years = now.getFullYear() - past.getFullYear();
	if (years >= 1) return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
	const months = (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth());
	if (months >= 1) return months === 1 ? "Hace 1 mes" : `Hace ${months} meses`;
	return "Hace unos días";
}
function MemoryThumb({ path }) {
	const { data: url } = useSignedUrl(path);
	if (!url) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: "Recuerdo de un día como hoy",
		loading: "lazy",
		className: "size-16 shrink-0 rounded-xl object-cover"
	});
}
var KIND_META = {
	foto: {
		icon: Images,
		label: "Foto",
		to: "/galeria"
	},
	nota: {
		icon: NotebookPen,
		label: "Nota",
		to: "/notas"
	},
	video: {
		icon: Video,
		label: "Video",
		to: "/videos"
	}
};
/** Recuerdos automáticos: "un día como hoy" y el resumen del mes en curso. */
function Recuerdos() {
	const today = /* @__PURE__ */ new Date();
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const dd = String(today.getDate()).padStart(2, "0");
	const monthStart = `${today.getFullYear()}-${mm}-01`;
	const { data: memories } = useQuery({
		queryKey: [
			"recuerdos",
			"hoy",
			mm,
			dd
		],
		queryFn: async () => {
			const [photos, notes, videos] = await Promise.all([
				supabase.from("photos").select("id, caption, file_path, created_at").order("created_at", { ascending: false }).limit(200),
				supabase.from("notes").select("id, title, created_at").limit(200),
				supabase.from("videos_diarios").select("id, titulo, created_at").limit(200)
			]);
			const out = [];
			const now = (/* @__PURE__ */ new Date()).toDateString();
			const sameDay = (iso) => {
				const d = new Date(iso);
				return d.toDateString() !== now && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
			};
			for (const p of photos.data ?? []) {
				if (!sameDay(p.created_at)) continue;
				out.push({
					kind: "foto",
					id: p.id,
					title: p.caption ?? "Una foto",
					date: p.created_at,
					path: p.file_path
				});
			}
			for (const n of notes.data ?? []) {
				if (!sameDay(n.created_at)) continue;
				out.push({
					kind: "nota",
					id: n.id,
					title: n.title,
					date: n.created_at
				});
			}
			for (const v of videos.data ?? []) {
				if (!sameDay(v.created_at)) continue;
				out.push({
					kind: "video",
					id: v.id,
					title: v.titulo,
					date: v.created_at
				});
			}
			return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
		}
	});
	const { data: resumen } = useQuery({
		queryKey: [
			"recuerdos",
			"mes",
			monthStart
		],
		queryFn: async () => {
			const since = (/* @__PURE__ */ new Date(`${monthStart}T00:00:00`)).toISOString();
			const [p, n, e, v] = await Promise.all([
				supabase.from("photos").select("id", {
					count: "exact",
					head: true
				}).gte("created_at", since),
				supabase.from("notes").select("id", {
					count: "exact",
					head: true
				}).gte("created_at", since),
				supabase.from("events").select("id", {
					count: "exact",
					head: true
				}).gte("created_at", since),
				supabase.from("videos_diarios").select("id", {
					count: "exact",
					head: true
				}).gte("created_at", since)
			]);
			return {
				fotos: p.count ?? 0,
				notas: n.count ?? 0,
				citas: e.count ?? 0,
				videos: v.count ?? 0
			};
		}
	});
	const monthName = today.toLocaleDateString("es", { month: "long" });
	const totalMes = (resumen?.fotos ?? 0) + (resumen?.notas ?? 0) + (resumen?.citas ?? 0) + (resumen?.videos ?? 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-6 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Un día como hoy"
				})]
			}), memories?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: memories.map((m) => {
					const meta = KIND_META[m.kind];
					const link = m.kind === "nota" ? {
						to: "/notas/$id",
						params: { id: m.id }
					} : { to: meta.to };
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						...link,
						className: "flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted",
						children: [
							m.path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryThumb, { path: m.path }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-5 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium",
									children: m.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										meta.label,
										" · ",
										yearsLabel(m.date)
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 shrink-0 text-primary" })
						]
					}) }, `${m.kind}-${m.id}`);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Hoy aún no hay recuerdos de otros años… pero es un día perfecto para crear uno nuevo."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-xl font-semibold",
					children: ["Su ", monthName]
				})]
			}), totalMes > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-2 gap-3",
				children: [
					{
						label: "Fotos",
						value: resumen?.fotos ?? 0,
						icon: Images
					},
					{
						label: "Notas",
						value: resumen?.notas ?? 0,
						icon: NotebookPen
					},
					{
						label: "Citas",
						value: resumen?.citas ?? 0,
						icon: CalendarClock
					},
					{
						label: "Videos",
						value: resumen?.videos ?? 0,
						icon: Video
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/50 p-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "mx-auto size-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl font-semibold",
							children: s.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: s.label
						})
					]
				}, s.label))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-center text-xs italic text-muted-foreground",
				children: [
					totalMes,
					" ",
					totalMes === 1 ? "momento creado" : "momentos creados",
					" este mes entre los dos."
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "El mes apenas empieza: suban una foto o escriban algo bonito hoy."
			})]
		})]
	});
}
/** Cómo se sienten hoy los dos, más el botón de "pensando en ti". */
function MoodBar() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: couple } = useCouple(user?.id);
	const { data: profiles } = useProfiles();
	const { burst, hearts } = useHearts();
	const [note, setNote] = (0, import_react.useState)("");
	useRealtime("moods");
	const { data: moods = [] } = useQuery({
		queryKey: ["moods"],
		queryFn: async () => {
			const { data, error } = await supabase.from("moods").select("id, user_id, emoji, label, note, created_at").order("created_at", { ascending: false }).limit(30);
			if (error) throw error;
			return data ?? [];
		}
	});
	const mine = moods.find((m) => m.user_id === user?.id);
	const partner = moods.find((m) => m.user_id !== user?.id);
	const partnerName = profiles?.find((p) => p.id === partner?.user_id)?.name ?? "Tu pareja";
	const setMood = useMutation({
		mutationFn: async (mood) => {
			if (!user) throw new Error("Inicia sesión");
			const { error } = await supabase.from("moods").insert({
				user_id: user.id,
				emoji: mood.emoji,
				label: mood.label,
				note: note.trim() || null
			});
			if (error) throw error;
			if (couple?.partnerId) await notifyPartner({
				toUserId: couple.partnerId,
				type: "animo",
				title: `Se siente ${mood.label.toLowerCase()} ${mood.emoji}`,
				message: note.trim() || null,
				link: "/panel"
			});
		},
		onSuccess: () => {
			setNote("");
			toast.success("Ánimo actualizado");
			qc.invalidateQueries({ queryKey: ["moods"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const thinking = useMutation({
		mutationFn: async () => {
			if (!couple?.partnerId) throw new Error("Aún no están vinculados");
			await notifyPartner({
				toUserId: couple.partnerId,
				type: "pensando",
				title: "Está pensando en ti 💭",
				message: "Un abrazo desde donde estoy.",
				link: "/cerca"
			});
		},
		onSuccess: () => {
			burst(16);
			toast.success("Se lo enviamos 💗");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6",
		children: [
			hearts,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "¿Cómo se sienten hoy?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "rounded-full",
					disabled: thinking.isPending,
					onClick: () => thinking.mutate(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 size-4" }), " Pensando en ti 💭"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/50 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.2em] text-primary",
							children: "Tú"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: mine ? `${mine.emoji} ${mine.label}` : "Todavía no elegiste tu ánimo"
						}),
						mine?.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: mine.note
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/50 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.2em] text-primary",
							children: partnerName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: partner ? `${partner.emoji} ${partner.label}` : "Sin ánimo por ahora"
						}),
						partner?.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: partner.note
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					title: m.label,
					disabled: setMood.isPending,
					onClick: () => setMood.mutate(m),
					className: cn("rounded-full bg-muted/60 px-3 py-1.5 text-sm transition-colors hover:bg-accent", mine?.label === m.label && "bg-primary/20"),
					children: [
						m.emoji,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: m.label
						})
					]
				}, m.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: note,
				onChange: (e) => setNote(e.target.value),
				placeholder: "¿Quieres contar por qué? (opcional)"
			})
		]
	});
}
/** Próxima cápsula del tiempo por abrirse. */
function NextCapsule() {
	useRealtime("time_capsules");
	const { data: next } = useQuery({
		queryKey: ["time_capsules", "next"],
		queryFn: async () => {
			const { data, error } = await supabase.from("time_capsules").select("id, title, open_at, user_id").order("open_at").limit(20);
			if (error) throw error;
			const now = Date.now();
			return (data ?? []).find((c) => new Date(c.open_at).getTime() > now) ?? null;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Próxima cápsula"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/capsulas",
					className: "text-xs text-primary hover:underline",
					children: "Ver todas"
				})]
			}),
			next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-3 rounded-xl bg-muted/50 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hourglass, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Hay una cápsula sellada"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["Se abre ", timeUntil(next.open_at)]
				})] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: "Sellen una carta para abrirla en una fecha especial."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "mt-4 rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/capsulas",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), " Crear cápsula"]
				})
			})
		]
	});
}
function useElapsed(since) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(id);
	}, []);
	if (!since) return null;
	const start = (/* @__PURE__ */ new Date(`${since}T00:00:00`)).getTime();
	const diff = Math.max(0, now - start);
	return {
		dias: Math.floor(diff / 864e5),
		horas: Math.floor(diff / 36e5) % 24,
		minutos: Math.floor(diff / 6e4) % 60,
		segundos: Math.floor(diff / 1e3) % 60
	};
}
function PhotoTile({ path, caption }) {
	const { data: url } = useSignedUrl(path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "aspect-square overflow-hidden rounded-xl bg-muted",
		children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: caption ?? "Recuerdo",
			loading: "lazy",
			className: "size-full object-cover transition-transform duration-500 hover:scale-105"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full" })
	});
}
function Panel() {
	const { user } = useAuth();
	const { data: profiles } = useProfiles();
	useRealtime("notes", "photos", "events", "wishes", "notifications");
	const elapsed = useElapsed(anniversaryOf(profiles));
	const quote = pickOfTheDay(ROMANTIC_QUOTES);
	const question = pickOfTheDay(DAILY_QUESTIONS, 3);
	const challengeIdea = pickOfTheDay(CHALLENGE_IDEAS, 1);
	const anniversaryIn = daysToAnniversary(anniversaryOf(profiles));
	const { data: notes } = useQuery({
		queryKey: ["notes", "recent"],
		queryFn: async () => {
			const { data, error } = await supabase.from("notes").select("id, title, category, created_at, user_id").eq("is_archived", false).order("created_at", { ascending: false }).limit(4);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: photos } = useQuery({
		queryKey: ["photos", "recent"],
		queryFn: async () => {
			const { data, error } = await supabase.from("photos").select("id, file_path, caption").order("created_at", { ascending: false }).limit(4);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: events } = useQuery({
		queryKey: ["events", "upcoming"],
		queryFn: async () => {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			const { data, error } = await supabase.from("events").select("id, title, date, time, location, category").gte("date", today).order("date").limit(4);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: stats } = useQuery({
		queryKey: ["stats"],
		queryFn: async () => {
			const [n, p, e, w] = await Promise.all([
				supabase.from("notes").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("photos").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("events").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("wishes").select("id", {
					count: "exact",
					head: true
				})
			]);
			return {
				notas: n.count ?? 0,
				fotos: p.count ?? 0,
				citas: e.count ?? 0,
				deseos: w.count ?? 0
			};
		}
	});
	const me = profiles?.find((p) => p.id === user?.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface warm-gradient animate-fade-up p-5 text-center sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: greeting(me?.name)
					}),
					elapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-3 font-display text-4xl font-semibold sm:text-5xl",
						children: [elapsed.dias.toLocaleString("es"), " días juntos"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm text-muted-foreground",
						children: [
							elapsed.horas,
							"h ",
							elapsed.minutos,
							"m ",
							elapsed.segundos,
							"s"
						]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-semibold",
							children: "¿Desde cuándo son ustedes?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-4 rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/ajustes",
								children: "Añadir fecha de aniversario"
							})
						})]
					}),
					anniversaryIn !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 inline-block rounded-full bg-primary/15 px-4 py-1.5 text-xs text-primary",
						children: anniversaryIn === 0 ? "¡Hoy es su aniversario! 🎉" : `Faltan ${anniversaryIn} ${anniversaryIn === 1 ? "día" : "días"} para su aniversario 💗`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-6 max-w-md text-sm italic text-muted-foreground",
						children: [
							"“",
							quote,
							"”"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "surface warm-gradient p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-primary/15 p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircleHeart, { className: "size-6 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.2em] text-primary",
								children: "Consejo del día"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-xl font-semibold",
								children: "Habla con el Consejero"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-sm text-muted-foreground",
								children: "Cuéntale cómo te sientes, qué pasó entre ustedes o qué quieres mejorar. Te responderá teniendo en cuenta su relación."
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "rounded-full shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/consejero",
							children: "Pedir consejo"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6",
				children: [
					{
						label: "Notas",
						value: stats?.notas,
						icon: NotebookPen,
						to: "/notas"
					},
					{
						label: "Fotos",
						value: stats?.fotos,
						icon: Images,
						to: "/galeria"
					},
					{
						label: "Citas",
						value: stats?.citas,
						icon: CalendarHeart,
						to: "/calendario"
					},
					{
						label: "Deseos",
						value: stats?.deseos,
						icon: Sparkles,
						to: "/deseos"
					},
					{
						label: "Diversión",
						value: "∞",
						icon: Laugh,
						to: "/diversion"
					},
					{
						label: "Videos",
						value: "",
						icon: Video,
						to: "/videos"
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: s.to,
					className: "surface p-4 transition-shadow hover:shadow-[var(--shadow-lift)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "size-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-2xl font-semibold",
							children: s.value ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: s.label
						})
					]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Próximas citas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/calendario",
							className: "text-xs text-primary hover:underline",
							children: "Ver todo"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: events?.length ? events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-xl bg-muted/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarHeart, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: e.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									(/* @__PURE__ */ new Date(`${e.date}T00:00:00`)).toLocaleDateString("es", {
										weekday: "long",
										day: "numeric",
										month: "long"
									}),
									e.time ? ` · ${e.time}` : "",
									e.location ? ` · ${e.location}` : ""
								]
							})] })]
						}, e.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-6 text-center text-sm text-muted-foreground",
							children: "Aún no hay planes. ¡Propón uno!"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Últimas notas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/notas",
							className: "text-xs text-primary hover:underline",
							children: "Ver todo"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: notes?.length ? notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/notas/$id",
							params: { id: n.id },
							className: "flex items-start gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: n.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(n.created_at).toLocaleDateString("es", {
									day: "numeric",
									month: "long"
								})
							})] })]
						}) }, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-6 text-center text-sm text-muted-foreground",
							children: "Escriban su primera nota."
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: "Recuerdos recientes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/galeria",
						className: "text-xs text-primary hover:underline",
						children: "Ver galería"
					})]
				}), photos?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoTile, {
						path: p.file_path,
						caption: p.caption
					}, p.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Suban su primera foto juntos."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoodBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextCapsule, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold",
								children: "Reto de hoy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/retos",
								className: "text-xs text-primary hover:underline",
								children: "Ver retos"
							})]
						}),
						challengeIdea && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-display text-lg",
							children: challengeIdea.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: challengeIdea.description
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-4 rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/canciones",
								children: "Nuestras canciones y frases"
							})
						})
					]
				})]
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityWidget, { userId: user.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recuerdos, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Pregunta de hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xl",
						children: question
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "mt-5 rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/notas",
							children: "Responder en una nota"
						})
					})
				]
			})
		]
	});
}
/** Qué ha hecho la otra persona últimamente (a partir de los avisos recibidos). */
function ActivityWidget({ userId }) {
	const navigate = useNavigate();
	const { data: activity } = useQuery({
		queryKey: ["activity", userId],
		queryFn: async () => {
			const { data, error } = await supabase.from("notifications").select("id, title, message, link, created_at, type").eq("user_id", userId).order("created_at", { ascending: false }).limit(8);
			if (error) throw error;
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-semibold",
				children: "Lo último de tu pareja"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/cerca",
				className: "text-xs text-primary hover:underline",
				children: "¿Qué hace ahora?"
			})]
		}), activity?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 divide-y divide-border/60",
			children: activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "flex w-full min-w-0 flex-wrap items-start gap-3 py-3 text-left hover:opacity-80 sm:flex-nowrap",
				onClick: () => a.link && navigate({ href: a.link }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "mt-0.5 size-4 shrink-0 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-medium",
							children: a.title
						}), a.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted-foreground",
							children: a.message
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-[11px] text-muted-foreground",
						children: new Date(a.created_at).toLocaleString("es", {
							day: "numeric",
							month: "short",
							hour: "2-digit",
							minute: "2-digit"
						})
					})
				]
			}) }, a.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Aquí verás lo que tu pareja suba, comente o cambie."
		})]
	});
}
//#endregion
export { Panel as component };
