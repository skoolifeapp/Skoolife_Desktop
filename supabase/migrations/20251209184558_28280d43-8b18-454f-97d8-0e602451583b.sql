-- Create user_feedback table for beta feedback
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'question')),
  message TEXT NOT NULL,
  route TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Add has_seen_support_hint to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_support_hint BOOLEAN DEFAULT false;