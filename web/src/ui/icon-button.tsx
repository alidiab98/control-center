import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn.js'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control still needs an accessible name. */
  'aria-label': string
  children: ReactNode
}

export function IconButton({ className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-control text-muted',
        'transition-colors hover:bg-panel-2 hover:text-text disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
