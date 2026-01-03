-- Create table for storing PDF annotations
CREATE TABLE public.file_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.study_files(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('highlight', 'note', 'drawing')),
  color TEXT NOT NULL DEFAULT '#FFEB3B',
  content TEXT, -- For notes: the text content
  position JSONB NOT NULL, -- {x, y, width, height} for highlights, {x, y} for notes, path data for drawings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_file_annotations_file_id ON public.file_annotations(file_id);
CREATE INDEX idx_file_annotations_user_id ON public.file_annotations(user_id);

-- Enable RLS
ALTER TABLE public.file_annotations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own annotations
CREATE POLICY "Users can view their own annotations"
ON public.file_annotations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own annotations
CREATE POLICY "Users can create their own annotations"
ON public.file_annotations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own annotations
CREATE POLICY "Users can update their own annotations"
ON public.file_annotations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own annotations
CREATE POLICY "Users can delete their own annotations"
ON public.file_annotations
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_file_annotations_updated_at
BEFORE UPDATE ON public.file_annotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();