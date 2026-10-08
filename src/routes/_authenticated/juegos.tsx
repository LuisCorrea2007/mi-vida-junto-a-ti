import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/juegos")({
  beforeLoad: () => { throw redirect({ to: "/panel", replace: true }); },
  head: () => ({ meta: [
    { title: "Nuestro Espacio — Inicio" },
    { name: "description", content: "El espacio privado para compartir recuerdos y planes en pareja." },
    { property: "og:title", content: "Nuestro Espacio — Inicio" },
    { property: "og:description", content: "Recuerdos y planes para los dos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
});
