-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "School admins can insert members to their school" ON public.school_members;

-- Recreate a simpler policy that doesn't cause recursion
-- Users can insert themselves as members (for self-signup)
-- OR platform admins can insert anyone
CREATE POLICY "School admins can insert members to their school" 
ON public.school_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Platform admins can insert anyone
  has_role(auth.uid(), 'admin'::app_role)
  -- OR user is inserting themselves
  OR auth.uid() = user_id
);