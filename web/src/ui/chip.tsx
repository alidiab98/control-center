import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface ChipProps {
  pressed: boolean
  onToggle: (next: boolean) => void
  children: ReactNode
  disabled?: boolean
  className?: string
}

/** Toggleable context chip, used by the prompt composer. */
export function Chip({ pressed, onToggle, children, disabled = false, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => {
        onToggle(!pressed)
      }}
      className={cn(
        'inline-flex h-8 items-center rounded-control border px-3 text-xs transition-colors',
        pressed
          ? 'border-attention bg-panel-2 text-text'
          : 'border-border bg-panel text-text-2 hover:bg-panel-2',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
