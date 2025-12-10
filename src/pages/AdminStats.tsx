import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';

const AdminStats = () => {
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profilesRes, subjectsRes, sessionsRes, conversationsRes, eventsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at, is_onboarding_complete'),
        supabase.from('subjects').select('id, created_at'),
        supabase.from('revision_sessions').select('id, status, created_at'),
        supabase.from('conversations').select('id, status, created_at'),
        supabase.from('calendar_events').select('id, created_at'),
      ]);

      const profiles = profilesRes.data || [];
      const subjects = subjectsRes.data || [];
      const sessions = sessionsRes.data || [];
      const conversations = conversationsRes.data || [];
      const events = eventsRes.data || [];

      const now = new Date();
      const thisMonth = (date: string) => {
        const d = new Date(date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      };

      return {
        totalUsers: profiles.length,
        activeUsers: profiles.filter(p => p.is_onboarding_complete).length,
        newUsersThisMonth: profiles.filter(p => p.created_at && thisMonth(p.created_at)).length,
        totalSubjects: subjects.length,
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'done').length,
        totalConversations: conversations.length,
        openConversations: conversations.filter(c => c.status === 'open').length,
        totalEvents: events.length,
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
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const statCards = [
    { title: 'Total utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Utilisateurs actifs', value: stats?.activeUsers || 0, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Nouveaux ce mois', value: stats?.newUsersThisMonth || 0, icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Matières créées', value: stats?.totalSubjects || 0, icon: BookOpen, color: 'text-orange-500' },
    { title: 'Sessions de révision', value: stats?.totalSessions || 0, icon: Calendar, color: 'text-cyan-500' },
    { title: 'Sessions terminées', value: stats?.completedSessions || 0, icon: CheckCircle, color: 'text-emerald-500' },
    { title: 'Conversations support', value: stats?.totalConversations || 0, icon: MessageSquare, color: 'text-pink-500' },
    { title: 'Conversations ouvertes', value: stats?.openConversations || 0, icon: MessageSquare, color: 'text-yellow-500' },
    { title: 'Événements calendrier', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-indigo-500' },
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminStats;