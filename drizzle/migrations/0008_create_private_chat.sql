CREATE TABLE public.private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  content text NOT NULL,
  reply_to uuid REFERENCES public.private_messages(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_messages TO authenticated;
GRANT ALL ON public.private_messages TO service_role;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm select" ON public.private_messages FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "pm insert" ON public.private_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pm update read" ON public.private_messages FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "pm delete" ON public.private_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.private_message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.private_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.private_message_reactions TO authenticated;
GRANT ALL ON public.private_message_reactions TO service_role;
ALTER TABLE public.private_message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmr select" ON public.private_message_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "pmr insert" ON public.private_message_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pmr delete" ON public.private_message_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_message_reactions;