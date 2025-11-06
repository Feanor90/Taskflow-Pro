'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { CreateTaskInput, Task } from '@/types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, loading }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    category: task?.category || 'personal',
    estimatedPomodoros: task?.estimated_pomodoros || 1,
    dueDate: task?.due_date || undefined,
    tags: task?.tags || [],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'personal',
        estimatedPomodoros: task.estimated_pomodoros || 1,
        dueDate: task.due_date || undefined,
        tags: task.tags || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        estimatedPomodoros: 1,
        dueDate: undefined,
        tags: [],
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit: any = {};
    
    if (task) {
      // Al actualizar, siempre enviar título si existe
      if (formData.title && formData.title.trim().length > 0) {
        dataToSubmit.title = formData.title.trim();
      }
    } else {
      // Al crear, título es requerido
      dataToSubmit.title = formData.title.trim();
    }
    
    if (formData.description !== undefined) {
      dataToSubmit.description = formData.description && formData.description.trim().length > 0 
        ? formData.description.trim() 
        : null;
    }
    
    if (formData.priority) {
      dataToSubmit.priority = formData.priority;
    }
    
    if (formData.category) {
      dataToSubmit.category = formData.category;
    }
    
    if (formData.estimatedPomodoros !== undefined) {
      dataToSubmit.estimatedPomodoros = formData.estimatedPomodoros;
    }
    
    if (formData.dueDate) {
      dataToSubmit.dueDate = formData.dueDate;
    } else if (task && task.due_date) {
      dataToSubmit.dueDate = null;
    }
    
    if (formData.tags !== undefined) {
      dataToSubmit.tags = formData.tags || [];
    }
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="label">
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="input"
          placeholder="Ej: Completar informe mensual"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Descripción
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="input resize-none"
          placeholder="Detalles adicionales sobre la tarea..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="label">
            Categoría
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as any,
              })
            }
            className="input"
          >
            <option value="work">Trabajo</option>
            <option value="personal">Personal</option>
            <option value="study">Estudio</option>
            <option value="health">Salud</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="label">
            Prioridad
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as any,
              })
            }
            className="input"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="estimatedPomodoros" className="label">
            Pomodoros Estimados
          </label>
          <input
            id="estimatedPomodoros"
            type="number"
            min="1"
            max="20"
            value={formData.estimatedPomodoros}
            onChange={(e) =>
              setFormData({
                ...formData,
                estimatedPomodoros: parseInt(e.target.value),
              })
            }
            className="input"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="label">
            Fecha Límite
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            value={
              formData.dueDate
                ? new Date(formData.dueDate).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                dueDate: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
            className="input"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
}

