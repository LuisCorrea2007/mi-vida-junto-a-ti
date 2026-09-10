import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { ADVISOR_PROVIDER_OPTIONS, createAdvisorModel } from "@/lib/ai-gateway.server";

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

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
        if (!token) return new Response("Sin sesión", { status: 401 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Falta la clave de IA", { status: 500 });

        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("Faltan mensajes", { status: 400 });

        const supabase = serverSupabase(token);
        const { data: auth } = await supabase.auth.getUser(token);
        const me = auth.user;
        if (!me) return new Response("Sin sesión", { status: 401 });

        // Contexto real de la pareja para que los consejos no sean genéricos.
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

        const myProfile = profiles?.find((p) => p.id === me.id);
        const partner = profiles?.find((p) => p.id !== me.id);
        const partnerId = partner?.id ?? null;
        const nameOf = (id: string) =>
          id === me.id ? (myProfile?.name ?? "yo") : (partner?.name ?? "mi pareja");

        async function notifyPartner(title: string, message: string, link: string) {
          if (!partnerId) return "No hay pareja vinculada todavía.";
          await supabase.from("notifications").insert({
            user_id: partnerId,
            type: "consejero",
            title,
            message: message.slice(0, 300),
            link,
          });
          const { sendPushTo } = await import("@/lib/push.server");
          await sendPushTo(partnerId, { title, message: message.slice(0, 300), link }).catch(
            () => ({ sent: 0 }),
          );
          return "Aviso enviado al celular de tu pareja.";
        }

        const system = [
          "Eres el Consejero de una pareja en la app privada 'Nuestro Espacio'. Hablas siempre en español cercano y cálido, en segunda persona.",
          "Tu trabajo es escuchar, ayudar a entender emociones y dar consejos concretos y personalizados para ESTA pareja, nunca listas genéricas de autoayuda.",
          "Haz una pregunta a la vez cuando necesites entender mejor. No juzgues a ninguno de los dos ni tomes partido; ayuda a que se acerquen.",
          "Puedes crear cosas en la app con tus herramientas. Antes de usar una herramienta que guarda algo o manda un aviso, confirma en palabras lo que vas a hacer y espera el sí.",
          "Cuando termines una acción, dile en una línea qué creaste y en qué sección lo encuentra.",
          "Nunca des consejos médicos o legales; si detectas violencia o peligro, sugiere con cariño ayuda profesional.",
          `Hoy es ${new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`,
          `Quien te escribe: ${myProfile?.name ?? "sin nombre"}${myProfile?.location ? ` (${myProfile.location})` : ""}.`,
          partner
            ? `Su pareja: ${partner.name ?? "sin nombre"}${partner.location ? ` (${partner.location})` : ""}.`
            : "Todavía no hay pareja vinculada en la app.",
          profiles?.find((p) => p.anniversary_date)
            ? `Aniversario: ${profiles.find((p) => p.anniversary_date)!.anniversary_date}.`
            : "",
          moods?.length
            ? `Ánimos recientes: ${moods
                .map((m) => `${nameOf(m.user_id)} ${m.emoji} ${m.label}${m.note ? ` (${m.note})` : ""}`)
                .join("; ")}.`
            : "",
          events?.length
            ? `Próximos planes: ${events.map((e) => `${e.title} el ${e.date}${e.time ? ` a las ${e.time}` : ""}`).join("; ")}.`
            : "No tienen planes próximos en el calendario.",
          capsules?.length
            ? `Cápsulas del tiempo pendientes: ${capsules.map((c) => `${c.title} (abre ${c.open_at})`).join("; ")}.`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        const tools = {
          crear_nota: tool({
            description: "Guarda una nota o carta en la sección Notas y avisa a la pareja.",
            inputSchema: z.object({
              titulo: z.string(),
              contenido: z.string(),
              categoria: z.enum(["amor", "recuerdo", "plan", "gracias", "perdon", "otro"]),
            }),
            execute: async ({ titulo, contenido, categoria }) => {
              const { data, error } = await supabase
                .from("notes")
                .insert({
                  user_id: me.id,
                  title: titulo.slice(0, 140),
                  content: contenido.slice(0, 8000),
                  category: categoria,
                })
                .select("id")
                .single();
              if (error) return `No se pudo guardar: ${error.message}`;
              await notifyPartner("Tienes una nota nueva", titulo, `/notas/${data.id}`);
              return { ok: true, seccion: "Notas", link: `/notas/${data.id}` };
            },
          }),
          crear_dedicatoria: tool({
            description: "Guarda una dedicatoria o carta especial en la sección Dedicatorias.",
            inputSchema: z.object({ titulo: z.string(), contenido: z.string() }),
            execute: async ({ titulo, contenido }) => {
              const { error } = await supabase.from("dedications").insert({
                user_id: me.id,
                kind: "carta",
                title: titulo.slice(0, 140),
                content: contenido.slice(0, 8000),
              });
              if (error) return `No se pudo guardar: ${error.message}`;
              await notifyPartner("Nueva dedicatoria para ti", titulo, "/dedicatorias");
              return { ok: true, seccion: "Dedicatorias", link: "/dedicatorias" };
            },
          }),
          agendar_evento: tool({
            description: "Agrega una cita o recordatorio al calendario de la pareja.",
            inputSchema: z.object({
              titulo: z.string(),
              fecha: z.string().describe("Formato AAAA-MM-DD"),
              hora: z.string().nullable().describe("Formato HH:MM o null"),
              lugar: z.string().nullable(),
              descripcion: z.string().nullable(),
              categoria: z.enum(["cita", "aniversario", "cumpleanos", "viaje", "recordatorio", "otro"]),
            }),
            execute: async ({ titulo, fecha, hora, lugar, descripcion, categoria }) => {
              const { error } = await supabase.from("events").insert({
                user_id: me.id,
                title: titulo.slice(0, 140),
                date: fecha,
                time: hora,
                location: lugar,
                description: descripcion,
                category: categoria,
              });
              if (error) return `No se pudo agendar: ${error.message}`;
              await notifyPartner("Nuevo plan en el calendario", `${titulo} · ${fecha}`, "/calendario");
              return { ok: true, seccion: "Citas", link: "/calendario" };
            },
          }),
          crear_capsula: tool({
            description: "Guarda una cápsula del tiempo sellada hasta una fecha.",
            inputSchema: z.object({
              titulo: z.string(),
              contenido: z.string(),
              abrir_el: z.string().describe("Fecha y hora ISO en que se puede abrir"),
            }),
            execute: async ({ titulo, contenido, abrir_el }) => {
              const { error } = await supabase.from("time_capsules").insert({
                user_id: me.id,
                title: titulo.slice(0, 140),
                content: contenido.slice(0, 8000),
                open_at: abrir_el,
              });
              if (error) return `No se pudo sellar: ${error.message}`;
              await notifyPartner("Hay una cápsula esperando", titulo, "/capsulas");
              return { ok: true, seccion: "Cápsulas", link: "/capsulas" };
            },
          }),
          crear_reto: tool({
            description: "Crea un reto romántico para la pareja.",
            inputSchema: z.object({ titulo: z.string(), descripcion: z.string() }),
            execute: async ({ titulo, descripcion }) => {
              const { error } = await supabase.from("challenges").insert({
                user_id: me.id,
                title: titulo.slice(0, 140),
                description: descripcion.slice(0, 500),
              });
              if (error) return `No se pudo crear: ${error.message}`;
              await notifyPartner("Nuevo reto de pareja", titulo, "/retos");
              return { ok: true, seccion: "Retos", link: "/retos" };
            },
          }),
          agregar_cancion: tool({
            description: "Agrega una canción a la playlist de la pareja.",
            inputSchema: z.object({
              titulo: z.string(),
              artista: z.string().nullable(),
              enlace: z.string().nullable(),
              nota: z.string().nullable(),
            }),
            execute: async ({ titulo, artista, enlace, nota }) => {
              const { error } = await supabase.from("songs").insert({
                user_id: me.id,
                title: titulo.slice(0, 140),
                artist: artista,
                url: enlace,
                note: nota,
              });
              if (error) return `No se pudo agregar: ${error.message}`;
              await notifyPartner("Canción nueva en la playlist", titulo, "/canciones");
              return { ok: true, seccion: "Canciones", link: "/canciones" };
            },
          }),
          agregar_frase: tool({
            description: "Guarda una frase favorita de la pareja.",
            inputSchema: z.object({ frase: z.string(), autor: z.string().nullable() }),
            execute: async ({ frase, autor }) => {
              const { error } = await supabase.from("quotes").insert({
                user_id: me.id,
                content: frase.slice(0, 500),
                author: autor,
              });
              if (error) return `No se pudo guardar: ${error.message}`;
              return { ok: true, seccion: "Canciones y frases", link: "/canciones" };
            },
          }),
          registrar_animo: tool({
            description: "Registra cómo se siente ahora quien escribe.",
            inputSchema: z.object({
              emoji: z.string(),
              etiqueta: z.string(),
              nota: z.string().nullable(),
            }),
            execute: async ({ emoji, etiqueta, nota }) => {
              const { error } = await supabase.from("moods").insert({
                user_id: me.id,
                emoji,
                label: etiqueta.slice(0, 40),
                note: nota,
              });
              if (error) return `No se pudo guardar: ${error.message}`;
              await notifyPartner(`${emoji} ${etiqueta}`, nota ?? "Así se siente ahora", "/panel");
              return { ok: true, seccion: "Panel", link: "/panel" };
            },
          }),
          avisar_pareja: tool({
            description:
              "Manda un aviso al celular de la pareja con el mensaje que pida quien escribe.",
            inputSchema: z.object({ titulo: z.string(), mensaje: z.string() }),
            execute: async ({ titulo, mensaje }) => {
              const result = await notifyPartner(titulo.slice(0, 140), mensaje, "/consejero");
              return result;
            },
          }),
        };

        try {
          const result = streamText({
            model: createAdvisorModel(apiKey, request),
            system,
            messages: await convertToModelMessages(messages as UIMessage[]),
            tools,
            stopWhen: stepCountIs(50),
            providerOptions: ADVISOR_PROVIDER_OPTIONS as never,
            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            sendReasoning: true,
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          const message = error instanceof Error ? error.message : "Error inesperado";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
