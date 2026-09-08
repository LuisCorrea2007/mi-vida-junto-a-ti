-- CÁPSULAS DEL TIEMPO
CREATE TABLE public.time_capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  file_path text,
  file_type text,
  open_at timestamptz NOT NULL,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_capsules TO authenticated;
GRANT ALL ON public.time_capsules TO service_role;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "capsules_select" ON public.time_capsules FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (public.same_space(user_id) AND open_at <= now()));
CREATE POLICY "capsules_insert" ON public.time_capsules FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "capsules_update" ON public.time_capsules FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.same_space(user_id)) WITH CHECK (user_id = auth.uid() OR public.same_space(user_id));
CREATE POLICY "capsules_delete" ON public.time_capsules FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER time_capsules_updated BEFORE UPDATE ON public.time_capsules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RETOS
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_select" ON public.challenges FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "challenges_insert" ON public.challenges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "challenges_update" ON public.challenges FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "challenges_delete" ON public.challenges FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER challenges_updated BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now()::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id, day)
);
GRANT SELECT, INSERT, DELETE ON public.challenge_completions TO authenticated;
GRANT ALL ON public.challenge_completions TO service_role;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc_select" ON public.challenge_completions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "cc_insert" ON public.challenge_completions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cc_delete" ON public.challenge_completions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ESTADO DE ÁNIMO
CREATE TABLE public.moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  label text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.moods TO authenticated;
GRANT ALL ON public.moods TO service_role;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moods_select" ON public.moods FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "moods_insert" ON public.moods FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "moods_delete" ON public.moods FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CANCIONES
CREATE TABLE public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  url text,
  note text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "songs_select" ON public.songs FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "songs_insert" ON public.songs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "songs_update" ON public.songs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "songs_delete" ON public.songs FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER songs_updated BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.song_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (song_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, DELETE ON public.song_reactions TO authenticated;
GRANT ALL ON public.song_reactions TO service_role;
ALTER TABLE public.song_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "song_reactions_select" ON public.song_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "song_reactions_insert" ON public.song_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "song_reactions_delete" ON public.song_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- FRASES FAVORITAS
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  author text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_select" ON public.quotes FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "quotes_insert" ON public.quotes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "quotes_update" ON public.quotes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "quotes_delete" ON public.quotes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER quotes_updated BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TIEMPO REAL
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_capsules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;