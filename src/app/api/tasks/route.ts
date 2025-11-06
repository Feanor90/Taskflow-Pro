import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['work', 'personal', 'study', 'health']).optional(),
  estimatedPomodoros: z.number().int().min(1).max(20).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('GET /api/tasks - Session:', session?.user?.id, 'Error:', sessionError?.message);

    if (sessionError || !session?.user) {
      console.error('Auth error en GET /api/tasks:', sessionError);
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user;

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

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (completed !== null) {
      query = query.eq('completed', completed === 'true');
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Error al obtener tareas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: tasks || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.log('⚠️ No hay sesión de usuario al crear tarea');
      return NextResponse.json({ error: 'Debes iniciar sesión para crear tareas' }, { status: 401 });
    }

    const user = session.user;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        due_date: validatedData.dueDate || null,
        priority: validatedData.priority || 'medium',
        category: validatedData.category || 'personal',
        estimated_pomodoros: validatedData.estimatedPomodoros || 1,
        tags: validatedData.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Error al crear tarea' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: task }, { status: 201 });
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

