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

/** Modelo soportado por Lovable AI Gateway para el Consejero. */
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

  // Lovable's current gateway exposes curated model IDs. The previous
  // openai/gpt-6-astra ID is not a supported gateway model and causes the
  // advisor endpoint to fail before a stream can be created.
  return provider.responses("google/gemini-3.7-flash");
}

/**
 * Keep gateway options minimal and portable. Reasoning-specific OpenAI
 * options were removed because they are not guaranteed to be accepted by
 * every model exposed through the Lovable gateway.
 */
export const ADVISOR_PROVIDER_OPTIONS = undefined;
