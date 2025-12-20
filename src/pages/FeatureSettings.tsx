import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Clock, Sliders, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { StaticSettingsCard } from '@/components/StaticAppCards';

const FeatureSettings = () => {
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
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Paramètres
              <br />
              <span className="gradient-text-animated font-heading">
                Personnalisés
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Configure tes préférences de révisions selon ton emploi du temps. 
            Définis tes jours préférés, tes horaires et la durée de tes sessions 
            pour un planning parfaitement adapté à ta vie.
          </p>

          {/* CTA Button */}
          <div>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Personnaliser mes révisions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static Settings Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="h-[520px] md:h-[620px] rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
            <StaticSettingsCard />
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Horaires flexibles</h3>
              <p className="text-sm text-muted-foreground">
                Définis tes heures de début et de fin pour que ton planning respecte ton rythme.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Jours préférés</h3>
              <p className="text-sm text-muted-foreground">
                Choisis les jours où tu préfères réviser et on s'adapte à ton planning.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sessions sur mesure</h3>
              <p className="text-sm text-muted-foreground">
                Configure la durée de tes sessions et tes objectifs hebdomadaires.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureSettings;
