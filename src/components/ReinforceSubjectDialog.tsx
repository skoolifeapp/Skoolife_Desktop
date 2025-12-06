import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Clock, AlertTriangle } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ExamPreparationScore } from '@/hooks/useExamPreparationScores';

interface ReinforceSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: ExamPreparationScore | null;
  onComplete: () => void;
}

interface CalendarEvent {
  start_datetime: string;
  end_datetime: string;
  is_blocking: boolean;
}

interface RevisionSession {
  date: string;
  start_time: string;
  end_time: string;
}

const ReinforceSubjectDialog = ({
  open,
  onOpenChange,
  subject,
  onComplete,
}: ReinforceSubjectDialogProps) => {
  const [reinforcing, setReinforcing] = useState(false);
  const [result, setResult] = useState<{ added: number; remaining: number } | null>(null);
  const { user } = useAuth();

  const handleReinforce = async () => {
    if (!user || !subject) return;

    setReinforcing(true);
    setResult(null);

    try {
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get current week bounds
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);

      // Fetch existing events and sessions for the week
      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('start_datetime, end_datetime, is_blocking')
        .eq('user_id', user.id)
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', weekEnd.toISOString());

      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('date, start_time, end_time')
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      const events = (eventsData as CalendarEvent[]) || [];
      const sessions = (sessionsData as RevisionSession[]) || [];

      // Extract preferences
      const preferredDays = preferences?.preferred_days_of_week || [1, 2, 3, 4, 5];
      const dailyStartTime = preferences?.daily_start_time || '08:00';
      const dailyEndTime = preferences?.daily_end_time || '22:00';
      const maxHoursPerDay = preferences?.max_hours_per_day || 4;
      const sessionDuration = (preferences as any)?.session_duration_minutes || 60;
      const avoidEarlyMorning = preferences?.avoid_early_morning || false;
      const avoidLateEvening = preferences?.avoid_late_evening || false;

      // Parse times
      const [startHour] = dailyStartTime.split(':').map(Number);
      const [endHour] = dailyEndTime.split(':').map(Number);

      let effectiveStartHour = startHour;
      let effectiveEndHour = endHour;
      if (avoidEarlyMorning && effectiveStartHour < 9) effectiveStartHour = 9;
      if (avoidLateEvening && effectiveEndHour > 21) effectiveEndHour = 21;

      // Calculate how much to add (max 6 hours this week for this subject)
      const maxWeeklyReinforceMinutes = 360; // 6 hours
      const remainingMinutes = subject.remainingMinutes;
      const minutesToAdd = Math.min(remainingMinutes, maxWeeklyReinforceMinutes);

      if (minutesToAdd <= 0) {
        setResult({ added: 0, remaining: 0 });
        setReinforcing(false);
        return;
      }

      // Convert preferred days to offsets
      const workDays = preferredDays.map((d: number) => (d === 7 ? 6 : d - 1)).sort((a: number, b: number) => a - b);

      // Find free slots and create sessions
      const newSessions: {
        user_id: string;
        subject_id: string;
        date: string;
        start_time: string;
        end_time: string;
        status: string;
        notes: string | null;
      }[] = [];
      
      let minutesScheduled = 0;

      for (const dayOffset of workDays) {
        if (minutesScheduled >= minutesToAdd) break;

        const currentDate = addDays(weekStart, dayOffset);
        
        // Skip past days (except today)
        if (currentDate < today && !isSameDay(currentDate, today)) continue;

        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Get events for this day
        const dayEvents = events.filter(e => {
          const eventDate = parseISO(e.start_datetime);
          return isSameDay(eventDate, currentDate) && e.is_blocking;
        });

        // Get existing sessions for this day
        const daySessions = sessions.filter(s => s.date === dateStr);

        // Calculate hours already scheduled today
        const hoursScheduledToday = daySessions.reduce((acc, s) => {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
        }, 0);

        if (hoursScheduledToday >= maxHoursPerDay) continue;

        // Generate possible time slots
        const slotDuration = sessionDuration;
        let currentMinute = effectiveStartHour * 60;
        const endMinute = effectiveEndHour * 60;

        while (currentMinute + slotDuration <= endMinute && minutesScheduled < minutesToAdd) {
          // Skip lunch time
          if (currentMinute >= 12.5 * 60 && currentMinute < 14 * 60) {
            currentMinute = 14 * 60;
            continue;
          }

          const slotStart = `${String(Math.floor(currentMinute / 60)).padStart(2, '0')}:${String(currentMinute % 60).padStart(2, '0')}`;
          const slotEnd = `${String(Math.floor((currentMinute + slotDuration) / 60)).padStart(2, '0')}:${String((currentMinute + slotDuration) % 60).padStart(2, '0')}`;

          // Check conflicts with existing events
          const hasEventConflict = dayEvents.some(e => {
            const eventStart = format(parseISO(e.start_datetime), 'HH:mm');
            const eventEnd = format(parseISO(e.end_datetime), 'HH:mm');
            return (slotStart >= eventStart && slotStart < eventEnd) ||
                   (slotEnd > eventStart && slotEnd <= eventEnd) ||
                   (slotStart <= eventStart && slotEnd >= eventEnd);
          });

          // Check conflicts with existing sessions
          const hasSessionConflict = daySessions.some(s => {
            return (slotStart >= s.start_time && slotStart < s.end_time) ||
                   (slotEnd > s.start_time && slotEnd <= s.end_time) ||
                   (slotStart <= s.start_time && slotEnd >= s.end_time);
          });

          // Check conflicts with sessions we're adding
          const hasNewSessionConflict = newSessions
            .filter(s => s.date === dateStr)
            .some(s => {
              return (slotStart >= s.start_time && slotStart < s.end_time) ||
                     (slotEnd > s.start_time && slotEnd <= s.end_time) ||
                     (slotStart <= s.start_time && slotEnd >= s.end_time);
            });

          if (!hasEventConflict && !hasSessionConflict && !hasNewSessionConflict) {
            // Check if we'd exceed max hours per day
            const newDaySessions = newSessions.filter(s => s.date === dateStr);
            const newHoursToday = newDaySessions.reduce((acc, s) => {
              const [sh, sm] = s.start_time.split(':').map(Number);
              const [eh, em] = s.end_time.split(':').map(Number);
              return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
            }, 0);

            if (hoursScheduledToday + newHoursToday + (slotDuration / 60) <= maxHoursPerDay) {
              newSessions.push({
                user_id: user.id,
                subject_id: subject.subjectId,
                date: dateStr,
                start_time: slotStart,
                end_time: slotEnd,
                status: 'planned',
                notes: `Session ajoutée par le Coach`,
              });

              minutesScheduled += slotDuration;
            }
          }

          currentMinute += slotDuration + 30; // 30 min break between sessions
        }
      }

      // Insert new sessions
      if (newSessions.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(newSessions);

        if (error) throw error;
      }

      const hoursAdded = Math.round((minutesScheduled / 60) * 10) / 10;
      const hoursRemaining = Math.round(((minutesToAdd - minutesScheduled) / 60) * 10) / 10;
      
      setResult({
        added: hoursAdded,
        remaining: Math.max(0, hoursRemaining),
      });

      onComplete();
    } catch (err) {
      console.error('Error reinforcing subject:', err);
    } finally {
      setReinforcing(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  if (!subject) return null;

  const remainingHours = Math.round((subject.remainingMinutes / 60) * 10) / 10;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Renforcer cette matière
          </DialogTitle>
          <DialogDescription>
            {result ? (
              result.added > 0 ? (
                <span className="text-green-600">
                  {result.added}h de révision ajoutées pour {subject.subjectName} !
                </span>
              ) : (
                "Aucun créneau disponible cette semaine"
              )
            ) : (
              `Ajouter des sessions de révision pour ${subject.subjectName}`
            )}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.subjectColor }}
                />
                <div className="flex-1">
                  <p className="font-medium">{subject.subjectName}</p>
                  {subject.examDate && (
                    <p className="text-xs text-muted-foreground">
                      Examen le {format(parseISO(subject.examDate), 'd MMMM', { locale: fr })}
                      {subject.daysUntilExam !== null && ` (J-${subject.daysUntilExam})`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">
                    Il te reste <strong>{remainingHours}h</strong> à réviser pour atteindre ton objectif.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Skoolife va ajouter jusqu'à 6h de sessions cette semaine dans tes créneaux libres.
                  </p>
                </div>
              </div>

              {subject.riskLevel === 'high' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Cette matière nécessite ton attention urgente. Nous recommandons d'ajouter des sessions rapidement.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleReinforce} disabled={reinforcing}>
                {reinforcing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Ajouter des séances
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4 space-y-4">
              {result.added > 0 ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium">
                    {result.added}h ajoutées au planning
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    pour {subject.subjectName}
                  </p>
                  {result.remaining > 0 && (
                    <p className="text-xs text-orange-600 mt-3">
                      Ton planning est chargé, il manque encore {result.remaining}h pour atteindre ton objectif.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-lg font-medium">
                    Aucun créneau disponible
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ton planning est complet cette semaine. Essaie de libérer du temps ou réessaie la semaine prochaine.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fermer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReinforceSubjectDialog;
