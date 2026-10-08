CREATE TABLE public.love_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 8000),
  mood text NOT NULL DEFAULT 'ternura',
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.love_letters TO authenticated;
GRANT ALL ON public.love_letters TO service_role;
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "love_letters_select" ON public.love_letters FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "love_letters_insert" ON public.love_letters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "love_letters_update" ON public.love_letters FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "love_letters_delete" ON public.love_letters FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER love_letters_updated_at BEFORE UPDATE ON public.love_letters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX love_letters_user_idx ON public.love_letters (user_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.open_love_letter(_id uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.love_letters SET opened_at = now()
  WHERE id = _id AND opened_at IS NULL AND user_id <> auth.uid() AND public.same_space(user_id);
$$;
REVOKE ALL ON FUNCTION public.open_love_letter(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.open_love_letter(uuid) TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.love_letters;