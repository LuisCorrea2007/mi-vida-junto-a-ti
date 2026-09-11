import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-BhpwCH7y.mjs";
import { H as Images, S as NotebookPen, W as Heart, d as Sparkles, dt as CalendarHeart } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ba0UgqGR.js
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		icon: NotebookPen,
		title: "Notas que se responden",
		text: "Cartas, agradecimientos y recuerdos con hilos de conversación y reacciones."
	},
	{
		icon: Images,
		title: "Galería compartida",
		text: "Fotos organizadas en álbumes, con favoritas, etiquetas y visor a pantalla completa."
	},
	{
		icon: CalendarHeart,
		title: "Citas y aniversarios",
		text: "Propón planes, acepta invitaciones y no vuelvas a olvidar una fecha importante."
	},
	{
		icon: Sparkles,
		title: "Deseos y diario",
		text: "Lista de deseos con votos y una línea de tiempo con los hitos de la relación."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 font-display text-lg font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 fill-primary text-primary" }), " Nuestro Espacio"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Entrar"
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "warm-gradient relative overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl px-4 py-16 text-center sm:py-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "animate-fade-up text-xs font-medium uppercase tracking-[0.28em] text-primary",
							children: "privado · sin ruido · para dos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "animate-fade-up mt-5 font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl",
							children: ["Todo lo nuestro, en un", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient",
								children: " solo lugar"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "animate-fade-up mx-auto mt-6 max-w-xl text-base text-muted-foreground",
							children: "Un espacio íntimo donde guardar las notas que se escriben, las fotos que toman, las citas que planean y los hitos que quieren recordar siempre."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-fade-up mt-9 flex flex-wrap justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "w-full rounded-full px-6 shadow-[var(--shadow-lift)] min-[420px]:w-auto sm:px-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Crear nuestro espacio"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								className: "w-full rounded-full px-6 min-[420px]:w-auto sm:px-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Ya tenemos cuenta"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "animate-heartbeat mx-auto mt-14 size-8 fill-primary/20 text-primary" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-5xl px-4 py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-center font-display text-3xl font-semibold",
					children: "Lo que pueden hacer juntos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-5 sm:grid-cols-2",
					children: FEATURES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "surface p-6 transition-shadow hover:shadow-[var(--shadow-lift)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-6 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 font-display text-xl font-semibold",
								children: f.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: f.text
							})
						]
					}, f.title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t py-10 text-center text-sm text-muted-foreground",
				children: "Hecho con cariño para dos personas. Sus datos son solo suyos."
			})
		]
	});
}
//#endregion
export { Landing as component };
