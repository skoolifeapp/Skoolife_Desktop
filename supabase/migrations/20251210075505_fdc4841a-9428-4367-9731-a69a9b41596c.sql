-- Add read tracking for admin messages
ALTER TABLE public.conversation_messages 
ADD COLUMN read_by_admin boolean NOT NULL DEFAULT false;

-- Update existing admin messages as read
UPDATE public.conversation_messages 
SET read_by_admin = true 
WHERE sender_type = 'admin';