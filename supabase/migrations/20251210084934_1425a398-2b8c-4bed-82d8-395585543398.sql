-- Enable REPLICA IDENTITY FULL for all tracked tables (needed for UPDATE/DELETE payloads)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.subjects REPLICA IDENTITY FULL;
ALTER TABLE public.revision_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.calendar_events REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revision_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;