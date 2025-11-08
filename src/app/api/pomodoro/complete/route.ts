import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Database } from '@/types/database';

const completeSessionSchema = z.object({
  taskId: z.string().uuid().optional(),
  type: z.enum(['pomodoro', 'short_break', 'long_break']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive(),
  interruptions: z.number().int().min(0).default(0),
  completed: z.boolean().default(true),
});

export async function POST(request: Request) {
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

    const body = await request.json();
    const validatedData = completeSessionSchema.parse(body);

    // Guardar sesión en la base de datos
    const { data: pomodoroSession, error: pomodoroSessionError } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: user.id,
        task_id: validatedData.taskId || null,
        type: validatedData.type,
        start_time: validatedData.startTime,
        end_time: validatedData.endTime || new Date().toISOString(),
        duration: validatedData.duration,
        completed: validatedData.completed,
        interruptions: validatedData.interruptions,
      })
      .select()
      .single();

    if (pomodoroSessionError) {
      console.error('Error creating session:', pomodoroSessionError);
      return NextResponse.json(
        { error: 'Error al guardar sesión' },
        { status: 500 }
      );
    }

    // Si es un pomodoro completado, actualizar métricas del día
    if (validatedData.type === 'pomodoro' && validatedData.completed) {
      const today = new Date().toISOString().split('T')[0];

      // Obtener o crear métricas del día
      const { data: existingMetrics } = await supabase
        .from('productivity_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingMetrics) {
        // Actualizar métricas existentes
        const { error: updateError } = await supabase
          .from('productivity_metrics')
          .update({
            total_pomodoros: existingMetrics.total_pomodoros + 1,
            focus_time: existingMetrics.focus_time + validatedData.duration,
            interruptions: existingMetrics.interruptions + validatedData.interruptions,
          })
          .eq('id', existingMetrics.id);

        if (updateError) {
          console.error('Error updating metrics:', updateError);
        }
      } else {
        // Crear nuevas métricas
        const { error: createError } = await supabase
          .from('productivity_metrics')
          .insert({
            user_id: user.id,
            date: today,
            total_pomodoros: 1,
            focus_time: validatedData.duration,
            interruptions: validatedData.interruptions,
            completed_tasks: 0,
            productivity_score: 0,
          });

        if (createError) {
          console.error('Error creating metrics:', createError);
        }
      }
    }

    return NextResponse.json({ data: pomodoroSession }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

