CREATE TABLE public.couple_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  opponent_id uuid NOT NULL,
  kind text NOT NULL,
  board jsonb NOT NULL,
  turn uuid NOT NULL,
  winner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_games TO authenticated;
GRANT ALL ON public.couple_games TO service_role;
ALTER TABLE public.couple_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games read pair" ON public.couple_games FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "games insert own" ON public.couple_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.same_space(opponent_id));
CREATE POLICY "games play" ON public.couple_games FOR UPDATE TO authenticated USING (auth.uid() IN (user_id, opponent_id)) WITH CHECK (auth.uid() IN (user_id, opponent_id));
CREATE POLICY "games delete own" ON public.couple_games FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER couple_games_updated BEFORE UPDATE ON public.couple_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_games;