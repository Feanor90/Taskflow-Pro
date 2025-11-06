import type { ActiveSession, SessionType, SessionStatus, PomodoroSettings } from '@/types/pomodoro';

type EventCallback = (data: any) => void;

export class PomodoroEngine {
  private session: ActiveSession | null = null;
  private interval: NodeJS.Timeout | null = null;
  private lastTick: number = 0;
  private drift: number = 0;
  private callbacks: Map<string, EventCallback[]> = new Map();
  private settings: PomodoroSettings;

  constructor(settings: PomodoroSettings) {
    this.settings = settings;

    // Manejar visibilidad de la página
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Advertir antes de cerrar si hay sesión activa
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }

  getSession(): ActiveSession | null {
    return this.session;
  }

  startSession(config: {
    taskId?: string;
    type: SessionType;
    customDuration?: number;
  }): ActiveSession {
    if (this.session?.status === 'running') {
      throw new Error('Ya hay una sesión en ejecución');
    }

    const duration = config.customDuration || this.getDefaultDuration(config.type);
    const startTime = new Date();

    this.session = {
      id: `session-${Date.now()}`,
      taskId: config.taskId,
      type: config.type,
      duration,
      startTime,
      timeRemaining: duration * 60, // Convertir a segundos
      completed: false,
      interruptions: 0,
      status: 'running',
    };

    this.lastTick = Date.now();
    this.drift = 0;
    this.startTimer();
    this.notifyCallbacks('session:started', this.session);

    return this.session;
  }

  pauseSession(): void {
    if (!this.session || this.session.status !== 'running') {
      return;
    }

    this.session.status = 'paused';

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.notifyCallbacks('session:paused', this.session);
  }

  resumeSession(): void {
    if (!this.session || this.session.status !== 'paused') {
      return;
    }

    this.session.status = 'running';
    this.lastTick = Date.now();
    this.startTimer();

    this.notifyCallbacks('session:resumed', this.session);
  }

  async completeSession(): Promise<void> {
    if (!this.session) return;

    this.session.status = 'completed';
    this.session.completed = true;
    this.session.endTime = new Date();

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.notifyCallbacks('session:completed', this.session);

    // Guardar en la base de datos
    try {
      await this.saveSessionToDatabase();
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }

    // Enviar notificación
    this.sendNotification();

    const completedSession = { ...this.session };
    this.session = null;

    return completedSession as any;
  }

  abandonSession(): void {
    if (!this.session) return;

    this.session.status = 'abandoned';

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.notifyCallbacks('session:abandoned', this.session);
    this.session = null;
  }

  addInterruption(): void {
    if (!this.session || this.session.status !== 'running') {
      return;
    }

    this.session.interruptions++;
    this.notifyCallbacks('session:interruption', {
      sessionId: this.session.id,
      interruptions: this.session.interruptions,
    });
  }

  private startTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.tick();
    }, 1000); // Actualizar cada segundo
  }

  private tick(): void {
    if (!this.session || this.session.status !== 'running') {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;

    // Calcular drift y compensar
    this.drift += elapsed - 1000;
    if (Math.abs(this.drift) > 100) {
      // Si el drift es mayor a 100ms, compensar
      const compensation = Math.round(this.drift / 1000);
      this.session.timeRemaining -= compensation;
      this.drift = 0;
    }

    this.session.timeRemaining = Math.max(0, this.session.timeRemaining - 1);

    this.notifyCallbacks('session:updated', this.session);

    // Verificar si la sesión ha terminado
    if (this.session.timeRemaining === 0) {
      this.completeSession();
    }
  }

  private async saveSessionToDatabase(): Promise<void> {
    if (!this.session) return;

    const response = await fetch('/api/pomodoro/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: this.session.taskId,
        type: this.session.type,
        startTime: this.session.startTime.toISOString(),
        endTime: this.session.endTime?.toISOString(),
        duration: this.session.duration,
        interruptions: this.session.interruptions,
        completed: this.session.completed,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al guardar sesión');
    }
  }

  private sendNotification(): void {
    if (!this.session) return;

    const isBreak = this.session.type !== 'pomodoro';

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        isBreak ? '¡Hora del descanso!' : '¡Pomodoro Completado!',
        {
          body: isBreak
            ? `Tiempo para un ${this.session.type === 'short_break' ? 'descanso corto' : 'descanso largo'}`
            : `¡Excelente trabajo! Has completado una sesión de ${this.session.duration} minutos.`,
          icon: '/icons/icon-192x192.png',
          tag: 'pomodoro-notification',
        }
      );
    }
  }

  private getDefaultDuration(type: SessionType): number {
    switch (type) {
      case 'pomodoro':
        return this.settings.pomodoroLength;
      case 'short_break':
        return this.settings.shortBreakLength;
      case 'long_break':
        return this.settings.longBreakLength;
      default:
        return 25;
    }
  }

  private handleVisibilityChange(): void {
    if (typeof document === 'undefined') return;

    if (document.hidden && this.session?.status === 'running') {
      // Página ya no está visible, continuar en background
      // El timer seguirá corriendo
    } else if (!document.hidden && this.session?.status === 'running') {
      // Página visible de nuevo, sincronizar tiempo
      const now = Date.now();
      const elapsed = Math.floor((now - this.lastTick) / 1000);
      if (this.session) {
        this.session.timeRemaining = Math.max(0, this.session.timeRemaining - elapsed);
        this.lastTick = now;
      }
    }
  }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.session?.status === 'running') {
      event.preventDefault();
      event.returnValue = 'Tienes una sesión Pomodoro activa. ¿Estás seguro de que quieres salir?';
    }
  }

  // Sistema de callbacks
  on(event: string, callback: EventCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Cleanup
  destroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    this.callbacks.clear();
    this.session = null;
  }
}

