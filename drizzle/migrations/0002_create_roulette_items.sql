CREATE TABLE public.roulette_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL DEFAULT 'cita',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.roulette_items TO authenticated;
GRANT ALL ON public.roulette_items TO service_role;
ALTER TABLE public.roulette_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read same space" ON public.roulette_items FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "insert own" ON public.roulette_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own" ON public.roulette_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.roulette_items;