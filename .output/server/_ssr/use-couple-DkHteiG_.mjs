import { t as supabase } from "./client-DLsAaqJR.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-couple-DkHteiG_.js
/** Espacio compartido de la pareja: su id sirve como código de invitación. */
function useCouple(userId) {
	return useQuery({
		queryKey: ["couple", userId],
		enabled: !!userId,
		queryFn: async () => {
			const { data, error } = await supabase.from("couple_members").select("couple_id, user_id");
			if (error) throw error;
			const rows = data ?? [];
			const mine = rows.find((r) => r.user_id === userId);
			if (!mine) return {
				coupleId: null,
				partnerId: null
			};
			const partner = rows.find((r) => r.couple_id === mine.couple_id && r.user_id !== userId);
			return {
				coupleId: mine.couple_id,
				partnerId: partner?.user_id ?? null
			};
		}
	});
}
//#endregion
export { useCouple as t };
