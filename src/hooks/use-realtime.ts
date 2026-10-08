import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RELATED_KEYS: Record<string, string[]> = {
  notes: ["note", "stats"], photos: ["stats", "photo-comments"], events: ["stats"], wishes: ["stats"],
  notifications: ["activity"], couple_members: ["couple", "profiles"],
  private_messages: ["private-messages"], private_message_reactions: ["private-messages"],
  time_capsules: ["time-capsules"], couple_tasks: ["tasks"], couple_goals: ["goals"],
  goal_contributions: ["goals", "goal-contributions"], couple_checkins: ["checkins"], couple_agreements: ["agreements"],
  cinema_movies: ["cinema-movies"],
};

/**
 * Mantiene los datos actualizados en vivo: cuando algo cambia en las tablas
 * indicadas (lo sube o lo edita cualquiera de los dos), se recargan los datos
 * de la pantalla sin tener que refrescar la página.
 */
export function useRealtime(...tables: string[]) {
  const queryClient = useQueryClient();
  const key = tables.slice().sort().join(",");

  useEffect(() => {
    if (!key) return;
    const list = key.split(",");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const pending = new Set<string>();
    let refreshAll = false;
    const refresh = (table?: string) => {
      if (table) {
        pending.add(table);
        pending.add(table.replaceAll("_", "-"));
        for (const related of RELATED_KEYS[table] ?? []) pending.add(related);
      } else refreshAll = true;
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        const all = refreshAll;
        const keys = new Set(pending);
        pending.clear(); refreshAll = false;
        void queryClient.invalidateQueries({ predicate: (query) => all || keys.has(String(query.queryKey[0])) });
      }, 250);
    };
    const resume = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const channel = supabase.channel(`rt:${crypto.randomUUID()}`);
    for (const table of list) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        refresh(table);
      });
    }
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") refresh();
    });
    const reconnect = () => refresh();
    window.addEventListener("online", reconnect);
    document.addEventListener("visibilitychange", resume);
    const fallback = setInterval(resume, 60_000);
    return () => {
      supabase.removeChannel(channel);
      if (timer) clearTimeout(timer);
      clearInterval(fallback);
      window.removeEventListener("online", reconnect);
      document.removeEventListener("visibilitychange", resume);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, queryClient]);
}
