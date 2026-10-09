import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateId, type ModelMessage, type UIMessage, type ToolSet } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
  options?: {tools:ToolSet; toolApproval: () => 'user-approval'; experimental_toolApprovalSecret:string; stopWhen:ReturnType<typeof import('ai').stepCountIs>; onGatewayFailure:(status:number,message:string)=>Promise<void>},
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  let failure: {status:number;message:string} | undefined;
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input,init)=>{
      const response=await runIdFetch.fetch(input,init);
      if(!response.ok && options){let message='La IA no está disponible.';try{const data=await response.clone().json() as {message?:string;error?:{message?:string}};message=data.message??data.error?.message??message;}catch{}failure={status:response.status,message};await options.onGatewayFailure(response.status,message);}
      return response;
    },
  });
  const reasoning = config.model !== "openai/chat-latest";
  const result = streamText({
    model: provider.responses(config.model),
    // AI SDK 6 lacks `instructions`: rename this key to `system` there.
    ...(instructions ? { instructions } : {}),
    messages,
    abortSignal: request.signal,
    maxRetries: 0,
    ...(options?{tools:options.tools,toolApproval:options.toolApproval,experimental_toolApprovalSecret:options.experimental_toolApprovalSecret,stopWhen:options.stopWhen}:{}),
    providerOptions: {
      openai: {
        store: false,
        ...(reasoning
          ? {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            }
          : {}),
      },
    },
  });
  return {
    result,
    response: async (originalMessages: UIMessage[] = [], onFinish?: (message:UIMessage)=>Promise<void>) => {
      const response=result.toUIMessageStreamResponse({ originalMessages, generateMessageId:generateId, sendReasoning: true,
        onError:(e)=>failure?.message ?? (e instanceof Error?e.message:'La IA no pudo responder.'),
        ...(onFinish?{onFinish:async({responseMessage})=>onFinish(responseMessage)}:{}) });
      const wrapped=await withLovableAiGatewayRunIdHeader(response,runIdFetch);
      if(failure){await wrapped.body?.cancel();return Response.json({error:failure.message},{status:failure.status});}
      return wrapped;
    },
  };
}
