-- Add study domain fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS study_domain text,
ADD COLUMN IF NOT EXISTS study_subcategory text;