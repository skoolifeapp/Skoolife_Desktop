-- Allow self-join insert even if requests run under `anon` DB role with a valid user JWT
CREATE POLICY "Logged-in users can add themselves as school members"
ON public.school_members
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);
