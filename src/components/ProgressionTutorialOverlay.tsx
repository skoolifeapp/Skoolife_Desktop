import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, TrendingUp, BarChart3 } from 'lucide-react';

interface ProgressionTutorialOverlayProps {
  onComplete: () => void;
}

export const ProgressionTutorialOverlay = ({ onComplete }: ProgressionTutorialOverlayProps) => {
  const [step, setStep] = useState(1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Determine actual step to show (skip step 2 if no subjects)
  const [actualStep, setActualStep] = useState(step);

  useEffect(() => {
    const updateTargetRect = () => {
      let selector = '';
      let currentStep = step;
      
      if (currentStep === 1) {
        selector = '[data-progression-week-stats]';
      } else if (currentStep === 2) {
        // Check if subject breakdown exists
        const subjectElement = document.querySelector('[data-progression-subject-breakdown]');
        if (!subjectElement) {
          // Skip to history
          selector = '[data-progression-history]';
          currentStep = 3;
        } else {
          selector = '[data-progression-subject-breakdown]';
        }
      } else if (currentStep === 3) {
        selector = '[data-progression-history]';
      }

      setActualStep(currentStep);

      const element = document.querySelector(selector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(updateTargetRect, 50);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [step]);

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      // Check if next element exists
      let nextSelector = '';
      if (step === 1) {
        nextSelector = '[data-progression-subject-breakdown]';
      } else if (step === 2) {
        nextSelector = '[data-progression-history]';
      }

      const nextElement = document.querySelector(nextSelector);
      if (nextElement || step === 2) {
        setStep(step + 1);
      } else {
        // Skip to history if no subjects
        setStep(3);
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
      icon: <Target className="w-6 h-6 text-primary" />,
      title: 'Tes stats de la semaine',
      description: 'Retrouve ici le nombre d\'heures planifiées, réalisées et ton taux de complétion hebdomadaire.',
    },
    2: {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: 'Répartition par matière',
      description: 'Visualise le temps passé sur chaque matière cette semaine pour équilibrer tes révisions.',
    },
    3: {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: 'Ton historique',
      description: 'Suis ta progression sur les dernières semaines et observe ton évolution dans le temps.',
    },
  };

  const current = stepContent[actualStep as keyof typeof stepContent];

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
          <mask id="progression-tutorial-mask">
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
          mask="url(#progression-tutorial-mask)"
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
              Étape {actualStep}/{totalSteps}
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
                {step === totalSteps ? 'Compris' : 'Suivant'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
