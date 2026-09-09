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

    const { sendPushTo } = await import("@/lib/push.server");
    return sendPushTo(data.toUserId, { title: data.title, message: data.message, link: data.link });
  });
