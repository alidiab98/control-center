import type { ReactNode } from 'react'
import { cn } from './cn.js'

export type TagTone = 'attention' | 'ok' | 'muted'

export interface TagProps {
  tone?: TagTone
  children: ReactNode
  className?: string
}

const TONES: Record<TagTone, string> = {
  attention: 'text-attention',
  ok: 'text-ok',
  muted: 'text-muted',
}

/** Uppercase mono label such as PERMISSION or TIMELINE. */
export function Tag({ tone = 'muted', children, className }: TagProps) {
  return (
    <span className={cn('font-mono text-xs tracking-wide uppercase', TONES[tone], className)}>
      {children}
    </span>
  )
}
