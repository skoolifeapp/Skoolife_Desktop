import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import type { Subject } from '@/types/planning';

const SUBJECT_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
  '#EF4444', '#6366F1', '#84CC16', '#F59E0B', '#06B6D4', '#D946EF'
];

interface SubjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSaved: () => void;
  onDeleted: () => void;
}

const SubjectDrawer = ({ open, onOpenChange, subject, onSaved, onDeleted }: SubjectDrawerProps) => {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState<string>('');
  const [targetHours, setTargetHours] = useState<string>('');
  const [priority, setPriority] = useState(3);
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const EXAM_TYPES = [
    { value: 'partiel', label: 'Partiel' },
    { value: 'controle_continu', label: 'Contrôle continu' },
    { value: 'oral', label: 'Oral' },
    { value: 'projet', label: 'Projet' },
  ];

  const { user } = useAuth();
  const isEditing = !!subject;

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setExamDate(subject.exam_date || '');
      setExamType((subject as any).exam_type || '');
      setTargetHours(subject.target_hours?.toString() || '');
      setPriority(subject.exam_weight);
      setColor(subject.color);
      setNotes(subject.notes || '');
      setIsArchived(subject.status === 'archived' || subject.status === 'terminated');
    } else {
      // Reset form for new subject
      setName('');
      setExamDate('');
      setExamType('');
      setTargetHours('');
      setPriority(3);
      setColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]);
      setNotes('');
      setIsArchived(false);
    }
  }, [subject, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom de la matière est requis');
      return;
    }
    if (!user) return;

    setSaving(true);

    try {
      const subjectData = {
        name: name.trim(),
        exam_date: examDate || null,
        exam_type: examType || null,
        target_hours: targetHours ? parseInt(targetHours) : null,
        exam_weight: priority,
        color,
        notes: notes.trim() || null,
        status: isArchived ? 'archived' : 'active',
      };

      if (isEditing && subject) {
        const { error } = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', subject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({
            ...subjectData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subject) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subject.id);

      if (error) throw error;

      setDeleteDialogOpen(false);
      onDeleted();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityLabel = (value: number) => {
    if (value <= 2) return 'Basse';
    if (value <= 3) return 'Moyenne';
    return 'Haute';
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? 'Modifier la matière' : 'Ajouter une matière'}
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? 'Modifie les informations de cette matière' 
                : 'Renseigne les informations de ta nouvelle matière'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la matière *</Label>
              <Input
                id="name"
                placeholder="Ex : Comptabilité générale"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Exam Date */}
            <div className="space-y-2">
              <Label htmlFor="exam-date">Date d'examen</Label>
              <Input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laisse vide si la date n'est pas encore connue
              </p>
            </div>

            {/* Exam Type */}
            <div className="space-y-2">
              <Label>Type d'examen</Label>
              <div className="flex flex-wrap gap-2">
                {EXAM_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      examType === type.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                    onClick={() => setExamType(examType === type.value ? '' : type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Hours */}
            <div className="space-y-2">
              <Label htmlFor="target-hours">Objectif total de révision (heures)</Label>
              <Input
                id="target-hours"
                type="number"
                min={0}
                max={500}
                placeholder="Ex : 20"
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
              />
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <Label>Priorité : {getPriorityLabel(priority)} ({priority}/5)</Label>
              <Slider
                value={[priority]}
                onValueChange={([v]) => setPriority(v)}
                min={1}
                max={5}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Basse</span>
                <span>Haute</span>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c 
                        ? 'ring-2 ring-offset-2 ring-primary' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes personnelles (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Chapitres importants, difficultés, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="terminated">Marquer comme terminée</Label>
                <p className="text-xs text-muted-foreground">
                  Les matières terminées conservent leurs anciennes sessions mais n'apparaissent plus dans les nouveaux plannings
                </p>
              </div>
              <Switch
                id="terminated"
                checked={isArchived}
                onCheckedChange={setIsArchived}
              />
            </div>
          </div>

          <SheetFooter className="flex-col gap-3 sm:flex-col">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={saving}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                className="flex-1"
                disabled={saving || !name.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>

            {isEditing && (
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer cette matière
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette matière ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les sessions de révision associées à cette matière seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubjectDrawer;
