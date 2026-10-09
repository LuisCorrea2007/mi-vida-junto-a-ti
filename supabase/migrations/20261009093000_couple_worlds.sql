-- Shared pixel garden: one document per authenticated couple.
CREATE TABLE IF NOT EXISTS public.couple_worlds (
  couple_id uuid PRIMARY KEY REFERENCES public.couples(id) ON DELETE CASCADE,
  world jsonb NOT NULL DEFAULT '{"name":"Nuestro jardín","furniture":{}}'::jsonb,
  updated_by uuid NOT NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT world_document_size CHECK (octet_length(world::text) <= 30000)
);
ALTER TABLE public.couple_worlds ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.couple_worlds TO authenticated;
CREATE POLICY "couple_world_select" ON public.couple_worlds FOR SELECT TO authenticated USING (couple_id = public.my_couple_id());
CREATE POLICY "couple_world_insert" ON public.couple_worlds FOR INSERT TO authenticated WITH CHECK (couple_id = public.my_couple_id() AND updated_by = auth.uid());
CREATE POLICY "couple_world_update" ON public.couple_worlds FOR UPDATE TO authenticated USING (couple_id = public.my_couple_id()) WITH CHECK (couple_id = public.my_couple_id() AND updated_by = auth.uid());
CREATE OR REPLACE FUNCTION public.touch_couple_world() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.touch_couple_world() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER couple_world_touch BEFORE UPDATE ON public.couple_worlds FOR EACH ROW EXECUTE FUNCTION public.touch_couple_world();
