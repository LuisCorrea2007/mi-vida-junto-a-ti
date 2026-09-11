import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-DGYwFkQT.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useProfiles, n as isSharingLocation } from "./use-profiles-BF23D9k9.mjs";
import { i as useSignedUrl } from "./media-DkFqNmQI.mjs";
import { r as notifyPartner } from "./notify-BAmHhUK-.mjs";
import { n as cn, t as Button } from "./button-BhpwCH7y.mjs";
import { t as Input } from "./input-uKI_ipPV.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-CvzBEeT_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Navigation, F as LocateFixed, G as HeartPulse, O as MapPin, P as LocateOff, m as Send, nt as Clock, s as Timer, ut as Car } from "../_libs/lucide-react.mjs";
import { t as Skeleton } from "./skeleton-kZZCypAp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cerca-85MKumCF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CoupleMap = (0, import_react.lazy)(() => import("./couple-map-aED_uOPK.mjs"));
var DAY_MS = 864e5;
var SHARE_OPTIONS = [
	{
		label: "1 hora",
		hours: 1
	},
	{
		label: "3 horas",
		hours: 3
	},
	{
		label: "8 horas",
		hours: 8
	},
	{
		label: "Hasta mañana",
		hours: 24
	},
	{
		label: "Siempre",
		hours: 0
	}
];
var QUICK_STATUS = [
	"Trabajando 💼",
	"Comiendo 🍽️",
	"En camino 🚗",
	"Descansando 🛋️",
	"Pensando en ti 💭",
	"Ya casi duermo 😴"
];
/** Distancia en km entre dos coordenadas. */
function distanceKm(aLat, aLng, bLat, bLng) {
	const r = 6371;
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(bLat - aLat);
	const dLng = toRad(bLng - aLng);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
	return 2 * r * Math.asin(Math.sqrt(h));
}
function distanceLabel(km) {
	if (km < 1) return `${Math.round(km * 1e3)} m`;
	return `${km.toLocaleString("es", { maximumFractionDigits: km < 100 ? 1 : 0 })} km`;
}
function distancePhrase(km) {
	if (km < .3) return "Están juntitos 💞";
	if (km < 5) return "A un salto de distancia";
	if (km < 50) return "En la misma ciudad, cerquita";
	if (km < 500) return "Lejos, pero no tanto";
	return "Lejos de ojos, cerca del corazón";
}
/** Distancia y tiempo por carretera (servicio público de rutas). */
function useDrivingRoute(a, b) {
	const key = a && b ? `${a.lat.toFixed(4)},${a.lng.toFixed(4)}-${b.lat.toFixed(4)},${b.lng.toFixed(4)}` : null;
	return useQuery({
		queryKey: ["driving-route", key],
		enabled: !!key,
		staleTime: 3e5,
		retry: false,
		queryFn: async () => {
			const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
			const res = await fetch(url);
			if (!res.ok) return null;
			const route = (await res.json()).routes?.[0];
			if (!route) return null;
			return {
				km: route.distance / 1e3,
				minutes: Math.max(1, Math.round(route.duration / 60)),
				line: route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
			};
		}
	});
}
function travelMinutesLabel(minutes) {
	if (minutes < 60) return `${minutes} min en auto`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h} h${m ? ` ${m} min` : ""} en auto`;
}
function uberLink(from, to) {
	return `https://m.uber.com/ul/?${new URLSearchParams({
		action: "setPickup",
		"pickup[latitude]": String(from.lat),
		"pickup[longitude]": String(from.lng),
		"pickup[nickname]": "Donde estoy",
		"dropoff[latitude]": String(to.lat),
		"dropoff[longitude]": String(to.lng),
		"dropoff[nickname]": to.name
	}).toString()}`;
}
function mapsLink(from, to) {
	return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
}
function timeAgo(iso) {
	if (!iso) return "sin ubicación";
	const mins = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
	if (mins < 1) return "hace un momento";
	if (mins < 60) return `hace ${mins} min`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `hace ${hours} h`;
	return `hace ${Math.round(hours / 24)} d`;
}
function untilLabel(iso) {
	if (!iso) return "sin límite";
	const d = new Date(iso);
	return `hasta ${d.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? "las" : d.toLocaleDateString("es", { weekday: "short" }) + " a las"} ${d.toLocaleTimeString("es", {
		hour: "2-digit",
		minute: "2-digit"
	})}`;
}
function remaining(expiresAt) {
	const ms = new Date(expiresAt).getTime() - Date.now();
	if (ms <= 0) return "se borra ya";
	const h = Math.floor(ms / 36e5);
	const m = Math.floor(ms % 36e5 / 6e4);
	return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
/** Lee la posición actual con alta precisión. */
function readPosition() {
	if (!("geolocation" in navigator)) throw new Error("Este dispositivo no comparte ubicación");
	return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
		enableHighAccuracy: true,
		timeout: 15e3,
		maximumAge: 3e4
	}));
}
/** Hook para seguimiento continuo de ubicación con watchPosition */
function useLiveLocationTracking(userId, isSharing) {
	const qc = useQueryClient();
	const watchIdRef = (0, import_react.useRef)(null);
	const lastUpdateRef = (0, import_react.useRef)(0);
	const lastPositionRef = (0, import_react.useRef)(null);
	const MIN_DISTANCE_METERS = 20;
	const MIN_TIME_MS = 1e4;
	(0, import_react.useEffect)(() => {
		if (!isSharing || !userId) {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
			return;
		}
		if ("geolocation" in navigator) watchIdRef.current = navigator.geolocation.watchPosition((position) => {
			const now = Date.now();
			const { latitude, longitude, accuracy } = position.coords;
			if (now - lastUpdateRef.current < MIN_TIME_MS) return;
			if (lastPositionRef.current) {
				if (distanceKm(lastPositionRef.current.lat, lastPositionRef.current.lng, latitude, longitude) * 1e3 < MIN_DISTANCE_METERS) return;
			}
			lastUpdateRef.current = now;
			lastPositionRef.current = {
				lat: latitude,
				lng: longitude
			};
			supabase.from("profiles").update({
				latitude,
				longitude,
				location_accuracy: accuracy ?? null,
				location_updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", userId).then(({ error }) => {
				if (!error) qc.invalidateQueries({ queryKey: ["profiles"] });
			});
		}, (error) => {
			console.error("Error en seguimiento de ubicación:", error);
		}, {
			enableHighAccuracy: true,
			timeout: 2e4,
			maximumAge: 1e4
		});
		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};
	}, [
		isSharing,
		userId,
		qc
	]);
}
function PersonChip({ p, mine }) {
	const { data: avatar } = useSignedUrl(p?.avatar_url);
	const sharing = isSharingLocation(p);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-full border border-border/70 bg-background/50 py-1 pl-1 pr-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
			className: cn("size-8 border-2", mine ? "border-primary" : "border-gold"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
				src: avatar ?? void 0,
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
				className: "bg-secondary text-[10px]",
				children: (p?.name ?? "?").slice(0, 2).toUpperCase()
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-left leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium",
				children: mine ? "Tú" : p?.name ?? "Tu pareja"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] text-muted-foreground",
				children: sharing ? `${p?.location ? p.location + " · " : ""}${timeAgo(p?.location_updated_at ?? null)}` : "no comparte ubicación"
			})]
		})]
	});
}
function useMapPeople(me, partner) {
	const { data: myAvatar } = useSignedUrl(me?.avatar_url);
	const { data: partnerAvatar } = useSignedUrl(partner?.avatar_url);
	const people = [];
	if (me && isSharingLocation(me)) people.push({
		id: me.id,
		name: me.name ?? "Tú",
		lat: me.latitude,
		lng: me.longitude,
		avatarUrl: myAvatar ?? null,
		mine: true,
		updatedLabel: timeAgo(me.location_updated_at)
	});
	if (partner && isSharingLocation(partner)) people.push({
		id: partner.id,
		name: partner.name ?? "Tu pareja",
		lat: partner.latitude,
		lng: partner.longitude,
		avatarUrl: partnerAvatar ?? null,
		mine: false,
		updatedLabel: timeAgo(partner.location_updated_at)
	});
	return people;
}
function DistanceAndMap({ userId }) {
	const qc = useQueryClient();
	const { data: profiles, isLoading } = useProfiles();
	const me = profiles?.find((p) => p.id === userId);
	const partner = profiles?.find((p) => p.id !== userId);
	const [hours, setHours] = (0, import_react.useState)(3);
	const people = useMapPeople(me, partner);
	const sharing = isSharingLocation(me);
	useLiveLocationTracking(userId, sharing);
	const share = useMutation({
		mutationFn: async (opts) => {
			const pos = await readPosition();
			const until = opts.hours > 0 ? new Date(Date.now() + opts.hours * 36e5).toISOString() : null;
			const { error } = await supabase.from("profiles").update({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				location_accuracy: pos.coords.accuracy ?? null,
				location_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
				...opts.silent ? {} : { location_shares_until: until }
			}).eq("id", userId);
			if (error) throw error;
			return opts;
		},
		onSuccess: (opts) => {
			qc.invalidateQueries({ queryKey: ["profiles"] });
			if (!opts.silent) toast.success("Ubicación compartida");
		},
		onError: (_e, opts) => {
			if (!opts.silent) toast.error("No pudimos leer tu ubicación. Revisa el permiso del navegador.");
		}
	});
	const stop = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("profiles").update({
				latitude: null,
				longitude: null,
				location_shares_until: null
			}).eq("id", userId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Dejaste de compartir tu ubicación");
			qc.invalidateQueries({ queryKey: ["profiles"] });
		}
	});
	(0, import_react.useEffect)(() => {
		const channel = supabase.channel("profiles-live").on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "profiles"
		}, () => qc.invalidateQueries({ queryKey: ["profiles"] })).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [qc]);
	const both = people.length === 2;
	const mePerson = people.find((p) => p.mine);
	const otherPerson = people.find((p) => !p.mine);
	const km = both ? distanceKm(people[0].lat, people[0].lng, people[1].lat, people[1].lng) : null;
	const { data: driving } = useDrivingRoute(mePerson, otherPerson);
	const accuracy = me?.location_accuracy ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "warm-gradient p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.25em] text-primary",
						children: "Distancia entre los dos"
					}),
					isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mx-auto mt-4 h-12 w-40" }) : km !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-semibold sm:text-5xl",
							children: distanceLabel(km)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: distancePhrase(km)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [driving ? `${distanceLabel(driving.km)} por carretera · ${travelMinutesLabel(driving.minutes)}` : "En línea recta", accuracy && accuracy > 80 ? ` · aprox. ±${Math.round(accuracy)} m` : ""]
						}),
						mePerson && otherPerson && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center justify-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								className: "rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: uberLink(mePerson, otherPerson),
									target: "_blank",
									rel: "noopener noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "mr-1 size-4" }), " Pedir Uber para verla"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: mapsLink(mePerson, otherPerson),
									target: "_blank",
									rel: "noopener noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "mr-1 size-4" }), " Abrir en Maps"]
								})
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-2xl font-semibold",
						children: !partner ? "Vincula a tu pareja en Ajustes" : !sharing ? "Comparte tu ubicación para ver la distancia" : "Esperando la ubicación de tu pareja"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center justify-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonChip, {
							p: me,
							mine: true
						}), partner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonChip, {
							p: partner,
							mine: false
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-72 bg-muted sm:h-96",
				children: people.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full rounded-none" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoupleMap, {
						people,
						route: driving?.line ?? null
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex size-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6 text-primary" }), "El mapa aparecerá cuando alguno comparta su ubicación."]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 p-5",
				children: [sharing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative flex size-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-2.5 rounded-full bg-primary" })]
							}),
							"Compartiendo ",
							untilLabel(me?.location_shares_until ?? null)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "rounded-full",
							onClick: () => share.mutate({
								hours: 0,
								silent: false
							}),
							disabled: share.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "mr-1 size-4" }), " Actualizar"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "rounded-full",
							onClick: () => stop.mutate(),
							disabled: stop.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateOff, { className: "mr-1 size-4" }), " Dejar de compartir"]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }), " ¿Hasta cuándo quieres compartir tu ubicación?"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: SHARE_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setHours(o.hours),
							className: cn("rounded-full border px-3 py-1 text-xs transition-colors", hours === o.hours ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:bg-accent"),
							children: o.label
						}, o.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full rounded-full sm:w-auto",
						onClick: () => share.mutate({
							hours,
							silent: false
						}),
						disabled: share.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "mr-1 size-4" }), share.isPending ? "Buscando…" : "Compartir mi ubicación"]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Solo tu pareja ve dónde estás. Cuando pase la hora elegida, tu ubicación deja de mostrarse."
				})]
			})
		]
	});
}
function Heartbeat({ userId }) {
	const { data: profiles } = useProfiles();
	const me = profiles?.find((p) => p.id === userId);
	const other = profiles?.find((p) => p.id !== userId);
	const [sentAt, setSentAt] = (0, import_react.useState)(0);
	const beat = useMutation({
		mutationFn: async () => {
			if (!other) throw new Error("Primero vincula a tu pareja");
			await notifyPartner({
				toUserId: other.id,
				type: "latido",
				title: `${me?.name ?? "Tu pareja"} está pensando en ti 💗`,
				message: "Te mandó un latido desde Nuestro Espacio.",
				link: "/cerca"
			});
		},
		onSuccess: () => {
			setSentAt(Date.now());
			toast.success("Latido enviado 💗");
		},
		onError: (e) => toast.error(e.message)
	});
	const cooling = Date.now() - sentAt < 6e4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface flex flex-col items-stretch justify-between gap-4 p-5 sm:flex-row sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold",
			children: "Mándale un latido"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Un toque rápido para decir \"pienso en ti\", sin escribir nada."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "lg",
			className: "w-full shrink-0 rounded-full px-5 sm:w-auto",
			onClick: () => beat.mutate(),
			disabled: beat.isPending || cooling || !other,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: cn("mr-1 size-5", !cooling && "animate-heartbeat") }), cooling ? "Enviado" : "Latido"]
		})]
	});
}
function dayLabel(iso) {
	const d = new Date(iso);
	const today = /* @__PURE__ */ new Date();
	const yesterday = /* @__PURE__ */ new Date(Date.now() - DAY_MS);
	if (d.toDateString() === today.toDateString()) return "Hoy";
	if (d.toDateString() === yesterday.toDateString()) return "Ayer";
	return d.toLocaleDateString("es", {
		weekday: "long",
		day: "numeric",
		month: "long"
	});
}
function EphemeralChat({ userId }) {
	const qc = useQueryClient();
	const { data: profiles } = useProfiles();
	const me = profiles?.find((p) => p.id === userId);
	const partner = profiles?.find((p) => p.id !== userId);
	const { data: partnerAvatar } = useSignedUrl(partner?.avatar_url);
	const [text, setText] = (0, import_react.useState)("");
	const endRef = (0, import_react.useRef)(null);
	const [, tick] = (0, import_react.useState)(0);
	const nameOf = (uid) => profiles?.find((p) => p.id === uid)?.name ?? "Alguien";
	const { data: messages = [] } = useQuery({
		queryKey: ["chat"],
		queryFn: async () => {
			await supabase.from("chat_messages").delete().eq("user_id", userId).lt("expires_at", (/* @__PURE__ */ new Date()).toISOString());
			const { data, error } = await supabase.from("chat_messages").select("id, content, user_id, created_at, expires_at").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at").limit(300);
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: 6e4
	});
	(0, import_react.useEffect)(() => {
		const channel = supabase.channel("chat-24h").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "chat_messages"
		}, () => qc.invalidateQueries({ queryKey: ["chat"] })).subscribe();
		const id = window.setInterval(() => tick((n) => n + 1), 6e4);
		return () => {
			supabase.removeChannel(channel);
			window.clearInterval(id);
		};
	}, [qc]);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [messages.length]);
	const send = useMutation({
		mutationFn: async (raw) => {
			const content = raw.trim().slice(0, 500);
			if (!content) return;
			const { error } = await supabase.from("chat_messages").insert({
				user_id: userId,
				content,
				expires_at: new Date(Date.now() + DAY_MS).toISOString()
			});
			if (error) throw error;
			if (partner) await notifyPartner({
				toUserId: partner.id,
				type: "chat",
				title: `${me?.name ?? "Tu pareja"} dice…`,
				message: content.slice(0, 140),
				link: "/cerca#chat"
			});
		},
		onSuccess: () => {
			setText("");
			qc.invalidateQueries({ queryKey: ["chat"] });
		},
		onError: () => toast.error("No pudimos enviar el mensaje")
	});
	const lastPartner = [...messages].reverse().find((m) => m.user_id !== userId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "chat",
		className: "surface flex flex-col overflow-hidden p-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "size-9 border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
							src: partnerAvatar ?? void 0,
							alt: ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-secondary text-xs",
							children: (partner?.name ?? "?").slice(0, 2).toUpperCase()
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "¿Qué estás haciendo?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: lastPartner ? `${partner?.name ?? "Tu pareja"}: "${lastPartner.content.slice(0, 40)}${lastPartner.content.length > 40 ? "…" : ""}"` : "Cuéntense qué hacen en este momento"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-3" }), " 24 h"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex max-h-[55vh] min-h-72 flex-col gap-1.5 overflow-y-auto px-4 py-4",
				children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-auto text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-3xl",
						children: "💬"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Nada por ahora. Cuéntale qué haces en este momento."
					})]
				}) : messages.map((m, i) => {
					const mine = m.user_id === userId;
					const prev = messages[i - 1];
					const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
					const grouped = !!prev && prev.user_id === m.user_id && !newDay && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 3e5;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [newDay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "my-3 text-center text-[11px] uppercase tracking-widest text-muted-foreground",
						children: dayLabel(m.created_at)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", grouped && "mt-0"),
						children: [!mine && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: cn("size-7 border border-border", grouped && "invisible"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
								src: partnerAvatar ?? void 0,
								alt: ""
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "bg-secondary text-[10px]",
								children: nameOf(m.user_id).slice(0, 2).toUpperCase()
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("group max-w-[86%] break-words px-4 py-2 shadow-[var(--shadow-soft)] sm:max-w-[78%]", mine ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground" : "rounded-2xl rounded-bl-md bg-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap text-sm leading-relaxed",
								children: m.content
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground"),
								children: [new Date(m.created_at).toLocaleTimeString("es", {
									hour: "2-digit",
									minute: "2-digit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden group-hover:inline",
									children: [" · se borra en ", remaining(m.expires_at)]
								})]
							})]
						})]
					})] }, m.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]",
					children: QUICK_STATUS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => send.mutate(s),
						disabled: send.isPending,
						className: "shrink-0 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
						children: s
					}, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex items-center gap-2 rounded-full border border-border bg-background/60 p-1 pl-4 focus-within:border-primary",
					onSubmit: (e) => {
						e.preventDefault();
						send.mutate(text);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						maxLength: 500,
						placeholder: "Estoy…",
						onChange: (e) => setText(e.target.value),
						className: "h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "size-9 shrink-0 rounded-full",
						"aria-label": "Enviar",
						disabled: send.isPending || !text.trim(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})]
			})
		]
	});
}
function NowPage() {
	const { user } = useAuth();
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistanceAndMap, { userId: user.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heartbeat, { userId: user.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EphemeralChat, { userId: user.id })
		]
	});
}
//#endregion
export { NowPage as component };
