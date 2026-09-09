CREATE TABLE public.advisor_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nueva conversación',
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.advisor_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.advisor_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX advisor_messages_thread_idx ON public.advisor_messages(thread_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisor_threads TO authenticated;
GRANT ALL ON public.advisor_threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisor_messages TO authenticated;
GRANT ALL ON public.advisor_messages TO service_role;

ALTER TABLE public.advisor_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisor_threads_select" ON public.advisor_threads FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR (is_shared AND public.same_space(user_id)));
CREATE POLICY "advisor_threads_insert" ON public.advisor_threads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "advisor_threads_update" ON public.advisor_threads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "advisor_threads_delete" ON public.advisor_threads FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "advisor_messages_select" ON public.advisor_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.advisor_threads t
    WHERE t.id = thread_id
      AND (t.user_id = auth.uid() OR (t.is_shared AND public.same_space(t.user_id)))
  ));
CREATE POLICY "advisor_messages_insert" ON public.advisor_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.advisor_threads t
    WHERE t.id = thread_id
      AND (t.user_id = auth.uid() OR (t.is_shared AND public.same_space(t.user_id)))
  ));
CREATE POLICY "advisor_messages_delete" ON public.advisor_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_advisor_threads_updated_at BEFORE UPDATE ON public.advisor_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.advisor_threads REPLICA IDENTITY FULL;
ALTER TABLE public.advisor_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_messages;