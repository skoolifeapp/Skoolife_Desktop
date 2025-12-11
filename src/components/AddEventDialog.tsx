import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addWeeks, addDays, isBefore, isEqual, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const EVENT_TYPES = [
  { value: 'cours', label: 'Cours' },
  { value: 'travail', label: 'Travail' },
  { value: 'perso', label: 'Personnel' },
  { value: 'revision_libre', label: 'Révision libre' },
  { value: 'autre', label: 'Autre' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(100, 'Le titre est trop long'),
  event_type: z.string().min(1, 'Sélectionne un type'),
  date: z.date({ required_error: 'La date est obligatoire' }),
  start_time: z.string().min(1, 'L\'heure de début est obligatoire'),
  end_time: z.string().min(1, 'L\'heure de fin est obligatoire'),
  recurrence: z.enum(['none', 'daily', 'weekdays', 'weekly', 'custom']),
  recurrence_end_date: z.date().optional().nullable(),
  custom_days: z.array(z.number()).optional(),
  is_blocking: z.boolean(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.start_time < data.end_time;
  }
  return true;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ['end_time'],
}).refine((data) => {
  if (data.recurrence !== 'none' && data.recurrence_end_date) {
    return !isBefore(data.recurrence_end_date, data.date);
  }
  return true;
}, {
  message: "La date de fin de récurrence doit être après la date de début",
  path: ['recurrence_end_date'],
}).refine((data) => {
  if (data.recurrence !== 'none' && !data.recurrence_end_date) {
    return false;
  }
  return true;
}, {
  message: "La date de fin est obligatoire pour les récurrences",
  path: ['recurrence_end_date'],
}).refine((data) => {
  if (data.recurrence === 'custom' && (!data.custom_days || data.custom_days.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Sélectionne au moins un jour",
  path: ['custom_days'],
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded: () => void;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
}

// Helper to format date as YYYY-MM-DD without timezone issues
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddEventDialog = ({ open, onOpenChange, onEventAdded, initialDate, initialStartTime, initialEndTime }: AddEventDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      event_type: 'autre',
      date: initialDate,
      start_time: initialStartTime || '09:00',
      end_time: initialEndTime || '10:30',
      recurrence: 'none',
      recurrence_end_date: null,
      custom_days: [],
      is_blocking: true,
    },
  });

  // Reset form with initial values when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        event_type: 'autre',
        date: initialDate,
        start_time: initialStartTime || '09:00',
        end_time: initialEndTime || '10:30',
        recurrence: 'none',
        recurrence_end_date: null,
        custom_days: [],
        is_blocking: true,
      });
    }
  }, [open, initialDate, initialStartTime, initialEndTime]);

  const recurrence = form.watch('recurrence');
  const customDays = form.watch('custom_days') || [];

  const toggleCustomDay = (dayValue: number) => {
    const current = form.getValues('custom_days') || [];
    if (current.includes(dayValue)) {
      form.setValue('custom_days', current.filter(d => d !== dayValue));
    } else {
      form.setValue('custom_days', [...current, dayValue]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setSaving(true);

    try {
      const eventsToInsert: {
        user_id: string;
        title: string;
        event_type: string;
        start_datetime: string;
        end_datetime: string;
        source: string;
        is_blocking: boolean;
        recurrence_group_id: string | null;
      }[] = [];

      // Generate a unique group ID for recurring events
      const recurrenceGroupId = values.recurrence !== 'none' ? crypto.randomUUID() : null;

      const createEventForDate = (date: Date, source: string) => {
        const dateStr = formatLocalDate(date);
        // Create Date objects with local time, then convert to UTC ISO string
        const startDate = new Date(`${dateStr}T${values.start_time}:00`);
        const endDate = new Date(`${dateStr}T${values.end_time}:00`);
        return {
          user_id: user.id,
          title: values.title,
          event_type: values.event_type,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          source,
          is_blocking: values.is_blocking,
          recurrence_group_id: recurrenceGroupId,
        };
      };

      if (values.recurrence === 'none') {
        // Single event
        eventsToInsert.push(createEventForDate(values.date, 'manual'));
      } else {
        // Recurring events
        const endDate = values.recurrence_end_date!;
        let currentDate = new Date(values.date);

        while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
          const dayOfWeek = getDay(currentDate); // 0 = Sunday, 1 = Monday, etc.
          let shouldAdd = false;

          switch (values.recurrence) {
            case 'daily':
              shouldAdd = true;
              break;
            case 'weekdays':
              shouldAdd = dayOfWeek >= 1 && dayOfWeek <= 5;
              break;
            case 'weekly':
              shouldAdd = dayOfWeek === getDay(values.date);
              break;
            case 'custom':
              shouldAdd = (values.custom_days || []).includes(dayOfWeek);
              break;
          }

          if (shouldAdd) {
            eventsToInsert.push(createEventForDate(currentDate, 'manual_recurring'));
          }

          currentDate = addDays(currentDate, 1);
        }
      }

      if (eventsToInsert.length === 0) {
        toast.error('Aucun évènement à créer avec ces paramètres');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('calendar_events')
        .insert(eventsToInsert);

      if (error) throw error;

      form.reset();
      onOpenChange(false);
      onEventAdded();
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error('Erreur lors de l\'ajout de l\'évènement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un évènement</DialogTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormLabel>Date de début</FormLabel>
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

            {/* Recurrence */}
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Récurrence</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="font-normal cursor-pointer">
                          Aucune (une seule fois)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="font-normal cursor-pointer">
                          Tous les jours
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekdays" id="weekdays" />
                        <Label htmlFor="weekdays" className="font-normal cursor-pointer">
                          Tous les jours de semaine (lun–ven)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="font-normal cursor-pointer">
                          Toutes les semaines (même jour)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="font-normal cursor-pointer">
                          Personnalisée
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom days selection */}
            {recurrence === 'custom' && (
              <FormField
                control={form.control}
                name="custom_days"
                render={() => (
                  <FormItem>
                    <FormLabel>Jours de la semaine</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={customDays.includes(day.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCustomDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Recurrence end date */}
            {recurrence !== 'none' && (
              <FormField
                control={form.control}
                name="recurrence_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Jusqu'à quelle date ?</FormLabel>
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
                              <span>Choisis une date de fin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          disabled={(date) => {
                            const formDate = form.getValues('date');
                            return formDate ? isBefore(date, formDate) : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                      Aucune session de révision ne sera placée sur ce créneau.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
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

export default AddEventDialog;
