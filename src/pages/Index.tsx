import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  Calendar, 
  Clock, 
  Target, 
  ArrowRight, 
  Monitor, 
  Zap, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Brain,
  CalendarCheck,
  GraduationCap
} from 'lucide-react';
import logo from '@/assets/logo.png';
import HeroMiniDashboard3D from '@/components/HeroMiniDashboard3D';
import { useIsMobile } from '@/hooks/use-mobile';

// Animated Section wrapper
const AnimatedSection = ({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </section>
  );
};

// Animated div wrapper
const AnimatedDiv = ({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  // Mobile-only fullscreen page
  if (isMobile) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="Skoolife" className="w-20 h-20 rounded-2xl shadow-lg mb-8" />
        <h1 className="text-2xl font-bold text-primary-foreground mb-4">
          Skoolife est optimisé pour ordinateur
        </h1>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-sm">
          Pour profiter pleinement de ton planning de révisions, connecte-toi depuis un ordinateur.
        </p>
        <div className="flex items-center gap-2 text-primary-foreground/60">
          <Monitor className="w-5 h-5" />
          <span className="text-sm">Reviens sur PC pour commencer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed left-0 right-0 z-50 p-6 bg-background/80 backdrop-blur-md top-0">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl shadow-glow" />
            <span className="text-xl font-bold text-foreground font-heading">Skoolife</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="default" size="sm">
                Espace étudiants
              </Button>
            </Link>
            <Button variant="outline" size="sm" disabled className="opacity-60 cursor-not-allowed">
              Espace écoles
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative pt-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20">
          {/* Hero Section with Text + 3D Dashboard */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left - Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Main heading */}
              <div className="space-y-6 animate-slide-up">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight font-heading">
                  Tes révisions,
                  <br />
                  <span className="gradient-text-animated font-heading">
                    enfin organisées
                  </span>
                </h1>
                <p className="max-w-xl text-lg sm:text-xl text-muted-foreground">
                  Skoolife génère automatiquement ton planning de révisions personnalisé 
                  en fonction de tes examens, ton emploi du temps et ton rythme.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="xl">
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground/70 self-center">
                  Disponible sur ordinateur uniquement
                </p>
              </div>
            </div>

            {/* Right - 3D Mini Dashboard */}
            <div className="flex-1 w-full lg:w-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
              <HeroMiniDashboard3D />
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <AnimatedSection className="py-20 bg-card/30">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedDiv className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
                Tu connais cette situation ?
              </h2>
              <p className="text-lg text-muted-foreground">
                Les révisions, c'est souvent le chaos. Tu ne sais pas par où commencer, 
                tu procrastines, et à la fin tu révises tout au dernier moment.
              </p>
            </AnimatedDiv>
            
            <div className="grid md:grid-cols-3 gap-6">
              <AnimatedDiv delay={0}>
                <ProblemCard 
                  emoji="😰"
                  title="Le stress des examens"
                  description="Tu ne sais jamais si tu as assez révisé ou si tu as oublié une matière importante."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={100}>
                <ProblemCard 
                  emoji="📅"
                  title="Pas le temps"
                  description="Entre les cours, le travail et ta vie perso, difficile de trouver du temps pour réviser."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={200}>
                <ProblemCard 
                  emoji="🤯"
                  title="Trop de matières"
                  description="Comment prioriser quand tu as 10 matières et que tout semble urgent ?"
                />
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        {/* Solution Section */}
        <AnimatedSection className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedDiv className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">La solution</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
                Un planning de révisions qui te ressemble
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Skoolife analyse tes examens, ton emploi du temps et tes préférences 
                pour créer un planning réaliste et personnalisé.
              </p>
            </AnimatedDiv>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedDiv delay={0}>
                <FeatureCard
                  icon={<Calendar className="w-6 h-6" />}
                  title="Import emploi du temps"
                  description="Importe ton calendrier (.ics) depuis ton ENT ou Google Calendar. Skoolife évite automatiquement tes créneaux occupés."
                  highlight
                />
              </AnimatedDiv>
              <AnimatedDiv delay={100}>
                <FeatureCard
                  icon={<Target className="w-6 h-6" />}
                  title="Priorisation intelligente"
                  description="Les matières avec des examens proches et les plus importantes sont planifiées en priorité. Plus de stress."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={200}>
                <FeatureCard
                  icon={<Clock className="w-6 h-6" />}
                  title="Adapté à ton rythme"
                  description="Tu préfères réviser le matin ? Le soir ? En sessions courtes ? Skoolife s'adapte à toi."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={300}>
                <FeatureCard
                  icon={<Users className="w-6 h-6" />}
                  title="Révise avec tes camarades"
                  description="Invite tes amis à réviser ensemble. En présentiel ou en visio, Skoolife organise vos sessions."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={400}>
                <FeatureCard
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Suis ta progression"
                  description="Visualise tes heures de révision par matière, ta régularité et ton taux de complétion."
                />
              </AnimatedDiv>
              <AnimatedDiv delay={500}>
                <FeatureCard
                  icon={<Zap className="w-6 h-6" />}
                  title="Ajustement intelligent"
                  description="Session ratée ? Pas de problème. Skoolife réajuste automatiquement ton planning."
                />
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        {/* How it works */}
        <AnimatedSection className="py-24 bg-card/30">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedDiv className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                En quelques minutes, ton planning est prêt. Vraiment.
              </p>
            </AnimatedDiv>

            <div className="grid md:grid-cols-4 gap-8">
              <AnimatedDiv delay={0}>
                <Step 
                  number={1} 
                  icon={<GraduationCap className="w-5 h-5" />}
                  title="Crée ton compte" 
                  description="Inscription en 30 secondes avec email ou Google" 
                />
              </AnimatedDiv>
              <AnimatedDiv delay={150}>
                <Step 
                  number={2} 
                  icon={<BookOpen className="w-5 h-5" />}
                  title="Ajoute tes matières" 
                  description="Dates d'examens, importance, objectifs d'heures" 
                />
              </AnimatedDiv>
              <AnimatedDiv delay={300}>
                <Step 
                  number={3} 
                  icon={<CalendarCheck className="w-5 h-5" />}
                  title="Importe ton EDT" 
                  description="Fichier .ics depuis ton ENT ou calendrier" 
                />
              </AnimatedDiv>
              <AnimatedDiv delay={450}>
                <Step 
                  number={4} 
                  icon={<Brain className="w-5 h-5" />}
                  title="Génère ton planning" 
                  description="En un clic, ta semaine est organisée" 
                />
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        {/* Benefits Section */}
        <AnimatedSection className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedDiv>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 font-heading">
                  Fini le stress des révisions
                </h2>
                <div className="space-y-6">
                  <BenefitItem 
                    title="Gagne du temps"
                    description="Plus besoin de passer des heures à planifier. Skoolife fait le travail pour toi."
                  />
                  <BenefitItem 
                    title="Révise sereinement"
                    description="Avec un planning clair, tu sais exactement quoi faire et quand."
                  />
                  <BenefitItem 
                    title="Améliore tes résultats"
                    description="Une révision régulière et structurée = de meilleures notes."
                  />
                  <BenefitItem 
                    title="Garde l'équilibre"
                    description="Skoolife respecte ton temps libre et tes contraintes personnelles."
                  />
                </div>
              </AnimatedDiv>
              
              <AnimatedDiv delay={200}>
                <div className="relative">
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="text-7xl font-bold text-primary font-heading">89%</div>
                      <p className="text-xl text-muted-foreground max-w-xs">
                        des étudiants se sentent plus organisés après une semaine d'utilisation
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        {/* Pricing Preview */}
        <AnimatedSection className="py-24 bg-card/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedDiv>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
                Des tarifs pensés pour les étudiants
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Parce que les étudiants n'ont pas des budgets illimités, 
                Skoolife reste accessible à tous.
              </p>
            </AnimatedDiv>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <AnimatedDiv delay={100}>
                <PricingCard 
                  name="Student"
                  price="2,99€"
                  period="/mois"
                  description="L'essentiel pour organiser tes révisions"
                  features={[
                    "Planning automatique",
                    "Import calendrier",
                    "Suivi de progression",
                    "Gestion des matières"
                  ]}
                />
              </AnimatedDiv>
              <AnimatedDiv delay={200}>
                <PricingCard 
                  name="Major"
                  price="4,99€"
                  period="/mois"
                  description="Pour réviser avec tes camarades"
                  features={[
                    "Tout Student +",
                    "Sessions de groupe",
                    "Invitations illimitées",
                    "Visio intégrée"
                  ]}
                  highlighted
                />
              </AnimatedDiv>
            </div>

            <AnimatedDiv delay={300}>
              <p className="mt-8 text-sm text-muted-foreground">
                7 jours d'essai gratuit sur tous les plans • Annulation à tout moment
              </p>
            </AnimatedDiv>
          </div>
        </AnimatedSection>

        {/* Final CTA */}
        <AnimatedSection className="py-32">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedDiv>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
                Prêt à réviser sereinement ?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
                Rejoins les étudiants qui ont repris le contrôle de leurs révisions.
              </p>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="hover-lift">
                  Créer mon planning gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </AnimatedDiv>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold font-heading">Skoolife</span>
            </Link>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
              <a 
                href="https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Communauté WhatsApp
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 Skoolife. Fait avec ❤️ pour les étudiants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Components

const ProblemCard = ({ emoji, title, description }: { emoji: string; title: string; description: string }) => (
  <div className="p-6 rounded-2xl bg-card border border-border/50 h-full transition-transform duration-300 hover:scale-[1.02]">
    <div className="text-4xl mb-4">{emoji}</div>
    <h3 className="text-lg font-semibold mb-2 font-heading">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, highlight }: { icon: React.ReactNode; title: string; description: string; highlight?: boolean }) => (
  <div className={`group p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full ${
    highlight 
      ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
      : 'bg-card border-border hover:border-primary/20'
  }`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 ${
      highlight 
        ? 'bg-primary/20 text-primary' 
        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
    }`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 font-heading">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative mb-6">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-glow group-hover:scale-110 transition-transform duration-300 font-heading">
        {number}
      </div>
      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    <h3 className="font-semibold mb-2 font-heading text-lg">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const BenefitItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <CheckCircle2 className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h3 className="font-semibold mb-1 font-heading">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const PricingCard = ({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  highlighted 
}: { 
  name: string; 
  price: string; 
  period: string; 
  description: string; 
  features: string[];
  highlighted?: boolean;
}) => (
  <div className={`p-8 rounded-2xl border text-left h-full transition-transform duration-300 hover:scale-[1.02] ${
    highlighted 
      ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20' 
      : 'bg-card border-border'
  }`}>
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-2 font-heading">{name}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold font-heading">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </div>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Index;
