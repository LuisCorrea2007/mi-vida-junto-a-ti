/** Envío de avisos al celular (solo en el servidor). */
export async function sendPushTo(
  toUserId: string,
  payload: { title: string; message?: string | null | undefined; link?: string | null | undefined },
): Promise<{ sent: number }> {
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const publicKey = process.env["VAPID_PUBLIC_KEY"];
  if (!privateKey || !publicKey) return { sent: 0 };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: tokens } = await supabaseAdmin
    .from("push_tokens")
    .select("id, token")
    .eq("user_id", toUserId);
  if (!tokens?.length) return { sent: 0 };

  const { buildPushPayload } = await import("@block65/webcrypto-web-push");
  const vapid = { subject: "mailto:hola@espacionuestro.app", publicKey, privateKey };
  const body = JSON.stringify({
    title: payload.title,
    body: payload.message ?? "",
    link: payload.link ?? "/panel",
  });

  let sent = 0;
  const stale: string[] = [];
  await Promise.all(
    tokens.map(async (t) => {
      try {
        const sub = JSON.parse(t.token);
        const built = await buildPushPayload({ data: body, options: { ttl: 86400 } }, sub, vapid);
        const res = await fetch(sub.endpoint, built);
        if (res.status === 404 || res.status === 410) stale.push(t.id);
        else if (res.ok) sent++;
      } catch {
        stale.push(t.id);
      }
    }),
  );
  if (stale.length) await supabaseAdmin.from("push_tokens").delete().in("id", stale);
  return { sent };
}
