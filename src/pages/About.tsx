import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Lightbulb, Heart, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="relative pt-24 md:pt-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <div className="relative max-w-4xl mx-auto px-4 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading mb-6">
            Voici pourquoi nous construisons
            <br />
            <span className="gradient-text-animated font-heading">Skoolife</span>
          </h1>
        </div>

        {/* Content Sections */}
        <div className="relative max-w-4xl mx-auto px-4 pb-20 space-y-16 md:space-y-24">
          
          {/* Problème */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Problème</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                En tant qu'anciens étudiants et apprenants permanents, nous avons vécu de première main les défis de l'éducation moderne. Les étudiants d'aujourd'hui sont submergés par des matériaux d'étude éparpillés, des méthodes d'apprentissage inefficaces et un manque d'orientation personnalisée.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                Les outils d'étude traditionnels échouent à s'adapter aux modèles d'apprentissage individuels, laissant les étudiants lutter pour optimiser leurs performances académiques. Nous avons remarqué que la plupart des plateformes éducatives sont des solutions universelles qui n'évoluent pas avec les besoins de l'étudiant.
              </p>
            </div>
          </section>

          {/* Solution */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Solution</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Alors, nous nous sommes demandés : pourquoi ne pas créer un compagnon d'apprentissage intelligent qui s'adapte à chaque étudiant ? Inspirés par le pouvoir de l'IA et de l'apprentissage personnalisé, nous nous sommes lancés dans le développement de <span className="text-foreground font-semibold">Skoolife</span> — une plateforme d'étude complète qui combine des techniques d'apprentissage éprouvées avec une technologie de pointe.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                Notre objectif est d'aider les étudiants à découvrir leurs modèles d'apprentissage optimaux, rester motivés tout au long de leur parcours académique, et obtenir de meilleurs résultats en se concentrant sur ce qui compte vraiment : <span className="text-foreground font-semibold">la compréhension et la rétention</span>.
              </p>
            </div>
          </section>

          {/* Notre Mission */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Notre Mission</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Nous croyons que chaque étudiant mérite l'accès à des outils d'apprentissage personnalisés et intelligents qui rendent l'étude plus efficace et agréable. Que ce soit à travers la génération de planning alimentée par l'IA, la planification intelligente d'étude, ou des analyses de progrès détaillées, nous nous engageons à démocratiser la technologie éducative de haute qualité.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                L'éducation est un droit fondamental, et nous voulons nous assurer que les étudiants partout ont les outils dont ils ont besoin pour réussir.
              </p>
            </div>
          </section>

          {/* Construire avec les étudiants */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-skoo-green/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-skoo-green" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Construire avec les étudiants</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Nous avons toujours cru que les meilleurs outils éducatifs sont construits <span className="text-foreground font-semibold">avec</span> les étudiants, pas seulement <span className="text-foreground font-semibold">pour</span> eux. Grâce aux retours continus, aux tests utilisateurs, et à la collaboration directe avec notre communauté étudiante, nous créons une plateforme qui comprend et sert vraiment leurs besoins.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                Chaque fonctionnalité que nous construisons est validée par de vrais étudiants faisant face à de vrais défis académiques. Cette approche centrée sur l'étudiant restera au cœur de tout ce que nous faisons, peu importe à quel point nous grandissons.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg" className="md:text-base px-8">
                Rejoindre Skoolife
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Gratuit pendant 7 jours.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
