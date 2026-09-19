import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn.js'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Draws the amber outline used for the item that needs attention first. */
  emphasis?: boolean
  children: ReactNode
}

export function Card({ emphasis = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border bg-panel',
        emphasis ? 'border-attention' : 'border-border',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
