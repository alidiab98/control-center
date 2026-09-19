import { useEffect, useState } from 'react'
import { useApiRuntime } from './use-api.js'

const TICK_MS = 10_000

/**
 * Current time for age labels. Frozen in static mode, so "2m" stays "2m" for the whole of an
 * e2e run; ticking every ten seconds in live mode, so the queue ages in front of you.
 */
export function useNow(): Date {
  const { mode, bootTime } = useApiRuntime()
  const [now, setNow] = useState<Date>(() => (mode === 'static' ? bootTime : new Date()))

  useEffect(() => {
    if (mode === 'static') return undefined

    const id = setInterval(() => {
      setNow(new Date())
    }, TICK_MS)
    return () => {
      clearInterval(id)
    }
  }, [mode])

  return now
}
