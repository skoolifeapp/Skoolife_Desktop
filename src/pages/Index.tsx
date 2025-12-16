import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, ArrowRight, Sparkles, Monitor } from 'lucide-react';
import logo from '@/assets/logo.png';
import HeroMiniDashboard3D from '@/components/HeroMiniDashboard3D';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <div className="min-h-screen bg-background">
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

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-32">
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
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-10 animate-slide-up">
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
            <div className="flex-1 w-full lg:w-auto animate-slide-up">
              <HeroMiniDashboard3D />
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Import calendrier"
              description="Importe ton emploi du temps (.ics) et Skoolife évite automatiquement tes créneaux occupés."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Priorisation intelligente"
              description="Les matières proches des examens et les plus importantes sont planifiées en premier."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Adapté à ton rythme"
              description="Définis tes contraintes et Skoolife crée un planning qui respecte ton mode de vie."
            />
          </div>

          {/* How it works */}
          <div className="mt-32 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 font-heading">
              Comment ça marche ?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <Step number={1} title="Crée ton compte" description="Inscription rapide avec email" />
              <Step number={2} title="Ajoute tes matières" description="Avec dates d'examens et importance" />
              <Step number={3} title="Importe ton EDT" description="Depuis ton ENT ou calendrier" />
              <Step number={4} title="Génère ton planning" description="En un clic, ta semaine est prête" />
            </div>
          </div>


          {/* Final CTA */}
          <div className="mt-32 text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-heading">
              Prêt à réviser sereinement ?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Rejoins Skoolife et reprends le contrôle de tes révisions.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="hover-lift">
                Créer mon planning
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
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

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="group p-8 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 font-heading">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex flex-col items-center group">
    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300 font-heading">
      {number}
    </div>
    <h3 className="font-semibold mb-2 font-heading text-lg">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Index;