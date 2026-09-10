import { supabase } from "@/integrations/supabase/client";
import { sendPushToPartner } from "@/lib/push.functions";

/** Llave pública para los avisos al celular (segura de mostrar). */
export const PUSH_PUBLIC_KEY =
  "BG-qmhnWGkdb1ey9eYG42gruWWNGuAnFbB1cmWQMhUh8vI6HH07ajfJHliKz72LDETYR2Jb-Yuae1eQftSb12NY";

export type NotifyInput = {
  toUserId: string;
  type: string;
  title: string;
  message?: string | null;
  /** Ruta dentro de la app a la que lleva el aviso, p. ej. /notas/abc */
  link?: string | null;
};

type LegacyNotifyInput = Omit<NotifyInput, "toUserId">;

/**
 * Crea el aviso en la campana y lo manda al celular de la pareja.
 *
 * También admite la firma antigua notifyPartner(currentUserId, input), usada
 * por la pantalla del Consejero. En esa variante resolvemos al otro miembro
 * del mismo espacio de pareja antes de crear el aviso.
 */
export async function notifyPartner(input: NotifyInput): Promise<void>;
export async function notifyPartner(currentUserId: string, input: LegacyNotifyInput): Promise<void>;
export async function notifyPartner(
  inputOrCurrentUserId: NotifyInput | string,
  legacyInput?: LegacyNotifyInput,
): Promise<void> {
  let input: NotifyInput;

  if (typeof inputOrCurrentUserId === "string") {
    if (!legacyInput) return;

    const { data: members, error: membersError } = await supabase
      .from("couple_members")
      .select("couple_id, user_id");

    if (membersError) return;

    const mine = (members ?? []).find((member) => member.user_id === inputOrCurrentUserId);
    if (!mine) return;

    const partner = (members ?? []).find(
      (member) => member.couple_id === mine.couple_id && member.user_id !== inputOrCurrentUserId,
    );
    if (!partner) return;

    input = { ...legacyInput, toUserId: partner.user_id };
  } else {
    input = inputOrCurrentUserId;
  }

  const message = input.message?.slice(0, 300) ?? null;
  const { error } = await supabase.from("notifications").insert({
    user_id: input.toUserId,
    type: input.type,
    title: input.title,
    message,
    link: input.link ?? null,
  });

  if (error) throw error;

  try {
    await sendPushToPartner({
      data: { toUserId: input.toUserId, title: input.title, message, link: input.link ?? null },
    });
  } catch {
    // El aviso en la campana ya quedó guardado; el envío al celular es opcional.
  }
}

function base64ToUint8(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function pushRegistration() {
  return navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
}

/** Activa los avisos al celular en este dispositivo. */
export async function enablePush(userId: string): Promise<boolean> {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const reg = await pushRegistration();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8(PUSH_PUBLIC_KEY),
    }));
  const token = JSON.stringify(sub.toJSON());
  const { data: existing } = await supabase
    .from("push_tokens")
    .select("id")
    .eq("user_id", userId)
    .eq("token", token)
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("push_tokens").insert({ user_id: userId, token });
    if (error) throw error;
  }
  return true;
}

/** Desactiva los avisos al celular en este dispositivo. */
export async function disablePush(userId: string) {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("token", JSON.stringify(sub.toJSON()));
    await sub.unsubscribe();
  }
}

/** ¿Este dispositivo ya tiene los avisos activados? */
export async function pushEnabled(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return !!(await reg?.pushManager.getSubscription());
}
