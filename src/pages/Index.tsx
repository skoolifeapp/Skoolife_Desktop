import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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

export default Index;
