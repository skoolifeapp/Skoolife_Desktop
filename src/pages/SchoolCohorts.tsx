import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { 
  Plus, 
  Users,
  FolderTree,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

const SchoolCohorts = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    loading, 
    isSchoolAdmin, 
    school, 
    cohorts, 
    classes,
    members,
    createCohort,
    createClass 
  } = useSchoolAdmin();
  
  const [isCohortDialogOpen, setIsCohortDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: '',
    yearStart: new Date().getFullYear().toString(),
    yearEnd: (new Date().getFullYear() + 1).toString(),
  });
  const [newClass, setNewClass] = useState({
    name: '',
    cohortId: '',
  });

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

  const handleCreateCohort = async () => {
    if (!newCohort.name) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    setIsCreating(true);
    const { error } = await createCohort({
      name: newCohort.name,
      yearStart: parseInt(newCohort.yearStart),
      yearEnd: parseInt(newCohort.yearEnd),
    });

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Cohorte créée avec succès !');
      setIsCohortDialogOpen(false);
      setNewCohort({ name: '', yearStart: new Date().getFullYear().toString(), yearEnd: (new Date().getFullYear() + 1).toString() });
    }
    setIsCreating(false);
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.cohortId) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsCreating(true);
    const { error } = await createClass({
      name: newClass.name,
      cohortId: newClass.cohortId,
    });

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Classe créée avec succès !');
      setIsClassDialogOpen(false);
      setNewClass({ name: '', cohortId: '' });
    }
    setIsCreating(false);
  };

  const getStudentsCountForCohort = (cohortId: string) => {
    return members.filter(m => m.role === 'student' && m.cohort_id === cohortId).length;
  };

  const getStudentsCountForClass = (classId: string) => {
    return members.filter(m => m.role === 'student' && m.class_id === classId).length;
  };

  if (authLoading || loading) {
    return (
      <SchoolSidebar>
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </SchoolSidebar>
    );
  }

  if (!isSchoolAdmin) {
    return null;
  }

  return (
    <SchoolSidebar>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cohortes & Classes</h1>
            <p className="text-muted-foreground">
              Organisez vos élèves par promotion et par groupe.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle classe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une classe</DialogTitle>
                  <DialogDescription>
                    Une classe appartient à une cohorte et permet de regrouper les élèves.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Nom de la classe *</Label>
                    <Input
                      id="className"
                      placeholder="Ex: Groupe A"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cohorte *</Label>
                    <Select
                      value={newClass.cohortId}
                      onValueChange={(v) => setNewClass({ ...newClass, cohortId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une cohorte" />
                      </SelectTrigger>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.name} ({cohort.year_start}-{cohort.year_end})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateClass} disabled={isCreating}>
                    {isCreating ? 'Création...' : 'Créer la classe'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCohortDialogOpen} onOpenChange={setIsCohortDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvelle cohorte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une cohorte</DialogTitle>
                  <DialogDescription>
                    Une cohorte représente une promotion (ex: 2024-2025).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cohortName">Nom de la cohorte *</Label>
                    <Input
                      id="cohortName"
                      placeholder="Ex: Promo 2025"
                      value={newCohort.name}
                      onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearStart">Année de début</Label>
                      <Input
                        id="yearStart"
                        type="number"
                        value={newCohort.yearStart}
                        onChange={(e) => setNewCohort({ ...newCohort, yearStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearEnd">Année de fin</Label>
                      <Input
                        id="yearEnd"
                        type="number"
                        value={newCohort.yearEnd}
                        onChange={(e) => setNewCohort({ ...newCohort, yearEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCohortDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateCohort} disabled={isCreating}>
                    {isCreating ? 'Création...' : 'Créer la cohorte'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cohorts.length}</p>
                  <p className="text-sm text-muted-foreground">Cohortes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classes.length}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohorts list */}
        {cohorts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderTree className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">Aucune cohorte créée pour le moment.</p>
              <Button onClick={() => setIsCohortDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer votre première cohorte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                {cohorts.map((cohort) => {
                  const cohortClasses = classes.filter(c => c.cohort_id === cohort.id);
                  const studentCount = getStudentsCountForCohort(cohort.id);

                  return (
                    <AccordionItem key={cohort.id} value={cohort.id}>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FolderTree className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{cohort.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {cohort.year_start}-{cohort.year_end}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mr-4">
                            <Badge variant="secondary">
                              {cohortClasses.length} classe{cohortClasses.length > 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {studentCount} élève{studentCount > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        {cohortClasses.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-2">Aucune classe dans cette cohorte.</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setNewClass({ ...newClass, cohortId: cohort.id });
                                setIsClassDialogOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter une classe
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-3 pl-14">
                            {cohortClasses.map((cls) => {
                              const classStudentCount = getStudentsCountForClass(cls.id);
                              return (
                                <div 
                                  key={cls.id}
                                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => navigate(`/school/students?class=${cls.id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">{cls.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      <Users className="w-3 h-3 mr-1" />
                                      {classStudentCount}
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </SchoolSidebar>
  );
};

export default SchoolCohorts;
