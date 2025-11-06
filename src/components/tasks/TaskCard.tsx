'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, Circle, Trash2, Edit, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const categoryColors = {
  work: 'bg-category-work/10 text-category-work border-category-work/20',
  personal: 'bg-category-personal/10 text-category-personal border-category-personal/20',
  study: 'bg-category-study/10 text-category-study border-category-study/20',
  health: 'bg-category-health/10 text-category-health border-category-health/20',
};

const priorityColors = {
  low: 'text-gray-600',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

const categoryLabels = {
  work: 'Trabajo',
  personal: 'Personal',
  study: 'Estudio',
  health: 'Salud',
};

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'group rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md',
        task.completed ? 'border-gray-200 opacity-75' : 'border-gray-300'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 hover:text-primary-600" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-base font-medium',
              task.completed
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 font-medium',
                categoryColors[task.category]
              )}
            >
              {categoryLabels[task.category]}
            </span>

            <span className={cn('font-medium', priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </span>

            <div className="flex items-center gap-1 text-gray-500">
              <Timer className="h-3.5 w-3.5" />
              <span>
                {task.actual_pomodoros}/{task.estimated_pomodoros}
              </span>
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatRelativeTime(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isHovered && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

