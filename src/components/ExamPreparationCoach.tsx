import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Zap, Calendar, Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ExamPreparationScore } from '@/hooks/useExamPreparationScores';
import ReinforceSubjectDialog from './ReinforceSubjectDialog';

interface ExamPreparationCoachProps {
  scores: ExamPreparationScore[];
  onRefetch: () => void;
}

const ExamPreparationCoach = ({ scores, onRefetch }: ExamPreparationCoachProps) => {
  const [selectedSubject, setSelectedSubject] = useState<ExamPreparationScore | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (scores.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Coach de préparation aux examens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aucune matière avec objectif d'heures défini</p>
            <p className="text-sm mt-1">
              Va dans "Gérer mes matières" pour définir tes objectifs de révision
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confort
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            À surveiller
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Urgent
          </Badge>
        );
    }
  };

  const getProgressColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-orange-500';
      case 'high':
        return 'bg-red-500';
    }
  };

  const handleReinforce = (score: ExamPreparationScore) => {
    setSelectedSubject(score);
    setDialogOpen(true);
  };

  const handleDialogComplete = () => {
    onRefetch();
  };

  // Calculate overall stats
  const totalTarget = scores.reduce((acc, s) => acc + s.targetMinutes, 0);
  const totalCompleted = scores.reduce((acc, s) => acc + s.completedMinutes, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
  const urgentCount = scores.filter(s => s.riskLevel === 'high').length;

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Coach de préparation aux examens
            </CardTitle>
            {urgentCount > 0 && (
              <Badge variant="destructive">
                {urgentCount} matière{urgentCount > 1 ? 's' : ''} urgente{urgentCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall progress summary */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(totalCompleted / 60)}h / {Math.round(totalTarget / 60)}h
              </span>
            </div>
            <Progress value={Math.min(overallProgress, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallProgress}% de tes objectifs de révision atteints
            </p>
          </div>

          {/* Subject cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scores.map((score) => {
              const completedHours = Math.round((score.completedMinutes / 60) * 10) / 10;
              const targetHours = Math.round((score.targetMinutes / 60) * 10) / 10;
              const remainingHours = Math.round((score.remainingMinutes / 60) * 10) / 10;

              return (
                <div
                  key={score.subjectId}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    score.riskLevel === 'high'
                      ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
                      : score.riskLevel === 'medium'
                      ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10'
                      : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: score.subjectColor }}
                      />
                      <span className="font-medium text-sm">{score.subjectName}</span>
                    </div>
                    {getRiskBadge(score.riskLevel)}
                  </div>

                  {/* Exam date */}
                  {score.examDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(parseISO(score.examDate), 'd MMM yyyy', { locale: fr })}
                        {score.daysUntilExam !== null && (
                          <span className={`ml-1 font-medium ${
                            score.daysUntilExam <= 7 ? 'text-red-600' : 
                            score.daysUntilExam <= 14 ? 'text-orange-600' : ''
                          }`}>
                            (J-{score.daysUntilExam})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{score.progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(score.riskLevel)}`}
                        style={{ width: `${Math.min(score.progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    <span>
                      {completedHours}h révisées sur {targetHours}h
                    </span>
                  </div>

                  {/* Action button */}
                  {remainingHours > 0 && (
                    <Button
                      size="sm"
                      variant={score.riskLevel === 'high' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleReinforce(score)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Renforcer ({remainingHours}h restantes)
                    </Button>
                  )}

                  {remainingHours <= 0 && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Objectif atteint !</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ReinforceSubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={selectedSubject}
        onComplete={handleDialogComplete}
      />
    </>
  );
};

export default ExamPreparationCoach;
