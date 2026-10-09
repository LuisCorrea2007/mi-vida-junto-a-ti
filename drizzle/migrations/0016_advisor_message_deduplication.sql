ALTER TABLE public.advisor_messages ADD COLUMN sdk_id text;
CREATE UNIQUE INDEX advisor_messages_thread_sdk_unique ON public.advisor_messages(thread_id,sdk_id) WHERE sdk_id IS NOT NULL;