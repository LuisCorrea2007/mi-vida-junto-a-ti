import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as createAsyncStoragePersister } from "../_libs/@tanstack/query-async-storage-persister+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$23 } from "./consejero._id-BMIHJAly.mjs";
import { t as Route$24 } from "./galeria-BTcFdK-F.mjs";
import { t as Route$25 } from "./notas._id-zTT7S7w7.mjs";
import { t as persistQueryClient } from "../_libs/@tanstack/query-persist-client-core+[...].mjs";
import { n as get, r as set, t as del } from "../_libs/idb-keyval.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DY87Ow9R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-BKN3oA6R.css";
function reportLovableError(error, context) {
	if (typeof window === "undefined") return;
	try {
		console.error("[lovable-error]", error, context ?? {});
	} catch {}
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Página no encontrada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Esta página no existe o fue movida."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Volver al inicio"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold tracking-tight text-foreground",
					children: "Esta página no cargó"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Algo salió mal. Puedes reintentar o volver al inicio."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Reintentar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Ir al inicio"
					})]
				})
			]
		})
	});
}
var Route$22 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#26141e"
			},
			{
				name: "color-scheme",
				content: "dark"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Nuestro Espacio"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{ title: "Nuestro Espacio — el rincón privado de los dos" },
			{
				name: "description",
				content: "Notas, fotos, citas y recuerdos de pareja en un espacio privado, cálido y solo para ustedes."
			},
			{
				property: "og:title",
				content: "Nuestro Espacio"
			},
			{
				property: "og:description",
				content: "Notas, fotos, citas y recuerdos de pareja en un espacio privado."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "preconnect",
				href: "https://js.puter.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png"
			},
			{
				rel: "manifest",
				href: "/manifest.json"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { src: "https://js.puter.com/v2/" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$22.useRouteContext();
	const router = useRouter();
	const [online, setOnline] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => sub.subscription.unsubscribe();
	}, [router, queryClient]);
	(0, import_react.useEffect)(() => {
		const persister = createAsyncStoragePersister({ storage: {
			getItem: (key) => get(key),
			setItem: (key, value) => set(key, value),
			removeItem: (key) => del(key)
		} });
		const [unsubscribe] = persistQueryClient({
			queryClient,
			persister,
			maxAge: 6048e5,
			buster: "v1"
		});
		return unsubscribe;
	}, [queryClient]);
	(0, import_react.useEffect)(() => {
		if (!("serviceWorker" in navigator)) return;
		navigator.serviceWorker.register("/app-sw.js", { scope: "/" }).catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		const update = () => setOnline(navigator.onLine);
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			!online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 top-0 z-[60] bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground",
				children: "Sin conexión — estás viendo lo último guardado"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-center",
				richColors: true
			})
		]
	});
}
var $$splitComponentImporter$18 = () => import("./routes-Ba0UgqGR.mjs");
var Route$21 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Nuestro Espacio — el rincón privado de los dos" },
		{
			name: "description",
			content: "Un lugar íntimo para guardar notas, fotos, citas y recuerdos de pareja. Privado, cálido y solo para ustedes dos."
		},
		{
			property: "og:title",
			content: "Nuestro Espacio — el rincón privado de los dos"
		},
		{
			property: "og:description",
			content: "Notas, fotos, citas y recuerdos de pareja en un espacio privado."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./route-BJRIci7s.mjs");
var Route$20 = createFileRoute("/_authenticated")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./auth-CxltR4J9.mjs");
var Route$19 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Entrar a Nuestro Espacio" },
		{
			name: "description",
			content: "Inicia sesión o crea la cuenta de su espacio privado de pareja."
		},
		{
			property: "og:title",
			content: "Entrar a Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Accede al espacio privado de la pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var Route$18 = createFileRoute("/citas")({ beforeLoad: () => {
	throw redirect({ to: "/calendario" });
} });
var Route$17 = createFileRoute("/fotos")({ beforeLoad: () => {
	throw redirect({ to: "/galeria" });
} });
var $$splitComponentImporter$15 = () => import("./ajustes-DhzN8mPd.mjs");
var Route$16 = createFileRoute("/_authenticated/ajustes")({
	head: () => ({ meta: [
		{ title: "Ajustes — Nuestro Espacio" },
		{
			name: "description",
			content: "Perfil, foto y fecha de aniversario de su espacio compartido."
		},
		{
			property: "og:title",
			content: "Ajustes — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Configuración del espacio de pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./calendario-D_dZ0ujH.mjs");
var Route$15 = createFileRoute("/_authenticated/calendario")({
	head: () => ({ meta: [
		{ title: "Citas — Nuestro Espacio" },
		{
			name: "description",
			content: "Calendario de citas, planes y aniversarios de la pareja."
		},
		{
			property: "og:title",
			content: "Citas — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Planes y fechas importantes de los dos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./canciones-C3KM7NhG.mjs");
var Route$14 = createFileRoute("/_authenticated/canciones")({
	head: () => ({ meta: [
		{ title: "Nuestras canciones — Nuestro Espacio" },
		{
			name: "description",
			content: "La playlist de los dos y las frases que nos encantan."
		},
		{
			property: "og:title",
			content: "Nuestras canciones — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Canciones y frases favoritas de la pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./capsulas-DmjpYICY.mjs");
var Route$13 = createFileRoute("/_authenticated/capsulas")({
	head: () => ({ meta: [
		{ title: "Cápsulas del tiempo — Nuestro Espacio" },
		{
			name: "description",
			content: "Cartas selladas que se abren en la fecha que ustedes elijan."
		},
		{
			property: "og:title",
			content: "Cápsulas del tiempo — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Mensajes guardados para el futuro de los dos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./cerca-85MKumCF.mjs");
var Route$12 = createFileRoute("/_authenticated/cerca")({
	head: () => ({ meta: [
		{ title: "Ahora — Nuestro Espacio" },
		{
			name: "description",
			content: "Un mapa con los dos, la distancia que los separa y un chat que se borra cada 24 horas."
		},
		{
			property: "og:title",
			content: "Ahora — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Mapa, distancia en vivo y chat efímero de la pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./conexion-C3ouP0y5.mjs");
var Route$11 = createFileRoute("/_authenticated/conexion")({
	head: () => ({ meta: [{ title: "Conexión — Nuestro Espacio" }, {
		name: "description",
		content: "Check-ins, acuerdos, preguntas profundas y planes para dos."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./dedicatorias-DuJ96fZz.mjs");
var Route$10 = createFileRoute("/_authenticated/dedicatorias")({
	head: () => ({ meta: [
		{ title: "Dedicatorias — Nuestro Espacio" },
		{
			name: "description",
			content: "Cartas, enlaces y archivos que se dedican el uno al otro, para siempre."
		},
		{
			property: "og:title",
			content: "Dedicatorias — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Lo que nos dedicamos, guardado para siempre."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./deseos-DLGQc8HH.mjs");
var Route$9 = createFileRoute("/_authenticated/deseos")({
	head: () => ({ meta: [
		{ title: "Deseos — Nuestro Espacio" },
		{
			name: "description",
			content: "Lista compartida de lugares, planes y antojos pendientes."
		},
		{
			property: "og:title",
			content: "Deseos — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Lista de deseos de la pareja con votos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./diario-BN-vWgRc.mjs");
var Route$8 = createFileRoute("/_authenticated/diario")({
	head: () => ({ meta: [
		{ title: "Diario — Nuestro Espacio" },
		{
			name: "description",
			content: "Línea de tiempo con los hitos importantes de la relación."
		},
		{
			property: "og:title",
			content: "Diario — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Los momentos que marcaron la relación."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./diversion-BYB4kU70.mjs");
var Route$7 = createFileRoute("/_authenticated/diversion")({
	head: () => ({ meta: [
		{ title: "Diversión — Nuestro Espacio" },
		{
			name: "description",
			content: "Chistes, adivinanzas, trivia y preguntas divertidas para la pareja."
		},
		{
			property: "og:title",
			content: "Diversión — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Momentos divertidos compartidos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./libro-QQ8j7O_G.mjs");
var Route$6 = createFileRoute("/_authenticated/libro")({
	head: () => ({ meta: [
		{ title: "Libro de recuerdos — Nuestro Espacio" },
		{
			name: "description",
			content: "El resumen de su historia, listo para imprimir o guardar en PDF."
		},
		{
			property: "og:title",
			content: "Libro de recuerdos — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Su historia en un libro imprimible."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./panel-DOhOxvEf.mjs");
var Route$5 = createFileRoute("/_authenticated/panel")({
	head: () => ({ meta: [
		{ title: "Panel — Nuestro Espacio" },
		{
			name: "description",
			content: "Resumen del día: tiempo juntos, próximas citas y últimos recuerdos."
		},
		{
			property: "og:title",
			content: "Panel — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Resumen diario de la pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
/** Qué ha hecho la otra persona últimamente (a partir de los avisos recibidos). */
var $$splitComponentImporter$3 = () => import("./retos-BMzty-1J.mjs");
var Route$4 = createFileRoute("/_authenticated/retos")({
	head: () => ({ meta: [
		{ title: "Retos de pareja — Nuestro Espacio" },
		{
			name: "description",
			content: "Pequeñas misiones románticas para cumplir cada día juntos."
		},
		{
			property: "og:title",
			content: "Retos de pareja — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Misiones diarias para consentirse."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./videos-kiDbw-oz.mjs");
var Route$3 = createFileRoute("/_authenticated/videos")({
	head: () => ({ meta: [{ title: "Videos Diarios — Nuestro Espacio" }, {
		name: "description",
		content: "Videos de lo que hacemos en el día."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
/**
* El Consejero ya no usa un gateway de IA del servidor ni requiere
* LOVABLE_API_KEY. La conversación se ejecuta en el navegador mediante
* Puter.js desde la pantalla /consejero/$id.
*
* Conservamos esta ruta para no romper imports del routeTree generado en
* instalaciones que todavía no lo hayan regenerado.
*/
var Route$2 = createFileRoute("/api/chat")({ server: { handlers: { POST: async () => new Response(JSON.stringify({ error: "El Consejero ahora usa Puter AI directamente desde el navegador." }), {
	status: 410,
	headers: { "Content-Type": "application/json" }
}) } } });
var $$splitComponentImporter$1 = () => import("./consejero.index-C9PKeimK.mjs");
var Route$1 = createFileRoute("/_authenticated/consejero/")({
	head: () => ({ meta: [
		{ title: "Consejero — Nuestro Espacio" },
		{
			name: "description",
			content: "Cuéntale lo que pasa entre ustedes y recibe consejos pensados para su relación, no frases genéricas."
		},
		{
			property: "og:title",
			content: "Consejero — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Un consejero de pareja que los conoce."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./notas.index-B7r2zB09.mjs");
var Route = createFileRoute("/_authenticated/notas/")({
	head: () => ({ meta: [
		{ title: "Notas — Nuestro Espacio" },
		{
			name: "description",
			content: "Cartas, agradecimientos y recuerdos escritos entre los dos."
		},
		{
			property: "og:title",
			content: "Notas — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Notas compartidas de la pareja."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$21.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$22
});
var AuthenticatedRouteRoute = Route$20.update({
	id: "/_authenticated",
	getParentRoute: () => Route$22
});
var AuthRoute = Route$19.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$22
});
var CitasRoute = Route$18.update({
	id: "/citas",
	path: "/citas",
	getParentRoute: () => Route$22
});
var FotosRoute = Route$17.update({
	id: "/fotos",
	path: "/fotos",
	getParentRoute: () => Route$22
});
var AuthenticatedAjustesRoute = Route$16.update({
	id: "/ajustes",
	path: "/ajustes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCalendarioRoute = Route$15.update({
	id: "/calendario",
	path: "/calendario",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCancionesRoute = Route$14.update({
	id: "/canciones",
	path: "/canciones",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCapsulasRoute = Route$13.update({
	id: "/capsulas",
	path: "/capsulas",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCercaRoute = Route$12.update({
	id: "/cerca",
	path: "/cerca",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedConexionRoute = Route$11.update({
	id: "/conexion",
	path: "/conexion",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDedicatoriasRoute = Route$10.update({
	id: "/dedicatorias",
	path: "/dedicatorias",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDeseosRoute = Route$9.update({
	id: "/deseos",
	path: "/deseos",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDiarioRoute = Route$8.update({
	id: "/diario",
	path: "/diario",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDiversionRoute = Route$7.update({
	id: "/diversion",
	path: "/diversion",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGaleriaRoute = Route$24.update({
	id: "/galeria",
	path: "/galeria",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedLibroRoute = Route$6.update({
	id: "/libro",
	path: "/libro",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPanelRoute = Route$5.update({
	id: "/panel",
	path: "/panel",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRetosRoute = Route$4.update({
	id: "/retos",
	path: "/retos",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedVideosRoute = Route$3.update({
	id: "/videos",
	path: "/videos",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiChatRoute = Route$2.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$22
});
var AuthenticatedConsejeroIndexRoute = Route$1.update({
	id: "/consejero/",
	path: "/consejero/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedConsejeroIdRoute = Route$23.update({
	id: "/consejero/$id",
	path: "/consejero/$id",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotasIndexRoute = Route.update({
	id: "/notas/",
	path: "/notas/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAjustesRoute,
	AuthenticatedCalendarioRoute,
	AuthenticatedCancionesRoute,
	AuthenticatedCapsulasRoute,
	AuthenticatedCercaRoute,
	AuthenticatedConexionRoute,
	AuthenticatedDedicatoriasRoute,
	AuthenticatedDeseosRoute,
	AuthenticatedDiarioRoute,
	AuthenticatedDiversionRoute,
	AuthenticatedGaleriaRoute,
	AuthenticatedLibroRoute,
	AuthenticatedPanelRoute,
	AuthenticatedRetosRoute,
	AuthenticatedVideosRoute,
	AuthenticatedConsejeroIdRoute,
	AuthenticatedNotasIdRoute: Route$25.update({
		id: "/notas/$id",
		path: "/notas/$id",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedConsejeroIndexRoute,
	AuthenticatedNotasIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	CitasRoute,
	FotosRoute,
	ApiChatRoute
};
var routeTree = Route$22._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: {
		staleTime: 3e4,
		retry: 1
	} } });
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
