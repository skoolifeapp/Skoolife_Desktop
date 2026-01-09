-- Add column to track if user has seen the video tutorial for school students
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_video_tutorial boolean DEFAULT false;