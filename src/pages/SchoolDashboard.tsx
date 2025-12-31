import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import { Building2, LogOut, Users } from "lucide-react";

type School = {
  id: string;
  name: string;
  contact_email: string;
  subscription_tier: string | null;
  is_active: boolean | null;
};

type Membership = {
  school_id: string;
  role: string;
};

const LOGO_URL = "/logo.png";

export default function SchoolDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  const schoolId = membership?.school_id ?? null;

  const tierLabel = useMemo(() => {
    const tier = school?.subscription_tier ?? "trial";
    if (tier === "starter") return "Starter";
    if (tier === "growth") return "Growth";
    if (tier === "enterprise") return "Enterprise";
    return "Essai";
  }, [school?.subscription_tier]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/schools/auth?mode=login");
    }
  }, [loading, user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: m } = await supabase
        .from("school_members")
        .select("school_id, role")
        .eq("user_id", user.id)
        .eq("role", "admin_school")
        .maybeSingle();

      if (!m?.school_id) {
        setMembership(null);
        setSchool(null);
        setMemberCount(0);
        return;
      }

      setMembership(m);

      const { data: schoolData } = await supabase
        .from("schools")
        .select("id, name, contact_email, subscription_tier, is_active")
        .eq("id", m.school_id)
        .maybeSingle();

      setSchool(schoolData ?? null);

      const { count } = await supabase
        .from("school_members")
        .select("id", { count: "exact", head: true })
        .eq("school_id", m.school_id);

      setMemberCount(count ?? 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  if (!membership?.school_id || !school) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-6">
          <Link to="/schools" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-foreground">Skoolife</span>
            <span className="text-sm font-medium text-primary ml-1">Écoles</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 pb-20">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Accès école introuvable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Ce compte n'est associé à aucun espace école (ou vous n'êtes pas admin école).
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => navigate("/schools/auth?mode=login")}>
                  Retour
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/schools");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="text-sm text-muted-foreground">Espace École</p>
              <p className="font-semibold text-foreground">{school.name}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/schools");
            }}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard école</h1>
            <p className="text-muted-foreground">Gérez vos membres et votre abonnement.</p>
          </div>
          <div className="flex items-center gap-2">
            <ImportCSVDialog schoolId={schoolId} onImportComplete={fetchData} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forfait</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{tierLabel}</p>
                    <Badge variant={school.is_active ? "default" : "secondary"}>
                      {school.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membres</p>
                  <p className="text-2xl font-bold">{memberCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Email de contact</p>
                <p className="font-medium">{school.contact_email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>1) Importez vos élèves avec le bouton <strong>Import CSV</strong>.</p>
            <p>2) Lancez la facturation annuelle (Starter / Growth / Enterprise).</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
