INSERT INTO public.profiles (id, email, name)
SELECT u.id, u.email, COALESCE(NULLIF(u.raw_user_meta_data->>'name',''), NULLIF(u.raw_user_meta_data->>'full_name',''), split_part(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_shares_until timestamptz;