import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as useMyProfile } from "./use-profiles-BF23D9k9.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as pushSupported, n as enablePush } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-CvzBEeT_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as LayoutGrid, D as MessageCircleHeart, H as Images, I as LoaderCircle, J as Gift, O as MapPin, S as NotebookPen, U as Hourglass, V as Laugh, W as Heart, Y as Flame, d as Sparkles, dt as CalendarHeart, g as Quote, gt as BellRing, h as Search, ht as Bell, j as LogOut, k as Mail, l as Star, lt as Check, mt as BookOpen, n as Video, ot as ChevronRight, p as Settings, q as Handshake, rt as Circle, t as X, w as Music } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as Badge } from "./badge-Cs-bUju5.mjs";
import { a as DialogTitle, n as DialogContent, t as Dialog } from "./dialog-BqlxLUVZ.mjs";
import { t as ScrollArea } from "./scroll-area-C3DfG48C.mjs";
import { i as Trigger$1, n as Portal, r as Root2$1, t as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BJRIci7s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var KIND_ORDER = [
	"Notas",
	"Dedicatorias",
	"Fotos",
	"Videos",
	"Citas",
	"Deseos",
	"Diversión",
	"Canciones",
	"Frases",
	"Cápsulas",
	"Retos",
	"Diario",
	"Consejero"
];
async function searchAll(q) {
	const like = `%${q}%`;
	const [notes, deds, photos, videos, events, wishes, fun, songs, quotes, capsules, challenges, milestones, advisorThreads] = await Promise.all([
		supabase.from("notes").select("id, title, category").ilike("title", like).limit(6),
		supabase.from("dedications").select("id, title, kind").ilike("title", like).limit(6),
		supabase.from("photos").select("id, caption").ilike("caption", like).limit(6),
		supabase.from("videos_diarios").select("id, titulo").ilike("titulo", like).limit(6),
		supabase.from("events").select("id, title, date").ilike("title", like).limit(6),
		supabase.from("wishes").select("id, title").ilike("title", like).limit(6),
		supabase.from("fun_items").select("id, content, category").ilike("content", like).limit(6),
		supabase.from("songs").select("id, title, artist").ilike("title", like).limit(6),
		supabase.from("quotes").select("id, content, author").ilike("content", like).limit(6),
		supabase.from("time_capsules").select("id, title, open_at").ilike("title", like).limit(6),
		supabase.from("challenges").select("id, title, description").ilike("title", like).limit(6),
		supabase.from("milestones").select("id, title, date").ilike("title", like).limit(6),
		supabase.from("advisor_threads").select("id, title, is_shared").ilike("title", like).limit(6)
	]);
	const out = [];
	for (const n of notes.data ?? []) out.push({
		kind: "Notas",
		label: "Nota",
		icon: NotebookPen,
		id: n.id,
		title: n.title,
		to: `/notas/${n.id}`
	});
	for (const d of deds.data ?? []) out.push({
		kind: "Dedicatorias",
		label: "Dedicatoria",
		icon: Mail,
		id: d.id,
		title: d.title,
		to: `/dedicatorias#ded-${d.id}`
	});
	for (const p of photos.data ?? []) out.push({
		kind: "Fotos",
		label: "Foto",
		icon: Images,
		id: p.id,
		title: p.caption ?? "Foto",
		to: `/galeria?foto=${p.id}`
	});
	for (const v of videos.data ?? []) out.push({
		kind: "Videos",
		label: "Video",
		icon: Video,
		id: v.id,
		title: v.titulo,
		to: `/videos#video-${v.id}`
	});
	for (const e of events.data ?? []) out.push({
		kind: "Citas",
		label: "Cita",
		icon: CalendarHeart,
		id: e.id,
		title: e.title,
		sub: (/* @__PURE__ */ new Date(`${e.date}T00:00:00`)).toLocaleDateString("es", {
			day: "numeric",
			month: "long"
		}),
		to: `/calendario#${e.id}`
	});
	for (const w of wishes.data ?? []) out.push({
		kind: "Deseos",
		label: "Deseo",
		icon: Sparkles,
		id: w.id,
		title: w.title,
		to: `/deseos#${w.id}`
	});
	for (const f of fun.data ?? []) out.push({
		kind: "Diversión",
		label: "Diversión",
		icon: Laugh,
		id: f.id,
		title: f.content.slice(0, 60),
		to: `/diversion#fun-${f.id}`
	});
	for (const s of songs.data ?? []) out.push({
		kind: "Canciones",
		label: "Canción",
		icon: Music,
		id: s.id,
		title: s.title,
		sub: s.artist,
		to: `/canciones#${s.id}`
	});
	for (const q of quotes.data ?? []) out.push({
		kind: "Frases",
		label: "Frase",
		icon: Quote,
		id: q.id,
		title: q.content.slice(0, 70),
		sub: q.author,
		to: `/canciones#quote-${q.id}`
	});
	for (const cap of capsules.data ?? []) out.push({
		kind: "Cápsulas",
		label: "Cápsula",
		icon: Hourglass,
		id: cap.id,
		title: cap.title,
		sub: new Date(cap.open_at).toLocaleDateString("es", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}),
		to: `/capsulas#${cap.id}`
	});
	for (const challenge of challenges.data ?? []) out.push({
		kind: "Retos",
		label: "Reto",
		icon: Flame,
		id: challenge.id,
		title: challenge.title,
		sub: challenge.description,
		to: `/retos#${challenge.id}`
	});
	for (const milestone of milestones.data ?? []) out.push({
		kind: "Diario",
		label: "Momento",
		icon: Heart,
		id: milestone.id,
		title: milestone.title,
		sub: (/* @__PURE__ */ new Date(`${milestone.date}T00:00:00`)).toLocaleDateString("es", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}),
		to: `/diario#${milestone.id}`
	});
	for (const thread of advisorThreads.data ?? []) out.push({
		kind: "Consejero",
		label: thread.is_shared ? "Charla compartida" : "Charla privada",
		icon: MessageCircleHeart,
		id: thread.id,
		title: thread.title,
		to: `/consejero/${thread.id}`
	});
	return out;
}
async function loadFavorites() {
	const [notes, photos, deds] = await Promise.all([
		supabase.from("notes").select("id, title").eq("is_favorite", true).limit(10),
		supabase.from("photos").select("id, caption").eq("is_favorite", true).limit(10),
		supabase.from("dedications").select("id, title").eq("is_favorite", true).limit(10)
	]);
	const out = [];
	for (const n of notes.data ?? []) out.push({
		kind: "Notas",
		label: "Nota",
		icon: NotebookPen,
		id: n.id,
		title: n.title,
		to: `/notas/${n.id}`
	});
	for (const d of deds.data ?? []) out.push({
		kind: "Dedicatorias",
		label: "Dedicatoria",
		icon: Mail,
		id: d.id,
		title: d.title,
		to: `/dedicatorias#ded-${d.id}`
	});
	for (const p of photos.data ?? []) out.push({
		kind: "Fotos",
		label: "Foto",
		icon: Images,
		id: p.id,
		title: p.caption ?? "Foto",
		to: `/galeria?foto=${p.id}`
	});
	return out;
}
function GlobalSearch() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [debouncedQ, setDebouncedQ] = (0, import_react.useState)("");
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen(true);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) {
			setDebouncedQ("");
			return;
		}
		const id = window.setTimeout(() => setDebouncedQ(q.trim()), 220);
		return () => window.clearTimeout(id);
	}, [open, q]);
	const { data: results, isFetching } = useQuery({
		queryKey: ["buscar", debouncedQ],
		enabled: open,
		queryFn: () => debouncedQ ? searchAll(debouncedQ) : loadFavorites()
	});
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const r of results ?? []) map.set(r.kind, [...map.get(r.kind) ?? [], r]);
		return KIND_ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)]);
	}, [results]);
	function go(r) {
		setOpen(false);
		setQ("");
		navigate({ href: r.to });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: "rounded-full transition-transform hover:scale-110",
		"aria-label": "Buscar en todo",
		onClick: () => setOpen(true),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "top-4 max-w-lg translate-y-0 p-0 sm:top-[15%]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "Buscar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border/60 px-4 py-3",
					children: [
						isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Busca en todo su espacio…",
							className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						}),
						q && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setQ(""),
							"aria-label": "Limpiar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-80 overflow-y-auto p-2",
					children: [
						!q.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-primary text-primary" }), " Sus favoritos"]
						}),
						grouped.length === 0 && !isFetching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-8 text-center text-sm text-muted-foreground",
							children: q.trim() ? `Nada encontrado para “${q}”.` : "Aún no hay favoritos."
						}),
						grouped.map(([kind, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1",
							children: [q.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: kind
							}), items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => go(r),
								className: cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "size-4 shrink-0 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium",
											children: r.title
										}), r.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: r.sub
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: r.label
									})
								]
							}, `${r.kind}-${r.id}`))]
						}, kind))
					]
				})
			]
		})
	})] });
}
var Popover = Root2$1;
var PopoverTrigger = Trigger$1;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-popover-content-available-height)] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2$1.displayName;
var NAV = [
	{
		to: "/panel",
		label: "Panel",
		icon: Sparkles
	},
	{
		to: "/consejero",
		label: "Consejero",
		icon: MessageCircleHeart
	},
	{
		to: "/notas",
		label: "Notas",
		icon: NotebookPen
	},
	{
		to: "/galeria",
		label: "Galería",
		icon: Images
	},
	{
		to: "/conexion",
		label: "Conexión",
		icon: Handshake
	},
	{
		to: "/videos",
		label: "Videos",
		icon: Video
	},
	{
		to: "/calendario",
		label: "Citas",
		icon: CalendarHeart
	},
	{
		to: "/cerca",
		label: "Ahora",
		icon: MapPin
	},
	{
		to: "/deseos",
		label: "Deseos",
		icon: Sparkles
	},
	{
		to: "/dedicatorias",
		label: "Dedicatorias",
		icon: Gift
	},
	{
		to: "/diario",
		label: "Diario",
		icon: Heart
	},
	{
		to: "/diversion",
		label: "Diversión",
		icon: Laugh
	},
	{
		to: "/capsulas",
		label: "Cápsulas",
		icon: Hourglass
	},
	{
		to: "/retos",
		label: "Retos",
		icon: Flame
	},
	{
		to: "/canciones",
		label: "Canciones",
		icon: Music
	},
	{
		to: "/libro",
		label: "Libro",
		icon: BookOpen
	}
];
/** En el celular: 4 accesos fijos y el resto dentro de "Más". */
var MOBILE_PRIMARY = [
	"/panel",
	"/consejero",
	"/notas",
	"/galeria"
];
/** En escritorio mantenemos visibles las secciones más usadas y agrupamos el resto. */
var DESKTOP_PRIMARY = [
	"/panel",
	"/consejero",
	"/notas",
	"/galeria",
	"/calendario"
];
function isRouteActive(pathname, to) {
	return pathname === to || pathname.startsWith(`${to}/`);
}
function PushBanner({ userId }) {
	const [show, setShow] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!pushSupported() || Notification.permission !== "default") return;
		if (window.localStorage.getItem("push-banner-dismissed")) return;
		setShow(true);
	}, []);
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-primary/30 bg-primary/10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "size-4 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex-1",
					children: "Activa los avisos para enterarte al instante de lo que haga tu pareja."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "h-7 rounded-full px-3 text-xs",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						const ok = await enablePush(userId).catch(() => false);
						setBusy(false);
						setShow(false);
						if (ok) toast.success("Listo: te avisaremos en este dispositivo");
						else toast.error("No se dio permiso para los avisos");
					},
					children: "Activar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "text-muted-foreground hover:text-foreground",
					"aria-label": "Cerrar",
					onClick: () => {
						window.localStorage.setItem("push-banner-dismissed", "1");
						setShow(false);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		})
	});
}
/** Navega a la ruta interna de un aviso (con su ancla si la tiene). */
function goToLink(navigate, link) {
	const url = new URL(link, window.location.origin);
	if (url.origin !== window.location.origin) return;
	navigate({ href: `${url.pathname}${url.search}${url.hash}` });
}
function NotificationBell({ userId }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const { data = [] } = useQuery({
		queryKey: ["notifications", userId],
		queryFn: async () => {
			const { data, error } = await supabase.from("notifications").select("id, title, message, link, is_read, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
			if (error) throw error;
			return data ?? [];
		}
	});
	async function openNotification(n) {
		if (!n.is_read) {
			await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
			qc.invalidateQueries({ queryKey: ["notifications", userId] });
		}
		setOpen(false);
		if (n.link) goToLink(navigate, n.link);
	}
	(0, import_react.useEffect)(() => {
		const channel = supabase.channel("notifications-feed").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "notifications"
		}, () => qc.invalidateQueries({ queryKey: ["notifications", userId] })).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [qc, userId]);
	const unread = data.filter((n) => !n.is_read).length;
	async function markAll() {
		await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
		qc.invalidateQueries({ queryKey: ["notifications", userId] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "icon",
				className: "relative rounded-full transition-transform hover:scale-110",
				"aria-label": "Notificaciones",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]",
					children: unread
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			align: "end",
			className: "w-[min(20rem,calc(100vw-1rem))] p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-semibold",
					children: "Notificaciones"
				}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: markAll,
					className: "text-xs text-primary underline-offset-2 hover:underline",
					children: "Marcar todas"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "max-h-80",
				children: data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-center text-sm text-muted-foreground",
					children: "Todo tranquilo por aquí."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y",
					children: data.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openNotification(n),
						className: cn("block w-full px-4 py-3 text-left transition-colors hover:bg-accent/60", !n.is_read && "bg-accent/40"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: n.title
							}),
							n.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: n.message
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: [new Date(n.created_at).toLocaleString("es", {
									day: "numeric",
									month: "short",
									hour: "2-digit",
									minute: "2-digit"
								}), n.link && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: " · Ver"
								})]
							})
						]
					}) }, n.id))
				})
			})]
		})]
	});
}
function AppShell({ children }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: profile } = useMyProfile(user?.id);
	const { data: avatar } = useSignedUrl(profile?.avatar_url);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const hash = useRouterState({ select: (s) => s.location.hash });
	(0, import_react.useEffect)(() => {
		if (!user || !pushSupported() || Notification.permission !== "granted") return;
		enablePush(user.id).catch(() => {});
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!hash) return;
		const targetId = hash.startsWith("#") ? hash.slice(1) : hash;
		let timer = 0;
		let attempts = 0;
		const scrollWhenReady = () => {
			const target = document.getElementById(targetId);
			if (target) {
				target.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
				return;
			}
			attempts += 1;
			if (attempts < 6) timer = window.setTimeout(scrollWhenReady, 220);
		};
		timer = window.setTimeout(scrollWhenReady, 80);
		return () => window.clearTimeout(timer);
	}, [hash, pathname]);
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	const desktopPrimary = NAV.filter((item) => DESKTOP_PRIMARY.includes(item.to));
	const desktopSecondary = NAV.filter((item) => !DESKTOP_PRIMARY.includes(item.to));
	const desktopMoreActive = desktopSecondary.some((item) => isRouteActive(pathname, item.to)) || pathname === "/ajustes";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/panel",
							className: "flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 fill-primary text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden font-display text-base font-semibold tracking-tight min-[390px]:inline lg:text-lg",
								children: "Nuestro Espacio"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "ml-2 hidden min-w-0 items-center gap-1 lg:flex xl:ml-4",
							children: [desktopPrimary.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: cn("rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground xl:px-3", isRouteActive(pathname, item.to) && "bg-accent text-accent-foreground"),
								children: item.label
							}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: cn("rounded-full px-2.5 text-muted-foreground xl:px-3", desktopMoreActive && "bg-accent text-accent-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" }), "Más"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "start",
								className: "w-52",
								children: [
									desktopSecondary.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: item.to,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "mr-2 size-4" }), item.label]
										})
									}, item.to)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/ajustes",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 size-4" }), "Ajustes"]
										})
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1",
							children: [
								mounted && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalSearch, {}),
								mounted && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, { userId: user.id }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "ml-1 rounded-full ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "size-9 border border-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
												src: avatar ?? void 0,
												alt: profile?.name ?? "Perfil"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "bg-secondary text-xs",
												children: (profile?.name ?? "?").slice(0, 2).toUpperCase()
											})]
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-56",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
											className: "font-normal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium",
												children: profile?.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: profile?.email
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/ajustes",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 size-4" }), " Ajustes"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: signOut,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 size-4" }), " Cerrar sesión"]
										})
									]
								})] })
							]
						})
					]
				})
			}),
			mounted && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PushBanner, { userId: user.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto min-w-0 max-w-6xl px-3 pb-28 pt-5 sm:px-4 sm:pt-8 lg:pb-16",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNav, { pathname })
		]
	});
}
function MobileNav({ pathname }) {
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const primary = NAV.filter((n) => MOBILE_PRIMARY.includes(n.to));
	const secondary = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.to));
	const moreActive = secondary.some((n) => isRouteActive(pathname, n.to)) || pathname === "/ajustes";
	const itemClass = (active) => cn("flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground transition-colors", active && "text-primary");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mx-auto flex max-w-md items-stretch px-2 py-1",
			children: [primary.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "flex min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: itemClass(isRouteActive(pathname, item.to)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", isRouteActive(pathname, item.to) && "bg-primary/15"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: item.label
					})]
				})
			}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "flex min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
					open: moreOpen,
					onOpenChange: setMoreOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: itemClass(moreActive),
							"aria-label": "Más secciones",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", moreActive && "bg-primary/15"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-5" })
							}), "Más"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						align: "end",
						side: "top",
						sideOffset: 10,
						className: "w-64 p-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-1",
							children: [...secondary, {
								to: "/ajustes",
								label: "Ajustes",
								icon: Settings
							}].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								onClick: () => setMoreOpen(false),
								className: cn("flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground", isRouteActive(pathname, item.to) && "bg-accent text-primary"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }), item.label]
							}, item.to))
						})
					})]
				})
			})]
		})
	});
}
function AuthGate() {
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("checking");
	(0, import_react.useEffect)(() => {
		let active = true;
		supabase.auth.getUser().then(({ data, error }) => {
			if (!active) return;
			if (error || !data.user) {
				navigate({
					to: "/auth",
					replace: true
				});
				return;
			}
			setStatus("ready");
		});
		return () => {
			active = false;
		};
	}, [navigate]);
	if (status !== "ready") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AuthGate as component };
