import { cn } from './cn.js'

export interface AvatarProps {
  /** Pre-computed initials from the domain model, for example "DT". */
  initials: string
  /** Any stable string; the same seed always picks the same colour. */
  seed?: string
  className?: string
}

const PALETTE = [
  'bg-panel-2 text-text-2',
  'bg-ok/20 text-ok',
  'bg-attention/20 text-attention',
  'bg-idle/25 text-text-2',
] as const

function pickTone(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997
  return PALETTE[hash % PALETTE.length] ?? PALETTE[0]
}

export function Avatar({ initials, seed, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
        'text-xs font-medium',
        pickTone(seed ?? initials),
        className,
      )}
    >
      {initials}
    </span>
  )
}
