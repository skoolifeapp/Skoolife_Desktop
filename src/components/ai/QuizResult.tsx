import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function QuizResult({ data }: { data: any }) {
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
