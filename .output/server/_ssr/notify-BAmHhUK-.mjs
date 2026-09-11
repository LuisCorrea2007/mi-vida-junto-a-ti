import { t as supabase } from "./client-DLsAaqJR.mjs";
import { a as getServerFnById, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D6DsnQQB.mjs";
import { n as string, t as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notify-BAmHhUK-.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var PushInput = object({
	toUserId: string().uuid(),
	title: string().min(1).max(140),
	message: string().max(300).nullable().optional(),
	link: string().max(300).nullable().optional()
});
/** Envía un aviso al celular de la pareja (solo si comparten espacio). */
var sendPushToPartner = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => PushInput.parse(input)).handler(createSsrRpc("5e11e90996b8c8c6bf5350790e6b9a01cc734d7f70a86fca7c002d55b31f2740"));
async function notifyPartner(inputOrCurrentUserId, legacyInput) {
	let input;
	if (typeof inputOrCurrentUserId === "string") {
		if (!legacyInput) return;
		const { data: members, error: membersError } = await supabase.from("couple_members").select("couple_id, user_id");
		if (membersError) return;
		const mine = (members ?? []).find((member) => member.user_id === inputOrCurrentUserId);
		if (!mine) return;
		const partner = (members ?? []).find((member) => member.couple_id === mine.couple_id && member.user_id !== inputOrCurrentUserId);
		if (!partner) return;
		input = {
			...legacyInput,
			toUserId: partner.user_id
		};
	} else input = inputOrCurrentUserId;
	const message = input.message?.slice(0, 300) ?? null;
	const { error } = await supabase.from("notifications").insert({
		user_id: input.toUserId,
		type: input.type,
		title: input.title,
		message,
		link: input.link ?? null
	});
	if (error) throw error;
	try {
		await sendPushToPartner({ data: {
			toUserId: input.toUserId,
			title: input.title,
			message,
			link: input.link ?? null
		} });
	} catch {}
}
function base64ToUint8(base64) {
	const padding = "=".repeat((4 - base64.length % 4) % 4);
	const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
function pushSupported() {
	return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
async function pushRegistration() {
	return navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
}
/** Activa los avisos al celular en este dispositivo. */
async function enablePush(userId) {
	if (!pushSupported()) return false;
	if (await Notification.requestPermission() !== "granted") return false;
	const reg = await pushRegistration();
	const sub = await reg.pushManager.getSubscription() ?? await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: base64ToUint8("BG-qmhnWGkdb1ey9eYG42gruWWNGuAnFbB1cmWQMhUh8vI6HH07ajfJHliKz72LDETYR2Jb-Yuae1eQftSb12NY")
	});
	const token = JSON.stringify(sub.toJSON());
	const { data: existing } = await supabase.from("push_tokens").select("id").eq("user_id", userId).eq("token", token).maybeSingle();
	if (!existing) {
		const { error } = await supabase.from("push_tokens").insert({
			user_id: userId,
			token
		});
		if (error) throw error;
	}
	return true;
}
/** Desactiva los avisos al celular en este dispositivo. */
async function disablePush(userId) {
	if (!pushSupported()) return;
	const sub = await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription();
	if (sub) {
		await supabase.from("push_tokens").delete().eq("user_id", userId).eq("token", JSON.stringify(sub.toJSON()));
		await sub.unsubscribe();
	}
}
/** ¿Este dispositivo ya tiene los avisos activados? */
async function pushEnabled() {
	if (!pushSupported() || Notification.permission !== "granted") return false;
	return !!await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription();
}
//#endregion
export { pushSupported as a, pushEnabled as i, enablePush as n, notifyPartner as r, disablePush as t };
