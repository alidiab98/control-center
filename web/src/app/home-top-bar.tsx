import { useStats } from '@/api/index.js'
import { formatDuration } from '@/lib/format.js'
import { Button } from '@/ui/index.js'

/**
 * Home top bar. The command input and "New agent" are inert until F5 and the backend phase,
 * so they are rendered disabled rather than pretending to work.
 */
export function HomeTopBar() {
  const { data, isPending, isError } = useStats()

  return (
    <header className="flex items-center gap-4 px-6 py-4">
      <span aria-hidden="true" className="font-mono text-xs text-muted">
        ⌘K
      </span>

      <label htmlFor="command-input" className="sr-only">
        Run a command
      </label>
      <input
        id="command-input"
        disabled
        placeholder="Run a command, open a task, search messages…"
        className="h-11 flex-1 rounded-control border border-border bg-panel px-4 text-sm text-text placeholder:text-muted disabled:cursor-not-allowed"
      />

      <p className="text-sm text-muted">
        Tracked today{' '}
        <span className="font-mono text-text">
          {isPending && '—'}
          {isError && 'n/a'}
          {data !== undefined && formatDuration(data.trackedTodaySeconds)}
        </span>
      </p>
      <p className="text-sm text-muted">
        Agents <span className="font-mono text-text">{data?.agentCount ?? '—'}</span>
      </p>

      <Button variant="primary" disabled title="Available once the backend phase starts">
        New agent
      </Button>
    </header>
  )
}
