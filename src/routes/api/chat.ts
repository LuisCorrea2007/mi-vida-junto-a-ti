import { createFileRoute } from "@tanstack/react-router";

/**
 * El Consejero ya no usa un gateway de IA del servidor ni requiere
 * LOVABLE_API_KEY. La conversación se ejecuta en el navegador mediante
 * Puter.js desde la pantalla /consejero/$id.
 *
 * Conservamos esta ruta para no romper imports del routeTree generado en
 * instalaciones que todavía no lo hayan regenerado.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async () =>
        new Response(
          JSON.stringify({
            error: "El Consejero ahora usa Puter AI directamente desde el navegador.",
          }),
          {
            status: 410,
            headers: { "Content-Type": "application/json" },
          },
        ),
    },
  },
});
