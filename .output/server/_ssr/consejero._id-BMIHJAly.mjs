import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/consejero._id-BMIHJAly.js
var $$splitComponentImporter = () => import("./consejero._id-O-tc2WJQ.mjs");
var Route = createFileRoute("/_authenticated/consejero/$id")({
	validateSearch: (search) => typeof search["inicio"] === "string" ? { inicio: search["inicio"] } : {},
	head: () => ({ meta: [
		{ title: "Charla con el Consejero — Nuestro Espacio" },
		{
			name: "description",
			content: "Consejos de pareja pensados para ustedes, con acciones que se guardan en la app."
		},
		{
			property: "og:title",
			content: "Charla con el Consejero — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Su consejero de pareja, siempre a mano."
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
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
