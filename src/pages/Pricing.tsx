import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, STRIPE_PRODUCTS } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2, ArrowRight, Crown, GraduationCap, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const PLANS = [
  {
    id: 'student' as const,
    name: 'Student',
    priceMonthly: '2,99',
    priceYearly: '29,90',
    period: '/mois',
    periodYearly: '/an',
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
  },
  {
    id: 'major' as const,
    name: 'Major',
    priceMonthly: '4,99',
    priceYearly: '49,90',
    period: '/mois',
    periodYearly: '/an',
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
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
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
    return !!user && subscriptionTier === planId;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 p-6 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-slate-900 font-heading">Skoolife</span>
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
        <div className="text-center mb-12 animate-slide-up">
          <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Essai gratuit de 7 jours
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 font-heading">
            Un investissement pour ta
            <br />
            <span className="gradient-text-animated">réussite académique</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Moins cher qu'un café par semaine, plus efficace qu'un cours particulier.
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Mensuel
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Annuel
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 text-xs">
              -17%
            </Badge>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const period = isYearly ? plan.periodYearly : plan.period;

            return (
              <div 
                key={plan.id}
                className={`
                  relative rounded-3xl bg-white transition-all duration-300
                  ${plan.highlight 
                    ? 'border-2 border-yellow-400 shadow-xl shadow-yellow-500/10' 
                    : 'border border-slate-200 shadow-sm hover:shadow-md'
                  }
                  animate-slide-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular badge for Major */}
                {plan.highlight && (
                  <div className="absolute -top-3 right-6">
                    <Badge className="bg-yellow-400 text-slate-900 border-0 font-semibold px-3 py-1 shadow-md">
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                <div className="p-8 md:p-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${plan.highlight 
                        ? 'bg-yellow-400 text-slate-900' 
                        : 'bg-slate-100 text-slate-700'
                      }
                    `}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 font-heading">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-bold text-slate-900 font-heading">
                        {price}€
                      </span>
                      <span className="text-lg text-slate-500">{period}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`
                      w-full h-14 text-base font-semibold rounded-2xl transition-all duration-300
                      ${plan.highlight 
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-400/20' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
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
                            : 'bg-slate-100 text-slate-500'
                          }
                        `}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-slate-400">—</span>
                        </div>
                        <span className="text-sm text-slate-500">{feature}</span>
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
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 max-w-2xl mx-auto text-center">
            <p className="text-amber-700 font-medium">
              🎓 Tu as un compte gratuit d'invité. Abonne-toi pour débloquer tout Skoolife !
            </p>
          </div>
        )}

        {/* Trust badges - horizontal row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-16">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Paiement sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Annule quand tu veux</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4" />
            <span className="text-sm">Support réactif</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-12 px-8 rounded-3xl bg-white border border-slate-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading text-slate-900">
            Une question ?
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
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
      <footer className="relative z-10 border-t border-slate-200 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-8 h-8 rounded-lg" />
            <span className="font-bold font-heading text-slate-900">Skoolife</span>
          </Link>
          <p className="text-sm text-slate-500">
            © 2025 Skoolife. Fait avec ❤️ pour les étudiants.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
