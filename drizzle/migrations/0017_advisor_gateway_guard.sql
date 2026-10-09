CREATE TABLE public.advisor_gateway_guard (scope text PRIMARY KEY, status integer NOT NULL, message text NOT NULL, blocked_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.advisor_gateway_guard TO service_role;
ALTER TABLE public.advisor_gateway_guard ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.advisor_gateway_guard IS 'Server-only persistent AI access guard; workspace owner clears after access is restored.';