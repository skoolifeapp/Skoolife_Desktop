import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, STRIPE_PRODUCTS, SubscriptionTier } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Crown, GraduationCap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

const PLANS = [
  {
    id: 'student' as const,
    name: 'Student',
    price: '2,99',
    period: '/mois',
    description: 'Idéal pour commencer à organiser tes révisions',
    icon: GraduationCap,
    features: [
      'Dashboard de planning',
      'Gestion des matières',
      'Paramètres personnalisés',
      'Import calendrier .ics',
      'Génération de planning IA',
    ],
    notIncluded: [
      'Suivi de progression',
      'Inviter des camarades',
    ],
    priceId: STRIPE_PRODUCTS.student.price_id,
    highlight: false,
  },
  {
    id: 'major' as const,
    name: 'Major',
    price: '4,99',
    period: '/mois',
    description: 'Accès complet à toutes les fonctionnalités',
    icon: Crown,
    features: [
      'Dashboard de planning',
      'Gestion des matières',
      'Paramètres personnalisés',
      'Import calendrier .ics',
      'Génération de planning IA',
      'Suivi de progression',
      'Inviter des camarades',
      'Réviser en visio',
    ],
    notIncluded: [],
    priceId: STRIPE_PRODUCTS.major.price_id,
    highlight: true,
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, subscriptionTier, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoadingPlan(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée, veuillez vous reconnecter');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getCurrentPlanLabel = (planId: string): string | null => {
    if (subscriptionLoading) return null;
    if (subscriptionTier === planId) return 'Ton abonnement actuel';
    return null;
  };

  const isCurrentPlan = (planId: string): boolean => {
    return subscriptionTier === planId;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Skoolife" className="h-8 w-auto rounded-lg" />
            <span className="font-bold text-lg text-foreground">Skoolife</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Choisis ton offre
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Débloque tout ton potentiel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organise tes révisions intelligemment et atteins tes objectifs avec Skoolife.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const currentLabel = getCurrentPlanLabel(plan.id);
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden transition-all ${
                  plan.highlight 
                    ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]' 
                    : 'border-border'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-medium py-1">
                    Le plus populaire
                  </div>
                )}
                
                {currentLabel && (
                  <Badge 
                    className="absolute top-3 right-3 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  >
                    {currentLabel}
                  </Badge>
                )}

                <CardHeader className={plan.highlight ? 'pt-8' : ''}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                    disabled={loadingPlan !== null || isCurrent}
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : isCurrent ? (
                      'Abonnement actif'
                    ) : (
                      'Commencer maintenant'
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-muted-foreground">✕</span>
                        </div>
                        <span className="text-sm text-muted-foreground line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Free invite info */}
        {subscriptionTier === 'free_invite' && (
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center max-w-2xl mx-auto">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tu as un compte gratuit d'invité. Abonne-toi pour accéder à toutes les fonctionnalités de Skoolife !
            </p>
          </div>
        )}

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Annule à tout moment • Paiement sécurisé par Stripe • Facture disponible
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
