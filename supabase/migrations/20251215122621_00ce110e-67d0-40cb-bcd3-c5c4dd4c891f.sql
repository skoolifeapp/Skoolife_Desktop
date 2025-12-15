-- Add liaison_code column to profiles
ALTER TABLE public.profiles 
ADD COLUMN liaison_code TEXT UNIQUE;

-- Create function to generate unique liaison code
CREATE OR REPLACE FUNCTION public.generate_liaison_code(p_first_name TEXT, p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_name TEXT;
  random_suffix TEXT;
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  -- Get base name from first_name or email prefix
  base_name := COALESCE(
    NULLIF(TRIM(p_first_name), ''),
    SPLIT_PART(p_email, '@', 1)
  );
  
  -- Take first 5 characters, uppercase, remove special chars
  base_name := UPPER(REGEXP_REPLACE(LEFT(base_name, 5), '[^A-Z0-9]', '', 'gi'));
  
  -- If empty, use default
  IF base_name = '' OR base_name IS NULL THEN
    base_name := 'USER';
  END IF;
  
  -- Generate unique code with random suffix
  LOOP
    random_suffix := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
    new_code := base_name || '-' || random_suffix;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE liaison_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 100 THEN
      -- Fallback with longer suffix
      RETURN base_name || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8));
    END IF;
  END LOOP;
END;
$$;

-- Update handle_new_user to include liaison_code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  generated_code TEXT;
BEGIN
  -- Generate liaison code
  generated_code := public.generate_liaison_code(
    new.raw_user_meta_data ->> 'first_name',
    new.email
  );
  
  INSERT INTO public.profiles (id, email, liaison_code)
  VALUES (new.id, new.email, generated_code);
  RETURN new;
END;
$$;

-- Generate codes for existing users without one
UPDATE public.profiles
SET liaison_code = public.generate_liaison_code(first_name, email)
WHERE liaison_code IS NULL;