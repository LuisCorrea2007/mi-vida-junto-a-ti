export type Option = { value: string; label: string };

export const NOTE_CATEGORIES: Option[] = [
  { value: "amor", label: "Amor" },
  { value: "recuerdo", label: "Recuerdo" },
  { value: "plan", label: "Plan" },
  { value: "gracias", label: "Gracias" },
  { value: "perdon", label: "Perdón" },
  { value: "otro", label: "Otro" },
];

export const EVENT_CATEGORIES: Option[] = [
  { value: "cita", label: "Cita" },
  { value: "aniversario", label: "Aniversario" },
  { value: "cumpleanos", label: "Cumpleaños" },
  { value: "viaje", label: "Viaje" },
  { value: "recordatorio", label: "Recordatorio" },
  { value: "otro", label: "Otro" },
];

export const WISH_CATEGORIES: Option[] = [
  { value: "viaje", label: "Viaje" },
  { value: "experiencia", label: "Experiencia" },
  { value: "regalo", label: "Regalo" },
  { value: "hogar", label: "Hogar" },
  { value: "meta", label: "Meta" },
  { value: "otro", label: "Otro" },
];

export const REACTIONS: { type: string; emoji: string; label: string }[] = [
  { type: "heart", emoji: "❤️", label: "Me encanta" },
  { type: "kiss", emoji: "😘", label: "Beso" },
  { type: "laugh", emoji: "😂", label: "Me divierte" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "cry", emoji: "🥹", label: "Me emociona" },
  { type: "star", emoji: "⭐", label: "Especial" },
];

export const ROMANTIC_QUOTES: string[] = [
  "Contigo hasta los días normales se sienten especiales.",
  "Mi lugar favorito del mundo es junto a ti.",
  "Cada día te elijo otra vez.",
  "Eres mi casa, aunque estemos lejos.",
  "Amarte es lo más fácil que hago.",
  "Gracias por ser mi calma y mi aventura.",
  "El amor no se mide en tiempo, se mide en momentos como los nuestros.",
];

export const DAILY_QUESTIONS: string[] = [
  "¿Cuál fue el momento más bonito de tu día?",
  "¿Qué te hizo reír hoy?",
  "¿Qué es lo que más extrañas de mí ahora mismo?",
  "¿Qué sueño quieres que cumplamos juntos?",
  "¿Cuál es tu recuerdo favorito de nosotros?",
  "¿Qué canción te recuerda a mí?",
  "¿Qué te gustaría hacer en nuestra próxima cita?",
];

export function labelFor(options: Option[], value?: string | null): string {
  if (!value) return "Sin categoría";
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Elige un elemento estable por día (offset opcional para variar la serie). */
export function pickOfTheDay<T>(items: T[], offset = 0): T | undefined {
  if (!items.length) return undefined;
  const day = Math.floor(Date.now() / 86_400_000);
  return items[(day + offset) % items.length];
}
