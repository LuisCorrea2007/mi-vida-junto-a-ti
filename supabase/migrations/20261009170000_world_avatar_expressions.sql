-- Avatar appearance and temporary gestures. Apply after world_presence.
ALTER TABLE public.couple_world_players
  ADD COLUMN IF NOT EXISTS hair text NOT NULL DEFAULT 'short',
  ADD COLUMN IF NOT EXISTS emote text NULL,
  ADD COLUMN IF NOT EXISTS emote_at timestamptz NULL;
ALTER TABLE public.couple_world_players DROP CONSTRAINT IF EXISTS couple_world_players_hair_check;
ALTER TABLE public.couple_world_players ADD CONSTRAINT couple_world_players_hair_check CHECK (hair IN ('short','long','curly','cap'));
ALTER TABLE public.couple_world_players DROP CONSTRAINT IF EXISTS couple_world_players_emote_check;
ALTER TABLE public.couple_world_players ADD CONSTRAINT couple_world_players_emote_check CHECK (emote IS NULL OR emote IN ('heart','wave','dance'));
