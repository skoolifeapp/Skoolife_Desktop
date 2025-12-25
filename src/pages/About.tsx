import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, AlertTriangle, Sparkles, LayoutDashboard, Heart } from 'lucide-react';
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
            Pourquoi
            <br />
            <span className="gradient-text-animated font-heading">Skoolife existe</span>
          </h1>
          <p className="max-w-3xl text-base md:text-lg text-muted-foreground mx-auto leading-relaxed">
            Aujourd'hui, le vrai problème n'est pas le manque de ressources, mais le manque de structure. Les cours sont dispersés entre PDF, Drive, photos, mails et messages, pendant que les dates d'examens s'accumulent. Résultat : beaucoup d'étudiants avancent "au feeling", révisent trop tard, se dispersent et finissent par travailler beaucoup sans savoir si c'est réellement efficace.
          </p>
        </div>

        {/* Content Sections */}
        <div className="relative max-w-4xl mx-auto px-4 pb-20 space-y-16 md:space-y-24">
          
          {/* Ce qui coince */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Ce qui coince dans les solutions actuelles</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Les outils classiques aident à prendre des notes ou à faire des listes, mais ils ne règlent pas le fond : transformer le chaos en un plan clair, réaliste et motivant. Trop souvent, les plateformes proposent une approche "universelle" qui ne s'adapte ni au rythme, ni aux contraintes, ni aux imprévus de l'étudiant.
              </p>
            </div>
          </section>

          {/* Ce que Skoolife change */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Ce que Skoolife change concrètement</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Skoolife</span> est un compagnon de révision intelligent qui transforme tes examens en plan d'action. Tu ajoutes tes matières, tes dates d'examens et tes préférences, puis Skoolife génère automatiquement des sessions de révision adaptées à ton temps disponible et à ton rythme.
              </p>
            </div>
          </section>

          {/* Une plateforme pensée pour réviser */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Une plateforme pensée pour réviser au quotidien</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Skoolife te permet de planifier sans te prendre la tête, de suivre ta progression matière par matière, et de centraliser tes objectifs. Tu peux aussi retrouver tes ressources directement dans tes blocs (cours, fiches, liens), réviser plus confortablement (mode nuit) et travailler avec d'autres (visio intégrée), sans quitter ton planning.
              </p>
            </div>
          </section>

          {/* Ce qu'on veut apporter */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-skoo-green/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-skoo-green" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading">Ce qu'on veut apporter aux étudiants</h2>
            </div>
            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Nous pensons que la réussite ne doit pas dépendre d'un "talent" pour l'organisation ou de la capacité à tenir sous pression. Chaque étudiant mérite un outil qui apporte de la <span className="text-foreground font-semibold">clarté</span>, de la <span className="text-foreground font-semibold">méthode</span>, de la <span className="text-foreground font-semibold">régularité</span> et de la <span className="text-foreground font-semibold">confiance</span>.
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
