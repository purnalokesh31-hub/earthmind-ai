'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { BUTTON_SIZES } from '../../lib/tokens';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  icon,
  disabled,
  ...props
}, ref) => {
  const actualLeftIcon = leftIcon || icon;
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const variants = {
    primary: 'bg-cyan-500 text-[#050B14] hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 border border-cyan-400/30',
    secondary: 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 active:scale-95',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 active:scale-95',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95',
    outline: 'bg-transparent text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 active:scale-95',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-[10px] gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent mr-1" />
      ) : actualLeftIcon ? (
        <span className="shrink-0">{actualLeftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

export interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  label,
  className,
  variant = 'ghost',
  size = 'md',
  ...props
}, ref) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <motion.button
      ref={ref}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500/40',
        variant === 'ghost' && 'text-slate-400 hover:text-slate-100 hover:bg-white/5',
        variant === 'secondary' && 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10',
        variant === 'primary' && 'bg-cyan-500 text-[#050B14] hover:bg-cyan-400',
        variant === 'outline' && 'border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400',
        sizes[size],
        className
      )}
      {...props}
    >
      {icon}
    </motion.button>
  );
});

IconButton.displayName = 'IconButton';
