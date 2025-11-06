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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          ¡Bienvenido, {user?.user_metadata?.name || 'Usuario'}!
        </h1>
        <p className="mt-2 text-gray-400">
          Aquí está tu resumen de productividad de hoy
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Tareas Completadas
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {analytics?.today.completedTasks || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                de {analytics?.today.totalTasks || 0} totales
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-4 border border-green-500/30 shadow-lg shadow-green-500/20">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Pomodoros Hoy
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {analytics?.today.totalPomodoros || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {analytics?.today.interruptions || 0} interrupciones
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/30 p-4 border border-red-500/30 shadow-lg shadow-red-500/20">
              <Clock className="h-7 w-7 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Tiempo de Foco
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {formatDuration(analytics?.today.focusTime || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">minutos hoy</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 p-4 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <Zap className="h-7 w-7 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Productividad
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {analytics?.today.productivityScore || 0}%
              </p>
              <p className="mt-1 text-xs text-gray-500">score del día</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-4 border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <TrendingUp className="h-7 w-7 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {analytics?.insights.suggestions && analytics.insights.suggestions.length > 0 && (
        <div className="card-floating gradient-cyan border-cyan-500/30">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-yellow-400/30 to-orange-400/30 p-2 border border-yellow-400/30">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">
                💡 Insights de Productividad
              </h3>
              <ul className="space-y-2">
                {analytics.insights.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      <div className="card-floating">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Tareas Pendientes
          </h2>
          <Link
            href="/tasks"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Ver todas →
          </Link>
        </div>

        {pendingTasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No tienes tareas pendientes. ¡Crea tu primera tarea para comenzar!
          </p>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {task.category} • {task.priority}
                  </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
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

