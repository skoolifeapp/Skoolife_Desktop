import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  TrendingUp, AlertTriangle, Settings, Plus,
  Copy, Check, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalCohorts: number;
  totalClasses: number;
  engagementRate: number;
  atRiskStudents: number;
}

interface AccessCode {
  id: string;
  code: string;
  cohort_name: string | null;
  class_name: string | null;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
}

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin } = useSchoolRole();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isSchoolAdmin) {
      navigate('/app');
    }
  }, [roleLoading, isSchoolAdmin, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchDashboardData();
    }
  }, [membership?.schoolId]);

  const fetchDashboardData = async () => {
    if (!membership?.schoolId) return;

    try {
      // Fetch school members stats
      const { data: members, error: membersError } = await supabase
        .from('school_members')
        .select('role, is_active')
        .eq('school_id', membership.schoolId);

      if (membersError) throw membersError;

      const students = members?.filter(m => m.role === 'student') || [];
      const teachers = members?.filter(m => m.role === 'teacher') || [];

      // Fetch cohorts count
      const { count: cohortsCount } = await supabase
        .from('cohorts')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', membership.schoolId);

      // Fetch classes count
      const { count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', membership.schoolId);

      // Fetch access codes
      const { data: codes, error: codesError } = await supabase
        .from('access_codes')
        .select(`
          id,
          code,
          current_uses,
          max_uses,
          is_active,
          cohorts(name),
          classes(name)
        `)
        .eq('school_id', membership.schoolId)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      setAccessCodes(codes?.map(c => ({
        id: c.id,
        code: c.code,
        cohort_name: (c.cohorts as any)?.name || null,
        class_name: (c.classes as any)?.name || null,
        current_uses: c.current_uses,
        max_uses: c.max_uses,
        is_active: c.is_active,
      })) || []);

      setStats({
        totalStudents: students.length,
        activeStudents: students.filter(s => s.is_active).length,
        totalTeachers: teachers.length,
        totalCohorts: cohortsCount || 0,
        totalClasses: classesCount || 0,
        engagementRate: students.length > 0 
          ? Math.round((students.filter(s => s.is_active).length / students.length) * 100) 
          : 0,
        atRiskStudents: 0, // TODO: Calculate based on activity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const generateAccessCode = async () => {
    if (!membership?.schoolId) return;

    try {
      const code = `SK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from('access_codes')
        .insert({
          school_id: membership.schoolId,
          code,
          max_uses: 100,
          created_by: user?.id,
        });

      if (error) throw error;

      toast.success('Code d\'accès généré !');
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating access code:', error);
      toast.error('Erreur lors de la génération du code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copié !');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (roleLoading || loading) {
    return (
      <InstitutionSidebar>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {membership?.schoolName || 'Tableau de bord'}
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre établissement
            </p>
          </div>
          <Button onClick={() => navigate('/institution/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Étudiants
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeStudents || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enseignants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
              <p className="text-xs text-muted-foreground">
                membres du corps enseignant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux d'engagement
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.engagementRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                des étudiants actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Promotions
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCohorts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalClasses || 0} classes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="access-codes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="access-codes">Codes d'accès</TabsTrigger>
            <TabsTrigger value="cohorts">Promotions</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>

          <TabsContent value="access-codes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Codes d'accès étudiants</CardTitle>
                    <CardDescription>
                      Générez des codes pour que les étudiants rejoignent votre établissement
                    </CardDescription>
                  </div>
                  <Button onClick={generateAccessCode}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {accessCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun code d'accès créé</p>
                    <p className="text-sm">Générez un code pour inviter vos étudiants</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accessCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <code className="text-lg font-mono font-bold text-primary">
                            {code.code}
                          </code>
                          <div className="text-sm text-muted-foreground">
                            {code.cohort_name && <span>{code.cohort_name}</span>}
                            {code.class_name && <span> - {code.class_name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {code.current_uses}/{code.max_uses} utilisations
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(code.code)}
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Promotions & Classes</CardTitle>
                    <CardDescription>
                      Gérez la structure académique de votre établissement
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/institution/cohorts')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle promotion
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.totalCohorts === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune promotion créée</p>
                    <p className="text-sm">Créez votre première promotion pour organiser vos étudiants</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {stats?.totalCohorts} promotions, {stats?.totalClasses} classes
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertes pédagogiques</CardTitle>
                <CardDescription>
                  Étudiants nécessitant une attention particulière
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.atRiskStudents === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune alerte</p>
                    <p className="text-sm">Tous vos étudiants sont sur la bonne voie</p>
                  </div>
                ) : (
                  <p>{stats?.atRiskStudents} étudiants à risque</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InstitutionSidebar>
  );
}
