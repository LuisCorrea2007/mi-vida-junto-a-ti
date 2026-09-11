import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-realtime-CbcWwiQW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Mantiene los datos actualizados en vivo: cuando algo cambia en las tablas
* indicadas (lo sube o lo edita cualquiera de los dos), se recargan los datos
* de la pantalla sin tener que refrescar la página.
*/
function useRealtime(...tables) {
	const queryClient = useQueryClient();
	const key = tables.slice().sort().join(",");
	const keyRef = (0, import_react.useRef)(key);
	keyRef.current = key;
	(0, import_react.useEffect)(() => {
		if (!key) return;
		const list = key.split(",");
		const channel = supabase.channel(`rt:${key}`);
		for (const table of list) channel.on("postgres_changes", {
			event: "*",
			schema: "public",
			table
		}, () => {
			queryClient.invalidateQueries();
		});
		channel.subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [key, queryClient]);
}
//#endregion
export { useRealtime as t };
