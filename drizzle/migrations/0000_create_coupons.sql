CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '🎁',
  category text NOT NULL DEFAULT 'detalle',
  uses_total integer NOT NULL DEFAULT 1,
  expires_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons select space" ON public.coupons FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "coupons insert own" ON public.coupons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coupons update own" ON public.coupons FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coupons delete own" ON public.coupons FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER coupons_updated BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon redemptions select space" ON public.coupon_redemptions FOR SELECT TO authenticated USING (public.same_space(user_id));
CREATE POLICY "coupon redemptions insert own" ON public.coupon_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coupon redemptions delete own" ON public.coupon_redemptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupon_redemptions;