import { t as supabase } from "./client-DLsAaqJR.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-profiles-BF23D9k9.js
var COLUMNS = "id, name, email, avatar_url, anniversary_date, location, latitude, longitude, location_updated_at, location_shares_until, location_accuracy";
function useProfiles() {
	return useQuery({
		queryKey: ["profiles"],
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select(COLUMNS).order("created_at");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useMyProfile(userId) {
	return useQuery({
		queryKey: ["profiles", userId],
		enabled: !!userId,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select(COLUMNS).eq("id", userId).maybeSingle();
			if (error) throw error;
			if (data) return data;
			const { data: auth } = await supabase.auth.getUser();
			const u = auth.user;
			if (!u || u.id !== userId) return null;
			const meta = u.user_metadata ?? {};
			const name = meta["name"] || meta["full_name"] || u.email?.split("@")[0] || "";
			const { data: created, error: insertError } = await supabase.from("profiles").upsert({
				id: u.id,
				email: u.email ?? null,
				name
			}, { onConflict: "id" }).select(COLUMNS).single();
			if (insertError) throw insertError;
			return created;
		}
	});
}
/** ¿La ubicación de este perfil sigue compartida? */
function isSharingLocation(p) {
	if (!p || p.latitude == null || p.longitude == null) return false;
	if (!p.location_shares_until) return true;
	return new Date(p.location_shares_until).getTime() > Date.now();
}
/** Fecha de aniversario compartida (la primera definida entre los perfiles). */
function anniversaryOf(profiles) {
	return profiles?.find((p) => !!p.anniversary_date)?.anniversary_date ?? null;
}
//#endregion
export { useProfiles as i, isSharingLocation as n, useMyProfile as r, anniversaryOf as t };
