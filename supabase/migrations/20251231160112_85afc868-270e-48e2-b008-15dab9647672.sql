-- Allow any authenticated user to create a school (they will become admin)
CREATE POLICY "Authenticated users can create schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view schools they are members of
CREATE POLICY "School members can view their school"
ON public.schools
FOR SELECT
USING (is_school_member(auth.uid(), id));