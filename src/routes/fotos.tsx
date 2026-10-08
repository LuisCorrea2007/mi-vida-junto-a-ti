import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fotos")({
  head: () => ({ meta: [
    { title: "Fotos de los dos — Nuestro Espacio" },
    { name: "description", content: "Sus fotos y recuerdos en una galería privada." },
    { property: "og:title", content: "Fotos de los dos — Nuestro Espacio" },
    { property: "og:description", content: "Sus fotos y recuerdos en una galería privada." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/galeria" });
  },
});
