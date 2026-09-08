import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mantiene los datos actualizados en vivo: cuando algo cambia en las tablas
 * indicadas (lo sube o lo edita cualquiera de los dos), se recargan los datos
 * de la pantalla sin tener que refrescar la página.
 */
export function useRealtime(...tables: string[]) {
  const queryClient = useQueryClient();
  const key = tables.slice().sort().join(",");
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!key) return;
    const list = key.split(",");
    const channel = supabase.channel(`rt:${key}`);
    for (const table of list) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries();
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, queryClient]);
}
