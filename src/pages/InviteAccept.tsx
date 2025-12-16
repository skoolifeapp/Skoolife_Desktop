import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle, User } from 'lucide-react';
import logo from '@/assets/logo.png';
import { toast } from 'sonner';

/**
 * Mini onboarding page for invite flow.
 * User enters their first name only, then the invite is accepted automatically.
 */
export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Store token and redirect to auth
      if (token) {
        localStorage.setItem('pending_invite_token', token);
      }
      navigate(`/auth?mode=signup&redirect=/invite-accept/${token}`);
    }
  }, [user, authLoading, token, navigate]);

  // Fetch invite data
  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) return;
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/get-invite?token=${token}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey,
            }
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Invitation introuvable');
        } else {
          setInviteData(data);
        }
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoadingInvite(false);
      }
    };
    fetchInvite();
  }, [token]);

  // If the invite was already used by someone else, block this flow
  useEffect(() => {
    if (!user || !inviteData) return;
    if (inviteData.already_accepted && inviteData.accepted_by && inviteData.accepted_by !== user.id) {
      setError("Ce lien d'invitation a déjà été utilisé.");
    }
  }, [user, inviteData]);

  // Pre-fill first name from existing profile if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.first_name) {
        setFirstName(data.first_name);
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteData || !firstName.trim()) {
      toast.error('Entre ton prénom');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Call edge function to accept invite (bypasses RLS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/accept-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          invite_id: inviteData.id,
          first_name: firstName.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('Accept invite error:', result);
        throw new Error(result.error || 'Failed to accept invite');
      }

      // Clear pending token
      localStorage.removeItem('pending_invite_token');
      
      setAccepted(true);

      // Redirect to dashboard with the session highlighted
      setTimeout(() => {
        navigate(`/app?week=${result.session_date || inviteData.session.date}&invitedSession=${result.session_id || inviteData.session.id}`);
      }, 1200);

    } catch (err) {
      console.error('Error accepting invite:', err);
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingInvite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation introuvable</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">C'est noté !</h2>
            <p className="text-muted-foreground mb-6">
              Tu as rejoint la session. Redirection vers ton planning...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = inviteData?.inviter 
    ? `${inviteData.inviter.first_name || ''} ${inviteData.inviter.last_name || ''}`.trim() 
    : 'Un camarade';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md border-0 shadow-lg animate-slide-up">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Dernière étape !</CardTitle>
            <CardDescription>
              {inviterName} t'a invité à réviser. Entre ton prénom pour rejoindre la session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Comment tu t'appelles ?</Label>
                <Input
                  id="firstName"
                  placeholder="Ton prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={submitting || !firstName.trim()}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Rejoindre la session
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
