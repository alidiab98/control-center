import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from './cn.js'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  hideLabel?: boolean
}

export function Textarea({
  label,
  hideLabel = false,
  className,
  rows = 3,
  ...rest
}: TextareaProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn('text-xs text-muted', hideLabel && 'sr-only')}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-control border border-border bg-panel px-3 py-2.5',
          'text-sm text-text placeholder:text-muted focus:border-border-strong',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
