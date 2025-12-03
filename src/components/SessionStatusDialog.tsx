import { Check, X, Pencil } from 'lucide-react';
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

interface SessionStatusDialogProps {
  session: RevisionSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkDone: () => void;
  onMarkSkipped: () => void;
  onEdit: () => void;
}

export function SessionStatusDialog({
  session,
  open,
  onOpenChange,
  onMarkDone,
  onMarkSkipped,
  onEdit,
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
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date and time */}
          <div className="text-sm text-muted-foreground">
            <p className="capitalize">{formattedDate}</p>
            <p>{timeRange}</p>
          </div>

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
