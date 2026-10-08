import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export type CinemaMovie = { id: string; user_id: string; title: string; source_es: string | null; source_en: string | null; file_path: string | null; is_favorite: boolean; watched: boolean };

export function CinemaPlayer({ movie, userId }: { movie: CinemaMovie; userId: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const suppressUntil = useRef(0);
  const commandId = useRef<string | null>(null);
  const [language, setLanguage] = useState(movie.source_es ? "es" : movie.source_en ? "en" : "file");
  const [playError, setPlayError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState(true);
  const [status, setStatus] = useState("Conectando…");
  const { data: signed } = useQuery({
    queryKey: ["cinema-url", movie.file_path], enabled: !!movie.file_path,
    staleTime: 150 * 60_000,
    queryFn: async () => {
      if (!movie.file_path) return null;
      const { data, error } = await supabase.storage.from("cinema").createSignedUrl(movie.file_path, 3 * 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  const source = language === "es" ? movie.source_es : language === "en" ? movie.source_en : signed;
  useEffect(() => { setReady(false); setPlayError(null); }, [source]);

  useEffect(() => {
    if (!sync || !ready) return;
    let active = true;
    const receive = async () => {
      const { data } = await supabase.from("cinema_commands").select("*").eq("movie_id", movie.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!active || !data || commandId.current === data.id) return;
      commandId.current = data.id;
      const el = video.current;
      if (!el || data.user_id === userId) return;
      if (data.language !== language) { setLanguage(data.language); commandId.current = null; return; }
      suppressUntil.current = Date.now() + 1500;
      const offset = data.action === "play" ? Math.max(0, (Date.now() - Date.parse(data.created_at)) / 1000) : 0;
      el.currentTime = Math.min(Number.isFinite(el.duration) ? el.duration : 86400, data.position + offset);
      if (data.action === "play") {
        await el.play().catch(() => setPlayError("Pulsa reproducir para unirte a la película."));
      } else if (data.action === "pause") el.pause();
    };
    const channel = supabase.channel(`cinema:${movie.id}:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cinema_commands", filter: `movie_id=eq.${movie.id}` }, () => { void receive(); })
      .subscribe((state) => { setStatus(state === "SUBSCRIBED" ? "Sala en vivo" : "Reconectando…"); if (state === "SUBSCRIBED") void receive(); });
    const timer = setInterval(() => { if (document.visibilityState === "visible") void receive(); }, 5000);
    return () => { active = false; clearInterval(timer); void supabase.removeChannel(channel); };
  }, [movie.id, userId, ready, sync, language]);

  async function send(action: "play" | "pause" | "seek") {
    const el = video.current;
    if (!el || !sync || !ready || Date.now() < suppressUntil.current) return;
    const nextAction = action === "seek" ? (el.paused ? "pause" : "play") : action;
    const { data, error } = await supabase.from("cinema_commands").insert({ movie_id: movie.id, user_id: userId, action: nextAction, position: el.currentTime, language }).select("id").single();
    if (error) toast.error("No pudimos sincronizar este cambio con tu pareja.");
    else commandId.current = data.id;
  }
  function skip(amount: number) {
    const el = video.current;
    if (el) el.currentTime = Math.max(0, Math.min(el.duration || 86400, el.currentTime + amount));
  }
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-xl font-semibold">{movie.title}</h2>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Idioma de la película" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {movie.source_es && <option value="es">Español</option>}{movie.source_en && <option value="en">English</option>}{movie.file_path && <option value="file">Archivo original</option>}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sync} onChange={(event) => setSync(event.target.checked)} /> Ver juntos</label>
      </div>
    </div>
    <video ref={video} src={source ?? undefined} controls playsInline preload="metadata" className="aspect-video w-full rounded-lg bg-muted" onLoadedMetadata={() => setReady(true)} onPlay={() => { setPlayError(null); void send("play"); }} onPause={() => void send("pause")} onSeeked={() => void send("seek")} onError={() => setPlayError("No se pudo reproducir este video. Revisa el enlace o el formato del archivo.")} />
    <div className="flex flex-wrap items-center gap-2">
      <Button size="icon" variant="outline" aria-label="Retroceder 10 segundos" title="Retroceder 10 segundos" onClick={() => skip(-10)}><RotateCcw className="size-4" /></Button>
      <Button size="icon" aria-label="Reproducir" title="Reproducir" onClick={() => { void video.current?.play().catch(() => setPlayError("No se pudo iniciar la reproducción.")); }}><Play className="size-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Pausar" title="Pausar" onClick={() => video.current?.pause()}><Pause className="size-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Adelantar 10 segundos" title="Adelantar 10 segundos" onClick={() => skip(10)}><RotateCw className="size-4" /></Button>
      <span className="ml-auto text-xs text-muted-foreground">{sync ? status : "Reproducción individual"}</span>
    </div>
    {playError && <p role="status" className="text-sm text-primary">{playError}</p>}
  </section>;
}