-- Private, low-frequency player presence for two-person pixel world.
-- Apply after 20261009093000_couple_worlds.sql (requires couples/my_couple_id).
CREATE TABLE IF NOT EXISTS public.couple_world_players (
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scene text NOT NULL CHECK(scene IN ('garden','home')),
  skin text NOT NULL CHECK(skin IN ('rose','mint','lavender','gold')),
  name text NOT NULL DEFAULT 'Mi amor' CHECK(char_length(name) BETWEEN 1 AND 32),
  x smallint NOT NULL CHECK(x BETWEEN 0 AND 27),
  y smallint NOT NULL CHECK(y BETWEEN 0 AND 19),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(couple_id,user_id)
);
CREATE INDEX IF NOT EXISTS couple_world_players_updated_idx
  ON public.couple_world_players(couple_id,updated_at DESC);

ALTER TABLE public.couple_world_players ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.couple_world_players FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.couple_world_players TO authenticated;

CREATE POLICY couple_world_players_select ON public.couple_world_players
  FOR SELECT TO authenticated USING (couple_id = public.my_couple_id());
CREATE POLICY couple_world_players_insert ON public.couple_world_players
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND couple_id = public.my_couple_id());
CREATE POLICY couple_world_players_update ON public.couple_world_players
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND couple_id = public.my_couple_id())
  WITH CHECK (user_id = auth.uid() AND couple_id = public.my_couple_id());
CREATE POLICY couple_world_players_delete ON public.couple_world_players
  FOR DELETE TO authenticated USING (user_id = auth.uid() AND couple_id = public.my_couple_id());

CREATE OR REPLACE FUNCTION public.world_presence_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.world_presence_timestamp() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER world_presence_touch BEFORE UPDATE ON public.couple_world_players
  FOR EACH ROW EXECUTE FUNCTION public.world_presence_timestamp();

-- Realtime listens only to these RLS-protected Postgres tables, not to public broadcast channels.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='couple_worlds') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_worlds;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='couple_world_players') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_world_players;
    END IF;
  END IF;
END $$;
