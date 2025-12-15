import { Check, X, Pencil, Share2, Users, MapPin, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RevisionSession } from '@/types/planning';

export interface InviteInfo {
  invitees: Array<{ accepted_by: string | null; first_name: string | null; last_name: string | null; confirmed?: boolean }>;
  meeting_format: string | null;
  meeting_address: string | null;
  meeting_link: string | null;
}

interface SessionStatusDialogProps {
  session: RevisionSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkDone: () => void;
  onMarkSkipped: () => void;
  onEdit: () => void;
  onShare?: () => void;
  hasAcceptedInvite?: boolean;
  inviteInfo?: InviteInfo;
}

export function SessionStatusDialog({
  session,
  open,
  onOpenChange,
  onMarkDone,
  onMarkSkipped,
  onEdit,
  onShare,
  hasAcceptedInvite = false,
  inviteInfo,
}: SessionStatusDialogProps) {
  if (!session) return null;

  const formattedDate = format(new Date(session.date), 'EEEE d MMMM', { locale: fr });
  const timeRange = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: session.subject?.color }}
            />
            {session.subject?.name}
            {hasAcceptedInvite && inviteInfo && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                {inviteInfo.invitees.filter(i => i.accepted_by).length} camarade{inviteInfo.invitees.filter(i => i.accepted_by).length > 1 ? 's' : ''}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date and time */}
          <div className="text-sm text-muted-foreground">
            <p className="capitalize">{formattedDate}</p>
            <p>{timeRange}</p>
          </div>

          {/* Invite info */}
          {inviteInfo && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              {inviteInfo.invitees.filter(i => i.accepted_by && i.first_name).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Camarades invités</span>
                  </div>
                  {inviteInfo.invitees.filter(i => i.accepted_by && i.first_name).map((invitee, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm ml-6">
                      {invitee.confirmed ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <span className="text-amber-500 text-xs">⏳</span>
                      )}
                      <span className={invitee.confirmed ? 'text-foreground' : 'text-muted-foreground'}>
                        {invitee.first_name} {invitee.last_name || ''}
                      </span>
                      <span className={`text-xs ${invitee.confirmed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {invitee.confirmed ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {inviteInfo.invitees.length > inviteInfo.invitees.filter(i => i.accepted_by).length && (
                <div className="text-xs text-muted-foreground">
                  {inviteInfo.invitees.length - inviteInfo.invitees.filter(i => i.accepted_by).length} invitation{inviteInfo.invitees.length - inviteInfo.invitees.filter(i => i.accepted_by).length > 1 ? 's' : ''} en attente de réponse
                </div>
              )}
              {inviteInfo.meeting_format && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {inviteInfo.meeting_format === 'visio' ? (
                    <>
                      <Video className="w-4 h-4 text-blue-500" />
                      {inviteInfo.meeting_link ? (
                        <a 
                          href={inviteInfo.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Rejoindre la visio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>Visio (lien à venir)</span>
                      )}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{inviteInfo.meeting_address || 'Présentiel'}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Status indicator */}
          {session.status !== 'planned' && (
            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
              session.status === 'done' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {session.status === 'done' ? 'Terminée' : 'Manquée'}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {session.status !== 'done' && (
              <Button
                variant="outline"
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => {
                  onMarkDone();
                  onOpenChange(false);
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Marquer comme terminée
              </Button>
            )}
            
            {session.status !== 'skipped' && (
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  onMarkSkipped();
                  onOpenChange(false);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Marquer comme manquée
              </Button>
            )}

            {onShare && session.status === 'planned' && (
              <Button
                variant="outline"
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  onShare();
                  onOpenChange(false);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Réviser avec un camarade
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onEdit();
                onOpenChange(false);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifier la session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}