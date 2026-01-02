import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Edit2, AlignLeft } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  subject?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  high: 'bg-destructive/20 text-destructive',
};

const priorityLabels = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'done';
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={cn(
            "group p-3 mb-2 cursor-pointer active:cursor-grabbing transition-all",
            "hover:shadow-md border-border/50",
            snapshot.isDragging && "shadow-lg rotate-2 scale-105 cursor-grabbing",
            task.status === 'done' && "opacity-60"
          )}
        >
          <div className="space-y-2">
            {/* Header with title and actions */}
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                "font-medium text-sm leading-tight flex-1",
                task.status === 'done' && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Footer with metadata */}
            <div className="flex items-center flex-wrap gap-1.5">
              {/* Subject badge */}
              {task.subject && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{
                    borderColor: task.subject.color,
                    color: task.subject.color,
                  }}
                >
                  {task.subject.name}
                </Badge>
              )}

              {/* Priority badge */}
              <Badge className={cn("text-xs px-1.5 py-0", priorityColors[task.priority])}>
                {priorityLabels[task.priority]}
              </Badge>

              {/* Description indicator (Trello style) */}
              {task.description && (
                <div className="flex items-center text-muted-foreground" title={task.description}>
                  <AlignLeft className="h-3.5 w-3.5" />
                </div>
              )}

              {/* Due date (Trello style) */}
              {task.due_date && (
                <div className={cn(
                  "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                  isOverdue && "bg-destructive/20 text-destructive font-medium",
                  isDueToday && "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium",
                  !isOverdue && !isDueToday && "bg-muted text-muted-foreground"
                )}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {isToday(new Date(task.due_date))
                      ? "Aujourd'hui"
                      : format(new Date(task.due_date), 'd MMM', { locale: fr })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
}
