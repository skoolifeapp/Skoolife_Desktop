import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { AddStudentsDialog } from '@/components/school/AddStudentsDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  CheckCircle2,
  Clock,
  Users,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SchoolStudents = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, isSchoolAdmin, school, members, cohorts, classes } = useSchoolAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

  const studentMembers = useMemo(() => {
    return members.filter(m => m.role === 'student');
  }, [members]);

  const filteredStudents = useMemo(() => {
    return studentMembers.filter(student => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        student.profile?.first_name?.toLowerCase().includes(searchLower) ||
        student.profile?.last_name?.toLowerCase().includes(searchLower) ||
        student.profile?.email?.toLowerCase().includes(searchLower);

      // Cohort filter
      const matchesCohort = selectedCohort === 'all' || student.cohort_id === selectedCohort;

      // Class filter
      const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;

      // Status filter
      const isActive = student.profile?.is_onboarding_complete;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'pending' && !isActive);

      return matchesSearch && matchesCohort && matchesClass && matchesStatus;
    });
  }, [studentMembers, searchQuery, selectedCohort, selectedClass, statusFilter]);

  const filteredClasses = useMemo(() => {
    if (selectedCohort === 'all') return classes;
    return classes.filter(c => c.cohort_id === selectedCohort);
  }, [classes, selectedCohort]);

  const exportToCSV = () => {
    const headers = ['Prénom', 'Nom', 'Email', 'Cohorte', 'Classe', 'Statut', 'Date inscription'];
    const rows = filteredStudents.map(student => [
      student.profile?.first_name || '',
      student.profile?.last_name || '',
      student.profile?.email || '',
      student.cohort?.name || '',
      student.class?.name || '',
      student.profile?.is_onboarding_complete ? 'Actif' : 'En attente',
      student.joined_at ? format(new Date(student.joined_at), 'dd/MM/yyyy') : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eleves_${school?.name || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
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

  const activeCount = studentMembers.filter(s => s.profile?.is_onboarding_complete).length;
  const pendingCount = studentMembers.filter(s => !s.profile?.is_onboarding_complete).length;

  return (
    <SchoolSidebar>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Élèves</h1>
            <p className="text-muted-foreground">
              {studentMembers.length} élèves inscrits • {activeCount} actifs
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Ajouter des élèves
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{studentMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un élève..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCohort} onValueChange={(v) => {
                setSelectedCohort(v);
                setSelectedClass('all');
              }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Cohorte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les cohortes</SelectItem>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {filteredClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students table */}
        <Card>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun élève trouvé</p>
                {searchQuery && (
                  <Button variant="link" onClick={() => setSearchQuery('')}>
                    Effacer la recherche
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Cohorte</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {student.profile?.first_name?.[0] || student.profile?.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.profile?.first_name && student.profile?.last_name
                                ? `${student.profile.first_name} ${student.profile.last_name}`
                                : 'Non renseigné'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {student.profile?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.cohort?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.class?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.profile?.is_onboarding_complete ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.joined_at 
                          ? format(new Date(student.joined_at), 'dd MMM yyyy', { locale: fr })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Students Dialog */}
        <AddStudentsDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          schoolId={school?.id || ''}
          cohorts={cohorts}
          classes={classes}
        />
      </div>
    </SchoolSidebar>
  );
};

export default SchoolStudents;
