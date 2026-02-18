import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AIMessage = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_type?: string | null;
  result?: any;
  created_at: string;
};

export type AIConversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export function useAIConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('ai_chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50);
    setConversations((data as AIConversation[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();
    if (error || !data) return null;
    await fetchConversations();
    return data.id;
  }, [user, fetchConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('ai_chat_conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    await supabase.from('ai_chat_conversations').update({ title }).eq('id', id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);

  const fetchMessages = useCallback(async (conversationId: string): Promise<AIMessage[]> => {
    const { data } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return (data as AIMessage[]) ?? [];
  }, []);

  const saveMessage = useCallback(async (msg: {
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    tool_type?: string;
    result?: any;
  }) => {
    if (!user) return;
    await supabase.from('ai_chat_messages').insert({
      ...msg,
      user_id: user.id,
    });
    // Update conversation updated_at
    await supabase
      .from('ai_chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', msg.conversation_id);
  }, [user]);

  return {
    conversations,
    loading,
    createConversation,
    deleteConversation,
    updateTitle,
    fetchMessages,
    saveMessage,
    refreshConversations: fetchConversations,
  };
}
