import { useState, useEffect } from 'react';
import { useSchoolAuth } from '@/hooks/useSchoolAuth';
import { supabase } from '@/integrations/supabase/client';
import SchoolSidebar from '@/components/SchoolSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, UserPlus, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Teacher {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  joined_at: string | null;
}

const SchoolTeachers = () => {
  const { loading, school, isAdmin } = useSchoolAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (school) {
      fetchTeachers();
    }
  }, [school]);

  const fetchTeachers = async () => {
    if (!school) return;
    setLoadingTeachers(true);

    try {
      // Get all teachers and admins in the school
      const { data: members } = await supabase
        .from('school_members')
        .select('user_id, role, joined_at')
        .eq('school_id', school.id)
        .in('role', ['admin_school', 'teacher'])
        .eq('is_active', true);

      if (!members || members.length === 0) {
        setTeachers([]);
        setLoadingTeachers(false);
        return;
      }

      const userIds = members.map(m => m.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      const teachersData: Teacher[] = members.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          id: member.user_id,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          email: profile?.email || null,
          role: member.role,
          joined_at: member.joined_at,
        };
      });

      // Sort admins first, then by name
      teachersData.sort((a, b) => {
        if (a.role !== b.role) return a.role === 'admin_school' ? -1 : 1;
        return (a.last_name || '').localeCompare(b.last_name || '');
      });

      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    return searchQuery === '' ||
      teacher.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
            <h1 className="text-2xl font-bold text-foreground">Enseignants</h1>
            <p className="text-muted-foreground">
              {teachers.length} membre{teachers.length > 1 ? 's' : ''} de l'équipe
            </p>
          </div>
          {isAdmin && (
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        {/* Teachers list */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loadingTeachers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun enseignant trouvé
              </div>
            ) : (
              <ScrollArea className="max-h-[calc(100vh-280px)]">
                <div className="divide-y divide-border">
                  {filteredTeachers.map((teacher) => (
                    <div 
                      key={teacher.id}
                      className="p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {(teacher.first_name?.[0] || teacher.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {teacher.first_name} {teacher.last_name}
                              </p>
                              {teacher.role === 'admin_school' && (
                                <Shield className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {teacher.joined_at && (
                            <p className="text-sm text-muted-foreground">
                              Depuis {format(new Date(teacher.joined_at), 'MMM yyyy', { locale: fr })}
                            </p>
                          )}
                          <Badge variant={teacher.role === 'admin_school' ? 'default' : 'secondary'}>
                            {teacher.role === 'admin_school' ? 'Admin' : 'Enseignant'}
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

export default SchoolTeachers;
