import { useEffect, useRef, useState } from "react";
import { Glyph } from "@/components/glyph";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { ArrowLeft, HeartHandshake, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyPartner } from "@/lib/notify";
import { toolLabel } from "@/lib/advisor";
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
type Row = { sdk_id?:string | null; id: string; role: string; parts: unknown; user_id: string; created_at: string };

function rowsToMessages(rows: Row[]): UIMessage[] {
  return rows.map((r) => ({
    id: r.sdk_id ?? r.id,
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
        .select("id, sdk_id, role, parts, user_id, created_at")
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
    if (error) {
      toast.error("No se pudo cambiar");
      return;
    }
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
            {thread?.is_shared ? "Los dos ven esta charla" : "Solo tú ves esta charla"} · IA de uso medido
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
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoSentRef = useRef(false);
  const {messages, setMessages, sendMessage, status, error, stop, addToolApprovalResponse}=useChat({
    id:threadId,
    messages:initialMessages,
    transport:new DefaultChatTransport({api:'/api/chat',body:{threadId},fetch:async(input,init)=>{
      const {data}=await supabase.auth.getSession();const headers=new Headers(init?.headers);
      if(data.session) headers.set('Authorization',`Bearer ${data.session.access_token}`);
      const response=await fetch(input,{...init,headers});
      if(!response.ok){const payload=await response.json().catch(()=>({error:'No se pudo conectar con el Consejero.'}));throw new Error(payload.error ?? payload.message ?? 'No se pudo conectar con el Consejero.');}
      return response;
    }}),
    sendAutomaticallyWhen:lastAssistantMessageIsCompleteWithApprovalResponses,
    onError:(error)=>toast.error(error.message),
    onFinish:()=>{void qc.invalidateQueries({queryKey:['advisor-threads']});void qc.invalidateQueries({queryKey:['advisor-thread',threadId]});},
  });
  const busy=status==='submitted'||status==='streaming';
  const chatError=error?.message;
  async function send(value:string){const clean=value.trim();if(!clean||busy)return;setText('');await sendMessage({text:clean});}
  // A contextual suggestion is drafted, never sent or billed automatically.
  useEffect(()=>{if(autoSend&&!autoSentRef.current&&messages.length===0){autoSentRef.current=true;setText(autoSend);}},[autoSend,messages.length]);
  useEffect(()=>{
    if(!isShared)return;
    const channel=supabase.channel(`advisor:${threadId}`).on('postgres_changes',{event:'*',schema:'public',table:'advisor_messages',filter:`thread_id=eq.${threadId}`},async(payload)=>{
      if(busy||payload.new['user_id']===userId)return;
      const {data,error}=await supabase.from('advisor_messages').select('id,sdk_id,role,parts,user_id,created_at').eq('thread_id',threadId).order('created_at');
      if(!error&&data)setMessages(rowsToMessages(data));
    }).subscribe();
    return()=>{void supabase.removeChannel(channel);};
  },[isShared,threadId,userId,busy,setMessages]);

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
              description="Un espacio para entender lo que sientes y elegir cómo acercarte a tu amor."
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
                    if (part.type.startsWith('tool-') || part.type==='dynamic-tool') {
                      const toolPart=part as import('ai').ToolUIPart;
                      const approvalId=toolPart.approval?.id;
                      return <div key={`${message.id}-${index}`}><Tool defaultOpen={false}><ToolHeader type={toolPart.type} state={toolPart.state} title={toolLabel(toolPart.type)} /><ToolContent><ToolInput input={toolPart.input}/><ToolOutput output={toolPart.output} errorText={toolPart.errorText}/></ToolContent></Tool>{toolPart.state==='approval-requested'&&toolPart.approval&&!toolPart.approval.isAutomatic&&<div className="flex gap-2"><Button size="sm" onClick={()=>addToolApprovalResponse({id:approvalId!,approved:true})}>Aprobar</Button><Button size="sm" variant="outline" onClick={()=>addToolApprovalResponse({id:approvalId!,approved:false})}>No guardar</Button></div>}</div>;
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

      <div className="border-t border-border/60 p-3"><p className="mb-2 text-xs text-muted-foreground">Las consultas usan créditos de IA; no se envían sin tu permiso.</p>
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
            <PromptInputSubmit status={status} onStop={stop} disabled={!text.trim() && !busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
