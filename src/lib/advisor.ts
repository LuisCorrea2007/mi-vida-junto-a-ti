/** Textos y ayudas del Consejero de pareja. */

export const ADVISOR_STARTERS = [
  "Peleamos hoy y no sé qué hacer",
  "Quiero sorprenderla con algo bonito",
  "Necesito un consejo para nosotros",
  "Ayúdame a pedir perdón",
  "Cuéntame cómo estar más cerca hoy",
] as const;

export const ADVISOR_TIPS = [
  "Pregúntale hoy cómo se siente de verdad, y escucha sin resolver nada.",
  "Manda un mensaje recordando el momento exacto en que supiste que era ella.",
  "Dediquen quince minutos sin celular, solo para hablar de ustedes.",
  "Agradécele algo pequeño que hizo esta semana y que nadie más notó.",
  "Escriban juntos un plan para el próximo mes, aunque sea sencillo.",
  "Si algo te dolió, dilo desde lo que sentiste, no desde lo que hizo.",
  "Guarda una cápsula del tiempo con lo que más amas de ella hoy.",
] as const;

/** Etiqueta cariñosa para cada acción que puede hacer el Consejero. */
export const TOOL_LABELS: Record<string, string> = {
  crear_nota: "Escribiendo una nota",
  crear_dedicatoria: "Escribiendo una dedicatoria",
  agendar_evento: "Agendando un plan",
  crear_capsula: "Sellando una cápsula del tiempo",
  crear_reto: "Creando un reto",
  agregar_cancion: "Agregando una canción",
  agregar_frase: "Guardando una frase",
  registrar_animo: "Registrando tu ánimo",
  avisar_pareja: "Avisando a tu pareja",
};

export function toolLabel(type: string) {
  const name = type.replace(/^tool-/, "");
  return TOOL_LABELS[name] ?? name.replace(/_/g, " ");
}

/** Título automático de la charla a partir del primer mensaje. */
export function threadTitleFrom(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Nueva conversación";
  return clean.length > 56 ? `${clean.slice(0, 56)}…` : clean;
}
