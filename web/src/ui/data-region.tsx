import type { ReactNode } from 'react'
import { EmptyState } from './empty-state.js'
import { ErrorState } from './error-state.js'
import { LoadingState } from './loading-state.js'

export interface DataRegionProps {
  /** What this region shows, used in the loading and error copy: "the queue". */
  label: string
  isPending: boolean
  isError: boolean
  error?: unknown
  isEmpty?: boolean
  emptyTitle?: string
  emptyDetail?: string
  onRetry?: () => void
  loadingRows?: number
  children: ReactNode
}

/**
 * One place where loading, error and empty look the same on every screen, so feature tasks
 * do not each invent their own.
 */
export function DataRegion({
  label,
  isPending,
  isError,
  error,
  isEmpty = false,
  emptyTitle,
  emptyDetail,
  onRetry,
  loadingRows,
  children,
}: DataRegionProps) {
  if (isPending)
    return (
      <LoadingState
        label={`Loading ${label}`}
        {...(loadingRows !== undefined && { rows: loadingRows })}
      />
    )
  if (isError)
    return (
      <ErrorState
        title={`Could not load ${label}`}
        error={error}
        {...(onRetry !== undefined && { onRetry })}
      />
    )
  if (isEmpty)
    return (
      <EmptyState
        title={emptyTitle ?? `Nothing in ${label}`}
        {...(emptyDetail !== undefined && { detail: emptyDetail })}
      />
    )
  return <>{children}</>
}
