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

/** Modelo de Lovable AI para el consejero (API de respuestas, con razonamiento). */
export function createAdvisorModel(apiKey: string, request?: Request) {
  const initialRunId = request?.headers.get(RUN_ID_HEADER)?.trim() || undefined;
  const runIdFetch = createRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch as typeof fetch,
  });
  return provider.responses("openai/gpt-6-astra");
}

export const ADVISOR_PROVIDER_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "medium",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;
