import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText, Image, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: Date;
}

interface VideoCallChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'text' | 'file', fileData?: { url: string; name: string; type: string }) => void;
  currentUserName: string;
}

const VideoCallChat = ({ isOpen, onClose, messages, onSendMessage, currentUserName }: VideoCallChatProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), 'text');
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('session-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('session-files')
        .getPublicUrl(fileName);

      onSendMessage(file.name, 'file', {
        url: publicUrl,
        name: file.name,
        type: file.type,
      });

      toast.success('Fichier partagé');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du partage du fichier');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const isImageFile = (fileType?: string) => fileType?.startsWith('image/');

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 bottom-24 w-80 bg-card border border-border rounded-xl shadow-xl flex flex-col z-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Chat</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun message pour le moment.<br />
              Envoie un message ou partage un fichier !
            </p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderName === currentUserName;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground mb-1">{msg.senderName}</span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.type === 'text' ? (
                      <p className="text-sm break-words">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {isImageFile(msg.fileType) && msg.fileUrl && (
                          <img
                            src={msg.fileUrl}
                            alt={msg.fileName}
                            className="max-w-full rounded-lg max-h-40 object-cover"
                          />
                        )}
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 text-sm hover:underline ${
                            isOwn ? 'text-primary-foreground' : 'text-foreground'
                          }`}
                        >
                          {getFileIcon(msg.fileType)}
                          <span className="truncate flex-1">{msg.fileName}</span>
                          <Download className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 w-9 flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Écris un message..."
            className="flex-1 h-9"
            disabled={isUploading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isUploading}
            size="icon"
            className="h-9 w-9 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isUploading && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Envoi en cours...
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCallChat;
