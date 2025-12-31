-- Allow authenticated users to create schools (for self-signup)
CREATE POLICY "Authenticated users can create schools" 
ON public.schools 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to add themselves as school members (for self-signup)
CREATE POLICY "Users can add themselves as school members" 
ON public.school_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);