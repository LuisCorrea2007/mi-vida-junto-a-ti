-- CHECK-INS
CREATE TABLE public.couple_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  energy_level integer NOT NULL DEFAULT 5,
  need text,
  note text,
  support_type text NOT NULL DEFAULT 'escuchar',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_checkins TO authenticated;
GRANT ALL ON public.couple_checkins TO service_role;
ALTER TABLE public.couple_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_select_space" ON public.couple_checkins FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "checkins_insert_own" ON public.couple_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checkins_delete_own" ON public.couple_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ACUERDOS
CREATE TABLE public.couple_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'propuesto',
  review_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_agreements TO authenticated;
GRANT ALL ON public.couple_agreements TO service_role;
ALTER TABLE public.couple_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agreements_select_space" ON public.couple_agreements FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "agreements_insert_own" ON public.couple_agreements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agreements_update_space" ON public.couple_agreements FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "agreements_delete_own" ON public.couple_agreements FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER couple_agreements_updated BEFORE UPDATE ON public.couple_agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.agreement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.couple_agreements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.agreement_comments TO authenticated;
GRANT ALL ON public.agreement_comments TO service_role;
ALTER TABLE public.agreement_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agreement_comments_select_space" ON public.agreement_comments FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "agreement_comments_insert_own" ON public.agreement_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agreement_comments_delete_own" ON public.agreement_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PREGUNTAS PROFUNDAS (catálogo compartido)
CREATE TABLE public.deep_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  is_daily boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.deep_questions TO authenticated;
GRANT ALL ON public.deep_questions TO service_role;
ALTER TABLE public.deep_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deep_questions_select" ON public.deep_questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.deep_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer text NOT NULL,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_responses TO authenticated;
GRANT ALL ON public.question_responses TO service_role;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "question_responses_select_space" ON public.question_responses FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "question_responses_insert_own" ON public.question_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_responses_update_own" ON public.question_responses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_responses_delete_own" ON public.question_responses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PLANES PARA DOS
CREATE TABLE public.couple_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  time_available text NOT NULL DEFAULT 'tarde',
  budget text NOT NULL DEFAULT 'bajo',
  location_type text NOT NULL DEFAULT 'casa',
  mood text NOT NULL DEFAULT 'relajado',
  status text NOT NULL DEFAULT 'propuesto',
  planned_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_plans TO authenticated;
GRANT ALL ON public.couple_plans TO service_role;
ALTER TABLE public.couple_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select_space" ON public.couple_plans FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "plans_insert_own" ON public.couple_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_update_space" ON public.couple_plans FOR UPDATE TO authenticated USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "plans_delete_own" ON public.couple_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER couple_plans_updated BEFORE UPDATE ON public.couple_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.plan_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.couple_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL DEFAULT 'yes',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_votes TO authenticated;
GRANT ALL ON public.plan_votes TO service_role;
ALTER TABLE public.plan_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_votes_select_space" ON public.plan_votes FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "plan_votes_insert_own" ON public.plan_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plan_votes_update_own" ON public.plan_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plan_votes_delete_own" ON public.plan_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_agreements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_votes;

INSERT INTO public.deep_questions (category, question, is_daily) VALUES
('futuro','¿Cómo imaginas nuestra casa ideal?',true),
('futuro','¿Qué viaje quieres que hagamos juntos primero?',false),
('futuro','¿Dónde te ves en cinco años conmigo?',false),
('futuro','¿Qué tradición nueva te gustaría crear para los dos?',false),
('futuro','¿Qué meta quieres que logremos este año?',false),
('cariño','¿Cómo te gusta más que te demuestre mi amor?',true),
('cariño','¿Cuál fue el detalle mío que más te ha enamorado?',false),
('cariño','¿Qué palabra o frase mía te hace sentir seguro/a?',false),
('cariño','¿Qué te hace sentir más querido/a en un día difícil?',false),
('cariño','¿Qué parte de mí te parece más linda?',false),
('confianza','¿Hay algo que te gustaría contarme y no has podido?',true),
('confianza','¿Qué necesitas de mí cuando discutimos?',false),
('confianza','¿Qué miedo tienes sobre nosotros?',false),
('confianza','¿En qué momento te sentiste más apoyado/a por mí?',false),
('confianza','¿Qué te ayuda a perdonar más rápido?',false),
('recuerdos','¿Cuál es tu recuerdo favorito de nosotros?',true),
('recuerdos','¿Qué recuerdas de la primera vez que me viste?',false),
('recuerdos','¿Qué canción te lleva de inmediato a un momento nuestro?',false),
('recuerdos','¿Qué día contigo repetirías tal cual?',false),
('recuerdos','¿Cuál ha sido nuestra risa más grande juntos?',false),
('diversion','Si fuéramos un dúo famoso, ¿quiénes seríamos?',true),
('diversion','¿Qué apodo raro me pondrías hoy?',false),
('diversion','¿Qué haríamos si ganáramos la lotería mañana?',false),
('diversion','¿Cuál sería nuestro superpoder de pareja?',false),
('diversion','¿Qué película describe mejor nuestra relación?',false);