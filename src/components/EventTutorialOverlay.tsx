import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, X, MousePointer, Move } from "lucide-react";

interface EventTutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSteps: EventTutorialStep[] = [
  {
    title: "Modifier un évènement",
    description: "Clique sur un évènement pour changer son titre, ses horaires ou son type. Pratique pour corriger un import ou ajuster ton planning.",
    icon: <MousePointer className="w-5 h-5" />,
  },
  {
    title: "Déplacer ton évènement",
    description: "Tu peux faire glisser un évènement dans la grille pour le déplacer à un autre créneau, ou ajuster sa durée en tirant sur le bord.",
    icon: <Move className="w-5 h-5" />,
  },
];

interface EventTutorialOverlayProps {
  onComplete: () => void;
  targetEventElement?: HTMLElement | null;
}

export const EventTutorialOverlay = ({ onComplete, targetEventElement }: EventTutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateTargetPosition = () => {
      if (targetEventElement) {
        const rect = targetEventElement.getBoundingClientRect();
        setTargetRect(rect);
        targetEventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Try to find the first event in the grid
        const eventElement = document.querySelector('[data-event-id]') as HTMLElement;
        if (eventElement) {
          const rect = eventElement.getBoundingClientRect();
          setTargetRect(rect);
          eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    const timer = setTimeout(updateTargetPosition, 100);
    
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [currentStep, targetEventElement]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];
  const padding = 8;

  // Calculate card position
  const getCardStyle = () => {
    if (!targetRect) {
      // Center the card if no target found
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px',
        zIndex: 60,
      };
    }
    
    const cardWidth = 340;
    const cardHeight = 200;
    const arrowGap = 50;
    
    let top: number;
    let left: number;
    
    // Try to position below the target
    top = targetRect.bottom + arrowGap;
    
    // If card would be off-screen at bottom, place it above
    if (top + cardHeight > window.innerHeight - 20) {
      top = targetRect.top - cardHeight - arrowGap;
    }
    
    // Center horizontally relative to target
    left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);
    
    // Keep card within viewport horizontally
    if (left < 20) left = 20;
    if (left + cardWidth > window.innerWidth - 20) {
      left = window.innerWidth - cardWidth - 20;
    }
    
    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 60,
    };
  };

  // Determine if card is above or below target for arrow direction
  const isCardAbove = () => {
    if (!targetRect) return false;
    const cardStyle = getCardStyle();
    if (!cardStyle.top || typeof cardStyle.top !== 'string') return false;
    const cardTop = parseInt(cardStyle.top);
    return cardTop < targetRect.top;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* SVG overlay with hole cut out for the target event */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="event-tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="8"
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
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#event-tutorial-mask)"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      {/* Highlight ring around the target event */}
      {targetRect && (
        <div
          className="fixed rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent animate-pulse pointer-events-none"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            zIndex: 55,
          }}
        />
      )}

      {/* Tutorial card */}
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-6 animate-fade-in"
        style={getCardStyle()}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicators */}
        <div className="flex gap-1.5 mb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Icon and title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {step.icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {step.title}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {step.description}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer le tutoriel
          </button>
          <Button onClick={handleNext} size="sm">
            {currentStep < tutorialSteps.length - 1 ? "Suivant" : "Terminer"}
          </Button>
        </div>

        {/* Arrow pointing to event */}
        {targetRect && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${
              isCardAbove() ? "bottom-0 translate-y-full" : "top-0 -translate-y-full"
            }`}
          >
            {isCardAbove() ? (
              <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <ArrowUp className="h-8 w-8 text-primary animate-bounce" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
