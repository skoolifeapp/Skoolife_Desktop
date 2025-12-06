import { differenceInDays, parseISO } from 'date-fns';

interface Subject {
  id: string;
  exam_date: string | null;
  exam_weight: number;
  target_hours: number | null;
}

interface RevisionSession {
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface SubjectWithRisk extends Subject {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // Higher = more urgent
  remainingHours: number;
  completedHours: number;
}

/**
 * Calculate the risk level for subjects based on their preparation status
 * This is used by the planning generation to prioritize subjects that are behind schedule
 */
export const calculateSubjectsRisk = (
  subjects: Subject[],
  sessions: RevisionSession[],
  today: Date = new Date()
): SubjectWithRisk[] => {
  const todayStr = today.toISOString().split('T')[0];

  return subjects.map(subject => {
    const targetHours = subject.target_hours || 0;
    const targetMinutes = targetHours * 60;

    // Get sessions for this subject
    const subjectSessions = sessions.filter(s => s.subject_id === subject.id);

    // Calculate completed minutes (past sessions with status 'done')
    const completedMinutes = subjectSessions
      .filter(s => s.date <= todayStr && s.status === 'done')
      .reduce((acc, s) => {
        const [startH, startM] = s.start_time.split(':').map(Number);
        const [endH, endM] = s.end_time.split(':').map(Number);
        return acc + ((endH * 60 + endM) - (startH * 60 + startM));
      }, 0);

    // Calculate future planned minutes
    const futurePlannedMinutes = subjectSessions
      .filter(s => {
        if (s.date <= todayStr) return false;
        if (s.status === 'skipped') return false;
        if (subject.exam_date && s.date > subject.exam_date) return false;
        return true;
      })
      .reduce((acc, s) => {
        const [startH, startM] = s.start_time.split(':').map(Number);
        const [endH, endM] = s.end_time.split(':').map(Number);
        return acc + ((endH * 60 + endM) - (startH * 60 + startM));
      }, 0);

    const completedHours = completedMinutes / 60;
    const remainingMinutes = Math.max(0, targetMinutes - completedMinutes - futurePlannedMinutes);
    const remainingHours = remainingMinutes / 60;

    // Calculate progress ratio
    const progressRatio = targetMinutes > 0 ? completedMinutes / targetMinutes : 1;
    const remainingRatio = targetMinutes > 0 ? remainingMinutes / targetMinutes : 0;

    // Calculate days until exam
    let daysUntilExam: number | null = null;
    if (subject.exam_date) {
      daysUntilExam = differenceInDays(parseISO(subject.exam_date), today);
    }

    // Calculate risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (daysUntilExam !== null) {
      if (daysUntilExam <= 7 && remainingRatio > 0.5) {
        riskLevel = 'high';
      } else if (daysUntilExam <= 14 && remainingRatio > 0.3) {
        riskLevel = progressRatio < 0.4 ? 'high' : 'medium';
      } else if (progressRatio < 0.4) {
        riskLevel = 'high';
      } else if (progressRatio < 0.8) {
        riskLevel = 'medium';
      }
    } else {
      if (progressRatio < 0.4) {
        riskLevel = 'high';
      } else if (progressRatio < 0.8) {
        riskLevel = 'medium';
      }
    }

    // Calculate a numeric risk score for sorting (higher = more urgent)
    let riskScore = 0;
    
    // Base score from risk level
    if (riskLevel === 'high') riskScore += 1000;
    else if (riskLevel === 'medium') riskScore += 500;
    
    // Add urgency based on exam proximity
    if (daysUntilExam !== null && daysUntilExam > 0) {
      riskScore += Math.max(0, 100 - daysUntilExam);
    }
    
    // Add weight from exam_weight
    riskScore += subject.exam_weight * 20;
    
    // Add remaining hours factor
    riskScore += Math.min(remainingHours * 10, 100);

    return {
      ...subject,
      riskLevel,
      riskScore,
      remainingHours,
      completedHours,
    };
  });
};

/**
 * Sort subjects by risk priority for planning generation
 * High risk subjects are scheduled first
 */
export const sortSubjectsByRiskPriority = (subjectsWithRisk: SubjectWithRisk[]): SubjectWithRisk[] => {
  return [...subjectsWithRisk].sort((a, b) => {
    // Sort by risk score (descending - higher score = more urgent)
    return b.riskScore - a.riskScore;
  });
};
