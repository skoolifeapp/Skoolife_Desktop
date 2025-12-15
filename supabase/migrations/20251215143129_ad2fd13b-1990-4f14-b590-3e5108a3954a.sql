-- Allow authenticated users to find profiles by liaison_code for invitation purposes
CREATE POLICY "Users can find profiles by liaison_code" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND liaison_code IS NOT NULL
);