export interface Subject {
  id: string;
  name: string;
  color: string;
  exam_date: string | null;
  exam_weight: number;
  target_hours: number | null;
  difficulty_level: string | null;
}

export interface RevisionSession {
  id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  subject?: Subject;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  is_blocking: boolean;
  event_type?: string;
  source?: string;
  recurrence_group_id?: string | null;
}

export interface Profile {
  first_name: string;
  weekly_revision_hours: number;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  due_date: string | null;
  estimated_duration_minutes: number | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  linked_event_id: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}
