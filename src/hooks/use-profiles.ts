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
  location_shares_until: string | null;
};

const COLUMNS =
  "id, name, email, avatar_url, anniversary_date, location, latitude, longitude, location_updated_at, location_shares_until";

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
      if (data) return data as Profile;

      // Si la cuenta aún no tiene perfil, lo creamos para que se puedan guardar los datos.
      const { data: auth } = await supabase.auth.getUser();
      const u = auth.user;
      if (!u || u.id !== userId) return null;
      const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>;
      const name = meta["name"] || meta["full_name"] || u.email?.split("@")[0] || "";
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .upsert({ id: u.id, email: u.email ?? null, name }, { onConflict: "id" })
        .select(COLUMNS)
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
}

/** ¿La ubicación de este perfil sigue compartida? */
export function isSharingLocation(p?: Profile | null): boolean {
  if (!p || p.latitude == null || p.longitude == null) return false;
  if (!p.location_shares_until) return true;
  return new Date(p.location_shares_until).getTime() > Date.now();
}

/** Fecha de aniversario compartida (la primera definida entre los perfiles). */
export function anniversaryOf(profiles?: Profile[] | null): string | null {
  return profiles?.find((p) => !!p.anniversary_date)?.anniversary_date ?? null;
}
