import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, HeartHandshake, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyPartner } from "@/lib/notify";
import { threadTitleFrom, toolLabel } from "@/lib/advisor";
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Search = { inicio?: string };

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

function rowsToMessages(rows: Row[]): UIMessage[] {
  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage["role"],
    parts: (Array.isArray(r.parts) ? r.parts : []) as UIMessage["parts"],
  }));
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
      <div className="flex items-center gap-2">
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
            {thread?.is_shared ? "Los dos ven esta charla" : "Solo tú ves esta charla"}
          </p>
        </div>
        {thread?.user_id === user?.id && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={toggleShared}>
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
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const savedRef = useRef<Set<string>>(new Set(initialMessages.map((m) => m.id)));
  const autoSentRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token ?? "";
          return { Authorization: `Bearer ${token}` };
        },
      }),
    [],
  );

  const { messages, sendMessage, status, setMessages, error } = useChat<UIMessage>({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "El Consejero no pudo responder"),
  });

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
  }, [isShared, setMessages, threadId, userId]);

  async function send(value: string) {
    const clean = value.trim();
    if (!clean || busy) return;
    setText("");
    if (messages.length === 0) {
      await supabase
        .from("advisor_threads")
        .update({ title: threadTitleFrom(clean) })
        .eq("id", threadId);
      qc.invalidateQueries({ queryKey: ["advisor-thread", threadId] });
      qc.invalidateQueries({ queryKey: ["advisor-threads"] });
    }
    await sendMessage({ text: clean });
    areaRef.current?.focus();
  }

  // Manda solo el atajo con el que se abrió la charla.
  useEffect(() => {
    if (!autoSend || autoSentRef.current || messages.length > 0) return;
    autoSentRef.current = true;
    send(autoSend);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend]);

  useEffect(() => {
    areaRef.current?.focus();
  }, [threadId, status]);

  return (
    <div className="surface flex h-[70vh] min-h-[26rem] flex-col overflow-hidden">
      <Conversation className="flex-1">
        <ConversationContent className="gap-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<HeartHandshake className="size-8 text-primary" />}
              title="Cuéntame cómo te sientes"
              description="Lo que escribas aquí queda entre ustedes. Puedo escuchar, aconsejar y también escribir notas o agendar planes si me lo pides."
            />
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.parts.map((part, i) => {
                    const key = `${m.id}-${i}`;
                    if (part.type === "text") {
                      return <MessageResponse key={key}>{part.text}</MessageResponse>;
                    }
                    if (part.type === "reasoning") {
                      return (
                        <p key={key} className="text-xs italic text-muted-foreground">
                          {part.text}
                        </p>
                      );
                    }
                    if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                      const tp = part as ToolPart;
                      return (
                        <Tool defaultOpen={false} key={key}>
                          <ToolHeader
                            title={toolLabel(tp.type)}
                            {...(tp.type === "dynamic-tool"
                              ? { type: tp.type, state: tp.state, toolName: tp.toolName }
                              : { type: tp.type, state: tp.state })}
                          />
                          <ToolContent>
                            <ToolInput input={tp.input} />
                            <ToolOutput
                              errorText={"errorText" in tp ? tp.errorText : undefined}
                              output={
                                "output" in tp && tp.output ? (
                                  <pre className="overflow-x-auto text-xs">
                                    {JSON.stringify(tp.output, null, 2)}
                                  </pre>
                                ) : undefined
                              }
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Pensando en ustedes…</Shimmer>}
          {error && (
            <p className="text-xs text-destructive">
              {error.message || "Algo falló al responder. Intenta otra vez."}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 p-3">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            send(message.text || text);
          }}
        >
          <PromptInputTextarea
            ref={areaRef}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
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
