CREATE TABLE public.trivia_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  question text NOT NULL,
  answer text NOT NULL,
  guess text,
  guessed_at timestamptz,
  correct boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trivia_questions TO authenticated;
GRANT ALL ON public.trivia_questions TO service_role;
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trivia_select" ON public.trivia_questions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "trivia_insert" ON public.trivia_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trivia_update" ON public.trivia_questions FOR UPDATE TO authenticated USING (public.same_space(user_id));
CREATE POLICY "trivia_delete" ON public.trivia_questions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'pelicula',
  platform text,
  watched boolean NOT NULL DEFAULT false,
  rating int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist TO authenticated;
GRANT ALL ON public.watchlist TO service_role;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watch_select" ON public.watchlist FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "watch_insert" ON public.watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watch_update" ON public.watchlist FOR UPDATE TO authenticated USING (public.same_space(user_id));
CREATE POLICY "watch_delete" ON public.watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.trivia_questions, public.watchlist;