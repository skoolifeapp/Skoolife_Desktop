-- 1) Helper function to check school admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_school_admin(_user_id uuid, _school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_members
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND role = 'admin_school'
  )
$$;

-- 2) Fix infinite recursion: remove school_members policies that query school_members
DROP POLICY IF EXISTS "School admins can delete members from their school" ON public.school_members;
DROP POLICY IF EXISTS "School admins can insert members to their school" ON public.school_members;
DROP POLICY IF EXISTS "School admins can update members in their school" ON public.school_members;
DROP POLICY IF EXISTS "School admins can view their school members" ON public.school_members;

-- Recreate non-recursive policies
CREATE POLICY "School admins can view their school members"
ON public.school_members
FOR SELECT
TO authenticated
USING (public.is_school_admin(auth.uid(), school_id));

CREATE POLICY "School admins can insert members to their school"
ON public.school_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_school_admin(auth.uid(), school_id));

CREATE POLICY "School admins can update members in their school"
ON public.school_members
FOR UPDATE
TO authenticated
USING (public.is_school_admin(auth.uid(), school_id));

CREATE POLICY "School admins can delete members from their school"
ON public.school_members
FOR DELETE
TO authenticated
USING (public.is_school_admin(auth.uid(), school_id));

-- 3) Schools policies: also remove cross-table logic and use the helper
DROP POLICY IF EXISTS "School admins can view their school" ON public.schools;
DROP POLICY IF EXISTS "School admins can update their school" ON public.schools;

CREATE POLICY "School admins can view their school"
ON public.schools
FOR SELECT
TO authenticated
USING (public.is_school_admin(auth.uid(), id));

CREATE POLICY "School admins can update their school"
ON public.schools
FOR UPDATE
TO authenticated
USING (public.is_school_admin(auth.uid(), id));

-- 4) Tighten security: schools should be created via backend function (service role), not directly by clients
DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;