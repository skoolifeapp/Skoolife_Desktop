import { useState, useEffect } from 'react';
import { useSchoolAuth } from '@/hooks/useSchoolAuth';
import { supabase } from '@/integrations/supabase/client';
import SchoolSidebar from '@/components/SchoolSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Loader2, UserPlus, Clock, 
  TrendingUp, TrendingDown, Minus, AlertTriangle 
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  level: string | null;
  revisionHours: number;
  completedSessions: number;
  totalSessions: number;
  lastActivity: string | null;
  isAtRisk: boolean;
}

const SchoolStudents = () => {
  const { loading, school } = useSchoolAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'at-risk'>('all');

  useEffect(() => {
    if (school) {
      fetchStudents();
    }
  }, [school]);

  const fetchStudents = async () => {
    if (!school) return;
    setLoadingStudents(true);

    try {
      // Get all students in the school
      const { data: members } = await supabase
        .from('school_members')
        .select('user_id')
        .eq('school_id', school.id)
        .eq('role', 'student')
        .eq('is_active', true);

      const studentIds = members?.map(m => m.user_id) || [];

      if (studentIds.length === 0) {
        setStudents([]);
        setLoadingStudents(false);
        return;
      }

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, level')
        .in('id', studentIds);

      // Get sessions this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: sessions } = await supabase
        .from('revision_sessions')
        .select('user_id, status, start_time, end_time')
        .in('user_id', studentIds)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      // Get last activity
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data: activities } = await supabase
        .from('user_activity')
        .select('user_id, created_at')
        .in('user_id', studentIds)
        .order('created_at', { ascending: false });

      // Build student data
      const studentsData: Student[] = (profiles || []).map(profile => {
        const studentSessions = sessions?.filter(s => s.user_id === profile.id) || [];
        const completedSessions = studentSessions.filter(s => s.status === 'completed').length;
        
        let revisionHours = 0;
        studentSessions.forEach(session => {
          const start = new Date(`2000-01-01T${session.start_time}`);
          const end = new Date(`2000-01-01T${session.end_time}`);
          revisionHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        });

        const lastActivity = activities?.find(a => a.user_id === profile.id)?.created_at || null;
        const isInactive = !lastActivity || new Date(lastActivity) < sevenDaysAgo;
        const isAtRisk = isInactive || revisionHours < 2;

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          level: profile.level,
          revisionHours: Math.round(revisionHours * 10) / 10,
          completedSessions,
          totalSessions: studentSessions.length,
          lastActivity,
          isAtRisk,
        };
      });

      // Sort by risk status, then by name
      studentsData.sort((a, b) => {
        if (a.isAtRisk !== b.isAtRisk) return a.isAtRisk ? -1 : 1;
        return (a.last_name || '').localeCompare(b.last_name || '');
      });

      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' ||
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'at-risk' && student.isAtRisk) ||
      (filter === 'active' && !student.isAtRisk);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Étudiants</h1>
            <p className="text-muted-foreground">
              {students.length} étudiants inscrits
            </p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'at-risk'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'À risque'}
              </Button>
            ))}
          </div>
        </div>

        {/* Students list */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun étudiant trouvé
              </div>
            ) : (
              <ScrollArea className="max-h-[calc(100vh-280px)]">
                <div className="divide-y divide-border">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {(student.first_name?.[0] || student.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {student.first_name} {student.last_name}
                              </p>
                              {student.isAtRisk && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Revision hours */}
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{student.revisionHours}h</span>
                            </div>
                            <p className="text-xs text-muted-foreground">cette semaine</p>
                          </div>

                          {/* Sessions */}
                          <div className="text-right">
                            <p className="font-medium">
                              {student.completedSessions}/{student.totalSessions}
                            </p>
                            <p className="text-xs text-muted-foreground">sessions</p>
                          </div>

                          {/* Status badge */}
                          <Badge variant={student.isAtRisk ? 'destructive' : 'secondary'}>
                            {student.isAtRisk ? 'À risque' : 'Actif'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolStudents;
