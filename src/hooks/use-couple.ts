import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CoupleState = {
  coupleId: string | null;
  partnerId: string | null;
};

/** Espacio compartido de la pareja: su id sirve como código de invitación. */
export function useCouple(userId?: string) {
  return useQuery({
    queryKey: ["couple", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CoupleState> => {
      const { data, error } = await supabase
        .from("couple_members")
        .select("couple_id, user_id");
      if (error) throw error;
      const rows = data ?? [];
      const mine = rows.find((r) => r.user_id === userId);
      if (!mine) return { coupleId: null, partnerId: null };
      const partner = rows.find((r) => r.couple_id === mine.couple_id && r.user_id !== userId);
      return { coupleId: mine.couple_id, partnerId: partner?.user_id ?? null };
    },
  });
}
