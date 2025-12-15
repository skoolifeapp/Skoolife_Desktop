-- Add field to track users who signed up via invite link
ALTER TABLE public.profiles 
ADD COLUMN signed_up_via_invite boolean DEFAULT false;