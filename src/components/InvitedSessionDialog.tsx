import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, Video, ExternalLink, X, Check } from 'lucide-react';
import type { RevisionSession } from '@/types/planning';

interface InvitedSessionDialogProps {
  session: RevisionSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sessionId: string) => void;
  onDecline: (sessionId: string) => void;
}

export function InvitedSessionDialog({
  session,
  open,
  onOpenChange,
  onConfirm,
  onDecline,
}: InvitedSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(session.id);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleDecline = async () => {
    setIsLoading(true);
    await onDecline(session.id);
    setIsLoading(false);
    onOpenChange(false);
  };

  const formattedDate = format(parseISO(session.date), 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: session.subject?.color || '#8b5cf6' }}
            />
            {session.subject?.name}
          </DialogTitle>
          <DialogDescription>
            Session de révision à laquelle tu as été invité(e)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Inviter info */}
          {session.inviterName && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-violet-500" />
              <span>
                Invité par <span className="font-medium">{session.inviterName}</span>
              </span>
            </div>
          )}

          {/* Date and time */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</span>
          </div>

          {/* Meeting format */}
          {session.inviteMeetingFormat === 'visio' && (
            <div className="flex items-center gap-3 text-sm">
              <Video className="w-4 h-4 text-blue-500" />
              <span>Visioconférence</span>
              {session.inviteMeetingLink && (
                <a
                  href={session.inviteMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline ml-auto"
                >
                  Rejoindre
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {session.inviteMeetingFormat === 'presentiel' && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>
                En présentiel
                {session.inviteMeetingAddress && (
                  <span className="text-muted-foreground ml-1">
                    - {session.inviteMeetingAddress}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Show confirmation status or action buttons */}
        {session.inviteConfirmed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                Participation confirmée
              </span>
            </div>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleDecline}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler ma participation
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleDecline}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Refuser
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
