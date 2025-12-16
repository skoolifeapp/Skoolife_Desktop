import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, STRIPE_PRODUCTS } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowRight, Crown, GraduationCap, X, Star, Zap, Shield, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PublicHeader } from '@/components/PublicHeader';
import logo from '@/assets/logo.png';

const PLANS = [
  {
    id: 'student' as const,
    name: 'Student',
    price: '2,99',
    period: '/mois',
    yearlyPrice: '29,90',
    icon: GraduationCap,
    features: [
      'Planning de révisions intelligent',
      'Import calendrier .ics',
      'Gestion des matières & examens',
      'Préférences personnalisées',
      'Ajustement automatique',
    ],
    notIncluded: [
      'Suivi de progression',
      'Sessions en groupe',
      'Révisions en visio',
    ],
    priceId: STRIPE_PRODUCTS.student.price_id,
    highlight: false,
  },
  {
    id: 'major' as const,
    name: 'Major',
    price: '4,99',
    period: '/mois',
    yearlyPrice: '49,90',
    icon: Crown,
    features: [
      'Tout de Student inclus',
      'Suivi de progression complet',
      'Statistiques détaillées',
      'Inviter des camarades',
      'Révisions en visio intégrées',
    ],
    notIncluded: [],
    priceId: STRIPE_PRODUCTS.major.price_id,
    highlight: true,
  },
];

const TESTIMONIALS = [
  { name: 'Marie L.', school: 'Sciences Po', text: 'J\'ai enfin un planning qui s\'adapte à mes cours !', rating: 5 },
  { name: 'Thomas B.', school: 'ESSEC', text: 'Fini le stress des révisions de dernière minute.', rating: 5 },
  { name: 'Léa M.', school: 'Médecine P6', text: 'Indispensable pour gérer mes 12 UE.', rating: 5 },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, subscriptionTier } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string, planId: string) => {
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
    // Only show "Actif" if user has a paid subscription matching this plan
    return !!user && (subscriptionTier === 'student' || subscriptionTier === 'major') && subscriptionTier === planId;
  };

  const FAQ = [
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement. Tu peux annuler en 2 clics depuis ton espace.' },
    { q: 'Y a-t-il un essai gratuit ?', a: 'Oui ! 7 jours d\'essai gratuit sur tous les plans, sans CB au départ.' },
    { q: 'Comment fonctionne le planning IA ?', a: 'L\'algorithme analyse tes examens, tes disponibilités et génère un planning optimal automatiquement.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader 
        showBack 
        rightContent={
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              J'ai déjà un compte
            </Button>
          </Link>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            7 jours d'essai gratuit
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading mb-4 leading-tight">
            Arrête de subir tes révisions.
            <br />
            <span className="text-primary">Organise-les.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            Le prix d'un kebab par mois pour ne plus jamais stresser avant un exam.
          </p>
        </div>

        {/* Social Proof Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 md:mb-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-background" />
              ))}
            </div>
            <span className="ml-2 font-medium text-foreground">500+ étudiants</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
            <span className="ml-1 font-medium text-foreground">4.9/5</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <div 
                key={plan.id}
                className={`
                  relative rounded-2xl border-2 transition-all duration-300
                  ${plan.highlight 
                    ? 'border-primary bg-primary/[0.03] shadow-xl shadow-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Recommandé
                    </Badge>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center
                      ${plan.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-bold font-heading">{plan.price}€</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      soit {plan.yearlyPrice}€/an • Annulable à tout moment
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    className={`
                      w-full h-12 font-semibold rounded-xl mb-6
                      ${plan.highlight 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'bg-foreground hover:bg-foreground/90 text-background'
                      }
                    `}
                    disabled={loadingPlan !== null || isCurrent}
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCurrent ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Actif
                      </>
                    ) : (
                      <>
                        Commencer gratuitement
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-muted-foreground" />
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

        {/* Free invite alert */}
        {subscriptionTier === 'free_invite' && (
          <div className="mb-12 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
              Tu as un compte invité gratuit — Abonne-toi pour tout débloquer !
            </p>
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold font-heading text-center mb-8">
            Ce qu'en disent les étudiants
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-3">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-16 md:mb-20 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span>Paiement sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5 text-primary" />
            <span>Annulation en 2 clics</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-5 h-5 text-primary" />
            <span>Support 24h</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-xl md:text-2xl font-bold font-heading text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div 
                key={i}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-10 px-6 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">
            Prêt à réussir tes exams ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Rejoins les centaines d'étudiants qui ont repris le contrôle de leurs révisions.
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 font-semibold"
            onClick={() => !user ? navigate('/auth?mode=signup') : handleSubscribe(STRIPE_PRODUCTS.major.price_id, 'major')}
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            7 jours gratuits • Sans engagement
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Skoolife" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-sm font-heading">Skoolife</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © 2025 Skoolife
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
