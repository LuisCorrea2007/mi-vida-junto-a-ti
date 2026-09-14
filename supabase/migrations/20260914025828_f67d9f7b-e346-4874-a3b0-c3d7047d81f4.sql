CREATE TABLE IF NOT EXISTS public.gratitudes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gratitudes TO authenticated;
GRANT ALL ON public.gratitudes TO service_role;

ALTER TABLE public.gratitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gratitudes_select_space" ON public.gratitudes
  FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "gratitudes_insert_own" ON public.gratitudes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gratitudes_update_own" ON public.gratitudes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gratitudes_delete_own" ON public.gratitudes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.gratitudes;