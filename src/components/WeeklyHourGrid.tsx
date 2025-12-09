import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import type { RevisionSession, CalendarEvent } from '@/types/planning';

export interface GridClickData {
  date: string;
  startTime: string;
  endTime: string;
}

export interface DragDropData {
  date: string;
  startTime: string;
  endTime: string;
}

interface WeeklyHourGridProps {
  weekDays: Date[];
  sessions: RevisionSession[];
  calendarEvents: CalendarEvent[];
  onSessionClick: (session: RevisionSession) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onGridClick?: (data: GridClickData) => void;
  onSessionMove?: (sessionId: string, data: DragDropData) => void;
  onEventMove?: (eventId: string, data: DragDropData) => void;
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

export interface ResizeData {
  startTime?: string;
  endTime?: string;
}

const WeeklyHourGrid = ({ weekDays, sessions, calendarEvents, onSessionClick, onEventClick, onGridClick, onSessionMove, onEventMove, onSessionResize, onEventResize }: WeeklyHourGridProps & {
  onSessionResize?: (sessionId: string, data: ResizeData) => void;
  onEventResize?: (eventId: string, data: ResizeData) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState<{ type: 'session' | 'event'; id: string; duration: number } | null>(null);
  const [dropPreview, setDropPreview] = useState<{ dayIndex: number; top: number; height: number; time: string } | null>(null);
  const [resizingItem, setResizingItem] = useState<{ type: 'session' | 'event'; id: string; direction: 'top' | 'bottom' } | null>(null);
  const [resizePreview, setResizePreview] = useState<{ id: string; newStartTime?: string; newEndTime?: string; top?: number; height: number } | null>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to DEFAULT_SCROLL_HOUR on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = (DEFAULT_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // Calculate current time line position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, type: 'session' | 'event', id: string, durationMinutes: number) => {
    setDraggedItem({ type, id, duration: durationMinutes });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id }));
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDropPreview(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    
    // Calculate the time from drop position (round to 15 min)
    const dropMinutes = (dropY / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const startHour = Math.floor(dropMinutes / 60);
    const startMinute = Math.round((dropMinutes % 60) / 15) * 15;
    
    // Calculate preview position
    const topPosition = (startHour - START_HOUR) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
    const height = (draggedItem.duration / 60) * HOUR_HEIGHT;
    
    // Format time for display
    const endMinutes = startHour * 60 + startMinute + draggedItem.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const formatTime = (h: number, m: number) => 
      `${String(Math.min(23, h)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const timeLabel = `${formatTime(startHour, startMinute)} - ${formatTime(Math.min(24, endHour), endMinute)}`;
    
    setDropPreview({
      dayIndex,
      top: Math.max(0, topPosition),
      height: Math.max(20, height),
      time: timeLabel
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear preview if we're leaving the grid entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDropPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    
    // Calculate the time from drop position
    const dropMinutes = (dropY / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const startHour = Math.floor(dropMinutes / 60);
    const startMinute = Math.round((dropMinutes % 60) / 15) * 15; // Round to 15 min
    
    // Calculate end time based on original duration
    const endMinutes = startHour * 60 + startMinute + draggedItem.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => 
      `${String(Math.min(23, h)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    const dropData: DragDropData = {
      date: format(day, 'yyyy-MM-dd'),
      startTime: formatTime(startHour, startMinute),
      endTime: formatTime(Math.min(24, endHour), endMinute)
    };

    if (draggedItem.type === 'session' && onSessionMove) {
      onSessionMove(draggedItem.id, dropData);
    } else if (draggedItem.type === 'event' && onEventMove) {
      onEventMove(draggedItem.id, dropData);
    }

    setDraggedItem(null);
    setDropPreview(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, type: 'session' | 'event', id: string, startMinutes: number, endMinutes: number, direction: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();
    
    const initialY = e.clientY;
    let currentPreview: { id: string; newStartTime?: string; newEndTime?: string; top?: number; height: number } | null = null;
    
    const formatTime = (h: number, m: number) => 
      `${String(Math.min(23, Math.max(0, h))).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - initialY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15; // Round to 15 min
      
      if (direction === 'bottom') {
        let newEndMinutes = endMinutes + deltaMinutes;
        // Minimum duration of 15 minutes
        if (newEndMinutes < startMinutes + 15) {
          newEndMinutes = startMinutes + 15;
        }
        // Maximum 24:00
        if (newEndMinutes > 24 * 60) {
          newEndMinutes = 24 * 60;
        }
        
        const newEndHour = Math.floor(newEndMinutes / 60);
        const newEndMinute = newEndMinutes % 60;
        const newHeight = ((newEndMinutes - startMinutes) / 60) * HOUR_HEIGHT;
        
        currentPreview = {
          id,
          newEndTime: formatTime(newEndHour, newEndMinute),
          height: newHeight
        };
      } else {
        // Top resize - modify start time
        let newStartMinutes = startMinutes + deltaMinutes;
        // Minimum 00:00
        if (newStartMinutes < 0) {
          newStartMinutes = 0;
        }
        // Minimum duration of 15 minutes
        if (newStartMinutes > endMinutes - 15) {
          newStartMinutes = endMinutes - 15;
        }
        
        const newStartHour = Math.floor(newStartMinutes / 60);
        const newStartMinute = newStartMinutes % 60;
        const newHeight = ((endMinutes - newStartMinutes) / 60) * HOUR_HEIGHT;
        const newTop = (newStartMinutes / 60 - START_HOUR) * HOUR_HEIGHT;
        
        currentPreview = {
          id,
          newStartTime: formatTime(newStartHour, newStartMinute),
          top: newTop,
          height: newHeight
        };
      }
      
      setResizePreview(currentPreview);
    };
    
    const handleMouseUp = () => {
      if (currentPreview) {
        const resizeData: ResizeData = {};
        if (currentPreview.newStartTime) resizeData.startTime = currentPreview.newStartTime;
        if (currentPreview.newEndTime) resizeData.endTime = currentPreview.newEndTime;
        
        if (type === 'session' && onSessionResize) {
          onSessionResize(id, resizeData);
        } else if (type === 'event' && onEventResize) {
          onEventResize(id, resizeData);
        }
      }
      setResizingItem(null);
      setResizePreview(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    setResizingItem({ type, id, direction });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle click on empty grid area
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    if (!onGridClick) return;
    
    // Get click position relative to the grid
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    // Calculate the hour from click position
    const clickedMinutes = (clickY / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const startHour = Math.floor(clickedMinutes / 60);
    const startMinute = Math.floor((clickedMinutes % 60) / 15) * 15; // Round to 15 min
    
    // Default to 1h30 session
    const endMinutes = startHour * 60 + startMinute + 90;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => 
      `${String(Math.min(23, h)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    const slotData: GridClickData = {
      date: format(day, 'yyyy-MM-dd'),
      startTime: formatTime(startHour, startMinute),
      endTime: formatTime(Math.min(24, endHour), endMinute)
    };
    
    // Directly call onGridClick
    onGridClick(slotData);
  };
  
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
                className={`relative border-r border-border last:border-r-0 cursor-pointer ${
                  isToday ? 'bg-primary/5' : ''
                } ${draggedItem ? 'bg-primary/5' : ''}`}
                onClick={(e) => {
                  // Only trigger if clicking on empty space (not on an event/session)
                  if ((e.target as HTMLElement).closest('[draggable]')) return;
                  handleGridClick(e, day);
                }}
                onDragOver={(e) => handleDragOver(e, dayIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <div 
                    key={hour}
                    className="border-b border-border/30"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Drop preview */}
                {dropPreview && dropPreview.dayIndex === dayIndex && (
                  <div 
                    className="absolute left-1 right-1 rounded-md border-2 border-dashed border-primary bg-primary/20 z-25 pointer-events-none flex items-center justify-center"
                    style={{ 
                      top: `${dropPreview.top}px`, 
                      height: `${dropPreview.height}px` 
                    }}
                  >
                    <span className="text-xs font-medium text-primary bg-background/80 px-2 py-0.5 rounded">
                      {dropPreview.time}
                    </span>
                  </div>
                )}

                {/* Current time indicator (only on today) */}
                {isToday && (
                  <div 
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                )}

                {/* Render all positioned blocks */}
                {positionedBlocks.map((block) => {
                  const widthPercent = 100 / block.totalColumns;
                  const leftPercent = block.column * widthPercent;
                  const gap = 2; // px gap between columns
                  const durationMinutes = block.endMinutes - block.startMinutes;

                  if (block.type === 'event') {
                    const event = block.data as CalendarEvent;
                    const style = getItemStyle(event.start_datetime, event.end_datetime, true);
                    const isClickable = !!onEventClick;
                    const isDraggable = !!onEventMove;
                    
                    return (
                      <div
                        key={event.id}
                        data-event-id={event.id}
                        draggable={isDraggable && !resizingItem}
                        onDragStart={(e) => handleDragStart(e, 'event', event.id, durationMinutes)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "absolute rounded-md px-1 py-1 overflow-hidden bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 z-10 flex flex-col items-start justify-start text-left group",
                          isClickable && "cursor-pointer transition-all hover:shadow-md",
                          isDraggable && !resizingItem && "cursor-grab active:cursor-grabbing"
                        )}
                        style={{
                          ...style,
                          left: `calc(${leftPercent}% + ${gap}px)`,
                          width: `calc(${widthPercent}% - ${gap * 2}px)`,
                          top: resizePreview?.id === event.id && resizePreview.top !== undefined ? `${resizePreview.top}px` : style.top,
                          height: resizePreview?.id === event.id ? `${resizePreview.height}px` : style.height,
                        }}
                        title={`${event.title}\n${formatTimeRange(event.start_datetime, event.end_datetime, true)}`}
                      >
                        {/* Top resize handle - only visible when hovering near top */}
                        {onEventResize && (
                          <div
                            className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-blue-400/50 rounded-t-md transition-colors"
                            onMouseDown={(e) => handleResizeStart(e, 'event', event.id, block.startMinutes, block.endMinutes, 'top')}
                          />
                        )}
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate w-full pt-1">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-300">
                          {resizePreview?.id === event.id 
                            ? `${resizePreview.newStartTime || formatTimeRange(event.start_datetime, event.end_datetime, true).split(' - ')[0]} - ${resizePreview.newEndTime || formatTimeRange(event.start_datetime, event.end_datetime, true).split(' - ')[1]}`
                            : formatTimeRange(event.start_datetime, event.end_datetime, true)}
                        </p>
                        {/* Bottom resize handle - only visible when hovering near bottom */}
                        {onEventResize && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-blue-400/50 rounded-b-md transition-colors"
                            onMouseDown={(e) => handleResizeStart(e, 'event', event.id, block.startMinutes, block.endMinutes, 'bottom')}
                          />
                        )}
                      </div>
                    );
                  } else {
                    const session = block.data as RevisionSession;
                    const style = getItemStyle(session.start_time, session.end_time, false);
                    const isDone = session.status === 'done';
                    const isSkipped = session.status === 'skipped';
                    const isDraggable = !!onSessionMove;
                    
                    // Determine border color based on status
                    let borderColor = session.subject?.color || '#FFC107';
                    if (isDone) borderColor = '#22c55e'; // green-500
                    if (isSkipped) borderColor = '#ef4444'; // red-500
                    
                    return (
                      <div
                        key={session.id}
                        draggable={isDraggable && !resizingItem}
                        onDragStart={(e) => handleDragStart(e, 'session', session.id, durationMinutes)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSessionClick(session)}
                        className={cn(
                          "absolute rounded-md px-1 py-1 overflow-hidden flex flex-col items-start justify-start text-left transition-all hover:shadow-md z-20 group",
                          isSkipped && "opacity-50",
                          isDraggable && !resizingItem && "cursor-grab active:cursor-grabbing"
                        )}
                        style={{
                          ...style,
                          left: `calc(${leftPercent}% + ${gap}px)`,
                          width: `calc(${widthPercent}% - ${gap * 2}px)`,
                          backgroundColor: isDone ? 'rgba(34, 197, 94, 0.15)' : isSkipped ? 'rgba(239, 68, 68, 0.1)' : `${session.subject?.color}25`,
                          borderLeft: `3px solid ${borderColor}`,
                          top: resizePreview?.id === session.id && resizePreview.top !== undefined ? `${resizePreview.top}px` : style.top,
                          height: resizePreview?.id === session.id ? `${resizePreview.height}px` : style.height,
                        }}
                        title={`${session.subject?.name}\n${formatTimeRange(session.start_time, session.end_time)}${isDone ? ' ✓' : isSkipped ? ' ✗' : ''}`}
                      >
                        {/* Top resize handle - only visible when hovering near top */}
                        {onSessionResize && (
                          <div
                            className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize rounded-t-md transition-colors hover:opacity-100 opacity-0"
                            style={{ backgroundColor: `${borderColor}50` }}
                            onMouseDown={(e) => handleResizeStart(e, 'session', session.id, block.startMinutes, block.endMinutes, 'top')}
                          />
                        )}
                        <div className="flex items-center gap-1 w-full pt-1">
                          <p 
                            className={`text-xs font-semibold truncate flex-1 ${isDone ? 'line-through' : ''}`}
                            style={{ color: isDone ? '#22c55e' : isSkipped ? '#ef4444' : session.subject?.color }}
                          >
                            {session.subject?.name}
                          </p>
                          {isDone && <span className="text-green-500 text-xs">✓</span>}
                          {isSkipped && <span className="text-red-500 text-xs">✗</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {resizePreview?.id === session.id 
                            ? `${resizePreview.newStartTime || session.start_time.slice(0, 5)} - ${resizePreview.newEndTime || session.end_time.slice(0, 5)}`
                            : formatTimeRange(session.start_time, session.end_time)}
                        </p>
                        {/* Bottom resize handle - only visible when hovering near bottom */}
                        {onSessionResize && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize rounded-b-md transition-colors hover:opacity-100 opacity-0"
                            style={{ backgroundColor: `${borderColor}50` }}
                            onMouseDown={(e) => handleResizeStart(e, 'session', session.id, block.startMinutes, block.endMinutes, 'bottom')}
                          />
                        )}
                      </div>
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
