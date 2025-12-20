import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RevisionSession, CalendarEvent, Subject } from '@/types/planning';

interface MonthlyCalendarViewProps {
  currentMonth: Date;
  sessions: RevisionSession[];
  calendarEvents: CalendarEvent[];
  subjects: Subject[];
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onSessionClick: (session: RevisionSession) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const MonthlyCalendarView = ({
  currentMonth,
  sessions,
  calendarEvents,
  subjects,
  onMonthChange,
  onDayClick,
  onSessionClick,
  onEventClick
}: MonthlyCalendarViewProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate all days to display
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Group days by weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === dateStr);
  };

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(e => {
      const eventDate = parseISO(e.start_datetime);
      return isSameDay(eventDate, date);
    });
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6366f1';
  };

  const today = new Date();

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addDays(monthStart, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addDays(monthEnd, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-border">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
            {week.map((dayDate) => {
              const daySessions = getSessionsForDay(dayDate);
              const dayEvents = getEventsForDay(dayDate);
              const isCurrentMonth = isSameMonth(dayDate, currentMonth);
              const isToday = isSameDay(dayDate, today);
              const hasItems = daySessions.length > 0 || dayEvents.length > 0;

              return (
                <div
                  key={dayDate.toISOString()}
                  className={`min-h-[100px] p-1 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !isCurrentMonth ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => onDayClick(dayDate)}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full ${
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {format(dayDate, 'd')}
                    </span>
                  </div>

                  {/* Events and sessions */}
                  <div className="space-y-0.5 overflow-hidden">
                    {/* Calendar events */}
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="px-1.5 py-0.5 text-[10px] font-medium rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: event.event_type === 'exam' ? '#ef4444' : '#6366f1',
                          color: 'white'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {/* Revision sessions */}
                    {daySessions.slice(0, 2 - Math.min(dayEvents.length, 2)).map((session) => (
                      <div
                        key={session.id}
                        className="px-1.5 py-0.5 text-[10px] font-medium rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: getSubjectColor(session.subject_id),
                          color: 'white'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionClick(session);
                        }}
                      >
                        {session.subject?.name || 'Session'}
                      </div>
                    ))}

                    {/* More indicator */}
                    {(daySessions.length + dayEvents.length) > 2 && (
                      <div className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        +{daySessions.length + dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
