import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function FlashcardsResult({ data }: { data: any }) {
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
