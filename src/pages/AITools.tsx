import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, BrainCircuit, HelpCircle, BookOpen, Layers, Loader2, Plus, FileUp, Download, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAIConversations, type AIMessage } from '@/hooks/useAIConversations';
import { AIConversationSidebar } from '@/components/ai/AIConversationSidebar';
import { QuizResult } from '@/components/ai/QuizResult';
import { FicheResult } from '@/components/ai/FicheResult';
import { FlashcardsResult } from '@/components/ai/FlashcardsResult';
import { useAuth } from '@/hooks/useAuth';

type ToolType = 'quiz' | 'fiche' | 'flashcards';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolType?: string;
  result?: any;
  loading?: boolean;
};

const TOOL_OPTIONS: { type: ToolType; label: string; icon: typeof HelpCircle; emoji: string }[] = [
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, emoji: '❓' },
  { type: 'fiche', label: 'Fiche de révision', icon: BookOpen, emoji: '📝' },
  { type: 'flashcards', label: 'Flashcards', icon: Layers, emoji: '🃏' },
];

export default function AITools() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolType>('quiz');
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    createConversation,
    deleteConversation,
    fetchMessages,
    saveMessage,
    refreshConversations,
  } = useAIConversations();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    const msgs = await fetchMessages(id);
    setMessages(msgs.map((m: AIMessage) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      toolType: m.tool_type ?? undefined,
      result: m.result,
    })));
  }, [fetchMessages]);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    setFileContent(null);
    setFileName(null);
    textareaRef.current?.focus();
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5 Mo)');
      return;
    }

    const text = await file.text();
    if (!text.trim()) {
      toast.error('Impossible de lire le contenu du fichier');
      return;
    }

    // Limit content to ~8000 chars to avoid token limits
    const truncated = text.slice(0, 8000);
    setFileContent(truncated);
    setFileName(file.name);
    toast.success(`Fichier "${file.name}" chargé`);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleExportPDF = useCallback(async (resultElement: HTMLElement, title: string) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${title || 'export'}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(resultElement)
        .save();
    } catch {
      toast.error("Erreur lors de l'export PDF");
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    let convId = activeConversationId;

    // Create conversation if needed
    if (!convId) {
      const title = text.length > 40 ? text.slice(0, 40) + '…' : text;
      convId = await createConversation(title);
      if (!convId) {
        toast.error('Erreur lors de la création de la conversation');
        return;
      }
      setActiveConversationId(convId);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, toolType: selectedTool };
    const assistantId = crypto.randomUUID();
    const loadingMsg: Message = { id: assistantId, role: 'assistant', content: '', loading: true, toolType: selectedTool };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    // Save user message
    await saveMessage({
      conversation_id: convId,
      role: 'user',
      content: text,
      tool_type: selectedTool,
    });

    try {
      const { data, error } = await supabase.functions.invoke('ai-study-tools', {
        body: { type: selectedTool, subject: text, content: fileContent },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setLoading(false);
        return;
      }

      const resultTitle = data.result?.title || 'Résultat';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, loading: false, result: data.result, content: resultTitle } : m
        )
      );

      // Save assistant message
      await saveMessage({
        conversation_id: convId,
        role: 'assistant',
        content: resultTitle,
        tool_type: selectedTool,
        result: data.result,
      });

      // Clear file after use
      setFileContent(null);
      setFileName(null);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la génération');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <AIConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={loadConversation}
          onNew={handleNewChat}
          onDelete={async (id) => {
            await deleteConversation(id);
            if (activeConversationId === id) handleNewChat();
          }}
        />
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Outils IA</span>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleNewChat} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Nouvelle conversation
            </Button>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-xl font-bold mb-1">Outils IA</h2>
                <p className="text-muted-foreground text-sm">
                  Génère des quiz, fiches de révision et flashcards à partir de n'importe quel sujet ou fichier.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {[
                  { label: 'Quiz sur la Révolution française', tool: 'quiz' as ToolType },
                  { label: 'Fiche sur les fonctions dérivées', tool: 'fiche' as ToolType },
                  { label: 'Flashcards vocabulaire anglais', tool: 'flashcards' as ToolType },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { setSelectedTool(s.tool); setInput(s.label); }}
                    className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    {msg.role === 'user' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] bg-primary-foreground/20 text-primary-foreground border-0">
                          {TOOL_OPTIONS.find(t => t.type === msg.toolType)?.emoji} {TOOL_OPTIONS.find(t => t.type === msg.toolType)?.label}
                        </Badge>
                      </div>
                    )}
                    {msg.loading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Génération en cours...</span>
                      </div>
                    ) : msg.role === 'assistant' && msg.result ? (
                      <div>
                        <div data-export-target className="space-y-0">
                          {msg.toolType === 'quiz' && <QuizResult data={msg.result} />}
                          {msg.toolType === 'fiche' && <FicheResult data={msg.result} />}
                          {msg.toolType === 'flashcards' && <FlashcardsResult data={msg.result} />}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 gap-1.5 text-xs text-muted-foreground"
                          onClick={(e) => {
                            const target = (e.currentTarget as HTMLElement).parentElement?.querySelector('[data-export-target]') as HTMLElement;
                            if (target) handleExportPDF(target, msg.result?.title || 'export');
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Exporter en PDF
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-border bg-background px-4 py-3">
          <div className="max-w-3xl mx-auto">
            {/* Tool pills */}
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool.type}
                  onClick={() => setSelectedTool(tool.type)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    selectedTool === tool.type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <tool.icon className="h-3.5 w-3.5" />
                  {tool.label}
                </button>
              ))}
            </div>

            {/* File attachment indicator */}
            {fileName && (
              <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                <FileUp className="h-3.5 w-3.5 text-primary" />
                <span className="truncate flex-1">{fileName}</span>
                <button onClick={() => { setFileContent(null); setFileName(null); }} className="text-muted-foreground hover:text-destructive">✕</button>
              </div>
            )}

            {/* Text input */}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-11 w-11 text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Joindre un fichier texte"
              >
                <FileUp className="h-4 w-4" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Décris un sujet pour générer ${selectedTool === 'quiz' ? 'un quiz' : selectedTool === 'fiche' ? 'une fiche' : 'des flashcards'}...`}
                rows={1}
                className="resize-none min-h-[44px] max-h-[120px] rounded-xl"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="shrink-0 rounded-xl h-11 w-11"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
