import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DLsAaqJR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-DGYwFkQT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session ?? null);
			setUser(data.session?.user ?? null);
			setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession ?? null);
			setUser(newSession?.user ?? null);
			setLoading(false);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	async function signOut() {
		await supabase.auth.signOut();
	}
	return {
		session,
		user,
		loading,
		signOut
	};
}
//#endregion
export { useAuth as t };
