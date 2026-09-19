import type { TrackerStatus } from '@control-center/shared'
import { trackerStatusLabel } from '../lib/labels.js'
import { cn } from './cn.js'

export interface StatusPillProps {
  status: TrackerStatus
  className?: string
}

const TONES: Record<TrackerStatus, string> = {
  open: 'border-border-strong text-muted',
  in_progress: 'border-ok text-ok',
  review: 'border-attention text-attention',
  testing: 'border-attention text-attention',
  done: 'border-ok text-ok',
}

/** Tracker status as shown in the task header. */
export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-3 text-xs',
        TONES[status],
        className,
      )}
    >
      {trackerStatusLabel(status)}
    </span>
  )
}
