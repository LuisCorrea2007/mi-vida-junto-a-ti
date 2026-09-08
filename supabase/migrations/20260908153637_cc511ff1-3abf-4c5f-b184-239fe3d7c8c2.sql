ALTER TABLE public.fun_items ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_accuracy double precision;

CREATE TABLE public.fun_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fun_item_id uuid NOT NULL REFERENCES public.fun_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.fun_comments TO authenticated;
GRANT ALL ON public.fun_comments TO service_role;
ALTER TABLE public.fun_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fun_comments_select_space" ON public.fun_comments FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "fun_comments_insert_own" ON public.fun_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fun_comments_delete_own" ON public.fun_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.fun_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fun_item_id uuid NOT NULL REFERENCES public.fun_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fun_item_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, DELETE ON public.fun_reactions TO authenticated;
GRANT ALL ON public.fun_reactions TO service_role;
ALTER TABLE public.fun_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fun_reactions_select_space" ON public.fun_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "fun_reactions_insert_own" ON public.fun_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fun_reactions_delete_own" ON public.fun_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.fun_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fun_item_id uuid NOT NULL REFERENCES public.fun_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fun_item_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fun_ratings TO authenticated;
GRANT ALL ON public.fun_ratings TO service_role;
ALTER TABLE public.fun_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fun_ratings_select_space" ON public.fun_ratings FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "fun_ratings_insert_own" ON public.fun_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fun_ratings_update_own" ON public.fun_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fun_ratings_delete_own" ON public.fun_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER fun_ratings_updated BEFORE UPDATE ON public.fun_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_ratings;