'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDuration } from '@/lib/utils';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="mt-2 text-gray-400">
          Visualiza tus patrones de productividad
        </p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 p-2 border border-cyan-500/30">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">
                Tiempo Total de Foco
              </h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatDuration(analytics?.week.totalFocusTime || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">esta semana</p>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-2 border border-green-500/30">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">
                Tasa de Completación
              </h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(analytics?.patterns.completionRate || 0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">de tareas completadas</p>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30 p-2 border border-orange-500/30">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">
                Promedio de Sesión
              </h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(analytics?.patterns.averageSessionLength || 0)} min
            </p>
            <p className="text-xs text-gray-500 mt-1">por pomodoro</p>
          </div>
        </div>

        <div className="card-floating relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-2 border border-purple-500/30">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">
                Score Promedio
              </h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(analytics?.week.averageProductivityScore || 0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">productividad semanal</p>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="card-floating">
        <h2 className="text-xl font-semibold text-white mb-6">
          Estadísticas Diarias
        </h2>
        {analytics?.week.dailyStats && analytics.week.dailyStats.length > 0 ? (
          <div className="space-y-4">
            {analytics.week.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div className="w-24 text-sm text-gray-300 font-medium">
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (day.focusTime / analytics.week.maxDailyFocusTime) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-20 text-right">
                      {formatDuration(day.focusTime)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span className="bg-gray-800/50 px-2 py-1 rounded-lg">{day.totalPomodoros} 🍅</span>
                    <span className="bg-gray-800/50 px-2 py-1 rounded-lg">{day.completedTasks} ✓</span>
                    <span className="bg-gray-800/50 px-2 py-1 rounded-lg">{day.productivityScore}% score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No hay datos suficientes aún. ¡Comienza a trabajar con Pomodoros!
          </p>
        )}
      </div>

      {/* Top Categories */}
      {analytics?.week.topCategories && analytics.week.topCategories.length > 0 && (
        <div className="card-floating">
          <h2 className="text-xl font-semibold text-white mb-6">
            Categorías Más Trabajadas
          </h2>
          <div className="space-y-3">
            {analytics.week.topCategories.map((cat, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-100 capitalize">
                      {cat.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat.taskCount} tareas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {Math.round(cat.completionRate)}%
                  </p>
                  <p className="text-xs text-gray-500">completadas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {analytics?.patterns.peakProductivityHours && analytics.patterns.peakProductivityHours.length > 0 && (
        <div className="card-floating gradient-cyan border-cyan-500/30">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">
            🌟 Tus Horas Pico
          </h2>
          <p className="text-sm text-gray-200 mb-3">
            Eres más productivo a las:{' '}
            <span className="font-semibold text-cyan-400">
              {analytics.patterns.peakProductivityHours.map((h) => `${h}:00`).join(', ')}
            </span>
          </p>
          <p className="text-xs text-gray-400">
            Programa tus tareas más importantes en estos horarios para maximizar tu productividad.
          </p>
        </div>
      )}
    </div>
  );
}

