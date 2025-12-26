-- Create study_files table for storing user's study documents
CREATE TABLE public.study_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'doc', 'docx')),
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  folder_name text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_study_files_user_id ON public.study_files(user_id);
CREATE INDEX idx_study_files_folder_name ON public.study_files(user_id, folder_name);

-- Enable RLS
ALTER TABLE public.study_files ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own files
CREATE POLICY "Users can view their own study files"
  ON public.study_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study files"
  ON public.study_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study files"
  ON public.study_files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study files"
  ON public.study_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_study_files_updated_at
  BEFORE UPDATE ON public.study_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for study files
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-files', 'study-files', false);

-- Storage policies for study-files bucket
CREATE POLICY "Users can upload their own study files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own study files storage"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own study files storage"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own study files storage"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);