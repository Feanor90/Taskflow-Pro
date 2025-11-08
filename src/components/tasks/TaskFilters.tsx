'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
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
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar tareas..."
          className="input pl-11"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="label text-xs">
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
            className="input py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="work">Trabajo</option>
            <option value="personal">Personal</option>
            <option value="study">Estudio</option>
            <option value="health">Salud</option>
          </select>
        </div>

        <div>
          <label className="label text-xs">
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
            className="input py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <div>
          <label className="label text-xs">
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
            className="input py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
        </div>

        {(filters.category || filters.priority || filters.completed !== undefined) && (
          <button
            onClick={() => onChange({})}
            className="self-end rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

