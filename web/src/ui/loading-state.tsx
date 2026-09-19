import { cn } from './cn.js'

export interface LoadingStateProps {
  /** Announced while data loads, for example "Loading the queue". */
  label: string
  rows?: number
  className?: string
}

export function LoadingState({ label, rows = 3, className }: LoadingStateProps) {
  return (
    <div role="status" aria-busy="true" className={cn('flex flex-col gap-2', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-card border border-border bg-panel"
        />
      ))}
    </div>
  )
}
