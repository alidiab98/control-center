import { errorMessage } from '../lib/errors.js'
import { Button } from './button.js'
import { cn } from './cn.js'

export interface ErrorStateProps {
  title: string
  error?: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title, error, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-card border border-attention bg-panel p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text">{title}</p>
        {error !== undefined && (
          <p className="font-mono text-xs text-muted">{errorMessage(error)}</p>
        )}
      </div>
      {onRetry !== undefined && (
        <Button size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
