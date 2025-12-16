import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Check, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  Target, 
  BookOpen, 
  Settings, 
  Users, 
  Video, 
  BarChart3, 
  Sparkles,
  Shield,
  Clock,
  MessageCircle
} from 'lucide-react';
import logo from '@/assets/logo.png';

const PLANS = {
  student: {
    name: 'Student',
    price: '2,99',
    priceId: 'price_1Sel7HCG6ZnJ9jFuMwPpQ6uS',
    description: 'Tout pour organiser tes révisions',
    features: [
      { text: 'Planning de révisions intelligent', icon: Calendar },
      { text: 'Génération automatique de sessions', icon: Sparkles },
      { text: 'Gestion complète des matières', icon: BookOpen },
      { text: 'Import calendrier (.ics)', icon: Calendar },
      { text: 'Préférences de révisions', icon: Settings },
      { text: 'Support prioritaire', icon: MessageCircle },
    ],
    popular: false,
  },
  major: {
    name: 'Major',
    price: '4,99',
    priceId: 'price_1Sel7UCG6ZnJ9jFuyilMrJzF',
    description: 'Révise avec tes camarades',
    features: [
      { text: 'Tout de Student +', icon: Check, highlight: true },
      { text: 'Invitation de camarades', icon: Users },
      { text: 'Visio intégrée (Daily.co)', icon: Video },
      { text: 'Analytics de progression', icon: BarChart3 },
      { text: 'Sessions de révision en groupe', icon: Users },
      { text: 'Suivi détaillé des performances', icon: Target },
    ],
    popular: true,
  },
};

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleSelectPlan = async (planKey: 'student' | 'major') => {
    const plan = PLANS[planKey];
    setLoadingPlan(planKey);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground font-heading">Skoolife</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16 animate-slide-up">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            7 jours d'essai gratuit
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-heading">
            Choisis ta formule
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commence ton essai gratuit de 7 jours. Annule à tout moment, sans engagement.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Student Plan */}
          <Card className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            PLANS.student.popular ? 'border-primary shadow-glow' : 'border-border'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl font-heading">Skoolife {PLANS.student.name}</CardTitle>
              </div>
              <CardDescription className="text-base">{PLANS.student.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{PLANS.student.price}€</span>
                <span className="text-muted-foreground ml-2">/ mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {PLANS.student.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => handleSelectPlan('student')}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'student' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Commencer l'essai gratuit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Major Plan */}
          <Card className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            PLANS.major.popular ? 'border-primary shadow-glow' : 'border-border'
          }`}>
            {PLANS.major.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold shadow-lg">
                  Le plus populaire
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl font-heading">Skoolife {PLANS.major.name}</CardTitle>
              </div>
              <CardDescription className="text-base">{PLANS.major.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{PLANS.major.price}€</span>
                <span className="text-muted-foreground ml-2">/ mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {PLANS.major.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      'highlight' in feature && feature.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className={'highlight' in feature && feature.highlight ? 'font-semibold text-primary' : ''}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => handleSelectPlan('major')}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'major' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Commencer l'essai gratuit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-medium">Paiement sécurisé</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
            <Clock className="w-6 h-6 text-primary" />
            <span className="font-medium">Annule quand tu veux</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
            <MessageCircle className="w-6 h-6 text-primary" />
            <span className="font-medium">Support réactif</span>
          </div>
        </div>

        {/* FAQ / Support */}
        <div className="text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <h2 className="text-2xl font-bold mb-4 font-heading">Une question ?</h2>
          <p className="text-muted-foreground mb-6">
            Notre équipe est là pour t'aider à choisir la formule adaptée à tes besoins.
          </p>
          <a
            href="https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Nous contacter sur WhatsApp
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
