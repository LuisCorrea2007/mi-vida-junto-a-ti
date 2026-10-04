CREATE TABLE public.naval_fleets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.couple_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cells integer[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, user_id)
);
GRANT SELECT ON public.naval_fleets TO authenticated;
GRANT ALL ON public.naval_fleets TO service_role;
ALTER TABLE public.naval_fleets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fleet read own" ON public.naval_fleets FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.naval_place(_game uuid, _cells integer[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.couple_games;
BEGIN
  SELECT * INTO g FROM public.couple_games WHERE id = _game;
  IF g.id IS NULL OR g.kind <> 'naval' OR auth.uid() NOT IN (g.user_id, g.opponent_id) THEN RAISE EXCEPTION 'Partida no válida'; END IF;
  IF array_length(_cells,1) <> 17 OR (SELECT count(DISTINCT x) FROM unnest(_cells) x WHERE x BETWEEN 0 AND 99) <> 17 THEN RAISE EXCEPTION 'Flota no válida'; END IF;
  INSERT INTO public.naval_fleets (game_id, user_id, cells) VALUES (_game, auth.uid(), _cells);
  UPDATE public.couple_games SET board = board || jsonb_build_object('ready_' || auth.uid()::text, true) WHERE id = _game;
END $$;

CREATE OR REPLACE FUNCTION public.naval_fire(_game uuid, _cell integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.couple_games; other uuid; fleet integer[]; hit boolean; shots jsonb; hits int;
BEGIN
  SELECT * INTO g FROM public.couple_games WHERE id = _game FOR UPDATE;
  IF g.id IS NULL OR g.kind <> 'naval' OR g.winner IS NOT NULL OR g.turn <> auth.uid() THEN RAISE EXCEPTION 'No es tu turno'; END IF;
  IF _cell < 0 OR _cell > 99 THEN RAISE EXCEPTION 'Casilla no válida'; END IF;
  other := CASE WHEN auth.uid() = g.user_id THEN g.opponent_id ELSE g.user_id END;
  SELECT cells INTO fleet FROM public.naval_fleets WHERE game_id = _game AND user_id = other;
  IF fleet IS NULL OR NOT EXISTS (SELECT 1 FROM public.naval_fleets WHERE game_id = _game AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Faltan barcos por colocar'; END IF;
  shots := COALESCE(g.board -> auth.uid()::text, '{}'::jsonb);
  IF shots ? _cell::text THEN RAISE EXCEPTION 'Ya disparaste ahí'; END IF;
  hit := _cell = ANY(fleet);
  shots := shots || jsonb_build_object(_cell::text, hit);
  SELECT count(*) INTO hits FROM jsonb_each(shots) e WHERE e.value = 'true'::jsonb;
  UPDATE public.couple_games SET
    board = board || jsonb_build_object(auth.uid()::text, shots),
    turn = CASE WHEN hit THEN auth.uid() ELSE other END,
    winner = CASE WHEN hits >= 17 THEN auth.uid()::text ELSE NULL END
  WHERE id = _game;
  RETURN hit;
END $$;

REVOKE EXECUTE ON FUNCTION public.naval_place(uuid, integer[]) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.naval_fire(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.naval_place(uuid, integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.naval_fire(uuid, integer) TO authenticated;