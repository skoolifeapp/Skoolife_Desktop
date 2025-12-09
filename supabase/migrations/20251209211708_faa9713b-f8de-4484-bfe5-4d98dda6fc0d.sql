-- Add notes and status columns to subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add check constraint for status
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_status_check CHECK (status IN ('active', 'archived'));