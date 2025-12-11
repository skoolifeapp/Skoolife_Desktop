import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Plus, Check, X, Loader2, Calendar
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Subject, RevisionSession, CalendarEvent } from '@/types/planning';
import AddEventDialog from '@/components/AddEventDialog';
import { MobileTodayHeader } from '@/components/MobileTodayHeader';

interface TodayEvent {
  id: string;
  type: 'session' | 'event';
  title: string;
  startTime: string;
  endTime: string;
  eventType?: string;
  status?: string;
  color?: string;
  subjectName?: string;
}

const Today = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  useActivityTracker();

  useEffect(() => {
    if (user?.email === 'skoolife.co@gmail.com') {
      navigate('/admin');
      return;
    }
    
    if (!user) {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
        }
      };
      checkSession();
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData && !profileData.is_onboarding_complete) {
        navigate('/onboarding');
        return;
      }

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id);

      setSubjects(subjectsData || []);

      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id);

      const sessionsWithSubjects = (sessionsData || []).map(session => ({
        ...session,
        subject: subjectsData?.find(s => s.id === session.subject_id)
      }));

      setSessions(sessionsWithSubjects);

      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      setCalendarEvents(eventsData || []);

    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getTodayEvents = (): TodayEvent[] => {
    const events: TodayEvent[] = [];
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // Add revision sessions for this day
    sessions
      .filter(s => s.date === dateStr)
      .forEach(session => {
        events.push({
          id: session.id,
          type: 'session',
          title: session.subject?.name || 'Révision',
          startTime: session.start_time,
          endTime: session.end_time,
          status: session.status,
          color: session.subject?.color || '#FFC107',
          subjectName: session.subject?.name
        });
      });

    // Add calendar events for this day
    calendarEvents
      .filter(e => isSameDay(parseISO(e.start_datetime), currentDate))
      .forEach(event => {
        events.push({
          id: event.id,
          type: 'event',
          title: event.title,
          startTime: format(parseISO(event.start_datetime), 'HH:mm'),
          endTime: format(parseISO(event.end_datetime), 'HH:mm'),
          eventType: event.event_type || 'autre'
        });
      });

    // Sort by start time
    return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: 'done' | 'skipped' | 'planned') => {
    if (!user) return;
    
    setUpdatingSessionId(sessionId);
    
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleEventAdded = () => {
    setAddEventDialogOpen(false);
    fetchData();
  };

  const goToPreviousDay = () => setCurrentDate(prev => subDays(prev, 1));
  const goToNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = isSameDay(currentDate, new Date());
  const todayEvents = getTodayEvents();

  const getEventTypeLabel = (type?: string) => {
    switch (type) {
      case 'cours': return 'Cours';
      case 'travail': return 'Travail';
      case 'perso': return 'Perso';
      case 'revision_libre': return 'Révision';
      default: return 'Autre';
    }
  };

  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'cours': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'travail': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'perso': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'revision_libre': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileTodayHeader onSignOut={handleSignOut} />

      <main className="flex-1 px-4 pb-24">
        {/* Date Navigation */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              className="w-10 h-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">
                {isToday ? "Aujourd'hui" : format(currentDate, 'EEEE', { locale: fr })}
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {format(currentDate, 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              className="w-10 h-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="w-full mt-3"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Retour à aujourd'hui
            </Button>
          )}
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Aucun événement prévu pour {isToday ? "aujourd'hui" : 'ce jour'}.
                </p>
              </CardContent>
            </Card>
          ) : (
            todayEvents.map((event) => (
              <Card 
                key={event.id} 
                className={cn(
                  "overflow-hidden transition-all",
                  event.type === 'session' && event.status === 'done' && "opacity-60",
                  event.type === 'session' && event.status === 'skipped' && "opacity-50"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Color bar for sessions */}
                    {event.type === 'session' && (
                      <div 
                        className="w-1.5 shrink-0" 
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Time */}
                          <p className="text-sm font-medium text-primary">
                            {event.startTime} – {event.endTime}
                          </p>
                          
                          {/* Title */}
                          <h3 className={cn(
                            "font-semibold mt-1 truncate",
                            event.type === 'session' && event.status === 'done' && "line-through"
                          )}>
                            {event.title}
                          </h3>
                          
                          {/* Type badge */}
                          {event.type === 'event' && (
                            <span className={cn(
                              "inline-block text-xs px-2 py-0.5 rounded-full mt-2",
                              getEventTypeColor(event.eventType)
                            )}>
                              {getEventTypeLabel(event.eventType)}
                            </span>
                          )}
                          
                          {/* Status badge for sessions */}
                          {event.type === 'session' && event.status !== 'planned' && (
                            <span className={cn(
                              "inline-block text-xs px-2 py-0.5 rounded-full mt-2",
                              event.status === 'done' 
                                ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                : "bg-red-500/20 text-red-700 dark:text-red-300"
                            )}>
                              {event.status === 'done' ? '✓ Fait' : '✗ Sauté'}
                            </span>
                          )}
                        </div>
                        
                        {/* Action buttons for sessions */}
                        {event.type === 'session' && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant={event.status === 'done' ? 'default' : 'outline'}
                              size="icon"
                              className={cn(
                                "w-10 h-10 rounded-full",
                                event.status === 'done' && "bg-green-500 hover:bg-green-600"
                              )}
                              onClick={() => handleUpdateSessionStatus(
                                event.id, 
                                event.status === 'done' ? 'planned' : 'done'
                              )}
                              disabled={updatingSessionId === event.id}
                            >
                              {updatingSessionId === event.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant={event.status === 'skipped' ? 'default' : 'outline'}
                              size="icon"
                              className={cn(
                                "w-10 h-10 rounded-full",
                                event.status === 'skipped' && "bg-red-500 hover:bg-red-600"
                              )}
                              onClick={() => handleUpdateSessionStatus(
                                event.id, 
                                event.status === 'skipped' ? 'planned' : 'skipped'
                              )}
                              disabled={updatingSessionId === event.id}
                            >
                              {updatingSessionId === event.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Floating Add Button */}
      <Button
        variant="hero"
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
        onClick={() => setAddEventDialogOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={addEventDialogOpen}
        onOpenChange={setAddEventDialogOpen}
        onEventAdded={handleEventAdded}
        initialDate={currentDate}
      />
    </div>
  );
};

export default Today;
