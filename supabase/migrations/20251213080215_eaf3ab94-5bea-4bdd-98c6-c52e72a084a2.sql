-- Add exam_type column to subjects table
ALTER TABLE public.subjects 
ADD COLUMN exam_type text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.subjects.exam_type IS 'Type of exam: partiel, controle_continu, oral, projet';