'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Forzar recarga de la página para limpiar cualquier estado cacheado
      // y asegurar que el middleware detecte la sesión cerrada
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      // Aún así, redirigir a login en caso de error
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col glass border-r border-white/10 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-black/40 border border-gold flex items-center justify-center shadow-agentic">
            <Timer className="h-5 w-5 text-gold" />
          </div>
          <span className="text-xl font-bold text-gold uppercase tracking-wider">
            TaskFlow Pro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 uppercase tracking-wider',
                isActive
                  ? 'bg-black/40 text-gold border border-gold shadow-agentic-hover'
                  : 'text-gray-400 hover:bg-black/40 hover:text-white hover:border hover:border-white/20 border border-transparent'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-gold' : '')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-black/40 border border-gold flex items-center justify-center shadow-agentic">
            <span className="text-sm font-medium text-gold">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.user_metadata?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-black/40 hover:text-white hover:border hover:border-white/20 border border-transparent transition-all duration-300 uppercase tracking-wider"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

