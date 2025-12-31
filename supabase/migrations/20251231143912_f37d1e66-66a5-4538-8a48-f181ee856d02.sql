-- Add 'teacher' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Create function to check if user is school admin or teacher
CREATE OR REPLACE FUNCTION public.is_school_member(_user_id uuid, _school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_members
    WHERE user_id = _user_id
      AND school_id = _school_id
      AND is_active = true
  )
$$;

-- Create function to get user's school role
CREATE OR REPLACE FUNCTION public.get_school_role(_user_id uuid, _school_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.school_members
  WHERE user_id = _user_id
    AND school_id = _school_id
    AND is_active = true
  LIMIT 1
$$;