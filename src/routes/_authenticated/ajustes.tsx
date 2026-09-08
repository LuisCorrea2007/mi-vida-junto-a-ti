import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profiles";
import { compressImage, uploadMedia, useSignedUrl, validateImage } from "@/lib/media";
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
