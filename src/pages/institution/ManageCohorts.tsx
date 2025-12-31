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
import { Plus, Edit2, Trash2, Users, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface Cohort {
  id: string;
  name: string;
  year_start: number;
  year_end: number;
  description: string | null;
  is_active: boolean;
  classes_count: number;
  students_count: number;
}

interface Class {
  id: string;
  cohort_id: string;
  name: string;
  description: string | null;
  students_count: number;
}

export default function ManageCohorts() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin } = useSchoolRole();
  const navigate = useNavigate();

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [cohortForm, setCohortForm] = useState({
    name: '',
    year_start: new Date().getFullYear(),
    year_end: new Date().getFullYear() + 1,
    description: '',
  });

  const [classForm, setClassForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!roleLoading && !isSchoolAdmin) {
      navigate('/app');
    }
  }, [roleLoading, isSchoolAdmin, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchCohorts();
    }
  }, [membership?.schoolId]);

  useEffect(() => {
    if (selectedCohort) {
      fetchClasses(selectedCohort.id);
    }
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    if (!membership?.schoolId) return;

    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .eq('school_id', membership.schoolId)
        .order('year_start', { ascending: false });

      if (error) throw error;

      // Get counts for each cohort
      const cohortsWithCounts = await Promise.all(
        (data || []).map(async (cohort) => {
          const { count: classesCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', cohort.id);

          const { count: studentsCount } = await supabase
            .from('school_members')
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', cohort.id)
            .eq('role', 'student');

          return {
            ...cohort,
            classes_count: classesCount || 0,
            students_count: studentsCount || 0,
          };
        })
      );

      setCohorts(cohortsWithCounts);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async (cohortId: string) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('cohort_id', cohortId)
        .order('name');

      if (error) throw error;

      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from('school_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id)
            .eq('role', 'student');

          return { ...cls, students_count: count || 0 };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSaveCohort = async () => {
    if (!membership?.schoolId || !cohortForm.name) return;

    try {
      if (editingCohort) {
        const { error } = await supabase
          .from('cohorts')
          .update({
            name: cohortForm.name,
            year_start: cohortForm.year_start,
            year_end: cohortForm.year_end,
            description: cohortForm.description || null,
          })
          .eq('id', editingCohort.id);

        if (error) throw error;
        toast.success('Promotion mise à jour');
      } else {
        const { error } = await supabase
          .from('cohorts')
          .insert({
            school_id: membership.schoolId,
            name: cohortForm.name,
            year_start: cohortForm.year_start,
            year_end: cohortForm.year_end,
            description: cohortForm.description || null,
          });

        if (error) throw error;
        toast.success('Promotion créée');
      }

      setDialogOpen(false);
      setEditingCohort(null);
      setCohortForm({ name: '', year_start: new Date().getFullYear(), year_end: new Date().getFullYear() + 1, description: '' });
      fetchCohorts();
    } catch (error) {
      console.error('Error saving cohort:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSaveClass = async () => {
    if (!membership?.schoolId || !selectedCohort || !classForm.name) return;

    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: classForm.name,
            description: classForm.description || null,
          })
          .eq('id', editingClass.id);

        if (error) throw error;
        toast.success('Classe mise à jour');
      } else {
        const { error } = await supabase
          .from('classes')
          .insert({
            school_id: membership.schoolId,
            cohort_id: selectedCohort.id,
            name: classForm.name,
            description: classForm.description || null,
          });

        if (error) throw error;
        toast.success('Classe créée');
      }

      setClassDialogOpen(false);
      setEditingClass(null);
      setClassForm({ name: '', description: '' });
      fetchClasses(selectedCohort.id);
      fetchCohorts();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteCohort = async (cohort: Cohort) => {
    if (!confirm(`Supprimer la promotion "${cohort.name}" ?`)) return;

    try {
      const { error } = await supabase
        .from('cohorts')
        .delete()
        .eq('id', cohort.id);

      if (error) throw error;
      toast.success('Promotion supprimée');
      if (selectedCohort?.id === cohort.id) {
        setSelectedCohort(null);
        setClasses([]);
      }
      fetchCohorts();
    } catch (error) {
      console.error('Error deleting cohort:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteClass = async (cls: Class) => {
    if (!confirm(`Supprimer la classe "${cls.name}" ?`)) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', cls.id);

      if (error) throw error;
      toast.success('Classe supprimée');
      if (selectedCohort) fetchClasses(selectedCohort.id);
      fetchCohorts();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditCohort = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setCohortForm({
      name: cohort.name,
      year_start: cohort.year_start,
      year_end: cohort.year_end,
      description: cohort.description || '',
    });
    setDialogOpen(true);
  };

  const openEditClass = (cls: Class) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      description: cls.description || '',
    });
    setClassDialogOpen(true);
  };

  if (roleLoading || loading) {
    return (
      <InstitutionSidebar>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </InstitutionSidebar>
    );
  }

  return (
    <InstitutionSidebar>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Promotions & Classes</h1>
            <p className="text-muted-foreground">Gérez la structure académique</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cohorts List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Promotions</CardTitle>
                  <CardDescription>{cohorts.length} promotion(s)</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setEditingCohort(null); setCohortForm({ name: '', year_start: new Date().getFullYear(), year_end: new Date().getFullYear() + 1, description: '' }); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCohort ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle>
                      <DialogDescription>Définissez les informations de la promotion</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Nom de la promotion</Label>
                        <Input
                          placeholder="Ex: Promotion 2024"
                          value={cohortForm.name}
                          onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Année début</Label>
                          <Input
                            type="number"
                            value={cohortForm.year_start}
                            onChange={(e) => setCohortForm({ ...cohortForm, year_start: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Année fin</Label>
                          <Input
                            type="number"
                            value={cohortForm.year_end}
                            onChange={(e) => setCohortForm({ ...cohortForm, year_end: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description (optionnel)</Label>
                        <Input
                          placeholder="Description..."
                          value={cohortForm.description}
                          onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleSaveCohort} className="w-full" disabled={!cohortForm.name}>
                        {editingCohort ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {cohorts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune promotion créée</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      onClick={() => setSelectedCohort(cohort)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCohort?.id === cohort.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{cohort.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cohort.year_start}-{cohort.year_end} • {cohort.classes_count} classes • {cohort.students_count} étudiants
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditCohort(cohort); }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCohort(cohort); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classes List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classes</CardTitle>
                  <CardDescription>
                    {selectedCohort ? `${selectedCohort.name}` : 'Sélectionnez une promotion'}
                  </CardDescription>
                </div>
                {selectedCohort && (
                  <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => { setEditingClass(null); setClassForm({ name: '', description: '' }); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingClass ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
                        <DialogDescription>Classe dans {selectedCohort.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Nom de la classe</Label>
                          <Input
                            placeholder="Ex: Groupe A"
                            value={classForm.name}
                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optionnel)</Label>
                          <Input
                            placeholder="Description..."
                            value={classForm.description}
                            onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleSaveClass} className="w-full" disabled={!classForm.name}>
                          {editingClass ? 'Mettre à jour' : 'Créer'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCohort ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une promotion</p>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune classe dans cette promotion</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">{cls.students_count} étudiants</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditClass(cls)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(cls)}>
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
      </div>
    </InstitutionSidebar>
  );
}
