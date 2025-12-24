import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CreditCard, 
  Target, 
  TrendingUp, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Wifi,
  Mail
} from 'lucide-react';
import { format, differenceInHours, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserWithMetrics {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  school: string | null;
  created_at: string | null;
  is_onboarding_complete: boolean | null;
  status: 'trial' | 'active' | 'churned';
  trial_end_date: Date | null;
  is_trial_ending_soon: boolean;
  stripe_status: 'trialing' | 'active' | 'canceled' | 'no_subscription';
  product_id: string | null;
}

interface StripeUser {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  school: string | null;
  created_at: string | null;
  is_onboarding_complete: boolean | null;
  stripe_status: 'trialing' | 'active' | 'canceled' | 'no_subscription';
  subscription_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  product_id: string | null;
}

interface StripeStats {
  totalSignups: number;
  trialsStarted: number;
  trialsStartedRate: number;
  onboardingCompleted: number;
  onboardingCompletedRate: number;
  usersInTrial: number;
  convertedUsers: number;
  churnedUsers: number;
  conversionRate: number;
}

const AdminAnalytics = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Fetch Stripe data from edge function
  const { data: stripeData, isLoading: stripeLoading } = useQuery({
    queryKey: ['admin-stripe-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-stripe-stats');
      if (error) throw error;
      return data as { stats: StripeStats; users: StripeUser[] };
    },
  });

  // Fetch activation/retention data from DB
  const { data: dbData, isLoading: dbLoading } = useQuery({
    queryKey: ['admin-analytics-db'],
    queryFn: async () => {
      // Get admin user IDs to exclude
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminIds = adminRoles?.map(r => r.user_id) || [];

      const [aiPlansRes, activityRes] = await Promise.all([
        supabase.from('ai_plans').select('id, user_id, created_at'),
        supabase.from('user_activity').select('id, user_id, created_at'),
      ]);

      const aiPlans = (aiPlansRes.data || []).filter(p => !adminIds.includes(p.user_id));
      const activity = (activityRes.data || []).filter(a => !adminIds.includes(a.user_id));

      const now = new Date();
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Activation metrics
      const usersWithPlanning = new Set(aiPlans.map(p => p.user_id));
      const planningGeneratedCount = usersWithPlanning.size;

      // Retention metrics (WAU)
      const activityThisWeek = activity.filter(a => 
        a.created_at && isWithinInterval(new Date(a.created_at), { start: thisWeekStart, end: thisWeekEnd })
      );
      
      const userSessionsThisWeek: Record<string, number> = {};
      activityThisWeek.forEach(a => {
        userSessionsThisWeek[a.user_id] = (userSessionsThisWeek[a.user_id] || 0) + 1;
      });
      
      const wauCount = Object.values(userSessionsThisWeek).filter(count => count >= 2).length;

      return {
        planningGeneratedCount,
        wauCount,
      };
    },
  });

  const isLoading = stripeLoading || dbLoading;

  // Transform Stripe users to display format
  const usersWithMetrics: UserWithMetrics[] = (stripeData?.users || []).map((user) => {
    const now = new Date();
    
    // Determine trial end date from Stripe
    let trialEndDate: Date | null = null;
    if (user.trial_end) {
      trialEndDate = new Date(user.trial_end);
    } else if (user.subscription_end && user.stripe_status === 'trialing') {
      trialEndDate = new Date(user.subscription_end);
    }

    // Map Stripe status to display status
    let status: 'trial' | 'active' | 'churned' = 'churned';
    if (user.stripe_status === 'trialing') {
      status = 'trial';
    } else if (user.stripe_status === 'active') {
      status = 'active';
    } else if (user.stripe_status === 'canceled' || user.stripe_status === 'no_subscription') {
      status = 'churned';
    }

    const hoursUntilTrialEnd = trialEndDate ? differenceInHours(trialEndDate, now) : 0;
    const isTrialEndingSoon = status === 'trial' && hoursUntilTrialEnd > 0 && hoursUntilTrialEnd <= 24;

    return {
      id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      school: user.school,
      created_at: user.created_at,
      is_onboarding_complete: user.is_onboarding_complete,
      status,
      trial_end_date: trialEndDate,
      is_trial_ending_soon: isTrialEndingSoon,
      stripe_status: user.stripe_status,
      product_id: user.product_id,
    };
  }).sort((a, b) => {
    // Sort by trial ending soon first, then by created_at desc
    if (a.is_trial_ending_soon && !b.is_trial_ending_soon) return -1;
    if (!a.is_trial_ending_soon && b.is_trial_ending_soon) return 1;
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  // Calculate activation rate
  const activationRate = stripeData?.stats.onboardingCompleted && stripeData.stats.onboardingCompleted > 0
    ? ((dbData?.planningGeneratedCount || 0) / stripeData.stats.onboardingCompleted) * 100
    : 0;

  // Real-time subscriptions for DB data
  useEffect(() => {
    const handleUpdate = () => {
      setLastUpdated(new Date());
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-db'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stripe-stats'] });
    };

    const channel = supabase.channel('admin-analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_plans' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_activity' }, handleUpdate)
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredUsers = usersWithMetrics.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.school?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    if (!stripeData) return;
    
    const headers = ['Prénom', 'Nom', 'Email', 'École', 'Date inscription', 'Fin essai', 'Statut', 'Onboarding'];
    const rows = filteredUsers.map(user => [
      user.first_name || '',
      user.last_name || '',
      user.email || '',
      user.school || '',
      user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '',
      user.trial_end_date ? format(user.trial_end_date, 'dd/MM/yyyy') : '',
      user.status === 'trial' ? 'Essai' : user.status === 'active' ? 'Actif' : 'Churné',
      user.is_onboarding_complete ? 'Oui' : 'Non'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: 'trial' | 'active' | 'churned') => {
    switch (status) {
      case 'trial':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Essai</Badge>;
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Actif</Badge>;
      case 'churned':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Churné</Badge>;
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 50) return 'text-green-600';
    if (rate < 30) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Temps réel' : 'Déconnecté'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Mis à jour : {format(lastUpdated, 'HH:mm:ss')}
              </span>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tunnel d'Acquisition */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tunnel d'Acquisition
                </CardTitle>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{stripeData?.stats.totalSignups ?? 0}</div>
                <p className="text-xs text-muted-foreground">Total Inscrits</p>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-blue-600">
                    {stripeData?.stats.trialsStartedRate.toFixed(1) ?? 0}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({stripeData?.stats.trialsStarted ?? 0})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Essais Démarrés</p>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">
                    {stripeData?.stats.onboardingCompletedRate.toFixed(1) ?? 0}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({stripeData?.stats.onboardingCompleted ?? 0})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Onboarding Complété</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Monétisation */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monétisation (Essai 7 jours)
                </CardTitle>
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{stripeData?.stats.usersInTrial ?? 0}</div>
                <p className="text-xs text-muted-foreground">Essais en cours</p>
              </div>
              <div className="border-t pt-2">
                <div className="text-xl font-bold">{stripeData?.stats.convertedUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">Convertis en Payant</p>
              </div>
              <div className="border-t pt-2">
                <div className={`text-2xl font-bold ${getConversionRateColor(stripeData?.stats.conversionRate ?? 0)}`}>
                  {stripeData?.stats.conversionRate.toFixed(1) ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">Taux de Conversion</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Activation Produit */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Activation Produit
                </CardTitle>
                <Target className="w-5 h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-3xl font-bold">{activationRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Planning Généré ({dbData?.planningGeneratedCount ?? 0} / {stripeData?.stats.onboardingCompleted ?? 0})
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Objectif : 80%</span>
                  <span className={activationRate >= 80 ? 'text-green-600' : 'text-amber-600'}>
                    {activationRate >= 80 ? '✓ Atteint' : 'En cours'}
                  </span>
                </div>
                <Progress value={activationRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Rétention Hebdo */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rétention Hebdo
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-4xl font-bold">{dbData?.wauCount ?? 0}</div>
                <p className="text-xs text-muted-foreground">WAU (Weekly Active Users)</p>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                Utilisateurs avec ≥2 sessions cette semaine
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Liste des Utilisateurs</h2>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Chargement...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>École</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead>Fin Période d'Essai</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id}
                          className={user.is_trial_ending_soon ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {user.is_trial_ending_soon && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                              {user.first_name || user.last_name
                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.school || '—'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell>
                            {user.is_onboarding_complete ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            {user.trial_end_date ? (
                              <span className={user.is_trial_ending_soon ? 'font-medium text-orange-600' : 'text-muted-foreground'}>
                                {format(user.trial_end_date, 'dd MMM yyyy', { locale: fr })}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            {user.is_trial_ending_soon && user.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                                onClick={() => window.open(`mailto:${user.email}?subject=Votre essai Skoolife se termine bientôt`, '_blank')}
                              >
                                <Mail className="w-3 h-3" />
                                Relancer
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminAnalytics;
