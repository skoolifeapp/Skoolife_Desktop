import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Upload, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, Target, Trash2, Sparkles, GraduationCap, Lock, Crown
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
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import ImportCalendarDialog from '@/components/ImportCalendarDialog';
import EditSessionDialog from '@/components/EditSessionDialog';
import EditEventDialog from '@/components/EditEventDialog';
import AddEventDialog from '@/components/AddEventDialog';
import { ShareSessionDialog } from '@/components/ShareSessionDialog';
import WeeklyHourGrid, { type GridClickData } from '@/components/WeeklyHourGrid';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { EventTutorialOverlay } from '@/components/EventTutorialOverlay';
import { SessionStatusDialog } from '@/components/SessionStatusDialog';
import { InvitedSessionDialog } from '@/components/InvitedSessionDialog';
import SupportButton from '@/components/SupportButton';
import AppSidebar from '@/components/AppSidebar';
import type { Profile, Subject, RevisionSession, CalendarEvent } from '@/types/planning';

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [gridClickData, setGridClickData] = useState<GridClickData | null>(null);
  const [deletingEvents, setDeletingEvents] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showEventTutorial, setShowEventTutorial] = useState(false);
  const [sessionPopoverOpen, setSessionPopoverOpen] = useState<string | null>(null);
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
  
  const { user, signOut, subscriptionTier, subscriptionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSigningOut = useRef(false);
  
  // Free user = free_invite tier (users who signed up via invite link)
  const isFreeUser = subscriptionTier === 'free_invite';
  
  // Can invite classmates = only 'major' tier
  const canInviteClassmates = subscriptionTier === 'major';
  
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

      // Check if event tutorial should be shown
      const eventTutorialSeen = localStorage.getItem(`event_tutorial_seen_${user.id}`);
      const mainTutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      // Show event tutorial only if:
      // - Main tutorial has been seen (or not needed)
      // - Event tutorial hasn't been seen
      // - There are events in the calendar
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

      // Convert preferred days to day offsets for Monday-based week (1=Mon→0, ..., 6=Sam→5, 0=Dim→6)
      const workDays = preferredDays.map(d => (d === 0 ? 6 : d - 1)).sort((a, b) => a - b);
      
      const newSessions: { user_id: string; subject_id: string; date: string; start_time: string; end_time: string; status: string; notes: string | null }[] = [];
      let sessionIndex = 0;

      // Sort subjects by exam proximity and weight, excluding terminated subjects
      const activeSubjects = subjects.filter(s => (s.status || 'active') === 'active');
      const sortedSubjects = [...activeSubjects].sort((a, b) => {
        // Prioritize subjects with closer exam dates
        if (a.exam_date && b.exam_date) {
          return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
        }
        if (a.exam_date) return -1;
        if (b.exam_date) return 1;
        // Then by weight
        return b.exam_weight - a.exam_weight;
      });

      const today = startOfDay(new Date());
      const currentTimeStr = format(new Date(), 'HH:mm');
      
      // Track hours scheduled per day to respect maxHoursPerDay
      const hoursScheduledPerDay: Record<string, number> = {};
      
      for (const dayOffset of workDays) {
        const currentDate = addDays(weekStart, dayOffset);
        
        // Skip days before today
        if (currentDate < today) continue;
        
        const isToday = isSameDay(currentDate, new Date());
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Check blocking events for this day
        const dayEvents = calendarEvents.filter(e => {
          const eventDate = parseISO(e.start_datetime);
          return isSameDay(eventDate, currentDate) && e.is_blocking;
        });

        // Get existing revision sessions for this day (done/skipped ones that weren't deleted)
        const dayExistingSessions = sessions.filter(s => s.date === dateStr);

        // Calculate hours already scheduled for this day (from existing sessions)
        const existingHoursToday = dayExistingSessions.reduce((acc, s) => {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
        }, 0);
        
        hoursScheduledPerDay[dateStr] = existingHoursToday;

        for (const slot of timeSlots) {
          if (sessionIndex >= sessionsCount) break;
          
          // Check if adding this session would exceed maxHoursPerDay
          const sessionHoursToAdd = sessionDuration / 60;
          if ((hoursScheduledPerDay[dateStr] || 0) + sessionHoursToAdd > maxHoursPerDay) break;
          
          // Skip slots before current time if it's today
          if (isToday && slot.start < currentTimeStr) continue;

          // Check if slot conflicts with calendar events
          const hasEventConflict = dayEvents.some(e => {
            const eventStart = format(parseISO(e.start_datetime), 'HH:mm');
            const eventEnd = format(parseISO(e.end_datetime), 'HH:mm');
            return (slot.start >= eventStart && slot.start < eventEnd) ||
                   (slot.end > eventStart && slot.end <= eventEnd) ||
                   (slot.start <= eventStart && slot.end >= eventEnd);
          });

          // Check if slot conflicts with existing revision sessions
          const hasSessionConflict = dayExistingSessions.some(s => {
            return (slot.start >= s.start_time && slot.start < s.end_time) ||
                   (slot.end > s.start_time && slot.end <= s.end_time) ||
                   (slot.start <= s.start_time && slot.end >= s.end_time);
          });

          const hasConflict = hasEventConflict || hasSessionConflict;

          if (!hasConflict) {
            // Filter subjects that still have exams after this date AND haven't reached target_hours
            const eligibleSubjects = sortedSubjects.filter(s => {
              // Check exam date constraint
              if (s.exam_date) {
                const examDate = parseISO(s.exam_date);
                if (currentDate >= examDate) return false;
              }
              // Check target_hours constraint
              if (s.target_hours && s.target_hours > 0) {
                const sessionHours = sessionDuration / 60;
                const alreadyScheduled = scheduledHoursPerSubject[s.id] || 0;
                if (alreadyScheduled + sessionHours > s.target_hours) return false;
              }
              return true;
            });
            
            if (eligibleSubjects.length === 0) continue; // No subject to assign for this day
            
            // Select subject based on weighted distribution
            const subjectIndex = sessionIndex % eligibleSubjects.length;
            const subject = eligibleSubjects[subjectIndex];

            newSessions.push({
              user_id: user.id,
              subject_id: subject.id,
              date: dateStr,
              start_time: slot.start,
              end_time: slot.end,
              status: 'planned',
              notes: null
            });

            // Track scheduled hours per day and per subject
            hoursScheduledPerDay[dateStr] = (hoursScheduledPerDay[dateStr] || 0) + sessionHoursToAdd;
            scheduledHoursPerSubject[subject.id] = (scheduledHoursPerSubject[subject.id] || 0) + sessionHoursToAdd;

            sessionIndex++;
          }
        }
      }

      // Insert new sessions
      if (newSessions.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(newSessions);

        if (error) throw error;
        
        // Check if all subjects have reached their target_hours
        const allObjectivesReached = sortedSubjects.every(s => {
          if (!s.target_hours || s.target_hours <= 0) return true;
          const scheduled = scheduledHoursPerSubject[s.id] || 0;
          return scheduled >= s.target_hours;
        });
        
        if (allObjectivesReached && sortedSubjects.some(s => s.target_hours && s.target_hours > 0)) {
          toast.success("L'objectif de révisions a été atteint ✨");
        }
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

  const adjustWeek = async () => {
    if (!user) return;

    // Check if any active subject has target_hours defined (exclude terminated subjects)
    const subjectsWithGoals = subjects.filter(s => s.target_hours && s.target_hours > 0 && (s.status || 'active') === 'active');
    if (subjectsWithGoals.length === 0) {
      toast.error("Tu n'as pas encore défini d'objectifs par matière. Va dans 'Gérer mes matières' pour les ajouter.");
      return;
    }

    setAdjusting(true);

    try {
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch all past sessions to calculate hours already done
      const { data: allSessions } = await supabase
        .from('revision_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Calculate hours already done per subject
      const hoursPerSubject: Record<string, number> = {};
      (allSessions || []).forEach(session => {
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        hoursPerSubject[session.subject_id] = (hoursPerSubject[session.subject_id] || 0) + durationHours;
      });

      // Calculate remaining hours per subject with goals
      const today = new Date();
      const subjectsNeedingHours = subjectsWithGoals
        .map(subject => {
          const hoursDone = hoursPerSubject[subject.id] || 0;
          const remaining = (subject.target_hours || 0) - hoursDone;
          const examDate = subject.exam_date ? parseISO(subject.exam_date) : null;
          const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;
          return {
            ...subject,
            hoursDone,
            remaining: Math.max(0, remaining),
            daysUntilExam
          };
        })
        .filter(s => s.remaining > 0 && s.daysUntilExam > 0)
        .sort((a, b) => {
          // Sort by priority (exam_weight desc), then by exam proximity, then by remaining hours
          if (b.exam_weight !== a.exam_weight) return b.exam_weight - a.exam_weight;
          if (a.daysUntilExam !== b.daysUntilExam) return a.daysUntilExam - b.daysUntilExam;
          return b.remaining - a.remaining;
        });

      if (subjectsNeedingHours.length === 0) {
        toast.info("Tous tes objectifs sont déjà couverts, rien à ajouter pour cette semaine 👌");
        setAdjusting(false);
        return;
      }

      // Get current week bounds (Monday to Sunday inclusive)
      const weekEndDate = addDays(weekStart, 6); // Sunday
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEndDate, 'yyyy-MM-dd');
      
      // Extract preferences with defaults
      const preferredDays = preferences?.preferred_days_of_week || [1, 2, 3, 4, 5];
      const dailyStartTime = preferences?.daily_start_time || '08:00';
      const dailyEndTime = preferences?.daily_end_time || '22:00';
      const maxHoursPerDay = preferences?.max_hours_per_day || 4;
      const sessionDuration = (preferences as any)?.session_duration_minutes || 90;
      const avoidEarlyMorning = preferences?.avoid_early_morning || false;
      const avoidLateEvening = preferences?.avoid_late_evening || false;

      // Parse start/end times
      const [startHour] = dailyStartTime.split(':').map(Number);
      const [endHour] = dailyEndTime.split(':').map(Number);

      // Calculate effective start/end hours
      let effectiveStartHour = startHour;
      let effectiveEndHour = endHour;
      if (avoidEarlyMorning && effectiveStartHour < 9) effectiveStartHour = 9;
      if (avoidLateEvening && effectiveEndHour > 21) effectiveEndHour = 21;

      // Get existing sessions and events for THIS week only (using string comparison for accuracy)
      const weekSessions = sessions.filter(s => {
        return s.date >= weekStartStr && s.date <= weekEndStr;
      });

      const weekEvents = calendarEvents.filter(e => {
        const eventDateStr = format(parseISO(e.start_datetime), 'yyyy-MM-dd');
        return eventDateStr >= weekStartStr && eventDateStr <= weekEndStr && e.is_blocking;
      });

      // Convert preferred days (1=Mon..6=Sat, 0=Sun) to day offsets for Monday-based week
      const workDays = preferredDays.map(d => (d === 0 ? 6 : d - 1)).sort((a, b) => a - b);
      
      // Find available slots for each day
      const newSessions: { user_id: string; subject_id: string; date: string; start_time: string; end_time: string; status: string; notes: string | null }[] = [];
      let subjectIndex = 0;

      for (const dayOffset of workDays) {
        const currentDate = addDays(weekStart, dayOffset);
        
        // Skip past days
        if (currentDate < today && !isSameDay(currentDate, today)) continue;
        
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Get existing blocks for this day
        const dayEvents = weekEvents.filter(e => isSameDay(parseISO(e.start_datetime), currentDate));
        const daySessions = weekSessions.filter(s => s.date === dateStr);
        const isToday = isSameDay(currentDate, new Date());

        // Calculate hours already scheduled today
        const hoursScheduledToday = daySessions.reduce((acc, s) => {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
        }, 0);

        // Build list of blocked time ranges
        const blockedRanges: { start: number; end: number }[] = [];
        
        // Add events as blocked
        dayEvents.forEach(e => {
          const eventStart = parseISO(e.start_datetime);
          const eventEnd = parseISO(e.end_datetime);
          blockedRanges.push({
            start: eventStart.getHours() * 60 + eventStart.getMinutes(),
            end: eventEnd.getHours() * 60 + eventEnd.getMinutes()
          });
        });

        // Add existing sessions as blocked
        daySessions.forEach(s => {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          blockedRanges.push({ start: sh * 60 + sm, end: eh * 60 + em });
        });

        // Add lunch break as blocked (12:30-14:00)
        blockedRanges.push({ start: 12.5 * 60, end: 14 * 60 });

        // Block time before current time if it's today
        if (isToday) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          blockedRanges.push({ start: 0, end: currentMinutes });
        }

        // Sort blocked ranges
        blockedRanges.sort((a, b) => a.start - b.start);

        // Find free slots
        const freeSlots: { start: number; end: number }[] = [];
        let cursor = effectiveStartHour * 60;
        const dayEnd = effectiveEndHour * 60;

        for (const block of blockedRanges) {
          if (cursor < block.start && block.start <= dayEnd) {
            freeSlots.push({ start: cursor, end: Math.min(block.start, dayEnd) });
          }
          cursor = Math.max(cursor, block.end);
        }
        if (cursor < dayEnd) {
          freeSlots.push({ start: cursor, end: dayEnd });
        }

        // Try to place sessions in free slots
        let hoursAddedToday = 0;
        const maxToAddToday = maxHoursPerDay - hoursScheduledToday;

        for (const slot of freeSlots) {
          if (hoursAddedToday >= maxToAddToday) break;
          if (subjectsNeedingHours.length === 0) break;

          const slotDuration = slot.end - slot.start;
          if (slotDuration < sessionDuration) continue;

          // Place session
          const sessionStart = slot.start;
          const sessionEnd = sessionStart + sessionDuration;

          const formatTime = (minutes: number) => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          };

          // Filter subjects whose exam is after this date AND still have remaining hours to schedule
          const sessionHoursToAdd = sessionDuration / 60;
          const eligibleSubjects = subjectsNeedingHours.filter(s => {
            if (!s.exam_date) return s.remaining > 0;
            const examDate = parseISO(s.exam_date);
            if (currentDate >= examDate) return false;
            // Check if adding this session would exceed target_hours
            const currentScheduled = hoursPerSubject[s.id] || 0;
            return currentScheduled + sessionHoursToAdd <= (s.target_hours || 0);
          });
          
          if (eligibleSubjects.length === 0) continue; // No subject to assign for this day
          
          // Pick subject using round-robin based on priority
          const subject = eligibleSubjects[subjectIndex % eligibleSubjects.length];

          newSessions.push({
            user_id: user.id,
            subject_id: subject.id,
            date: dateStr,
            start_time: formatTime(sessionStart),
            end_time: formatTime(sessionEnd),
            status: 'planned',
            notes: null
          });

          hoursAddedToday += sessionHoursToAdd;
          // Track hours added per subject to respect target_hours
          hoursPerSubject[subject.id] = (hoursPerSubject[subject.id] || 0) + sessionHoursToAdd;
          subjectIndex++;

          // Update slot cursor for potential next session
          slot.start = sessionEnd + 30; // 30 min break
        }
      }

      // Insert new sessions
      if (newSessions.length > 0) {
        const { error } = await supabase
          .from('revision_sessions')
          .insert(newSessions);

        if (error) throw error;
        
        // Check if all subjects have reached their target_hours
        const allObjectivesReached = subjectsNeedingHours.every(s => {
          if (!s.target_hours || s.target_hours <= 0) return true;
          const scheduled = hoursPerSubject[s.id] || 0;
          return scheduled >= s.target_hours;
        });
        
        if (allObjectivesReached && subjectsNeedingHours.some(s => s.target_hours && s.target_hours > 0)) {
          toast.success("L'objectif de révisions a été atteint ✨");
        } else {
          toast.success(`Semaine ajustée : ${newSessions.length} nouvelle${newSessions.length > 1 ? 's' : ''} session${newSessions.length > 1 ? 's' : ''} ajoutée${newSessions.length > 1 ? 's' : ''} ✨`);
        }
      } else {
        // Check if objectives are already reached (no sessions needed)
        const allObjectivesReached = subjectsNeedingHours.every(s => s.remaining <= 0);
        if (allObjectivesReached && subjectsNeedingHours.some(s => s.target_hours && s.target_hours > 0)) {
          toast.success("L'objectif de révisions a été atteint ✨");
        } else {
          toast.info("Aucun créneau libre disponible cette semaine");
        }
      }

      fetchData();

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajustement de la semaine");
    } finally {
      setAdjusting(false);
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

  const handleSessionResize = async (sessionId: string, data: { startTime?: string; endTime?: string }) => {
    try {
      const updateData: { start_time?: string; end_time?: string } = {};
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.endTime) updateData.end_time = data.endTime;

      const { error } = await supabase
        .from('revision_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du redimensionnement de la session');
    }
  };

  const handleEventResize = async (eventId: string, data: { startTime?: string; endTime?: string }) => {
    try {
      // Get the current event to preserve datetimes
      const event = calendarEvents.find(e => e.id === eventId);
      if (!event) return;

      // Parse the start datetime to get the date
      const startDate = parseISO(event.start_datetime);
      const dateStr = format(startDate, 'yyyy-MM-dd');
      
      const updateData: { start_datetime?: string; end_datetime?: string } = {};
      
      if (data.startTime) {
        const startDatetime = new Date(`${dateStr}T${data.startTime}:00`);
        updateData.start_datetime = startDatetime.toISOString();
      }
      
      if (data.endTime) {
        const endDatetime = new Date(`${dateStr}T${data.endTime}:00`);
        updateData.end_datetime = endDatetime.toISOString();
      }

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du redimensionnement de l\'évènement');
    }
  };

  const handleSessionStatusUpdate = async (sessionId: string, status: 'done' | 'skipped') => {
    try {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSessionClick = (session: RevisionSession) => {
    // If it's an invited session, show the invited session dialog
    if (session.isInvitedSession) {
      setSelectedInvitedSession(session);
      setInvitedSessionDialogOpen(true);
      return;
    }
    // Otherwise show the regular session status dialog
    setSelectedSession(session);
    setSessionPopoverOpen(session.id);
  };

  const handleInviteConfirm = async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Mark the invite as explicitly confirmed
      const { error } = await supabase
        .from('session_invites')
        .update({ confirmed: true })
        .eq('session_id', sessionId)
        .eq('accepted_by', user.id);

      if (error) throw error;
      
      toast.success('Participation confirmée !');
      fetchData(); // Refresh to update UI
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleInviteDecline = async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Remove the accepted_by from the invite
      const { error } = await supabase
        .from('session_invites')
        .update({ 
          accepted_by: null, 
          accepted_at: null,
          confirmed: false
        })
        .eq('session_id', sessionId)
        .eq('accepted_by', user.id);

      if (error) throw error;
      
      toast.success('Invitation refusée');
      fetchData(); // Refresh to update UI
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du refus de l\'invitation');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Check if the selected week is in the past (before current week)
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const isPastWeek = weekStart < currentWeekStart;

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
    .filter(s => s.exam_date && s.status !== 'archived')
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
    <AppSidebar>
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                  {isFreeUser ? 'Tes sessions de révision partagées' : 'Prêt pour une session productive ?'}
                </p>
              </CardContent>
            </Card>

            {/* Free user banner */}
            {isFreeUser && (
              <Card className="border-2 border-primary/30 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-sm">Compte Gratuit</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Tu peux voir les sessions auxquelles tu es invité(e). Pour créer ton propre planning de révisions, passe à Skoolife Premium.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('create-checkout', {
                          body: { priceId: 'price_1QlYourPriceIdHere' }
                        });
                        if (error) throw error;
                        if (data?.url) window.open(data.url, '_blank');
                      } catch (err) {
                        console.error(err);
                        toast.error('Erreur lors de la redirection vers le paiement');
                      }
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Passer à Premium
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stats - only for subscribed users */}
            {!isFreeUser && (
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
            )}

            {/* Upcoming exams - only for subscribed users */}
            {!isFreeUser && upcomingExams.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Prochains examens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingExams.map((subject) => {
                    const examType = (subject as any).exam_type;
                    const examTypeLabel = examType === 'partiel' ? 'Partiel' 
                      : examType === 'controle_continu' ? 'CC'
                      : examType === 'oral' ? 'Oral'
                      : examType === 'projet' ? 'Projet'
                      : null;
                    
                    return (
                      <div key={subject.id} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {subject.name}
                            {examTypeLabel && <span className="text-muted-foreground font-normal"> ({examTypeLabel})</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(subject.exam_date!), 'dd MMM', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Actions - only for subscribed users */}
            {!isFreeUser && (
              <div className="space-y-3">
                <Button 
                  id="generate-planning-btn"
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={generatePlanning}
                  disabled={generating || adjusting || isPastWeek}
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {generating ? 'Génération...' : 'Générer mon planning'}
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full"
                  onClick={adjustWeek}
                  disabled={adjusting || generating || isPastWeek}
                >
                  {adjusting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {adjusting ? 'Ajustement...' : 'Ajuster ma semaine'}
                </Button>
                <Button 
                  id="import-calendar-btn"
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  Importer calendrier (.ics)
                </Button>
                <Button 
                  id="manage-subjects-btn"
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link to="/subjects">
                    <GraduationCap className="w-4 h-4" />
                    Gérer mes matières
                  </Link>
                </Button>
              </div>
            )}
          </aside>

          {/* Calendar */}
          <div className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Semaine du {format(weekStart, 'dd MMM', { locale: fr })}
              </h2>
              <div className="flex items-center gap-2">
                {!isFreeUser && (
                  <>
                    <Button 
                      id="add-event-btn"
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
                  </>
                )}
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
              sessions={isFreeUser ? sessions.filter(s => s.isInvitedSession) : sessions}
              calendarEvents={isFreeUser ? [] : calendarEvents}
              exams={isFreeUser ? [] : subjects
                .filter(s => s.exam_date && s.status !== 'archived')
                .map(s => ({
                  id: s.id,
                  name: s.name,
                  color: s.color || '#FFC107',
                  exam_date: s.exam_date!
                }))
              }
              sessionInvites={sessionInvites}
              isPastWeek={isPastWeek}
              onSessionClick={handleSessionClick}
              onEventClick={isFreeUser ? undefined : setSelectedEvent}
              onGridClick={isFreeUser ? undefined : handleGridClick}
              onSessionMove={isFreeUser ? undefined : handleSessionMove}
              onEventMove={isFreeUser ? undefined : handleEventMove}
              onSessionResize={isFreeUser ? undefined : handleSessionResize}
              onEventResize={isFreeUser ? undefined : handleEventResize}
            />

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
      
      {/* Session status dialog */}
      <SessionStatusDialog
        session={selectedSession}
        open={sessionPopoverOpen !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSessionPopoverOpen(null);
          }
        }}
        onMarkDone={() => selectedSession && handleSessionStatusUpdate(selectedSession.id, 'done')}
        onMarkSkipped={() => selectedSession && handleSessionStatusUpdate(selectedSession.id, 'skipped')}
        onEdit={() => {
          setSessionPopoverOpen(null);
          setEditSessionDialogOpen(true);
        }}
        onShare={canInviteClassmates ? () => {
          setSessionPopoverOpen(null);
          setShareSessionDialogOpen(true);
        } : undefined}
        hasAcceptedInvite={selectedSession ? (sessionInvites[selectedSession.id]?.invitees?.some(i => i.accepted_by) ?? false) : false}
        inviteInfo={selectedSession ? sessionInvites[selectedSession.id] : undefined}
      />

      {/* Share session dialog */}
      <ShareSessionDialog
        session={shareSessionDialogOpen ? selectedSession : null}
        subject={selectedSession ? subjects.find(s => s.id === selectedSession.subject_id) : undefined}
        onClose={() => {
          setShareSessionDialogOpen(false);
        }}
        onInviteSuccess={fetchData}
      />

      {/* Invited session dialog */}
      <InvitedSessionDialog
        session={selectedInvitedSession}
        open={invitedSessionDialogOpen}
        onOpenChange={(open) => {
          setInvitedSessionDialogOpen(open);
          if (!open) setSelectedInvitedSession(null);
        }}
        onConfirm={handleInviteConfirm}
        onDecline={handleInviteDecline}
      />

      {/* Tutorial overlay */}
      {showTutorial && user && (
        <TutorialOverlay
          onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
            // Check if event tutorial should be shown after main tutorial
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

      {/* Support Button */}
      <SupportButton 
        onShowTutorial={() => {
          localStorage.removeItem(`tutorial_seen_${user?.id}`);
          setShowTutorial(true);
        }}
      />
    </AppSidebar>
  );
};

export default Dashboard;