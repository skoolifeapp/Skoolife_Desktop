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
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, Target, Trash2, GraduationCap
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
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import ImportCalendarDialog from '@/components/ImportCalendarDialog';
import EditSessionDialog from '@/components/EditSessionDialog';
import EditEventDialog from '@/components/EditEventDialog';
import AddEventDialog from '@/components/AddEventDialog';
import { ShareSessionDialog } from '@/components/ShareSessionDialog';
import WeeklyHourGrid, { type GridClickData } from '@/components/WeeklyHourGrid';
import MonthlyCalendarView from '@/components/MonthlyCalendarView';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { EventTutorialOverlay } from '@/components/EventTutorialOverlay';

import { InvitedSessionDialog } from '@/components/InvitedSessionDialog';

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
  const [shareSessionDialogOpen, setShareSessionDialogOpen] = useState(false);
  const [invitedSessionDialogOpen, setInvitedSessionDialogOpen] = useState(false);
  const [selectedInvitedSession, setSelectedInvitedSession] = useState<RevisionSession | null>(null);
  const [sessionInvites, setSessionInvites] = useState<Record<string, { 
    invitees: Array<{ accepted_by: string | null; first_name: string | null; last_name: string | null }>;
    meeting_format: string | null;
    meeting_address: string | null;
    meeting_link: string | null;
  }>>({});
  const [subjectFileCounts, setSubjectFileCounts] = useState<Record<string, number>>({});
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSigningOut = useRef(false);
  const inviteDialogShownRef = useRef(false);
  
  // Track user activity for analytics
  useActivityTracker();

  // If redirected from an invite, jump directly to the week that contains the invited session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const week = params.get('week');
    if (!week) return;

    const parsed = parseISO(week);
    if (Number.isNaN(parsed.getTime())) return;

    setWeekStart(startOfWeek(parsed, { weekStartsOn: 1 }));
  }, [location.search]);

  // If redirected from an invite accept flow, auto-open the confirm/decline dialog
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invitedSessionId = params.get('invitedSession');
    if (!invitedSessionId) return;
    if (inviteDialogShownRef.current) return;
    if (loading) return;

    const sessionToPrompt = sessions.find((s) => s.id === invitedSessionId && (s as any).isInvitedSession);
    if (!sessionToPrompt) return;

    inviteDialogShownRef.current = true;
    setSelectedInvitedSession(sessionToPrompt);
    setInvitedSessionDialogOpen(true);

    // Clean URL so it doesn't reopen on refresh
    params.delete('invitedSession');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  }, [location.search, location.pathname, loading, sessions, navigate]);
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
        .select('first_name, weekly_revision_hours, is_onboarding_complete, signed_up_via_invite')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData && !profileData.is_onboarding_complete) {
        navigate('/onboarding');
        return;
      }

      setProfile(profileData);

      // Check if tutorial should be shown (first visit after onboarding)
      const tutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (!tutorialSeen && !profileData?.signed_up_via_invite) {
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
        // Refetch subjects after archiving
        const { data: updatedSubjects } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id);
        setSubjects(updatedSubjects || []);
      } else {
        setSubjects(subjectsData || []);
      }

      // Fetch revision sessions (user's own sessions)
      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      // Fetch sessions where user is invited (accepted_by = current user)
      const { data: invitedSessionsData } = await supabase
        .from('session_invites')
        .select(`
          session_id,
          meeting_format,
          meeting_address,
          meeting_link,
          confirmed,
          invited_by,
          inviter:profiles!session_invites_invited_by_fkey (
            first_name,
            last_name
          ),
          session:revision_sessions (
            id,
            date,
            start_time,
            end_time,
            status,
            notes,
            subject_id,
            user_id,
            subject:subjects (
              id,
              name,
              color,
              exam_date,
              exam_weight,
              exam_type,
              status,
              target_hours,
              difficulty_level,
              notes,
              user_id
            )
          )
        `)
        .eq('accepted_by', user.id);

      // Map subjects to user's own sessions
      const ownSessionsWithSubjects = (sessionsData || []).map(session => ({
        ...session,
        subject: subjectsData?.find(s => s.id === session.subject_id),
        isInvitedSession: false as const
      }));

      // Map invited sessions with special flag
      const invitedSessionsWithSubjects = (invitedSessionsData || [])
        .filter((invite: any) => invite.session)
        .map((invite: any) => ({
          ...invite.session,
          subject: invite.session.subject,
          isInvitedSession: true as const,
          inviteConfirmed: invite.confirmed || false,
          inviterName: invite.inviter ? `${invite.inviter.first_name || ''} ${invite.inviter.last_name || ''}`.trim() : null,
          inviteMeetingFormat: invite.meeting_format,
          inviteMeetingAddress: invite.meeting_address,
          inviteMeetingLink: invite.meeting_link
        }));

      // Combine own sessions and invited sessions
      const allSessions = [...ownSessionsWithSubjects, ...invitedSessionsWithSubjects];
      setSessions(allSessions);

      // Fetch calendar events
      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      setCalendarEvents(eventsData || []);

      // Fetch session invites with accepted users and meeting info (for sessions user created)
      const { data: invitesData } = await supabase
        .from('session_invites')
        .select(`
          session_id, 
          accepted_by,
          confirmed,
          meeting_format, 
          meeting_address,
          meeting_link,
          profile:profiles!session_invites_accepted_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('invited_by', user.id);

      // Create a map of session_id -> invite details with multiple invitees
      const invitesMap: Record<string, { 
        invitees: Array<{ accepted_by: string | null; first_name: string | null; last_name: string | null; confirmed: boolean }>;
        meeting_format: string | null;
        meeting_address: string | null;
        meeting_link: string | null;
      }> = {};
      (invitesData || []).forEach((invite: any) => {
        if (!invitesMap[invite.session_id]) {
          invitesMap[invite.session_id] = {
            invitees: [],
            meeting_format: invite.meeting_format,
            meeting_address: invite.meeting_address,
            meeting_link: invite.meeting_link
          };
        }
        invitesMap[invite.session_id].invitees.push({
          accepted_by: invite.accepted_by,
          first_name: invite.profile?.first_name || null,
          last_name: invite.profile?.last_name || null,
          confirmed: invite.confirmed || false
        });
      });
      setSessionInvites(invitesMap);

      // Fetch file counts by subject_name for subject-level resource pooling
      const { data: sessionFilesData } = await supabase
        .from('session_files')
        .select('subject_name')
        .eq('user_id', user.id);

      const { data: sessionLinksData } = await supabase
        .from('session_links')
        .select('subject_name')
        .eq('user_id', user.id);

      const subjectFileCountsMap: Record<string, number> = {};
      // Count files by subject_name
      (sessionFilesData || []).forEach((file: any) => {
        if (file.subject_name) {
          subjectFileCountsMap[file.subject_name] = (subjectFileCountsMap[file.subject_name] || 0) + 1;
        }
      });
      // Also count links by subject_name
      (sessionLinksData || []).forEach((link: any) => {
        if (link.subject_name) {
          subjectFileCountsMap[link.subject_name] = (subjectFileCountsMap[link.subject_name] || 0) + 1;
        }
      });
      setSubjectFileCounts(subjectFileCountsMap);

      // Check if event tutorial should be shown
      const eventTutorialSeen = localStorage.getItem(`event_tutorial_seen_${user.id}`);
      const mainTutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (mainTutorialSeen && !eventTutorialSeen && (eventsData?.length || 0) > 0 && !profileData?.signed_up_via_invite) {
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
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Delete existing planned sessions for this week (Monday to Sunday inclusive)
      // BUT preserve sessions that have invites (either sent or received)
      const weekEndDate = addDays(weekStart, 6); // Sunday
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEndDate, 'yyyy-MM-dd');
      
      // First, get sessions that have invites (to preserve them)
      const { data: sessionsWithInvites } = await supabase
        .from('session_invites')
        .select('session_id')
        .eq('invited_by', user.id);
      
      const sessionIdsWithInvites = new Set((sessionsWithInvites || []).map(i => i.session_id));
      
      // Get all planned sessions for this week
      const { data: weekPlannedSessions } = await supabase
        .from('revision_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);
      
      // Filter out sessions that have invites
      const sessionsToDelete = (weekPlannedSessions || [])
        .filter(s => !sessionIdsWithInvites.has(s.id))
        .map(s => s.id);
      
      // Delete only sessions without invites
      if (sessionsToDelete.length > 0) {
        await supabase
          .from('revision_sessions')
          .delete()
          .in('id', sessionsToDelete);
      }

      // Fetch ALL sessions (past + future, excluding current week planned ones we just deleted)
      // to calculate total hours already scheduled per subject
      const { data: allSessions } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Calculate hours already scheduled per subject from ALL existing sessions
      const scheduledHoursPerSubject: Record<string, number> = {};
      (allSessions || []).forEach(session => {
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        scheduledHoursPerSubject[session.subject_id] = (scheduledHoursPerSubject[session.subject_id] || 0) + durationHours;
      });

      // Extract preferences with defaults
      const preferredDays = preferences?.preferred_days_of_week || [1, 2, 3, 4, 5]; // Mon-Fri by default
      const dailyStartTime = preferences?.daily_start_time || '08:00';
      const dailyEndTime = preferences?.daily_end_time || '22:00';
      const sessionDuration = preferences?.session_duration_minutes || 90;
      const weeklyRevisionHours = profile?.weekly_revision_hours || 10;

      // Get active subjects only
      const activeSubjects = subjects.filter(s => (s.status || 'active') === 'active');

      // Calculate remaining hours needed per subject
      const subjectsWithRemainingHours = activeSubjects.map(subject => {
        const targetHours = subject.target_hours || 10;
        const alreadyScheduled = scheduledHoursPerSubject[subject.id] || 0;
        const remainingHours = Math.max(0, targetHours - alreadyScheduled);
        return { ...subject, remainingHours };
      });

      // Calculate priority scores based on:
      // 1. Exam proximity (closer = higher priority)
      // 2. Exam weight (higher = higher priority)
      // 3. Difficulty level (higher = more time needed)
      // 4. Remaining hours ratio (more remaining = higher priority)
      const today = new Date();
      const scoredSubjects = subjectsWithRemainingHours.map(subject => {
        let score = 0;
        
        // Exam proximity (1-100 points, closer exams get more)
        if (subject.exam_date) {
          const examDate = new Date(subject.exam_date);
          const daysUntilExam = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
          score += Math.max(0, 100 - daysUntilExam); // Closer exams get higher score
        }
        
        // Exam weight (0-50 points)
        score += (subject.exam_weight || 1) * 10;
        
        // Difficulty level (0-30 points)
        const difficultyMap: Record<string, number> = { 'easy': 10, 'medium': 20, 'hard': 30 };
        score += difficultyMap[subject.difficulty_level || 'medium'] || 20;
        
        // Remaining hours ratio (0-50 points)
        if (subject.remainingHours > 0) {
          const targetHours = subject.target_hours || 10;
          const ratio = subject.remainingHours / targetHours;
          score += ratio * 50;
        }
        
        return { ...subject, priorityScore: score };
      });

      // Sort by priority score (highest first)
      scoredSubjects.sort((a, b) => b.priorityScore - a.priorityScore);

      // Fetch blocking events for this week
      const { data: weekEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', addDays(weekStart, 7).toISOString());

      const blockingEvents = (weekEvents || []).filter(e => e.is_blocking !== false);

      // Generate time slots for the week
      const timeSlots: { date: Date; startTime: string; endTime: string }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(weekStart, i);
        const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert Sunday from 0 to 7
        
        // Skip non-preferred days
        if (!preferredDays.includes(dayOfWeek === 7 ? 0 : dayOfWeek)) continue;
        
        // Skip past dates
        if (currentDate < startOfDay(today)) continue;
        
        // Parse daily start and end times
        const [startHour, startMin] = dailyStartTime.split(':').map(Number);
        const [endHour, endMin] = dailyEndTime.split(':').map(Number);
        
        // Generate slots within daily time range
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour * 60 + currentMin + sessionDuration <= endHour * 60 + endMin) {
          const slotStartTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
          const endTotalMin = currentHour * 60 + currentMin + sessionDuration;
          const slotEndHour = Math.floor(endTotalMin / 60);
          const slotEndMin = endTotalMin % 60;
          const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
          
          // Check for conflicts with blocking events
          const slotStart = new Date(currentDate);
          slotStart.setHours(currentHour, currentMin, 0, 0);
          const slotEnd = new Date(currentDate);
          slotEnd.setHours(slotEndHour, slotEndMin, 0, 0);
          
          const hasConflict = blockingEvents.some(event => {
            const eventStart = new Date(event.start_datetime);
            const eventEnd = new Date(event.end_datetime);
            // Check for overlap
            return slotStart < eventEnd && slotEnd > eventStart;
          });
          
          if (!hasConflict) {
            timeSlots.push({
              date: currentDate,
              startTime: slotStartTime,
              endTime: slotEndTime
            });
          }
          
          // Move to next slot
          currentMin += sessionDuration;
          while (currentMin >= 60) {
            currentMin -= 60;
            currentHour++;
          }
        }
      }

      // Calculate target hours per week based on weekly_revision_hours
      const targetHoursThisWeek = weeklyRevisionHours;
      const sessionHours = sessionDuration / 60;
      const maxSessions = Math.ceil(targetHoursThisWeek / sessionHours);

      // Distribute sessions among subjects based on priority
      const sessionsToCreate: { subject_id: string; date: string; start_time: string; end_time: string }[] = [];
      let slotIndex = 0;
      let sessionCount = 0;

      // Round-robin distribution with priority weighting
      while (sessionCount < maxSessions && slotIndex < timeSlots.length) {
        for (const subject of scoredSubjects) {
          if (slotIndex >= timeSlots.length || sessionCount >= maxSessions) break;
          if (subject.remainingHours <= 0) continue;
          
          const slot = timeSlots[slotIndex];
          sessionsToCreate.push({
            subject_id: subject.id,
            date: format(slot.date, 'yyyy-MM-dd'),
            start_time: slot.startTime,
            end_time: slot.endTime
          });
          
          subject.remainingHours -= sessionHours;
          slotIndex++;
          sessionCount++;
        }
      }

      // Insert new sessions
      if (sessionsToCreate.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(
            sessionsToCreate.map(s => ({
              ...s,
              user_id: user.id,
              status: 'planned'
            }))
          );

        if (error) throw error;
      }

      toast.success(`${sessionsToCreate.length} session(s) de révision générée(s) !`);
      await fetchData();

    } catch (err) {
      console.error('Error generating planning:', err);
      toast.error('Erreur lors de la génération du planning');
    } finally {
      setGenerating(false);
    }
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
      
      toast.success('Tous les évènements ont été supprimés');
      await fetchData();
    } catch (err) {
      console.error('Error deleting events:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingEvents(false);
    }
  };

  const handleSessionClick = (session: RevisionSession) => {
    // If it's an invited session, open the invited session dialog
    if ((session as any).isInvitedSession) {
      setSelectedInvitedSession(session);
      setInvitedSessionDialogOpen(true);
      return;
    }
    
    // For own sessions, open the edit dialog
    setSelectedSession(session);
    setEditSessionDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleSessionShareClick = (session: RevisionSession) => {
    setSelectedSession(session);
    setShareSessionDialogOpen(true);
  };

  const handleGridClick = (data: GridClickData) => {
    setGridClickData(data);
    setAddEventDialogOpen(true);
  };

  const handleTutorialComplete = () => {
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
    }
    setShowTutorial(false);
  };

  const handleEventTutorialComplete = () => {
    if (user) {
      localStorage.setItem(`event_tutorial_seen_${user.id}`, 'true');
    }
    setShowEventTutorial(false);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Stats calculations
  const activeSubjects = subjects.filter(s => (s.status || 'active') === 'active');
  const completedSessions = sessions.filter(s => s.status === 'done').length;
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Calculate total revision hours from all sessions
  const totalRevisionHours = sessions.reduce((total, session) => {
    const [startH, startM] = session.start_time.split(':').map(Number);
    const [endH, endM] = session.end_time.split(':').map(Number);
    const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
    return total + durationHours;
  }, 0);

  // Calculate this week's sessions
  const weekEndDate = addDays(weekStart, 6);
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = parseISO(s.date);
    return sessionDate >= weekStart && sessionDate <= weekEndDate;
  });

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 space-y-6">
      {/* Tutorial Overlays */}
      {showTutorial && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}
      {showEventTutorial && !showTutorial && (
        <EventTutorialOverlay onComplete={handleEventTutorialComplete} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Bonjour{profile?.first_name ? `, ${profile.first_name}` : ''} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici ton planning de révisions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setAddEventDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un évènement</span>
            <span className="sm:hidden">Évènement</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          
          <Button
            onClick={generatePlanning}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Générer mon planning</span>
            <span className="sm:hidden">Générer</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSubjects.length}</p>
                <p className="text-xs text-muted-foreground">Matières actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Sessions terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevisionHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Temps total révisé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{thisWeekSessions.length}</p>
                <p className="text-xs text-muted-foreground">Sessions cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Calendrier</CardTitle>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant={calendarView === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCalendarView('week')}
                >
                  Semaine
                </Button>
                <Button
                  variant={calendarView === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCalendarView('month')}
                >
                  Mois
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {calendarEvents.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1">
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Supprimer tous les évènements</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer tous les évènements ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera définitivement tous tes évènements du calendrier. Les sessions de révision ne seront pas affectées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllEvents}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={deletingEvents}
                      >
                        {deletingEvents ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Supprimer tout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {calendarView === 'week' ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium min-w-[140px] text-center">
                    {format(weekStart, 'd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium min-w-[140px] text-center capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          {calendarView === 'week' ? (
            <WeeklyHourGrid
              weekStart={weekStart}
              sessions={sessions}
              events={calendarEvents}
              subjects={subjects}
              sessionInvites={sessionInvites}
              subjectFileCounts={subjectFileCounts}
              onSessionClick={handleSessionClick}
              onEventClick={handleEventClick}
              onShareClick={handleSessionShareClick}
              onGridClick={handleGridClick}
            />
          ) : (
            <MonthlyCalendarView
              currentMonth={currentMonth}
              sessions={sessions}
              events={calendarEvents}
              subjects={subjects}
              onSessionClick={handleSessionClick}
              onEventClick={handleEventClick}
              onDayClick={(date) => {
                setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
                setCalendarView('week');
              }}
            />
          )}
        </CardContent>
      </Card>

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
        initialDate={gridClickData?.date}
        initialStartTime={gridClickData?.startTime}
        initialEndTime={gridClickData?.endTime}
      />
      
      <EditSessionDialog
        session={selectedSession}
        subjects={subjects}
        onClose={() => {
          setSelectedSession(null);
          setEditSessionDialogOpen(false);
        }}
        onUpdate={fetchData}
      />
      
      <EditEventDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={fetchData}
      />
      
      <ShareSessionDialog
        open={shareSessionDialogOpen}
        onOpenChange={setShareSessionDialogOpen}
        session={selectedSession}
        onShareComplete={fetchData}
      />
      
      <InvitedSessionDialog
        open={invitedSessionDialogOpen}
        onOpenChange={setInvitedSessionDialogOpen}
        session={selectedInvitedSession}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default Dashboard;
