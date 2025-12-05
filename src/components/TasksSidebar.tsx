import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Calendar, Clock, Pencil, CalendarPlus, 
  AlertCircle, CheckCircle2, ListTodo
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isBefore, isAfter, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Task, Subject } from '@/types/planning';
import { TaskDialog } from './TaskDialog';
import { PlanTaskDialog } from './PlanTaskDialog';

interface TasksSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  weekStart: Date;
  onTaskScheduled: () => void;
}

export const TasksSidebar = ({ open, onOpenChange, subjects, weekStart, onTaskScheduled }: TasksSidebarProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map subjects to tasks
      const tasksWithSubjects = (data || []).map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'todo' | 'in_progress' | 'done',
        subject: subjects.find(s => s.id === task.subject_id)
      }));

      setTasks(tasksWithSubjects);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTasks();
    }
  }, [open, user, subjects]);

  const handleToggleStatus = async (task: Task) => {
    if (!user) return;
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handlePlanTask = (task: Task) => {
    setSelectedTask(task);
    setPlanDialogOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  const handleTaskSaved = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleTaskPlanned = () => {
    setPlanDialogOpen(false);
    setSelectedTask(null);
    fetchTasks();
    onTaskScheduled();
  };

  // Group tasks
  const today = new Date();
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const overdueTasks = tasks.filter(t => 
    t.status !== 'done' && t.due_date && isBefore(parseISO(t.due_date), today)
  );

  const thisWeekTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.due_date) return false;
    const dueDate = parseISO(t.due_date);
    return !isBefore(dueDate, today) && !isAfter(dueDate, weekEnd);
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    if (!t.due_date) return true; // Tasks without due date go here
    const dueDate = parseISO(t.due_date);
    return isAfter(dueDate, weekEnd);
  });

  const completedTasks = tasks.filter(t => t.status === 'done');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-primary/10 text-primary';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Normale';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div 
      className={`p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.status === 'done'}
          onCheckedChange={() => handleToggleStatus(task)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {task.subject && (
              <span className="flex items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: task.subject.color }}
                />
                {task.subject.name}
              </span>
            )}
            {task.estimated_duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimated_duration_minutes >= 60 
                  ? `${Math.floor(task.estimated_duration_minutes / 60)}h${task.estimated_duration_minutes % 60 > 0 ? task.estimated_duration_minutes % 60 : ''}`
                  : `${task.estimated_duration_minutes}min`
                }
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </Badge>
          {task.due_date && (
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          {task.linked_event_id && (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          )}
        </div>
      </div>
      
      {task.status !== 'done' && (
        <div className="flex items-center gap-1 mt-2 ml-7">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={() => handleEditTask(task)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Modifier
          </Button>
          {!task.linked_event_id && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-primary"
              onClick={() => handlePlanTask(task)}
            >
              <CalendarPlus className="w-3 h-3 mr-1" />
              Planifier
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const TaskSection = ({ title, tasks, icon, badge }: { 
    title: string; 
    tasks: Task[]; 
    icon: React.ReactNode;
    badge?: { count: number; variant: 'destructive' | 'default' };
  }) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {badge && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.count}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Mes tâches
            </SheetTitle>
            <SheetDescription>
              Liste ce que tu dois réviser et planifie-le dans ton planning.
            </SheetDescription>
            <Button onClick={handleNewTask} className="mt-3">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle tâche
            </Button>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune tâche pour le moment</p>
                <p className="text-xs mt-1">Clique sur "Nouvelle tâche" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-6">
                <TaskSection 
                  title="En retard" 
                  tasks={overdueTasks}
                  icon={<AlertCircle className="w-4 h-4 text-destructive" />}
                  badge={{ count: overdueTasks.length, variant: 'destructive' }}
                />
                <TaskSection 
                  title="Cette semaine" 
                  tasks={thisWeekTasks}
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                />
                <TaskSection 
                  title="À venir" 
                  tasks={upcomingTasks}
                  icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                />
                <TaskSection 
                  title="Terminées" 
                  tasks={completedTasks}
                  icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
                />
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <TaskDialog 
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        subjects={subjects}
        onSaved={handleTaskSaved}
      />

      <PlanTaskDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        task={selectedTask}
        weekStart={weekStart}
        onPlanned={handleTaskPlanned}
      />
    </>
  );
};
