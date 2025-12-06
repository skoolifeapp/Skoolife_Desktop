import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, X, Loader2, GraduationCap } from 'lucide-react';
import type { Subject } from '@/types/planning';

const SUBJECT_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
  '#EF4444', '#6366F1', '#84CC16', '#F59E0B'
];

interface ManageSubjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onSubjectsChange: () => void;
}

const ManageSubjectsDialog = ({ open, onOpenChange, subjects, onSubjectsChange }: ManageSubjectsDialogProps) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const addSubject = async () => {
    if (!newSubjectName.trim() || !user) return;
    
    setAdding(true);

    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: newSubjectName.trim(),
          color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
          exam_weight: 3
        });

      if (error) throw error;

      setNewSubjectName('');
      onSubjectsChange();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setAdding(false);
    }
  };

  const deleteSubject = async (id: string) => {
    setDeletingId(id);

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onSubjectsChange();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      onSubjectsChange();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Gérer mes matières
          </DialogTitle>
          <DialogDescription>
            Ajoute, modifie ou supprime tes matières
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add subject */}
          <div className="flex gap-2">
            <Input
              placeholder="Nouvelle matière (ex: Physique)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubject()}
              className="h-11"
            />
            <Button 
              onClick={addSubject} 
              size="icon" 
              className="h-11 w-11 shrink-0"
              disabled={adding || !newSubjectName.trim()}
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Subject list */}
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div 
                key={subject.id}
                className="p-4 rounded-xl bg-secondary/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all"
                      style={{ backgroundColor: subject.color }}
                      title="Couleur de la matière"
                    />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteSubject(subject.id)}
                    disabled={deletingId === subject.id}
                  >
                    {deletingId === subject.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date d'examen</Label>
                    <Input
                      type="date"
                      value={subject.exam_date || ''}
                      onChange={(e) => updateSubject(subject.id, { exam_date: e.target.value || null })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Objectif (heures)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      placeholder="Ex: 20"
                      value={subject.target_hours || ''}
                      onChange={(e) => updateSubject(subject.id, { target_hours: e.target.value ? parseInt(e.target.value) : null })}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Priorité ({subject.exam_weight}/5)
                    </Label>
                    <Slider
                      value={[subject.exam_weight]}
                      onValueChange={([v]) => updateSubject(subject.id, { exam_weight: v })}
                      min={1}
                      max={5}
                      step={1}
                      className="py-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Difficulté</Label>
                    <Select
                      value={(subject as any).difficulty_level || 'moyen'}
                      onValueChange={(v) => updateSubject(subject.id, { difficulty_level: v } as any)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            {subjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Aucune matière pour le moment</p>
                <p className="text-sm">Ajoute ta première matière ci-dessus</p>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSubjectsDialog;