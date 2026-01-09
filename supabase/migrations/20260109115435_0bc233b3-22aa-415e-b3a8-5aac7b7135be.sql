-- Table pour stocker les élèves attendus par l'école (base de données école)
CREATE TABLE public.school_expected_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  is_registered boolean DEFAULT false,
  registered_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  UNIQUE(school_id, email)
);

-- Enable RLS
ALTER TABLE public.school_expected_students ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Platform admins can manage expected students"
ON public.school_expected_students FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their expected students"
ON public.school_expected_students FOR ALL
USING (is_school_admin(auth.uid(), school_id));

CREATE POLICY "School admins can view their expected students"
ON public.school_expected_students FOR SELECT
USING (is_school_admin(auth.uid(), school_id));

-- Index for faster lookups
CREATE INDEX idx_school_expected_students_email ON public.school_expected_students(email);
CREATE INDEX idx_school_expected_students_school ON public.school_expected_students(school_id);