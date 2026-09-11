//#region node_modules/.nitro/vite/services/ssr/assets/content-IdYYa_dU.js
var NOTE_CATEGORIES = [
	{
		value: "amor",
		label: "Amor"
	},
	{
		value: "recuerdo",
		label: "Recuerdo"
	},
	{
		value: "plan",
		label: "Plan"
	},
	{
		value: "gracias",
		label: "Gracias"
	},
	{
		value: "perdon",
		label: "Perdón"
	},
	{
		value: "otro",
		label: "Otro"
	}
];
var EVENT_CATEGORIES = [
	{
		value: "cita",
		label: "Cita"
	},
	{
		value: "aniversario",
		label: "Aniversario"
	},
	{
		value: "cumpleanos",
		label: "Cumpleaños"
	},
	{
		value: "viaje",
		label: "Viaje"
	},
	{
		value: "recordatorio",
		label: "Recordatorio"
	},
	{
		value: "otro",
		label: "Otro"
	}
];
var WISH_CATEGORIES = [
	{
		value: "viaje",
		label: "Viaje"
	},
	{
		value: "experiencia",
		label: "Experiencia"
	},
	{
		value: "regalo",
		label: "Regalo"
	},
	{
		value: "hogar",
		label: "Hogar"
	},
	{
		value: "meta",
		label: "Meta"
	},
	{
		value: "otro",
		label: "Otro"
	}
];
var REACTIONS = [
	{
		type: "heart",
		emoji: "❤️",
		label: "Me encanta"
	},
	{
		type: "kiss",
		emoji: "😘",
		label: "Beso"
	},
	{
		type: "laugh",
		emoji: "😂",
		label: "Me divierte"
	},
	{
		type: "wow",
		emoji: "😮",
		label: "Wow"
	},
	{
		type: "cry",
		emoji: "🥹",
		label: "Me emociona"
	},
	{
		type: "star",
		emoji: "⭐",
		label: "Especial"
	}
];
var ROMANTIC_QUOTES = [
	"Contigo hasta los días normales se sienten especiales.",
	"Mi lugar favorito del mundo es junto a ti.",
	"Cada día te elijo otra vez.",
	"Eres mi casa, aunque estemos lejos.",
	"Amarte es lo más fácil que hago.",
	"Gracias por ser mi calma y mi aventura.",
	"El amor no se mide en tiempo, se mide en momentos como los nuestros."
];
var DAILY_QUESTIONS = [
	"¿Cuál fue el momento más bonito de tu día?",
	"¿Qué te hizo reír hoy?",
	"¿Qué es lo que más extrañas de mí ahora mismo?",
	"¿Qué sueño quieres que cumplamos juntos?",
	"¿Cuál es tu recuerdo favorito de nosotros?",
	"¿Qué canción te recuerda a mí?",
	"¿Qué te gustaría hacer en nuestra próxima cita?"
];
function labelFor(options, value) {
	if (!value) return "Sin categoría";
	return options.find((o) => o.value === value)?.label ?? value;
}
/** Elige un elemento estable por día (offset opcional para variar la serie). */
function pickOfTheDay(items, offset = 0) {
	if (!items.length) return void 0;
	return items[(Math.floor(Date.now() / 864e5) + offset) % items.length];
}
//#endregion
export { ROMANTIC_QUOTES as a, pickOfTheDay as c, REACTIONS as i, EVENT_CATEGORIES as n, WISH_CATEGORIES as o, NOTE_CATEGORIES as r, labelFor as s, DAILY_QUESTIONS as t };
