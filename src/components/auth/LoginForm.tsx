'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Github, Mail } from 'lucide-react';

export function LoginForm() {
  const { signIn, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Intentando iniciar sesión con:', email);
      await signIn(email, password);
      console.log('Sesión iniciada correctamente');
      
      // Esperar a que la sesión se establezca completamente
      // y que las cookies se guarden
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Redirigiendo al dashboard...');
      // Usar window.location para forzar una recarga completa
      // Esto asegura que el middleware vea la nueva sesión
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);

    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || `Error al iniciar sesión con ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-wider text-gold uppercase">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Accede a tu cuenta de TaskFlow Pro
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 uppercase tracking-wider"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-900 px-2 text-gray-400">O continúa con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Mail className="h-5 w-5" />
          Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loading}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Github className="h-5 w-5" />
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-gray-400">
        ¿No tienes cuenta?{' '}
        <a
          href="/signup"
          className="font-medium text-gold hover:text-gold/80 transition-colors uppercase tracking-wider"
        >
          Regístrate
        </a>
      </p>
    </div>
  );
}

