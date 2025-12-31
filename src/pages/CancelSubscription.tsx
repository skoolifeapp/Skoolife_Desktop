import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Gift, MessageCircle, Crown } from "lucide-react";

const CancelSubscription = () => {
  const navigate = useNavigate();
  const { subscriptionTier, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  // Rafraîchir les données et rediriger au retour du portail Stripe
  useEffect(() => {
    const handleFocus = async () => {
      await refreshSubscription();
      navigate("/subscription");
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshSubscription, navigate]);

  const handleKeepSubscription = () => {
    navigate("/app");
  };

  const handleProceedToCancel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    window.open("https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc", "_blank");
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Annuler l'abonnement</h1>
        <p className="text-muted-foreground">Gérer la résiliation de ton abonnement</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Main retention card */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">On ne veut pas te voir partir !</h2>
                <p className="text-muted-foreground mt-1">
                  Avant de partir, voici ce que tu vas perdre :
                </p>
              </div>
            </div>

            {/* What they'll lose */}
            <div className="space-y-3 bg-destructive/5 p-4 rounded-xl border border-destructive/20">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-destructive" />
                <span className="text-sm">Accès à ton planning intelligent</span>
              </div>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-destructive" />
                <span className="text-sm">Suivi de ta progression</span>
              </div>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-destructive" />
                <span className="text-sm">Gestion de tes matières et examens</span>
              </div>
              {subscriptionTier === "major" && (
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-destructive" />
                  <span className="text-sm">Invitations de camarades</span>
                </div>
              )}
            </div>

            {/* Special offer */}
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Offre spéciale</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Un problème ? Contacte-nous sur WhatsApp et on trouvera une solution ensemble !
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleKeepSubscription}
                className="w-full"
                size="lg"
              >
                Garder mon abonnement
              </Button>

              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>

              <Button
                onClick={handleProceedToCancel}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                size="sm"
                disabled={loading}
              >
                {loading ? "Chargement..." : "Continuer l'annulation →"}
              </Button>
            </div>

            {/* Reassurance */}
            <p className="text-xs text-center text-muted-foreground">
              Tu conserveras l'accès jusqu'à la fin de ta période payée
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CancelSubscription;