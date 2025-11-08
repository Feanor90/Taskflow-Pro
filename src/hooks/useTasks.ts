'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types/task';
import { fetchJSON } from '@/lib/api';

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

      const data = await fetchJSON<{ data: Task[] }>(`/api/tasks?${params}`, {
        timeout: 30000, // 30 segundos
      });

      return data.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2, // Reintentar 2 veces en caso de error
  });
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const data = await fetchJSON<{ data: Task }>(`/api/tasks/${id}`, {
        timeout: 30000,
      });
      return data.data;
    },
    enabled: !!id,
    retry: 2,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      console.log('useCreateTask: Enviando datos:', data);
      
      try {
        const result = await fetchJSON<{ data: Task }>('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          timeout: 30000, // 30 segundos
        });

        console.log('useCreateTask: Tarea creada:', result);
        return result.data;
      } catch (error: any) {
        console.error('useCreateTask: Error:', error);
        throw error;
      }
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
    onError: (_err, _newTask, context) => {
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
      
      try {
        const result = await fetchJSON<{ data: Task }>(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          timeout: 30000,
        });

        console.log('useUpdateTask: Tarea actualizada:', result);
        return result.data;
      } catch (error: any) {
        console.error('useUpdateTask: Error:', error);
        throw error;
      }
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
    onError: (_err, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask);
      }
    },
    onSettled: (_data, _error, { id }) => {
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
      try {
        await fetchJSON(`/api/tasks/${id}`, {
          method: 'DELETE',
          timeout: 30000,
        });
        return id;
      } catch (error: any) {
        console.error('useDeleteTask: Error:', error);
        throw error;
      }
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

