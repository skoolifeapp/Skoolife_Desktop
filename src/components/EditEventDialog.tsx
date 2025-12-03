import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Trash2, Repeat, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import type { CalendarEvent } from '@/types/planning';

const EVENT_TYPES = [
  { value: 'cours', label: 'Cours' },
  { value: 'travail', label: 'Travail' },
  { value: 'perso', label: 'Personnel' },
  { value: 'revision_libre', label: 'Révision libre' },
  { value: 'autre', label: 'Autre' },
];

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(100, 'Le titre est trop long'),
  event_type: z.string().min(1, 'Sélectionne un type'),
  date: z.date({ required_error: 'La date est obligatoire' }),
  start_time: z.string().min(1, 'L\'heure de début est obligatoire'),
  end_time: z.string().min(1, 'L\'heure de fin est obligatoire'),
  is_blocking: z.boolean(),
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
type DialogMode = 'edit' | 'confirm-delete' | 'confirm-edit';

interface EditEventDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdate: () => void;
}

const EditEventDialog = ({ event, onClose, onUpdate }: EditEventDialogProps) => {
  const [mode, setMode] = useState<DialogMode>('edit');
  const [saving, setSaving] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const isRecurring = event?.recurrence_group_id != null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      event_type: 'autre',
      start_time: '09:00',
      end_time: '10:30',
      is_blocking: true,
    },
  });

  // Reset mode and populate form when event changes
  useEffect(() => {
    if (event) {
      setMode('edit');
      setPendingValues(null);
      const startDate = parseISO(event.start_datetime);
      const endDate = parseISO(event.end_datetime);
      
      form.reset({
        title: event.title,
        event_type: event.event_type || 'autre',
        date: startDate,
        start_time: format(startDate, 'HH:mm'),
        end_time: format(endDate, 'HH:mm'),
        is_blocking: event.is_blocking,
      });
    }
  }, [event, form]);

  const handleClose = () => {
    setMode('edit');
    setPendingValues(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!event) return;

    // If it's a recurring event, show confirmation
    if (isRecurring) {
      setPendingValues(values);
      setMode('confirm-edit');
      return;
    }

    // Otherwise update single event
    await updateSingleEvent(values);
  };

  const updateSingleEvent = async (values: FormValues) => {
    if (!event) return;

    setSaving(true);

    try {
      const year = values.date.getFullYear();
      const month = String(values.date.getMonth() + 1).padStart(2, '0');
      const day = String(values.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const startDate = new Date(`${dateStr}T${values.start_time}:00`);
      const endDate = new Date(`${dateStr}T${values.end_time}:00`);

      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: values.title,
          event_type: values.event_type,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          is_blocking: values.is_blocking,
        })
        .eq('id', event.id);

      if (error) throw error;

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const updateAllRecurrences = async () => {
    if (!event || !event.recurrence_group_id || !pendingValues) return;

    setSavingAll(true);

    try {
      const { data: seriesEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('id, start_datetime')
        .eq('recurrence_group_id', event.recurrence_group_id);

      if (fetchError) throw fetchError;

      const updatePromises = (seriesEvents || []).map(async (seriesEvent) => {
        const eventDate = parseISO(seriesEvent.start_datetime);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const startDate = new Date(`${dateStr}T${pendingValues.start_time}:00`);
        const endDate = new Date(`${dateStr}T${pendingValues.end_time}:00`);

        return supabase
          .from('calendar_events')
          .update({
            title: pendingValues.title,
            event_type: pendingValues.event_type,
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
            is_blocking: pendingValues.is_blocking,
          })
          .eq('id', seriesEvent.id);
      });

      await Promise.all(updatePromises);

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error updating recurrence series:', err);
      toast.error('Erreur lors de la modification de la série');
    } finally {
      setSavingAll(false);
    }
  };

  const handleEditThisOnly = async () => {
    if (pendingValues) {
      await updateSingleEvent(pendingValues);
    }
  };

  const handleDeleteClick = () => {
    if (!event) return;

    if (isRecurring) {
      setMode('confirm-delete');
      return;
    }

    deleteSingleEvent();
  };

  const deleteSingleEvent = async () => {
    if (!event) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllRecurrences = async () => {
    if (!event || !event.recurrence_group_id) return;

    setDeletingAll(true);

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('recurrence_group_id', event.recurrence_group_id)
        .select();

      if (error) throw error;

      handleClose();
      onUpdate();
    } catch (err) {
      console.error('Error deleting recurrence series:', err);
      toast.error('Erreur lors de la suppression de la série');
    } finally {
      setDeletingAll(false);
    }
  };

  // Render content based on mode
  const renderContent = () => {
    if (mode === 'confirm-delete') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Supprimer la récurrence</DialogTitle>
            <DialogDescription>
              Cet évènement fait partie d'une série récurrente. Que souhaites-tu supprimer ?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setMode('edit')}
              className="justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <Button
              variant="outline"
              onClick={deleteSingleEvent}
              disabled={deleting}
              className="justify-center"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cette occurrence uniquement
            </Button>
            
            <Button
              variant="destructive"
              onClick={deleteAllRecurrences}
              disabled={deletingAll}
              className="justify-center"
            >
              {deletingAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Toute la série
            </Button>
          </div>
        </>
      );
    }

    if (mode === 'confirm-edit') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Modifier la récurrence</DialogTitle>
            <DialogDescription>
              Cet évènement fait partie d'une série récurrente. Que souhaites-tu modifier ?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMode('edit');
                setPendingValues(null);
              }}
              className="justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEditThisOnly}
              disabled={saving}
              className="justify-center"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cette occurrence uniquement
            </Button>
            
            <Button
              variant="default"
              onClick={updateAllRecurrences}
              disabled={savingAll}
              className="justify-center"
            >
              {savingAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Toute la série
            </Button>
          </div>
        </>
      );
    }

    // Default: edit mode
    return (
      <>
        <DialogHeader>
          <DialogTitle>Modifier l'évènement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'évènement</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cours de compta, Job étudiant..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'évènement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionne un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="is_blocking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Bloquer ce créneau pour le planning de révisions
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      L'IA évitera de placer des sessions de révision sur ce créneau.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Cet évènement fait partie d'une série récurrente
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={deleting || saving}
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </>
    );
  };

  return (
    <Dialog open={!!event} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
