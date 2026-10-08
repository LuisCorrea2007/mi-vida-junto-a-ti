import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/citas")({
  head: () => ({ meta: [
    { title: "Citas en pareja — Nuestro Espacio" },
    { name: "description", content: "Sus próximas citas y aniversarios compartidos." },
    { property: "og:title", content: "Citas en pareja — Nuestro Espacio" },
    { property: "og:description", content: "Sus próximas citas y aniversarios compartidos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/calendario" });
  },
});
