import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, HelpCircle, MessageSquare, Upload, Target, Calendar, Sparkles, Send, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SupportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowTutorial?: () => void;
}

interface Conversation {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
}

const SupportDrawer = ({ open, onOpenChange, onShowTutorial }: SupportDrawerProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // States for conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationMessage, setNewConversationMessage] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchConversations();
    }
  }, [open, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('id, sender_type, message, created_at')
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
    
    // Mark admin messages as read by user
    await supabase
      .from('conversation_messages')
      .update({ read_by_user: true })
      .eq('conversation_id', conv.id)
      .eq('sender_type', 'admin');
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
          sender_type: 'user',
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
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationMessage.trim() || !user) return;

    setSending(true);
    try {
      // Create conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          subject: 'Support',
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add first message
      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: convData.id,
          sender_id: user.id,
          sender_type: 'user',
          message: newConversationMessage.trim(),
        });

      if (msgError) throw msgError;

      toast.success('Message envoyé !');
      setNewConversationMessage('');
      setShowNewConversation(false);
      await fetchConversations();
      handleSelectConversation(convData);
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error('Erreur lors de la création');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    setShowNewConversation(false);
  };

  const guideSteps = [
    {
      icon: Upload,
      title: 'Importer ton calendrier (.ics)',
      description: "Exporte ton emploi du temps depuis ton ENT ou Google Calendar et importe-le dans Skoolife.",
    },
    {
      icon: Target,
      title: "Ajouter tes matières et dates d'examen",
      description: "Crée tes matières avec leur coefficient, leur date d'examen et un objectif d'heures.",
    },
    {
      icon: Calendar,
      title: 'Ajouter tes contraintes',
      description: "Indique tes activités régulières (sport, job, perso) pour que Skoolife les évite.",
    },
    {
      icon: Sparkles,
      title: 'Générer ton planning',
      description: "Clique sur 'Générer mon planning' et Skoolife répartit tes révisions intelligemment.",
    },
  ];

  const faqItems = [
    {
      question: "Je n'ai aucun événement après l'import .ics, que faire ?",
      answer: "Vérifie que ton fichier .ics est bien valide et qu'il contient des événements pour les prochaines semaines.",
    },
    {
      question: 'Comment modifier ou déplacer un événement ?',
      answer: "Clique sur n'importe quel événement dans la grille pour ouvrir ses options. Tu peux aussi glisser-déposer.",
    },
    {
      question: "Comment fonctionne 'Générer' vs 'Ajuster' ?",
      answer: "'Générer' recrée tout. 'Ajuster' garde tes sessions existantes et ajoute seulement ce qui manque.",
    },
  ];

  // Render conversation view
  const renderConversationView = () => {
    if (showNewConversation) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">Nouveau message</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Décris ton problème ou ta question. L'équipe Skoolife te répondra rapidement.
              </p>
              <Textarea
                value={newConversationMessage}
                onChange={(e) => setNewConversationMessage(e.target.value)}
                placeholder="Écris ton message..."
                rows={5}
              />
              <Button 
                onClick={handleCreateConversation}
                disabled={!newConversationMessage.trim() || sending}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedConversation) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">Conversation</span>
            <Badge variant={selectedConversation.status === 'open' ? 'default' : 'secondary'} className="ml-auto">
              {selectedConversation.status === 'open' ? 'Ouvert' : 'Fermé'}
            </Badge>
          </div>

          <ScrollArea className="flex-1 -mx-4 px-4" ref={scrollRef as any}>
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Aucun message
              </p>
            ) : (
              <div className="space-y-3 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        msg.sender_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {msg.sender_type === 'admin' && (
                        <p className="text-xs font-medium mb-1 text-primary">
                          Équipe Skoolife
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_type === 'user' 
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

          <div className="pt-3 border-t mt-auto">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="resize-none"
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
                size="icon"
                className="shrink-0 h-auto"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Conversations list
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tes échanges avec l'équipe Skoolife
          </p>
          <Button size="sm" onClick={() => setShowNewConversation(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau
          </Button>
        </div>

        {loadingConversations ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              Aucune conversation
            </p>
            <Button size="sm" onClick={() => setShowNewConversation(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Démarrer une conversation
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{conv.subject}</span>
                  <Badge 
                    variant={conv.status === 'open' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {conv.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dernière activité : {format(new Date(conv.updated_at), 'dd MMM à HH:mm', { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Support Skoolife</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="messages" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-3 mb-6 shrink-0">
            <TabsTrigger value="messages" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
          </TabsList>

          {/* Messages / Conversations */}
          <TabsContent value="messages" className="flex-1 overflow-hidden mt-0">
            {user ? (
              renderConversationView()
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Connecte-toi pour accéder à la messagerie
                </p>
              </div>
            )}
          </TabsContent>

          {/* Guide rapide */}
          <TabsContent value="guide" className="space-y-4 overflow-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Les 4 étapes pour bien utiliser Skoolife :
            </p>
            
            <div className="space-y-4">
              {guideSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 rounded-lg border border-border bg-card/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {onShowTutorial && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  onOpenChange(false);
                  onShowTutorial();
                }}
              >
                Voir le tutoriel complet
              </Button>
            )}
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="overflow-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default SupportDrawer;