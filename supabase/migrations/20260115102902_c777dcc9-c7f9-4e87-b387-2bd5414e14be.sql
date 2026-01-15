-- Add columns for trial tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_tier text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.selected_tier IS 'The subscription tier selected during signup (student or major)';
COMMENT ON COLUMN public.profiles.trial_started_at IS 'When the 7-day free trial started';