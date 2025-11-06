'use client';

import { useState, useEffect, useRef } from 'react';
import { PomodoroEngine } from '@/lib/pomodoroEngine';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ActiveSession, SessionType } from '@/types/pomodoro';

export function usePomodoroEngine() {
  const { preferences } = useAuth();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const engineRef = useRef<PomodoroEngine | null>(null);

  useEffect(() => {
    // Crear engine con preferencias del usuario
    engineRef.current = new PomodoroEngine(preferences);

    // Configurar callbacks
    const handleSessionUpdate = (updatedSession: ActiveSession) => {
      setSession({ ...updatedSession });
    };

    engineRef.current.on('session:started', handleSessionUpdate);
    engineRef.current.on('session:updated', handleSessionUpdate);
    engineRef.current.on('session:completed', handleSessionUpdate);
    engineRef.current.on('session:paused', handleSessionUpdate);
    engineRef.current.on('session:resumed', handleSessionUpdate);
    engineRef.current.on('session:abandoned', () => setSession(null));

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [preferences]);

  const startSession = (config: {
    taskId?: string;
    type: SessionType;
    customDuration?: number;
  }) => {
    if (!engineRef.current) return;

    try {
      const newSession = engineRef.current.startSession(config);
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  const pauseSession = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseSession();
  };

  const resumeSession = () => {
    if (!engineRef.current) return;
    engineRef.current.resumeSession();
  };

  const completeSession = async () => {
    if (!engineRef.current) return;
    await engineRef.current.completeSession();
    setSession(null);
  };

  const abandonSession = () => {
    if (!engineRef.current) return;
    engineRef.current.abandonSession();
    setSession(null);
  };

  const addInterruption = () => {
    if (!engineRef.current) return;
    engineRef.current.addInterruption();
  };

  return {
    session,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
    addInterruption,
  };
}

