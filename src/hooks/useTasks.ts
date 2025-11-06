'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types/task';

// Fetch tasks
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.completed !== undefined)
        params.append('completed', filters.completed.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/tasks?${params}`);

      if (!response.ok) {
        throw new Error('Error al obtener tareas');
      }

      const data = await response.json();
      return data.data as Task[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`);

      if (!response.ok) {
        throw new Error('Error al obtener tarea');
      }

      const data = await response.json();
      return data.data as Task;
    },
    enabled: !!id,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      console.log('useCreateTask: Enviando datos:', data);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('useCreateTask: Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('useCreateTask: Error response:', error);
        throw new Error(error.error || 'Error al crear tarea');
      }

      const result = await response.json();
      console.log('useCreateTask: Tarea creada:', result);
      return result.data as Task;
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return [newTask];
        return [
          {
            id: `temp-${Date.now()}`,
            ...newTask,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed: false,
            actual_pomodoros: 0,
            user_id: 'temp-user-id',
          },
          ...old,
        ];
      });

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskInput;
    }) => {
      console.log('useUpdateTask: Enviando datos:', { id, data });
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('useUpdateTask: Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('useUpdateTask: Error response:', error);
        const errorMessage = error.details 
          ? `${error.error}: ${JSON.stringify(error.details)}`
          : error.error || 'Error al actualizar tarea';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('useUpdateTask: Tarea actualizada:', result);
      return result.data as Task;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['tasks', id] });

      // Snapshot the previous values
      const previousTasks = queryClient.getQueryData(['tasks']);
      const previousTask = queryClient.getQueryData(['tasks', id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return old.map((task: Task) =>
          task.id === id ? { ...task, ...data } : task
        );
      });

      queryClient.setQueryData(['tasks', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousTasks, previousTask };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar tarea');
      }

      return id;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return old.filter((task: Task) => task.id !== id);
      });

      return { previousTasks };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Toggle task completion
export function useToggleTask() {
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return updateTask.mutateAsync({ id, data: { completed } });
    },
  });
}

