import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none',
          'text-shadow-sm shadow-agentic',
          {
            'bg-black/40 text-white border border-gold hover:bg-gold/20 hover:shadow-agentic-hover hover:-translate-y-0.5 focus:ring-gold':
              variant === 'primary',
            'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 focus:ring-white/50':
              variant === 'secondary',
            'bg-black/40 text-white border border-red-500 hover:bg-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 focus:ring-red-500':
              variant === 'danger',
            'bg-transparent text-gray-400 hover:bg-black/50 hover:text-gray-200 focus:ring-gray-500 border border-transparent':
              variant === 'ghost',
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        style={{
          textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

