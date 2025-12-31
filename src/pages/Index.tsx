import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, GraduationCap, Users } from 'lucide-react';
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
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <div className="relative max-w-5xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-16 text-center">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              Plateforme pour l'enseignement supérieur
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              La réussite académique,
              <br />
              <span className="gradient-text-animated font-heading">
                pilotée par les données
              </span>
            </h1>
            
            <p className="max-w-2xl text-base md:text-lg lg:text-xl text-muted-foreground mx-auto">
              Skoolife aide les établissements d'enseignement supérieur à accompagner 
              leurs étudiants vers la réussite grâce à un planning de révision intelligent 
              et un suivi pédagogique en temps réel.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/institution/create">
              <Button variant="hero" size="lg" className="md:text-base px-8">
                <Building2 className="w-5 h-5 mr-2" />
                Créer un établissement
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="md:text-base px-8">
                Demander une démo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Student access */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-3">
              Vous êtes étudiant ? Rejoignez votre établissement
            </p>
            <Link to="/join">
              <Button variant="ghost" className="text-primary">
                <GraduationCap className="w-4 h-4 mr-2" />
                Entrer un code d'accès
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Props */}
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pour les établissements</h3>
              <p className="text-muted-foreground">
                Pilotez la réussite académique avec des KPIs clairs : taux d'engagement, 
                progression par cohorte, alertes précoces.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pour les enseignants</h3>
              <p className="text-muted-foreground">
                Suivez la progression de vos étudiants en temps réel. Identifiez ceux 
                qui ont besoin d'un accompagnement renforcé.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pour les étudiants</h3>
              <p className="text-muted-foreground">
                Un planning de révision personnalisé, généré automatiquement selon 
                les examens et les priorités de chaque étudiant.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
