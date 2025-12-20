import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StackedCardsLayout from '@/components/StackedCardsLayout';

const FeatureCalendar = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Big outline title */}
          <div className="mb-8 animate-slide-up">
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-heading leading-none"
              style={{
                WebkitTextStroke: '2px currentColor',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Calendrier
            </h1>
            <h2 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-heading leading-none mt-2"
              style={{
                WebkitTextStroke: '2px currentColor',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Intelligent
            </h2>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Planifie tes sessions de révisions avec une planification intelligente. 
            Suis les échéances, gère ton calendrier académique et reçois des rappels 
            intelligents pour optimiser ta routine d'apprentissage et obtenir de meilleurs résultats.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Commencer à organiser tes études
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* App Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StackedCardsLayout />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureCalendar;
