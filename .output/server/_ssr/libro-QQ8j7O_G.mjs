import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles, t as anniversaryOf } from "./use-profiles-BF23D9k9.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { H as Images, S as NotebookPen, W as Heart, _ as Printer, dt as CalendarHeart, mt as BookOpen, n as Video } from "../_libs/lucide-react.mjs";
import { n as EVENT_CATEGORIES, r as NOTE_CATEGORIES, s as labelFor } from "./content-IdYYa_dU.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/libro-QQ8j7O_G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BookPhoto({ path, caption }) {
	const { data: url } = useSignedUrl(path);
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square w-full rounded-xl" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "break-inside-avoid",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: caption ?? "Recuerdo",
			className: "aspect-square w-full rounded-xl object-cover"
		}), caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "mt-1 text-center text-xs text-muted-foreground",
			children: caption
		})]
	});
}
function BookPage() {
	const { data: profiles } = useProfiles();
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const [year, setYear] = (0, import_react.useState)(currentYear);
	const years = (0, import_react.useMemo)(() => [
		currentYear,
		currentYear - 1,
		currentYear - 2
	], [currentYear]);
	const range = {
		from: `${year}-01-01`,
		to: `${year}-12-31T23:59:59`
	};
	const { data, isLoading } = useQuery({
		queryKey: ["libro", year],
		queryFn: async () => {
			const [photos, milestones, events, notes, videos] = await Promise.all([
				supabase.from("photos").select("id, file_path, caption, created_at, is_favorite").gte("created_at", range.from).lte("created_at", range.to).order("is_favorite", { ascending: false }).order("created_at").limit(12),
				supabase.from("milestones").select("id, title, description, date").gte("date", range.from).lte("date", `${year}-12-31`).order("date"),
				supabase.from("events").select("id, title, date, category, location").gte("date", range.from).lte("date", `${year}-12-31`).order("date"),
				supabase.from("notes").select("id, title, content, category, created_at").gte("created_at", range.from).lte("created_at", range.to).order("is_favorite", { ascending: false }).order("created_at").limit(8),
				supabase.from("videos_diarios").select("id", {
					count: "exact",
					head: true
				}).gte("created_at", range.from).lte("created_at", range.to)
			]);
			return {
				photos: photos.data ?? [],
				milestones: milestones.data ?? [],
				events: events.data ?? [],
				notes: notes.data ?? [],
				videoCount: videos.count ?? 0
			};
		}
	});
	const anniversary = anniversaryOf(profiles);
	const names = profiles?.map((p) => p.name).filter(Boolean).join(" & ") ?? "Ustedes dos";
	const days = anniversary ? Math.max(0, Math.floor((Date.now() - (/* @__PURE__ */ new Date(`${anniversary}T00:00:00`)).getTime()) / 864e5)) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 print:space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-4 print:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.25em] text-primary",
					children: "Su historia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold",
					children: "Libro de recuerdos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Un resumen de su año, listo para imprimir o guardar como PDF."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex rounded-full border border-border",
					children: years.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setYear(y),
						className: y === year ? "rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary" : "px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground",
						children: y
					}, y))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "rounded-full",
					onClick: () => window.print(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "mr-2 size-4" }), " Imprimir / PDF"]
				})]
			})]
		}), isLoading || !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl" })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-8 print:space-y-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface warm-gradient break-inside-avoid p-5 text-center sm:p-10 print:rounded-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mx-auto size-8 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-xs uppercase tracking-[0.3em] text-primary",
							children: ["Nuestro Espacio · ", year]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-4xl font-semibold sm:text-5xl",
							children: names
						}),
						anniversary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"Juntos desde el",
								" ",
								(/* @__PURE__ */ new Date(`${anniversary}T00:00:00`)).toLocaleDateString("es", {
									day: "numeric",
									month: "long",
									year: "numeric"
								}),
								days != null && ` · ${days.toLocaleString("es")} días de amor`
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-center min-[420px]:grid-cols-4",
							children: [
								{
									icon: Images,
									n: data.photos.length,
									label: "Fotos"
								},
								{
									icon: NotebookPen,
									n: data.notes.length,
									label: "Notas"
								},
								{
									icon: CalendarHeart,
									n: data.events.length,
									label: "Citas"
								},
								{
									icon: Video,
									n: data.videoCount,
									label: "Videos"
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-background/40 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "mx-auto size-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-xl font-semibold",
										children: s.n
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground",
										children: s.label
									})
								]
							}, s.label))
						})
					]
				}),
				data.photos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-3 flex items-center gap-2 font-display text-2xl font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-5 text-primary" }), " Momentos en fotos"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-3 sm:grid-cols-4",
						children: data.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookPhoto, {
							path: p.file_path,
							caption: p.caption
						}, p.id))
					})]
				}),
				data.milestones.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-3 flex items-center gap-2 font-display text-2xl font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 text-primary" }), " Hitos del año"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: data.milestones.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border/60 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: m.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [(/* @__PURE__ */ new Date(`${m.date}T00:00:00`)).toLocaleDateString("es", {
									day: "numeric",
									month: "long"
								}), m.description ? ` · ${m.description}` : ""]
							})]
						}, m.id))
					})]
				}),
				data.events.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-3 flex items-center gap-2 font-display text-2xl font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarHeart, { className: "size-5 text-primary" }), " Citas y celebraciones"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2 sm:grid-cols-2",
						children: data.events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border/60 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: e.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									labelFor(EVENT_CATEGORIES, e.category),
									" ·",
									" ",
									(/* @__PURE__ */ new Date(`${e.date}T00:00:00`)).toLocaleDateString("es", {
										day: "numeric",
										month: "long"
									}),
									e.location ? ` · ${e.location}` : ""
								]
							})]
						}, e.id))
					})]
				}),
				data.notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-3 flex items-center gap-2 font-display text-2xl font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-5 text-primary" }), " Palabras que se escribieron"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: data.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "rounded-xl border-l-2 border-primary bg-muted/40 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display font-semibold",
									children: n.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 line-clamp-3 text-sm italic text-muted-foreground",
									children: [
										"“",
										n.content,
										"”"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-[11px] text-muted-foreground",
									children: [
										labelFor(NOTE_CATEGORIES, n.category),
										" ·",
										" ",
										new Date(n.created_at).toLocaleDateString("es", {
											day: "numeric",
											month: "long"
										})
									]
								})
							]
						}, n.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pt-4 text-center text-xs text-muted-foreground",
					children: ["Hecho con amor en Nuestro Espacio · ", year]
				})
			]
		})]
	});
}
//#endregion
export { BookPage as component };
