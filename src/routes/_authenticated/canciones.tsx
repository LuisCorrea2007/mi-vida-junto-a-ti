import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Music, Plus, Quote as QuoteIcon, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { REACTIONS } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/canciones")({
  head: () => ({
    meta: [
      { title: "Nuestras canciones — Nuestro Espacio" },
      { name: "description", content: "La playlist de los dos y las frases que nos encantan." },
      { property: "og:title", content: "Nuestras canciones — Nuestro Espacio" },
      { property: "og:description", content: "Canciones y frases favoritas de la pareja." },
    ],
  }),
  component: CancionesPage,
});

type Song = {
  id: string;
  user_id: string;
  title: string;
  artist: string | null;
  url: string | null;
  note: string | null;
  is_favorite: boolean;
  created_at: string;
};
type SongReaction = { id: string; song_id: string; user_id: string; reaction_type: string };
type QuoteRow = { id: string; user_id: string; content: string; author: string | null; created_at: string };

function CancionesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("songs", "song_reactions", "quotes");

  const [songOpen, setSongOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const { data: songs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async (): Promise<Song[]> => {
      const { data, error } = await supabase
        .from("songs")
        .select("id, user_id, title, artist, url, note, is_favorite, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ["song_reactions"],
    queryFn: async (): Promise<SongReaction[]> => {
      const { data, error } = await supabase
        .from("song_reactions")
        .select("id, song_id, user_id, reaction_type");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: async (): Promise<QuoteRow[]> => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, user_id, content, author, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addSong = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim()) throw new Error("Falta el nombre de la canción");
      const { error } = await supabase.from("songs").insert({
        user_id: user.id,
        title: title.trim(),
        artist: artist.trim() || null,
        url: url.trim() || null,
        note: note.trim() || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "cancion",
          title: "Te dediqué una canción 🎵",
          message: `${title.trim()}${artist.trim() ? ` — ${artist.trim()}` : ""}`,
          link: "/canciones",
        });
      }
    },
    onSuccess: () => {
      setSongOpen(false);
      setTitle("");
      setArtist("");
      setUrl("");
      setNote("");
      burst(10);
      toast.success("Canción añadida");
      qc.invalidateQueries({ queryKey: ["songs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const favorite = useMutation({
    mutationFn: async (song: Song) => {
      const { error } = await supabase
        .from("songs")
        .update({ is_favorite: !song.is_favorite })
        .eq("id", song.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
    onError: () => toast.error("Solo puedes destacar las canciones que subiste tú"),
  });

  const removeSong = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const react = useMutation({
    mutationFn: async ({ song, type }: { song: Song; type: string }) => {
      if (!user) throw new Error("Inicia sesión");
      const mine = reactions.find(
        (r) => r.song_id === song.id && r.user_id === user.id && r.reaction_type === type,
      );
      if (mine) {
        const { error } = await supabase.from("song_reactions").delete().eq("id", mine.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("song_reactions")
        .insert({ song_id: song.id, user_id: user.id, reaction_type: type });
      if (error) throw error;
      if (couple?.partnerId && song.user_id !== user.id) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "cancion",
          title: "Reaccionó a tu canción",
          message: song.title,
          link: "/canciones",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["song_reactions"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const addQuote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!quote.trim()) throw new Error("Escribe la frase");
      const { error } = await supabase.from("quotes").insert({
        user_id: user.id,
        content: quote.trim(),
        author: author.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setQuote("");
      setAuthor("");
      toast.success("Frase guardada");
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeQuote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Nuestra banda sonora</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Canciones y frases</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Guarden las canciones que les recuerdan al otro y las frases que quieren releer siempre.
        </p>
        <Dialog open={songOpen} onOpenChange={setSongOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Añadir canción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva canción</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">Canción</Label>
                <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-artist">Artista</Label>
                <Input id="s-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-url">Enlace (Spotify o YouTube)</Label>
                <Input
                  id="s-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-note">¿Por qué es especial?</Label>
                <Textarea id="s-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={addSong.isPending}
                onClick={() => addSong.mutate()}
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Nuestra playlist</h2>
        {songs.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {songs.map((s) => (
              <li key={s.id} id={s.id} className="surface p-5">
                <div className="flex items-start gap-3">
                  <Music className="mt-1 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{s.title}</p>
                    {s.artist && <p className="text-sm text-muted-foreground">{s.artist}</p>}
                    {s.note && <p className="mt-2 text-sm">{s.note}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Agregada por {nameOf(s.user_id)}
                    </p>
                  </div>
                  <button
                    onClick={() => favorite.mutate(s)}
                    aria-label="Destacar canción"
                    className="shrink-0"
                  >
                    <Star
                      className={cn(
                        "size-4",
                        s.is_favorite ? "fill-primary text-primary" : "text-muted-foreground",
                      )}
                    />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-1">
                  {REACTIONS.map((r) => {
                    const list = reactions.filter(
                      (x) => x.song_id === s.id && x.reaction_type === r.type,
                    );
                    const mine = list.some((x) => x.user_id === user?.id);
                    return (
                      <button
                        key={r.type}
                        title={r.label}
                        onClick={() => react.mutate({ song: s, type: r.type })}
                        className={cn(
                          "rounded-full px-2 py-1 text-sm transition-colors hover:bg-accent",
                          mine && "bg-primary/15",
                        )}
                      >
                        {r.emoji}
                        {list.length > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">{list.length}</span>
                        )}
                      </button>
                    );
                  })}
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Escuchar <ExternalLink className="size-3" />
                    </a>
                  )}
                  {s.user_id === user?.id && (
                    <button
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      aria-label="Borrar canción"
                      onClick={() => removeSong.mutate(s.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="surface p-8 text-center text-sm text-muted-foreground">
            Añadan la primera canción de los dos.
          </p>
        )}
      </section>

      <section className="surface p-6">
        <h2 className="font-display text-xl font-semibold">Frases favoritas</h2>
        <div className="mt-4 space-y-3">
          <Textarea
            rows={2}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Una frase que quieras recordar siempre..."
          />
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-xs"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="¿De quién es? (opcional)"
            />
            <Button
              className="rounded-full"
              disabled={addQuote.isPending}
              onClick={() => addQuote.mutate()}
            >
              Guardar frase
            </Button>
          </div>
        </div>
        {quotes.length > 0 && (
          <ul className="mt-6 space-y-3">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                <QuoteIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm italic">“{q.content}”</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.author ? `${q.author} · ` : ""}guardada por {nameOf(q.user_id)}
                  </p>
                </div>
                {q.user_id === user?.id && (
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Borrar frase"
                    onClick={() => removeQuote.mutate(q.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
