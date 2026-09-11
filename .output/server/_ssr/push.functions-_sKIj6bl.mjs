import { r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D6DsnQQB.mjs";
import { n as string, t as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push.functions-_sKIj6bl.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var sendPushToPartner_createServerFn_handler = createServerRpc({
	id: "5e11e90996b8c8c6bf5350790e6b9a01cc734d7f70a86fca7c002d55b31f2740",
	name: "sendPushToPartner",
	filename: "src/lib/push.functions.ts"
}, (opts) => sendPushToPartner.__executeServer(opts));
var sendPushToPartner = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => PushInput.parse(input)).handler(sendPushToPartner_createServerFn_handler, async ({ data, context }) => {
	if (data.toUserId === context.userId) return { sent: 0 };
	const { data: allowed } = await context.supabase.rpc("same_space", { _user: data.toUserId });
	if (!allowed) throw new Error("No comparten espacio");
	const { sendPushTo } = await import("./push.server-BAHXJtDm.mjs");
	return sendPushTo(data.toUserId, {
		title: data.title,
		message: data.message,
		link: data.link
	});
});
//#endregion
export { sendPushToPartner_createServerFn_handler };
