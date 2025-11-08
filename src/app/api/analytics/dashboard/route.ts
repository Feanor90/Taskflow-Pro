import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fechas por defecto: hoy y últimos 7 días
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Obtener estadísticas de hoy
    const { data: todayMetrics, error: todayMetricsError } = await supabase
      .from('productivity_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    // Si hay error y no es porque no hay datos, loguearlo
    if (todayMetricsError && todayMetricsError.code !== 'PGRST116') {
      console.error('Error obteniendo métricas de hoy:', todayMetricsError);
    }

    // Obtener tareas completadas hoy
    const { data: todayTasks, error: todayTasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    if (todayTasksError) {
      console.error('Error obteniendo tareas de hoy:', todayTasksError);
    }

    // Obtener total de tareas
    const { count: totalTasks, error: totalTasksError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false);

    if (totalTasksError) {
      console.error('Error obteniendo total de tareas:', totalTasksError);
    }

    // Obtener métricas de la semana
    const { data: weekMetrics, error: weekMetricsError } = await supabase
      .from('productivity_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate || weekAgo)
      .lte('date', endDate || today)
      .order('date', { ascending: true });

    if (weekMetricsError) {
      console.error('Error obteniendo métricas de la semana:', weekMetricsError);
    }

    // Obtener sesiones de pomodoro recientes
    const { data: recentSessions, error: recentSessionsError } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'pomodoro')
      .eq('completed', true)
      .gte('start_time', `${weekAgo}T00:00:00`)
      .order('start_time', { ascending: false });

    if (recentSessionsError) {
      console.error('Error obteniendo sesiones recientes:', recentSessionsError);
    }

    // Calcular estadísticas por categoría
    const { data: tasksByCategory, error: tasksByCategoryError } = await supabase
      .from('tasks')
      .select('category, completed')
      .eq('user_id', user.id);

    if (tasksByCategoryError) {
      console.error('Error obteniendo tareas por categoría:', tasksByCategoryError);
    }

    const categoryStats = tasksByCategory?.reduce((acc: any, task) => {
      const cat = task.category;
      if (!acc[cat]) {
        acc[cat] = { total: 0, completed: 0 };
      }
      acc[cat].total++;
      if (task.completed) acc[cat].completed++;
      return acc;
    }, {});

    // Calcular productivity score de hoy
    const todayPomodoros = todayMetrics?.total_pomodoros || 0;
    const todayCompletedTasks = todayTasks?.length || 0;
    const todayInterruptions = todayMetrics?.interruptions || 0;

    const productivityScore = Math.min(
      100,
      Math.max(
        0,
        todayCompletedTasks * 8 +
          todayPomodoros * 5 -
          todayInterruptions * 2
      )
    );

    // Calcular horas pico
    const sessionsByHour = recentSessions?.reduce((acc: any, session) => {
      const hour = new Date(session.start_time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHours = Object.entries(sessionsByHour || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Calcular estadísticas semanales
    const weeklyTotalFocusTime = weekMetrics?.reduce(
      (sum, m) => sum + (m.focus_time || 0),
      0
    ) || 0;

    const maxDailyFocusTime = Math.max(
      ...(weekMetrics?.map((m) => m.focus_time || 0) || [0])
    );

    const topCategories = Object.entries(categoryStats || {})
      .map(([category, stats]: any) => ({
        category,
        taskCount: stats.total,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 3);

    // Generar insights
    const insights: string[] = [];

    if (peakHours.length > 0) {
      insights.push(
        `Tu hora más productiva es a las ${peakHours[0]}:00. Programa tus tareas más importantes en este horario.`
      );
    }

    if (todayPomodoros < 4) {
      insights.push(
        'Intenta completar al menos 4 pomodoros hoy para mantener tu productividad.'
      );
    }

    if (todayInterruptions > 3) {
      insights.push(
        'Has tenido varias interrupciones hoy. Considera usar el modo "No Molestar".'
      );
    }

    if (topCategories.length > 0 && topCategories[0].completionRate < 50) {
      insights.push(
        `Tu categoría "${topCategories[0].category}" tiene una tasa de completación baja. Revisa si las tareas son realistas.`
      );
    }

    const response = {
      today: {
        completedTasks: todayCompletedTasks,
        totalTasks: (totalTasks || 0) + todayCompletedTasks,
        totalPomodoros: todayPomodoros,
        focusTime: todayMetrics?.focus_time || 0,
        interruptions: todayInterruptions,
        productivityScore,
      },
      week: {
        dailyStats: weekMetrics?.map((m) => ({
          date: m.date,
          completedTasks: m.completed_tasks,
          totalPomodoros: m.total_pomodoros,
          focusTime: m.focus_time,
          interruptions: m.interruptions,
          productivityScore: m.productivity_score || 0,
        })) || [],
        totalFocusTime: weeklyTotalFocusTime,
        maxDailyFocusTime,
        topCategories,
        averageProductivityScore:
          weekMetrics && weekMetrics.length > 0
            ? weekMetrics.reduce((sum, m) => sum + (m.productivity_score || 0), 0) /
              weekMetrics.length
            : 0,
      },
      patterns: {
        peakProductivityHours: peakHours,
        averageSessionLength:
          recentSessions && recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => sum + s.duration, 0) /
              recentSessions.length
            : 0,
        completionRate:
          tasksByCategory && tasksByCategory.length > 0
            ? (tasksByCategory.filter((t) => t.completed).length /
                tasksByCategory.length) *
              100
            : 0,
        mostProductiveDay:
          weekMetrics && weekMetrics.length > 0
            ? weekMetrics.reduce((max, m) =>
                (m.focus_time || 0) > (max.focus_time || 0) ? m : max
              ).date
            : today,
      },
      insights: {
        suggestions: insights,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

