-- Add subject_name column to calendar_events for linking events to subjects
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS subject_name text;

-- Add subject_name column to session_files for subject-level resource sharing
ALTER TABLE public.session_files 
ADD COLUMN IF NOT EXISTS subject_name text;

-- Add subject_name column to session_links for subject-level resource sharing
ALTER TABLE public.session_links 
ADD COLUMN IF NOT EXISTS subject_name text;

-- Create indexes for faster subject-based lookups
CREATE INDEX IF NOT EXISTS idx_calendar_events_subject_name ON public.calendar_events(user_id, subject_name) WHERE subject_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_session_files_subject_name ON public.session_files(user_id, subject_name) WHERE subject_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_session_links_subject_name ON public.session_links(user_id, subject_name) WHERE subject_name IS NOT NULL;