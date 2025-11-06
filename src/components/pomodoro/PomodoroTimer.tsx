'use client';

import { useState } from 'react';
import { Play, Pause, Square, AlertCircle } from 'lucide-react';
import { usePomodoroEngine } from '@/hooks/usePomodoroEngine';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { SessionType } from '@/types/pomodoro';

export function PomodoroTimer() {
  const { session, startSession, pauseSession, resumeSession, completeSession, abandonSession, addInterruption } = usePomodoroEngine();
  const { data: tasks } = useTasks({ completed: false });
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');

  const handleStart = () => {
    try {
      startSession({
        taskId: selectedTaskId,
        type: sessionType,
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleStop = () => {
    if (confirm('¿Estás seguro de que quieres detener la sesión?')) {
      abandonSession();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    if (!session) return 'bg-gray-100';
    switch (session.type) {
      case 'pomodoro':
        return 'bg-pomodoro-work/10';
      case 'short_break':
        return 'bg-pomodoro-break/10';
      case 'long_break':
        return 'bg-pomodoro-longBreak/10';
    }
  };

  const getSessionTextColor = () => {
    if (!session) return 'text-gray-900';
    switch (session.type) {
      case 'pomodoro':
        return 'text-pomodoro-work';
      case 'short_break':
        return 'text-pomodoro-break';
      case 'long_break':
        return 'text-pomodoro-longBreak';
    }
  };

  const getSessionLabel = () => {
    if (!session) return 'Pomodoro';
    switch (session.type) {
      case 'pomodoro':
        return 'Sesión de Trabajo';
      case 'short_break':
        return 'Descanso Corto';
      case 'long_break':
        return 'Descanso Largo';
    }
  };

  return (
    <div className="space-y-8">
      {/* Timer Display */}
      <div className={cn('card-floating relative overflow-hidden p-16 text-center', getSessionColor())}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-50"></div>
        <div className="relative">
          <div className="mb-6">
            <h2 className={cn('text-2xl font-semibold', getSessionTextColor())}>
              {getSessionLabel()}
            </h2>
          </div>

          <div className={cn('text-9xl font-bold tabular-nums bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent', getSessionTextColor())}>
            {session ? formatTime(session.timeRemaining) : '25:00'}
          </div>

          {session && session.interruptions > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700 inline-flex">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <span>{session.interruptions} interrupción{session.interruptions > 1 ? 'es' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!session && (
          <Button onClick={handleStart} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Iniciar
          </Button>
        )}

        {session && session.status === 'running' && (
          <>
            <Button onClick={pauseSession} variant="secondary" size="lg">
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
            <Button onClick={handleStop} variant="danger" size="lg">
              <Square className="mr-2 h-5 w-5" />
              Detener
            </Button>
          </>
        )}

        {session && session.status === 'paused' && (
          <>
            <Button onClick={resumeSession} size="lg">
              <Play className="mr-2 h-5 w-5" />
              Reanudar
            </Button>
            <Button onClick={handleStop} variant="danger" size="lg">
              <Square className="mr-2 h-5 w-5" />
              Detener
            </Button>
          </>
        )}
      </div>

      {/* Session Type Selector */}
      {!session && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setSessionType('pomodoro')}
            className={cn(
              'rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200',
              sessionType === 'pomodoro'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
            )}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setSessionType('short_break')}
            className={cn(
              'rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200',
              sessionType === 'short_break'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
            )}
          >
            Descanso Corto
          </button>
          <button
            onClick={() => setSessionType('long_break')}
            className={cn(
              'rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200',
              sessionType === 'long_break'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
            )}
          >
            Descanso Largo
          </button>
        </div>
      )}

      {/* Task Selector */}
      {!session && sessionType === 'pomodoro' && (
        <div className="card-floating">
          <label className="label mb-3">
            Tarea Asociada (Opcional)
          </label>
          <select
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value || undefined)}
            className="input"
          >
            <option value="">Sin tarea específica</option>
            {tasks?.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Interruption Button */}
      {session && session.status === 'running' && (
        <div className="text-center">
          <button
            onClick={addInterruption}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            + Registrar Interrupción
          </button>
        </div>
      )}
    </div>
  );
}

