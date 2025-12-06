import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays } from 'date-fns';

export interface ExamPreparationScore {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  examDate: string | null;
  daysUntilExam: number | null;
  targetMinutes: number;
  completedMinutes: number;
  futurePlannedMinutes: number;
  progressPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  remainingMinutes: number;
  difficultyLevel: string | null;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  exam_date: string | null;
  target_hours: number | null;
  difficulty_level: string | null;
}

interface RevisionSession {
  id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export const useExamPreparationScores = (userId: string | undefined) => {
  const [scores, setScores] = useState<ExamPreparationScore[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateSessionDuration = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const calculateRiskLevel = (
    progressRatio: number,
    daysUntilExam: number | null,
    remainingRatio: number
  ): 'low' | 'medium' | 'high' => {
    // Force high risk if exam is very close and lots of work remaining
    if (daysUntilExam !== null) {
      if (daysUntilExam <= 7 && remainingRatio > 0.5) {
        return 'high';
      }
      if (daysUntilExam <= 14 && remainingRatio > 0.3) {
        return progressRatio < 0.4 ? 'high' : 'medium';
      }
    }

    // Standard thresholds
    if (progressRatio >= 0.8) return 'low';
    if (progressRatio >= 0.4) return 'medium';
    return 'high';
  };

  const fetchScores = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch subjects with target hours
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, color, exam_date, target_hours, difficulty_level')
        .eq('user_id', userId);

      // Only consider subjects with target_hours defined
      const subjectsWithTargets = (subjectsData as Subject[] || []).filter(
        s => s.target_hours && s.target_hours > 0
      );

      if (subjectsWithTargets.length === 0) {
        setScores([]);
        setLoading(false);
        return;
      }

      // Fetch all revision sessions
      const { data: sessionsData } = await supabase
        .from('revision_sessions')
        .select('id, subject_id, date, start_time, end_time, status')
        .eq('user_id', userId);

      const sessions = sessionsData as RevisionSession[] || [];
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      const calculatedScores: ExamPreparationScore[] = subjectsWithTargets.map(subject => {
        const targetMinutes = (subject.target_hours || 0) * 60;
        
        // Get sessions for this subject
        const subjectSessions = sessions.filter(s => s.subject_id === subject.id);
        
        // Calculate completed minutes (past sessions with status 'done')
        const completedMinutes = subjectSessions
          .filter(s => s.date <= todayStr && s.status === 'done')
          .reduce((acc, s) => acc + calculateSessionDuration(s.start_time, s.end_time), 0);
        
        // Calculate future planned minutes (sessions after today, not yet done)
        const examDateStr = subject.exam_date;
        const futurePlannedMinutes = subjectSessions
          .filter(s => {
            if (s.date <= todayStr) return false;
            if (s.status === 'skipped') return false;
            // Only count sessions before exam date if defined
            if (examDateStr && s.date > examDateStr) return false;
            return true;
          })
          .reduce((acc, s) => acc + calculateSessionDuration(s.start_time, s.end_time), 0);

        // Calculate progress
        const progressRatio = targetMinutes > 0 ? completedMinutes / targetMinutes : 0;
        const progressPercentage = Math.min(Math.round(progressRatio * 100), 120);
        
        // Calculate remaining
        const remainingMinutes = Math.max(0, targetMinutes - completedMinutes - futurePlannedMinutes);
        const remainingRatio = targetMinutes > 0 ? remainingMinutes / targetMinutes : 0;
        
        // Calculate days until exam
        let daysUntilExam: number | null = null;
        if (subject.exam_date) {
          daysUntilExam = differenceInDays(parseISO(subject.exam_date), today);
        }

        // Calculate risk level
        const riskLevel = calculateRiskLevel(progressRatio, daysUntilExam, remainingRatio);

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color || '#FFC107',
          examDate: subject.exam_date,
          daysUntilExam,
          targetMinutes,
          completedMinutes,
          futurePlannedMinutes,
          progressPercentage,
          riskLevel,
          remainingMinutes,
          difficultyLevel: subject.difficulty_level,
        };
      });

      // Sort by risk level (high first), then by exam date
      calculatedScores.sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        // Then by exam proximity
        if (a.daysUntilExam !== null && b.daysUntilExam !== null) {
          return a.daysUntilExam - b.daysUntilExam;
        }
        if (a.daysUntilExam !== null) return -1;
        if (b.daysUntilExam !== null) return 1;
        return 0;
      });

      setScores(calculatedScores);
    } catch (err) {
      console.error('Error fetching exam preparation scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [userId]);

  return { scores, loading, refetch: fetchScores };
};
