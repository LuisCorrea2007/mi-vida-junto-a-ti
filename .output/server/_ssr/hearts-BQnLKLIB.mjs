import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hearts-BQnLKLIB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Lluvia de corazones que se puede lanzar desde cualquier parte de la app.
* Uso: const { hearts, burst } = useHearts(); ... {hearts}
*/
function useHearts() {
	const [items, setItems] = (0, import_react.useState)([]);
	return {
		burst: (0, import_react.useCallback)((count = 12) => {
			const base = Date.now();
			const next = Array.from({ length: count }, (_, i) => ({
				id: base + i,
				left: 5 + Math.random() * 90,
				delay: Math.random() * .6,
				scale: .7 + Math.random() * .9
			}));
			setItems((prev) => [...prev, ...next]);
			window.setTimeout(() => {
				setItems((prev) => prev.filter((h) => !next.some((n) => n.id === h.id)));
			}, 2600);
		}, []),
		hearts: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartsLayer, { items })
	};
}
function HeartsLayer({ items }) {
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-0 z-[60] overflow-hidden",
		"aria-hidden": true,
		children: items.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "heart-float absolute bottom-0 text-2xl",
			style: {
				left: `${h.left}%`,
				animationDelay: `${h.delay}s`,
				transform: `scale(${h.scale})`
			},
			children: "❤️"
		}, h.id))
	});
}
//#endregion
export { useHearts as t };
