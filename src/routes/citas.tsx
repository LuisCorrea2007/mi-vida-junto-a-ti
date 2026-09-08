import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/citas")({
  beforeLoad: () => {
    throw redirect({ to: "/calendario" });
  },
});
