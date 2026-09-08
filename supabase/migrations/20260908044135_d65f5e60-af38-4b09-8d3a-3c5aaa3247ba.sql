-- 1. Couple spaces
CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couples TO authenticated;
GRANT ALL ON public.couples TO service_role;
GRANT SELECT, INSERT, DELETE ON public.couple_members TO authenticated;
GRANT ALL ON public.couple_members TO service_role;

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER couples_updated BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Membership helpers (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.my_couple_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.same_space(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user = auth.uid() OR EXISTS (
    SELECT 1
    FROM public.couple_members me
    JOIN public.couple_members other ON other.couple_id = me.couple_id
    WHERE me.user_id = auth.uid() AND other.user_id = _user
  )
$$;

REVOKE ALL ON FUNCTION public.my_couple_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.same_space(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_couple_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.same_space(uuid) TO authenticated;

-- couples / couple_members policies
CREATE POLICY couples_select ON public.couples FOR SELECT TO authenticated
  USING (id = public.my_couple_id() OR created_by = auth.uid());
CREATE POLICY couples_insert ON public.couples FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY couples_delete ON public.couples FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY couple_members_select ON public.couple_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.my_couple_id());
CREATE POLICY couple_members_insert ON public.couple_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY couple_members_delete ON public.couple_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. Scope reads to the couple space, and writes to the owner
DROP POLICY IF EXISTS albums_select ON public.albums;
CREATE POLICY albums_select ON public.albums FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS albums_update ON public.albums;
CREATE POLICY albums_update ON public.albums FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chat_select ON public.chat_messages;
CREATE POLICY chat_select ON public.chat_messages FOR SELECT TO authenticated
  USING (expires_at > now() AND public.same_space(user_id));

DROP POLICY IF EXISTS event_responses_select ON public.event_responses;
CREATE POLICY event_responses_select ON public.event_responses FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS events_update ON public.events;
CREATE POLICY events_update ON public.events FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS fun_items_select ON public.fun_items;
CREATE POLICY fun_items_select ON public.fun_items FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS milestones_update ON public.milestones;
CREATE POLICY milestones_update ON public.milestones FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS replies_select ON public.note_replies;
CREATE POLICY replies_select ON public.note_replies FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS reactions_select ON public.note_reactions;
CREATE POLICY reactions_select ON public.note_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS attachments_select ON public.note_attachments;
CREATE POLICY attachments_select ON public.note_attachments FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS notes_select ON public.notes;
CREATE POLICY notes_select ON public.notes FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS notes_update ON public.notes;
CREATE POLICY notes_update ON public.notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS photo_reactions_select ON public.photo_reactions;
CREATE POLICY photo_reactions_select ON public.photo_reactions FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS photo_comments_select ON public.photo_comments;
CREATE POLICY photo_comments_select ON public.photo_comments FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS photos_select ON public.photos;
CREATE POLICY photos_select ON public.photos FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS photos_update ON public.photos;
CREATE POLICY photos_update ON public.photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (public.same_space(id));

DROP POLICY IF EXISTS video_com_select ON public.video_comentarios;
CREATE POLICY video_com_select ON public.video_comentarios FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS videos_select ON public.videos_diarios;
CREATE POLICY videos_select ON public.videos_diarios FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS wish_votes_select ON public.wish_votes;
CREATE POLICY wish_votes_select ON public.wish_votes FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS wish_comments_select ON public.wish_comments;
CREATE POLICY wish_comments_select ON public.wish_comments FOR SELECT TO authenticated USING (public.same_space(user_id));

DROP POLICY IF EXISTS wishes_select ON public.wishes;
CREATE POLICY wishes_select ON public.wishes FOR SELECT TO authenticated USING (public.same_space(user_id));
DROP POLICY IF EXISTS wishes_update ON public.wishes;
CREATE POLICY wishes_update ON public.wishes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Storage: tie objects to their uploader
DROP POLICY IF EXISTS media_insert ON storage.objects;
CREATE POLICY media_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND owner = auth.uid());
DROP POLICY IF EXISTS media_update ON storage.objects;
CREATE POLICY media_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'media' AND owner = auth.uid());

-- 5. Internal trigger functions must not be callable through the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;