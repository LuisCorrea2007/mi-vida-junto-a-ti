import { useSyncExternalStore } from "react";
import { Music, X } from "lucide-react";

type Track = { title: string; artist?: string | null; embed: string };
let current: Track | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Convierte un enlace de YouTube o Spotify en un reproductor que sigue sonando al navegar. */
export function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\.|^music\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    if (host === "youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (host === "open.spotify.com") {
      const m = u.pathname.match(/\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
      return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
    }
  } catch { /* enlace inválido */ }
  return null;
}

export function playTrack(t: Track | null) { current = t; emit(); }

export function MusicPlayer() {
  const track = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => current,
    () => null,
  );
  if (!track) return null;
  return (
    <div className="surface animate-fade-up fixed bottom-24 right-3 z-50 w-[min(340px,calc(100vw-1.5rem))] overflow-hidden p-2 lg:bottom-6">
      <div className="flex items-center gap-2 px-1 pb-2">
        <Music className="size-4 shrink-0 text-primary animate-heartbeat" />
        <p className="min-w-0 flex-1 truncate text-sm"><span className="font-semibold">{track.title}</span>{track.artist ? ` · ${track.artist}` : ""}</p>
        <button aria-label="Cerrar reproductor" onClick={() => playTrack(null)} className="press rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
      </div>
      <iframe title={track.title} src={track.embed} className="h-[152px] w-full rounded-xl border-0" allow="autoplay; encrypted-media; clipboard-write" />
    </div>
  );
}
