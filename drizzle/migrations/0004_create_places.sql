CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text,
  note text,
  kind text NOT NULL DEFAULT 'restaurante',
  visited boolean NOT NULL DEFAULT false,
  rating integer,
  visited_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Couple can view places" ON public.places FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "Users insert own places" ON public.places FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Couple can update places" ON public.places FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "Users delete own places" ON public.places FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.places;