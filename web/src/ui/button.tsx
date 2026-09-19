import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn.js'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-attention text-attention-ink hover:brightness-110 disabled:hover:brightness-100 font-medium',
  secondary: 'bg-panel text-text border border-border-strong hover:bg-panel-2',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control whitespace-nowrap',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
