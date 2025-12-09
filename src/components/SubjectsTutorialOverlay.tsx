import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Plus, MousePointer } from 'lucide-react';

interface SubjectsTutorialOverlayProps {
  onComplete: () => void;
}

export const SubjectsTutorialOverlay = ({ onComplete }: SubjectsTutorialOverlayProps) => {
  const [step, setStep] = useState(1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateTargetRect = () => {
      let selector = '';
      if (step === 1) {
        selector = '[data-add-subject-button]';
      } else if (step === 2) {
        selector = '[data-subject-row="first"]';
      }

      const element = document.querySelector(selector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [step]);

  const handleNext = () => {
    if (step === 1) {
      // Check if there's a subject row for step 2
      const subjectRow = document.querySelector('[data-subject-row="first"]');
      if (subjectRow) {
        setStep(2);
      } else {
        onComplete();
      }
    } else {
      onComplete();
    }
  };

  const padding = 8;
  const holeX = targetRect ? targetRect.left - padding : 0;
  const holeY = targetRect ? targetRect.top - padding : 0;
  const holeWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const holeHeight = targetRect ? targetRect.height + padding * 2 : 0;

  const stepContent = {
    1: {
      icon: <Plus className="w-6 h-6 text-primary" />,
      title: 'Ajoute ta première matière',
      description: 'Renseigne tes matières et leurs examens pour que Skoolife puisse générer ton planning de révisions.',
    },
    2: {
      icon: <MousePointer className="w-6 h-6 text-primary" />,
      title: 'Modifie à tout moment',
      description: "Clique sur une matière pour ajuster la date d'examen, l'objectif d'heures ou la priorité.",
    },
  };

  const current = stepContent[step as keyof typeof stepContent];

  // Calculate card position
  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10002,
  };

  if (targetRect) {
    const cardWidth = 320;
    const cardHeight = 180;
    const gap = 16;

    // Position card below or above the target
    if (targetRect.bottom + cardHeight + gap < window.innerHeight) {
      cardStyle.top = targetRect.bottom + gap;
    } else {
      cardStyle.top = targetRect.top - cardHeight - gap;
    }

    // Center horizontally relative to target
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
    cardStyle.left = left;
    cardStyle.width = cardWidth;
  } else {
    cardStyle.top = '50%';
    cardStyle.left = '50%';
    cardStyle.transform = 'translate(-50%, -50%)';
    cardStyle.width = 320;
  }

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* SVG Overlay with hole */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 10000 }}
      >
        <defs>
          <mask id="subjects-tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={holeX}
                y={holeY}
                width={holeWidth}
                height={holeHeight}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#subjects-tutorial-mask)"
        />
      </svg>

      {/* Pulsing border around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-xl animate-pulse pointer-events-none"
          style={{
            left: holeX,
            top: holeY,
            width: holeWidth,
            height: holeHeight,
            zIndex: 10001,
          }}
        />
      )}

      {/* Tutorial Card */}
      <Card 
        className="pointer-events-auto shadow-2xl border-primary/20"
        style={cardStyle}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">{current.title}</h3>
              <p className="text-sm text-muted-foreground">{current.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Étape {step}/2
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onComplete}
              >
                Passer
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {step === 2 ? 'Compris' : 'Suivant'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
