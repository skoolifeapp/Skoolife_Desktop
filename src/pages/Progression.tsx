import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressionSkeleton } from '@/components/PageSkeletons';
import { useAuth } from '@/hooks/useAuth';
import { useInviteFreeUser } from '@/hooks/useInviteFreeUser';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, BookOpen, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupportButton from '@/components/SupportButton';

import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface RevisionSession {
  id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface WeekStats {
  weekStart: Date;
  plannedHours: number;
  doneHours: number;
  plannedCount: number;
  doneCount: number;
  skippedCount: number;
  completionRate: number;
}

interface SubjectStats {
  subjectId: string;
  subjectName: string;
  color: string;
  doneHours: number;
  plannedHours: number;
  doneCount: number;
  plannedCount: number;
  trend: 'up' | 'down' | 'stable';
}

const Progression = () => {
  const [loading, setLoading] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentWeekStats, setCurrentWeekStats] = useState<WeekStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [weekHistory, setWeekHistory] = useState<WeekStats[]>([]);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSessions, setAllSessions] = useState<RevisionSession[]>([]);
  const { user, signOut, subscriptionTier, subscriptionLoading } = useAuth();
  const { isInviteFreeUser, loading: inviteGateLoading } = useInviteFreeUser();
  const navigate = useNavigate();

  // Redirect free users AND Student tier users (only Major has access)
  useEffect(() => {
    if (inviteGateLoading || subscriptionLoading) return;
    
    const isStudentTier = subscriptionTier === 'student';
    if (isInviteFreeUser || isStudentTier) {
      navigate('/app');
    }
  }, [inviteGateLoading, subscriptionLoading, isInviteFreeUser, subscriptionTier, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);


  const calculateSessionDuration = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
  };

  const calculateWeekStats = (sessions: RevisionSession[], weekStart: Date): WeekStats => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    const weekSessions = sessions.filter(s => s.date >= weekStartStr && s.date <= weekEndStr);

    let plannedHours = 0;
    let doneHours = 0;
    let plannedCount = 0;
    let doneCount = 0;
    let skippedCount = 0;

    weekSessions.forEach(session => {
      const duration = calculateSessionDuration(session.start_time, session.end_time);
      plannedHours += duration;
      plannedCount++;

      if (session.status === 'done') {
        doneHours += duration;
        doneCount++;
      } else if (session.status === 'skipped') {
        skippedCount++;
      }
    });

    const completionRate = plannedHours > 0 ? Math.round((doneHours / plannedHours) * 100) : 0;

    return {
      weekStart,
      plannedHours: Math.round(plannedHours * 10) / 10,
      doneHours: Math.round(doneHours * 10) / 10,
      plannedCount,
      doneCount,
      skippedCount,
      completionRate,
    };
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, color')
        .eq('user_id', user.id);

      setSubjects(subjectsData || []);

      // Fetch all revision sessions (wider range for navigation)
      const tenWeeksAgo = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 10);
      const tenWeeksAhead = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 10);

      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('id, subject_id, date, start_time, end_time, status')
        .eq('user_id', user.id)
        .gte('date', format(tenWeeksAgo, 'yyyy-MM-dd'))
        .lte('date', format(tenWeeksAhead, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      const sessions = sessionsData || [];
      setAllSessions(sessions);

      // Current week stats
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentStats = calculateWeekStats(sessions, currentWeekStart);
      setCurrentWeekStats(currentStats);

      // Week history (last 4 weeks including current)
      const history: WeekStats[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = subWeeks(currentWeekStart, i);
        history.push(calculateWeekStats(sessions, weekStart));
      }
      setWeekHistory(history);

      // Subject stats for current week
      updateSubjectStats(sessions, subjectsData || [], currentWeekStart);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectStats = (sessions: RevisionSession[], subjectsData: Subject[], weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
    
    // Previous week for trend calculation
    const prevWeekStart = subWeeks(weekStart, 1);
    const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });
    const prevWeekStartStr = format(prevWeekStart, 'yyyy-MM-dd');
    const prevWeekEndStr = format(prevWeekEnd, 'yyyy-MM-dd');
    
    const weekSessions = sessions.filter(
      s => s.date >= weekStartStr && s.date <= weekEndStr
    );
    
    const prevWeekSessions = sessions.filter(
      s => s.date >= prevWeekStartStr && s.date <= prevWeekEndStr
    );

    const subjectStatsMap = new Map<string, SubjectStats>();
    
    // Calculate current week stats
    weekSessions.forEach(session => {
      const subject = subjectsData.find(s => s.id === session.subject_id);
      if (!subject) return;

      const existing = subjectStatsMap.get(session.subject_id) || {
        subjectId: session.subject_id,
        subjectName: subject.name,
        color: subject.color || '#FFC107',
        doneHours: 0,
        plannedHours: 0,
        doneCount: 0,
        plannedCount: 0,
        trend: 'stable' as const,
      };

      const duration = calculateSessionDuration(session.start_time, session.end_time);
      existing.plannedHours += duration;
      existing.plannedCount++;
      
      if (session.status === 'done') {
        existing.doneHours += duration;
        existing.doneCount++;
      }

      subjectStatsMap.set(session.subject_id, existing);
    });
    
    // Calculate trend based on previous week
    subjectStatsMap.forEach((stat, subjectId) => {
      const prevSubjectSessions = prevWeekSessions.filter(s => s.subject_id === subjectId && s.status === 'done');
      let prevDoneHours = 0;
      prevSubjectSessions.forEach(s => {
        prevDoneHours += calculateSessionDuration(s.start_time, s.end_time);
      });
      
      if (stat.doneHours > prevDoneHours) {
        stat.trend = 'up';
      } else if (stat.doneHours < prevDoneHours) {
        stat.trend = 'down';
      } else {
        stat.trend = 'stable';
      }
    });

    setSubjectStats(Array.from(subjectStatsMap.values()));
  };

  // Update stats when selected week changes
  useEffect(() => {
    if (allSessions.length > 0 && subjects.length > 0) {
      const stats = calculateWeekStats(allSessions, selectedWeekStart);
      setCurrentWeekStats(stats);
      updateSubjectStats(allSessions, subjects, selectedWeekStart);
    }
  }, [selectedWeekStart, allSessions, subjects]);

  const goToPreviousWeek = () => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeekStart(prev => addWeeks(prev, 1));
  };

  const isCurrentWeek = isSameWeek(selectedWeekStart, new Date(), { weekStartsOn: 1 });

  const getWeekLabel = () => {
    if (isCurrentWeek) return 'Cette semaine';
    const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
    return `${format(selectedWeekStart, 'd', { locale: fr })} - ${format(weekEnd, 'd MMM', { locale: fr })}`;
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${Math.round(hours * 10) / 10}h`;
  };

  // Generate a lighter version of the color for background
  const getSubjectBgStyle = (color: string) => {
    return {
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      borderLeft: `4px solid ${color}`,
    };
  };

  if (loading) {
    return <ProgressionSkeleton />;
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Tableau de Bord des Progrès</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-2 py-1.5 shadow-sm">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 text-sm font-medium min-w-[140px] text-center">{getWeekLabel()}</span>
          {!isCurrentWeek && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="h-8 text-xs text-primary-foreground hover:bg-primary-foreground/20"
            >
              Aujourd'hui
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top summary cards */}
      {currentWeekStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Heures d'étude */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Heures d'étude</span>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{formatHours(currentWeekStats.doneHours)}</p>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </CardContent>
          </Card>

          {/* Taux de complétion */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Taux de complétion</span>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {currentWeekStats.completionRate}<span className="text-xl">%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentWeekStats.doneHours}h / {currentWeekStats.plannedHours}h planifiées
              </p>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Sessions réalisées</span>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{currentWeekStats.doneCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject cards section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Progrès par Matière</h2>
        </div>

        {subjectStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectStats.map((stat) => (
              <Card 
                key={stat.subjectId} 
                className="border-0 shadow-sm overflow-hidden"
                style={getSubjectBgStyle(stat.color)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span 
                        className="inline-block px-2.5 py-0.5 rounded text-xs font-medium text-white mb-2"
                        style={{ backgroundColor: stat.color }}
                      >
                        {stat.subjectName.substring(0, 3).toUpperCase()}
                      </span>
                      <h3 className="font-semibold text-foreground">{stat.subjectName}</h3>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Temps d'étude</span>
                      </div>
                      <p className="text-lg font-bold">{formatHours(stat.doneHours)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Sessions</span>
                      </div>
                      <p className="text-lg font-bold">{stat.doneCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune session de révision cette semaine</p>
              <p className="text-sm text-muted-foreground mt-1">
                Génère ton planning pour commencer à suivre ta progression !
              </p>
            </CardContent>
          </Card>
        )}
      </div>


      {/* Support Button */}
      <SupportButton />
    </div>
  );
};

export default Progression;
