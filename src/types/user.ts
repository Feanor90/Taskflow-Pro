import { PomodoroSettings } from './pomodoro';

export interface UserPreferences extends PomodoroSettings {
  theme: 'light' | 'dark' | 'auto';
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  timezone: string;
  preferences: UserPreferences;
  subscription: 'free' | 'pro' | 'teams';
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  desktopNotifications: true,
  soundAlerts: true,
  theme: 'auto',
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
};

