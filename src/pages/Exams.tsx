import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Loader2, Plus, GraduationCap, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Subject } from '@/types/planning';
import ManageSubjectsDialog from '@/components/ManageSubjectsDialog';

const Exams = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSubjects();
  }, [user, navigate]);

  const fetchSubjects = async () => {
    if (!user) return;

    try {
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      setSubjects(subjectsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  };

  const subjectsWithExams = subjects.filter(s => s.exam_date);
  const subjectsWithoutExams = subjects.filter(s => !s.exam_date);

  const getDaysUntilExam = (examDate: string) => {
    const days = differenceInDays(parseISO(examDate), new Date());
    if (days < 0) return 'Passé';
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Demain';
    return `Dans ${days} jours`;
  };

  const getUrgencyColor = (examDate: string) => {
    const days = differenceInDays(parseISO(examDate), new Date());
    if (days < 0) return 'text-muted-foreground';
    if (days <= 3) return 'text-destructive';
    if (days <= 7) return 'text-orange-500';
    if (days <= 14) return 'text-primary';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Mes examens
            </h1>
            <p className="text-muted-foreground">
              Visualise et gère tes dates d'examens
            </p>
          </div>
          <Button onClick={() => setSubjectsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Gérer mes matières
          </Button>
        </div>

        {/* Upcoming Exams */}
        {subjectsWithExams.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Examens à venir</h2>
            <div className="grid gap-4">
              {subjectsWithExams.map((subject) => (
                <Card key={subject.id} className="border-0 shadow-md overflow-hidden">
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <GraduationCap 
                            className="w-6 h-6" 
                            style={{ color: subject.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(subject.exam_date!), 'EEEE d MMMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${getUrgencyColor(subject.exam_date!)}`}>
                          {getDaysUntilExam(subject.exam_date!)}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Importance: {subject.exam_weight}/5
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subjects without exam dates */}
        {subjectsWithoutExams.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Matières sans date d'examen
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectsWithoutExams.map((subject) => (
                <Card key={subject.id} className="border-0 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {subjects.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune matière</h3>
              <p className="text-muted-foreground mb-4">
                Commence par ajouter tes matières et leurs dates d'examens
              </p>
              <Button onClick={() => setSubjectsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une matière
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ManageSubjectsDialog
        open={subjectsDialogOpen}
        onOpenChange={setSubjectsDialogOpen}
        subjects={subjects}
        onSubjectsChange={fetchSubjects}
      />
    </div>
  );
};

export default Exams;
