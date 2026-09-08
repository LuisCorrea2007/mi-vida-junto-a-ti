import { createMiddleware, createStart } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/** Adjunta la sesión del usuario a cada llamada al servidor. */
const attachSession = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSession],
}));
