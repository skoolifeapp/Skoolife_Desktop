-- Add difficulty_level column to subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'moyen';

-- Add comment for documentation
COMMENT ON COLUMN public.subjects.difficulty_level IS 'Difficulty level: facile, moyen, difficile';