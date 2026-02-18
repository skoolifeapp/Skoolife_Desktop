
-- Table for AI chat conversations
CREATE TABLE public.ai_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for AI chat messages
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  tool_type TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own ai conversations"
  ON public.ai_chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ai conversations"
  ON public.ai_chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai conversations"
  ON public.ai_chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai conversations"
  ON public.ai_chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view their own ai messages"
  ON public.ai_chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ai messages"
  ON public.ai_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai messages"
  ON public.ai_chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ai_chat_conversations_user_id ON public.ai_chat_conversations(user_id);
CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages(conversation_id);

-- Updated_at trigger for conversations
CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
