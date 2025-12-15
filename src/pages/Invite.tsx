import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, Loader2, MapPin, Video, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import logo from '@/assets/logo.png';

interface InviteData {
  id: string;
  session: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    subject: {
      id: string;
      name: string;
      color: string;
    };
  };
  inviter: {
    first_name: string;
    last_name: string;
  };
  expires_at: string;
  already_accepted: boolean;
  meeting_format: 'presentiel' | 'visio' | null;
  meeting_address: string | null;
  meeting_link: string | null;
}

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetchInviteData();
  }, [token]);

  // Auto-accept invite when user is logged in and arrives on this page
  useEffect(() => {
    const autoAcceptIfPending = async () => {
      if (user && inviteData && !accepted && !inviteData.already_accepted) {
        // Check if this was a pending invite from localStorage
        const pendingToken = localStorage.getItem('pending_invite_token');
        if (pendingToken === token) {
          // Auto-accept the invite
          localStorage.removeItem('pending_invite_token');
          handleAcceptInvite();
        }
      }
    };
    autoAcceptIfPending();
  }, [user, inviteData, accepted, token]);

  const fetchInviteData = async () => {
    if (!token) return;

    try {
      const response = await supabase.functions.invoke('get-invite', {
        body: null,
        headers: {},
      });

      // Use fetch directly since we need query params
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/get-invite?token=${token}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.expired) {
          setExpired(true);
        } else {
          setError(data.error || 'Invitation introuvable');
        }
        return;
      }

      setInviteData(data);
      setAccepted(data.already_accepted);
    } catch (err) {
      console.error('Error fetching invite:', err);
      setError('Erreur lors du chargement de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !inviteData) return;

    setAccepting(true);
    try {
      const { error } = await supabase
        .from('session_invites')
        .update({
          accepted_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', inviteData.id);

      if (error) throw error;

      // Clear any pending invite token
      localStorage.removeItem('pending_invite_token');
      
      setAccepted(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    } catch (err) {
      console.error('Error accepting invite:', err);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation expirée</h2>
            <p className="text-muted-foreground mb-6">
              Cette invitation a expiré. Les invitations sont valables jusqu'à 24h avant le créneau.
            </p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation introuvable</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Cette invitation n\'existe pas ou a été supprimée.'}
            </p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, inviter } = inviteData;
  const sessionDate = format(parseISO(session.date), 'EEEE d MMMM yyyy', { locale: fr });
  const timeRange = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;
  const inviterName = `${inviter.first_name || ''} ${inviter.last_name || ''}`.trim() || 'Un camarade';

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">C'est noté ! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Tu as rejoint la session de révision. Redirection vers ton planning...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <img src={logo} alt="Skoolife" className="h-10 mx-auto mb-4" />
          <CardTitle className="text-2xl">Invitation à réviser</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Inviter info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{inviterName}</p>
              <p className="text-sm text-muted-foreground">t'invite à réviser</p>
            </div>
          </div>

          {/* Session details */}
          <div 
            className="p-5 rounded-xl border-2"
            style={{ 
              borderColor: session.subject.color,
              backgroundColor: `${session.subject.color}15`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" style={{ color: session.subject.color }} />
              <span className="font-bold text-lg">{session.subject.name}</span>
            </div>
            
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{sessionDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{timeRange}</span>
              </div>
              
              {/* Meeting format display */}
              {inviteData.meeting_format && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
                  {inviteData.meeting_format === 'visio' ? (
                    <>
                      <Video className="w-4 h-4 text-blue-500" />
                      {inviteData.meeting_link ? (
                        <a 
                          href={inviteData.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Rejoindre la visio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">Visio (lien à venir)</span>
                      )}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        {inviteData.meeting_address || 'Présentiel'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {user ? (
            <Button 
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full"
              size="lg"
            >
              {accepting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Rejoindre cette session
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm text-center font-medium mb-2">
                  Rejoins cette session gratuitement
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Crée un compte gratuit pour rejoindre les sessions de révision de tes camarades. 
                  Tu pourras voir toutes les sessions auxquelles tu es invité(e).
                </p>
              </div>
              <Link 
                to={`/auth?redirect=/invite/${token}`}
                onClick={() => {
                  // Store invite token in localStorage so we can auto-accept after signup
                  localStorage.setItem('pending_invite_token', token || '');
                }}
              >
                <Button className="w-full" size="lg">
                  Créer mon compte gratuit
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Tu as déjà un compte ?{' '}
                <Link 
                  to={`/auth?redirect=/invite/${token}`}
                  onClick={() => {
                    localStorage.setItem('pending_invite_token', token || '');
                  }}
                  className="text-primary hover:underline"
                >
                  Connecte-toi
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}