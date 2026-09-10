import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import type { Database } from "@/integrations/supabase/types";

type Body = { messages?: unknown };

function serverSupabase(token: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function textFromMessages(messages: UIMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n"),
    }))
    .filter((message) => message.content.trim().length > 0);
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("Authorization")?.replace(/^Bearer /, "").trim();
        if (!token) return new Response("Sin sesión", { status: 401 });

        try {
          const { messages } = (await request.json()) as Body;
          if (!Array.isArray(messages)) return new Response("Faltan mensajes", { status: 400 });

          const supabase = serverSupabase(token);
          const { data: auth } = await supabase.auth.getUser(token);
          const me = auth.user;
          if (!me) return new Response("Sin sesión", { status: 401 });

          const [{ data: profiles }, { data: moods }, { data: events }, { data: capsules }] =
            await Promise.all([
              supabase
                .from("profiles")
                .select("id, name, location, anniversary_date")
                .order("created_at"),
              supabase
                .from("moods")
                .select("user_id, emoji, label, note, created_at")
                .order("created_at", { ascending: false })
                .limit(8),
              supabase
                .from("events")
                .select("title, date, time, location, category")
                .gte("date", new Date().toISOString().slice(0, 10))
                .order("date")
                .limit(6),
              supabase
                .from("time_capsules")
                .select("title, open_at")
                .is("opened_at", null)
                .order("open_at")
                .limit(4),
            ]);

          const myProfile = profiles?.find((profile) => profile.id === me.id);
          const partner = profiles?.find((profile) => profile.id !== me.id);
          const nameOf = (id: string) =>
            id === me.id ? (myProfile?.name ?? "yo") : (partner?.name ?? "mi pareja");

          const system = [
            "Eres el Consejero de una pareja en la app privada 'Nuestro Espacio'. Hablas siempre en español cercano y cálido, en segunda persona.",
            "Tu trabajo es escuchar, ayudar a entender emociones y dar consejos concretos y personalizados para ESTA pareja, nunca listas genéricas de autoayuda.",
            "Haz una pregunta a la vez cuando necesites entender mejor. No juzgues a ninguno de los dos ni tomes partido; ayuda a que se acerquen.",
            "No inventes recuerdos, conversaciones ni hechos que no estén en el contexto proporcionado.",
            "Puedes orientar sobre las funciones de la app, pero en esta primera versión no debes afirmar que guardaste, agendaste o notificaste algo si no tienes una confirmación explícita de la aplicación.",
            "Nunca des consejos médicos o legales; si detectas violencia o peligro, sugiere con cariño ayuda profesional.",
            `Hoy es ${new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`,
            `Quien te escribe: ${myProfile?.name ?? "sin nombre"}${myProfile?.location ? ` (${myProfile.location})` : ""}.`,
            partner
              ? `Su pareja: ${partner.name ?? "sin nombre"}${partner.location ? ` (${partner.location})` : ""}.`
              : "Todavía no hay pareja vinculada en la app.",
            profiles?.find((profile) => profile.anniversary_date)
              ? `Aniversario: ${profiles.find((profile) => profile.anniversary_date)!.anniversary_date}.`
              : "",
            moods?.length
              ? `Ánimos recientes: ${moods
                  .map(
                    (mood) =>
                      `${nameOf(mood.user_id)} ${mood.emoji} ${mood.label}${mood.note ? ` (${mood.note})` : ""}`,
                  )
                  .join("; ")}.`
              : "",
            events?.length
              ? `Próximos planes: ${events
                  .map((event) => `${event.title} el ${event.date}${event.time ? ` a las ${event.time}` : ""}`)
                  .join("; ")}.`
              : "No tienen planes próximos en el calendario.",
            capsules?.length
              ? `Cápsulas del tiempo pendientes: ${capsules
                  .map((capsule) => `${capsule.title} (abre ${capsule.open_at})`)
                  .join("; ")}.`
              : "",
          ]
            .filter(Boolean)
            .join("\n");

          const supabaseUrl = process.env["SUPABASE_URL"];
          if (!supabaseUrl) {
            return new Response("Falta la configuración de Supabase", { status: 500 });
          }

          // Lovable provisions LOVABLE_API_KEY for its Edge Functions. The
          // TanStack server preview can lack that secret, so the AI call is
          // deliberately delegated to the protected Supabase Edge Function.
          const edgeResponse = await fetch(`${supabaseUrl}/functions/v1/advisor-chat`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              system,
              messages: textFromMessages(messages as UIMessage[]),
            }),
            signal: request.signal,
          });

          const payload = (await edgeResponse.json().catch(() => null)) as
            | { text?: string; error?: string }
            | null;

          if (!edgeResponse.ok || !payload?.text) {
            const message = payload?.error ?? `El servicio del Consejero respondió ${edgeResponse.status}`;
            console.error("[Consejero] Edge Function error:", edgeResponse.status, message);
            return new Response(message, { status: edgeResponse.status || 502 });
          }

          const stream = createUIMessageStream<UIMessage>({
            originalMessages: messages as UIMessage[],
            execute: ({ writer }) => {
              const textId = `advisor-text-${Date.now()}`;
              writer.write({ type: "text-start", id: textId });
              writer.write({ type: "text-delta", id: textId, delta: payload.text! });
              writer.write({ type: "text-end", id: textId });
            },
          });

          return createUIMessageStreamResponse({ stream });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          console.error("[Consejero] /api/chat error:", error);
          return new Response(
            error instanceof Error ? `Error del Consejero: ${error.message}` : "Error inesperado",
            { status: 500 },
          );
        }
      },
    },
  },
});
