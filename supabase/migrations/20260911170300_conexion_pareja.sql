-- ============================================
-- SECCIÓN CONEXIÓN: Check-ins, Acuerdos, Preguntas y Planes
-- ============================================

-- 1. CHECK-INS DE PAREJA
CREATE TABLE public.couple_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  energy_level int NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  need text,
  note text,
  support_type text NOT NULL DEFAULT 'escuchar' CHECK (support_type IN ('escuchar', 'espacio', 'abrazar', 'conversar', 'ayudar')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_checkins TO authenticated;
GRANT ALL ON public.couple_checkins TO service_role;
ALTER TABLE public.couple_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkins_select" ON public.couple_checkins FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "checkins_insert" ON public.couple_checkins FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "checkins_update" ON public.couple_checkins FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "checkins_delete" ON public.couple_checkins FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX checkins_user_created_idx ON public.couple_checkins(user_id, created_at DESC);

-- 2. ACUERDOS DE PAREJA
CREATE TABLE public.couple_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'propuesto' CHECK (status IN ('propuesto', 'aceptado', 'en_progreso', 'cumplido', 'archivado')),
  review_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_agreements TO authenticated;
GRANT ALL ON public.couple_agreements TO service_role;
ALTER TABLE public.couple_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agreements_select" ON public.couple_agreements FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "agreements_insert" ON public.couple_agreements FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "agreements_update" ON public.couple_agreements FOR UPDATE TO authenticated
  USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "agreements_delete" ON public.couple_agreements FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER agreements_updated BEFORE UPDATE ON public.couple_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX agreements_status_idx ON public.couple_agreements(status);

-- Comentarios en acuerdos
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

CREATE POLICY "agreement_comments_select" ON public.agreement_comments FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "agreement_comments_insert" ON public.agreement_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.same_space(user_id));
CREATE POLICY "agreement_comments_delete" ON public.agreement_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. PREGUNTAS PROFUNDAS
CREATE TABLE public.deep_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('futuro', 'cariño', 'confianza', 'recuerdos', 'diversion')),
  question text NOT NULL,
  is_daily boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.deep_questions TO authenticated;
GRANT ALL ON public.deep_questions TO service_role;
ALTER TABLE public.deep_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select" ON public.deep_questions FOR SELECT TO authenticated USING (true);

-- Respuestas a preguntas
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

CREATE POLICY "responses_select" ON public.question_responses FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "responses_insert" ON public.question_responses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "responses_update" ON public.question_responses FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "responses_delete" ON public.question_responses FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 4. PLANES PARA DOS
CREATE TABLE public.couple_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  time_available text NOT NULL DEFAULT 'tarde' CHECK (time_available IN ('manana', 'tarde', 'noche', 'fin_de_semana', 'dia_completo')),
  budget text NOT NULL DEFAULT 'bajo' CHECK (budget IN ('gratis', 'bajo', 'medio', 'alto')),
  location_type text NOT NULL DEFAULT 'casa' CHECK (location_type IN ('casa', 'fuera', 'cercania', 'viaje')),
  mood text NOT NULL DEFAULT 'relajado' CHECK (mood IN ('relajado', 'activo', 'romantico', 'divertido', 'creativo')),
  status text NOT NULL DEFAULT 'propuesto' CHECK (status IN ('propuesto', 'votado', 'planificado', 'completado', 'archivado')),
  planned_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_plans TO authenticated;
GRANT ALL ON public.couple_plans TO service_role;
ALTER TABLE public.couple_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select" ON public.couple_plans FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "plans_insert" ON public.couple_plans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "plans_update" ON public.couple_plans FOR UPDATE TO authenticated
  USING (public.same_space(user_id)) WITH CHECK (public.same_space(user_id));
CREATE POLICY "plans_delete" ON public.couple_plans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER plans_updated BEFORE UPDATE ON public.couple_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX plans_status_idx ON public.couple_plans(status);

-- Votos en planes
CREATE TABLE public.plan_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.couple_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('yes', 'maybe', 'no')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_votes TO authenticated;
GRANT ALL ON public.plan_votes TO service_role;
ALTER TABLE public.plan_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_votes_select" ON public.plan_votes FOR SELECT TO authenticated
  USING (public.same_space(user_id));
CREATE POLICY "plan_votes_insert" ON public.plan_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.same_space(user_id));
CREATE POLICY "plan_votes_update" ON public.plan_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "plan_votes_delete" ON public.plan_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 5. TIEMPO REAL PARA TODAS LAS TABLAS NUEVAS
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_agreements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agreement_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_votes;

-- 6. DATOS INICIALES: PREGUNTAS PROFUNDAS
INSERT INTO public.deep_questions (category, question, is_daily) VALUES
  ('futuro', '¿Cómo te imaginas nuestro día ideal dentro de 5 años?', true),
  ('futuro', '¿Qué sueño personal te gustaría que apoyemos juntos este año?', false),
  ('futuro', '¿Dónde te ves viviendo y qué estaríamos construyendo?', false),
  ('cariño', '¿Qué gesto pequeño te hace sentir más amado/a?', true),
  ('cariño', '¿Cuándo te sentiste más conectado/a conmigo recientemente?', false),
  ('cariño', '¿Qué palabra o frase mía te hace sonreír siempre?', false),
  ('confianza', '¿En qué momento sentiste que podías confiar ciegamente en mí?', true),
  ('confianza', '¿Qué miedo has superado gracias a nuestro apoyo mutuo?', false),
  ('confianza', '¿Cómo podemos fortalecer aún más nuestra comunicación?', false),
  ('recuerdos', '¿Cuál es tu recuerdo favorito de nuestro primer año juntos?', true),
  ('recuerdos', '¿Qué aventura inesperada vivimos que nunca olvidarás?', false),
  ('recuerdos', '¿Qué momento simple se convirtió en especial por estar juntos?', false),
  ('diversion', 'Si pudiéramos hacer cualquier cosa este fin de semana, ¿qué elegirías?', true),
  ('diversion', '¿Qué actividad nueva te gustaría probar conmigo?', false),
  ('diversion', '¿Cuál ha sido nuestra cita más divertida hasta ahora?', false);
