import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/push.server-BAHXJtDm.js
/** Envío de avisos al celular (solo en el servidor). */
async function sendPushTo(toUserId, payload) {
	const privateKey = processModule.env["VAPID_PRIVATE_KEY"];
	const publicKey = processModule.env["VAPID_PUBLIC_KEY"];
	if (!privateKey || !publicKey) return { sent: 0 };
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: tokens } = await supabaseAdmin.from("push_tokens").select("id, token").eq("user_id", toUserId);
	if (!tokens?.length) return { sent: 0 };
	const { buildPushPayload } = await import("../_libs/_3.mjs");
	const vapid = {
		subject: "mailto:hola@espacionuestro.app",
		publicKey,
		privateKey
	};
	const body = JSON.stringify({
		title: payload.title,
		body: payload.message ?? "",
		link: payload.link ?? "/panel"
	});
	let sent = 0;
	const stale = [];
	await Promise.all(tokens.map(async (t) => {
		try {
			const sub = JSON.parse(t.token);
			const built = await buildPushPayload({
				data: body,
				options: { ttl: 86400 }
			}, sub, vapid);
			const res = await fetch(sub.endpoint, built);
			if (res.status === 404 || res.status === 410) stale.push(t.id);
			else if (res.ok) sent++;
		} catch {
			stale.push(t.id);
		}
	}));
	if (stale.length) await supabaseAdmin.from("push_tokens").delete().in("id", stale);
	return { sent };
}
//#endregion
export { sendPushTo };
