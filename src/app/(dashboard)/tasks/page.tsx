'use client';

import { useState } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import type { TaskFilters as TaskFiltersType } from '@/types/task';

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersType>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Tareas</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus tareas y proyectos
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>

      <TaskList filters={filters} />
    </div>
  );
}

