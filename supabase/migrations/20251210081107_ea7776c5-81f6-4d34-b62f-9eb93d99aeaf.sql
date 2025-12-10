-- Add read_by_user column to track if user has read admin messages
ALTER TABLE public.conversation_messages 
ADD COLUMN read_by_user boolean NOT NULL DEFAULT false;

-- Mark all existing user messages as read (they wrote them)
UPDATE public.conversation_messages 
SET read_by_user = true 
WHERE sender_type = 'user';