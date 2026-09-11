//#region node_modules/.nitro/vite/services/ssr/assets/romance-Dmd8xZIU.js
var MOODS = [
	{
		emoji: "😍",
		label: "Enamorado"
	},
	{
		emoji: "😊",
		label: "Feliz"
	},
	{
		emoji: "🥹",
		label: "Te extraño"
	},
	{
		emoji: "😴",
		label: "Cansado"
	},
	{
		emoji: "😋",
		label: "Con antojo"
	},
	{
		emoji: "😤",
		label: "Estresado"
	},
	{
		emoji: "🤒",
		label: "Malito"
	},
	{
		emoji: "🤗",
		label: "Necesito un abrazo"
	}
];
var CHALLENGE_IDEAS = [
	{
		title: "Foto del día",
		description: "Manda una foto de lo que estás viendo ahora mismo."
	},
	{
		title: "Tres cosas que amo de ti",
		description: "Escríbelas en una nota y mándalas."
	},
	{
		title: "Canción dedicada",
		description: "Agrega una canción a nuestra playlist y di por qué."
	},
	{
		title: "Cita sorpresa",
		description: "Propón un plan para esta semana en el calendario."
	},
	{
		title: "Recuerdo favorito",
		description: "Cuenta un recuerdo nuestro que te haga sonreír."
	},
	{
		title: "Buenos días bonitos",
		description: "Sé el primero en dar los buenos días."
	},
	{
		title: "Audio de voz",
		description: "Manda un audio diciendo algo lindo."
	},
	{
		title: "Carta del futuro",
		description: "Guarda una cápsula del tiempo para abrir en un mes."
	}
];
/** Saludo según la hora del día. */
function greeting(name) {
	const h = (/* @__PURE__ */ new Date()).getHours();
	const base = h < 6 ? "Buenas noches" : h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
	return name ? `${base}, ${name}` : base;
}
/** Días que faltan para el próximo aniversario (mismo día y mes). */
function daysToAnniversary(anniversary) {
	if (!anniversary) return null;
	const base = /* @__PURE__ */ new Date(`${anniversary}T00:00:00`);
	if (Number.isNaN(base.getTime())) return null;
	const now = /* @__PURE__ */ new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
	if (next.getTime() < today.getTime()) next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
	return Math.round((next.getTime() - today.getTime()) / 864e5);
}
/** Texto amable con el tiempo que falta para una fecha. */
function timeUntil(iso) {
	const diff = new Date(iso).getTime() - Date.now();
	if (diff <= 0) return "ya se puede abrir";
	const days = Math.floor(diff / 864e5);
	const hours = Math.floor(diff / 36e5) % 24;
	const minutes = Math.floor(diff / 6e4) % 60;
	if (days > 0) return `en ${days} ${days === 1 ? "día" : "días"} y ${hours} h`;
	if (hours > 0) return `en ${hours} h ${minutes} min`;
	return `en ${Math.max(1, minutes)} min`;
}
//#endregion
export { timeUntil as a, greeting as i, MOODS as n, daysToAnniversary as r, CHALLENGE_IDEAS as t };
