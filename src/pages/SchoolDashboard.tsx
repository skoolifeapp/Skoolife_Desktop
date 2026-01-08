import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Key, 
  Plus,
  ArrowRight,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, isSchoolAdmin, school, members, stats, accessCodes, cohorts } = useSchoolAdmin();

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

  if (authLoading || loading) {
    return (
      <SchoolSidebar>
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </SchoolSidebar>
    );
  }

  if (!isSchoolAdmin) {
    return null;
  }

  const studentMembers = members.filter(m => m.role === 'student');
  const activeCodesCount = accessCodes.filter(c => c.is_active).length;
  const subscriptionEnd = school?.subscription_end_date 
    ? format(new Date(school.subscription_end_date), 'dd MMMM yyyy', { locale: fr })
    : null;

  return (
    <SchoolSidebar schoolName={school?.name}>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bienvenue, {school?.name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos élèves et suivez leur engagement sur Skoolife.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift cursor-pointer" onClick={() => navigate('/school/students')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total élèves</CardDescription>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.activeStudents || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Sessions planifiées</CardDescription>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalSessions || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.completedSessions || 0} terminées
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Heures révisées</CardDescription>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalHours || 0}h</div>
              <p className="text-sm text-muted-foreground">
                Moy. {stats?.avgSessionsPerStudent || 0} sessions/élève
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift cursor-pointer" onClick={() => navigate('/school/codes')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Codes actifs</CardDescription>
                <Key className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCodesCount}</div>
              <p className="text-sm text-muted-foreground">
                {accessCodes.reduce((acc, c) => acc + (c.current_uses || 0), 0)} utilisations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent students */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Derniers élèves inscrits</CardTitle>
                <CardDescription>Les 5 dernières inscriptions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/school/students')}>
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {studentMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun élève inscrit pour le moment.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => navigate('/school/codes')}
                  >
                    Créer un code d'accès
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentMembers.slice(0, 5).map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {member.profile?.first_name?.[0] || member.profile?.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.profile?.first_name && member.profile?.last_name
                              ? `${member.profile.first_name} ${member.profile.last_name}`
                              : member.profile?.email || 'Élève'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.cohort?.name} {member.class?.name ? `• ${member.class.name}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.profile?.is_onboarding_complete ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Actif
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            En attente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/school/codes')}
              >
                <Plus className="w-4 h-4" />
                Créer un code d'accès
              </Button>
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/school/cohorts')}
              >
                <Plus className="w-4 h-4" />
                Ajouter une cohorte
              </Button>
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/school/analytics')}
              >
                <TrendingUp className="w-4 h-4" />
                Voir les analytics
              </Button>
            </CardContent>

            {/* Subscription info */}
            {subscriptionEnd && (
              <CardContent className="pt-0">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Abonnement jusqu'au</p>
                  <p className="font-medium text-primary">{subscriptionEnd}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Cohorts overview */}
        {cohorts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Cohortes</CardTitle>
                <CardDescription>Répartition des élèves par promotion</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/school/cohorts')}>
                Gérer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cohorts.filter(c => c.is_active).map((cohort) => {
                  const cohortStudents = studentMembers.filter(m => m.cohort_id === cohort.id);
                  return (
                    <div 
                      key={cohort.id}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/school/cohorts?cohort=${cohort.id}`)}
                    >
                      <p className="font-medium">{cohort.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cohort.year_start}-{cohort.year_end}
                      </p>
                      <p className="text-2xl font-bold mt-2">{cohortStudents.length}</p>
                      <p className="text-xs text-muted-foreground">élèves</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SchoolSidebar>
  );
};

export default SchoolDashboard;
