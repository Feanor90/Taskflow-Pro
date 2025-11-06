-- TaskFlow Pro - Database Schema
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- TABLA: tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  category VARCHAR(20) CHECK (category IN ('work', 'personal', 'study', 'health')) DEFAULT 'personal',
  estimated_pomodoros INTEGER DEFAULT 1 CHECK (estimated_pomodoros > 0),
  actual_pomodoros INTEGER DEFAULT 0 CHECK (actual_pomodoros >= 0),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: pomodoro_sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  type VARCHAR(20) CHECK (type IN ('pomodoro', 'short_break', 'long_break')) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL CHECK (duration > 0), -- minutos
  completed BOOLEAN DEFAULT FALSE,
  interruptions INTEGER DEFAULT 0 CHECK (interruptions >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: productivity_metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS productivity_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_pomodoros INTEGER DEFAULT 0 CHECK (total_pomodoros >= 0),
  completed_tasks INTEGER DEFAULT 0 CHECK (completed_tasks >= 0),
  focus_time INTEGER DEFAULT 0 CHECK (focus_time >= 0), -- minutos
  interruptions INTEGER DEFAULT 0 CHECK (interruptions >= 0),
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  peak_hours INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- =====================================================
-- ÍNDICES OPTIMIZADOS
-- =====================================================

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category ON tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_composite ON tasks(user_id, completed, priority, due_date);

-- Índices para pomodoro_sessions
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_task_id ON pomodoro_sessions(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_start_time ON pomodoro_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_type ON pomodoro_sessions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_pomodoro_composite ON pomodoro_sessions(user_id, start_time DESC, completed);

-- Índices para productivity_metrics
CREATE INDEX IF NOT EXISTS idx_productivity_user_id ON productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_date ON productivity_metrics(user_id, date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para pomodoro_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON pomodoro_sessions;
CREATE POLICY "Users can view their own sessions" ON pomodoro_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own sessions" ON pomodoro_sessions;
CREATE POLICY "Users can create their own sessions" ON pomodoro_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON pomodoro_sessions;
CREATE POLICY "Users can update their own sessions" ON pomodoro_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON pomodoro_sessions;
CREATE POLICY "Users can delete their own sessions" ON pomodoro_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para productivity_metrics
DROP POLICY IF EXISTS "Users can view their own metrics" ON productivity_metrics;
CREATE POLICY "Users can view their own metrics" ON productivity_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own metrics" ON productivity_metrics;
CREATE POLICY "Users can create their own metrics" ON productivity_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own metrics" ON productivity_metrics;
CREATE POLICY "Users can update their own metrics" ON productivity_metrics
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own metrics" ON productivity_metrics;
CREATE POLICY "Users can delete their own metrics" ON productivity_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para productivity_metrics
DROP TRIGGER IF EXISTS update_productivity_metrics_updated_at ON productivity_metrics;
CREATE TRIGGER update_productivity_metrics_updated_at
  BEFORE UPDATE ON productivity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar completed_at cuando se completa una tarea
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar completed_at
DROP TRIGGER IF EXISTS task_completed_trigger ON tasks;
CREATE TRIGGER task_completed_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completed_at();

-- Función para incrementar actual_pomodoros cuando se completa una sesión
CREATE OR REPLACE FUNCTION increment_task_pomodoros()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE AND NEW.type = 'pomodoro' AND NEW.task_id IS NOT NULL THEN
    UPDATE tasks
    SET actual_pomodoros = actual_pomodoros + 1
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar pomodoros
DROP TRIGGER IF EXISTS increment_pomodoros_trigger ON pomodoro_sessions;
CREATE TRIGGER increment_pomodoros_trigger
  AFTER UPDATE ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_task_pomodoros();

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener estadísticas del día
CREATE OR REPLACE FUNCTION get_daily_stats(p_user_id UUID, p_date DATE)
RETURNS TABLE (
  completed_tasks BIGINT,
  total_pomodoros BIGINT,
  focus_time BIGINT,
  interruptions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT t.id) FILTER (WHERE t.completed = TRUE AND DATE(t.completed_at) = p_date) as completed_tasks,
    COUNT(ps.id) FILTER (WHERE ps.type = 'pomodoro' AND ps.completed = TRUE) as total_pomodoros,
    COALESCE(SUM(ps.duration) FILTER (WHERE ps.type = 'pomodoro' AND ps.completed = TRUE), 0) as focus_time,
    COALESCE(SUM(ps.interruptions), 0) as interruptions
  FROM pomodoro_sessions ps
  LEFT JOIN tasks t ON t.user_id = p_user_id
  WHERE ps.user_id = p_user_id
    AND DATE(ps.start_time) = p_date;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular productivity score
CREATE OR REPLACE FUNCTION calculate_productivity_score(
  p_completed_tasks INTEGER,
  p_total_pomodoros INTEGER,
  p_interruptions INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  -- Score base: tareas completadas (40 puntos máximo)
  v_score := LEAST(p_completed_tasks * 8, 40);
  
  -- Pomodoros completados (40 puntos máximo)
  v_score := v_score + LEAST(p_total_pomodoros * 5, 40);
  
  -- Penalización por interrupciones (máximo -20 puntos)
  v_score := v_score - LEAST(p_interruptions * 2, 20);
  
  -- Asegurar que esté entre 0 y 100
  RETURN GREATEST(0, LEAST(v_score, 100));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Habilitar realtime para todas las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE pomodoro_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE productivity_metrics;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTAR EN PRODUCCIÓN)
-- =====================================================

-- Insertar datos de ejemplo solo si no existen
-- NOTA: Reemplazar 'USER_ID_AQUI' con un UUID de usuario válido

-- INSERT INTO tasks (user_id, title, description, priority, category, estimated_pomodoros)
-- VALUES 
--   ('USER_ID_AQUI', 'Completar diseño de TaskFlow Pro', 'Finalizar mockups y prototipos', 'high', 'work', 3),
--   ('USER_ID_AQUI', 'Estudiar TypeScript avanzado', 'Repasar tipos genéricos y utility types', 'medium', 'study', 2),
--   ('USER_ID_AQUI', 'Hacer ejercicio', 'Rutina de cardio 30 minutos', 'medium', 'health', 1);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE 'Schema de TaskFlow Pro creado exitosamente!';
  RAISE NOTICE 'Tablas: tasks, pomodoro_sessions, productivity_metrics';
  RAISE NOTICE 'RLS habilitado en todas las tablas';
  RAISE NOTICE 'Índices y triggers configurados';
END $$;

