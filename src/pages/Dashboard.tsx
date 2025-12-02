import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Upload, Plus, RefreshCw, LogOut,
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, Target, Settings, Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import logo from '@/assets/logo.png';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import ImportCalendarDialog from '@/components/ImportCalendarDialog';
import EditSessionDialog from '@/components/EditSessionDialog';
import EditEventDialog from '@/components/EditEventDialog';
import ManageSubjectsDialog from '@/components/ManageSubjectsDialog';
import AddEventDialog from '@/components/AddEventDialog';
import WeeklyHourGrid, { type GridClickData } from '@/components/WeeklyHourGrid';
import type { Profile, Subject, RevisionSession, CalendarEvent } from '@/types/planning';

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [gridClickData, setGridClickData] = useState<GridClickData | null>(null);
  const [deletingEvents, setDeletingEvents] = useState(false);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (isSigningOut.current) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, weekly_revision_hours, is_onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData && !profileData.is_onboarding_complete) {
        navigate('/onboarding');
        return;
      }

      setProfile(profileData);

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id);

      setSubjects(subjectsData || []);

      // Fetch revision sessions
      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      // Map subjects to sessions
      const sessionsWithSubjects = (sessionsData || []).map(session => ({
        ...session,
        subject: subjectsData?.find(s => s.id === session.subject_id)
      }));

      setSessions(sessionsWithSubjects);

      // Fetch calendar events
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

  const generatePlanning = async () => {
    if (!user || subjects.length === 0) {
      toast.error('Ajoute au moins une matière avant de générer ton planning');
      return;
    }

    setGenerating(true);

    try {
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Delete existing planned sessions for this week
      const weekEnd = addDays(weekStart, 6);
      await supabase
        .from('revision_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      // Extract preferences with defaults
      const preferredDays = preferences?.preferred_days_of_week || [1, 2, 3, 4, 5]; // Mon-Fri by default
      const dailyStartTime = preferences?.daily_start_time || '08:00';
      const dailyEndTime = preferences?.daily_end_time || '22:00';
      const maxHoursPerDay = preferences?.max_hours_per_day || 4;
      const sessionDuration = (preferences as any)?.session_duration_minutes || 90; // Duration in minutes
      const avoidEarlyMorning = preferences?.avoid_early_morning || false; // Before 9h
      const avoidLateEvening = preferences?.avoid_late_evening || false; // After 21h

      // Parse start/end times
      const [startHour] = dailyStartTime.split(':').map(Number);
      const [endHour] = dailyEndTime.split(':').map(Number);

      // Calculate effective start/end hours considering preferences
      let effectiveStartHour = startHour;
      let effectiveEndHour = endHour;
      
      if (avoidEarlyMorning && effectiveStartHour < 9) {
        effectiveStartHour = 9;
      }
      if (avoidLateEvening && effectiveEndHour > 21) {
        effectiveEndHour = 21;
      }

      // Generate time slots based on preferences
      const breakBetweenSessions = 30; // 30 min break
      const timeSlots: { start: string; end: string }[] = [];
      
      let currentHour = effectiveStartHour;
      while (currentHour + 1.5 <= effectiveEndHour) {
        // Skip lunch time (12:30-14:00)
        if (currentHour >= 12.5 && currentHour < 14) {
          currentHour = 14;
          continue;
        }
        
        const startMinutes = currentHour * 60;
        const endMinutes = startMinutes + sessionDuration;
        
        const formatTimeSlot = (minutes: number) => {
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        timeSlots.push({
          start: formatTimeSlot(startMinutes),
          end: formatTimeSlot(endMinutes)
        });
        
        currentHour += (sessionDuration + breakBetweenSessions) / 60;
      }

      // Planning algorithm
      const totalMinutes = (profile?.weekly_revision_hours || 10) * 60;
      const sessionsCount = Math.floor(totalMinutes / sessionDuration);
      const maxSessionsPerDay = Math.floor((maxHoursPerDay * 60) / sessionDuration);

      // Convert preferred days to day offsets (1=Mon becomes 0, 7=Sun becomes 6)
      const workDays = preferredDays.map(d => (d === 7 ? 6 : d - 1)).sort((a, b) => a - b);
      
      const newSessions: { user_id: string; subject_id: string; date: string; start_time: string; end_time: string; status: string; notes: string | null }[] = [];
      let sessionIndex = 0;

      // Sort subjects by exam proximity and weight
      const sortedSubjects = [...subjects].sort((a, b) => {
        // Prioritize subjects with closer exam dates
        if (a.exam_date && b.exam_date) {
          return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
        }
        if (a.exam_date) return -1;
        if (b.exam_date) return 1;
        // Then by weight
        return b.exam_weight - a.exam_weight;
      });

      for (const dayOffset of workDays) {
        const currentDate = addDays(weekStart, dayOffset);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Check blocking events for this day
        const dayEvents = calendarEvents.filter(e => {
          const eventDate = parseISO(e.start_datetime);
          return isSameDay(eventDate, currentDate) && e.is_blocking;
        });

        let slotsUsedToday = 0;
        for (const slot of timeSlots) {
          if (sessionIndex >= sessionsCount) break;
          if (slotsUsedToday >= maxSessionsPerDay) break;

          // Check if slot conflicts with calendar events
          const hasConflict = dayEvents.some(e => {
            const eventStart = format(parseISO(e.start_datetime), 'HH:mm');
            const eventEnd = format(parseISO(e.end_datetime), 'HH:mm');
            return (slot.start >= eventStart && slot.start < eventEnd) ||
                   (slot.end > eventStart && slot.end <= eventEnd) ||
                   (slot.start <= eventStart && slot.end >= eventEnd);
          });

          if (!hasConflict) {
            // Select subject based on weighted distribution
            const subjectIndex = sessionIndex % sortedSubjects.length;
            const subject = sortedSubjects[subjectIndex];

            newSessions.push({
              user_id: user.id,
              subject_id: subject.id,
              date: dateStr,
              start_time: slot.start,
              end_time: slot.end,
              status: 'planned',
              notes: null
            });

            sessionIndex++;
            slotsUsedToday++;
          }
        }
      }

      // Insert new sessions
      if (newSessions.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(newSessions);

        if (error) throw error;
      }

      // Save AI plan record
      await supabase.from('ai_plans').insert({
        user_id: user.id,
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        config_json: {
          weekly_hours: profile?.weekly_revision_hours,
          subjects_count: subjects.length,
          sessions_generated: newSessions.length,
          preferences: {
            preferred_days: preferredDays,
            daily_start: dailyStartTime,
            daily_end: dailyEndTime,
            max_hours_per_day: maxHoursPerDay,
            avoid_early_morning: avoidEarlyMorning,
            avoid_late_evening: avoidLateEvening
          }
        }
      });

      fetchData();

    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la génération du planning');
    } finally {
      setGenerating(false);
    }
  };

  const handleSignOut = async () => {
    isSigningOut.current = true;
    await signOut();
    navigate('/');
  };

  const handleDeleteAllEvents = async () => {
    if (!user) return;
    
    setDeletingEvents(true);
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression des événements');
    } finally {
      setDeletingEvents(false);
    }
  };

  const handleGridClick = (data: GridClickData) => {
    setGridClickData(data);
    setAddEventDialogOpen(true);
  };

  const handleSessionMove = async (sessionId: string, data: { date: string; startTime: string; endTime: string }) => {
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({
          date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
        })
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du déplacement de la session');
    }
  };

  const handleEventMove = async (eventId: string, data: { date: string; startTime: string; endTime: string }) => {
    try {
      // Create datetime strings from the date and times
      const startDatetime = new Date(`${data.date}T${data.startTime}:00`);
      const endDatetime = new Date(`${data.date}T${data.endTime}:00`);

      const { error } = await supabase
        .from('calendar_events')
        .update({
          start_datetime: startDatetime.toISOString(),
          end_datetime: endDatetime.toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du déplacement de l\'évènement');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  // Calculate actual planned hours based on session durations
  const totalPlannedHours = sessions
    .filter(s => s.status === 'planned')
    .reduce((total, session) => {
      const [startH, startM] = session.start_time.split(':').map(Number);
      const [endH, endM] = session.end_time.split(':').map(Number);
      const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      return total + durationMinutes / 60;
    }, 0);

  const completedSessions = sessions.filter(s => s.status === 'done').length;

  const upcomingExams = subjects
    .filter(s => s.exam_date)
    .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-foreground">Skoolife</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Welcome card */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-2">
                  Bonjour {profile?.first_name} 👋
                </h2>
                <p className="text-muted-foreground text-sm">
                  Prêt pour une session productive ?
                </p>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cette semaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPlannedHours}h</p>
                    <p className="text-xs text-muted-foreground">planifiées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-subject-green/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-subject-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedSessions}</p>
                    <p className="text-xs text-muted-foreground">sessions terminées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming exams */}
            {upcomingExams.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Prochains examens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingExams.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(subject.exam_date!), 'dd MMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={generatePlanning}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {generating ? 'Génération...' : 'Générer mon planning'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Importer calendrier (.ics)
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full"
                onClick={() => setSubjectsDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Gérer mes matières
              </Button>
            </div>
          </aside>

          {/* Calendar */}
          <div className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Semaine du {format(weekStart, 'dd MMM', { locale: fr })}
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAddEventDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un évènement
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                      disabled={calendarEvents.length === 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer tous les événements ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera définitivement tous les {calendarEvents.length} événements de ton calendrier. 
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAllEvents}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deletingEvents}
                      >
                        {deletingEvents ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Supprimer tout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                >
                  Aujourd'hui
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Week grid */}
            <WeeklyHourGrid
              weekDays={weekDays}
              sessions={sessions}
              calendarEvents={calendarEvents}
              onSessionClick={setSelectedSession}
              onEventClick={setSelectedEvent}
              onGridClick={handleGridClick}
              onSessionMove={handleSessionMove}
              onEventMove={handleEventMove}
            />

            {/* Empty state */}
            {sessions.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold mb-2">Aucune session planifiée</h3>
                  <p className="text-muted-foreground mb-6">
                    Clique sur "Générer mon planning" pour créer tes premières sessions de révision
                  </p>
                  <Button variant="hero" onClick={generatePlanning} disabled={generating}>
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Générer mon planning
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ImportCalendarDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen}
        onImportComplete={fetchData}
      />
      <ManageSubjectsDialog
        open={subjectsDialogOpen}
        onOpenChange={setSubjectsDialogOpen}
        subjects={subjects}
        onSubjectsChange={fetchData}
      />
      <AddEventDialog
        open={addEventDialogOpen}
        onOpenChange={(open) => {
          setAddEventDialogOpen(open);
          if (!open) setGridClickData(null);
        }}
        onEventAdded={fetchData}
        initialDate={gridClickData ? new Date(gridClickData.date) : undefined}
        initialStartTime={gridClickData?.startTime}
        initialEndTime={gridClickData?.endTime}
      />
      <EditSessionDialog
        session={selectedSession}
        subjects={subjects}
        onClose={() => setSelectedSession(null)}
        onUpdate={fetchData}
      />
      <EditEventDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default Dashboard;