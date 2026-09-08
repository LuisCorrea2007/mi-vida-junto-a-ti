CREATE TABLE public.dedications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('carta','enlace','archivo')),
  title text NOT NULL,
  content text,
  url text,
  file_path text,
  file_type text,
  file_size bigint,
  is_favorite boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dedications TO authenticated;
GRANT ALL ON public.dedications TO service_role;
ALTER TABLE public.dedications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pareja puede ver dedicatorias" ON public.dedications FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "Cada quien crea sus dedicatorias" ON public.dedications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cada quien edita sus dedicatorias" ON public.dedications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cada quien borra sus dedicatorias" ON public.dedications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER dedications_updated BEFORE UPDATE ON public.dedications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dedication_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dedication_id uuid NOT NULL REFERENCES public.dedications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.dedication_comments TO authenticated;
GRANT ALL ON public.dedication_comments TO service_role;
ALTER TABLE public.dedication_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pareja puede ver comentarios" ON public.dedication_comments FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "Pareja puede comentar" ON public.dedication_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.same_space(user_id));
CREATE POLICY "Cada quien borra sus comentarios" ON public.dedication_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.dedication_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dedication_id uuid NOT NULL REFERENCES public.dedications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dedication_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, DELETE ON public.dedication_reactions TO authenticated;
GRANT ALL ON public.dedication_reactions TO service_role;
ALTER TABLE public.dedication_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pareja puede ver reacciones" ON public.dedication_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "Pareja puede reaccionar" ON public.dedication_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.same_space(user_id));
CREATE POLICY "Cada quien quita su reacción" ON public.dedication_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.dedications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dedication_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dedication_reactions;