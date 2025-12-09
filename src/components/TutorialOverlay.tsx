import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, Plus, GraduationCap, Sparkles } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  targetId: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Importer votre emploi du temps",
    description: "Commencez par importer le calendrier de votre école au format .ics pour bloquer automatiquement vos heures de cours.",
    targetId: "import-calendar-btn",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    title: "Ajouter vos évènements",
    description: "Ajoutez vos activités personnelles, travail ou autres engagements pour que le planning les prenne en compte.",
    targetId: "add-event-btn",
    icon: <Plus className="w-6 h-6 text-primary" />,
  },
  {
    title: "Configurer vos matières",
    description: "Ajoutez vos matières avec leurs dates d'examen et leur importance pour prioriser vos révisions.",
    targetId: "manage-subjects-btn",
    icon: <GraduationCap className="w-6 h-6 text-primary" />,
  },
  {
    title: "Générer votre planning",
    description: "Une fois tout configuré, générez automatiquement votre planning de révisions optimisé !",
    targetId: "generate-planning-btn",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
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
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const timer = setTimeout(updateTargetPosition, 100);
    
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = tutorialSteps[currentStep];
  const padding = 8;
  const holeX = targetRect ? targetRect.left - padding : 0;
  const holeY = targetRect ? targetRect.top - padding : 0;
  const holeWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const holeHeight = targetRect ? targetRect.height + padding * 2 : 0;

  // Calculate card position
  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10002,
  };

  if (targetRect) {
    const cardWidth = 340;
    const cardHeight = 200;
    const gap = 20;

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
    cardStyle.width = 340;
  }

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* SVG Overlay with hole */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 10000 }}
      >
        <defs>
          <mask id="dashboard-tutorial-mask">
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
          mask="url(#dashboard-tutorial-mask)"
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
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex gap-1.5">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
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
                {currentStep === tutorialSteps.length - 1 ? 'Compris' : 'Suivant'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
