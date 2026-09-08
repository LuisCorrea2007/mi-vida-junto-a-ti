import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar a Nuestro Espacio" },
      {
        name: "description",
        content: "Inicia sesión o crea la cuenta de su espacio privado de pareja.",
      },
      { property: "og:title", content: "Entrar a Nuestro Espacio" },
      { property: "og:description", content: "Accede al espacio privado de la pareja." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Correo inválido").max(255);
const passSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const nameSchema = z.string().trim().min(1, "Escribe un nombre").max(60);

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(form.get("email"));
    const password = passSchema.safeParse(form.get("password"));
    if (!email.success) { toast.error(email.error.issues[0]!.message); return; }
    if (!password.success) { toast.error(password.error.issues[0]!.message); return; }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    setLoading(false);
    if (error) { toast.error("No pudimos entrar: revisa el correo y la contraseña"); return; }
    navigate({ to: "/panel", replace: true });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = nameSchema.safeParse(form.get("name"));
    const email = emailSchema.safeParse(form.get("email"));
    const password = passSchema.safeParse(form.get("password"));
    if (!name.success) { toast.error(name.error.issues[0]!.message); return; }
    if (!email.success) { toast.error(email.error.issues[0]!.message); return; }
    if (!password.success) { toast.error(password.error.issues[0]!.message); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        data: { name: name.data },
        emailRedirectTo: `${window.location.origin}/panel`,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Cuenta creada. Si te pedimos confirmar el correo, revisa tu bandeja.");
    navigate({ to: "/panel", replace: true });
  }

  async function google() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("No pudimos conectar con Google"); return;
    }
    if (result.redirected) return;
    navigate({ to: "/panel", replace: true });
  }

  async function reset() {
    const email = window.prompt("¿A qué correo enviamos el enlace de recuperación?");
    if (!email) return;
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error("Correo inválido"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Te enviamos un enlace para restablecer la contraseña");
  }

  return (
    <div className="warm-gradient flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Heart className="size-6 fill-primary text-primary" />
          <span className="font-display text-2xl font-semibold">Nuestro Espacio</span>
        </Link>

        <div className="surface animate-fade-up p-6 sm:p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="li-email">Correo</Label>
                  <Input id="li-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="li-pass">Contraseña</Label>
                  <Input
                    id="li-pass"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Entrar
                </Button>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Olvidé mi contraseña
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">¿Cómo te llamamos?</Label>
                  <Input id="su-name" name="name" maxLength={60} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Correo</Label>
                  <Input id="su-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass">Contraseña</Label>
                  <Input
                    id="su-pass"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Crear cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={google}
            disabled={loading}
          >
            Continuar con Google
          </Button>
        </div>
      </div>
    </div>
  );
}
