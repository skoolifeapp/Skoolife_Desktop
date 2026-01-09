-- Drop and recreate the use_access_code function to validate email against expected students
CREATE OR REPLACE FUNCTION public.use_access_code(p_code text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_access_code RECORD;
  v_user_email TEXT;
  v_expected_student RECORD;
  v_result jsonb;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non trouvé');
  END IF;

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

  -- Check if user email is in the expected students list for this school
  SELECT * INTO v_expected_student
  FROM public.school_expected_students
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(v_user_email))
    AND school_id = v_access_code.school_id
    AND is_registered = false;

  IF v_expected_student IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Ton adresse email n''est pas autorisée à utiliser ce code. Inscris-toi avec l''email sur lequel tu as reçu le code d''accès.'
    );
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = p_user_id AND school_id = v_access_code.school_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tu es déjà membre de cet établissement');
  END IF;

  -- Increment usage counter
  UPDATE public.access_codes
  SET current_uses = current_uses + 1
  WHERE id = v_access_code.id;

  -- Mark expected student as registered
  UPDATE public.school_expected_students
  SET is_registered = true,
      registered_user_id = p_user_id
  WHERE id = v_expected_student.id;

  -- Add user as school member (student role) - use cohort/class from expected student if available
  INSERT INTO public.school_members (school_id, user_id, role, cohort_id, class_id, joined_at)
  VALUES (
    v_access_code.school_id,
    p_user_id,
    'student',
    COALESCE(v_expected_student.cohort_id, v_access_code.cohort_id),
    COALESCE(v_expected_student.class_id, v_access_code.class_id),
    now()
  );

  -- Get school name for response
  SELECT jsonb_build_object(
    'success', true,
    'school_id', v_access_code.school_id,
    'cohort_id', COALESCE(v_expected_student.cohort_id, v_access_code.cohort_id),
    'class_id', COALESCE(v_expected_student.class_id, v_access_code.class_id),
    'school_name', s.name
  ) INTO v_result
  FROM public.schools s
  WHERE s.id = v_access_code.school_id;

  RETURN v_result;
END;
$function$;