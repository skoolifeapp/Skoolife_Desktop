import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Plus, Calendar, Clock, Target, ChevronRight
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Subject } from '@/types/planning';
import SubjectDrawer from '@/components/SubjectDrawer';
import { SubjectsTutorialOverlay } from '@/components/SubjectsTutorialOverlay';
import SupportButton from '@/components/SupportButton';
import AppSidebar from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileRestrictedPage } from '@/components/MobileRestrictedPage';

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'terminated'>('all');
  const [showTutorial, setShowTutorial] = useState(false);
  const isMobile = useIsMobile();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Show restricted page on mobile
  if (isMobile) {
    return <MobileRestrictedPage pageName="Matières" />;
  }

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSubjects();
    checkTutorial();
  }, [user, navigate]);

  const checkTutorial = () => {
    if (!user) return;
    const tutorialSeen = localStorage.getItem(`subjects_tutorial_seen_${user.id}`);
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  };

  const fetchSubjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Sort: active first, then terminated, then by exam date
      const sorted = (data || []).sort((a, b) => {
        const statusA = a.status || 'active';
        const statusB = b.status || 'active';
        if (statusA === 'active' && statusB === 'archived') return -1;
        if (statusA === 'archived' && statusB === 'active') return 1;
        
        // Then by exam date
        if (a.exam_date && b.exam_date) {
          return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
        }
        if (a.exam_date) return -1;
        if (b.exam_date) return 1;
        
        // Then by priority
        return b.exam_weight - a.exam_weight;
      });

      setSubjects(sorted as Subject[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setDrawerOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedSubject(null);
  };

  const handleSubjectSaved = () => {
    fetchSubjects();
    handleDrawerClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Stats calculations
  const activeSubjects = subjects.filter(s => (s.status || 'active') === 'active');
  const terminatedSubjects = subjects.filter(s => s.status === 'archived');
  
  const totalTargetHours = activeSubjects.reduce((acc, s) => acc + (s.target_hours || 0), 0);
  
  const nextExam = activeSubjects
    .filter(s => s.exam_date && new Date(s.exam_date) >= new Date())
    .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())[0];

  const daysUntilNextExam = nextExam?.exam_date 
    ? differenceInDays(parseISO(nextExam.exam_date), new Date()) 
    : null;

  // Filter subjects based on selection
  const filteredSubjects = subjects.filter(s => {
    const status = s.status || 'active';
    if (filter === 'all') return true;
    if (filter === 'terminated') return status === 'archived';
    return status === filter;
  });

  const getPriorityLabel = (weight: number) => {
    if (weight <= 2) return 'Basse';
    if (weight <= 3) return 'Moyenne';
    return 'Haute';
  };

  const getPriorityColor = (weight: number) => {
    if (weight <= 2) return 'bg-muted text-muted-foreground';
    if (weight <= 3) return 'bg-primary/20 text-primary';
    return 'bg-destructive/20 text-destructive';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppSidebar>
      {/* Tutorial */}
      {showTutorial && (
        <SubjectsTutorialOverlay 
          onComplete={() => {
            setShowTutorial(false);
            if (user) {
              localStorage.setItem(`subjects_tutorial_seen_${user.id}`, 'true');
            }
          }}
        />
      )}

      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Mes matières & examens
                </h1>
                <p className="text-muted-foreground mt-1">
                  Ajoute tes matières, leurs dates d'examen et ton objectif d'heures de révision.
                </p>
              </div>
              <Button 
                onClick={handleAddSubject}
                className="gap-2 shrink-0"
                data-add-subject-button
              >
                <Plus className="w-4 h-4" />
                Ajouter une matière
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matières actives</p>
                    <p className="text-2xl font-bold text-foreground">{activeSubjects.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prochain examen</p>
                    {nextExam ? (
                      <p className="text-lg font-semibold text-foreground">
                        {nextExam.name} <span className="text-primary">J-{daysUntilNextExam}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun examen prévu</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Heures totales visées</p>
                    <p className="text-2xl font-bold text-foreground">{totalTargetHours}h</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                Toutes ({subjects.length})
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('active')}
              >
                Actives ({activeSubjects.length})
              </Button>
              <Button 
                variant={filter === 'terminated' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('terminated')}
              >
                Terminées ({terminatedSubjects.length})
              </Button>
            </div>

            {/* Subjects List - Desktop Table */}
            <div className="hidden md:block">
              {filteredSubjects.length > 0 ? (
                <Card className="bg-card border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Matière</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date d'examen</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Objectif</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Priorité</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Statut</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubjects.map((subject, index) => (
                          <tr 
                            key={subject.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => handleEditSubject(subject)}
                            data-subject-row={index === 0 ? 'first' : undefined}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full shrink-0" 
                                  style={{ backgroundColor: subject.color }}
                                />
                                <span className="font-medium text-foreground">{subject.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {subject.exam_date 
                                ? format(parseISO(subject.exam_date), 'dd/MM/yyyy', { locale: fr })
                                : <span className="text-muted-foreground/50">Non définie</span>
                              }
                            </td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {subject.target_hours ? `${subject.target_hours}h` : '-'}
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={getPriorityColor(subject.exam_weight)}>
                                {getPriorityLabel(subject.exam_weight)}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant={(subject.status || 'active') === 'active' ? 'default' : 'secondary'}>
                                {(subject.status || 'active') === 'active' ? 'Active' : 'Terminée'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <ChevronRight className="w-5 h-5 text-muted-foreground inline-block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune matière</h3>
                    <p className="text-muted-foreground mb-4">
                      {filter === 'terminated' 
                        ? "Tu n'as pas encore de matière terminée."
                        : "Commence par ajouter tes matières pour générer ton planning."}
                    </p>
                    {filter !== 'terminated' && (
                      <Button onClick={handleAddSubject} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter une matière
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Subjects List - Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <Card 
                    key={subject.id}
                    className="bg-card border-border cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => handleEditSubject(subject)}
                    data-subject-row={index === 0 ? 'first' : undefined}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full shrink-0" 
                            style={{ backgroundColor: subject.color }}
                          />
                          <div>
                            <h3 className="font-medium text-foreground">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {subject.exam_date 
                                ? format(parseISO(subject.exam_date), 'dd/MM/yyyy', { locale: fr })
                                : 'Date non définie'
                              }
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {subject.target_hours && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {subject.target_hours}h
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getPriorityColor(subject.exam_weight)}`}>
                          {getPriorityLabel(subject.exam_weight)}
                        </Badge>
                        <Badge variant={(subject.status || 'active') === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {(subject.status || 'active') === 'active' ? 'Active' : 'Terminée'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      {filter === 'terminated' 
                        ? "Aucune matière terminée"
                        : "Aucune matière"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

      {/* Subject Drawer */}
      <SubjectDrawer 
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        subject={selectedSubject}
        onSaved={handleSubjectSaved}
        onDeleted={handleSubjectSaved}
      />

      {/* Support Button */}
      <SupportButton />
    </AppSidebar>
  );
};

export default Subjects;
