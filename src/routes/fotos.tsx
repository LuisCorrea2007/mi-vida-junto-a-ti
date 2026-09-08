import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fotos")({
  beforeLoad: () => {
    throw redirect({ to: "/galeria" });
  },
});
