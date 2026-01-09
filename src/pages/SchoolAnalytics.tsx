import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { supabase } from '@/integrations/supabase/client';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Target
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyStats {
  date: string;
  sessions: number;
  completed: number;
  plannedHours: number;
  completedHours: number;
}

const SchoolAnalytics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, isSchoolAdmin, school, members, cohorts, stats } = useSchoolAdmin();
  
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!loading && !isSchoolAdmin && user) {
      navigate('/app');
    }
  }, [loading, isSchoolAdmin, user, navigate]);

  const studentIds = useMemo(() => {
    return members
      .filter(m => {
        if (m.role !== 'student') return false;
        if (selectedCohort !== 'all' && m.cohort_id !== selectedCohort) return false;
        return true;
      })
      .map(m => m.user_id);
  }, [members, selectedCohort]);

  useEffect(() => {
    const fetchDailyStats = async () => {
      if (studentIds.length === 0) {
        setDailyStats([]);
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      const daysAgo = parseInt(selectedPeriod);
      const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');

      const { data: sessions } = await supabase
        .from('revision_sessions')
        .select('date, status, start_time, end_time')
        .in('user_id', studentIds)
        .gte('date', startDate);

      // Group by date
      const dateMap = new Map<string, { sessions: number; completed: number; plannedHours: number; completedHours: number }>();
      
      // Initialize all dates
      eachDayOfInterval({
        start: subDays(new Date(), daysAgo),
        end: new Date()
      }).forEach(date => {
        dateMap.set(format(date, 'yyyy-MM-dd'), { sessions: 0, completed: 0, plannedHours: 0, completedHours: 0 });
      });

      // Fill with data
      sessions?.forEach(session => {
        const existing = dateMap.get(session.date) || { sessions: 0, completed: 0, plannedHours: 0, completedHours: 0 };
        existing.sessions++;
        
        const start = new Date(`1970-01-01T${session.start_time}`);
        const end = new Date(`1970-01-01T${session.end_time}`);
        const sessionHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        existing.plannedHours += sessionHours;
        if (session.status === 'done') {
          existing.completed++;
          existing.completedHours += sessionHours;
        }
        
        dateMap.set(session.date, existing);
      });

      const statsArray: DailyStats[] = Array.from(dateMap.entries())
        .map(([date, data]) => ({
          date,
          sessions: data.sessions,
          completed: data.completed,
          plannedHours: Math.round(data.plannedHours * 10) / 10,
          completedHours: Math.round(data.completedHours * 10) / 10,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setDailyStats(statsArray);
      setLoadingStats(false);
    };

    if (!loading && studentIds.length >= 0) {
      fetchDailyStats();
    }
  }, [studentIds, selectedPeriod, loading]);

  if (authLoading || loading) {
    return (
      <SchoolSidebar>
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </SchoolSidebar>
    );
  }

  if (!isSchoolAdmin) {
    return null;
  }

  const filteredStudentCount = studentIds.length;
  const totalSessions = dailyStats.reduce((acc, d) => acc + d.sessions, 0);
  const totalCompleted = dailyStats.reduce((acc, d) => acc + d.completed, 0);
  const totalPlannedHours = dailyStats.reduce((acc, d) => acc + d.plannedHours, 0);
  const totalCompletedHours = dailyStats.reduce((acc, d) => acc + d.completedHours, 0);
  const completionRate = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;

  return (
    <SchoolSidebar>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Suivez l'engagement de vos élèves sur la plateforme.
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cohorte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les cohortes</SelectItem>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="14">14 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Élèves</CardDescription>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredStudentCount}</div>
              <p className="text-sm text-muted-foreground">dans la sélection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Sessions</CardDescription>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <p className="text-sm text-muted-foreground">{totalCompleted} terminées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Heures planifiées</CardDescription>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(totalPlannedHours)}h</div>
              <p className="text-sm text-muted-foreground">
                {filteredStudentCount > 0 
                  ? `${(totalPlannedHours / filteredStudentCount).toFixed(1)}h/élève`
                  : '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Heures révisées</CardDescription>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(totalCompletedHours)}h</div>
              <p className="text-sm text-muted-foreground">
                {totalPlannedHours > 0 
                  ? `${Math.round((totalCompletedHours / totalPlannedHours) * 100)}% du prévu`
                  : '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Taux complétion</CardDescription>
                <Target className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completionRate}%</div>
              <p className="text-sm text-muted-foreground">sessions terminées</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sessions over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessions planifiées</CardTitle>
              <CardDescription>Évolution sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-[250px]" />
              ) : dailyStats.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: fr })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'EEEE dd MMMM', { locale: fr })}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'sessions' ? 'Planifiées' : 'Terminées'
                      ]}
                    />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" name="sessions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="hsl(145, 65%, 45%)" name="completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Hours over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Heures de révision</CardTitle>
              <CardDescription>Temps cumulé par jour</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-[250px]" />
              ) : dailyStats.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: fr })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'EEEE dd MMMM', { locale: fr })}
                      formatter={(value: number) => [`${value}h`, 'Heures']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Engagement insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
            <CardDescription>Analyse de l'engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Moyenne sessions/élève
                </div>
                <p className="text-2xl font-bold">
                  {filteredStudentCount > 0 
                    ? (totalSessions / filteredStudentCount).toFixed(1)
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">sur la période</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  Durée moyenne/session
                </div>
                <p className="text-2xl font-bold">
                  {totalSessions > 0 
                    ? `${(totalPlannedHours / totalSessions * 60).toFixed(0)} min`
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground">temps de révision</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Élèves actifs
                </div>
                <p className="text-2xl font-bold">
                  {stats?.activeStudents || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats?.totalStudents && stats.totalStudents > 0 
                    ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% du total`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolAnalytics;
