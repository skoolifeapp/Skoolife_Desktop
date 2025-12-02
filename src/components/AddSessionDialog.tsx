import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, BookOpen } from 'lucide-react';
import type { Subject } from '@/types/planning';

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onSessionAdded: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

const AddSessionDialog = ({ 
  open, 
  onOpenChange, 
  subjects, 
  onSessionAdded,
  initialDate,
  initialStartTime,
  initialEndTime 
}: AddSessionDialogProps) => {
  const { user } = useAuth();
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState(initialStartTime || '09:00');
  const [endTime, setEndTime] = useState(initialEndTime || '10:30');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form when initial values change
  useState(() => {
    if (initialDate) setDate(initialDate);
    if (initialStartTime) setStartTime(initialStartTime);
    if (initialEndTime) setEndTime(initialEndTime);
  });

  const handleSave = async () => {
    if (!user || !subjectId) {
      toast.error('Sélectionne une matière');
      return;
    }

    if (!date || !startTime || !endTime) {
      toast.error('Remplis tous les champs obligatoires');
      return;
    }

    if (startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('revision_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          date,
          start_time: startTime,
          end_time: endTime,
          notes: notes || null,
          status: 'planned'
        });

      if (error) throw error;

      // Reset form
      setSubjectId('');
      setNotes('');
      
      onOpenChange(false);
      onSessionAdded();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset with initial values when opening
      setDate(initialDate || '');
      setStartTime(initialStartTime || '09:00');
      setEndTime(initialEndTime || '10:30');
      setSubjectId('');
      setNotes('');
    }
    onOpenChange(newOpen);
  };

  const currentSubject = subjects.find(s => s.id === subjectId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Nouvelle session de révision
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subject indicator */}
          {currentSubject && (
            <div 
              className="p-3 rounded-lg"
              style={{ 
                backgroundColor: `${currentSubject.color}15`,
                borderLeft: `4px solid ${currentSubject.color}`
              }}
            >
              <p className="font-semibold" style={{ color: currentSubject.color }}>
                {currentSubject.name}
              </p>
            </div>
          )}

          {/* Subject select */}
          <div className="space-y-2">
            <Label>Matière *</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Début *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin *</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Ajoute des notes pour cette session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSave}
              disabled={loading || !subjectId}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Créer la session'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSessionDialog;
