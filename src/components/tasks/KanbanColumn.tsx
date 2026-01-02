import { Droppable } from '@hello-pangea/dnd';
import { TaskCard, Task } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
  tasks: Task[];
  onAddTask: (status: 'todo' | 'in_progress' | 'done') => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const columnStyles = {
  todo: {
    bg: 'bg-muted/30',
    header: 'bg-muted',
    accent: 'border-l-muted-foreground',
  },
  in_progress: {
    bg: 'bg-primary/5',
    header: 'bg-primary/10',
    accent: 'border-l-primary',
  },
  done: {
    bg: 'bg-green-500/5',
    header: 'bg-green-500/10',
    accent: 'border-l-green-500',
  },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const styles = columnStyles[id];

  return (
    <div className={cn(
      "flex flex-col rounded-xl border-l-4 h-[calc(100vh-280px)] w-full min-w-[280px]",
      styles.bg,
      styles.accent
    )}>
      {/* Column header */}
      <div className={cn(
        "flex items-center justify-between p-3 rounded-tr-xl",
        styles.header
      )}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-background/50"
          onClick={() => onAddTask(id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 transition-colors overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
              snapshot.isDraggingOver && "bg-primary/10"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                Aucune tâche
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
