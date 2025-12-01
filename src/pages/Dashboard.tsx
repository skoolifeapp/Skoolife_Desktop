import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Upload, Plus, RefreshCw, LogOut,
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, Target, Trash2
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import ImportCalendarDialog from '@/components/ImportCalendarDialog';
import EditSessionDialog from '@/components/EditSessionDialog';
import ManageSubjectsDialog from '@/components/ManageSubjectsDialog';

interface Profile {
  first_name: string;
  weekly_revision_hours: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  exam_date: string | null;
  exam_weight: number;
}

interface RevisionSession {
  id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  subject?: Subject;
}

interface CalendarEvent {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  is_blocking: boolean;
}

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
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
      // Delete existing planned sessions for this week
      const weekEnd = addDays(weekStart, 6);
      await supabase
        .from('revision_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      // Simple planning algorithm
      const totalMinutes = (profile?.weekly_revision_hours || 10) * 60;
      const sessionDuration = 90; // 1h30 per session
      const sessionsCount = Math.floor(totalMinutes / sessionDuration);

      // Calculate subject weights
      const totalWeight = subjects.reduce((sum, s) => sum + s.exam_weight, 0);
      
      const newSessions: { user_id: string; subject_id: string; date: string; start_time: string; end_time: string; status: string; notes: string | null }[] = [];
      let sessionIndex = 0;

      // Distribute sessions across the week (Mon-Sun)
      const workDays = [0, 1, 2, 3, 4, 5, 6]; // All days
      const slotsPerDay = Math.ceil(sessionsCount / 7);
      
      // Time slots (avoiding common constraint times)
      const timeSlots = [
        { start: '09:00', end: '10:30' },
        { start: '11:00', end: '12:30' },
        { start: '14:00', end: '15:30' },
        { start: '16:00', end: '17:30' },
        { start: '19:00', end: '20:30' },
      ];

      for (let dayOffset of workDays) {
        const currentDate = addDays(weekStart, dayOffset);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Check blocking events for this day
        const dayEvents = calendarEvents.filter(e => {
          const eventDate = parseISO(e.start_datetime);
          return isSameDay(eventDate, currentDate) && e.is_blocking;
        });

        let slotsUsed = 0;
        for (const slot of timeSlots) {
          if (sessionIndex >= sessionsCount || slotsUsed >= slotsPerDay) break;

          // Check if slot conflicts with calendar events
          const hasConflict = dayEvents.some(e => {
            const eventStart = format(parseISO(e.start_datetime), 'HH:mm');
            const eventEnd = format(parseISO(e.end_datetime), 'HH:mm');
            return (slot.start >= eventStart && slot.start < eventEnd) ||
                   (slot.end > eventStart && slot.end <= eventEnd);
          });

          if (!hasConflict) {
            // Select subject based on weighted random
            const subjectIndex = sessionIndex % subjects.length;
            const subject = subjects.sort((a, b) => b.exam_weight - a.exam_weight)[subjectIndex];

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
            slotsUsed++;
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
          sessions_generated: newSessions.length
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
    await signOut();
    navigate('/');
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

  const totalPlannedHours = sessions
    .filter(s => s.status === 'planned')
    .length * 1.5;

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
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
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
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="grid grid-cols-7 divide-x divide-border">
                {weekDays.map((day, index) => {
                  const daySessions = getSessionsForDay(day);
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div key={index} className="min-h-[400px]">
                      {/* Day header */}
                      <div className={`p-3 text-center border-b border-border ${isToday ? 'bg-primary/10' : 'bg-secondary/30'}`}>
                        <p className="text-xs text-muted-foreground uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </p>
                        <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </p>
                      </div>

                      {/* Day content */}
                      <div className="p-2 space-y-2">
                        {/* Calendar events (blocking) */}
                        {dayEvents.map((event) => (
                          <div 
                            key={event.id}
                            className="p-2 rounded-lg bg-muted/50 text-xs"
                          >
                            <p className="font-medium text-muted-foreground truncate">
                              {event.title}
                            </p>
                            <p className="text-muted-foreground/70">
                              {format(parseISO(event.start_datetime), 'HH:mm')}
                            </p>
                          </div>
                        ))}

                        {/* Revision sessions */}
                        {daySessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`w-full p-2 rounded-lg text-xs text-left transition-all hover:scale-[1.02] ${
                              session.status === 'done' 
                                ? 'opacity-60 line-through' 
                                : ''
                            }`}
                            style={{ 
                              backgroundColor: `${session.subject?.color}20`,
                              borderLeft: `3px solid ${session.subject?.color}`
                            }}
                          >
                            <p className="font-semibold truncate" style={{ color: session.subject?.color }}>
                              {session.subject?.name}
                            </p>
                            <p className="text-muted-foreground">
                              {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                            </p>
                          </button>
                        ))}

                        {daySessions.length === 0 && dayEvents.length === 0 && (
                          <p className="text-xs text-muted-foreground/50 text-center py-4">
                            Aucune session
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

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
      <EditSessionDialog
        session={selectedSession}
        subjects={subjects}
        onClose={() => setSelectedSession(null)}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default Dashboard;