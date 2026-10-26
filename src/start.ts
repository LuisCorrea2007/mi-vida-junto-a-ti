import { createMiddleware, createStart } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { closedSiteResponse } from "@/lib/closed-site";

// Never call next(): routes, authentication and server functions remain inaccessible.
const permanentlyClosed = createMiddleware().server(({ request }) => closedSiteResponse(request));

/** Adjunta la sesión del usuario a cada llamada al servidor. */
const attachSession = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [permanentlyClosed],
  functionMiddleware: [attachSession],
}));
