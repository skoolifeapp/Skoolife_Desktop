import { format, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RevisionSession, CalendarEvent } from '@/types/planning';

interface WeeklyHourGridProps {
  weekDays: Date[];
  sessions: RevisionSession[];
  calendarEvents: CalendarEvent[];
  onSessionClick: (session: RevisionSession) => void;
}

// Grid configuration
const START_HOUR = 7;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 60; // pixels per hour

const WeeklyHourGrid = ({ weekDays, sessions, calendarEvents, onSessionClick }: WeeklyHourGridProps) => {
  
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

  // Calculate position and height for a time-based item
  const getItemStyle = (startTime: string, endTime: string, isDatetime: boolean = false) => {
    let startHour: number, startMinute: number, endHour: number, endMinute: number;

    if (isDatetime) {
      // For datetime strings (calendar events)
      const startDate = parseISO(startTime);
      const endDate = parseISO(endTime);
      startHour = startDate.getHours();
      startMinute = startDate.getMinutes();
      endHour = endDate.getHours();
      endMinute = endDate.getMinutes();
    } else {
      // For time strings like "09:00"
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      startHour = sh;
      startMinute = sm;
      endHour = eh;
      endMinute = em;
    }

    // Calculate top position (relative to START_HOUR)
    const topOffset = (startHour - START_HOUR) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
    
    // Calculate height based on duration
    const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return {
      top: `${Math.max(0, topOffset)}px`,
      height: `${Math.max(20, height)}px`, // Minimum height of 20px
    };
  };

  const formatTimeRange = (startTime: string, endTime: string, isDatetime: boolean = false) => {
    if (isDatetime) {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    }
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header row with days */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="p-2 bg-secondary/30 border-r border-border" />
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={index}
              className={`p-3 text-center border-r border-border last:border-r-0 ${
                isToday ? 'bg-primary/10' : 'bg-secondary/30'
              }`}
            >
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, 'EEE', { locale: fr })}
              </p>
              <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Hour labels column */}
          <div className="border-r border-border">
            {HOURS.map(hour => (
              <div 
                key={hour}
                className="border-b border-border/50 text-xs text-muted-foreground flex items-start justify-end pr-2 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const daySessions = getSessionsForDay(day);
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={dayIndex}
                className={`relative border-r border-border last:border-r-0 ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <div 
                    key={hour}
                    className="border-b border-border/30"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Calendar events (ICS imports) */}
                {dayEvents.map((event) => {
                  const style = getItemStyle(event.start_datetime, event.end_datetime, true);
                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 z-10"
                      style={style}
                      title={`${event.title}\n${formatTimeRange(event.start_datetime, event.end_datetime, true)}`}
                    >
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-300">
                        {formatTimeRange(event.start_datetime, event.end_datetime, true)}
                      </p>
                    </div>
                  );
                })}

                {/* Revision sessions */}
                {daySessions.map((session) => {
                  const style = getItemStyle(session.start_time, session.end_time, false);
                  const isDone = session.status === 'done';
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className={`absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-md z-20 ${
                        isDone ? 'opacity-60' : ''
                      }`}
                      style={{
                        ...style,
                        backgroundColor: `${session.subject?.color}25`,
                        borderLeft: `3px solid ${session.subject?.color}`,
                      }}
                      title={`${session.subject?.name}\n${formatTimeRange(session.start_time, session.end_time)}`}
                    >
                      <p 
                        className={`text-xs font-semibold truncate ${isDone ? 'line-through' : ''}`}
                        style={{ color: session.subject?.color }}
                      >
                        {session.subject?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTimeRange(session.start_time, session.end_time)}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyHourGrid;
