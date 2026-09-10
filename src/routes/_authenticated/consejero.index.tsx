import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartHandshake, MessageCircleHeart, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { ADVISOR_STARTERS, threadTitleFrom } from "@/lib/advisor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/consejero/")({
  head: () => ({
    meta: [
      { title: "Consejero — Nuestro Espacio" },
      {
        name: "description",
        content:
          "Cuéntale lo que pasa entre ustedes y recibe consejos pensados para su relación, no frases genéricas.",
      },
      { property: "og:title", content: "Consejero — Nuestro Espacio" },
      { property: "og:description", content: "Un consejero de pareja que los conoce." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsejeroIndex,
});

type Thread = {
  id: string;
  user_id: string;
  title: string;
  is_shared: boolean;
  updated_at: string;
};

function ConsejeroIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  useRealtime("advisor_threads");

  const { data: threads } = useQuery({
    queryKey: ["advisor-threads"],
    queryFn: async (): Promise<Thread[]> => {
      const { data, error } = await supabase
        .from("advisor_threads")
        .select("id, user_id, title, is_shared, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (first?: string) => {
      if (!user) throw new Error("Sin sesión");
      const { data, error } = await supabase
        .from("advisor_threads")
        .insert({ user_id: user.id, title: first ? threadTitleFrom(first) : "Nueva conversación" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id, first) => {
      qc.invalidateQueries({ queryKey: ["advisor-threads"] });
      navigate({
        to: "/consejero/$id",
        params: { id },
        ...(first ? { search: { inicio: first } } : {}),
      });
    },
    onError: () => toast.error("No se pudo abrir la conversación"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("advisor_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["advisor-threads"] }),
    onError: () => toast.error("No se pudo borrar"),
  });

  return (
    <div className="space-y-8">
      <section className="surface warm-gradient animate-fade-up p-8 text-center">
        <HeartHandshake className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Consejero</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Cuéntale lo que está pasando entre ustedes —una pelea, un mal día, ganas de
          sorprenderla— y te da consejos pensados para su relación. También puede escribir notas,
          agendar planes o avisarle a tu amor.
        </p>
        <Button
          className="mt-6 rounded-full"
          disabled={create.isPending}
          onClick={() => create.mutate(undefined)}
        >
          <Plus className="mr-1 size-4" /> Cuéntame cómo te sientes
        </Button>
      </section>

      <section className="surface p-6">
        <h2 className="font-display text-lg font-semibold">Para empezar</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ADVISOR_STARTERS.map((s) => (
            <button
              key={s}
              disabled={create.isPending}
              onClick={() => create.mutate(s)}
              className="rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="font-display text-lg font-semibold">Sus conversaciones</h2>
        {threads?.length ? (
          <ul className="mt-4 divide-y divide-border/60">
            {threads.map((t) => (
              <li key={t.id} className="flex items-center gap-2 py-2">
                <Link
                  to="/consejero/$id"
                  params={{ id: t.id }}
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
                >
                  <MessageCircleHeart className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.title}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {new Date(t.updated_at).toLocaleString("es", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {t.is_shared && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Users className="size-3" /> Compartida
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
                {t.user_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Borrar conversación"
                    onClick={() => remove.mutate(t.id)}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Todavía no hay charlas. Empieza contándole cómo te sientes hoy.
          </p>
        )}
      </section>
    </div>
  );
}
