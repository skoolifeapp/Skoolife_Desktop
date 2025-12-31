import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, GraduationCap, BookOpen, 
  TrendingUp, AlertTriangle, Clock,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface StudentProgress {
  id: string;
  name: string;
  email: string;
  completedSessions: number;
  totalSessions: number;
  lastActive: string | null;
  status: 'on_track' | 'at_risk' | 'inactive';
}

interface TeacherStats {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  averageCompletion: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isTeacher, isSchoolAdmin } = useSchoolRole();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isTeacher && !isSchoolAdmin) {
      navigate('/app');
    }
  }, [roleLoading, isTeacher, isSchoolAdmin, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchTeacherData();
    }
  }, [membership?.schoolId]);

  const fetchTeacherData = async () => {
    if (!membership?.schoolId) return;

    try {
      // Fetch students in the same school
      const { data: studentMembers, error } = await supabase
        .from('school_members')
        .select(`
          user_id,
          profiles!inner(id, first_name, last_name, email)
        `)
        .eq('school_id', membership.schoolId)
        .eq('role', 'student')
        .eq('is_active', true);

      if (error) throw error;

      // For each student, get their session stats
      const studentsWithProgress: StudentProgress[] = [];
      
      for (const member of studentMembers || []) {
        const profile = member.profiles as any;
        
        // Get revision sessions for this student
        const { data: sessions } = await supabase
          .from('revision_sessions')
          .select('status, date')
          .eq('user_id', member.user_id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const totalSessions = sessions?.length || 0;
        const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
        const lastSession = sessions?.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
        const daysSinceActive = lastSession 
          ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        let status: 'on_track' | 'at_risk' | 'inactive' = 'on_track';
        if (daysSinceActive === null || daysSinceActive > 14) {
          status = 'inactive';
        } else if (completionRate < 0.5 || daysSinceActive > 7) {
          status = 'at_risk';
        }

        studentsWithProgress.push({
          id: member.user_id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          email: profile.email,
          completedSessions,
          totalSessions,
          lastActive: lastSession?.date || null,
          status,
        });
      }

      setStudents(studentsWithProgress);

      // Calculate stats
      setStats({
        totalStudents: studentsWithProgress.length,
        activeStudents: studentsWithProgress.filter(s => s.status !== 'inactive').length,
        atRiskStudents: studentsWithProgress.filter(s => s.status === 'at_risk').length,
        averageCompletion: studentsWithProgress.length > 0
          ? Math.round(
              studentsWithProgress.reduce((acc, s) => 
                acc + (s.totalSessions > 0 ? s.completedSessions / s.totalSessions : 0), 0
              ) / studentsWithProgress.length * 100
            )
          : 0,
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">En bonne voie</span>;
      case 'at_risk':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">À surveiller</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Inactif</span>;
    }
  };

  if (roleLoading || loading) {
    return (
      <InstitutionSidebar>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </InstitutionSidebar>
    );
  }

  return (
    <InstitutionSidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suivi des étudiants</h1>
          <p className="text-muted-foreground">
            Suivez la progression de vos étudiants
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total étudiants
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Étudiants actifs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                À surveiller
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.atRiskStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de complétion
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageCompletion || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Étudiants</CardTitle>
            <CardDescription>
              Progression des 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun étudiant dans votre établissement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students
                  .sort((a, b) => {
                    // Sort by status: at_risk first, then inactive, then on_track
                    const order = { at_risk: 0, inactive: 1, on_track: 2 };
                    return order[a.status] - order[b.status];
                  })
                  .map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {student.completedSessions}/{student.totalSessions} sessions
                          </p>
                          {student.lastActive && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Dernière activité: {new Date(student.lastActive).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(student.status)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstitutionSidebar>
  );
}
