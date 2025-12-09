import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, HelpCircle, MessageSquare, Upload, Target, Calendar, Sparkles, Send, Loader2 } from 'lucide-react';

interface SupportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowTutorial?: () => void;
}

const SupportDrawer = ({ open, onOpenChange, onShowTutorial }: SupportDrawerProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackType || !feedbackMessage.trim()) {
      toast.error('Remplis tous les champs');
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.from('user_feedback').insert({
        user_id: user?.id || null,
        type: feedbackType,
        message: feedbackMessage.trim(),
        route: location.pathname,
      });

      if (error) throw error;

      toast.success('Merci, ton retour nous aide à améliorer Skoolife 🙌');
      setFeedbackType('');
      setFeedbackMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue, réessaie dans quelques instants.');
    } finally {
      setSending(false);
    }
  };

  const guideSteps = [
    {
      icon: Upload,
      title: 'Importer ton calendrier (.ics)',
      description: "Exporte ton emploi du temps depuis ton ENT ou Google Calendar et importe-le dans Skoolife. Les créneaux occupés seront automatiquement évités lors de la génération.",
    },
    {
      icon: Target,
      title: "Ajouter tes matières et dates d'examen",
      description: "Crée tes matières avec leur coefficient, leur date d'examen et un objectif d'heures de révision. Plus une matière est importante ou proche, plus elle sera priorisée.",
    },
    {
      icon: Calendar,
      title: 'Ajouter tes contraintes',
      description: "Indique tes activités régulières (sport, job, perso) pour que Skoolife les évite. Tu peux créer des événements ponctuels ou récurrents.",
    },
    {
      icon: Sparkles,
      title: 'Générer ton planning',
      description: "Clique sur 'Générer mon planning' et Skoolife répartit tes révisions intelligemment sur la semaine. Tu peux aussi utiliser 'Ajuster ma semaine' pour compléter un planning existant.",
    },
  ];

  const faqItems = [
    {
      question: "Je n'ai aucun événement après l'import .ics, que faire ?",
      answer: "Vérifie que ton fichier .ics est bien valide et qu'il contient des événements pour les prochaines semaines. Si tu utilises un ENT, assure-toi d'exporter le calendrier au format iCal/ICS. Tu peux aussi essayer de sélectionner une plage de dates plus large lors de l'export.",
    },
    {
      question: 'Comment modifier ou déplacer un événement ?',
      answer: "Clique sur n'importe quel événement dans la grille pour ouvrir ses options. Tu peux modifier son titre, ses horaires ou son type. Pour le déplacer, fais un glisser-déposer directement dans la grille.",
    },
    {
      question: "Comment fonctionne 'Générer mon planning' vs 'Ajuster ma semaine' ?",
      answer: "'Générer mon planning' recrée entièrement les sessions de la semaine en cours. 'Ajuster ma semaine' est plus intelligent : il garde tes sessions existantes et ajoute uniquement de nouvelles sessions pour atteindre tes objectifs par matière.",
    },
    {
      question: 'Puis-je désactiver certaines matières ou plages horaires ?',
      answer: "Oui ! Dans Paramètres, tu peux définir tes jours préférés, tes horaires de travail et le nombre d'heures max par jour. Les matières peuvent être supprimées ou modifiées dans 'Gérer mes matières'.",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Support Skoolife</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="guide" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
          </TabsList>

          {/* Guide rapide */}
          <TabsContent value="guide" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Les 4 étapes pour bien utiliser Skoolife :
            </p>
            
            <div className="space-y-4">
              {guideSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 rounded-lg border border-border bg-card/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {onShowTutorial && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  onOpenChange(false);
                  onShowTutorial();
                }}
              >
                Voir le tutoriel complet
              </Button>
            )}
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu as trouvé un bug ou une idée d'amélioration ? Dis-nous tout !
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionne un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐛 Bug</SelectItem>
                    <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Décris ton problème ou ton idée..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={5}
                />
              </div>

              <Button 
                onClick={handleSubmitFeedback} 
                disabled={sending || !feedbackType || !feedbackMessage.trim()}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default SupportDrawer;
