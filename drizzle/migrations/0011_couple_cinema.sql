CREATE TABLE public.cinema_movies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
 source_es text, source_en text, file_path text,
 is_favorite boolean NOT NULL DEFAULT false, watched boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (source_es IS NOT NULL OR source_en IS NOT NULL OR file_path IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cinema_movies TO authenticated;
GRANT ALL ON public.cinema_movies TO service_role;
ALTER TABLE public.cinema_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cinema_read ON public.cinema_movies FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY cinema_insert ON public.cinema_movies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY cinema_update ON public.cinema_movies FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY cinema_delete ON public.cinema_movies FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.cinema_commands (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), movie_id uuid NOT NULL REFERENCES public.cinema_movies(id) ON DELETE CASCADE,
 user_id uuid NOT NULL, action text NOT NULL CHECK (action IN ('play','pause','seek')),
 position double precision NOT NULL DEFAULT 0 CHECK (position >= 0 AND position < 86400),
 language text NOT NULL DEFAULT 'es' CHECK (language IN ('es','en','file')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.cinema_commands TO authenticated;
GRANT ALL ON public.cinema_commands TO service_role;
ALTER TABLE public.cinema_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY cinema_commands_read ON public.cinema_commands FOR SELECT TO authenticated USING (public.same_space(user_id) AND EXISTS (SELECT 1 FROM public.cinema_movies m WHERE m.id = movie_id AND public.same_space(m.user_id)));
CREATE POLICY cinema_commands_insert ON public.cinema_commands FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.cinema_movies m WHERE m.id = movie_id AND public.same_space(m.user_id)));
CREATE POLICY cinema_commands_delete ON public.cinema_commands FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX cinema_commands_movie_time ON public.cinema_commands(movie_id, created_at DESC);
CREATE POLICY cinema_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cinema' AND public.same_space((storage.foldername(name))[1]::uuid));
CREATE POLICY cinema_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cinema' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY cinema_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cinema' AND (storage.foldername(name))[1] = auth.uid()::text);
ALTER PUBLICATION supabase_realtime ADD TABLE public.cinema_movies, public.cinema_commands;