import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Clock, CalendarDays } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Task } from '@/types/planning';

interface PlanTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  weekStart: Date;
  onPlanned: () => void;
}

export const PlanTaskDialog = ({ open, onOpenChange, task, weekStart, onPlanned }: PlanTaskDialogProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('0');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('60');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    offset: i,
    date: addDays(weekStart, i),
    label: format(addDays(weekStart, i), 'EEEE d', { locale: fr }),
  }));

  // Generate time slots (7h - 22h, every 30 min)
  const timeSlots = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (task && open) {
      setDuration(task.estimated_duration_minutes?.toString() || '60');
      setSelectedDay('0');
      setStartTime('09:00');
    }
  }, [task, open]);

  const handlePlan = async () => {
    if (!user || !task) return;

    setSaving(true);

    try {
      const selectedDate = addDays(weekStart, parseInt(selectedDay));
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Calculate end time
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const durationMinutes = parseInt(duration);
      const endMinutes = startHour * 60 + startMinute + durationMinutes;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTime = `${String(Math.min(23, endHour)).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

      // Create datetime strings
      const startDatetime = new Date(`${dateStr}T${startTime}:00`);
      const endDatetime = new Date(`${dateStr}T${endTime}:00`);

      // Create the calendar event
      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: `📋 ${task.title}`,
          start_datetime: startDatetime.toISOString(),
          end_datetime: endDatetime.toISOString(),
          is_blocking: true,
          event_type: 'revision_libre',
          source: 'task',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Update task with linked event
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ linked_event_id: eventData.id })
        .eq('id', task.id);

      if (taskError) throw taskError;

      onPlanned();
    } catch (err) {
      console.error('Error planning task:', err);
      toast.error('Erreur lors de la planification');
    } finally {
      setSaving(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Planifier cette tâche
          </DialogTitle>
          <DialogDescription>
            Ajoute cette tâche à ton planning hebdomadaire.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Task summary */}
          <div className="p-3 bg-secondary/50 rounded-lg mb-4">
            <p className="font-medium text-sm">{task.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {task.subject && (
                <span className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: task.subject.color }}
                  />
                  {task.subject.name}
                </span>
              )}
              {task.estimated_duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimated_duration_minutes >= 60 
                    ? `${Math.floor(task.estimated_duration_minutes / 60)}h${task.estimated_duration_minutes % 60 > 0 ? task.estimated_duration_minutes % 60 : ''}`
                    : `${task.estimated_duration_minutes}min`
                  }
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Jour</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un jour" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map(day => (
                    <SelectItem key={day.offset} value={day.offset.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durée</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handlePlan} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Planifier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
