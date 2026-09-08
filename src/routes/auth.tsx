import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Heart, Loader2, X } from "lucide-react";
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

/** Cuentas recordadas en este dispositivo (solo correo y nombre, nunca la contraseña). */
type SavedAccount = { email: string; name: string; provider: "password" | "google" };
const SAVED_KEY = "ne-saved-accounts";

function readSaved(): SavedAccount[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const list = raw ? (JSON.parse(raw) as SavedAccount[]) : [];
    return Array.isArray(list) ? list.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function rememberAccount(acc: SavedAccount) {
  const list = readSaved().filter((a) => a.email !== acc.email);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify([acc, ...list].slice(0, 4)));
}

function forgetAccount(email: string) {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(readSaved().filter((a) => a.email !== email)));
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedAccount[]>([]);
  const [picked, setPicked] = useState<SavedAccount | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setSaved(readSaved());
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    // Al volver de Google, recordamos la cuenta usada.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user.email) {
        const meta = session.user.user_metadata as { name?: string; full_name?: string };
        const isGoogle = session.user.app_metadata["provider"] === "google";
        rememberAccount({
          email: session.user.email,
          name: meta.name ?? meta.full_name ?? session.user.email.split("@")[0]!,
          provider: isGoogle ? "google" : "password",
        });
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signInWith(email: string, password: string) {
    if (!passSchema.safeParse(password).success) { toast.error("Mínimo 8 caracteres"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("Contraseña incorrecta"); return; }
    navigate({ to: "/panel", replace: true });
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(form.get("email"));
    const password = passSchema.safeParse(form.get("password"));
    if (!email.success) { toast.error(email.error.issues[0]!.message); return; }
    if (!password.success) { toast.error(password.error.issues[0]!.message); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    setLoading(false);
    if (error) { toast.error("No pudimos entrar: revisa el correo y la contraseña"); return; }
    const meta = data.user.user_metadata as { name?: string };
    rememberAccount({ email: email.data, name: meta.name ?? email.data.split("@")[0]!, provider: "password" });
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

        {saved.length > 0 && !showAll ? (
          <div className="surface animate-fade-up p-6 sm:p-8">
            {picked ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  fd.set("email", picked.email);
                  signInWith(picked.email, String(fd.get("password") ?? ""));
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 font-display text-lg text-primary">
                    {picked.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{picked.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{picked.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pk-pass">Contraseña</Label>
                  <Input id="pk-pass" name="password" type="password" autoComplete="current-password" autoFocus required />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Entrar
                </Button>
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="w-full text-center text-xs text-muted-foreground hover:underline"
                >
                  Elegir otra cuenta
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">¿Quién entra?</p>
                {saved.map((acc) => (
                  <div key={acc.email} className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 rounded-2xl border border-border p-3 text-left transition-colors hover:bg-muted/60"
                      onClick={() => (acc.provider === "google" ? google() : setPicked(acc))}
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-primary">
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{acc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {acc.email}
                          {acc.provider === "google" ? " · Google" : ""}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Olvidar cuenta"
                      onClick={() => {
                        forgetAccount(acc.email);
                        setSaved(readSaved());
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full pt-2 text-center text-xs text-muted-foreground hover:underline"
                >
                  Usar otra cuenta o crear una nueva
                </button>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
