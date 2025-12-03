-- Add target_hours column to subjects table for revision goals
ALTER TABLE public.subjects 
ADD COLUMN target_hours integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.subjects.target_hours IS 'Target revision hours before the exam date';