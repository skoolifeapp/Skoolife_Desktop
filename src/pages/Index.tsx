import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Target, 
  ArrowRight, 
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
import StackedCardsLayout from '@/components/StackedCardsLayout';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 z-50 px-4 py-3 md:p-6 bg-background/80 backdrop-blur-md top-0">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-glow" />
            <span className="text-lg md:text-xl font-bold text-foreground font-heading">Skoolife</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="default" size="sm" className="text-xs md:text-sm px-3 md:px-4">
                Espace étudiants
              </Button>
            </Link>
            <Button variant="outline" size="sm" disabled className="opacity-60 cursor-not-allowed hidden md:inline-flex">
              Espace écoles
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative pt-16 md:pt-20">
        {/* Background decorations - smaller on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Section - Centered Text */}
        <div className="relative max-w-4xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-16 text-center">
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Tes révisions,
              <br />
              <span className="gradient-text-animated font-heading">
                enfin organisées
              </span>
            </h1>
            <p className="max-w-2xl text-base md:text-lg lg:text-xl text-muted-foreground mx-auto">
              Skoolife génère automatiquement ton planning de révisions personnalisé 
              en fonction de tes examens, ton emploi du temps et ton rythme.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 md:mt-10 animate-slide-up">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg" className="md:text-base px-8">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>

          {/* Free text */}
          <p className="text-sm text-muted-foreground mt-4 animate-slide-up">
            Gratuit pendant 7 jours.
          </p>
        </div>

        {/* Dashboard Preview - Rising from bottom */}
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StackedCardsLayout />
          </div>
        </div>

        {/* Problem Section */}
        <section className="py-12 md:py-20 bg-card/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">
                Tu connais cette situation ?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Les révisions, c'est souvent le chaos. Tu ne sais pas par où commencer, 
                tu procrastines, et à la fin tu révises tout au dernier moment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <ProblemCard 
                emoji="😰"
                title="Le stress des examens"
                description="Tu ne sais jamais si tu as assez révisé ou si tu as oublié une matière importante."
              />
              <ProblemCard 
                emoji="📅"
                title="Pas le temps"
                description="Entre les cours, le travail et ta vie perso, difficile de trouver du temps pour réviser."
              />
              <ProblemCard 
                emoji="🤯"
                title="Trop de matières"
                description="Comment prioriser quand tu as 10 matières et que tout semble urgent ?"
              />
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary mb-4 md:mb-6">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">La solution</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">
                Un planning qui te ressemble
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Skoolife analyse tes examens, ton emploi du temps et tes préférences 
                pour créer un planning réaliste et personnalisé.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <FeatureCard
                icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                title="Import emploi du temps"
                description="Importe ton calendrier (.ics) depuis ton ENT ou Google Calendar."
                highlight
              />
              <FeatureCard
                icon={<Target className="w-5 h-5 md:w-6 md:h-6" />}
                title="Priorisation intelligente"
                description="Les matières avec des examens proches sont planifiées en priorité."
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5 md:w-6 md:h-6" />}
                title="Adapté à ton rythme"
                description="Tu préfères réviser le matin ou le soir ? Skoolife s'adapte."
              />
              <FeatureCard
                icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
                title="Révise avec tes amis"
                description="Invite tes amis à réviser ensemble, en présentiel ou en visio."
              />
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6" />}
                title="Suis ta progression"
                description="Visualise tes heures de révision et ton taux de complétion."
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5 md:w-6 md:h-6" />}
                title="Ajustement intelligent"
                description="Session ratée ? Skoolife réajuste automatiquement ton planning."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 md:py-24 bg-card/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">
                Comment ça marche ?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                En quelques minutes, ton planning est prêt. Vraiment.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <Step 
                number={1} 
                icon={<GraduationCap className="w-4 h-4 md:w-5 md:h-5" />}
                title="Crée ton compte" 
                description="Inscription en 30 secondes" 
              />
              <Step 
                number={2} 
                icon={<BookOpen className="w-4 h-4 md:w-5 md:h-5" />}
                title="Ajoute tes matières" 
                description="Dates et objectifs" 
              />
              <Step 
                number={3} 
                icon={<CalendarCheck className="w-4 h-4 md:w-5 md:h-5" />}
                title="Importe ton EDT" 
                description="Fichier .ics" 
              />
              <Step 
                number={4} 
                icon={<Brain className="w-4 h-4 md:w-5 md:h-5" />}
                title="Génère ton planning" 
                description="En un clic !" 
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 font-heading text-center lg:text-left">
                  Fini le stress des révisions
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <BenefitItem 
                    title="Gagne du temps"
                    description="Plus besoin de passer des heures à planifier."
                  />
                  <BenefitItem 
                    title="Révise sereinement"
                    description="Avec un planning clair, tu sais exactement quoi faire."
                  />
                  <BenefitItem 
                    title="Améliore tes résultats"
                    description="Une révision régulière = de meilleures notes."
                  />
                  <BenefitItem 
                    title="Garde l'équilibre"
                    description="Skoolife respecte ton temps libre."
                  />
                </div>
              </div>
              
              <div className="relative hidden md:block">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="text-6xl md:text-7xl font-bold text-primary font-heading">89%</div>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xs">
                      des étudiants se sentent plus organisés après une semaine
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-12 md:py-24 bg-card/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">
              Des tarifs pensés pour les étudiants
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
              Parce que les étudiants n'ont pas des budgets illimités, 
              Skoolife reste accessible à tous.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
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
            </div>

            <p className="mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground">
              7 jours d'essai gratuit • Annulation à tout moment
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-32">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">
              Prêt à réviser sereinement ?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-lg mx-auto">
              Rejoins les étudiants qui ont repris le contrôle de leurs révisions.
            </p>
            <Link to="/auth?mode=signup" className="inline-block w-full sm:w-auto">
              <Button variant="hero" size="lg" className="hover-lift w-full sm:w-auto md:text-base">
                Créer mon planning gratuitement
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logo} alt="Skoolife" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
              <span className="text-lg md:text-xl font-bold font-heading">Skoolife</span>
            </Link>
            
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
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
            
            <p className="text-xs md:text-sm text-muted-foreground text-center">
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
  <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border/50">
    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{emoji}</div>
    <h3 className="text-base md:text-lg font-semibold mb-1.5 md:mb-2 font-heading">{title}</h3>
    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, highlight }: { icon: React.ReactNode; title: string; description: string; highlight?: boolean }) => (
  <div className={`group p-5 md:p-8 rounded-xl md:rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
    highlight 
      ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
      : 'bg-card border-border hover:border-primary/20'
  }`}>
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 transition-colors duration-300 ${
      highlight 
        ? 'bg-primary/20 text-primary' 
        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
    }`}>
      {icon}
    </div>
    <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 font-heading">{title}</h3>
    <p className="text-muted-foreground text-xs md:text-base leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative mb-3 md:mb-6">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl md:text-2xl font-bold shadow-glow group-hover:scale-110 transition-transform duration-300 font-heading">
        {number}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    <h3 className="font-semibold mb-1 md:mb-2 font-heading text-sm md:text-lg">{title}</h3>
    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const BenefitItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex gap-3 md:gap-4">
    <div className="flex-shrink-0">
      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
    </div>
    <div>
      <h3 className="font-semibold mb-0.5 md:mb-1 font-heading text-sm md:text-base">{title}</h3>
      <p className="text-muted-foreground text-xs md:text-base">{description}</p>
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
  <div className={`p-5 md:p-8 rounded-xl md:rounded-2xl border text-left ${
    highlighted 
      ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20' 
      : 'bg-card border-border'
  }`}>
    <div className="mb-4 md:mb-6">
      <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2 font-heading">{name}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl md:text-4xl font-bold font-heading">{price}</span>
        <span className="text-muted-foreground text-sm">{period}</span>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mt-1.5 md:mt-2">{description}</p>
    </div>
    <ul className="space-y-2 md:space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Index;
