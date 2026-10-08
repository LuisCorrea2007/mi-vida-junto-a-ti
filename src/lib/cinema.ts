export type CatalogMovie = { id: string; title: string; language: string; license: string };

export function directVideoUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !/\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname + url.search)) {
    throw new Error("Usa un enlace HTTPS directo a un video MP4 o WebM autorizado.");
  }
  return url.href;
}

export async function searchLegalMovies(language: string, search: string): Promise<CatalogMovie[]> {
  const params = new URLSearchParams({
    q: `mediatype:movies AND collection:feature_films AND (licenseurl:"https://creativecommons.org/publicdomain/zero/1.0/" OR licenseurl:"http://creativecommons.org/publicdomain/zero/1.0/" OR licenseurl:"http://creativecommons.org/publicdomain/mark/1.0/" OR licenseurl:"http://creativecommons.org/licenses/publicdomain/" OR licenseurl:"https://creativecommons.org/licenses/by/4.0/") AND (language:${language === "es" ? "spa OR language:Spanish" : "eng OR language:English"})`,
    output: "json", rows: "48", "fl[]": "identifier,title,licenseurl,language",
  });
  const res = await fetch(`https://archive.org/advancedsearch.php?${params}`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error("El catálogo no está disponible en este momento.");
  const json = await res.json() as { response?: { docs?: { identifier: string; title: string; licenseurl: string | string[] }[] } };
  return (json.response?.docs ?? []).map((item) => ({ id: item.identifier, title: item.title, language, license: Array.isArray(item.licenseurl) ? item.licenseurl[0] ?? "" : item.licenseurl })).filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
}

export async function catalogVideo(movie: CatalogMovie): Promise<string> {
  const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(movie.id)}`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error("No se pudo abrir esta película.");
  const json = await res.json() as { metadata?: { licenseurl?: string | string[] }; files?: { name: string; size?: string; source?: string }[] };
  const licenses = [json.metadata?.licenseurl].flat().filter((value): value is string => typeof value === "string");
  if (!licenses.some((value) => /^https?:\/\/creativecommons\.org\/(publicdomain\/(zero\/1\.0|mark\/1\.0)\/?|licenses\/(by\/4\.0|publicdomain)\/)$/i.test(value))) {
    throw new Error("No se pudo confirmar una licencia abierta para esta película.");
  }
  const file = json.files?.filter((item) => /\.mp4$/i.test(item.name)).sort((a, b) => Number(a.size ?? Infinity) - Number(b.size ?? Infinity))[0];
  if (!file) throw new Error("Esta película no dispone de un video compatible.");
  return `https://archive.org/download/${encodeURIComponent(movie.id)}/${file.name.split("/").map(encodeURIComponent).join("/")}`;
}