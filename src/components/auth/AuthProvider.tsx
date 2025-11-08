'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(
    DEFAULT_PREFERENCES
  );

  useEffect(() => {
    // Verificar si Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('ejemplo') || supabaseUrl.includes('placeholder')) {
      console.warn('⚠️ Supabase no está configurado correctamente. La aplicación funcionará en modo limitado.');
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error obteniendo sesión:', error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadUserPreferences();
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error en getSession:', error);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, 'Session:', !!session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserPreferences();
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }

        setLoading(false);
      });

      subscription = authSubscription;
    } catch (error) {
      console.error('Error configurando onAuthStateChange:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserPreferences = async () => {
    try {
      // Intentar cargar preferencias del user metadata
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user?.user_metadata?.preferences) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...userData.user.user_metadata.preferences,
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: updatedPreferences,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revertir en caso de error
      setPreferences(preferences);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Intentando login con Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('AuthProvider: Error en login:', error);
      throw error;
    }

    console.log('AuthProvider: Login exitoso', data);
    
    // Actualizar el estado inmediatamente
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await loadUserPreferences();
      }
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          preferences: DEFAULT_PREFERENCES,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Cerrar sesión en Supabase (esto también limpia las cookies)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      // Limpiar el estado local inmediatamente
      setUser(null);
      setSession(null);
      setPreferences(DEFAULT_PREFERENCES);

      // Esperar un momento para asegurar que las cookies se limpien
      // El evento onAuthStateChange se disparará automáticamente
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error en signOut:', error);
      // Aún así, limpiar el estado local en caso de error
      setUser(null);
      setSession(null);
      setPreferences(DEFAULT_PREFERENCES);
      throw error;
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    preferences,
    updatePreferences,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  };

  // Renderizar siempre los children, el loading se maneja en los componentes individuales
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

