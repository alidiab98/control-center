import type { AgentState } from '@control-center/shared'
import { cn } from './cn.js'

export interface StateDotProps {
  state: AgentState
  className?: string
}

const DOTS: Record<AgentState, string> = {
  starting: 'bg-ok/60',
  running: 'bg-ok',
  needs_permission: 'bg-attention',
  needs_plan_approval: 'bg-attention',
  needs_answer: 'bg-attention',
  review: 'border border-text bg-transparent',
  stalled: 'bg-idle',
  done: 'bg-idle/60',
}

/** Small state indicator in the agents list. Decorative: the row also names the state. */
export function StateDot({ state, className }: StateDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2 rounded-full', DOTS[state], className)}
    />
  )
}
