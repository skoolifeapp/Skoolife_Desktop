import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, Calendar, CreditCard, ArrowDownCircle, ArrowUpCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SubscriptionSkeleton } from "@/components/PageSkeletons";

const TIER_INFO = {
  student: {
    name: "Skoolife Student",
    price: "2,99€",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  major: {
    name: "Skoolife Major",
    price: "4,99€",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

const Subscription = () => {
  const navigate = useNavigate();
  const { subscriptionTier, session, subscriptionLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscription_end?: string | null;
    subscription_status?: string | null;
    cancel_at_period_end?: boolean;
  } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("check-subscription", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!error && data) {
          setSubscriptionData(data);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!subscriptionLoading) {
      fetchSubscriptionDetails();
    }
  }, [session, subscriptionLoading]);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || subscriptionLoading) {
    return <SubscriptionSkeleton />;
  }

  if (!subscriptionTier || subscriptionTier === "free") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon abonnement</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Tu n'as pas d'abonnement actif.</p>
            <Button onClick={() => navigate("/pricing")}>Voir les offres</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierInfo = TIER_INFO[subscriptionTier as keyof typeof TIER_INFO] || TIER_INFO.student;
  const TierIcon = tierInfo.icon;
  const nextBillingDate = subscriptionData?.subscription_end
    ? format(new Date(subscriptionData.subscription_end), "d MMMM yyyy", { locale: fr })
    : null;
  const isCanceled = subscriptionData?.cancel_at_period_end;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon abonnement</h1>

      {/* Current plan card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${tierInfo.bgColor}`}>
                <TierIcon className={`w-6 h-6 ${tierInfo.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
              </div>
            </div>
            {isCanceled ? (
              <Badge variant="destructive">Annulé</Badge>
            ) : (
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Actif</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Montant mensuel</p>
              <p className="text-lg font-semibold">{tierInfo.price} / mois</p>
            </div>
          </div>

          {/* Next billing date */}
          {nextBillingDate && (
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isCanceled ? "Accès jusqu'au" : "Prochaine facturation"}
                </p>
                <p className="text-lg font-semibold">{nextBillingDate}</p>
              </div>
            </div>
          )}

          {isCanceled && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">
                Ton abonnement a été annulé. Tu conserves l'accès jusqu'à la fin de ta période payée.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gérer mon abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Upgrade button - only for Student tier */}
          {subscriptionTier === "student" && !isCanceled && (
            <Button
              className="w-full justify-start bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              onClick={handleOpenPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 mr-2" />
              )}
              Passer à Major (4,99€/mois)
            </Button>
          )}

          {/* Downgrade button - only for Major tier */}
          {subscriptionTier === "major" && !isCanceled && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleOpenPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 mr-2" />
              )}
              Passer à Student (2,99€/mois)
            </Button>
          )}

          {/* Cancel button */}
          {!isCanceled && (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => navigate("/cancel")}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Résilier mon abonnement
            </Button>
          )}

          {/* Reactivate button if canceled */}
          {isCanceled && (
            <Button className="w-full" onClick={handleOpenPortal} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Réactiver mon abonnement
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
