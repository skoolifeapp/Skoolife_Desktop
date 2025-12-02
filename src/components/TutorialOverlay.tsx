import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowLeft, X } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  targetId: string;
  arrowDirection: "down" | "left";
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "1. Importer votre emploi du temps",
    description: "Commencez par importer le calendrier de votre école au format .ics pour bloquer automatiquement vos heures de cours.",
    targetId: "import-calendar-btn",
    arrowDirection: "down",
  },
  {
    title: "2. Ajouter vos évènements",
    description: "Ajoutez vos activités personnelles, travail ou autres engagements pour que le planning les prenne en compte.",
    targetId: "add-event-btn",
    arrowDirection: "down",
  },
  {
    title: "3. Configurer vos matières",
    description: "Ajoutez vos matières avec leurs dates d'examen et leur importance pour prioriser vos révisions.",
    targetId: "manage-subjects-btn",
    arrowDirection: "down",
  },
  {
    title: "4. Générer votre planning",
    description: "Une fois tout configuré, générez automatiquement votre planning de révisions optimisé !",
    targetId: "generate-planning-btn",
    arrowDirection: "down",
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export const TutorialOverlay = ({ onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const updateTargetPosition = () => {
      const targetElement = document.getElementById(tutorialSteps[currentStep].targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Zone highlight autour du bouton ciblé */}
      {targetPosition && (
        <div
          className="absolute bg-transparent rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent z-10"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
          }}
        />
      )}

      {/* Carte du tutoriel */}
      {targetPosition && (
        <div
          className="absolute z-20 bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm animate-fade-in"
          style={{
            top: step.arrowDirection === "down" 
              ? targetPosition.top - 200 
              : targetPosition.top + (targetPosition.height / 2) - 80,
            left: step.arrowDirection === "down"
              ? targetPosition.left + (targetPosition.width / 2) - 160
              : targetPosition.left + targetPosition.width + 60,
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Indicateur d'étape */}
          <div className="flex gap-1.5 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
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

          {/* Flèche vers le bouton */}
          <div
            className={`absolute ${
              step.arrowDirection === "down"
                ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
                : "left-0 top-1/2 -translate-y-1/2 -translate-x-full"
            }`}
          >
            {step.arrowDirection === "down" ? (
              <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <ArrowLeft className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
