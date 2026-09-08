import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PushInput = z.object({
  toUserId: z.string().uuid(),
  title: z.string().min(1).max(140),
  message: z.string().max(300).nullable().optional(),
  link: z.string().max(300).nullable().optional(),
});

/** Envía un aviso al celular de la pareja (solo si comparten espacio). */
export const sendPushToPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PushInput.parse(input))
  .handler(async ({ data, context }) => {
    if (data.toUserId === context.userId) return { sent: 0 };
    const { data: allowed } = await context.supabase.rpc("same_space", { _user: data.toUserId });
    if (!allowed) throw new Error("No comparten espacio");

    const privateKey = process.env["VAPID_PRIVATE_KEY"];
    const publicKey = process.env["VAPID_PUBLIC_KEY"];
    if (!privateKey || !publicKey) return { sent: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tokens } = await supabaseAdmin
      .from("push_tokens")
      .select("id, token")
      .eq("user_id", data.toUserId);
    if (!tokens?.length) return { sent: 0 };

    const { buildPushPayload } = await import("@block65/webcrypto-web-push");
    const vapid = { subject: "mailto:hola@espacionuestro.app", publicKey, privateKey };
    const body = JSON.stringify({
      title: data.title,
      body: data.message ?? "",
      link: data.link ?? "/panel",
    });

    let sent = 0;
    const stale: string[] = [];
    await Promise.all(
      tokens.map(async (t) => {
        try {
          const sub = JSON.parse(t.token);
          const payload = await buildPushPayload({ data: body, options: { ttl: 86400 } }, sub, vapid);
          const res = await fetch(sub.endpoint, payload);
          if (res.status === 404 || res.status === 410) stale.push(t.id);
          else if (res.ok) sent++;
        } catch {
          stale.push(t.id);
        }
      }),
    );
    if (stale.length) await supabaseAdmin.from("push_tokens").delete().in("id", stale);
    return { sent };
  });
