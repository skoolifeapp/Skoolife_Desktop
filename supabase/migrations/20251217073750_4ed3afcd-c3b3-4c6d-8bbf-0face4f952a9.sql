-- Create storage bucket for course files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course_files', 
  'course_files', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for course_files bucket
CREATE POLICY "Users can upload their own course files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course_files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own course files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course_files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own course files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course_files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track file uploads linked to sessions/events
CREATE TABLE public.session_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.revision_sessions(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT session_or_event CHECK (
    (session_id IS NOT NULL AND event_id IS NULL) OR 
    (session_id IS NULL AND event_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own session files"
ON public.session_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session files"
ON public.session_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own session files"
ON public.session_files FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_session_files_session_id ON public.session_files(session_id);
CREATE INDEX idx_session_files_event_id ON public.session_files(event_id);
CREATE INDEX idx_session_files_user_id ON public.session_files(user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_files;