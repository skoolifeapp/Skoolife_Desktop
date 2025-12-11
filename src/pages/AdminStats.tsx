import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, Calendar, MessageSquare, TrendingUp, CheckCircle, Radio, Target, Zap, BarChart3, UserCheck, Flame } from 'lucide-react';
import { useLiveUserCount } from '@/hooks/useLiveUserCount';
import { startOfWeek, subWeeks, endOfWeek, isWithinInterval, startOfDay, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminStats = () => {
  const queryClient = useQueryClient();
  const liveUsersCount = useLiveUserCount();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get admin user IDs to exclude them from stats
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminIds = adminRoles?.map(r => r.user_id) || [];

      const [profilesRes, subjectsRes, sessionsRes, conversationsRes, eventsRes, aiPlansRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at, is_onboarding_complete'),
        supabase.from('subjects').select('id, created_at'),
        supabase.from('revision_sessions').select('id, status, created_at'),
        supabase.from('conversations').select('id, status, created_at'),
        supabase.from('calendar_events').select('id, created_at'),
        supabase.from('ai_plans').select('id, user_id, created_at'),
        supabase.from('user_activity').select('id, user_id, source, created_at'),
      ]);

      // Filter out admin profiles
      const profiles = (profilesRes.data || []).filter(p => !adminIds.includes(p.id));
      const subjects = subjectsRes.data || [];
      const sessions = sessionsRes.data || [];
      const conversations = conversationsRes.data || [];
      const events = eventsRes.data || [];
      const aiPlans = (aiPlansRes.data || []).filter(p => !adminIds.includes(p.user_id));
      const activity = (activityRes.data || []).filter(a => !adminIds.includes(a.user_id));

      const now = new Date();
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = subWeeks(thisWeekStart, 1);
      const lastWeekEnd = subWeeks(thisWeekEnd, 1);

      const thisMonth = (date: string) => {
        const d = new Date(date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      };

      const isThisWeek = (date: string) => {
        return isWithinInterval(new Date(date), { start: thisWeekStart, end: thisWeekEnd });
      };

      const isLastWeek = (date: string) => {
        return isWithinInterval(new Date(date), { start: lastWeekStart, end: lastWeekEnd });
      };

      // Basic stats
      const totalUsers = profiles.length;
      const activeUsers = profiles.filter(p => p.is_onboarding_complete).length;
      const newUsersThisMonth = profiles.filter(p => p.created_at && thisMonth(p.created_at)).length;

      // 2. Activation produit
      const usersWithPlanning = new Set(aiPlans.map(p => p.user_id));
      const nbPlanningGeneratedFirstTime = usersWithPlanning.size;
      const firstWeekActivationRate = activeUsers > 0 ? (nbPlanningGeneratedFirstTime / activeUsers) * 100 : 0;

      // 3. Usage hebdo du planning
      const plansThisWeek = aiPlans.filter(p => p.created_at && isThisWeek(p.created_at));
      const nbPlanningGeneratedWeekly = plansThisWeek.length;
      const usersGeneratedPlanningWeekly = new Set(plansThisWeek.map(p => p.user_id)).size;
      
      // Active users this week (opened the app)
      const activityThisWeek = activity.filter(a => a.created_at && isThisWeek(a.created_at));
      const activeUsersThisWeek = new Set(activityThisWeek.map(a => a.user_id)).size;
      const planningUsageRateWeekly = activeUsersThisWeek > 0 ? (usersGeneratedPlanningWeekly / activeUsersThisWeek) * 100 : 0;

      // 4. Rétention
      // Count sessions per user this week
      const userSessionsThisWeek: Record<string, number> = {};
      activityThisWeek.forEach(a => {
        userSessionsThisWeek[a.user_id] = (userSessionsThisWeek[a.user_id] || 0) + 1;
      });
      
      const nbUsers2PlusSessionsWeekly = Object.values(userSessionsThisWeek).filter(count => count >= 2).length;
      const nbUsers3PlusSessionsWeekly = Object.values(userSessionsThisWeek).filter(count => count >= 3).length;
      const retention2SessionsRate = activeUsers > 0 ? (nbUsers2PlusSessionsWeekly / activeUsers) * 100 : 0;
      const retention3SessionsRate = activeUsers > 0 ? (nbUsers3PlusSessionsWeekly / activeUsers) * 100 : 0;

      // Organic retention (without email/notification)
      const organicActivityThisWeek = activityThisWeek.filter(a => a.source === 'organic');
      const nbUsersReturningWithoutNudge = new Set(organicActivityThisWeek.map(a => a.user_id)).size;
      
      const activityLastWeek = activity.filter(a => a.created_at && isLastWeek(a.created_at));
      const activeUsersLastWeek = new Set(activityLastWeek.map(a => a.user_id)).size;
      const organicRetentionRate = activeUsersLastWeek > 0 ? (nbUsersReturningWithoutNudge / activeUsersLastWeek) * 100 : 0;

      // 5. Core users (3 semaines consécutives avec onboarding + planning + 2+ sessions)
      const threeWeeksAgo = subWeeks(thisWeekStart, 2);
      const weeks = [
        { start: threeWeeksAgo, end: endOfWeek(threeWeeksAgo, { weekStartsOn: 1 }) },
        { start: subWeeks(thisWeekStart, 1), end: endOfWeek(subWeeks(thisWeekStart, 1), { weekStartsOn: 1 }) },
        { start: thisWeekStart, end: thisWeekEnd },
      ];

      const coreUserIds = profiles
        .filter(p => p.is_onboarding_complete)
        .map(p => p.id)
        .filter(userId => {
          // Check each week
          return weeks.every(week => {
            const weekPlans = aiPlans.filter(
              plan => plan.user_id === userId && 
              plan.created_at && 
              isWithinInterval(new Date(plan.created_at), week)
            );
            const weekActivity = activity.filter(
              a => a.user_id === userId && 
              a.created_at && 
              isWithinInterval(new Date(a.created_at), week)
            );
            return weekPlans.length >= 1 && weekActivity.length >= 2;
          });
        });

      const nbCoreUsers = coreUserIds.length;
      const coreUsersRate = activeUsers > 0 ? (nbCoreUsers / activeUsers) * 100 : 0;

      return {
        // Basic
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalSubjects: subjects.length,
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'done').length,
        totalConversations: conversations.length,
        openConversations: conversations.filter(c => c.status === 'open').length,
        totalEvents: events.length,
        // Activation
        nbPlanningGeneratedFirstTime,
        firstWeekActivationRate,
        // Usage hebdo
        nbPlanningGeneratedWeekly,
        usersGeneratedPlanningWeekly,
        activeUsersThisWeek,
        planningUsageRateWeekly,
        // Rétention
        nbUsers2PlusSessionsWeekly,
        nbUsers3PlusSessionsWeekly,
        retention2SessionsRate,
        retention3SessionsRate,
        nbUsersReturningWithoutNudge,
        organicRetentionRate,
        // Core users
        nbCoreUsers,
        coreUsersRate,
      };
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase.channel('stats-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-subjects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-sessions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'revision_sessions' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-ai-plans')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_plans' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
      supabase.channel('stats-activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_activity' }, () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, pulse }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    subtitle?: string;
    pulse?: boolean;
  }) => (
    <Card className={pulse ? 'ring-1 ring-red-500/30' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${color} ${pulse ? 'animate-pulse' : ''}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const RateCard = ({ title, rate, numerator, denominator, icon: Icon, color }: {
    title: string;
    rate: number;
    numerator: number;
    denominator: number;
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{rate.toFixed(1)}%</div>
        <p className="text-xs text-muted-foreground mt-1">{numerator} / {denominator}</p>
      </CardContent>
    </Card>
  );

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        ) : (
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="activation">Activation</TabsTrigger>
              <TabsTrigger value="usage">Usage Hebdo</TabsTrigger>
              <TabsTrigger value="retention">Rétention</TabsTrigger>
              <TabsTrigger value="core">Core Users</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Connectés en live" value={liveUsersCount} icon={Radio} color="text-red-500" pulse />
                <StatCard title="Total utilisateurs" value={stats?.totalUsers || 0} icon={Users} color="text-blue-500" />
                <StatCard title="Utilisateurs actifs" value={stats?.activeUsers || 0} icon={CheckCircle} color="text-green-500" subtitle="Onboarding complété" />
                <StatCard title="Nouveaux ce mois" value={stats?.newUsersThisMonth || 0} icon={TrendingUp} color="text-purple-500" />
                <StatCard title="Matières créées" value={stats?.totalSubjects || 0} icon={BookOpen} color="text-orange-500" />
                <StatCard title="Sessions de révision" value={stats?.totalSessions || 0} icon={Calendar} color="text-cyan-500" />
                <StatCard title="Sessions terminées" value={stats?.completedSessions || 0} icon={CheckCircle} color="text-emerald-500" />
                <StatCard title="Conversations support" value={stats?.totalConversations || 0} icon={MessageSquare} color="text-pink-500" />
                <StatCard title="Conversations ouvertes" value={stats?.openConversations || 0} icon={MessageSquare} color="text-yellow-500" />
              </div>
            </TabsContent>

            <TabsContent value="activation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Activation Produit
                  </CardTitle>
                  <CardDescription>Premier vrai usage de la fonctionnalité planning</CardDescription>
                </CardHeader>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard 
                  title="Ont généré un planning" 
                  value={stats?.nbPlanningGeneratedFirstTime || 0} 
                  icon={Zap} 
                  color="text-amber-500"
                  subtitle="Au moins une fois"
                />
                <RateCard 
                  title="Taux d'activation" 
                  rate={stats?.firstWeekActivationRate || 0}
                  numerator={stats?.nbPlanningGeneratedFirstTime || 0}
                  denominator={stats?.activeUsers || 0}
                  icon={Target}
                  color="text-green-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Usage Hebdomadaire
                  </CardTitle>
                  <CardDescription>Utilisation du planning cette semaine</CardDescription>
                </CardHeader>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Plannings générés" 
                  value={stats?.nbPlanningGeneratedWeekly || 0} 
                  icon={Calendar} 
                  color="text-blue-500"
                  subtitle="Cette semaine (total clics)"
                />
                <StatCard 
                  title="Utilisateurs distincts" 
                  value={stats?.usersGeneratedPlanningWeekly || 0} 
                  icon={Users} 
                  color="text-indigo-500"
                  subtitle="Ont généré un planning"
                />
                <StatCard 
                  title="Utilisateurs actifs" 
                  value={stats?.activeUsersThisWeek || 0} 
                  icon={UserCheck} 
                  color="text-teal-500"
                  subtitle="Ont ouvert l'app"
                />
                <RateCard 
                  title="Taux d'usage planning" 
                  rate={stats?.planningUsageRateWeekly || 0}
                  numerator={stats?.usersGeneratedPlanningWeekly || 0}
                  denominator={stats?.activeUsersThisWeek || 0}
                  icon={BarChart3}
                  color="text-purple-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Rétention
                  </CardTitle>
                  <CardDescription>Utilisateurs qui reviennent sans relance</CardDescription>
                </CardHeader>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                  title="≥ 2 sessions/semaine" 
                  value={stats?.nbUsers2PlusSessionsWeekly || 0} 
                  icon={Users} 
                  color="text-blue-500"
                />
                <StatCard 
                  title="≥ 3 sessions/semaine" 
                  value={stats?.nbUsers3PlusSessionsWeekly || 0} 
                  icon={Users} 
                  color="text-indigo-500"
                />
                <StatCard 
                  title="Retour organique" 
                  value={stats?.nbUsersReturningWithoutNudge || 0} 
                  icon={UserCheck} 
                  color="text-green-500"
                  subtitle="Sans email/notif"
                />
                <RateCard 
                  title="Taux rétention 2+ sessions" 
                  rate={stats?.retention2SessionsRate || 0}
                  numerator={stats?.nbUsers2PlusSessionsWeekly || 0}
                  denominator={stats?.activeUsers || 0}
                  icon={TrendingUp}
                  color="text-amber-500"
                />
                <RateCard 
                  title="Taux rétention 3+ sessions" 
                  rate={stats?.retention3SessionsRate || 0}
                  numerator={stats?.nbUsers3PlusSessionsWeekly || 0}
                  denominator={stats?.activeUsers || 0}
                  icon={TrendingUp}
                  color="text-orange-500"
                />
                <RateCard 
                  title="Taux rétention organique" 
                  rate={stats?.organicRetentionRate || 0}
                  numerator={stats?.nbUsersReturningWithoutNudge || 0}
                  denominator={stats?.activeUsersThisWeek || 0}
                  icon={UserCheck}
                  color="text-emerald-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="core" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    Core Users
                  </CardTitle>
                  <CardDescription>
                    Utilisateurs qui, pendant 3 semaines d'affilée : ont complété l'onboarding, 
                    génèrent ≥1 planning/semaine, et ont ≥2 sessions/semaine
                  </CardDescription>
                </CardHeader>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard 
                  title="Core Users" 
                  value={stats?.nbCoreUsers || 0} 
                  icon={Flame} 
                  color="text-orange-500"
                  subtitle="Utilisateurs engagés"
                />
                <RateCard 
                  title="Taux Core Users" 
                  rate={stats?.coreUsersRate || 0}
                  numerator={stats?.nbCoreUsers || 0}
                  denominator={stats?.activeUsers || 0}
                  icon={Flame}
                  color="text-red-500"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminStats;
