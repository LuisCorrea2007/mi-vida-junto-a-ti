import { createLovableAuth, type SignInWithOAuthOptions, type OAuthProvider } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const auth = createLovableAuth();

export const lovable = {
  auth: {
    async signInWithOAuth(provider: OAuthProvider, opts?: SignInWithOAuthOptions) {
      const result = await auth.signInWithOAuth(provider, opts);
      if (result.error) return result;
      if (result.redirected) return result;
      const { error } = await supabase.auth.setSession({
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token,
      });
      if (error) return { error, redirected: false as const };
      return result;
    },
  },
};
