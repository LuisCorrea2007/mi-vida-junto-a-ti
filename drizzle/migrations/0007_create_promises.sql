CREATE TABLE public.promises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  emoji text NOT NULL DEFAULT '🤝',
  due_date date,
  kept_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promises TO authenticated;
GRANT ALL ON public.promises TO service_role;
ALTER TABLE public.promises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promises_select" ON public.promises FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "promises_insert" ON public.promises FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "promises_update" ON public.promises FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "promises_delete" ON public.promises FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER promises_updated_at BEFORE UPDATE ON public.promises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.promises;