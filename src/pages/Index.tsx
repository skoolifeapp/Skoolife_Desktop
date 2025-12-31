import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
const LOGO_URL = '/logo.png';
import StackedCardsLayout from '@/components/StackedCardsLayout';
import LandingFeatures from '@/components/LandingFeatures';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
      <Navbar />

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
          <div className="space-y-4 md:space-y-6">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 md:mt-10">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg" className="md:text-base px-8">
                Commencer
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview - Rising from bottom */}
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="relative">
            <StackedCardsLayout />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <LandingFeatures />

      <Footer />
    </div>
  );
};

export default Index;
