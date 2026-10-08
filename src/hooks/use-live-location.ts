import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSharingLocation, type Profile } from "@/hooks/use-profiles";

/** Follow an existing sharing choice throughout the authenticated app. */
export function useLiveLocation(profile: Profile | null | undefined) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const userId = profile?.id;
  const until = profile?.location_shares_until;
  const enabled = isSharingLocation(profile);

  useEffect(() => {
    setError(null);
    if (!enabled || !userId) return;
    if (!("geolocation" in navigator)) {
      setError("Este dispositivo no permite actualizar tu ubicación.");
      return;
    }
    let active = true;
    let watch: number | undefined;
    let busy = false;
    let lastSaved = 0;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      active = false;
      if (watch !== undefined) navigator.geolocation.clearWatch(watch);
      watch = undefined;
    };
    const expired = () => !!until && Date.parse(until) <= Date.now();
    const save = async (position: GeolocationPosition) => {
      if (!active || busy || document.visibilityState !== "visible") return;
      if (expired()) { stop(); return; }
      if (Date.now() - lastSaved < 10_000) return;
      busy = true;
      try {
        let request = supabase.from("profiles").update({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy,
          location_updated_at: new Date().toISOString(),
        }).eq("id", userId).not("latitude", "is", null);
        request = until ? request.eq("location_shares_until", until) : request.is("location_shares_until", null);
        const { error: saveError } = await request;
        if (!active) return;
        if (saveError) {
          setError("No se pudo actualizar tu ubicación. Reintentaremos automáticamente.");
          return;
        }
        lastSaved = Date.now();
        setError(null);
        void qc.invalidateQueries({ queryKey: ["profiles"] });
      } catch {
        if (active) setError("Sin conexión. Reintentaremos actualizar la ubicación.");
      } finally { busy = false; }
    };
    const start = () => {
      if (!active || expired() || document.visibilityState !== "visible" || watch !== undefined) return;
      watch = navigator.geolocation.watchPosition((position) => { void save(position); }, (issue) => {
        if (!active) return;
        setError(issue.code === 1
          ? "Permite el acceso a tu ubicación para compartirla en vivo."
          : "No hay señal de ubicación. Esperando una nueva posición…");
      }, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 10_000 });
    };
    const resume = () => {
      if (document.visibilityState === "hidden") {
        if (watch !== undefined) navigator.geolocation.clearWatch(watch);
        watch = undefined;
      } else { lastSaved = 0; start(); }
    };
    start();
    if (until) expiry = setTimeout(() => {
      stop();
      void qc.invalidateQueries({ queryKey: ["profiles"] });
    }, Math.min(Math.max(0, Date.parse(until) - Date.now()), 2_147_483_647));
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      stop();
      if (expiry) clearTimeout(expiry);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [enabled, userId, until, qc]);

  return error;
}