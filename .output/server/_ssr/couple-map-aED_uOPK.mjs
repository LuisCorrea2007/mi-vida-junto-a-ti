import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as MapContainer, i as Marker, n as Popup, o as useMap, r as Polyline, t as TileLayer } from "../_libs/react-leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/couple-map-aED_uOPK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
function personIcon(p) {
	const initials = p.name.slice(0, 2).toUpperCase();
	const ring = p.mine ? "var(--primary)" : "var(--gold)";
	const inner = p.avatarUrl ? `<img src="${p.avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9999px" />` : `<span style="font:600 13px Inter,sans-serif;color:var(--foreground)">${initials}</span>`;
	return import_leaflet_src.default.divIcon({
		className: "",
		iconSize: [48, 56],
		iconAnchor: [24, 52],
		popupAnchor: [0, -50],
		html: `
      <div style="position:relative;width:48px;height:56px">
        <div style="position:absolute;left:4px;top:0;width:40px;height:40px;border-radius:9999px;background:var(--card);display:flex;align-items:center;justify-content:center;border:3px solid ${ring};box-shadow:0 6px 18px rgba(0,0,0,.45);overflow:hidden">${inner}</div>
        <div style="position:absolute;left:19px;top:38px;width:10px;height:10px;background:${ring};transform:rotate(45deg);border-radius:2px"></div>
        <div style="position:absolute;left:16px;top:47px;width:16px;height:6px;border-radius:9999px;background:rgba(0,0,0,.45);filter:blur(2px)"></div>
      </div>`
	});
}
function FitPeople({ people }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (people.length === 0) return;
		if (people.length === 1) {
			map.setView([people[0].lat, people[0].lng], 13, { animate: true });
			return;
		}
		const bounds = import_leaflet_src.default.latLngBounds(people.map((p) => [p.lat, p.lng]));
		map.fitBounds(bounds, {
			padding: [56, 56],
			maxZoom: 15,
			animate: true
		});
	}, [map, people]);
	return null;
}
function CoupleMap({ people, route }) {
	const center = people[0] ? [people[0].lat, people[0].lng] : [-2.17, -79.92];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
		center,
		zoom: 12,
		scrollWheelZoom: false,
		className: "h-full w-full",
		attributionControl: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
				url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
				maxZoom: 19,
				className: "map-dark-tiles"
			}),
			people.length === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polyline, {
				positions: people.map((p) => [p.lat, p.lng]),
				pathOptions: {
					color: "oklch(0.685 0.105 38)",
					weight: 3,
					dashArray: "6 8",
					opacity: .9
				}
			}),
			route && route.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polyline, {
				positions: route,
				pathOptions: {
					color: "oklch(0.79 0.1 80)",
					weight: 5,
					opacity: .85,
					lineCap: "round"
				}
			}),
			people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				position: [p.lat, p.lng],
				icon: personIcon(p),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.mine ? "Tú" : p.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					p.updatedLabel
				] })
			}, p.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FitPeople, { people })
		]
	});
}
//#endregion
export { CoupleMap as default };
