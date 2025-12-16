import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, STRIPE_PRODUCTS } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowRight, Crown, GraduationCap, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const PLANS = [
  {
    id: 'student' as const,
    name: 'Student',
    price: '2,99',
    period: '/mois',
    tagline: 'Pour bien démarrer',
    description: 'Toutes les bases pour organiser tes révisions efficacement.',
    icon: GraduationCap,
    features: [
      { text: 'Planning de révisions IA', highlight: true },
      { text: 'Import calendrier .ics', highlight: false },
      { text: 'Gestion des matières', highlight: false },
      { text: 'Préférences personnalisées', highlight: false },
      { text: 'Ajustement intelligent', highlight: false },
    ],
    notIncluded: [
      'Suivi de progression',
      'Sessions en groupe',
      'Révisions en visio',
    ],
    priceId: STRIPE_PRODUCTS.student.price_id,
    highlight: false,
    gradient: 'from-secondary via-card to-card',
  },
  {
    id: 'major' as const,
    name: 'Major',
    price: '4,99',
    period: '/mois',
    tagline: 'L\'expérience complète',
    description: 'Accès illimité à toutes les fonctionnalités Skoolife.',
    icon: Crown,
    features: [
      { text: 'Tout de Student, plus :', highlight: true },
      { text: 'Suivi de progression détaillé', highlight: true },
      { text: 'Inviter des camarades', highlight: true },
      { text: 'Révisions en visio intégrées', highlight: true },
      { text: 'Statistiques avancées', highlight: false },
    ],
    notIncluded: [],
    priceId: STRIPE_PRODUCTS.major.price_id,
    highlight: true,
    gradient: 'from-primary/20 via-card to-card',
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, subscriptionTier, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string, planId: string) => {
    // User must be logged in to subscribe
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setLoadingPlan(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId: string): boolean => {
    return !!user && subscriptionTier === planId;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl shadow-glow" />
            <span className="text-xl font-bold text-foreground font-heading">Skoolife</span>
          </Link>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
              Retour au dashboard
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                J'ai déjà un compte
              </Button>
            </Link>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16 animate-slide-up">
          <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Essai gratuit de 7 jours
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading">
            Un investissement pour ta
            <br />
            <span className="gradient-text-animated">réussite académique</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Moins cher qu'un café par semaine, plus efficace qu'un cours particulier.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <div 
                key={plan.id}
                className={`
                  relative group rounded-3xl overflow-hidden transition-all duration-500
                  ${plan.highlight 
                    ? 'shadow-2xl shadow-primary/20 scale-[1.02] hover:scale-[1.04]' 
                    : 'shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                  }
                  animate-slide-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${plan.gradient}`} />
                
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
                )}

                <div className="relative p-8 md:p-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${plan.highlight 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                          : 'bg-secondary text-foreground group-hover:bg-primary/10'
                        }
                      `}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground font-heading">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                      </div>
                    </div>
                    {plan.highlight && (
                      <Badge className="bg-primary text-primary-foreground border-0 font-medium">
                        Populaire
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-bold text-foreground font-heading">
                        {plan.price}€
                      </span>
                      <span className="text-lg text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`
                      w-full h-14 text-base font-semibold rounded-2xl transition-all duration-300
                      ${plan.highlight 
                        ? 'bg-primary hover:bg-accent text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' 
                        : 'bg-foreground hover:bg-foreground/90 text-background'
                      }
                    `}
                    disabled={loadingPlan !== null || isCurrent}
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Abonnement actif
                      </>
                    ) : (
                      <>
                        Choisir {plan.name}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                          ${feature.highlight 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-40">
                        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-muted-foreground">—</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free invite info */}
        {subscriptionTier === 'free_invite' && (
          <div className="mb-16 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 max-w-2xl mx-auto text-center">
            <p className="text-amber-700 dark:text-amber-300 font-medium">
              🎓 Tu as un compte gratuit d'invité. Abonne-toi pour débloquer tout Skoolife !
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <TrustBadge 
            icon={<Shield className="w-5 h-5" />}
            title="Paiement sécurisé"
            description="Chiffré par Stripe"
          />
          <TrustBadge 
            icon={<Zap className="w-5 h-5" />}
            title="Annule quand tu veux"
            description="Sans engagement"
          />
          <TrustBadge 
            icon={<Users className="w-5 h-5" />}
            title="Support réactif"
            description="On répond vite"
          />
        </div>

        {/* Final CTA */}
        <div className="text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
            Une question ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Contacte-nous sur WhatsApp, on te répond en moins de 24h.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-2xl"
            onClick={() => window.open('https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc', '_blank')}
          >
            Rejoindre la communauté
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-8 h-8 rounded-lg" />
            <span className="font-bold font-heading">Skoolife</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2025 Skoolife. Fait avec ❤️ pour les étudiants.
          </p>
        </div>
      </footer>
    </div>
  );
};

const TrustBadge = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Pricing;
