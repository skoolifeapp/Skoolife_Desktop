import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevisionSession, Subject } from '@/types/planning';
import { format, parseISO, subHours } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const generateShareLink = async () => {
    if (!session || !user) return;

    setLoading(true);
    try {
      // Calculate expiration: 24h before the session starts
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
    
    const message = encodeURIComponent(
      `Hey ! Je révise ${subject.name} le ${sessionDate} de ${timeRange}. Tu veux réviser avec moi ? 📚\n\n${shareLink}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    onClose();
  };

  if (!session || !subject) return null;

  const sessionDate = format(parseISO(session.date), 'EEEE d MMMM', { locale: fr });
  const timeRange = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;

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

              <div className="flex gap-2">
                <Button 
                  onClick={shareViaWhatsApp}
                  className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Partager via WhatsApp
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Ce lien expire 24h avant le créneau
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}