import { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Trash2, Paperclip, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import type { Subject, RevisionSession } from '@/types/planning';

// Lazy load FileUploadPopover
const FileUploadPopover = lazy(() => import('./FileUploadPopover').then(m => ({ default: m.FileUploadPopover })));

const formSchema = z.object({
  subject_id: z.string().min(1, 'Sélectionne une matière'),
  date: z.date({ required_error: 'La date est obligatoire' }),
  start_time: z.string().min(1, 'L\'heure de début est obligatoire'),
  end_time: z.string().min(1, 'L\'heure de fin est obligatoire'),
  status: z.string(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.start_time < data.end_time;
  }
  return true;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ['end_time'],
});

type FormValues = z.infer<typeof formSchema>;

interface EditSessionDialogProps {
  session: RevisionSession | null;
  subjects: Subject[];
  onClose: () => void;
  onUpdate: () => void;
  onShare?: () => void;
  canShare?: boolean;
}

const EditSessionDialog = memo(({ session, subjects, onClose, onUpdate, onShare, canShare = false }: EditSessionDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_id: '',
      start_time: '09:00',
      end_time: '10:30',
      status: 'planned',
    },
  });

  // Populate form when session changes
  useEffect(() => {
    if (session) {
      const sessionDate = parseISO(session.date);
      
      form.reset({
        subject_id: session.subject_id,
        date: sessionDate,
        start_time: session.start_time.slice(0, 5),
        end_time: session.end_time.slice(0, 5),
        status: session.status || 'planned',
      });
    }
  }, [session, form]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSubmit = async (values: FormValues) => {
    if (!session) return;

    setSaving(true);

    try {
      const year = values.date.getFullYear();
      const month = String(values.date.getMonth() + 1).padStart(2, '0');
      const day = String(values.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const { error } = await supabase
        .from('revision_sessions')
        .update({
          subject_id: values.subject_id,
          date: dateStr,
          start_time: values.start_time,
          end_time: values.end_time,
          status: values.status,
        })
        .eq('id', session.id);

      if (error) throw error;

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error updating session:', err);
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
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

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error deleting session:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const currentSubject = subjects.find(s => s.id === form.watch('subject_id'));
  const currentStatus = form.watch('status');

  return (
    <Dialog open={!!session} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la session</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Subject selector */}
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionne une matière" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisis une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time pickers */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status checkbox */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value === 'done'}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? 'done' : 'planned');
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium cursor-pointer">
                      Marquer comme terminée
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Cette session sera comptabilisée dans ta progression.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Course files section - shared at subject level */}
            {session && currentSubject && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Paperclip className="w-4 h-4 text-primary" />
                  <span>Fichiers de cours</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    (partagés pour "{currentSubject.name}")
                  </span>
                </div>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <Suspense fallback={<div className="flex items-center justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>}>
                    <FileUploadPopover 
                      targetId={session.id} 
                      targetType="session"
                      subjectName={currentSubject.name}
                      onFileChange={onUpdate}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
                {canShare && onShare && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleClose();
                      onShare();
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

EditSessionDialog.displayName = 'EditSessionDialog';

export default EditSessionDialog;
