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
  BarChart3, 
  Sparkles,
  MessageCircle,
  Timer,
  FolderOpen,
  ListTodo
} from 'lucide-react';
import { motion } from 'framer-motion';
const LOGO_URL = '/logo.png';
import { SUBSCRIPTION_TIERS } from '@/config/stripe';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParallaxBackground from '@/components/ParallaxBackground';
import { useConfetti } from '@/hooks/useConfetti';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const PLANS = {
  student: {
    ...SUBSCRIPTION_TIERS.student,
    features: [
      { text: 'Un planning qui s\'adapte à ton rythme', icon: Calendar },
      { text: 'Tes sessions de révisions générées en 1 clic', icon: Sparkles },
      { text: 'Toutes tes matières au même endroit', icon: BookOpen },
      { text: 'Mode focus avec timer Pomodoro', icon: Timer },
      { text: 'Personnalise selon tes préférences', icon: Settings },
      { text: 'Support par chat inclus', icon: MessageCircle },
    ],
    popular: false,
  },
  major: {
    ...SUBSCRIPTION_TIERS.major,
    features: [
      { text: 'Tout de Student +', icon: Check, highlight: true },
      { text: 'Suis ta progression en temps réel', icon: BarChart3 },
      { text: 'Centralise toutes tes fiches', icon: FolderOpen },
      { text: 'Gère tes tâches avec une to-do list', icon: ListTodo },
      { text: 'Visualise tes performances par matière', icon: Target },
      { text: 'Support prioritaire', icon: MessageCircle },
    ],
    popular: true,
  },
};

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { triggerConfetti } = useConfetti();

  const handleSelectPlan = async (planKey: 'student' | 'major') => {
    triggerConfetti();
    
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

      {/* Background decorations with parallax */}
      <ParallaxBackground />

      {/* Main content */}
      <main className="relative max-w-5xl mx-auto px-4 pt-24 md:pt-32 pb-16">
        {/* Hero */}
        <motion.div 
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 font-heading"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            Choisis ta formule
          </motion.h1>
          <motion.p 
            className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Commence ton essai gratuit de 7 jours. Annule à tout moment, sans engagement.
          </motion.p>
        </motion.div>

        {/* Plans */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Student Plan */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
            <Card className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full ${
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
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
          </motion.div>

          {/* Major Plan */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full ${
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
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
          </motion.div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default Pricing;