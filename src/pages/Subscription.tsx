import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, Calendar, CreditCard, ArrowDownCircle, ArrowUpCircle, XCircle, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SubscriptionSkeleton } from "@/components/PageSkeletons";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SUBSCRIPTION_TIERS } from "@/config/stripe";

const TIER_INFO = {
  student: {
    name: "Skoolife Student",
    price: `${SUBSCRIPTION_TIERS.student.price}€`,
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  major: {
    name: "Skoolife Major",
    price: `${SUBSCRIPTION_TIERS.major.price}€`,
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

const Subscription = () => {
  const navigate = useNavigate();
  const { subscriptionTier, session, subscriptionLoading, checkSubscription, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscription_end?: string | null;
    subscription_status?: string | null;
    cancel_at_period_end?: boolean;
  } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; targetTier: "student" | "major" | null }>({
    open: false,
    targetTier: null,
  });

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

  useEffect(() => {
    if (!subscriptionLoading) {
      fetchSubscriptionDetails();
    }
  }, [session, subscriptionLoading]);

  // Auto-refresh when returning from Stripe portal or after upgrade
  useEffect(() => {
    const handleFocus = async () => {
      // Use refreshSubscription to bypass cache and get fresh data
      await refreshSubscription();
      await fetchSubscriptionDetails();
    };

    const handleUpgrade = async () => {
      setLoading(true);
      await refreshSubscription();
      await fetchSubscriptionDetails();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("subscription-upgraded", handleUpgrade);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("subscription-upgraded", handleUpgrade);
    };
  }, [session]);

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

  const handleReactivate = async () => {
    setReactivateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
    } finally {
      setReactivateLoading(false);
    }
  };

  const handleSwitchPlan = async () => {
    setSwitchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.info("Modifie ton abonnement sur Stripe", {
          description: "Ton abonnement sera mis à jour automatiquement à ton retour.",
        });
      }
    } catch (err: any) {
      console.error("Error opening portal:", err);
      toast.error("Erreur lors de l'ouverture du portail", {
        description: err.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setSwitchLoading(false);
      setConfirmDialog({ open: false, targetTier: null });
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
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mon abonnement</h1>
        <p className="text-muted-foreground">Gère ton abonnement Skoolife</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Current plan card */}
        <Card className="border-0 shadow-md">
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

        {/* Switch plan card */}
        {!isCanceled && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Changer de plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionTier === "student" ? (
                <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Crown className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-700 dark:text-amber-400">Passer à Major</h3>
                      <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
                        Débloquez toutes les fonctionnalités premium : invitations camarades, analytics avancés et plus.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-400">4,99€/mois</span>
                        <Button
                          onClick={() => setConfirmDialog({ open: true, targetTier: "major" })}
                          disabled={switchLoading}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        >
                          <ArrowUpCircle className="w-4 h-4 mr-2" />
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Passer à Student</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Plan essentiel pour la planification de révisions. Certaines fonctionnalités premium seront désactivées.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">2,99€/mois</span>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDialog({ open: true, targetTier: "student" })}
                          disabled={switchLoading}
                        >
                          <ArrowDownCircle className="w-4 h-4 mr-2" />
                          Downgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Autres actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Manage payment method - only show if not canceled */}
            {!isCanceled && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleOpenPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Gérer mon moyen de paiement
              </Button>
            )}

            {/* Cancel button - only show if not canceled */}
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
              <Button className="w-full" onClick={handleReactivate} disabled={reactivateLoading}>
                {reactivateLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Réactiver mon abonnement
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.targetTier === "major" ? "Passer à Major ?" : "Passer à Student ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.targetTier === "major" ? (
                <>
                  Tu vas être redirigé vers Stripe pour passer au plan <strong>Major à 4,99€/mois</strong>. Le prorata sera calculé automatiquement.
                </>
              ) : (
                <>
                  Tu vas être redirigé vers Stripe pour passer au plan <strong>Student à 2,99€/mois</strong>. Certaines fonctionnalités premium seront désactivées.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={switchLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSwitchPlan}
              disabled={switchLoading}
              className={confirmDialog.targetTier === "major" 
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600" 
                : ""
              }
            >
              {switchLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Continuer vers Stripe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subscription;
