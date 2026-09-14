ALTER TABLE public.deep_questions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "deep_questions_insert_own" ON public.deep_questions;
CREATE POLICY "deep_questions_insert_own" ON public.deep_questions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "deep_questions_delete_own" ON public.deep_questions;
CREATE POLICY "deep_questions_delete_own" ON public.deep_questions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "deep_questions_update_own" ON public.deep_questions;
CREATE POLICY "deep_questions_update_own" ON public.deep_questions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deep_questions TO authenticated;
GRANT ALL ON public.deep_questions TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.deep_questions;