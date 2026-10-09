CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  ingredients text,
  steps text,
  minutes int,
  difficulty text NOT NULL DEFAULT 'facil',
  favorite boolean NOT NULL DEFAULT false,
  cooked_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_select" ON public.recipes FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "recipes_insert" ON public.recipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update" ON public.recipes FOR UPDATE TO authenticated USING (public.same_space(user_id));
CREATE POLICY "recipes_delete" ON public.recipes FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;