import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, Trash2, Loader2, Clock } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface RevisionSession {
  id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  subject?: Subject;
}

interface EditSessionDialogProps {
  session: RevisionSession | null;
  subjects: Subject[];
  onClose: () => void;
  onUpdate: () => void;
}

const EditSessionDialog = ({ session, subjects, onClose, onUpdate }: EditSessionDialogProps) => {
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session) {
      setSubjectId(session.subject_id);
      setDate(session.date);
      setStartTime(session.start_time.slice(0, 5));
      setEndTime(session.end_time.slice(0, 5));
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({
          subject_id: subjectId,
          date,
          start_time: startTime,
          end_time: endTime,
          notes: notes || null
        })
        .eq('id', session.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async () => {
    if (!session) return;
    setLoading(true);

    try {
      const newStatus = session.status === 'done' ? 'planned' : 'done';
      const { error } = await supabase
        .from('revision_sessions')
        .update({ status: newStatus })
        .eq('id', session.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('revision_sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const currentSubject = subjects.find(s => s.id === subjectId);

  return (
    <Dialog open={!!session} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Modifier la session
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
            <Label>Matière</Label>
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
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Début</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
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
          <div className="space-y-3 pt-2">
            <Button 
              variant={session?.status === 'done' ? 'outline' : 'hero'}
              className="w-full"
              onClick={handleMarkDone}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {session?.status === 'done' ? 'Marquer comme à faire' : 'Marquer comme fait'}
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </Button>
              <Button 
                variant="default"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSessionDialog;