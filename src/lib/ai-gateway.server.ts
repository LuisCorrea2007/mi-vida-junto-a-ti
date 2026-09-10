import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

/** Reenvía y captura el identificador de ejecución del gateway. */
export function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId = response.headers.get(RUN_ID_HEADER)?.trim() || runId;
      return response;
    },
    getRunId: () => runId,
  };
}

/**
 * Crea el modelo del Consejero usando el endpoint Chat Completions del
 * Lovable AI Gateway. Es deliberado: el gateway es OpenAI-compatible y el
 * modelo de Google debe viajar por la ruta de chat, no por una implementación
 * específica de OpenAI Responses.
 */
export function createAdvisorModel(apiKey: string, request?: Request) {
  const initialRunId = request?.headers.get(RUN_ID_HEADER)?.trim() || undefined;
  const runIdFetch = createRunIdFetch(initialRunId);

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    compatibility: "compatible",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch as typeof fetch,
  });

  return provider.chat("google/gemini-3.7-flash");
}
