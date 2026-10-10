'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-slate-500 pointer-events-none text-xs">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full bg-[#050B14] border border-white/10 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200',
            leftIcon && 'pl-8',
            rightIcon && 'pr-8',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-slate-500 text-xs">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <span id={`${inputId}-error`} role="alert" className="text-[10px] text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  className,
  value,
  onClear,
  placeholder = 'Search...',
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      leftIcon={<Search className="w-3.5 h-3.5" />}
      placeholder={placeholder}
      value={value}
      className={className}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  className,
  label,
  error,
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full bg-[#050B14] border border-white/10 text-slate-200 placeholder-slate-600 rounded-lg p-3 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 resize-none',
          error && 'border-rose-500 focus:border-rose-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-[10px] text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  options,
  error,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={selectId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full bg-[#0A1220] border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 cursor-pointer',
          error && 'border-rose-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0A1220] text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  className,
}) => {
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      )}
      <div className={cn('flex flex-wrap gap-1.5 p-2 bg-[#050B14] border border-white/10 rounded-lg', className)}>
        {options.map((opt) => {
          const active = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleOption(opt.value)}
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors',
                active
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
