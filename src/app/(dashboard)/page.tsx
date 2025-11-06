'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTasks } from '@/hooks/useTasks';
import { formatDuration } from '@/lib/utils';
import { CheckCircle2, Clock, Zap, TrendingUp, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalytics();
  const { data: tasks } = useTasks({ completed: false });

  const pendingTasks = tasks?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user?.user_metadata?.name || 'Usuario'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Aquí está tu resumen de productividad de hoy
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tareas Completadas
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.today.completedTasks || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                de {analytics?.today.totalTasks || 0} totales
              </p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pomodoros Hoy
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.today.totalPomodoros || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {analytics?.today.interruptions || 0} interrupciones
              </p>
            </div>
            <div className="rounded-full bg-pomodoro-work/10 p-3">
              <Clock className="h-6 w-6 text-pomodoro-work" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tiempo de Foco
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatDuration(analytics?.today.focusTime || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">minutos hoy</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Productividad
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.today.productivityScore || 0}%
              </p>
              <p className="mt-1 text-xs text-gray-500">score del día</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {analytics?.insights.suggestions && analytics.insights.suggestions.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Insights de Productividad
              </h3>
              <ul className="space-y-1">
                {analytics.insights.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tareas Pendientes
          </h2>
          <Link
            href="/tasks"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Ver todas →
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tienes tareas pendientes. ¡Crea tu primera tarea para comenzar!
          </p>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {task.category} • {task.priority}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {task.actual_pomodoros}/{task.estimated_pomodoros} 🍅
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

