import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatStatus, UIMessage } from "ai";
import { ArrowLeft, HeartHandshake, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyPartner } from "@/lib/notify";
import { threadTitleFrom } from "@/lib/advisor";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Search = { inicio?: string };

type PuterToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

type PuterMessage = {
  role: string;
  content?: unknown;
  tool_calls?: PuterToolCall[];
  tool_call_id?: string;
};

type PuterResponse =
  | string
  | {
      message?: PuterMessage;
      content?: unknown;
      toString?: () => string;
    };

type PuterApi = {
  auth: {
    isSignedIn: () => boolean;
    signIn: (options?: { attempt_temp_user_creation?: boolean }) => Promise<unknown>;
  };
  ai: {
    chat: (
      messages: string | PuterMessage[],
      testMode?: boolean,
      options?: Record<string, unknown>,
    ) => Promise<PuterResponse>;
  };
};

declare global {
  interface Window {
    puter?: PuterApi;
  }
}

export const Route = createFileRoute("/_authenticated/consejero/$id")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["inicio"] === "string" ? { inicio: search["inicio"] } : {},
  head: () => ({
    meta: [
      { title: "Charla con el Consejero — Nuestro Espacio" },
      {
        name: "description",
        content: "Consejos de pareja pensados para ustedes, con acciones que se guardan en la app.",
      },
      { property: "og:title", content: "Charla con el Consejero — Nuestro Espacio" },
      { property: "og:description", content: "Su consejero de pareja, siempre a mano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsejeroThread,
});

type Thread = { id: string; user_id: string; title: string; is_shared: boolean };
type Row = { id: string; role: string; parts: unknown; user_id: string; created_at: string };

const ADVISOR_TOOLS = [
  {
    type: "function",
    function: {
      name: "crear_nota",
      description:
        "Guarda una nota en la sección Notas. Úsala SOLO después de que el usuario haya confirmado explícitamente que quiere guardarla.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título corto de la nota" },
          content: { type: "string", description: "Contenido completo de la nota" },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_dedicatoria",
      description:
        "Guarda una dedicatoria de texto. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agendar_evento",
      description:
        "Agrega un plan al calendario. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          date: { type: "string", description: "Fecha YYYY-MM-DD" },
          time: { type: "string", description: "Hora HH:MM, opcional" },
          location: { type: "string", description: "Lugar, opcional" },
          description: { type: "string", description: "Descripción, opcional" },
        },
        required: ["title", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_capsula",
      description:
        "Crea una cápsula del tiempo. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          open_at: {
            type: "string",
            description: "Fecha de apertura en ISO 8601 o YYYY-MM-DD",
          },
        },
        required: ["title", "content", "open_at"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crear_reto",
      description:
        "Crea un reto para la pareja. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agregar_cancion",
      description:
        "Agrega una canción a Canciones. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          url: { type: "string" },
          note: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agregar_frase",
      description:
        "Guarda una frase especial. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string" },
          author: { type: "string" },
        },
        required: ["content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "registrar_animo",
      description:
        "Registra el ánimo del usuario. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          emoji: { type: "string" },
          label: { type: "string" },
          note: { type: "string" },
        },
        required: ["emoji", "label"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "avisar_pareja",
      description:
        "Envía un aviso a la pareja dentro de Nuestro Espacio. Úsala SOLO después de confirmación explícita del usuario.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          link: { type: "string", description: "Ruta interna de la app, opcional" },
        },
        required: ["title", "message"],
      },
    },
  },
] as const;

function rowsToMessages(rows: Row[]): UIMessage[] {
  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage["role"],
    parts: (Array.isArray(r.parts) ? r.parts : []) as UIMessage["parts"],
  }));
}

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function newTextMessage(role: "user" | "assistant", text: string): UIMessage {
  return {
    id: `advisor-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    parts: [{ type: "text", text }],
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  const text = asString(value);
  return text || null;
}

function hasExplicitActionConfirmation(history: UIMessage[], currentText: string) {
  const normalized = currentText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const affirmative =
    /^(si|dale|hazlo|hazla|guardalo|guardala|agendalo|agendala|crealo|creala|envialo|enviala|registralo|registrala|confirmo)(\b|[,.!])/i.test(
      normalized,
    ) || /^(si\s+por\s+favor|si\s+hazlo|si\s+guardalo|si\s+guardala)$/i.test(normalized);

  if (!affirmative) return false;

  const previousAssistant = [...history].reverse().find((message) => message.role === "assistant");
  if (!previousAssistant) return false;

  const previousText = messageText(previousAssistant)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /(quieres que|confirmas|confirmame|puedo (guard|agend|cre|envi|registr)|lo (guardo|agendo|creo|envio|registro)|la (guardo|agendo|creo|envio|registro))/i.test(
    previousText,
  );
}

function extractPuterText(response: PuterResponse): string {
  if (typeof response === "string") return response.trim();
  const content = response.message?.content ?? response.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("\n")
      .trim();
  }
  const rendered = response.toString?.();
  return rendered && rendered !== "[object Object]" ? rendered.trim() : "";
}

async function buildAdvisorSystem(userId: string) {
  const [{ data: profiles }, { data: moods }, { data: events }, { data: capsules }] =
    await Promise.all([
      supabase.from("profiles").select("id, name, location, anniversary_date").order("created_at"),
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

  const myProfile = profiles?.find((profile) => profile.id === userId);
  const partner = profiles?.find((profile) => profile.id !== userId);
  const nameOf = (id: string) =>
    id === userId ? (myProfile?.name ?? "yo") : (partner?.name ?? "mi pareja");
  const anniversary = profiles?.find((profile) => profile.anniversary_date)?.anniversary_date;

  return [
    "Eres el Consejero de una pareja dentro de la app privada 'Nuestro Espacio'. Hablas siempre en español cercano, respetuoso y cálido, en segunda persona.",
    "Tu trabajo es escuchar, ayudar a entender emociones y dar consejos concretos y personalizados para ESTA pareja. Evita respuestas genéricas.",
    "Haz una pregunta a la vez cuando necesites entender mejor. No juzgues ni tomes partido.",
    "No inventes recuerdos, conversaciones, fechas ni hechos que no aparezcan en el contexto o en los mensajes.",
    "REGLA DE ACCIONES: nunca llames una herramienta en el mismo turno en el que propones guardar, crear, agendar o avisar algo. Primero explica lo que harías y pide confirmación. Solo usa una herramienta cuando el último mensaje del usuario confirme explícitamente que quiere que lo hagas.",
    "Después de ejecutar una herramienta, explica brevemente qué se hizo y en qué sección de la app puede verlo.",
    "Nunca afirmes que una acción se completó si la herramienta devolvió un error.",
    "Nunca des consejos médicos o legales. Si detectas violencia o peligro, recomienda buscar ayuda profesional o de emergencia adecuada.",
    `Hoy es ${new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`,
    `Quien te escribe: ${myProfile?.name ?? "sin nombre"}${myProfile?.location ? ` (${myProfile.location})` : ""}.`,
    partner
      ? `Su pareja: ${partner.name ?? "sin nombre"}${partner.location ? ` (${partner.location})` : ""}.`
      : "Todavía no hay pareja vinculada en la app.",
    anniversary ? `Aniversario: ${anniversary}.` : "",
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
}

async function executeAdvisorTool(name: string, rawArgs: string, userId: string) {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    throw new Error(`La IA envió datos inválidos para ${name}.`);
  }

  if (name === "crear_nota") {
    const title = asString(args.title);
    const content = asString(args.content);
    if (!title || !content) throw new Error("La nota necesita título y contenido.");
    const { error } = await supabase.from("notes").insert({ user_id: userId, title, content });
    if (error) throw error;
    return "Nota guardada correctamente en Notas.";
  }

  if (name === "crear_dedicatoria") {
    const title = asString(args.title);
    const content = asString(args.content);
    if (!title || !content) throw new Error("La dedicatoria necesita título y contenido.");
    const { error } = await supabase
      .from("dedications")
      .insert({ user_id: userId, kind: "text", title, content });
    if (error) throw error;
    return "Dedicatoria guardada correctamente en Dedicatorias.";
  }

  if (name === "agendar_evento") {
    const title = asString(args.title);
    const date = asString(args.date);
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("El evento necesita un título y una fecha válida YYYY-MM-DD.");
    }
    const { error } = await supabase.from("events").insert({
      user_id: userId,
      title,
      date,
      time: optionalString(args.time),
      location: optionalString(args.location),
      description: optionalString(args.description),
      category: "cita",
    });
    if (error) throw error;
    return "Plan agregado correctamente al Calendario.";
  }

  if (name === "crear_capsula") {
    const title = asString(args.title);
    const content = asString(args.content);
    const rawOpenAt = asString(args.open_at);
    const parsed = rawOpenAt ? new Date(rawOpenAt) : null;
    if (!title || !content || !parsed || Number.isNaN(parsed.getTime())) {
      throw new Error("La cápsula necesita título, contenido y una fecha de apertura válida.");
    }
    const { error } = await supabase.from("time_capsules").insert({
      user_id: userId,
      title,
      content,
      open_at: parsed.toISOString(),
    });
    if (error) throw error;
    return "Cápsula creada correctamente en Cápsulas.";
  }

  if (name === "crear_reto") {
    const title = asString(args.title);
    if (!title) throw new Error("El reto necesita un título.");
    const { error } = await supabase.from("challenges").insert({
      user_id: userId,
      title,
      description: optionalString(args.description),
    });
    if (error) throw error;
    return "Reto creado correctamente en Retos.";
  }

  if (name === "agregar_cancion") {
    const title = asString(args.title);
    if (!title) throw new Error("La canción necesita un título.");
    const { error } = await supabase.from("songs").insert({
      user_id: userId,
      title,
      artist: optionalString(args.artist),
      url: optionalString(args.url),
      note: optionalString(args.note),
    });
    if (error) throw error;
    return "Canción agregada correctamente en Canciones.";
  }

  if (name === "agregar_frase") {
    const content = asString(args.content);
    if (!content) throw new Error("La frase no puede estar vacía.");
    const { error } = await supabase.from("quotes").insert({
      user_id: userId,
      content,
      author: optionalString(args.author),
    });
    if (error) throw error;
    return "Frase guardada correctamente.";
  }

  if (name === "registrar_animo") {
    const emoji = asString(args.emoji);
    const label = asString(args.label);
    if (!emoji || !label) throw new Error("El ánimo necesita emoji y descripción.");
    const { error } = await supabase.from("moods").insert({
      user_id: userId,
      emoji,
      label,
      note: optionalString(args.note),
    });
    if (error) throw error;
    return "Ánimo registrado correctamente.";
  }

  if (name === "avisar_pareja") {
    const title = asString(args.title);
    const message = asString(args.message);
    if (!title || !message) throw new Error("El aviso necesita título y mensaje.");
    await notifyPartner(userId, {
      type: "consejero",
      title,
      message,
      link: optionalString(args.link) ?? "/consejero",
    });
    return "Aviso enviado correctamente a tu pareja.";
  }

  throw new Error(`Acción desconocida: ${name}`);
}

function readablePuterError(error: unknown) {
  const candidate = error as { error?: string; msg?: string; message?: string } | null;
  if (candidate?.error === "popup_blocked") {
    return "El navegador bloqueó la autorización de la IA. Permite ventanas emergentes y vuelve a enviar el mensaje.";
  }
  if (candidate?.error === "auth_window_closed") {
    return "Se cerró la autorización de la IA. Vuelve a enviar el mensaje y acepta para continuar.";
  }
  return candidate?.msg || candidate?.message || "La IA gratuita no pudo responder. Intenta nuevamente.";
}

function ConsejeroThread() {
  const { id } = Route.useParams();
  const { inicio } = Route.useSearch();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: thread } = useQuery({
    queryKey: ["advisor-thread", id],
    queryFn: async (): Promise<Thread | null> => {
      const { data, error } = await supabase
        .from("advisor_threads")
        .select("id, user_id, title, is_shared")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["advisor-messages", id],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("advisor_messages")
        .select("id, role, parts, user_id, created_at")
        .eq("thread_id", id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function toggleShared() {
    if (!thread || !user) return;
    const next = !thread.is_shared;
    const { error } = await supabase
      .from("advisor_threads")
      .update({ is_shared: next })
      .eq("id", thread.id);
    if (error) return toast.error("No se pudo cambiar");
    qc.invalidateQueries({ queryKey: ["advisor-thread", id] });
    qc.invalidateQueries({ queryKey: ["advisor-threads"] });
    if (next) {
      toast.success("Ahora tu amor puede ver y escribir aquí");
      notifyPartner(user.id, {
        type: "consejero",
        title: "Te compartió una charla del Consejero",
        message: thread.title,
        link: `/consejero/${thread.id}`,
      }).catch(() => {});
    } else {
      toast.success("La charla volvió a ser privada");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Volver">
          <Link to="/consejero">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold">
            {thread?.title ?? "Charla"}
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {thread?.is_shared ? "Los dos ven esta charla" : "Solo tú ves esta charla"} · IA externa sin clave
          </p>
        </div>
        {thread?.user_id === user?.id && (
          <Button variant="outline" size="sm" className="w-full justify-center rounded-full sm:w-auto" onClick={toggleShared}>
            {thread?.is_shared ? (
              <>
                <Lock className="mr-1 size-3.5" /> Hacer privada
              </>
            ) : (
              <>
                <Users className="mr-1 size-3.5" /> Compartir con mi amor
              </>
            )}
          </Button>
        )}
      </div>

      {isLoading || !user ? (
        <div className="surface space-y-3 p-6">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <ChatWindow
          key={id}
          threadId={id}
          userId={user.id}
          initialMessages={rowsToMessages(rows ?? [])}
          isShared={!!thread?.is_shared}
          {...(inicio ? { autoSend: inicio } : {})}
        />
      )}
    </div>
  );
}

function ChatWindow({
  threadId,
  userId,
  initialMessages,
  isShared,
  autoSend,
}: {
  threadId: string;
  userId: string;
  initialMessages: UIMessage[];
  isShared: boolean;
  autoSend?: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [chatError, setChatError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const savedRef = useRef<Set<string>>(new Set(initialMessages.map((m) => m.id)));
  const autoSentRef = useRef(false);

  const busy = status === "submitted" || status === "streaming";

  // Guarda en la app lo que se vaya escribiendo, para volver a encontrarlo luego.
  useEffect(() => {
    if (busy) return;
    const pending = messages.filter((m) => !savedRef.current.has(m.id));
    if (pending.length === 0) return;
    for (const m of pending) savedRef.current.add(m.id);
    (async () => {
      const { error: insertError } = await supabase.from("advisor_messages").insert(
        pending.map((m) => ({
          thread_id: threadId,
          user_id: userId,
          role: m.role,
          parts: m.parts as never,
        })),
      );
      if (insertError) {
        for (const m of pending) savedRef.current.delete(m.id);
        return;
      }
      await supabase
        .from("advisor_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", threadId);
      qc.invalidateQueries({ queryKey: ["advisor-threads"] });
    })();
  }, [busy, messages, qc, threadId, userId]);

  // En las charlas compartidas, trae lo que escriba la otra persona.
  useEffect(() => {
    if (!isShared) return;
    const channel = supabase
      .channel(`advisor:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "advisor_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const row = payload.new as Row;
          if (row.user_id === userId || savedRef.current.has(row.id)) return;
          const { data } = await supabase
            .from("advisor_messages")
            .select("id, role, parts, user_id, created_at")
            .eq("thread_id", threadId)
            .order("created_at");
          if (!data) return;
          savedRef.current = new Set(data.map((r) => r.id));
          setMessages(rowsToMessages(data as Row[]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isShared, threadId, userId]);

  async function send(value: string) {
    const clean = value.trim();
    if (!clean || busy) return;

    const puter = window.puter;
    if (!puter) {
      const message = "La IA gratuita todavía no cargó. Recarga la página e intenta de nuevo.";
      setChatError(message);
      setStatus("error");
      toast.error(message);
      return;
    }

    // La autenticación de Puter se inicia directamente desde el gesto del usuario
    // para que el navegador no bloquee la ventana. No requiere API key del proyecto.
    try {
      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn({ attempt_temp_user_creation: true });
      }
    } catch (error) {
      const message = readablePuterError(error);
      setChatError(message);
      setStatus("error");
      toast.error(message);
      return;
    }

    setText("");
    setChatError(null);
    setStatus("submitted");

    const userMessage = newTextMessage("user", clean);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    if (messages.length === 0) {
      await supabase
        .from("advisor_threads")
        .update({ title: threadTitleFrom(clean) })
        .eq("id", threadId);
      qc.invalidateQueries({ queryKey: ["advisor-thread", threadId] });
      qc.invalidateQueries({ queryKey: ["advisor-threads"] });
    }

    try {
      const system = await buildAdvisorSystem(userId);
      const history: PuterMessage[] = nextMessages
        .slice(-30)
        .map((message) => ({ role: message.role, content: messageText(message) }))
        .filter((message) => asString(message.content));
      const conversation: PuterMessage[] = [{ role: "system", content: system }, ...history];\n      const actionConfirmed = hasExplicitActionConfirmation(messages, clean);

      const first = await puter.ai.chat(conversation, false, {
        model: "gpt-5.6-luna",
        stream: false,
        normalize: true,
        reasoning_effort: "low",
        verbosity: "medium",
        temperature: 0.7,
        max_tokens: 1400,
        tools: ADVISOR_TOOLS,
      });

      const toolCalls = typeof first === "string" ? [] : (first.message?.tool_calls ?? []);
      let answer = "";

      if (toolCalls.length > 0 && typeof first !== "string" && first.message) {
        conversation.push(first.message);
        for (const call of toolCalls) {
          let result: string;
          if (!actionConfirmed) {
            result =
              "ERROR: La aplicación bloqueó la acción porque aún falta una confirmación explícita del usuario. Pide confirmación y no afirmes que se realizó.";
          } else {
            try {
              result = await executeAdvisorTool(call.function.name, call.function.arguments, userId);
            } catch (error) {
              result = `ERROR: ${error instanceof Error ? error.message : "No se pudo completar la acción."}`;
            }
          }
          conversation.push({ role: "tool", tool_call_id: call.id, content: result });
        }
        await qc.invalidateQueries();

        const final = await puter.ai.chat(conversation, false, {
          model: "gpt-5.6-luna",
          stream: false,
          normalize: true,
          reasoning_effort: "low",
          verbosity: "medium",
          temperature: 0.7,
          max_tokens: 1200,
        });
        answer = extractPuterText(final);
      } else {
        answer = extractPuterText(first);
      }

      if (!answer) throw new Error("La IA respondió sin texto.");
      setMessages((current) => [...current, newTextMessage("assistant", answer)]);
      setStatus("ready");
    } catch (error) {
      const message = readablePuterError(error);
      setChatError(message);
      setStatus("error");
      toast.error(message);
    } finally {
      areaRef.current?.focus();
    }
  }

  // Si la charla se abrió con un atajo y Puter ya está autorizado, se envía solo.
  // Si aún no lo está, deja el texto listo para que el usuario pulse enviar y el
  // navegador permita la autorización desde ese gesto.
  useEffect(() => {
    if (!autoSend || autoSentRef.current || messages.length > 0) return;
    autoSentRef.current = true;
    if (window.puter?.auth.isSignedIn()) {
      void send(autoSend);
    } else {
      setText(autoSend);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend]);

  useEffect(() => {
    areaRef.current?.focus();
  }, [threadId, status]);

  return (
    <div className="surface flex h-[calc(100dvh-12rem)] min-h-[24rem] max-h-[52rem] min-w-0 flex-col overflow-hidden lg:h-[min(72vh,52rem)]">
      <Conversation className="flex-1">
        <ConversationContent className="gap-4 p-3 sm:gap-6 sm:p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<HeartHandshake className="size-8 text-primary" />}
              title="Cuéntame cómo te sientes"
              description="El Consejero usa IA externa sin una API key de Lovable. La primera vez puede pedir una autorización gratuita de Puter."
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                      );
                    }
                    if (part.type === "reasoning") {
                      return (
                        <p
                          key={`${message.id}-${index}`}
                          className="text-xs italic text-muted-foreground"
                        >
                          {part.text}
                        </p>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Pensando en ustedes…</Shimmer>}
          {chatError && <p className="text-xs text-destructive">{chatError}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 p-3">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            void send(message.text || text);
          }}
        >
          <PromptInputTextarea
            ref={areaRef}
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Cuéntame qué pasó hoy…"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!text.trim() && !busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
