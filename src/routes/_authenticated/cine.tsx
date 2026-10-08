import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clapperboard, Heart, Play, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import cinemaImage from "@/assets/cinema.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { CinemaPlayer, type CinemaMovie } from "@/components/cinema-player";
import { catalogVideo, directVideoUrl, searchLegalMovies, type CatalogMovie } from "@/lib/cinema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/cine")({
  head: () => ({ meta: [
    { title: "Cine en pareja — Nuestro Espacio" },
    { name: "description", content: "Su biblioteca privada de películas autorizadas con reproducción compartida, favoritos e idiomas disponibles." },
    { property: "og:title", content: "Cine en pareja — Nuestro Espacio" },
    { property: "og:description", content: "Una noche de películas para los dos, con una sala de reproducción compartida." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: CinemaPage,
});

function CinemaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<CinemaMovie | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [es, setEs] = useState("");
  const [en, setEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("library");
  const [catalogLanguage, setCatalogLanguage] = useState("es");
  useRealtime("cinema_movies");
  const { data: movies = [], isPending, error } = useQuery({ queryKey: ["cinema-movies"], queryFn: async () => {
    const { data, error } = await supabase.from("cinema_movies").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as CinemaMovie[];
  } });
  const catalog = useQuery({ queryKey: ["legal-movies", catalogLanguage], enabled: tab === "catalog", retry: false, staleTime: 30 * 60_000, queryFn: () => searchLegalMovies(catalogLanguage, "") });
  const filtered = movies.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || filter === "favorite" && movie.is_favorite || filter === "pending" && !movie.watched || filter === "watched" && movie.watched));
  async function save(file?: File) {
    if (!user || busy) return;
    setBusy(true);
    let path: string | null = null;
    try {
      if (file && (!/video\/(mp4|webm|ogg)/.test(file.type) || file.size > 50 * 1024 * 1024)) throw new Error("Usa MP4 o WebM de hasta 50 MB; para películas largas, añade un enlace autorizado.");
      const movieTitle = (title.trim() || file?.name.replace(/\.[^.]+$/, "") || "").slice(0, 160);
      if (!movieTitle) throw new Error("Escribe el título de la película.");
      const sourceEs = es.trim() ? directVideoUrl(es.trim()) : null;
      const sourceEn = en.trim() ? directVideoUrl(en.trim()) : null;
      if (!file && !sourceEs && !sourceEn) throw new Error("Añade al menos un enlace de video.");
      if (file) {
        path = `${user.id}/${crypto.randomUUID()}.${file.type === "video/webm" ? "webm" : file.type === "video/ogg" ? "ogg" : "mp4"}`;
        const { error } = await supabase.storage.from("cinema").upload(path, file, { contentType: file.type });
        if (error) throw error;
      }
      const { error } = await supabase.from("cinema_movies").insert({ user_id: user.id, title: movieTitle, source_es: sourceEs, source_en: sourceEn, file_path: path });
      if (error) throw error;
      void qc.invalidateQueries({ queryKey: ["cinema-movies"] });
      setAdding(false); setTitle(""); setEs(""); setEn(""); toast.success("Película añadida a su biblioteca");
    } catch (error) {
      if (path) await supabase.storage.from("cinema").remove([path]);
      toast.error(error instanceof Error ? error.message : "No se pudo añadir la película.");
    } finally { setBusy(false); if (fileInput.current) fileInput.current.value = ""; }
  }
  async function addCatalog(movie: CatalogMovie) {
    if (!user || busy) return;
    setBusy(true);
    try {
      const source = await catalogVideo(movie);
      const { error } = await supabase.from("cinema_movies").insert({ user_id: user.id, title: movie.title.slice(0,160), source_es: movie.language === "es" ? source : null, source_en: movie.language === "en" ? source : null });
      if (error) throw error;
      void qc.invalidateQueries({ queryKey: ["cinema-movies"] }); toast.success("Añadida a su biblioteca");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo añadir."); } finally { setBusy(false); }
  }
  async function change(movie: CinemaMovie, updates: { watched?: boolean; is_favorite?: boolean }) {
    const { error } = await supabase.from("cinema_movies").update(updates).eq("id", movie.id);
    if (error) toast.error("No se pudo guardar el cambio."); else void qc.invalidateQueries({ queryKey: ["cinema-movies"] });
  }
  async function remove(movie: CinemaMovie) {
    if (!window.confirm(`¿Eliminar «${movie.title}» de su biblioteca?`)) return;
    const { error } = await supabase.from("cinema_movies").delete().eq("id", movie.id);
    if (error) { toast.error("No se pudo eliminar."); return; }
    if (movie.file_path) await supabase.storage.from("cinema").remove([movie.file_path]);
    void qc.invalidateQueries({ queryKey: ["cinema-movies"] });
  }
  return <div className="space-y-6">
    <header className="relative flex min-h-64 items-end overflow-hidden rounded-lg">
      <img src={cinemaImage} width={1536} height={1024} alt="Una sala de cine íntima para dos" className="absolute inset-0 size-full object-cover" />
      <div className="relative m-4 bg-background/85 p-4 backdrop-blur-sm sm:m-6">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold"><Clapperboard className="size-7 text-primary" /> Cine en pareja</h1>
        <p className="mt-2 text-sm text-muted-foreground">Nuestra próxima noche de películas.</p>
      </div>
    </header>
    {selected && user && <div className="space-y-3 border-b border-border pb-6"><div className="flex justify-end"><Button variant="ghost" size="icon" aria-label="Cerrar película" onClick={() => setSelected(null)}><X className="size-4" /></Button></div><CinemaPlayer key={selected.id} movie={selected} userId={user.id} /><Button asChild variant="outline" size="sm"><Link to="/mensajes">Conversar con tu pareja</Link></Button></div>}
    <div className="flex flex-wrap items-center gap-2"><Button variant={tab === "library" ? "default" : "outline"} onClick={() => setTab("library")}>Nuestra biblioteca ({movies.length})</Button><Button variant={tab === "catalog" ? "default" : "outline"} onClick={() => setTab("catalog")}>Catálogo abierto</Button><Button className="sm:ml-auto" onClick={() => setAdding(!adding)}><Plus className="size-4" /> Añadir película</Button></div>
    {adding && <form className="grid gap-3 border-y border-border py-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <label className="space-y-1 text-sm sm:col-span-2">Título<Input maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className="space-y-1 text-sm">Video en español<Input type="url" placeholder="https://…/pelicula.mp4" value={es} onChange={(event) => setEs(event.target.value)} /></label>
      <label className="space-y-1 text-sm">Video en inglés<Input type="url" placeholder="https://…/movie.mp4" value={en} onChange={(event) => setEn(event.target.value)} /></label>
      <p className="text-xs text-muted-foreground sm:col-span-2">Solo archivos propios o con permiso. Cada idioma requiere su versión disponible; no se traduce ni dobla automáticamente.</p>
      <div className="flex flex-wrap gap-2 sm:col-span-2"><Button type="submit" disabled={busy}>Guardar enlaces</Button><Button type="button" variant="outline" disabled={busy} onClick={() => fileInput.current?.click()}><Upload className="size-4" /> Subir video (máx. 50 MB)</Button></div>
      <input ref={fileInput} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void save(file); }} />
      {busy && <p role="status" className="text-sm text-primary">Guardando…</p>}
    </form>}
    <div className="flex flex-wrap gap-3"><Input aria-label="Buscar película" placeholder="Buscar película…" value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1" />{tab === "library" ? <select aria-label="Filtrar películas" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 text-sm"><option value="all">Todas</option><option value="favorite">Favoritas</option><option value="pending">Por ver</option><option value="watched">Vistas</option></select> : <select aria-label="Idioma del catálogo" value={catalogLanguage} onChange={(event) => setCatalogLanguage(event.target.value)} className="rounded-lg border border-border bg-background px-3 text-sm"><option value="es">Español</option><option value="en">English</option></select>}</div>
    {tab === "library" ? <>
      {isPending && <p className="text-sm text-muted-foreground">Cargando su biblioteca…</p>}{error && <p role="alert" className="text-sm text-primary">No se pudo cargar la biblioteca.</p>}
      {!isPending && !error && filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">{movies.length ? "No hay películas con estos filtros." : "Aún no han elegido su primera película."}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((movie) => <article key={movie.id} className="space-y-3 rounded-lg border border-border bg-card p-4"><Clapperboard className="size-7 text-primary" /><h2 className="break-words font-display text-lg font-semibold">{movie.title}</h2><p className="text-xs text-muted-foreground">{movie.watched ? "Vista" : "Por ver"} · {[movie.source_es && "Español", movie.source_en && "English", movie.file_path && "Archivo propio"].filter(Boolean).join(" · ")}</p><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setSelected(movie)}><Play className="size-4" /> Ver juntos</Button>{movie.user_id === user?.id && <><Button variant="ghost" size="icon" aria-label={movie.is_favorite ? "Quitar favorita" : "Guardar favorita"} onClick={() => void change(movie, { is_favorite: !movie.is_favorite })}><Heart className={movie.is_favorite ? "size-4 fill-primary text-primary" : "size-4"} /></Button><Button size="sm" variant="outline" onClick={() => void change(movie, { watched: !movie.watched })}>{movie.watched ? "Por ver" : "Marcar vista"}</Button><Button size="icon" variant="ghost" aria-label="Eliminar película" onClick={() => void remove(movie)}><Trash2 className="size-4" /></Button></>}</div></article>)}</div>
    </> : <>
      <p className="text-xs text-muted-foreground">Internet Archive · Obras con licencia abierta declarada. El idioma indicado puede corresponder al audio o a subtítulos. La disponibilidad y los derechos varían por país; no incluye un catálogo de estrenos comerciales.</p>
      {catalog.isFetching && <p role="status">Consultando catálogo…</p>}{catalog.error && <p role="alert" className="text-sm text-primary">El catálogo no está disponible. Puedes añadir tus propios videos o reintentar. <Button variant="outline" size="sm" onClick={() => void catalog.refetch()}>Reintentar</Button></p>}
      {!catalog.isFetching && !catalog.error && !catalog.data?.length && <p className="py-6 text-sm text-muted-foreground">No encontramos películas con licencia abierta en este idioma. Prueba English o añade una fuente autorizada.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{catalog.data?.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase())).map((movie) => <article key={movie.id} className="space-y-3 rounded-lg border border-border bg-card p-4"><Clapperboard className="size-6 text-primary" /><h2 className="break-words font-semibold">{movie.title}</h2><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={() => void addCatalog(movie)}><Plus className="size-4" /> Añadir</Button><a className="text-xs text-primary underline" href={`https://archive.org/details/${encodeURIComponent(movie.id)}`} target="_blank" rel="noopener noreferrer">Fuente y licencia</a></div></article>)}</div>
    </>}
  </div>;
}