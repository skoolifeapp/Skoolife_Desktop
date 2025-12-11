import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, CheckCircle2, Target, TrendingUp, Loader2, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import SupportButton from '@/components/SupportButton';
import AppSidebar from '@/components/AppSidebar';
import { ProgressionTutorialOverlay } from '@/components/ProgressionTutorialOverlay';
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
}

const Progression = () => {
  const [loading, setLoading] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentWeekStats, setCurrentWeekStats] = useState<WeekStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [weekHistory, setWeekHistory] = useState<WeekStats[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSessions, setAllSessions] = useState<RevisionSession[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (!loading) {
      const hasSeenTutorial = localStorage.getItem('hasSeenProgressionTutorial');
      if (!hasSeenTutorial) {
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [loading]);

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenProgressionTutorial', 'true');
    setShowTutorial(false);
  };

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
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, color')
        .eq('user_id', user.id);

      setSubjects(subjectsData || []);

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

      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentStats = calculateWeekStats(sessions, currentWeekStart);
      setCurrentWeekStats(currentStats);

      const history: WeekStats[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = subWeeks(currentWeekStart, i);
        history.push(calculateWeekStats(sessions, weekStart));
      }
      setWeekHistory(history);

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
    
    const weekSessions = sessions.filter(
      s => s.date >= weekStartStr && s.date <= weekEndStr
    );

    const subjectStatsMap = new Map<string, SubjectStats>();
    
    weekSessions.forEach(session => {
      const subject = subjectsData.find(s => s.id === session.subject_id);
      if (!subject) return;

      const existing = subjectStatsMap.get(session.subject_id) || {
        subjectId: session.subject_id,
        subjectName: subject.name,
        color: subject.color || '#FFC107',
        doneHours: 0,
        plannedHours: 0,
      };

      const duration = calculateSessionDuration(session.start_time, session.end_time);
      existing.plannedHours += duration;
      
      if (session.status === 'done') {
        existing.doneHours += duration;
      }

      subjectStatsMap.set(session.subject_id, existing);
    });

    setSubjectStats(Array.from(subjectStatsMap.values()));
  };

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

  const getMotivationalMessage = (rate: number) => {
    if (rate >= 80) return "Excellente semaine ! Continue comme ça 🔥";
    if (rate >= 60) return "Belle progression 👏";
    if (rate >= 40) return "Tu avances bien, garde le rythme !";
    if (rate > 0) return "Tu peux faire mieux, on y va !";
    return "C'est le moment de démarrer !";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppSidebar>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-auto">
        {showTutorial && (
          <ProgressionTutorialOverlay onComplete={handleTutorialComplete} />
        )}
        
        {/* Page Header - Compact on mobile */}
        <div className="flex items-center gap-3 mb-4 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Ta progression</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Suis tes efforts et tes résultats</p>
          </div>
        </div>

        {/* Current week summary */}
        <Card className="border-0 shadow-md" data-progression-week-stats>
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="truncate">{getWeekLabel()}</span>
            </CardTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {!isCurrentWeek && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                  className="h-8 text-xs px-2 hidden sm:flex"
                >
                  Aujourd'hui
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-2 sm:pt-4">
            {currentWeekStats && (
              <>
                {/* Main stats - Horizontal scroll on mobile */}
                <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="flex-shrink-0 w-28 sm:w-auto text-center p-3 sm:p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{currentWeekStats.plannedHours}h</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">planifiées</p>
                  </div>
                  <div className="flex-shrink-0 w-28 sm:w-auto text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{currentWeekStats.doneHours}h</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">réalisées</p>
                  </div>
                  <div className="flex-shrink-0 w-36 sm:w-auto text-center p-3 sm:p-4 bg-primary/10 rounded-lg sm:col-span-2">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{currentWeekStats.completionRate}%</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">du planning respecté</p>
                    <Progress value={currentWeekStats.completionRate} className="mt-2 h-1.5 sm:h-2" />
                  </div>
                </div>

                {/* Session counts - Wrap on mobile */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span>{currentWeekStats.plannedCount} sessions prévues</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-green-600">{currentWeekStats.doneCount} terminées</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-red-600">{currentWeekStats.skippedCount} manquées</span>
                </div>

                {/* Motivational message */}
                <p className="text-center text-xs sm:text-sm font-medium text-primary">
                  {getMotivationalMessage(currentWeekStats.completionRate)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subject breakdown */}
        {subjectStats.length > 0 && (
          <Card className="border-0 shadow-md" data-progression-subject-breakdown>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Répartition par matière
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
              {/* Chart - Shorter on mobile */}
              <div className="h-40 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats} layout="vertical">
                    <XAxis type="number" unit="h" tick={{ fontSize: 10 }} />
                    <YAxis 
                      type="category" 
                      dataKey="subjectName" 
                      width={80}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}h`, 'Heures terminées']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="doneHours" radius={[0, 4, 4, 0]}>
                      {subjectStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject list with progress */}
              <div className="space-y-3 mt-4">
                {subjectStats.map(stat => (
                  <div key={stat.subjectId} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm font-medium truncate">{stat.subjectName}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {Math.round(stat.doneHours * 10) / 10}h / {Math.round(stat.plannedHours * 10) / 10}h
                        </span>
                      </div>
                      <Progress 
                        value={stat.plannedHours > 0 ? (stat.doneHours / stat.plannedHours) * 100 : 0} 
                        className="h-1.5"
                        style={{ 
                          '--progress-background': stat.color 
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week history - Card style on mobile */}
        <Card className="border-0 shadow-md" data-progression-history>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
            <div className="space-y-2 sm:space-y-3">
              {weekHistory.map((week, index) => {
                const weekLabel = index === weekHistory.length - 1 
                  ? 'Cette semaine' 
                  : `Sem. ${format(week.weekStart, 'd MMM', { locale: fr })}`;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === weekHistory.length - 1 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{weekLabel}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {week.doneHours}h / {week.plannedHours}h
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-base sm:text-lg font-bold ${
                        week.completionRate >= 70 ? 'text-green-600' :
                        week.completionRate >= 40 ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>
                        {week.completionRate}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <SupportButton />
      </div>
    </AppSidebar>
  );
};

export default Progression;
