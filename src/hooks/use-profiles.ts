import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  anniversary_date: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
};

const COLUMNS =
  "id, name, email, avatar_url, anniversary_date, location, latitude, longitude, location_updated_at";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from("profiles").select(COLUMNS).order("created_at");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export function useMyProfile(userId?: string) {
  return useQuery({
    queryKey: ["profiles", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(COLUMNS)
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
  });
}

/** Fecha de aniversario compartida (la primera definida entre los perfiles). */
export function anniversaryOf(profiles?: Profile[] | null): string | null {
  return profiles?.find((p) => !!p.anniversary_date)?.anniversary_date ?? null;
}
