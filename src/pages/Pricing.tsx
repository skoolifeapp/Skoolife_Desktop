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
  MessageCircle,
  Percent
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { SUBSCRIPTION_TIERS } from '@/config/stripe';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PLANS = {
  student: {
    ...SUBSCRIPTION_TIERS.student,
    features: [
      { text: 'Planning intelligent qui s\'adapte à toi', icon: Calendar },
      { text: 'Génération auto de tes sessions', icon: Sparkles },
      { text: 'Organise toutes tes matières facilement', icon: BookOpen },
      { text: 'Importe ton emploi du temps en 1 clic', icon: Calendar },
      { text: 'Timer Pomodoro pour rester focus', icon: Target },
      { text: 'Support réactif par chat', icon: MessageCircle },
    ],
    popular: false,
  },
  major: {
    ...SUBSCRIPTION_TIERS.major,
    features: [
      { text: 'Tout de Student +', icon: Check, highlight: true },
      { text: 'Invite tes potes à réviser ensemble', icon: Users },
      { text: 'Appels vidéo intégrés directement', icon: Video },
      { text: 'Statistiques détaillées de progression', icon: BarChart3 },
      { text: 'Sessions de groupe motivantes', icon: Users },
      { text: 'Suis tes performances par matière', icon: Target },
    ],
    popular: true,
  },
};

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planKey: 'student' | 'major') => {
    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    const plan = PLANS[planKey];
    setLoadingPlan(planKey);

    // Open the window immediately on user click to avoid popup blocker
    const newWindow = window.open('about:blank', '_blank');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) throw error;

      if (data?.url && newWindow) {
        newWindow.location.href = data.url;
      } else if (data?.url) {
        // Fallback if popup was blocked
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (newWindow) newWindow.close();
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative max-w-5xl mx-auto px-4 pt-24 md:pt-32 pb-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 font-heading">
            Choisis ta formule
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl text-muted-foreground line-through">{PLANS.student.price}€</span>
                <span className="text-4xl font-bold text-foreground">2,39€</span>
                <span className="text-muted-foreground">/ mois</span>
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <Percent className="w-3 h-3" />
                  -20% les 2 premiers mois
                </Badge>
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
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl text-muted-foreground line-through">{PLANS.major.price}€</span>
                <span className="text-4xl font-bold text-foreground">3,99€</span>
                <span className="text-muted-foreground">/ mois</span>
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <Percent className="w-3 h-3" />
                  -20% les 2 premiers mois
                </Badge>
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

      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
