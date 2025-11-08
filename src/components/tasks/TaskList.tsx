'use client';

import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '@/hooks/useTasks';
import type { Task, TaskFilters } from '@/types/task';

interface TaskListProps {
  filters?: TaskFilters;
}

export function TaskList({ filters }: TaskListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading, error } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  const handleCreate = async (data: any) => {
    try {
      console.log('Intentando crear tarea:', data);
      await createTask.mutateAsync(data);
      console.log('Tarea creada exitosamente');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al crear la tarea. Por favor, intenta de nuevo.';
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('408')) {
          errorMessage = 'La petición tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.';
        } else if (error.message.includes('401') || error.message.includes('No autorizado')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Error de comunicación con el servidor. Por favor, intenta de nuevo.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingTask) return;

    try {
      console.log('Intentando actualizar tarea:', { id: editingTask.id, data });
      
      const updateData: any = {};
      
      if (data.title !== undefined && data.title !== null) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.estimatedPomodoros !== undefined) updateData.estimatedPomodoros = data.estimatedPomodoros;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate || null;
      if (data.tags !== undefined) updateData.tags = data.tags || [];
      
      console.log('Datos de actualización preparados:', updateData);
      
      await updateTask.mutateAsync({ id: editingTask.id, data: updateData });
      console.log('Tarea actualizada exitosamente');
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al actualizar la tarea. Por favor, intenta de nuevo.';
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('408')) {
          errorMessage = 'La petición tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.';
        } else if (error.message.includes('401') || error.message.includes('No autorizado')) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Error de comunicación con el servidor. Por favor, intenta de nuevo.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      await deleteTask.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await toggleTask.mutateAsync({ id, completed });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Error al cargar tareas. Por favor, intenta de nuevo.
      </div>
    );
  }

  const pendingTasks = tasks?.filter((task) => !task.completed) || [];
  const completedTasks = tasks?.filter((task) => task.completed) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Tareas Pendientes ({pendingTasks.length})
          </h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            No tienes tareas pendientes. ¡Crea una nueva para comenzar!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">
            Completadas ({completedTasks.length})
          </h3>
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        size="lg"
      >
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          loading={createTask.isPending || updateTask.isPending}
        />
      </Modal>
    </div>
  );
}

