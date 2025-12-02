import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
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

interface EditEventDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdate: () => void;
}

const EditEventDialog = ({ event, onClose, onUpdate }: EditEventDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Populate form when event changes
  useEffect(() => {
    if (event) {
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

  const onSubmit = async (values: FormValues) => {
    if (!event) return;

    setSaving(true);

    try {
      // Format date as YYYY-MM-DD without timezone conversion
      const year = values.date.getFullYear();
      const month = String(values.date.getMonth() + 1).padStart(2, '0');
      const day = String(values.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Create Date objects with local time, then convert to UTC ISO string
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

      toast.success('Évènement modifié');
      onClose();
      onUpdate();
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast.success('Évènement supprimé');
      onClose();
      onUpdate();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'évènement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
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

            {/* Event Type */}
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

            {/* Date */}
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

            {/* Time inputs */}
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

            {/* Is blocking */}
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

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
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
                onClick={onClose}
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
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
