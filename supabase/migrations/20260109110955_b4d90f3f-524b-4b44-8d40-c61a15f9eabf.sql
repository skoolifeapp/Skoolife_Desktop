-- Drop the conflicting restrictive policies
DROP POLICY IF EXISTS "Logged-in users can create schools" ON public.schools;
DROP POLICY IF EXISTS "Platform admins can insert schools" ON public.schools;

-- Create a single PERMISSIVE insert policy for logged-in users
CREATE POLICY "Logged-in users can create schools" 
ON public.schools 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);