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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Visualiza tus patrones de productividad
        </p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Tiempo Total de Foco
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(analytics?.week.totalFocusTime || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">esta semana</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Tasa de Completación
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(analytics?.patterns.completionRate || 0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">de tareas completadas</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Promedio de Sesión
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(analytics?.patterns.averageSessionLength || 0)} min
          </p>
          <p className="text-xs text-gray-500 mt-1">por pomodoro</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Score Promedio
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(analytics?.week.averageProductivityScore || 0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">productividad semanal</p>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas Diarias
        </h2>
        {analytics?.week.dailyStats && analytics.week.dailyStats.length > 0 ? (
          <div className="space-y-3">
            {analytics.week.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (day.focusTime / analytics.week.maxDailyFocusTime) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {formatDuration(day.focusTime)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{day.totalPomodoros} 🍅</span>
                    <span>{day.completedTasks} ✓</span>
                    <span>{day.productivityScore}% score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No hay datos suficientes aún. ¡Comienza a trabajar con Pomodoros!
          </p>
        )}
      </div>

      {/* Top Categories */}
      {analytics?.week.topCategories && analytics.week.topCategories.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Categorías Más Trabajadas
          </h2>
          <div className="space-y-3">
            {analytics.week.topCategories.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {cat.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat.taskCount} tareas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
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
        <div className="rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 p-6 border border-primary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            🌟 Tus Horas Pico
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Eres más productivo a las:{' '}
            {analytics.patterns.peakProductivityHours.map((h) => `${h}:00`).join(', ')}
          </p>
          <p className="text-xs text-gray-600">
            Programa tus tareas más importantes en estos horarios para maximizar tu productividad.
          </p>
        </div>
      )}
    </div>
  );
}

