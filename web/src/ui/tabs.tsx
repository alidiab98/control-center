import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from './cn.js'

export interface TabItem {
  id: string
  label: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  /** Names the tab list for assistive technology. */
  label: string
  className?: string
}

/** Controlled tab list with arrow-key navigation. Panels are rendered by the caller. */
export function Tabs({ items, activeId, onChange, label, className }: TabsProps) {
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const index = items.findIndex((item) => item.id === activeId)
    const next = items[(index + step + items.length) % items.length]
    if (next) onChange(next.id)
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={move} className={cn('flex gap-1', className)}>
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={`panel-${item.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => {
              onChange(item.id)
            }}
            className={cn(
              'h-11 rounded-control px-3 text-sm transition-colors',
              active
                ? 'border-b-2 border-attention text-text'
                : 'text-muted hover:bg-panel-2 hover:text-text-2',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
