'use client';

import { useState } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import type { TaskFilters as TaskFiltersType } from '@/types/task';

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersType>({});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Mis Tareas
        </h1>
        <p className="mt-2 text-gray-400">
          Gestiona tus tareas y proyectos
        </p>
      </div>

      <div className="card-floating">
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>

      <TaskList filters={filters} />
    </div>
  );
}

