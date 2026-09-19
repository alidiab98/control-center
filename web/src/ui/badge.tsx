import { cn } from './cn.js'

export interface BadgeProps {
  count: number
  /** Amber instead of muted, for counters that mean "someone is waiting". */
  tone?: 'muted' | 'attention'
  /** Filled pill, as used by the unread badge in the chat list. */
  solid?: boolean
  className?: string
}

/** Counter pill used by the sidebar nav and the chat list. */
export function Badge({ count, tone = 'muted', solid = false, className }: BadgeProps) {
  const colours = solid
    ? tone === 'attention'
      ? 'bg-attention text-attention-ink'
      : 'bg-panel-2 text-text-2'
    : tone === 'attention'
      ? 'text-attention'
      : 'text-muted'

  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5',
        'font-mono text-xs tabular-nums',
        colours,
        className,
      )}
    >
      {count}
    </span>
  )
}
