CREATE TABLE public.compliments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliments TO authenticated;
GRANT ALL ON public.compliments TO service_role;

ALTER TABLE public.compliments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can read compliments"
  ON public.compliments FOR SELECT TO authenticated
  USING (public.same_space(user_id));

CREATE POLICY "Users can add own compliments"
  ON public.compliments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Couple can mark compliments read"
  ON public.compliments FOR UPDATE TO authenticated
  USING (public.same_space(user_id));

CREATE POLICY "Users can delete own compliments"
  ON public.compliments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.compliments;