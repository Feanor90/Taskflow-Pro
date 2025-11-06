'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { TaskFilters as TaskFiltersType } from '@/types/task';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce search
    setTimeout(() => {
      onChange({ ...filters, search: value || undefined });
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar tareas..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value || undefined,
              } as any)
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Todas</option>
            <option value="work">Trabajo</option>
            <option value="personal">Personal</option>
            <option value="study">Estudio</option>
            <option value="health">Salud</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: e.target.value || undefined,
              } as any)
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={
              filters.completed === undefined
                ? ''
                : filters.completed
                ? 'completed'
                : 'pending'
            }
            onChange={(e) => {
              const value = e.target.value;
              onChange({
                ...filters,
                completed:
                  value === '' ? undefined : value === 'completed',
              });
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
        </div>

        {(filters.category || filters.priority || filters.completed !== undefined) && (
          <button
            onClick={() => onChange({})}
            className="self-end rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

