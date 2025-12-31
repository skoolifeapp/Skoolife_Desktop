import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  GraduationCap,
  Check,
  ArrowRight,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { SCHOOL_STRIPE_PRODUCTS } from "@/config/stripeSchools";

const features = [
  {
    icon: Users,
    title: "Gestion centralisée",
    description: "Gérez tous vos élèves et enseignants depuis une interface unique"
  },
  {
    icon: BarChart3,
    title: "Analytics détaillés",
    description: "Suivez la progression de chaque élève et identifiez ceux en difficulté"
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Import CSV pour ajouter des centaines d'élèves en quelques secondes"
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Hébergement conforme RGPD avec chiffrement de bout en bout"
  },
  {
    icon: BookOpen,
    title: "Planning personnalisé",
    description: "Chaque élève reçoit un planning adapté à ses examens et son rythme"
  },
  {
    icon: TrendingUp,
    title: "Amélioration des résultats",
    description: "Les élèves utilisant Skoolife améliorent leurs notes de 15% en moyenne"
  }
];

const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0 
  }).format(cents / 100);
};

export default function SchoolsLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <main className="relative pt-24 md:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Building2 className="w-3 h-3 mr-1" />
            Pour les établissements
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Offrez à vos élèves
            <br />
            <span className="text-primary">l'organisation qu'ils méritent</span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mx-auto mb-8">
            Skoolife aide vos élèves à planifier leurs révisions intelligemment. 
            Suivez leur progression et identifiez ceux qui ont besoin d'aide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/schools/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Inscrire mon établissement
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/schools/contact">
              <Button variant="outline" size="lg">
                Demander une démo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-4 mt-16 md:mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Élèves actifs" },
              { value: "15%", label: "Amélioration moyenne" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "Support réactif" }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont votre établissement a besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une solution complète pour accompagner vos élèves vers la réussite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tarifs transparents
            </h2>
            <p className="text-muted-foreground text-lg">
              Forfaits annuels adaptés à la taille de votre établissement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(SCHOOL_STRIPE_PRODUCTS).map(([key, tier]) => (
              <Card 
                key={key} 
                className={`relative ${key === 'growth' ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
              >
                {key === 'growth' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatPrice(tier.price_cents)}</span>
                    <span className="text-muted-foreground">/an</span>
                  </div>
                  
                  <ul className="space-y-3 text-left mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{tier.max_students ? `Jusqu'à ${tier.max_students} élèves` : "Élèves illimités"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Dashboard admin complet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Import CSV élèves</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Analytics détaillés</span>
                    </li>
                    {key === 'enterprise' && (
                      <>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Support prioritaire</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Personnalisation logo</span>
                        </li>
                      </>
                    )}
                  </ul>

                  <Link to="/schools/contact">
                    <Button 
                      className="w-full" 
                      variant={key === 'growth' ? 'default' : 'outline'}
                    >
                      Nous contacter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à transformer les révisions de vos élèves ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Rejoignez les établissements qui font confiance à Skoolife pour accompagner leurs élèves vers la réussite.
            </p>
            <Link to="/schools/contact">
              <Button variant="hero" size="lg" className="gap-2">
                Demander une démo gratuite
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
