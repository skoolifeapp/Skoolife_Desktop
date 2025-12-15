-- Add confirmed field to track explicit confirmation
ALTER TABLE public.session_invites 
ADD COLUMN confirmed boolean DEFAULT false;

-- Update existing invites to mark them as confirmed if accepted_by is set
UPDATE public.session_invites 
SET confirmed = true 
WHERE accepted_by IS NOT NULL;