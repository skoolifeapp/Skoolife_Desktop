import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, GraduationCap, 
  TrendingUp, AlertTriangle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface StudentMember {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  cohort_name: string | null;
  class_name: string | null;
  joined_at: string | null;
}

export default function ManageStudents() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin, isTeacher } = useSchoolRole();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isSchoolAdmin && !isTeacher) {
      navigate('/app');
    }
  }, [roleLoading, isSchoolAdmin, isTeacher, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchStudents();
    }
  }, [membership?.schoolId]);

  const fetchStudents = async () => {
    if (!membership?.schoolId) return;

    try {
      const { data, error } = await supabase
        .from('school_members')
        .select(`
          user_id,
          joined_at,
          cohort_id,
          class_id,
          profiles!inner(first_name, last_name, email),
          cohorts(name),
          classes(name)
        `)
        .eq('school_id', membership.schoolId)
        .eq('role', 'student')
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      setStudents(
        (data || []).map((s) => ({
          user_id: s.user_id,
          first_name: (s.profiles as any)?.first_name,
          last_name: (s.profiles as any)?.last_name,
          email: (s.profiles as any)?.email,
          cohort_name: (s.cohorts as any)?.name || null,
          class_name: (s.classes as any)?.name || null,
          joined_at: s.joined_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <InstitutionSidebar>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      </InstitutionSidebar>
    );
  }

  return (
    <InstitutionSidebar>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Étudiants</h1>
          <p className="text-muted-foreground">{students.length} étudiant(s) inscrit(s)</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des étudiants</CardTitle>
            <CardDescription>Tous les étudiants de votre établissement</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun étudiant inscrit</p>
                <p className="text-sm">Partagez un code d'accès pour inviter des étudiants</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.user_id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {(student.first_name?.[0] || student.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.first_name && student.last_name
                            ? `${student.first_name} ${student.last_name}`
                            : student.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {student.cohort_name && (
                        <p className="text-sm font-medium">{student.cohort_name}</p>
                      )}
                      {student.class_name && (
                        <p className="text-xs text-muted-foreground">{student.class_name}</p>
                      )}
                      {student.joined_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(student.joined_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
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
