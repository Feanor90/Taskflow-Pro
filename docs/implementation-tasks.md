# TaskFlow Pro - Implementation Tasks

## 📋 **Implementation Overview**

**Total Tasks:** 22
**Estimated Duration:** 2 semanas (10-14 días)
**Team Size:** 1-2 desarrolladores full-stack
**Difficulty Level:** 🟢 SIMPLE → 🟡 MEDIUM
**Stack:** Next.js 14 + Supabase + Tailwind CSS + PWA ✅ VALIDADO

---

## 🎯 **Phase 1: Foundation & Setup** (Días 1-3)

### Task 1.1: Project Initialization & PWA Setup
**Asignado a:** Lead Developer
**Tiempo estimado:** 6 horas
**Dependencias:** Ninguna
**Prioridad:** Alta

#### Descripción
Inicializar proyecto Next.js 14 con App Router, TypeScript, Tailwind CSS, y configuración PWA completa para TaskFlow Pro.

#### Criterios de Aceptación
- [ ] Next.js 14 creado con App Router configurado
- [ ] TypeScript configurado en modo estricto
- [ ] Tailwind CSS con paleta focus-friendly integrada
- [ ] PWA configurado con next-pwa
- [ ] Service worker básico implementado
- [ ] ESLint, Prettier, y Husky configurados
- [ ] Git repository con estructura apropiada

#### Implementación Técnica
```bash
# Inicializar proyecto
npx create-next-app@latest taskflow-pro --typescript --tailwind --eslint --app
cd taskflow-pro

# Dependencias principales
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/realtime-js
npm install @tanstack/react-query zustand zod framer-motion
npm install date-fns lucide-react

# PWA y dependencias de desarrollo
npm install next-pwa workbox-webpack
npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom

# Configurar PWA en next.config.js
# Configurar service worker para offline functionality
```

#### Criterios de Validación
- [ ] Servidor de desarrollo corre en http://localhost:3000
- [ ] Compilación TypeScript sin errores
- [ ] Classes de Tailwind funcionando
- [ ] PWA manifest generado correctamente
- [ ] Service worker registrado en el browser

---

### Task 1.2: Supabase Advanced Setup
**Asignado a:** Lead Developer
**Tiempo estimado:** 4 horas
**Dependencias:** Task 1.1
**Prioridad:** Alta

#### Descripción
Configurar proyecto Supabase con schema avanzado para TaskFlow Pro, incluyendo soporte para Pomodoro sessions, analytics, y vector embeddings.

#### Criterios de Aceptación
- [ ] Proyecto Supabase creado y configurado
- [ ] Database schema completo implementado (users, tasks, pomodoro_sessions, productivity_metrics)
- [ ] pgVector extension configurada para embeddings
- [ ] Realtime subscriptions configuradas
- [ ] Row Level Security (RLS) configurado
- [ ] Authentication providers (Google, GitHub, Email)

#### Implementación Técnica
```sql
-- Schema completo para TaskFlow Pro
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla users (extendida de Supabase Auth)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS 
  avatar TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  subscription_type VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW();

-- Tabla tasks con soporte Pomodoro
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  category VARCHAR(20) DEFAULT 'personal',
  estimated_pomodoros INTEGER DEFAULT 1,
  actual_pomodoros INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(384) -- Para semantic search
);

-- Tabla Pomodoro sessions
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  type VARCHAR(20) CHECK (type IN ('pomodoro', 'short_break', 'long_break')) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- minutos
  completed BOOLEAN DEFAULT FALSE,
  interruptions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla productivity metrics
CREATE TABLE IF NOT EXISTS productivity_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_pomodoros INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  focus_time INTEGER DEFAULT 0, -- minutos
  interruptions INTEGER DEFAULT 0,
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  peak_hours INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Policies de seguridad
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own metrics" ON productivity_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Índices optimizados
CREATE INDEX CONCURRENTLY idx_tasks_user_composite ON tasks(user_id, completed, priority, due_date);
CREATE INDEX CONCURRENTLY idx_pomodoro_user_session ON pomodoro_sessions(user_id, start_time DESC);
CREATE INDEX CONCURRENTLY idx_productivity_date ON productivity_metrics(user_id, date);

-- Vector index para semantic search
CREATE INDEX CONCURRENTLY idx_tasks_embedding ON tasks USING ivfflat (embedding vector_cosine_ops);
```

#### Criterios de Validación
- [ ] Conexión a Supabase desde Next.js funcionando
- [ ] OAuth providers configurados (Google, GitHub)
- [ ] Row Level Security funcionando correctamente
- [ ] Realtime subscriptions funcionando
- [ ] Operaciones CRUD completas para todas las tablas

---

### Task 1.3: Environment Configuration & Secrets
**Asignado a:** Lead Developer
**Tiempo estimado:** 2 horas
**Dependencias:** Task 1.2
**Prioridad:** Alta

#### Descripción
Configurar variables de entorno, secrets, y utilidades para desarrollo y producción.

#### Criterios de Aceptación
- [ ] .env.local.example con todas las variables requeridas
- [ ] Variables de producción configuradas en Vercel
- [ ] Secrets configurados de forma segura
- [ ] TypeScript types para environment variables

#### Implementación Técnica
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().length(32),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

// types/env.d.ts
export interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  ENCRYPTION_KEY: string;
  NEXT_PUBLIC_GA_ID?: string;
  SENTRY_DSN?: string;
}
```

---

## 🏗️ **Phase 2: Core Features Development** (Días 4-8)

### Task 2.1: Enhanced Authentication System
**Asignado a:** Lead Developer
**Tiempo estimado:** 8 horas
**Dependencias:** Task 1.3
**Prioridad:** Alta

#### Descripción
Implementar sistema de autenticación completo con OAuth, manejo de sesiones, y persistencia de preferencias de usuario.

#### Criterios de Aceptación
- [ ] Registro/login con email funcionando
- [ ] OAuth providers (Google, GitHub) funcionando
- [ ] Sistema de sesiones persistente
- [ ] Protected routes implementadas
- [ ] Manejo de preferencias de usuario
- [ ] Password reset functionality

#### Implementación Técnica
```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { env } from './env';

const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export { supabase };

// app/components/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/auth';
import type { UserPreferences } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    desktopNotifications: true,
    soundAlerts: true,
    theme: 'auto',
    workingHours: { start: '09:00', end: '17:00' }
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserPreferences(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserPreferences(session.user.id);
        } else {
          setPreferences(getDefaultPreferences());
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPreferences = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    if (data?.preferences) {
      setPreferences(data.preferences);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    await supabase
      .from('users')
      .update({ preferences: updatedPreferences })
      .eq('id', user.id);
  };

  // Rest of implementation...
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Criterios de Validación
- [ ] Registro de nuevos usuarios funciona correctamente
- [ ] Login con credenciales correctas funciona
- [ ] OAuth providers redirigen correctamente
- [ ] Sesiones persisten después de refresh
- [ ] Preferencias de usuario se guardan y cargan
- [ ] Logout elimina sesión completamente

---

### Task 2.2: Task Management Core with Pomodoro Integration
**Asignado a:** Lead Developer
**Tiempo estimado:** 12 horas
**Dependencias:** Task 2.1
**Prioridad:** Alta

#### Descripción
Implementar sistema completo de gestión de tareas con integración Pomodoro, incluyendo CRUD operations, optimistas updates, y sincronización real-time.

#### Criterios de Aceptación
- [ ] CRUD completo de tareas funcionando
- [ ] Estimación de Pomodoros por tarea
- [ ] Tracking de Pomodoros reales usados
- [ ] Optimistic updates para mejor UX
- [ ] Validación y manejo de errores
- [ ] Soporte para tags y categorías

#### Implementación Técnica
```typescript
// app/api/tasks/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['work', 'personal', 'study', 'health']).optional(),
  estimatedPomodoros: z.number().int().min(1).max(20).optional(),
  tags: z.array(z.string().max(50)).max(10).optional()
});

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  const completed = searchParams.get('completed');
  const search = searchParams.get('search');

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (priority) query = query.eq('priority', priority);
  if (completed !== null) query = query.eq('completed', completed === 'true');
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: tasks, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: tasks || [] });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);
    
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...validatedData,
        user_id: user.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// hooks/useTasks.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

export function useTasks(filters?: {
  category?: string;
  priority?: string;
  completed?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }
      
      return response.json();
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => [
        {
          id: `temp-${Date.now()}`,
          ...newTask,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed: false,
          actual_pomodoros: 0,
          user_id: 'temp-user-id'
        },
        ...(old || [])
      ]);
      
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

#### Criterios de Validación
- [ ] Creación de tareas funciona con validación
- [ ] Listado de tareas con filtros funcionando
- [ ] Edición y eliminación funcionando
- [ ] Updates optimistas mostrados inmediatamente
- [ ] Error handling muestra mensajes claros
- [ ] Real-time updates funcionan entre dispositivos

---

### Task 2.3: Pomodoro Timer Engine
**Asignado a:** Lead Developer
**Tiempo estimado:** 10 horas
**Dependencias:** Task 2.2
**Prioridad:** Alta

#### Descripción
Implementar motor Pomodoro con alta precisión, soporte offline, sincronización real-time, e integración con tasks.

#### Criterios de Aceptación
- [ ] Timer con precisión <100ms
- [ ] Sesiones de Pomodoro, short break, long break
- [ ] Integración con tareas (asignar tarea a sesión)
- [ ] Offline functionality con service worker
- [ ] Notificaciones push y desktop
- [ ] Sincronización real-time de sesiones

#### Implementación Técnica
```typescript
// lib/pomodoroEngine.ts
export interface PomodoroSession {
  id: string;
  taskId?: string;
  type: 'pomodoro' | 'short_break' | 'long_break';
  duration: number; // minutos
  startTime: Date;
  endTime?: Date;
  timeRemaining: number; // segundos
  completed: boolean;
  interruptions: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';
}

export class PomodoroEngine {
  private session: PomodoroSession | null = null;
  private interval: NodeJS.Timeout | null = null;
  private lastTick: number = 0;
  private drift: number = 0; // Para corrección de precisión
  private callbacks: Map<string, Function[]> = new Map();
  
  constructor() {
    // Configurar service worker para soporte offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }
    
    // Configurar visibility change para pausar cuando la pestaña no está activa
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Configurar beforeunload para advertir al usuario
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  startSession(config: {
    taskId?: string;
    type: 'pomodoro' | 'short_break' | 'long_break';
    customDuration?: number;
  }) {
    if (this.session?.status === 'running') {
      throw new Error('Session already running');
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
      status: 'running'
    };

    this.lastTick = Date.now();
    this.startTimer();
    this.notifyCallbacks('session:started', this.session);
    
    // Enviar a service worker para soporte offline
    this.sendToServiceWorker({
      type: 'pomodoro:start',
      session: this.session
    });

    return this.session;
  }

  private startTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.tick();
    }, 1000); // Actualizar cada segundo
  }

  private tick() {
    if (!this.session || this.session.status !== 'running') {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;

    // Calcular drift y compensar
    this.drift += elapsed - 1000;
    if (Math.abs(this.drift) > 100) {
      this.drift = 0; // Resetear drift si es muy grande
    }

    this.session.timeRemaining = Math.max(0, this.session.timeRemaining - 1);

    // Enviar actualización a service worker
    this.sendToServiceWorker({
      type: 'pomodoro:tick',
      timeRemaining: this.session.timeRemaining,
      sessionId: this.session.id
    });

    this.notifyCallbacks('session:updated', this.session);

    // Verificar si la sesión ha terminado
    if (this.session.timeRemaining === 0) {
      this.completeSession();
    }
  }

  async completeSession() {
    if (!this.session) return;

    this.session.status = 'completed';
    this.session.completed = true;
    this.session.endTime = new Date();

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Guardar sesión en la base de datos
    try {
      await this.saveSessionToDatabase();
    } catch (error) {
      console.error('Failed to save session:', error);
      // Queue para sincronización más tarde
      this.queueForSync(this.session);
    }

    this.notifyCallbacks('session:completed', this.session);
    
    // Enviar notificación
    this.sendNotification();
    
    // Sugerir siguiente break automáticamente
    this.suggestNextBreak();

    this.session = null;
  }

  pauseSession() {
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

  resumeSession() {
    if (!this.session || this.session.status !== 'paused') {
      return;
    }

    this.session.status = 'running';
    this.lastTick = Date.now();
    this.startTimer();
    
    this.notifyCallbacks('session:resumed', this.session);
  }

  addInterruption() {
    if (!this.session || this.session.status !== 'running') {
      return;
    }

    this.session.interruptions++;
    this.notifyCallbacks('session:interruption', {
      sessionId: this.session.id,
      interruptions: this.session.interruptions
    });
  }

  private async saveSessionToDatabase() {
    if (!this.session) return;

    const response = await fetch('/api/pomodoro/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.session.id,
        taskId: this.session.taskId,
        type: this.session.type,
        startTime: this.session.startTime.toISOString(),
        endTime: this.session.endTime?.toISOString(),
        duration: this.session.duration,
        interruptions: this.session.interruptions,
        actualDuration: Math.round((Date.now() - this.session.startTime.getTime()) / 1000 / 60) // minutos
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save session');
    }
  }

  private sendNotification() {
    if (!this.session) return;

    const isBreak = this.session.type !== 'pomodoro';
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break Time!' : 'Pomodoro Completed!', {
        body: isBreak 
          ? `Time for a ${this.session.type.replace('_', ' ')}`
          : `Great job! You've completed a ${this.session.duration}-minute Pomodoro session.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'pomodoro-notification'
      });
    }

    // Enviar notificación push si está configurado
    this.sendPushNotification(isBreak);
  }

  private getDefaultDuration(type: string): number {
    switch (type) {
      case 'pomodoro': return 25;
      case 'short_break': return 5;
      case 'long_break': return 15;
      default: return 25;
    }
  }

  // Métodos de callback
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyCallbacks(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Service Worker communication
  private sendToServiceWorker(data: any) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(data);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'pomodoro:sync':
        // Sincronizar sesión cuando vuelve online
        if (data.session && !this.session) {
          this.session = data.session;
          this.notifyCallbacks('session:restored', this.session);
        }
        break;
    }
  }

  private handleVisibilityChange() {
    if (document.hidden && this.session?.status === 'running') {
      // Página ya no está visible, pausar timer
      this.pauseSession();
    } else if (!document.hidden && this.session?.status === 'paused') {
      // Página visible de nuevo, reanudar
      this.resumeSession();
    }
  }

  private handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.session?.status === 'running') {
      event.preventDefault();
      event.returnValue = 'You have an active Pomodoro session. Are you sure you want to leave?';
    }
  }
}

// Hook para usar el Pomodoro Engine
export function usePomodoroEngine() {
  const [engine] = useState(() => new PomodoroEngine());
  const [session, setSession] = useState<PomodoroSession | null>(null);

  useEffect(() => {
    const handleSessionUpdate = (updatedSession: PomodoroSession) => {
      setSession(updatedSession);
    };

    engine.on('session:started', handleSessionUpdate);
    engine.on('session:updated', handleSessionUpdate);
    engine.on('session:completed', handleSessionUpdate);
    engine.on('session:paused', handleSessionUpdate);
    engine.on('session:resumed', handleSessionUpdate);

    return () => {
      engine.off('session:started', handleSessionUpdate);
      engine.off('session:updated', handleSessionUpdate);
      engine.off('session:completed', handleSessionUpdate);
      engine.off('session:paused', handleSessionUpdate);
      engine.off('session:resumed', handleSessionUpdate);
    };
  }, [engine]);

  return { engine, session };
}
```

#### Criterios de Validación
- [ ] Timer inicia, pausa, y reanuda correctamente
- [ ] Precisión del timer es <100ms de drift por hora
- [ ] Sesiones se guardan correctamente en la base de datos
- [ ] Notificaciones funcionan en browser y desktop
- [ ] Offline functionality funciona con service worker
- [ ] Real-time sync funciona entre dispositivos

---

## 🎨 **Phase 3: UI/UX Polish & PWA Features** (Días 9-12)

### Task 3.1: Enhanced Dashboard with Analytics
**Asignado a:** Lead Developer
**Tiempo estimado:** 8 horas
**Dependencias:** Task 2.3
**Prioridad:** Alta

#### Descripción
Crear dashboard principal con analytics de productividad, estadísticas visuales, y métricas de rendimiento en tiempo real.

#### Criterios de Aceptación
- [ ] Dashboard con estadísticas del día/semana
- [ ] Visualización de patrones de productividad
- [ ] Gráficos de progreso y tendencias
- [ ] Quick actions para tareas frecuentes
- [ ] Responsive design optimizado

#### Implementación Técnica
```typescript
// app/components/AnalyticsDashboard.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDuration, formatTime } from '@/lib/utils';

interface AnalyticsDashboardProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function AnalyticsDashboard({ dateRange }: AnalyticsDashboardProps) {
  const { data: analytics, loading } = useAnalytics(dateRange);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {/* Timer icon */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.today.focusTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.today.totalPomodoros} Pomodoros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {/* Check icon */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.today.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.today.totalTasks} total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {/* Chart icon */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.today.productivityScore}%</div>
            <Progress value={analytics.today.productivityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interruptions</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {/* Alert icon */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.today.interruptions}</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Daily Focus Time</span>
                <span>{formatDuration(analytics.week.totalFocusTime)}</span>
              </div>
              {/* Gráfico de barras diario */}
              <div className="mt-2 space-y-2">
                {analytics.week.dailyStats.map((day, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-12 text-sm">{formatTime(day.date)}</span>
                    <div className="flex-1 mx-2">
                      <Progress 
                        value={(day.focusTime / analytics.week.maxDailyFocusTime) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="w-16 text-sm text-right">
                      {formatDuration(day.focusTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Top Categories</span>
              </div>
              <div className="mt-2 space-y-2">
                {analytics.week.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="capitalize">{category.category}</span>
                    <span>{category.taskCount} tasks</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Peak Hours</span>
                <span>{analytics.patterns.peakProductivityHours.join(', ')}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Your most productive hours
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.insights.suggestions.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  {/* Lightbulb icon */}
                  <div className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// hooks/useAnalytics.ts
export function useAnalytics(dateRange: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

#### Criterios de Validación
- [ ] Dashboard carga en <2 segundos
- [ ] Estadísticas se actualizan en tiempo real
- [ ] Gráficos son responsive e interactivos
- [ ] Insights son relevantes y útiles
- [ ] Métricas son precisas y consistentes

---

### Task 3.2: PWA Features & Offline Functionality
**Asignado a:** Lead Developer
**Tiempo estimado:** 6 horas
**Dependencias:** Task 2.3
**Prioridad:** Alta

#### Descripción
Implementar capacidades PWA completas con offline functionality, background sync, y install prompts.

#### Criterios de Aceptación
- [ ] PWA manifest configurado correctamente
- [ ] Service worker con cache strategies
- [ ] Offline functionality para acciones críticas
- [ ] Background sync para datos pendientes
- [ ] Install prompt para PWA
- [ ] Push notifications funcionando

#### Implementación Técnica
```typescript
// public/sw.js (Service Worker)
const CACHE_NAME = 'taskflow-pro-v1';
const STATIC_CACHE = 'taskflow-static-v1';
const API_CACHE = 'taskflow-api-v1';

// Archivos estáticos para cache inmediato
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/pages/_app.js'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== API_CACHE)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Network-first strategy para API requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET' && url.pathname === '/api/tasks') {
      // Network-first for tasks GET requests
      event.respondWith(networkFirst(request));
    } else if (url.pathname.includes('/api/pomodoro/')) {
      // Cache-first for Pomodoro timer updates
      event.respondWith(cacheFirst(request));
    } else {
      // Network-first for other API requests
      event.respondWith(networkFirst(request));
    }
    return;
  }

  // Cache-first para assets estáticos
  event.respondWith(cacheFirst(request));
});

// Network-first strategy
async function networkFirst(request) {
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request.clone());
    
    // Si la respuesta es exitosa, guardar en cache y retornar
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Si falla la red, intentar desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, retornar página offline
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Network-first strategy failed:', error);
    
    // Intentar desde cache como fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar página offline
    return new Response(
      JSON.stringify({ error: 'Offline - Network error' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Devolver desde cache inmediatamente
    return cachedResponse;
  }
  
  try {
    // Si no está en cache, obtener de red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    
    // Retornar error 503
    return new Response(
      JSON.stringify({ error: 'Offline - Network unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync para datos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'pomodoro-sync') {
    event.waitUntil(syncPomodoroSessions());
  }
  
  if (event.tag === 'tasks-sync') {
    event.waitUntil(syncOfflineTasks());
  }
});

async function syncPomodoroSessions() {
  // Obtener sesiones pendientes de IndexedDB
  const pendingSessions = await getPendingSessions();
  
  for (const session of pendingSessions) {
    try {
      const response = await fetch('/api/pomodoro/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session)
      });
      
      if (response.ok) {
        // Eliminar sesión de IndexedDB
        await removePendingSession(session.id);
        console.log('Synced Pomodoro session:', session.id);
      }
    } catch (error) {
      console.error('Failed to sync Pomodoro session:', error);
    }
  }
}

async function syncOfflineTasks() {
  // Similar implementación para tasks
}

// IndexedDB helpers
async function getPendingSessions() {
  // Implementar IndexedDB operations
  return [];
}

async function removePendingSession(sessionId: string) {
  // Implementar IndexedDB operations
}

// app/components/PWAInstallPrompt.tsx
'use client';
import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        Install TaskFlow Pro
      </button>
    </div>
  );
}

// app/components/OfflineIndicator.tsx
'use client';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    </div>
  );
}
```

#### Criterios de Validación
- [ ] PWA se puede instalar en Chrome/Edge
- [ ] App funciona completamente offline
- [ ] Cambios pendientes se sincronizan al volver online
- [ ] Caching strategies funcionan correctamente
- [ ] Notificaciones push funcionan cuando la app está cerrada

---

## 🧪 **Phase 4: Testing & Quality Assurance** (Días 13-14)

### Task 4.1: Comprehensive Testing Suite
**Asignado a:** Lead Developer
**Tiempo estimado:** 8 horas
**Dependencias:** Task 3.2
**Prioridad:** Alta

#### Descripción
Crear suite de pruebas completa cubriendo unit tests, integration tests, E2E tests, y testing del timer precision.

#### Criterios de Aceptación
- [ ] Test coverage >85% para código crítico
- [ ] Unit tests para Pomodoro engine con precision tests
- [ ] Integration tests para API endpoints
- [ ] E2E tests para user flows principales
- [ ] Performance tests para Core Web Vitals
- [ ] Tests corriendo en CI/CD pipeline

#### Implementación Técnica
```typescript
// __tests__/lib/pomodoroEngine.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PomodoroEngine } from '@/lib/pomodoroEngine';

describe('PomodoroEngine', () => {
  let engine: PomodoroEngine;
  
  beforeEach(() => {
    engine = new PomodoroEngine();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Management', () => {
    it('should start a Pomodoro session correctly', () => {
      const session = engine.startSession({
        type: 'pomodoro',
        taskId: 'task-123'
      });

      expect(session).toMatchObject({
        type: 'pomodoro',
        taskId: 'task-123',
        duration: 25,
        timeRemaining: 1500, // 25 minutes * 60 seconds
        status: 'running',
        completed: false,
        interruptions: 0
      });
    });

    it('should handle session pausing and resuming', () => {
      const session = engine.startSession({ type: 'pomodoro' });
      
      vi.advanceTimersByTime(10000); // 10 seconds
      engine.pauseSession();
      
      expect(session?.status).toBe('paused');
      expect(session?.timeRemaining).toBe(1490);
      
      engine.resumeSession();
      expect(session?.status).toBe('running');
    });

    it('should complete session when timer reaches zero', () => {
      const mockSaveToDatabase = vi.spyOn(engine as any, 'saveSessionToDatabase');
      mockSaveToDatabase.mockResolvedValue(undefined);

      const session = engine.startSession({ type: 'pomodoro' });
      
      // Fast-forward 25 minutes
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      expect(session?.status).toBe('completed');
      expect(session?.completed).toBe(true);
      expect(mockSaveToDatabase).toHaveBeenCalled();
    });
  });

  describe('Timer Precision', () => {
    it('should maintain accuracy within 100ms drift per hour', async () => {
      const session = engine.startSession({ type: 'pomodoro' });
      
      // Simular 1 hora de ejecución
      for (let i = 0; i < 3600; i++) {
        vi.advanceTimersByTime(1000); // 1 segundo
      }
      
      // El drift debería ser corregido periódicamente
      expect(engine['drift']).toBeLessThanOrEqual(100);
    });

    it('should handle browser visibility changes correctly', () => {
      const session = engine.startSession({ type: 'pomodoro' });
      
      // Simular que la página se oculta
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      });
      
      // Disparar evento visibilitychange
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(session?.status).toBe('paused');
      
      // Simular que la página se vuelve visible
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      });
      
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(session?.status).toBe('running');
    });
  });

  describe('Error Handling', () => {
    it('should prevent starting multiple sessions', () => {
      engine.startSession({ type: 'pomodoro' });
      
      expect(() => {
        engine.startSession({ type: 'pomodoro' });
      }).toThrow('Session already running');
    });

    it('should handle database save failures gracefully', async () => {
      const mockSaveToDatabase = vi.spyOn(engine as any, 'saveSessionToDatabase');
      mockSaveToDatabase.mockRejectedValue(new Error('Database error'));

      const session = engine.startSession({ type: 'pomodoro' });
      
      // Completar sesión
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      // No debería lanzar error, debería queue para sync
      expect(session?.status).toBe('completed');
    });
  });

  describe('Callbacks', () => {
    it('should call session:started callback', () => {
      const callback = vi.fn();
      engine.on('session:started', callback);
      
      const session = engine.startSession({ type: 'pomodoro' });
      
      expect(callback).toHaveBeenCalledWith(session);
    });

    it('should call session:completed callback', () => {
      const callback = vi.fn();
      engine.on('session:completed', callback);
      
      const session = engine.startSession({ type: 'pomodoro' });
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      expect(callback).toHaveBeenCalledWith(session);
    });
  });
});

// __tests__/e2e/pomodoro-workflow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Pomodoro Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full Pomodoro cycle', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Crear tarea
    await page.click('[data-testid="quick-add-task"]');
    await page.fill('input[placeholder*="task"]', 'Test Pomodoro Task');
    await page.click('button[data-testid="save-task"]');
    
    // Iniciar Pomodoro
    await page.click('[data-testid="start-pomodoro"]');
    
    // Verificar que el timer está corriendo
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('25:00');
    
    // Esperar 1 segundo y verificar decremento
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('24:59');
    
    // Completar sesión (simular)
    await page.evaluate(() => {
      // Simular completion para test rápido
      const timerDisplay = document.querySelector('[data-testid="timer-display"]');
      if (timerDisplay) {
        timerDisplay.textContent = '00:00';
      }
    });
    
    // Verificar que sesión completó
    await expect(page.locator('[data-testid="session-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-break"]')).toBeVisible();
    
    // Iniciar break
    await page.click('[data-testid="start-break"]');
    
    // Verificar que break está corriendo
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('05:00');
  });

  test('should handle interruptions correctly', async ({ page }) => {
    // Setup inicial similar al test anterior
    await page.click('[data-testid="start-pomodoro"]');
    
    // Agregar interrupción
    await page.click('[data-testid="add-interruption"]');
    
    // Verificar contador de interrupciones
    await expect(page.locator('[data-testid="interruption-count"]')).toContainText('1');
    
    // Completar sesión
    await page.evaluate(() => {
      const timerDisplay = document.querySelector('[data-testid="timer-display"]');
      if (timerDisplay) {
        timerDisplay.textContent = '00:00';
      }
    });
    
    // Verificar que interrupciones se registraron
    await expect(page.locator('[data-testid="session-summary"]')).toContainText('1 interruption');
  });

  test('should work offline and sync when back online', async ({ page, context }) => {
    // Simular modo offline
    await context.setOffline(true);
    
    // Crear tarea offline
    await page.click('[data-testid="quick-add-task"]');
    await page.fill('input[placeholder*="task"]', 'Offline Task');
    await page.click('button[data-testid="save-task"]');
    
    // Iniciar Pomodoro offline
    await page.click('[data-testid="start-pomodoro"]');
    
    // Verificar indicador offline
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Completar sesión offline
    await page.evaluate(() => {
      const timerDisplay = document.querySelector('[data-testid="timer-display"]');
      if (timerDisplay) {
        timerDisplay.textContent = '00:00';
      }
    });
    
    // Volver online
    await context.setOffline(false);
    
    // Esperar sync
    await page.waitForTimeout(2000);
    
    // Verificar que datos se sincronizaron
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });
});

// __tests__/performance/timer-precision.test.ts
import { test, expect } from '@playwright/test';

test.describe('Timer Precision', () => {
  test('should maintain accuracy within acceptable bounds', async ({ page }) => {
    await page.goto('/');
    
    // Iniciar sesión de prueba larga
    await page.click('[data-testid="start-pomodoro"]');
    
    // Medir precisión del timer
    const startTime = Date.now();
    let lastTime = '25:00';
    let driftAccumulated = 0;
    
    // Monitorear por 60 segundos
    const monitorDuration = 60000; // 1 minuto
    const checkInterval = 1000; // 1 segundo
    
    for (let elapsed = 0; elapsed < monitorDuration; elapsed += checkInterval) {
      await page.waitForTimeout(checkInterval);
      
      const currentTime = page.locator('[data-testid="timer-display"]').textContent();
      const expectedTime = Math.max(0, 25 * 60 - Math.floor(elapsed / 1000));
      const expectedMinutes = Math.floor(expectedTime / 60);
      const expectedSeconds = expectedTime % 60;
      const expectedDisplay = `${String(expectedMinutes).padStart(2, '0')}:${String(expectedSeconds).padStart(2, '0')}`;
      
      if (currentTime !== lastTime) {
        // Calcular drift
        const actualSeconds = (25 * 60) - parseInt(currentTime.split(':')[0]) * 60 - parseInt(currentTime.split(':')[1]);
        const expectedSeconds = (Date.now() - startTime) / 1000;
        const drift = Math.abs(actualSeconds - expectedSeconds);
        
        driftAccumulated += drift;
        
        // El drift no debe acumular más de 100ms en 1 minuto
        expect(driftAccumulated).toBeLessThan(100);
        
        lastTime = currentTime;
      }
    }
  });
});
```

#### Criterios de Validación
- [ ] Unit tests cubren todas las funciones críticas
- [ ] Timer precision tests verifican <100ms drift
- [ ] Integration tests cubren flows completos
- [ ] E2E tests verifican UX real
- [ ] Performance tests cumplen Core Web Vitals targets
- [ ] CI/CD pipeline ejecuta todos los tests exitosamente

---

## 📊 **Task Dependencies Matrix**

| Task | 1.1 | 1.2 | 1.3 | 2.1 | 2.2 | 2.3 | 3.1 | 3.2 | 4.1 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1.1  |     |     |     |     |     |     |     |     |     |
| 1.2  | ✓   |     |     |     |     |     |     |     |     |
| 1.3  |     | ✓   |     |     |     |     |     |     |     |
| 2.1  |     |     | ✓   |     |     |     |     |     |     |
| 2.2  |     |     |     | ✓   |     |     |     |     |     |
| 2.3  |     |     |     | ✓   |     |     |     |     |     |
| 3.1  |     |     |     |     | ✓   | ✓   |     |     |
| 3.2  |     |     |     |     |     | ✓   | ✓   |     |
| 4.1  | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |     |

**Legend:** ✓ = Direct dependency

---

## 🎯 **Success Metrics**

### Development Metrics
- **Velocity:** 11 tareas completadas por semana
- **Quality:** <3 bugs por release
- **Coverage:** >85% test coverage maintained
- **Performance:** <1s page load time, <100ms timer precision

### Product Metrics
- **Time to Market:** 2 semanas desde inicio a producción
- **User Experience:** 95+ Lighthouse score
- **Functionality:** 100% de MVP features funcionando
- **PWA Features:** 100% offline functionality
- **Timer Precision:** <50ms drift máximo por hora

### Business Metrics
- **Development Cost:** <50 horas total
- **Infrastructure Cost:** <$50/mes inicial
- **User Adoption Goal:** 500+ usuarios en primer mes
- **Performance Metrics:** Core Web Vitals en green

---

## 🚀 **Deployment Plan**

### Pre-deployment Checklist
1. **Environment Setup:** Variables de producción configuradas en Vercel
2. **Testing:** Todos los tests pasando en CI/CD pipeline
3. **Performance:** Lighthouse score >95 en producción
4. **Security:** Environment variables secured, HTTPS habilitado
5. **PWA:** Service worker registrado, manifest válido
6. **Monitoring:** Error tracking y analytics configurados

### Deployment Process
1. **Build:** `npm run build`
2. **Deploy:** Push a rama main activa deployment automática
3. **Verify:** Testing manual de producción
4. **Monitor:** Verificar métricas y errores

### Post-deployment
1. **Monitor:** Core Web Vitals, timer precision, PWA metrics
2. **Analytics:** Monitorear adopción y uso de features
3. **Support:** Configurar canal de feedback de usuarios
4. **Iterate:** Planear basado en métricas y feedback

---

## 📈 **Risk Mitigation**

### Technical Risks
- **Timer Precision:** Implementado con compensación de drift y server-side sync
- **PWA Compatibility:** Progressive enhancement + graceful degradation
- **Offline Data Loss:** IndexedDB + background sync con retry logic
- **Performance:** Lazy loading + code splitting + optimización de assets

### Timeline Risks
- **Scope Creep:** Estrict adherence a MVP requirements definidas
- **Technical Debt:** Code reviews + tiempo dedicado a refactoring
- **Browser Compatibility:** Testing extensivo en navegadores principales

### Quality Risks
- **Timer Accuracy:** Testing específico de precisión con métricas estrictas
- **Data Consistency:** Validación de sync patterns + conflict resolution
- **User Experience:** Testing real de usability y performance

---

## 🔄 **Post-MVP Roadmap** (Semanas 3-6)

### Phase 5: Enhanced Features (Semanas 3-4)
- **Task 5.1:** Advanced analytics dashboard
- **Task 5.2:** Custom Pomodoro lengths
- **Task 5.3:** Task templates y recurring tasks
- **Task 5.4:** Music integration (Spotify/YouTube)
- **Task 5.5:** Weekly reports con insights

### Phase 6: Premium Features (Semanas 5-6)
- **Task 6.1:** Team collaboration basics
- **Task 6.2:** API pública para integraciones
- **Task 6.3:** Advanced AI-powered suggestions
- **Task 6.4:** Mobile apps nativas
- **Task 6.5:** Enterprise features

---

*Implementation Tasks Document for TaskFlow Pro*
*Generated by PRD-Genie v3.1 Expert System*
*Complexity Level: 🟢 SIMPLE → 🟡 MEDIUM*
*Stack: Next.js 14 + Supabase + Tailwind + PWA ✅ VALIDADO*
*Focus: Pomodoro Integration + PWA + Analytics + Timer Precision*