import { cn } from './cn.js'

export interface BadgeProps {
  count: number
  /** Amber instead of muted, for counters that mean "someone is waiting". */
  tone?: 'muted' | 'attention'
  className?: string
}

/** Counter pill used by the sidebar nav and the chat list. */
export function Badge({ count, tone = 'muted', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5',
        'font-mono text-xs tabular-nums',
        tone === 'attention' ? 'bg-attention text-attention-ink' : 'text-muted',
        className,
      )}
    >
      {count}
    </span>
  )
}
