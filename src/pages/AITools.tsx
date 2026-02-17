import { useState } from 'react';
import { Sparkles, BookOpen, HelpCircle, Layers, Loader2, ChevronRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ToolType = 'quiz' | 'fiche' | 'flashcards';

const TOOLS = [
  { type: 'quiz' as ToolType, label: 'Quiz', icon: HelpCircle, description: 'Génère un quiz à choix multiples' },
  { type: 'fiche' as ToolType, label: 'Fiche de révision', icon: BookOpen, description: 'Crée une fiche synthétique' },
  { type: 'flashcards' as ToolType, label: 'Flashcards', icon: Layers, description: 'Génère des cartes recto/verso' },
];

export default function AITools() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('quiz');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error('Indique un sujet pour la génération');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-study-tools', {
        body: { type: selectedTool, subject: subject.trim(), content: content.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data.result);
    } catch (e: any) {
      console.error(e);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSubject('');
    setContent('');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Outils IA</h1>
          <p className="text-muted-foreground text-sm">Génère des quiz, fiches et flashcards avec l'IA</p>
        </div>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            onClick={() => { setSelectedTool(tool.type); setResult(null); }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
              selectedTool === tool.type
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 bg-card"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              selectedTool === tool.type ? "bg-primary/10" : "bg-muted"
            )}>
              <tool.icon className={cn("h-5 w-5", selectedTool === tool.type ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="font-medium text-sm">{tool.label}</p>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Input form */}
      {!result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Sujet *</label>
              <Input
                placeholder="Ex: La Révolution française, Les fonctions dérivées..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Contenu additionnel <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <Textarea
                placeholder="Colle ici tes notes de cours pour une génération plus précise..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading || !subject.trim()} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Génération en cours...' : 'Générer'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{result.title}</h2>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Nouveau
            </Button>
          </div>

          {selectedTool === 'quiz' && <QuizResult data={result} />}
          {selectedTool === 'fiche' && <FicheResult data={result} />}
          {selectedTool === 'flashcards' && <FlashcardsResult data={result} />}
        </div>
      )}
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
    <div className="space-y-4">
      {data.questions?.map((q: any, i: number) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 mt-0.5">Q{i + 1}</Badge>
              {q.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(q.options).map(([key, value]) => {
              const isSelected = answers[i] === key;
              const isCorrect = key === q.correct_answer;
              const showFeedback = showResults;

              return (
                <button
                  key={key}
                  onClick={() => !showResults && setAnswers({ ...answers, [i]: key })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all",
                    showFeedback && isCorrect && "border-primary bg-primary/10",
                    showFeedback && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                    !showFeedback && isSelected && "border-primary bg-primary/5",
                    !showFeedback && !isSelected && "border-border hover:border-primary/40"
                  )}
                  disabled={showResults}
                >
                  <Badge variant="outline" className="shrink-0">{key}</Badge>
                  <span className="flex-1">{value as string}</span>
                  {showFeedback && isCorrect && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                </button>
              );
            })}
            {showResults && (
              <p className="text-xs text-muted-foreground mt-2 pl-1">💡 {q.explanation}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {!showResults ? (
        <Button
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < (data.questions?.length ?? 0)}
          className="w-full gap-2"
        >
          <ChevronRight className="h-4 w-4" />
          Voir les résultats ({Object.keys(answers).length}/{data.questions?.length ?? 0})
        </Button>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{score}/{data.questions?.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {score === data.questions?.length ? '🎉 Parfait !' : score >= data.questions?.length * 0.7 ? '👏 Bien joué !' : '📚 Continue de réviser !'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- Fiche Result ---------- */
function FicheResult({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📌 Points clés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.key_points?.map((pt: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {data.definitions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📖 Définitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.definitions.map((d: any, i: number) => (
              <div key={i}>
                <p className="font-medium text-sm">{d.term}</p>
                <p className="text-sm text-muted-foreground">{d.definition}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.summary}</p>
        </CardContent>
      </Card>
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
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Carte {currentIndex + 1} / {cards.length}
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[200px] flex items-center justify-center p-8 rounded-xl border-2 border-primary/20 bg-card hover:shadow-md transition-all"
      >
        <p className="text-center text-lg">
          {flipped ? card.back : card.front}
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">Clique pour retourner</p>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(currentIndex - 1); setFlipped(false); }}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === cards.length - 1}
          onClick={() => { setCurrentIndex(currentIndex + 1); setFlipped(false); }}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
