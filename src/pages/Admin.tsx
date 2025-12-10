import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, Send, Loader2, User, Clock, 
  CheckCircle, XCircle, RefreshCw, Inbox, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminSidebar from '@/components/AdminSidebar';

interface Conversation {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkAdminAndFetch();
  }, [user, navigate]);

  const checkAdminAndFetch = async () => {
    if (!user) return;

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchConversations();
    } catch (err) {
      console.error('Error checking admin status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: convData, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(convData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          const profile = profilesData?.find(p => p.id === conv.user_id);
          
          const { data: lastMsg } = await supabase
            .from('conversation_messages')
            .select('message, sender_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            user_email: profile?.email || 'Utilisateur inconnu',
            user_name: profile?.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`.trim()
              : undefined,
            last_message: lastMsg?.message?.substring(0, 60) + (lastMsg?.message && lastMsg.message.length > 60 ? '...' : ''),
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'admin'
      })));
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    await fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          sender_type: 'admin',
          message: newMessage.trim(),
        });

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (conv: Conversation) => {
    const newStatus = conv.status === 'open' ? 'closed' : 'open';
    try {
      await supabase
        .from('conversations')
        .update({ status: newStatus })
        .eq('id', conv.id);
      
      await fetchConversations();
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation({ ...conv, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openCount = conversations.filter(c => c.status === 'open').length;
  const closedCount = conversations.filter(c => c.status === 'closed').length;

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions pour accéder à cette page.
            </p>
            <Button onClick={() => navigate('/app')} variant="outline">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex-1 p-6 overflow-hidden">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{openCount}</p>
                <p className="text-sm text-muted-foreground">Ouvertes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{closedCount}</p>
                <p className="text-sm text-muted-foreground">Fermées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Conversations list */}
          <Card className="lg:col-span-1 flex flex-col border-0 shadow-sm">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchConversations}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex gap-1">
                {(['all', 'open', 'closed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="text-xs flex-1"
                  >
                    {status === 'all' ? 'Toutes' : status === 'open' ? 'Ouvertes' : 'Fermées'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-3">
                  {filteredConversations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      Aucune conversation
                    </p>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedConversation?.id === conv.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-secondary/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {conv.user_name || conv.user_email}
                            </p>
                            {conv.user_name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.user_email}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={conv.status === 'open' ? 'default' : 'secondary'}
                            className="shrink-0 text-xs"
                          >
                            {conv.status === 'open' ? 'Ouvert' : 'Fermé'}
                          </Badge>
                        </div>
                        {conv.last_message && (
                          <p className="text-xs text-muted-foreground mt-1.5 truncate">
                            {conv.last_message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(conv.updated_at), 'dd MMM HH:mm', { locale: fr })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages area */}
          <Card className="lg:col-span-2 flex flex-col border-0 shadow-sm">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {selectedConversation.user_name || selectedConversation.user_email}
                        </CardTitle>
                        {selectedConversation.user_name && (
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.user_email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(selectedConversation)}
                    >
                      {selectedConversation.status === 'open' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Clôturer
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1.5" />
                          Rouvrir
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun message
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl p-3 ${
                                msg.sender_type === 'admin'
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-secondary rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                msg.sender_type === 'admin' 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                {format(new Date(msg.created_at), 'dd MMM HH:mm', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t shrink-0">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrire votre réponse..."
                        className="resize-none min-h-[60px]"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="shrink-0 h-auto"
                        size="icon"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-1">Sélectionnez une conversation</p>
                  <p className="text-sm">Choisissez une conversation dans la liste pour voir les messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default Admin;