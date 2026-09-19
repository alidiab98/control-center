import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface EmptyStateProps {
  title: string
  detail?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, detail, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-2 rounded-card border border-border bg-panel p-6',
        className,
      )}
    >
      <p className="text-sm text-text-2">{title}</p>
      {detail !== undefined && <p className="text-xs text-muted">{detail}</p>}
      {action}
    </div>
  )
}
