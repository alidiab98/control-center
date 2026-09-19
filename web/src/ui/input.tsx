import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from './cn.js'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Always required: every input has a real label (CLAUDE.md rule 11). */
  label: string
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean
}

export function Input({ label, hideLabel = false, className, ...rest }: InputProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn('text-xs text-muted', hideLabel && 'sr-only')}>
        {label}
      </label>
      <input
        id={id}
        className={cn(
          'h-11 w-full rounded-control border border-border bg-panel px-3 text-sm text-text',
          'placeholder:text-muted focus:border-border-strong',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
