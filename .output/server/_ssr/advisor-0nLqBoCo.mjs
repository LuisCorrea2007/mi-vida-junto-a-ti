//#region node_modules/.nitro/vite/services/ssr/assets/advisor-0nLqBoCo.js
/** Textos y ayudas del Consejero de pareja. */
var ADVISOR_STARTERS = [
	"Peleamos hoy y no sé qué hacer",
	"Quiero sorprenderla con algo bonito",
	"Necesito un consejo para nosotros",
	"Ayúdame a pedir perdón",
	"Cuéntame cómo estar más cerca hoy"
];
/** Título automático de la charla a partir del primer mensaje. */
function threadTitleFrom(text) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (!clean) return "Nueva conversación";
	return clean.length > 56 ? `${clean.slice(0, 56)}…` : clean;
}
//#endregion
export { threadTitleFrom as n, ADVISOR_STARTERS as t };
