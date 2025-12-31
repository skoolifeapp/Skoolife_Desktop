import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface TeacherMember {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  joined_at: string | null;
}

export default function ManageTeachers() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin } = useSchoolRole();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<TeacherMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isSchoolAdmin) {
      navigate('/app');
    }
  }, [roleLoading, isSchoolAdmin, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchTeachers();
    }
  }, [membership?.schoolId]);

  const fetchTeachers = async () => {
    if (!membership?.schoolId) return;

    try {
      const { data, error } = await supabase
        .from('school_members')
        .select(`
          user_id,
          joined_at,
          profiles!inner(first_name, last_name, email)
        `)
        .eq('school_id', membership.schoolId)
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      setTeachers(
        (data || []).map((t) => ({
          user_id: t.user_id,
          first_name: (t.profiles as any)?.first_name,
          last_name: (t.profiles as any)?.last_name,
          email: (t.profiles as any)?.email,
          joined_at: t.joined_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeacher = async () => {
    if (!membership?.schoolId || !inviteEmail) return;

    setInviting(true);
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error('Utilisateur non trouvé. L\'enseignant doit d\'abord créer un compte.');
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('school_members')
        .select('id')
        .eq('school_id', membership.schoolId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (existing) {
        toast.error('Cet utilisateur est déjà membre de l\'établissement');
        return;
      }

      // Add as teacher
      const { error } = await supabase
        .from('school_members')
        .insert({
          school_id: membership.schoolId,
          user_id: profile.id,
          role: 'teacher',
          invited_by: user?.id,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Enseignant ajouté');
      setDialogOpen(false);
      setInviteEmail('');
      fetchTeachers();
    } catch (error: any) {
      console.error('Error inviting teacher:', error);
      toast.error(error.message || 'Erreur lors de l\'invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveTeacher = async (userId: string) => {
    if (!confirm('Retirer cet enseignant de l\'établissement ?')) return;

    try {
      const { error } = await supabase
        .from('school_members')
        .update({ is_active: false })
        .eq('school_id', membership?.schoolId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Enseignant retiré');
      fetchTeachers();
    } catch (error) {
      console.error('Error removing teacher:', error);
      toast.error('Erreur lors de la suppression');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Enseignants</h1>
            <p className="text-muted-foreground">{teachers.length} enseignant(s)</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un enseignant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un enseignant</DialogTitle>
                <DialogDescription>
                  L'enseignant doit avoir un compte Skoolife
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Email de l'enseignant</Label>
                  <Input
                    type="email"
                    placeholder="prof@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleInviteTeacher}
                  className="w-full"
                  disabled={inviting || !inviteEmail}
                >
                  {inviting ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Corps enseignant</CardTitle>
            <CardDescription>Enseignants ayant accès au suivi des étudiants</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun enseignant ajouté</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.user_id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {(teacher.first_name?.[0] || teacher.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {teacher.first_name && teacher.last_name
                            ? `${teacher.first_name} ${teacher.last_name}`
                            : teacher.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {teacher.joined_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(teacher.joined_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeacher(teacher.user_id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
