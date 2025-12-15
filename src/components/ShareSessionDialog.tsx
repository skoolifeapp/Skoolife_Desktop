import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Copy, Check, MessageCircle, Share2, Link, Users, Loader2, MapPin, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevisionSession, Subject } from '@/types/planning';
import { format, parseISO, subHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

type MeetingFormat = 'presentiel' | 'visio';

interface ShareSessionDialogProps {
  session: RevisionSession | null;
  subject: Subject | undefined;
  onClose: () => void;
}

export function ShareSessionDialog({ session, subject, onClose }: ShareSessionDialogProps) {
  const { user } = useAuth();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Meeting format state
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>('presentiel');
  const [meetingAddress, setMeetingAddress] = useState('');
  
  // Code invitation state
  const [liaisonCode, setLiaisonCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [invitedUser, setInvitedUser] = useState<{ first_name: string; last_name: string } | null>(null);

  const generateShareLink = async () => {
    if (!session || !user) return;

    setLoading(true);
    try {
      const sessionDateTime = parseISO(`${session.date}T${session.start_time}`);
      const expiresAt = subHours(sessionDateTime, 24);

      const { data, error } = await supabase
        .from('session_invites')
        .insert({
          session_id: session.id,
          invited_by: user.id,
          expires_at: expiresAt.toISOString()
        })
        .select('unique_token')
        .single();

      if (error) throw error;

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/invite/${data.unique_token}`;
      setShareLink(link);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    if (!shareLink || !session || !subject) return;
    
    const sessionDate = format(parseISO(session.date), 'EEEE d MMMM', { locale: fr });
    const timeRange = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;
    const meetingInfo = getMeetingInfo();
    
    const message = encodeURIComponent(
      `Hey ! Je révise ${subject.name} le ${sessionDate} de ${timeRange}. Tu veux réviser avec moi ? 📚${meetingInfo ? `\n\n${meetingInfo}` : ''}\n\n${shareLink}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const inviteByCode = async () => {
    if (!session || !user || !liaisonCode.trim()) return;

    const cleanCode = liaisonCode.trim().toUpperCase();
    
    // Basic validation
    if (!/^[A-Z0-9]+-[A-Z0-9]+$/.test(cleanCode)) {
      toast.error('Format de code invalide');
      return;
    }

    setInviteLoading(true);
    try {
      // Find user by liaison code
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, liaison_code')
        .eq('liaison_code', cleanCode)
        .single();

      if (profileError || !targetProfile) {
        toast.error('Aucun utilisateur trouvé avec ce code');
        setInviteLoading(false);
        return;
      }

      // Can't invite yourself
      if (targetProfile.id === user.id) {
        toast.error('Tu ne peux pas t\'inviter toi-même !');
        setInviteLoading(false);
        return;
      }

      // Create invite with the target user already set as accepted
      const sessionDateTime = parseISO(`${session.date}T${session.start_time}`);
      const expiresAt = subHours(sessionDateTime, 24);

      const { error: inviteError } = await supabase
        .from('session_invites')
        .insert({
          session_id: session.id,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
          accepted_by: targetProfile.id,
          accepted_at: new Date().toISOString()
        });

      if (inviteError) {
        console.error('Error creating invite:', inviteError);
        toast.error('Erreur lors de l\'invitation');
        setInviteLoading(false);
        return;
      }

      setInvitedUser({
        first_name: targetProfile.first_name || '',
        last_name: targetProfile.last_name || ''
      });
      
      toast.success(`${targetProfile.first_name || 'L\'utilisateur'} a été invité(e) !`);
      setLiaisonCode('');
    } catch (error) {
      console.error('Error inviting by code:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    setLiaisonCode('');
    setInvitedUser(null);
    setMeetingFormat('presentiel');
    setMeetingAddress('');
    onClose();
  };

  if (!session || !subject) return null;

  const sessionDate = format(parseISO(session.date), 'EEEE d MMMM', { locale: fr });
  const timeRange = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;

  const getMeetingInfo = () => {
    if (meetingFormat === 'visio') {
      return '📹 Visio (lien à venir)';
    }
    return meetingAddress ? `📍 ${meetingAddress}` : '';
  };

  return (
    <Dialog open={!!session} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Réviser avec un camarade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session preview */}
          <div 
            className="p-4 rounded-xl border-2"
            style={{ 
              borderColor: subject.color,
              backgroundColor: `${subject.color}15`
            }}
          >
            <p className="font-semibold text-lg">{subject.name}</p>
            <p className="text-muted-foreground capitalize">{sessionDate}</p>
            <p className="text-muted-foreground">{timeRange}</p>
          </div>

          {/* Meeting format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format de la session</Label>
            <RadioGroup 
              value={meetingFormat} 
              onValueChange={(v) => setMeetingFormat(v as MeetingFormat)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="presentiel" id="presentiel" />
                <Label htmlFor="presentiel" className="flex items-center gap-1.5 cursor-pointer">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Présentiel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="visio" id="visio" />
                <Label htmlFor="visio" className="flex items-center gap-1.5 cursor-pointer">
                  <Video className="w-4 h-4 text-muted-foreground" />
                  Visio
                </Label>
              </div>
            </RadioGroup>

            {meetingFormat === 'presentiel' && (
              <Input
                value={meetingAddress}
                onChange={(e) => setMeetingAddress(e.target.value)}
                placeholder="Ex: BU Sciences, Salle 204..."
                className="mt-2"
              />
            )}

            {meetingFormat === 'visio' && (
              <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Lien de visio à venir
                </p>
              </div>
            )}
          </div>

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Lien
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-3 mt-4">
              {!shareLink ? (
                <Button 
                  onClick={generateShareLink} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Génération...' : 'Générer un lien de partage'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={shareLink} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <Button 
                    onClick={shareViaWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Partager via WhatsApp
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ce lien expire 24h avant le créneau
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="space-y-3 mt-4">
              {invitedUser ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-medium">
                    {invitedUser.first_name} {invitedUser.last_name} invité(e) !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Votre camarade apparaîtra sur votre session
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setInvitedUser(null)}
                    className="mt-2"
                  >
                    Inviter quelqu'un d'autre
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="liaison-code">Code de liaison du camarade</Label>
                    <Input
                      id="liaison-code"
                      value={liaisonCode}
                      onChange={(e) => setLiaisonCode(e.target.value.toUpperCase())}
                      placeholder="Ex: MARIE-7X2K"
                      className="font-mono text-lg tracking-wider uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Demande son code à ton camarade (visible dans son profil)
                    </p>
                  </div>

                  <Button 
                    onClick={inviteByCode} 
                    disabled={inviteLoading || !liaisonCode.trim()}
                    className="w-full"
                  >
                    {inviteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Invitation...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Inviter ce camarade
                      </>
                    )}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
