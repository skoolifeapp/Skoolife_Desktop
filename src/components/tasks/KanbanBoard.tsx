import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { AddTaskDialog } from './AddTaskDialog';
import { Task } from './TaskCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  id: string;
  name: string;
  color: string;
}

// Helper to get Supabase REST API headers
const getHeaders = async () => {
  const session = await supabase.auth.getSession();
  return {
    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    'Authorization': `Bearer ${session.data.session?.access_token}`,
    'Content-Type': 'application/json',
  };
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Fetch tasks and subjects
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch subjects using Supabase client
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, color')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subjectsError) throw subjectsError;

      const subjectsList = subjectsData || [];
      setSubjects(subjectsList);

      // Fetch tasks using REST API to bypass TypeScript type issues
      const headers = await getHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?user_id=eq.${user.id}&order=position.asc`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawTasks = await response.json();
      
      // Map subjects to tasks
      const tasksWithSubjects = rawTasks.map((task: any) => ({
        ...task,
        subject: subjectsList.find(s => s.id === task.subject_id) || null,
      }));

      setTasks(tasksWithSubjects);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter tasks by status and subject
  const getFilteredTasks = (status: 'todo' | 'in_progress' | 'done') => {
    return tasks
      .filter((task) => task.status === status)
      .filter((task) => filterSubject === 'all' || task.subject_id === filterSubject)
      .sort((a, b) => a.position - b.position);
  };

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as 'todo' | 'in_progress' | 'done';
    const taskId = draggableId;

    // Optimistic update
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const taskIndex = updatedTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const task = { ...updatedTasks[taskIndex], status: newStatus };
      updatedTasks.splice(taskIndex, 1);

      // Calculate new position
      const tasksInColumn = updatedTasks
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.position - b.position);

      let newPosition: number;
      if (destination.index === 0) {
        newPosition = tasksInColumn.length > 0 ? tasksInColumn[0].position - 1 : 0;
      } else if (destination.index >= tasksInColumn.length) {
        newPosition = tasksInColumn.length > 0 ? tasksInColumn[tasksInColumn.length - 1].position + 1 : 0;
      } else {
        newPosition = (tasksInColumn[destination.index - 1].position + tasksInColumn[destination.index].position) / 2;
      }

      task.position = newPosition;
      updatedTasks.push(task);
      return updatedTasks;
    });

    // Persist to database
    try {
      const tasksInColumn = tasks
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);

      let newPosition: number;
      if (destination.index === 0) {
        newPosition = tasksInColumn.length > 0 ? tasksInColumn[0].position - 1 : 0;
      } else if (destination.index >= tasksInColumn.length) {
        newPosition = tasksInColumn.length > 0 ? tasksInColumn[tasksInColumn.length - 1].position + 1 : 0;
      } else {
        newPosition = (tasksInColumn[destination.index - 1].position + tasksInColumn[destination.index].position) / 2;
      }

      const headers = await getHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`,
        {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: newStatus, position: newPosition }),
        }
      );

      if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erreur lors de la mise à jour');
      fetchData(); // Revert on error
    }
  };

  // Handle task creation/update
  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (!user) return;

    try {
      const headers = await getHeaders();

      if (taskData.id) {
        // Update existing task
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskData.id}`,
          {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              subject_id: taskData.subject_id,
              due_date: taskData.due_date,
              status: taskData.status,
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to update task');
        toast.success('Tâche modifiée');
      } else {
        // Create new task
        const maxPosition = tasks
          .filter((t) => t.status === taskData.status)
          .reduce((max, t) => Math.max(max, t.position), 0);

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/tasks`,
          {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              user_id: user.id,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              subject_id: taskData.subject_id,
              due_date: taskData.due_date,
              status: taskData.status,
              position: maxPosition + 1,
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to create task');
        toast.success('Tâche créée');
      }

      fetchData();
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Tâche supprimée');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Handle add task button
  const handleAddTask = (status: 'todo' | 'in_progress' | 'done') => {
    setEditingTask(null);
    setInitialStatus(status);
    setDialogOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setInitialStatus(task.status);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les matières" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => handleAddTask('todo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KanbanColumn
            id="todo"
            title="À faire"
            tasks={getFilteredTasks('todo')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            id="in_progress"
            title="En cours"
            tasks={getFilteredTasks('in_progress')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            id="done"
            title="Terminé"
            tasks={getFilteredTasks('done')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </DragDropContext>

      {/* Add/Edit dialog */}
      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleTaskSubmit}
        initialStatus={initialStatus}
        subjects={subjects}
        editingTask={editingTask}
      />
    </div>
  );
}
