import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

// Validación de variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase environment variables. Please check your .env.local file.'
  );
  console.error('Required variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // Usar valores dummy para evitar que la app crashee completamente
  // Esto permitirá que la app se renderice pero mostrará errores en las llamadas API
}

// Cliente de Supabase para el navegador que usa cookies
// Esto asegura que las cookies se establezcan correctamente para el middleware
export const supabase = createPagesBrowserClient<Database>({
  supabaseUrl: supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey: supabaseAnonKey || 'placeholder-key',
});

// Helper para obtener el usuario actual
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
}

// Helper para verificar si hay sesión activa
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

// Helper para sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Helper para sign in con email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Helper para sign up con email
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

// Helper para sign in con OAuth
export async function signInWithOAuth(
  provider: 'google' | 'github'
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

// Helper para reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    throw error;
  }
}

// Helper para update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

// Types para facilitar el uso
export type SupabaseClient = typeof supabase;
export type { Database };

