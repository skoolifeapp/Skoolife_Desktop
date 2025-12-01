import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import HeroParticles from '@/components/HeroParticles';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl shadow-glow" />
            <span className="text-xl font-bold text-foreground">Skoolife</span>
          </Link>
          <Link to="/auth">
            <Button variant="default" size="sm">
              Se connecter
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative">
        {/* Background particles */}
        <HeroParticles />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Planning intelligent pour étudiants
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center space-y-6 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight">
              Tes révisions,
              <br />
              <span className="gradient-text-animated">
                enfin organisées
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Skoolife génère automatiquement ton planning de révisions personnalisé 
              en fonction de tes examens, ton emploi du temps et ton rythme.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-slide-up">
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Aucune carte bancaire requise
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-16">
              Comment ça marche ?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <Step number={1} title="Crée ton compte" description="Inscription rapide avec email" />
              <Step number={2} title="Ajoute tes matières" description="Avec dates d'examens et importance" />
              <Step number={3} title="Importe ton EDT" description="Depuis ton ENT ou calendrier" />
              <Step number={4} title="Génère ton planning" description="En un clic, ta semaine est prête" />
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-32 max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
              <p className="text-xl sm:text-2xl font-medium text-foreground mb-6">
                "Avant Skoolife, je procrastinais tout le temps. Maintenant, j'ai enfin 
                un planning clair et je sais exactement quoi réviser chaque jour."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold text-primary">L</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Léa M.</p>
                  <p className="text-sm text-muted-foreground">Étudiante en L2 Droit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-32 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Prêt à réviser sereinement ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoins des milliers d'étudiants qui ont repris le contrôle de leurs révisions.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
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
            <span className="font-bold">Skoolife</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2024 Skoolife. Fait avec ❤️ pour les étudiants.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4 shadow-glow">
      {number}
    </div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;