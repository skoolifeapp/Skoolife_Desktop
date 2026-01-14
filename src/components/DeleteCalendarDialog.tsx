import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Calendar, BookOpen, Layers } from 'lucide-react';

type DeleteOption = 'all' | 'events_only' | 'sessions_only';

interface DeleteCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventCount: number;
  sessionCount: number;
  onDelete: (option: DeleteOption) => Promise<void>;
}

export function DeleteCalendarDialog({
  open,
  onOpenChange,
  eventCount,
  sessionCount,
  onDelete,
}: DeleteCalendarDialogProps) {
  const [selectedOption, setSelectedOption] = useState<DeleteOption>('all');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(selectedOption);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCount = eventCount + sessionCount;

  const getDeleteCount = () => {
    switch (selectedOption) {
      case 'all':
        return totalCount;
      case 'events_only':
        return eventCount;
      case 'sessions_only':
        return sessionCount;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Supprimer des éléments
          </DialogTitle>
          <DialogDescription>
            Choisis ce que tu veux supprimer de ton calendrier. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedOption}
          onValueChange={(value) => setSelectedOption(value as DeleteOption)}
          className="gap-3 py-4"
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="all" id="all" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer font-medium">
                <Layers className="w-4 h-4 text-primary" />
                Tout supprimer
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Supprime tous les événements ({eventCount}) et toutes les sessions de révision ({sessionCount})
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="events_only" id="events_only" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="events_only" className="flex items-center gap-2 cursor-pointer font-medium">
                <Calendar className="w-4 h-4 text-blue-500" />
                Événements uniquement
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Supprime les événements (cours, travail, perso, etc.) mais garde les sessions de révision
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="sessions_only" id="sessions_only" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="sessions_only" className="flex items-center gap-2 cursor-pointer font-medium">
                <BookOpen className="w-4 h-4 text-green-500" />
                Sessions de révision uniquement
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Supprime les sessions générées par Skoolife mais garde les événements importés
              </p>
            </div>
          </div>
        </RadioGroup>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || getDeleteCount() === 0}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Supprimer ({getDeleteCount()})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
