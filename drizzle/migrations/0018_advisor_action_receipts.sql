CREATE TABLE public.advisor_action_receipts (thread_id uuid NOT NULL, tool_call_id text NOT NULL, user_id uuid NOT NULL, result text, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(thread_id,tool_call_id));
GRANT ALL ON public.advisor_action_receipts TO service_role;
ALTER TABLE public.advisor_action_receipts ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.advisor_action_receipts IS 'Server-only deduplication for explicitly approved adviser actions; never expose to browsers.';