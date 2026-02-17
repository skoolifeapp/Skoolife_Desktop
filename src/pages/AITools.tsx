import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BrainCircuit, HelpCircle, BookOpen, Layers, Loader2, RotateCcw, CheckCircle2, XCircle, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ToolType = 'quiz' | 'fiche' | 'flashcards';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolType?: ToolType;
  result?: any;
  loading?: boolean;
};

const TOOL_OPTIONS: { type: ToolType; label: string; icon: typeof HelpCircle; emoji: string }[] = [
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, emoji: '❓' },
  { type: 'fiche', label: 'Fiche de révision', icon: BookOpen, emoji: '📝' },
  { type: 'flashcards', label: 'Flashcards', icon: Layers, emoji: '🃏' },
];

export default function AITools() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolType>('quiz');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, toolType: selectedTool };
    const assistantId = crypto.randomUUID();
    const loadingMsg: Message = { id: assistantId, role: 'assistant', content: '', loading: true, toolType: selectedTool };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-study-tools', {
        body: { type: selectedTool, subject: text },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setLoading(false);
        return;
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, loading: false, result: data.result, content: data.result?.title || 'Résultat' } : m
        )
      );
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

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    textareaRef.current?.focus();
  };

  const isEmpty = messages.length === 0;
  const toolInfo = TOOL_OPTIONS.find(t => t.type === selectedTool)!;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center max-w-md">
              <h2 className="text-xl font-bold mb-1">Outils IA</h2>
              <p className="text-muted-foreground text-sm">
                Génère des quiz, fiches de révision et flashcards à partir de n'importe quel sujet.
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
          /* Chat messages */
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
                      {msg.toolType === 'quiz' && <QuizResult data={msg.result} />}
                      {msg.toolType === 'fiche' && <FicheResult data={msg.result} />}
                      {msg.toolType === 'flashcards' && <FlashcardsResult data={msg.result} />}
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
          <div className="flex gap-1.5 mb-2">
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

          {/* Text input */}
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Décris un sujet pour générer ${toolInfo.label === 'Quiz' ? 'un quiz' : toolInfo.label === 'Fiche de révision' ? 'une fiche' : 'des flashcards'}...`}
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
  );
}

/* ---------- Quiz Result ---------- */
function QuizResult({ data }: { data: any }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const score = data.questions?.reduce((acc: number, q: any, i: number) => {
    return acc + (answers[i] === q.correct_answer ? 1 : 0);
  }, 0) ?? 0;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">{data.title}</p>
      {data.questions?.map((q: any, i: number) => (
        <div key={i} className="space-y-1.5">
          <p className="text-sm font-medium">
            <span className="text-primary mr-1">Q{i + 1}.</span> {q.question}
          </p>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(q.options).map(([key, value]) => {
              const isSelected = answers[i] === key;
              const isCorrect = key === q.correct_answer;
              const showFeedback = showResults;

              return (
                <button
                  key={key}
                  onClick={() => !showResults && setAnswers({ ...answers, [i]: key })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all border",
                    showFeedback && isCorrect && "border-primary bg-primary/10",
                    showFeedback && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                    !showFeedback && isSelected && "border-primary bg-primary/5",
                    !showFeedback && !isSelected && "border-transparent hover:bg-accent/50"
                  )}
                  disabled={showResults}
                >
                  <Badge variant="outline" className="shrink-0 text-[10px] h-5 w-5 flex items-center justify-center p-0">{key}</Badge>
                  <span className="flex-1">{value as string}</span>
                  {showFeedback && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>
          {showResults && <p className="text-xs text-muted-foreground pl-1">💡 {q.explanation}</p>}
        </div>
      ))}

      {!showResults ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < (data.questions?.length ?? 0)}
          className="w-full gap-1.5 text-xs"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          Voir les résultats ({Object.keys(answers).length}/{data.questions?.length ?? 0})
        </Button>
      ) : (
        <div className="text-center py-2">
          <p className="text-2xl font-bold text-primary">{score}/{data.questions?.length}</p>
          <p className="text-xs text-muted-foreground">
            {score === data.questions?.length ? '🎉 Parfait !' : score >= data.questions?.length * 0.7 ? '👏 Bien joué !' : '📚 Continue de réviser !'}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- Fiche Result ---------- */
function FicheResult({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">{data.title}</p>

      <div>
        <p className="text-xs font-medium text-primary mb-1">📌 Points clés</p>
        <ul className="space-y-1">
          {data.key_points?.map((pt: string, i: number) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {data.definitions?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-primary mb-1">📖 Définitions</p>
          <div className="space-y-1.5">
            {data.definitions.map((d: any, i: number) => (
              <div key={i}>
                <p className="text-xs font-medium">{d.term}</p>
                <p className="text-xs text-muted-foreground">{d.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-primary mb-1">📝 Résumé</p>
        <p className="text-xs">{data.summary}</p>
      </div>
    </div>
  );
}

/* ---------- Flashcards Result ---------- */
function FlashcardsResult({ data }: { data: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = data.cards ?? [];
  const card = cards[currentIndex];
  if (!card) return null;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">{data.title}</p>
      <p className="text-xs text-muted-foreground text-center">{currentIndex + 1} / {cards.length}</p>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[120px] flex items-center justify-center p-5 rounded-xl border border-primary/20 bg-background hover:shadow-sm transition-all"
      >
        <p className="text-center text-sm">{flipped ? card.back : card.front}</p>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">Clique pour retourner</p>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(currentIndex - 1); setFlipped(false); }}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={currentIndex === cards.length - 1}
          onClick={() => { setCurrentIndex(currentIndex + 1); setFlipped(false); }}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
