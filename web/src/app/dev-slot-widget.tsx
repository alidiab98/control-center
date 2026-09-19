import { useDeploySlot } from '@/api/index.js'
import { formatClock } from '@/lib/format.js'
import { Card, Tag } from '@/ui/index.js'

/** Sidebar footer: what is on the dev slot right now and what goes next. */
export function DevSlotWidget() {
  const { data, isPending, isError } = useDeploySlot()

  return (
    <Card className="p-3">
      <Tag>Dev slot</Tag>
      {isPending && <p className="mt-2 text-xs text-muted">Loading…</p>}
      {isError && <p className="mt-2 text-xs text-attention">Slot unavailable</p>}
      {data !== undefined && (
        <>
          <p className="mt-2 flex items-center gap-2 font-mono text-sm text-text">
            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-ok" />
            {data.currentTaskKey ?? 'empty'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.deployedAt === null
              ? 'never deployed'
              : `deployed ${formatClock(data.deployedAt)}`}
            {data.nextTaskKey !== null && ` · next: ${data.nextTaskKey}`}
          </p>
        </>
      )}
    </Card>
  )
}
