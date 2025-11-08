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
  work: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  personal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  study: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  health: 'bg-green-500/20 text-green-400 border-green-500/30',
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
        'group card-floating relative overflow-hidden',
        task.completed ? 'opacity-60' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-sky/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.completed ? (
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-0.5">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          ) : (
            <Circle className="h-6 w-6 text-gray-500 hover:text-gold transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-base font-semibold transition-colors',
              task.completed
                ? 'text-gray-500 line-through'
                : 'text-gray-100 group-hover:text-white'
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1.5 text-sm text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                'rounded-full border px-3 py-1 font-medium backdrop-blur-sm',
                categoryColors[task.category],
                'bg-opacity-20'
              )}
            >
              {categoryLabels[task.category]}
            </span>

            <span className={cn('font-medium px-2 py-1 rounded-lg', 
              task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-gray-700/50 text-gray-400 border border-gray-600'
            )}>
              {priorityLabels[task.priority]}
            </span>

            <div className="flex items-center gap-1.5 text-gray-400 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <Timer className="h-3.5 w-3.5" />
              <span>
                {task.actual_pomodoros}/{task.estimated_pomodoros}
              </span>
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1.5 text-gray-400 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatRelativeTime(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isHovered && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gold/20 hover:text-gold border border-transparent hover:border-gold transition-all duration-300"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-xl p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

