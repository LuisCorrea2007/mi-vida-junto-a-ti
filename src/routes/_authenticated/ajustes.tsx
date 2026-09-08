import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check, Copy, HeartHandshake, Loader2, Smartphone, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile, useProfiles } from "@/hooks/use-profiles";
import { useCouple } from "@/hooks/use-couple";
import { compressImage, uploadMedia, useSignedUrl, validateImage } from "@/lib/media";
import { disablePush, enablePush, pushEnabled, pushSupported } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export const Route = createFileRoute("/_authenticated/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — Nuestro Espacio" },
      { name: "description", content: "Perfil, foto y fecha de aniversario de su espacio compartido." },
      { property: "og:title", content: "Ajustes — Nuestro Espacio" },
      { property: "og:description", content: "Configuración del espacio de pareja." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useMyProfile(user?.id);
  const { data: avatar } = useSignedUrl(profile?.avatar_url);
  const [form, setForm] = useState({ name: "", anniversary: "", location: "" });
  const [busy, setBusy] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const partner = profiles?.find((p) => p.id === couple?.partnerId);

  const createSpace = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      const { data, error } = await supabase
        .from("couples")
        .insert({ created_by: user.id, code: crypto.randomUUID() })
        .select("id")
        .single();
      if (error) throw error;
      const { error: memberError } = await supabase
        .from("couple_members")
        .insert({ couple_id: data.id, user_id: user.id });
      if (memberError) throw memberError;
    },
    onSuccess: () => {
      toast.success("Espacio creado. Comparte el código con tu pareja.");
      qc.invalidateQueries({ queryKey: ["couple"] });
    },
    onError: () => toast.error("No pudimos crear el espacio"),
  });

  const joinSpace = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      const code = joinCode.trim();
      if (!/^[0-9a-f-]{36}$/i.test(code)) throw new Error("Ese código no es válido");
      const { error } = await supabase
        .from("couple_members")
        .insert({ couple_id: code, user_id: user.id });
      if (error) throw new Error("No pudimos unirte: revisa el código o ya tiene dos personas");
    },
    onSuccess: () => {
      setJoinCode("");
      toast.success("¡Listo! Ya comparten el mismo espacio.");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function copyCode() {
    if (!couple?.coupleId) return;
    await navigator.clipboard.writeText(couple.coupleId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }


  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        anniversary: profile.anniversary_date ?? "",
        location: profile.location ?? "",
      });
    }
  }, [profile]);

  const { data: storage } = useQuery({
    queryKey: ["storage-usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("photos").select("file_size");
      if (error) throw error;
      const bytes = (data ?? []).reduce((sum, p) => sum + (p.file_size ?? 0), 0);
      return { count: data?.length ?? 0, mb: (bytes / 1_048_576).toFixed(1) };
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sin sesión");
      if (!form.name.trim()) throw new Error("Escribe un nombre");
      const { error } = await supabase
        .from("profiles")
        .update({
          name: form.name.trim().slice(0, 60),
          anniversary_date: form.anniversary || null,
          location: form.location.trim().slice(0, 120) || null,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Guardado");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadAvatar(file?: File) {
    if (!file || !user) return;
    const invalid = validateImage(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setBusy(true);
    try {
      const blob = await compressImage(file, 512, 0.9);
      const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
      const path = await uploadMedia("avatars", user.id, blob, ext);
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (error) throw error;
      toast.success("Foto actualizada");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    } catch {
      toast.error("No pudimos subir la foto");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Su perfil y los detalles del espacio.</p>
      </header>

      <section className="surface space-y-5 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border">
            <AvatarImage src={avatar ?? undefined} alt={profile?.name ?? "Perfil"} />
            <AvatarFallback>{(profile?.name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="rounded-full"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Upload className="mr-1 size-4" />}
            Cambiar foto
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadAvatar(e.target.files?.[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pn">Tu nombre</Label>
          <Input
            id="pn"
            maxLength={60}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pa">Fecha de aniversario</Label>
          <Input
            id="pa"
            type="date"
            value={form.anniversary}
            onChange={(e) => setForm({ ...form, anniversary: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Con esta fecha calculamos el contador de días juntos.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl">Ciudad</Label>
          <Input
            id="pl"
            maxLength={120}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <Button className="rounded-full" onClick={() => save.mutate()} disabled={save.isPending}>
          Guardar cambios
        </Button>
      </section>

      <section className="surface space-y-4 p-6">
        <div className="flex items-center gap-2">
          <HeartHandshake className="size-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Su espacio de pareja</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Todo lo que guardan aquí es privado. Solo lo verán las dos personas vinculadas a este
          espacio.
        </p>

        {!couple?.coupleId ? (
          <div className="space-y-5">
            <div>
              <Button
                className="rounded-full"
                onClick={() => createSpace.mutate()}
                disabled={createSpace.isPending}
              >
                Crear nuestro espacio
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Crea el espacio y comparte el código con tu pareja.
              </p>
            </div>
            <div className="space-y-2 border-t pt-5">
              <Label htmlFor="jc">Ya tengo un código</Label>
              <div className="flex gap-2">
                <Input
                  id="jc"
                  placeholder="Pega aquí el código"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => joinSpace.mutate()}
                  disabled={joinSpace.isPending}
                >
                  Unirme
                </Button>
              </div>
            </div>
          </div>
        ) : partner ? (
          <p className="text-sm">
            Vinculado con <span className="font-semibold">{partner.name ?? "tu pareja"}</span>. Ya
            se ven todo entre ustedes.
          </p>
        ) : (
          <div className="space-y-2">
            <Label>Código de invitación</Label>
            <div className="flex gap-2">
              <Input readOnly value={couple.coupleId} className="font-mono text-xs" />
              <Button variant="outline" className="rounded-full" onClick={copyCode}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Envíale este código a tu pareja para que se una.
            </p>
          </div>
        )}
      </section>

      <PushSection userId={user?.id} />
      <InstallSection />

      <section className="surface p-6">
        <h2 className="font-display text-xl font-semibold">Almacenamiento</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {storage ? `${storage.count} fotos · ${storage.mb} MB usados` : "Calculando…"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sus fotos son privadas: solo ustedes dos pueden verlas.
        </p>
      </section>
    </div>
  );
}

function PushSection({ userId }: { userId: string | undefined }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(pushSupported());
    pushEnabled().then(setEnabled);
  }, []);

  async function toggle() {
    if (!userId) return;
    setBusy(true);
    try {
      if (enabled) {
        await disablePush(userId);
        setEnabled(false);
        toast.success("Avisos desactivados en este dispositivo");
      } else {
        const ok = await enablePush(userId);
        setEnabled(ok);
        if (ok) toast.success("Listo: te avisaremos en este dispositivo");
        else toast.error("No se dio permiso para los avisos");
      }
    } catch {
      toast.error("No pudimos cambiar los avisos");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface space-y-3 p-6">
      <h2 className="font-display text-xl font-semibold">Avisos en el celular</h2>
      <p className="text-sm text-muted-foreground">
        Recibe una notificación cuando tu pareja suba, comente o cambie algo, incluso con la app cerrada.
      </p>
      {supported ? (
        <Button variant={enabled ? "outline" : "default"} className="rounded-full" onClick={toggle} disabled={busy}>
          <BellRing className="mr-1 size-4" />
          {enabled ? "Desactivar en este dispositivo" : "Activar avisos"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          Este navegador no admite avisos. En iPhone, primero agrega la app a la pantalla de inicio y ábrela desde ahí.
        </p>
      )}
    </section>
  );
}

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

function InstallSection() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return (
    <section className="surface space-y-3 p-6">
      <h2 className="font-display text-xl font-semibold">Instalar la app</h2>
      {installed ? (
        <p className="text-sm text-muted-foreground">Ya tienes Nuestro Espacio en tu pantalla de inicio. 💗</p>
      ) : prompt ? (
        <Button
          className="rounded-full"
          onClick={async () => {
            await prompt.prompt();
            setPrompt(null);
          }}
        >
          <Smartphone className="mr-1 size-4" /> Agregar a la pantalla de inicio
        </Button>
      ) : ios ? (
        <p className="text-sm text-muted-foreground">
          En Safari toca el botón <strong>Compartir</strong> y luego <strong>Agregar a pantalla de inicio</strong>.
          Verás el corazón rosa como ícono.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Abre el menú del navegador y elige <strong>Instalar app</strong> o <strong>Agregar a pantalla de inicio</strong>.
        </p>
      )}
    </section>
  );
}
