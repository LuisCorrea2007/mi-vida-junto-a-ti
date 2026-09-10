import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Sin sesión" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[advisor-chat] Faltan variables de Supabase");
      return json({ error: "Configuración de Supabase incompleta" }, 500);
    }
    if (!lovableKey) {
      console.error("[advisor-chat] LOVABLE_API_KEY no está disponible en Edge Functions");
      return json({ error: "La IA de Lovable no está disponible en este entorno" }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "Sesión inválida" }, 401);

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const system = typeof body?.system === "string" ? body.system : "";

    // Convert the AI SDK UI messages to the OpenAI-compatible chat format.
    const normalizedMessages = messages
      .filter((message: any) => message && (message.role === "user" || message.role === "assistant"))
      .map((message: any) => ({
        role: message.role,
        content: Array.isArray(message.parts)
          ? message.parts
              .filter((part: any) => part?.type === "text" && typeof part.text === "string")
              .map((part: any) => part.text)
              .join("\n")
          : typeof message.content === "string"
            ? message.content
            : "",
      }))
      .filter((message: any) => message.content.trim().length > 0);

    const gatewayResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Lovable-API-Key": lovableKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...normalizedMessages,
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    const responseText = await gatewayResponse.text();
    if (!gatewayResponse.ok) {
      console.error("[advisor-chat] Gateway error", gatewayResponse.status, responseText.slice(0, 1000));
      return json(
        {
          error:
            gatewayResponse.status === 402
              ? "La cuenta de Lovable no tiene créditos de IA disponibles."
              : `El gateway de IA respondió ${gatewayResponse.status}.`,
        },
        gatewayResponse.status === 429 || gatewayResponse.status === 402 ? gatewayResponse.status : 502,
      );
    }

    let completion: any;
    try {
      completion = JSON.parse(responseText);
    } catch {
      console.error("[advisor-chat] Respuesta no JSON del gateway", responseText.slice(0, 500));
      return json({ error: "Respuesta inválida del gateway de IA" }, 502);
    }

    const text = completion?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      console.error("[advisor-chat] El gateway no devolvió contenido", responseText.slice(0, 1000));
      return json({ error: "La IA no devolvió una respuesta" }, 502);
    }

    return json({ text });
  } catch (error) {
    console.error("[advisor-chat] Error inesperado", error);
    return json({ error: error instanceof Error ? error.message : "Error inesperado" }, 500);
  }
});
