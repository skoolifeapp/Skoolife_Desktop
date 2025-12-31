import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolAuth } from '@/hooks/useSchoolAuth';
import { supabase } from '@/integrations/supabase/client';
import SchoolSidebar from '@/components/SchoolSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Clock, TrendingUp, AlertTriangle, 
  CheckCircle, Loader2, XCircle, BookOpen,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  activationRate: number;
  avgRevisionHours: number;
  totalRevisionHours: number;
  studentsAtRisk: number;
  completedSessions: number;
  totalSessions: number;
  completionRate: number;
}

interface StudentAtRisk {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  lastActivity: string | null;
  revisionHours: number;
}

const SchoolDashboard = () => {
  const { loading, membership, error, school } = useSchoolAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentAtRisk[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (school) {
      fetchDashboardData();
    }
  }, [school]);

  const fetchDashboardData = async () => {
    if (!school) return;
    setLoadingStats(true);

    try {
      // Get all students in the school
      const { data: members } = await supabase
        .from('school_members')
        .select('user_id')
        .eq('school_id', school.id)
        .eq('role', 'student')
        .eq('is_active', true);

      const studentIds = members?.map(m => m.user_id) || [];
      const totalStudents = studentIds.length;

      if (totalStudents === 0) {
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          activationRate: 0,
          avgRevisionHours: 0,
          totalRevisionHours: 0,
          studentsAtRisk: 0,
          completedSessions: 0,
          totalSessions: 0,
          completionRate: 0,
        });
        setStudentsAtRisk([]);
        setLoadingStats(false);
        return;
      }

      // Get profiles for student names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', studentIds);

      // Get activity this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: activities } = await supabase
        .from('user_activity')
        .select('user_id, created_at')
        .in('user_id', studentIds)
        .gte('created_at', weekStart.toISOString());

      const activeStudentIds = new Set(activities?.map(a => a.user_id) || []);
      const activeStudents = activeStudentIds.size;

      // Get revision sessions this week
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: sessions } = await supabase
        .from('revision_sessions')
        .select('user_id, status, start_time, end_time, date')
        .in('user_id', studentIds)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;

      // Calculate revision hours per student
      const hoursPerStudent: Record<string, number> = {};
      sessions?.forEach(session => {
        const start = new Date(`2000-01-01T${session.start_time}`);
        const end = new Date(`2000-01-01T${session.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        hoursPerStudent[session.user_id] = (hoursPerStudent[session.user_id] || 0) + hours;
      });

      const totalRevisionHours = Object.values(hoursPerStudent).reduce((a, b) => a + b, 0);
      const avgRevisionHours = totalStudents > 0 ? totalRevisionHours / totalStudents : 0;

      // Identify students at risk (no activity in last 7 days AND < 2 hours of revision)
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data: recentActivity } = await supabase
        .from('user_activity')
        .select('user_id, created_at')
        .in('user_id', studentIds)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      const lastActivityMap: Record<string, string> = {};
      recentActivity?.forEach(a => {
        if (!lastActivityMap[a.user_id]) {
          lastActivityMap[a.user_id] = a.created_at;
        }
      });

      const atRiskStudents: StudentAtRisk[] = [];
      studentIds.forEach(studentId => {
        const hours = hoursPerStudent[studentId] || 0;
        const lastActivity = lastActivityMap[studentId] || null;
        const isInactive = !lastActivity || new Date(lastActivity) < sevenDaysAgo;
        
        if (isInactive || hours < 2) {
          const profile = profiles?.find(p => p.id === studentId);
          if (profile) {
            atRiskStudents.push({
              id: studentId,
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              email: profile.email || '',
              lastActivity,
              revisionHours: hours,
            });
          }
        }
      });

      setStats({
        totalStudents,
        activeStudents,
        activationRate: totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0,
        avgRevisionHours: Math.round(avgRevisionHours * 10) / 10,
        totalRevisionHours: Math.round(totalRevisionHours * 10) / 10,
        studentsAtRisk: atRiskStudents.length,
        completedSessions,
        totalSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      });

      setStudentsAtRisk(atRiskStudents.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error === 'no_access') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas accès au tableau de bord école.
            </p>
            <Button onClick={() => navigate('/app')} variant="outline">
              Retour à l'application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SchoolSidebar 
      schoolName={school?.name} 
      schoolLogo={school?.logo_url}
      primaryColor={school?.primary_color}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre établissement
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
            disabled={loadingStats}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {loadingStats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{stats.totalStudents}</Badge>
                  </div>
                  <p className="text-2xl font-bold">{stats.activeStudents}</p>
                  <p className="text-sm text-muted-foreground">Étudiants actifs cette semaine</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taux d'activation</span>
                      <span className="font-medium">{Math.round(stats.activationRate)}%</span>
                    </div>
                    <Progress value={stats.activationRate} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgRevisionHours}h</p>
                  <p className="text-sm text-muted-foreground">Moyenne de révision / étudiant</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: {stats.totalRevisionHours}h cette semaine
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stats.completedSessions}/{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions complétées</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taux de complétion</span>
                      <span className="font-medium">{Math.round(stats.completionRate)}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-0 shadow-sm ${stats.studentsAtRisk > 0 ? 'ring-2 ring-orange-500/20' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stats.studentsAtRisk > 0 ? 'bg-orange-500/10' : 'bg-green-500/10'
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${
                        stats.studentsAtRisk > 0 ? 'text-orange-600' : 'text-green-600'
                      }`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${
                    stats.studentsAtRisk > 0 ? 'text-orange-600' : ''
                  }`}>{stats.studentsAtRisk}</p>
                  <p className="text-sm text-muted-foreground">Étudiants à risque</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Inactifs ou &lt; 2h de révision
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Students at risk */}
            {studentsAtRisk.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Étudiants nécessitant une attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentsAtRisk.map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">
                            {student.revisionHours}h de révision
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.lastActivity 
                              ? `Dernière activité: ${format(new Date(student.lastActivity), 'dd MMM', { locale: fr })}`
                              : 'Jamais connecté'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {stats.studentsAtRisk > 5 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-3"
                      onClick={() => navigate('/school/students?filter=at-risk')}
                    >
                      Voir tous les {stats.studentsAtRisk} étudiants à risque
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {stats.totalStudents === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun étudiant inscrit</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter des étudiants à votre établissement.
                  </p>
                  <Button onClick={() => navigate('/school/students')}>
                    Ajouter des étudiants
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </SchoolSidebar>
  );
};

export default SchoolDashboard;
