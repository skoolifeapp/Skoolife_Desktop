-- Create schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#FFC107',
  contact_email text NOT NULL,
  contact_phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France',
  school_type text, -- lycée, université, prépa, école de commerce, etc.
  student_count_estimate text, -- 0-50, 51-200, 201-500, 500+
  subscription_tier text DEFAULT 'trial', -- trial, starter, growth, enterprise
  subscription_start_date date,
  subscription_end_date date,
  annual_price_cents integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create school_members table (links users to schools with roles)
CREATE TABLE public.school_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin_school', 'teacher', 'student')),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  invited_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Platform admins can view all schools"
ON public.schools FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Platform admins can insert schools"
ON public.schools FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Platform admins can update schools"
ON public.schools FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Platform admins can delete schools"
ON public.schools FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can view their school"
ON public.schools FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_members.school_id = schools.id
    AND school_members.user_id = auth.uid()
    AND school_members.role = 'admin_school'
  )
);

CREATE POLICY "School admins can update their school"
ON public.schools FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_members.school_id = schools.id
    AND school_members.user_id = auth.uid()
    AND school_members.role = 'admin_school'
  )
);

-- School members policies
CREATE POLICY "Platform admins can view all school members"
ON public.school_members FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Platform admins can manage school members"
ON public.school_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can view their school members"
ON public.school_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.school_members sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role = 'admin_school'
  )
);

CREATE POLICY "School admins can insert members to their school"
ON public.school_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.school_members sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role = 'admin_school'
  )
);

CREATE POLICY "School admins can update members in their school"
ON public.school_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.school_members sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role = 'admin_school'
  )
);

CREATE POLICY "School admins can delete members from their school"
ON public.school_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.school_members sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role = 'admin_school'
  )
);

CREATE POLICY "Users can view their own membership"
ON public.school_members FOR SELECT
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();