import { useState } from "react";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Configuration des plans avec leurs price_id Stripe
const PLANS = {
  essentiel: {
    name: "Essentiel",
    description: "Pour bien démarrer tes révisions",
    icon: Zap,
    features: [
      "Planning de révisions intelligent",
      "Import de ton emploi du temps (.ics)",
      "Suivi de progression",
      "Gestion des matières",
    ],
    monthly: {
      price: 3.99,
      priceId: "price_1S7Vl1CG6ZnJ9jFuLFtjkUZ2",
    },
    yearly: {
      price: 39.99,
      priceId: "price_1S7gXlCG6ZnJ9jFu7W8AJg3G",
      savings: "2 mois offerts",
    },
  },
  premium: {
    name: "Premium",
    description: "L'expérience complète pour réussir",
    icon: Crown,
    popular: true,
    features: [
      "Tout le plan Essentiel",
      "Assistant IA de révisions",
      "Statistiques avancées",
      "Export des données",
      "Support prioritaire",
    ],
    monthly: {
      price: 4.99,
      priceId: "price_1S7VlACG6ZnJ9jFun5ELpRPG",
    },
    yearly: {
      price: 49.99,
      priceId: "price_1S7gXzCG6ZnJ9jFuJsHpdh8L",
      savings: "2 mois offerts",
    },
  },
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    const priceId = isYearly ? plan.yearly.priceId : plan.monthly.priceId;

    setLoading(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Offre de lancement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choisis ton plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Rejoins des milliers d'étudiants qui optimisent leurs révisions avec Skoolife
          </p>
        </div>

        {/* Toggle Mensuel/Annuel */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label
            htmlFor="billing-toggle"
            className={!isYearly ? "font-semibold" : "text-muted-foreground"}
          >
            Mensuel
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label
            htmlFor="billing-toggle"
            className={isYearly ? "font-semibold" : "text-muted-foreground"}
          >
            Annuel
          </Label>
          {isYearly && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              -17%
            </Badge>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearly.price : plan.monthly.price;
            const isPopular = "popular" in plan && plan.popular;

            return (
              <Card
                key={key}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular
                    ? "border-primary shadow-lg scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                      Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isPopular
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{price.toFixed(2)}€</span>
                    <span className="text-muted-foreground">
                      /{isYearly ? "an" : "mois"}
                    </span>
                    {isYearly && plan.yearly.savings && (
                      <p className="text-sm text-green-600 mt-1">
                        {plan.yearly.savings}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(key)}
                    disabled={loading !== null}
                  >
                    {loading === key ? (
                      <span className="animate-pulse">Chargement...</span>
                    ) : (
                      `Choisir ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Paiement sécurisé par Stripe • Annulation à tout moment</p>
          <p className="mt-2">
            Des questions ?{" "}
            <a href="mailto:contact@skoolife.fr" className="text-primary hover:underline">
              Contacte-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
