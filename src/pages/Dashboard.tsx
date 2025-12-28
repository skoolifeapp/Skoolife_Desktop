import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/PageSkeletons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Upload, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, Target, Trash2, GraduationCap, Lock
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
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import ImportCalendarDialog from '@/components/ImportCalendarDialog';
import EditSessionDialog from '@/components/EditSessionDialog';
import EditEventDialog from '@/components/EditEventDialog';
import AddEventDialog from '@/components/AddEventDialog';
import WeeklyHourGrid, { type GridClickData } from '@/components/WeeklyHourGrid';
import MonthlyCalendarView from '@/components/MonthlyCalendarView';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { EventTutorialOverlay } from '@/components/EventTutorialOverlay';
import { UpgradeDialog } from '@/components/UpgradeDialog';

import type { Profile, Subject, RevisionSession, CalendarEvent } from '@/types/planning';

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [gridClickData, setGridClickData] = useState<GridClickData | null>(null);
  const [deletingEvents, setDeletingEvents] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showEventTutorial, setShowEventTutorial] = useState(false);
  const [editSessionDialogOpen, setEditSessionDialogOpen] = useState(false);
  const [subjectFileCounts, setSubjectFileCounts] = useState<Record<string, number>>({});
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  
  const { user, signOut, isSubscribed, subscriptionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSigningOut = useRef(false);
  
  const hasActiveSubscription = !subscriptionLoading && isSubscribed;
  
  // Track user activity for analytics
  useActivityTracker();

  // If redirected with a week param, jump to that week
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const week = params.get('week');
    if (!week) return;

    const parsed = parseISO(week);
    if (Number.isNaN(parsed.getTime())) return;

    setWeekStart(startOfWeek(parsed, { weekStartsOn: 1 }));
  }, [location.search]);

  useEffect(() => {
    if (isSigningOut.current) return;
    
    // Admin redirect by email
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

      // Check if tutorial should be shown
      const tutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (!tutorialSeen) {
        setShowTutorial(true);
      }

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id);

      // Auto-archive subjects with past exam dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const subjectsToArchive = (subjectsData || []).filter(s => 
        s.status === 'active' && 
        s.exam_date && 
        new Date(s.exam_date) < today
      );

      if (subjectsToArchive.length > 0) {
        await Promise.all(
          subjectsToArchive.map(s => 
            supabase
              .from('subjects')
              .update({ status: 'archived' })
              .eq('id', s.id)
          )
        );
        const { data: updatedSubjects } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id);
        setSubjects(updatedSubjects || []);
      } else {
        setSubjects(subjectsData || []);
      }

      // Fetch revision sessions
      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

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

      // Fetch file counts by subject_name
      const { data: sessionFilesData } = await supabase
        .from('session_files')
        .select('subject_name')
        .eq('user_id', user.id);

      const { data: sessionLinksData } = await supabase
        .from('session_links')
        .select('subject_name')
        .eq('user_id', user.id);

      const subjectFileCountsMap: Record<string, number> = {};
      (sessionFilesData || []).forEach((file: any) => {
        if (file.subject_name) {
          subjectFileCountsMap[file.subject_name] = (subjectFileCountsMap[file.subject_name] || 0) + 1;
        }
      });
      (sessionLinksData || []).forEach((link: any) => {
        if (link.subject_name) {
          subjectFileCountsMap[link.subject_name] = (subjectFileCountsMap[link.subject_name] || 0) + 1;
        }
      });
      setSubjectFileCounts(subjectFileCountsMap);

      // Check if event tutorial should be shown
      const eventTutorialSeen = localStorage.getItem(`event_tutorial_seen_${user.id}`);
      const mainTutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (mainTutorialSeen && !eventTutorialSeen && (eventsData?.length || 0) > 0) {
        setShowEventTutorial(true);
      }

    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanning = async () => {
    const activeSubjectsForCheck = subjects.filter(s => (s.status || 'active') === 'active');
    if (!user || activeSubjectsForCheck.length === 0) {
      toast.error('Ajoute au moins une matière active avant de générer ton planning');
      return;
    }

    setGenerating(true);

    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const weekEndDate = addDays(weekStart, 6);
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEndDate, 'yyyy-MM-dd');
      
      await supabase
        .from('revision_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);

      const { data: allSessions } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id);

      const scheduledHoursPerSubject: Record<string, number> = {};
      (allSessions || []).forEach(session => {
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        scheduledHoursPerSubject[session.subject_id] = (scheduledHoursPerSubject[session.subject_id] || 0) + durationHours;
      });

      const preferredDays = preferences?.preferred_days_of_week || [1, 2, 3, 4, 5];
      const dailyStartTime = preferences?.daily_start_time || '08:00';
      const dailyEndTime = preferences?.daily_end_time || '22:00';
      const maxHoursPerDay = preferences?.max_hours_per_day || 4;
      const sessionDurationMinutes = preferences?.session_duration_minutes || 90;
      const weeklyTargetHours = profile?.weekly_revision_hours || 10;

      const activeSubjects = subjects.filter(s => (s.status || 'active') === 'active');
      
      const subjectsWithPriority = activeSubjects.map(subject => {
        const alreadyScheduled = scheduledHoursPerSubject[subject.id] || 0;
        const targetHours = subject.target_hours || 10;
        const remaining = Math.max(0, targetHours - alreadyScheduled);
        
        let daysUntilExam = 365;
        if (subject.exam_date) {
          const examDate = new Date(subject.exam_date);
          const today = new Date();
          daysUntilExam = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        }
        
        const urgency = remaining / daysUntilExam;
        const weight = subject.exam_weight || 3;
        const difficultyMultiplier = subject.difficulty_level === 'difficile' ? 1.5 : subject.difficulty_level === 'facile' ? 0.7 : 1;
        
        const priority = urgency * weight * difficultyMultiplier;
        
        return { ...subject, priority, remaining };
      }).sort((a, b) => b.priority - a.priority);

      const newSessions: any[] = [];
      let totalHoursScheduled = 0;

      for (let dayOffset = 0; dayOffset < 7 && totalHoursScheduled < weeklyTargetHours; dayOffset++) {
        const currentDay = addDays(weekStart, dayOffset);
        const dayOfWeek = currentDay.getDay();
        
        if (!preferredDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) continue;
        
        const dateStr = format(currentDay, 'yyyy-MM-dd');
        
        const dayEvents = calendarEvents.filter(e => {
          const eventStart = new Date(e.start_datetime);
          return format(eventStart, 'yyyy-MM-dd') === dateStr && e.is_blocking;
        });

        const [startH, startM] = dailyStartTime.split(':').map(Number);
        const [endH, endM] = dailyEndTime.split(':').map(Number);
        
        const availableSlots: { start: number; end: number }[] = [];
        let currentSlotStart = startH * 60 + startM;
        const dayEnd = endH * 60 + endM;

        const sortedEvents = dayEvents
          .map(e => {
            const start = new Date(e.start_datetime);
            const end = new Date(e.end_datetime);
            return {
              start: start.getHours() * 60 + start.getMinutes(),
              end: end.getHours() * 60 + end.getMinutes()
            };
          })
          .sort((a, b) => a.start - b.start);

        for (const event of sortedEvents) {
          if (event.start > currentSlotStart) {
            availableSlots.push({ start: currentSlotStart, end: event.start });
          }
          currentSlotStart = Math.max(currentSlotStart, event.end);
        }

        if (currentSlotStart < dayEnd) {
          availableSlots.push({ start: currentSlotStart, end: dayEnd });
        }

        let dayHoursScheduled = 0;

        for (const slot of availableSlots) {
          if (dayHoursScheduled >= maxHoursPerDay) break;
          if (totalHoursScheduled >= weeklyTargetHours) break;

          const slotDuration = slot.end - slot.start;
          if (slotDuration < sessionDurationMinutes) continue;

          for (const subject of subjectsWithPriority) {
            if (dayHoursScheduled >= maxHoursPerDay) break;
            if (totalHoursScheduled >= weeklyTargetHours) break;

            const subjectSessionsToday = newSessions.filter(
              s => s.date === dateStr && s.subject_id === subject.id
            ).length;
            if (subjectSessionsToday >= 1) continue;

            const sessionStart = slot.start;
            const sessionEnd = Math.min(slot.start + sessionDurationMinutes, slot.end);
            const actualDuration = sessionEnd - sessionStart;

            if (actualDuration < 30) continue;

            const startTimeStr = `${String(Math.floor(sessionStart / 60)).padStart(2, '0')}:${String(sessionStart % 60).padStart(2, '0')}`;
            const endTimeStr = `${String(Math.floor(sessionEnd / 60)).padStart(2, '0')}:${String(sessionEnd % 60).padStart(2, '0')}`;

            newSessions.push({
              user_id: user.id,
              subject_id: subject.id,
              date: dateStr,
              start_time: startTimeStr,
              end_time: endTimeStr,
              status: 'planned'
            });

            slot.start = sessionEnd + 15;
            dayHoursScheduled += actualDuration / 60;
            totalHoursScheduled += actualDuration / 60;
          }
        }
      }

      if (newSessions.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(newSessions);

        if (error) throw error;
      }

      await supabase.from('ai_plans').insert({
        user_id: user.id,
        week_start_date: weekStartStr,
        config_json: {
          sessions_created: newSessions.length,
          total_hours: totalHoursScheduled,
          preferences: preferences
        }
      });

      toast.success(`${newSessions.length} sessions créées !`);
      fetchData();

    } catch (err) {
      console.error('Error generating planning:', err);
      toast.error('Erreur lors de la génération du planning');
    } finally {
      setGenerating(false);
    }
  };

  const handleSessionStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success(newStatus === 'done' ? 'Session terminée !' : 'Session mise à jour');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSessionMove = async (sessionId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ 
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime 
        })
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du déplacement');
    }
  };

  const handleEventMove = async (eventId: string, newStartDatetime: string, newEndDatetime: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ 
          start_datetime: newStartDatetime,
          end_datetime: newEndDatetime 
        })
        .eq('id', eventId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du déplacement');
    }
  };

  const handleSessionResize = async (sessionId: string, newEndTime: string) => {
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ end_time: newEndTime })
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du redimensionnement');
    }
  };

  const handleEventResize = async (eventId: string, newEndDatetime: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ end_datetime: newEndDatetime })
        .eq('id', eventId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du redimensionnement');
    }
  };

  const handleGridClick = (clickData: GridClickData) => {
    setGridClickData(clickData);
    setAddEventDialogOpen(true);
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
      
      toast.success('Tous les événements ont été supprimés');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingEvents(false);
    }
  };

  const handleSessionClick = (session: RevisionSession) => {
    setSelectedSession(session);
    setEditSessionDialogOpen(true);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const isPastWeek = weekStart < currentWeekStart;

  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === dateStr);
  };

  const totalPlannedHours = sessions
    .filter(s => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= weekStart && sessionDate <= addDays(weekStart, 6);
    })
    .reduce((acc, s) => {
      const [startH, startM] = s.start_time.split(':').map(Number);
      const [endH, endM] = s.end_time.split(':').map(Number);
      return acc + ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
    }, 0);

  const completedSessions = sessions.filter(s => {
    const sessionDate = parseISO(s.date);
    return sessionDate >= weekStart && sessionDate <= addDays(weekStart, 6) && s.status === 'done';
  }).length;

  const upcomingExams = subjects
    .filter(s => s.exam_date && s.status !== 'archived')
    .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())
    .slice(0, 3);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Salut{profile?.first_name ? `, ${profile.first_name}` : ''} 👋
            </h1>
            <p className="text-muted-foreground">
              Prêt(e) à réviser ?
            </p>
          </div>
          <Button 
            id="generate-planning-btn"
            onClick={() => hasActiveSubscription ? generatePlanning() : setUpgradeDialogOpen(true)}
            disabled={generating}
            variant="hero"
            size="lg"
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : hasActiveSubscription ? (
              <RefreshCw className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            Générer mon planning
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
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
              size="icon"
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Aujourd'hui
            </Button>
            <h2 className="text-lg font-semibold ml-2 capitalize">
              Semaine du {format(weekStart, 'dd MMM', { locale: fr })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              id="add-event-btn"
              size="sm"
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                !hasActiveSubscription && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => hasActiveSubscription ? setAddEventDialogOpen(true) : setUpgradeDialogOpen(true)}
            >
              {hasActiveSubscription ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Ajouter un évènement
            </Button>
            <Button 
              id="import-calendar-btn"
              variant="outline" 
              size="icon"
              className={cn("h-9 w-9", !hasActiveSubscription && "opacity-50 cursor-not-allowed")}
              onClick={() => hasActiveSubscription ? setImportDialogOpen(true) : setUpgradeDialogOpen(true)}
              title="Importer calendrier (.ics)"
            >
              <Upload className="w-4 h-4" />
            </Button>
            {hasActiveSubscription && (
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
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllEvents}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deletingEvents}
                    >
                      {deletingEvents ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer tout'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
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
                    <p className="text-2xl font-bold">{totalPlannedHours.toFixed(0)}h</p>
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
                    <div 
                      key={subject.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(subject.exam_date!), 'dd MMMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Calendar grid */}
          <div className={cn("space-y-4", calendarView === 'week' && isPastWeek && "opacity-60 pointer-events-none")}>
            {calendarView === 'week' ? (
              <WeeklyHourGrid
                weekDays={weekDays}
                sessions={sessions}
                calendarEvents={calendarEvents}
                exams={subjects
                  .filter(s => s.exam_date && s.status !== 'archived')
                  .map(s => ({
                    id: s.id,
                    name: s.name,
                    color: s.color || '#FFC107',
                    exam_date: s.exam_date!
                  }))
                }
                subjectFileCounts={subjectFileCounts}
                isPastWeek={isPastWeek}
                onSessionClick={handleSessionClick}
                onEventClick={setSelectedEvent}
                onGridClick={handleGridClick}
                onSessionMove={handleSessionMove}
                onEventMove={handleEventMove}
                onSessionResize={handleSessionResize}
                onEventResize={handleEventResize}
                onSessionMarkDone={(sessionId) => handleSessionStatusUpdate(sessionId, 'done')}
              />
            ) : (
              <MonthlyCalendarView
                currentMonth={currentMonth}
                sessions={sessions}
                calendarEvents={calendarEvents}
                subjects={subjects}
                onMonthChange={setCurrentMonth}
                onDayClick={(date) => {
                  setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
                  setCalendarView('week');
                }}
                onSessionClick={handleSessionClick}
                onEventClick={setSelectedEvent}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ImportCalendarDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen}
        onImportComplete={fetchData}
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
        session={editSessionDialogOpen ? selectedSession : null}
        subjects={subjects}
        onClose={() => {
          setEditSessionDialogOpen(false);
          setSelectedSession(null);
        }}
        onUpdate={fetchData}
      />
      <EditEventDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={fetchData}
      />

      {/* Tutorial overlay */}
      {showTutorial && user && (
        <TutorialOverlay
          onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
            if (calendarEvents.length > 0) {
              const eventTutorialSeen = localStorage.getItem(`event_tutorial_seen_${user.id}`);
              if (!eventTutorialSeen) {
                setShowEventTutorial(true);
              }
            }
          }}
        />
      )}

      {/* Event tutorial overlay */}
      {showEventTutorial && !showTutorial && user && (
        <EventTutorialOverlay
          onComplete={() => {
            setShowEventTutorial(false);
            localStorage.setItem(`event_tutorial_seen_${user.id}`, 'true');
          }}
        />
      )}

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        featureName="les fonctionnalités de planification"
      />
    </>
  );
};

export default Dashboard;

