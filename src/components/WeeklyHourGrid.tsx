import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useRef } from 'react';
import type { RevisionSession, CalendarEvent } from '@/types/planning';

interface WeeklyHourGridProps {
  weekDays: Date[];
  sessions: RevisionSession[];
  calendarEvents: CalendarEvent[];
  onSessionClick: (session: RevisionSession) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

// Grid configuration - Full 24h display
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 60; // pixels per hour
const DEFAULT_SCROLL_HOUR = 7; // Auto-scroll to this hour on load

// Types for overlap calculation
interface TimeBlock {
  id: string;
  startMinutes: number;
  endMinutes: number;
  type: 'session' | 'event';
  data: RevisionSession | CalendarEvent;
}

interface PositionedBlock extends TimeBlock {
  column: number;
  totalColumns: number;
}

// Check if two time blocks overlap
const blocksOverlap = (a: TimeBlock, b: TimeBlock): boolean => {
  return a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;
};

// Calculate positions for overlapping blocks (Google Calendar style)
const calculateOverlapPositions = (blocks: TimeBlock[]): PositionedBlock[] => {
  if (blocks.length === 0) return [];

  // Sort by start time, then by end time (longer events first)
  const sorted = [...blocks].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    return b.endMinutes - a.endMinutes;
  });

  const positioned: PositionedBlock[] = [];
  const columns: TimeBlock[][] = [];

  for (const block of sorted) {
    // Find the first column where this block doesn't overlap with existing blocks
    let columnIndex = 0;
    let placed = false;

    while (!placed) {
      if (!columns[columnIndex]) {
        columns[columnIndex] = [];
      }

      // Check if block overlaps with any block in this column
      const hasOverlap = columns[columnIndex].some(existing => blocksOverlap(block, existing));

      if (!hasOverlap) {
        columns[columnIndex].push(block);
        positioned.push({ ...block, column: columnIndex, totalColumns: 0 });
        placed = true;
      } else {
        columnIndex++;
      }
    }
  }

  // Calculate total columns for each group of overlapping blocks
  const totalColumns = columns.length;

  // For each block, find how many columns are actually used in its time range
  return positioned.map(block => {
    // Find all blocks that overlap with this one
    const overlappingBlocks = positioned.filter(other => blocksOverlap(block, other));
    const maxColumn = Math.max(...overlappingBlocks.map(b => b.column)) + 1;
    return { ...block, totalColumns: maxColumn };
  });
};

// Smart datetime parser that handles both UTC ISO strings and local datetime strings
const parseSmartDateTime = (datetimeStr: string): { hours: number; minutes: number; date: Date } => {
  // Check if it's a UTC/ISO string (contains 'Z' or timezone offset like '+00:00' or '-05:00')
  const isUTC = datetimeStr.includes('Z') || /[+-]\d{2}:\d{2}$/.test(datetimeStr);
  
  if (isUTC) {
    // Use parseISO which handles timezone conversion to local time
    const date = parseISO(datetimeStr);
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      date: date
    };
  } else {
    // Local datetime string like "2024-01-15T09:00:00" - parse without conversion
    const dateTimePart = datetimeStr.split('+')[0].split('Z')[0];
    const [datePart, timePart] = dateTimePart.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = (timePart || '00:00:00').split(':').map(Number);
    
    return {
      hours,
      minutes,
      date: new Date(year, month - 1, day)
    };
  }
};

const WeeklyHourGrid = ({ weekDays, sessions, calendarEvents, onSessionClick, onEventClick }: WeeklyHourGridProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to DEFAULT_SCROLL_HOUR on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = (DEFAULT_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);
  
  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === dateStr);
  };

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(e => {
      const parsed = parseSmartDateTime(e.start_datetime);
      return isSameDay(parsed.date, date);
    });
  };

  // Calculate position and height for a time-based item
  const getItemStyle = (startTime: string, endTime: string, isDatetime: boolean = false) => {
    let startHour: number, startMinute: number, endHour: number, endMinute: number;

    if (isDatetime) {
      // For datetime strings (calendar events) - use smart parser
      const startParsed = parseSmartDateTime(startTime);
      const endParsed = parseSmartDateTime(endTime);
      startHour = startParsed.hours;
      startMinute = startParsed.minutes;
      endHour = endParsed.hours;
      endMinute = endParsed.minutes;
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
      const startParsed = parseSmartDateTime(startTime);
      const endParsed = parseSmartDateTime(endTime);
      const formatTime = (h: number, m: number) => 
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return `${formatTime(startParsed.hours, startParsed.minutes)} - ${formatTime(endParsed.hours, endParsed.minutes)}`;
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
      <div ref={scrollContainerRef} className="overflow-y-auto max-h-[600px]">
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

            // Convert all items to TimeBlocks for overlap calculation
            const timeBlocks: TimeBlock[] = [
              ...dayEvents.map(event => {
                const startParsed = parseSmartDateTime(event.start_datetime);
                const endParsed = parseSmartDateTime(event.end_datetime);
                return {
                  id: event.id,
                  startMinutes: startParsed.hours * 60 + startParsed.minutes,
                  endMinutes: endParsed.hours * 60 + endParsed.minutes,
                  type: 'event' as const,
                  data: event
                };
              }),
              ...daySessions.map(session => {
                const [sh, sm] = session.start_time.split(':').map(Number);
                const [eh, em] = session.end_time.split(':').map(Number);
                return {
                  id: session.id,
                  startMinutes: sh * 60 + sm,
                  endMinutes: eh * 60 + em,
                  type: 'session' as const,
                  data: session
                };
              })
            ];

            const positionedBlocks = calculateOverlapPositions(timeBlocks);

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

                {/* Render all positioned blocks */}
                {positionedBlocks.map((block) => {
                  const widthPercent = 100 / block.totalColumns;
                  const leftPercent = block.column * widthPercent;
                  const gap = 2; // px gap between columns

                  if (block.type === 'event') {
                    const event = block.data as CalendarEvent;
                    const style = getItemStyle(event.start_datetime, event.end_datetime, true);
                    const isClickable = !!onEventClick;
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        disabled={!isClickable}
                        className={cn(
                          "absolute rounded-md px-1 py-1 overflow-hidden bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 z-10 flex flex-col items-start justify-start text-left",
                          isClickable && "cursor-pointer transition-all hover:shadow-md"
                        )}
                        style={{
                          ...style,
                          left: `calc(${leftPercent}% + ${gap}px)`,
                          width: `calc(${widthPercent}% - ${gap * 2}px)`,
                        }}
                        title={`${event.title}\n${formatTimeRange(event.start_datetime, event.end_datetime, true)}`}
                      >
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate w-full">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-300">
                          {formatTimeRange(event.start_datetime, event.end_datetime, true)}
                        </p>
                      </button>
                    );
                  } else {
                    const session = block.data as RevisionSession;
                    const style = getItemStyle(session.start_time, session.end_time, false);
                    const isDone = session.status === 'done';
                    
                    return (
                      <button
                        key={session.id}
                        onClick={() => onSessionClick(session)}
                        className={`absolute rounded-md px-1 py-1 overflow-hidden flex flex-col items-start justify-start text-left transition-all hover:shadow-md z-20 ${
                          isDone ? 'opacity-60' : ''
                        }`}
                        style={{
                          ...style,
                          left: `calc(${leftPercent}% + ${gap}px)`,
                          width: `calc(${widthPercent}% - ${gap * 2}px)`,
                          backgroundColor: `${session.subject?.color}25`,
                          borderLeft: `3px solid ${session.subject?.color}`,
                        }}
                        title={`${session.subject?.name}\n${formatTimeRange(session.start_time, session.end_time)}`}
                      >
                        <p 
                          className={`text-xs font-semibold truncate w-full ${isDone ? 'line-through' : ''}`}
                          style={{ color: session.subject?.color }}
                        >
                          {session.subject?.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTimeRange(session.start_time, session.end_time)}
                        </p>
                      </button>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper cn function if not imported
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default WeeklyHourGrid;
