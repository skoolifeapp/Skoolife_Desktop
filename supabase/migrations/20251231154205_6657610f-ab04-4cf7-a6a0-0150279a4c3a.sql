-- Add cohorts table for academic structure
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  year_start integer NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  year_end integer NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()) + 1,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add classes table (subdivisions of cohorts)
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add school_subjects table for institution-defined subjects
CREATE TABLE public.school_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  name text NOT NULL,
  coefficient integer DEFAULT 1,
  exam_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add access_codes table for student enrollment
CREATE TABLE public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  max_uses integer DEFAULT 100,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Add cohort_id and class_id to school_members
ALTER TABLE public.school_members 
ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Cohorts policies
CREATE POLICY "Platform admins can manage cohorts" ON public.cohorts
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their cohorts" ON public.cohorts
FOR ALL USING (is_school_admin(auth.uid(), school_id));

CREATE POLICY "School members can view their cohorts" ON public.cohorts
FOR SELECT USING (is_school_member(auth.uid(), school_id));

-- Classes policies
CREATE POLICY "Platform admins can manage classes" ON public.classes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their classes" ON public.classes
FOR ALL USING (is_school_admin(auth.uid(), school_id));

CREATE POLICY "School members can view their classes" ON public.classes
FOR SELECT USING (is_school_member(auth.uid(), school_id));

-- School subjects policies
CREATE POLICY "Platform admins can manage school subjects" ON public.school_subjects
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their subjects" ON public.school_subjects
FOR ALL USING (is_school_admin(auth.uid(), school_id));

CREATE POLICY "School members can view their subjects" ON public.school_subjects
FOR SELECT USING (is_school_member(auth.uid(), school_id));

-- Access codes policies
CREATE POLICY "Platform admins can manage access codes" ON public.access_codes
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their access codes" ON public.access_codes
FOR ALL USING (is_school_admin(auth.uid(), school_id));

CREATE POLICY "Anyone can check access codes for enrollment" ON public.access_codes
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Function to validate and use access code
CREATE OR REPLACE FUNCTION public.use_access_code(p_code text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_code RECORD;
  v_result jsonb;
BEGIN
  -- Find and lock the access code
  SELECT * INTO v_access_code
  FROM public.access_codes
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  FOR UPDATE;

  IF v_access_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code invalide ou expiré');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = p_user_id AND school_id = v_access_code.school_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous êtes déjà membre de cet établissement');
  END IF;

  -- Increment usage counter
  UPDATE public.access_codes
  SET current_uses = current_uses + 1
  WHERE id = v_access_code.id;

  -- Add user as school member (student role)
  INSERT INTO public.school_members (school_id, user_id, role, cohort_id, class_id, joined_at)
  VALUES (
    v_access_code.school_id,
    p_user_id,
    'student',
    v_access_code.cohort_id,
    v_access_code.class_id,
    now()
  );

  -- Get school name for response
  SELECT jsonb_build_object(
    'success', true,
    'school_id', v_access_code.school_id,
    'cohort_id', v_access_code.cohort_id,
    'class_id', v_access_code.class_id,
    'school_name', s.name
  ) INTO v_result
  FROM public.schools s
  WHERE s.id = v_access_code.school_id;

  RETURN v_result;
END;
$$;

-- Update updated_at triggers
CREATE TRIGGER update_cohorts_updated_at
BEFORE UPDATE ON public.cohorts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_subjects_updated_at
BEFORE UPDATE ON public.school_subjects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();