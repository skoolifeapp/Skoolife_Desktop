import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, CheckCircle2, XCircle, Target, TrendingUp, 
  LogOut, Settings, ChevronLeft, Loader2, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import logo from '@/assets/logo.png';
import { format, startOfWeek, endOfWeek, subWeeks, addDays } from 'date-fns';
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
  const [currentWeekStats, setCurrentWeekStats] = useState<WeekStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [weekHistory, setWeekHistory] = useState<WeekStats[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

      // Fetch all revision sessions for the last 5 weeks
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const fiveWeeksAgo = subWeeks(currentWeekStart, 4);

      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('id, subject_id, date, start_time, end_time, status')
        .eq('user_id', user.id)
        .gte('date', format(fiveWeeksAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      const sessions = sessionsData || [];

      // Current week stats
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
      const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
      const weekEndStr = format(currentWeekEnd, 'yyyy-MM-dd');
      
      const currentWeekSessions = sessions.filter(
        s => s.date >= weekStartStr && s.date <= weekEndStr
      );

      const subjectStatsMap = new Map<string, SubjectStats>();
      
      currentWeekSessions.forEach(session => {
        const subject = subjectsData?.find(s => s.id === session.subject_id);
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

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getMotivationalMessage = (rate: number) => {
    if (rate >= 80) return "Excellente semaine ! Continue comme ça 🔥";
    if (rate >= 60) return "Belle progression 👏";
    if (rate >= 40) return "Tu avances bien, garde le rythme !";
    if (rate > 0) return "Tu peux faire mieux cette semaine, on y va !";
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
              <Link to="/app">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Planning
              </Link>
            </Button>
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ta progression</h1>
            <p className="text-muted-foreground">Suis tes efforts et tes résultats</p>
          </div>
        </div>

        {/* Current week summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentWeekStats && (
              <>
                {/* Main stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{currentWeekStats.plannedHours}h</p>
                    <p className="text-xs text-muted-foreground">planifiées</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{currentWeekStats.doneHours}h</p>
                    <p className="text-xs text-muted-foreground">réalisées</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg col-span-2 md:col-span-2">
                    <p className="text-3xl font-bold text-primary">{currentWeekStats.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">de ton planning respecté</p>
                    <Progress value={currentWeekStats.completionRate} className="mt-2 h-2" />
                  </div>
                </div>

                {/* Session counts */}
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Sessions : {currentWeekStats.plannedCount} prévues</span>
                  <span>•</span>
                  <span className="text-green-600">{currentWeekStats.doneCount} terminées</span>
                  <span>•</span>
                  <span className="text-red-600">{currentWeekStats.skippedCount} manquées</span>
                </div>

                {/* Motivational message */}
                <p className="text-center text-sm font-medium text-primary">
                  {getMotivationalMessage(currentWeekStats.completionRate)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subject breakdown */}
        {subjectStats.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Répartition par matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats} layout="vertical">
                    <XAxis type="number" unit="h" />
                    <YAxis 
                      type="category" 
                      dataKey="subjectName" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}h`, 'Heures terminées']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
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
                        <span className="text-sm font-medium truncate">{stat.subjectName}</span>
                        <span className="text-xs text-muted-foreground">
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

        {/* Week history */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Historique des dernières semaines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekHistory.map((week, index) => {
                const weekLabel = index === weekHistory.length - 1 
                  ? 'Cette semaine' 
                  : `Semaine du ${format(week.weekStart, 'd MMM', { locale: fr })}`;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === weekHistory.length - 1 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{weekLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {week.doneHours}h / {week.plannedHours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
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
      </main>
    </div>
  );
};

export default Progression;
