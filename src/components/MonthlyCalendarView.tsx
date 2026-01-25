import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RevisionSession, CalendarEvent, Subject } from '@/types/planning';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { getEventTypeColorClass, getEventColor, hasCustomColors } from '@/lib/eventTypeColors';

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

  // Memoize days generation
  const weeks = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [calendarStart.getTime(), calendarEnd.getTime()]);

  // Memoize subject color lookup
  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach(s => {
      map[s.id] = s.color || '#6366f1';
    });
    return map;
  }, [subjects]);

  // Get exams from subjects with exam_date
  const getExamsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return subjects.filter(s => s.exam_date === dateStr && s.status === 'active');
  };

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

  // Use centralized event type colors

  const getSessionStatusStyle = (status: string | null) => {
    switch (status) {
      case 'done': return 'ring-2 ring-green-500 ring-offset-1';
      case 'missed': return 'opacity-50 line-through';
      default: return '';
    }
  };

  const today = new Date();

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthSessions = sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return isSameMonth(sessionDate, currentMonth);
    });
    
    const totalHours = monthSessions.reduce((total, session) => {
      const [startH, startM] = session.start_time.split(':').map(Number);
      const [endH, endM] = session.end_time.split(':').map(Number);
      const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      return total + durationMinutes / 60;
    }, 0);
    
    const doneSessions = monthSessions.filter(s => s.status === 'done').length;
    const plannedSessions = monthSessions.filter(s => s.status === 'planned').length;
    
    return { totalHours, doneSessions, plannedSessions, total: monthSessions.length };
  }, [sessions, currentMonth]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Monthly stats bar */}
      <div className="flex items-center px-4 py-3 bg-muted/30 border-b border-border text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Heures planifiées:</span>
            <span className="font-semibold">{monthlyStats.totalHours.toFixed(1)}h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sessions:</span>
            <span className="font-semibold">{monthlyStats.total}</span>
            {monthlyStats.doneSessions > 0 && (
              <span className="text-green-600 text-xs">({monthlyStats.doneSessions} ✓)</span>
            )}
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayName) => (
          <div
            key={dayName}
            className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
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
              const dayExams = getExamsForDay(dayDate);
              const isCurrentMonth = isSameMonth(dayDate, currentMonth);
              const isToday = isSameDay(dayDate, today);
              const totalItems = daySessions.length + dayEvents.length + dayExams.length;
              const maxDisplay = 3;

              return (
                <div
                  key={dayDate.toISOString()}
                  className={cn(
                    "min-h-[110px] p-1.5 cursor-pointer transition-all group",
                    !isCurrentMonth && "bg-muted/30",
                    isCurrentMonth && "hover:bg-muted/50",
                    isToday && "bg-primary/5"
                  )}
                  onClick={() => onDayClick(dayDate)}
                >
                  {/* Day number */}
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={cn(
                        "w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full transition-colors",
                        isToday && "bg-primary text-primary-foreground",
                        !isToday && isCurrentMonth && "text-foreground group-hover:bg-muted",
                        !isCurrentMonth && "text-muted-foreground/50"
                      )}
                    >
                      {format(dayDate, 'd')}
                    </span>
                    {totalItems > 0 && (
                      <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 bg-muted rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </div>

                  {/* Events and sessions */}
                  <div className="space-y-0.5 overflow-hidden">
                    {/* Subject exams first (from subjects with exam_date) */}
                    {dayExams.slice(0, maxDisplay).map((subject) => (
                      <div
                        key={`exam-${subject.id}`}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded truncate bg-red-500 text-white"
                        title={`📚 Examen: ${subject.name}`}
                      >
                        📚 {subject.name}
                      </div>
                    ))}

                    {/* Calendar events (cours, etc.) */}
                    {dayEvents.slice(0, Math.max(0, maxDisplay - dayExams.length)).map((event) => {
                      const useCustom = hasCustomColors();
                      const colorClass = useCustom ? '' : getEventTypeColorClass(event.event_type);
                      const inlineStyle = useCustom ? { backgroundColor: getEventColor(event.event_type) } : undefined;
                      
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "px-1.5 py-0.5 text-[10px] font-medium rounded truncate cursor-pointer transition-opacity hover:opacity-80 text-white",
                            colorClass
                          )}
                          style={inlineStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={`${event.title} - ${format(parseISO(event.start_datetime), 'HH:mm')}`}
                        >
                          <span className="opacity-70 mr-1">{format(parseISO(event.start_datetime), 'HH:mm')}</span>
                          {event.title}
                        </div>
                      );
                    })}

                    {/* Revision sessions */}
                    {daySessions.slice(0, Math.max(0, maxDisplay - dayExams.length - Math.min(dayEvents.length, maxDisplay - dayExams.length))).map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] font-medium rounded truncate cursor-pointer transition-opacity hover:opacity-80 text-white",
                          getSessionStatusStyle(session.status)
                        )}
                        style={{ backgroundColor: subjectColorMap[session.subject_id] || '#6366f1' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionClick(session);
                        }}
                        title={`${session.subject?.name || 'Session'} - ${session.start_time} à ${session.end_time}`}
                      >
                        <span className="opacity-70 mr-1">{session.start_time.slice(0, 5)}</span>
                        {session.subject?.name || 'Session'}
                      </div>
                    ))}

                    {/* More indicator */}
                    {totalItems > maxDisplay && (
                      <div className="px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                        +{totalItems - maxDisplay} autre{totalItems - maxDisplay > 1 ? 's' : ''}
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
