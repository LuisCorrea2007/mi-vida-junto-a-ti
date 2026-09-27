CREATE POLICY "Users can update own roulette items"
ON public.roulette_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);