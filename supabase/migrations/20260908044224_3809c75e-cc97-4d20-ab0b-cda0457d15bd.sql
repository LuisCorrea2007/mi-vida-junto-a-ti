CREATE OR REPLACE FUNCTION public.enforce_couple_capacity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.couple_members WHERE couple_id = NEW.couple_id) >= 2 THEN
    RAISE EXCEPTION 'Este espacio ya tiene dos personas';
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.enforce_couple_capacity() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER couple_members_capacity BEFORE INSERT ON public.couple_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_couple_capacity();