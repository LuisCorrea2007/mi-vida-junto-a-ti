CREATE TABLE public.couple_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '🎯',
  target_amount numeric,
  currency text NOT NULL DEFAULT 'USD',
  deadline date,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_goals TO authenticated;
GRANT ALL ON public.couple_goals TO service_role;
ALTER TABLE public.couple_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_select" ON public.couple_goals FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "goals_insert" ON public.couple_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update" ON public.couple_goals FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "goals_delete" ON public.couple_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER couple_goals_updated BEFORE UPDATE ON public.couple_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.couple_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.goal_contributions TO authenticated;
GRANT ALL ON public.goal_contributions TO service_role;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_contrib_select" ON public.goal_contributions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "goal_contrib_insert" ON public.goal_contributions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goal_contrib_delete" ON public.goal_contributions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.couple_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'casa',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  repeat_rule text,
  is_done boolean NOT NULL DEFAULT false,
  done_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_tasks TO authenticated;
GRANT ALL ON public.couple_tasks TO service_role;
ALTER TABLE public.couple_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.couple_tasks FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "tasks_insert" ON public.couple_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.couple_tasks FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "tasks_delete" ON public.couple_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER couple_tasks_updated BEFORE UPDATE ON public.couple_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goal_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_tasks;