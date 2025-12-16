import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

export default function PostCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading, checkSubscription } = useAuth();

  const [step, setStep] = useState<"boot" | "checking" | "timeout">("boot");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (authLoading) return;

      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }

      setStep("checking");

      // Stripe peut mettre quelques secondes à créer/attacher la souscription.
      const deadline = Date.now() + 20000;
      let subscribed = false;

      while (!cancelled && Date.now() < deadline) {
        const result = await checkSubscription();
        subscribed = Boolean(result?.subscribed);
        if (subscribed) break;
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (cancelled) return;
      if (!subscribed) setStep("timeout");

      // Une fois l'abonnement (ou le timeout) traité, on envoie vers la bonne page.
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      navigate(profile?.is_onboarding_complete ? "/app" : "/onboarding", {
        replace: true,
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, navigate, checkSubscription]);

  return (
    <div className="min-h-screen bg-background">
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-20">
        <Card className="border-0 shadow-lg animate-slide-up">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Activation de ton essai…</CardTitle>
            <CardDescription>
              On finalise ton essai gratuit et on te redirige automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>
                {step === "timeout"
                  ? "Ça prend plus de temps que prévu, on termine la redirection…"
                  : "Vérification de l’abonnement en cours…"}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
