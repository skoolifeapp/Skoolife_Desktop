DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;

-- Some setups still run requests under the `anon` DB role even with a user JWT.
-- This policy allows any logged-in user (auth.uid() not null) to create a school.
CREATE POLICY "Logged-in users can create schools"
ON public.schools
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);
