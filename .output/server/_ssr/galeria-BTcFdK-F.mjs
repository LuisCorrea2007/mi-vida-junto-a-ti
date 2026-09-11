import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/galeria-BTcFdK-F.js
var $$splitComponentImporter = () => import("./galeria-CCL_src6.mjs");
var Route = createFileRoute("/_authenticated/galeria")({
	validateSearch: (search) => typeof search["foto"] === "string" ? { foto: search["foto"] } : {},
	head: () => ({ meta: [
		{ title: "Galería — Nuestro Espacio" },
		{
			name: "description",
			content: "Fotos y recuerdos de la pareja organizados en álbumes."
		},
		{
			property: "og:title",
			content: "Galería — Nuestro Espacio"
		},
		{
			property: "og:description",
			content: "Álbumes y fotos compartidas."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
