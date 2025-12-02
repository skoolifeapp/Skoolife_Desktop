import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, X } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  targetId: string;
  position: "above" | "below";
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "1. Importer votre emploi du temps",
    description: "Commencez par importer le calendrier de votre école au format .ics pour bloquer automatiquement vos heures de cours.",
    targetId: "import-calendar-btn",
    position: "above",
  },
  {
    title: "2. Ajouter vos évènements",
    description: "Ajoutez vos activités personnelles, travail ou autres engagements pour que le planning les prenne en compte.",
    targetId: "add-event-btn",
    position: "below",
  },
  {
    title: "3. Modifier vos évènements",
    description: "Cliquez sur un évènement pour le modifier, ou glissez-déposez le directement dans la grille pour ajuster vos horaires selon vos besoins.",
    targetId: "weekly-grid",
    position: "above",
  },
  {
    title: "4. Configurer vos matières",
    description: "Ajoutez vos matières avec leurs dates d'examen et leur importance pour prioriser vos révisions.",
    targetId: "manage-subjects-btn",
    position: "above",
  },
  {
    title: "5. Générer votre planning",
    description: "Une fois tout configuré, générez automatiquement votre planning de révisions optimisé !",
    targetId: "generate-planning-btn",
    position: "above",
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export const TutorialOverlay = ({ onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateTargetPosition = () => {
      const targetElement = document.getElementById(tutorialSteps[currentStep].targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll to make button visible if needed
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateTargetPosition, 100);
    
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [currentStep]);

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
    if (!targetRect) return { opacity: 0 };
    
    const cardWidth = 340;
    const cardHeight = 200;
    const arrowGap = 50; // Increased gap for better button visibility
    
    let top: number;
    let left: number;
    
    if (step.position === "above") {
      top = targetRect.top - cardHeight - arrowGap;
      // If card would be off-screen at top, place it below
      if (top < 20) {
        top = targetRect.bottom + arrowGap;
      }
    } else {
      top = targetRect.bottom + arrowGap;
      // If card would be off-screen at bottom, place it above
      if (top + cardHeight > window.innerHeight - 20) {
        top = targetRect.top - cardHeight - arrowGap;
      }
    }
    
    // Center horizontally relative to button
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
    if (!targetRect) return true;
    const cardStyle = getCardStyle();
    const cardTop = parseInt(cardStyle.top as string);
    return cardTop < targetRect.top;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* SVG overlay with hole cut out for the target button */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="12"
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
          mask="url(#tutorial-mask)"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      {/* Highlight ring around the target button */}
      {targetRect && (
        <div
          className="fixed rounded-xl ring-4 ring-primary ring-offset-4 ring-offset-transparent animate-pulse pointer-events-none"
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
      {targetRect && (
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

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {step.title}
          </h3>
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

          {/* Arrow pointing to button */}
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
        </div>
      )}
    </div>
  );
};
