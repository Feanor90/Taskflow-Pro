import { Database } from './database';

export type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row'];
export type CreatePomodoroInput = Database['public']['Tables']['pomodoro_sessions']['Insert'];

export type SessionType = 'pomodoro' | 'short_break' | 'long_break';
export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface PomodoroSettings {
  pomodoroLength: number; // minutos
  shortBreakLength: number; // minutos
  longBreakLength: number; // minutos
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
}

export interface ActiveSession {
  id: string;
  taskId?: string;
  type: SessionType;
  duration: number; // minutos
  startTime: Date;
  endTime?: Date;
  timeRemaining: number; // segundos
  completed: boolean;
  interruptions: number;
  status: SessionStatus;
}

export interface SessionSummaryData {
  session: PomodoroSession;
  taskTitle?: string;
  nextAction?: {
    type: SessionType;
    duration: number;
  };
}

