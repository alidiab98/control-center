/**
 * Pure formatting helpers. Features must use these instead of rolling their own, so ages,
 * clocks and durations read the same on every screen.
 */

export type DateInput = Date | string | number

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value))

const pad2 = (value: number): string => String(value).padStart(2, '0')

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Age of `date` measured from `now`: "2m", "41m", "1h 08m", "3d 04h".
 * Future dates and sub-minute ages both read "0m", so a fresh item never shows a negative age.
 */
export function formatAge(now: DateInput, date: DateInput): string {
  const seconds = Math.floor((toDate(now).getTime() - toDate(date).getTime()) / 1000)
  if (!Number.isFinite(seconds) || seconds < MINUTE) return '0m'

  if (seconds < HOUR) return `${String(Math.floor(seconds / MINUTE))}m`
  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR)
    return `${String(hours)}h ${pad2(Math.floor((seconds % HOUR) / MINUTE))}m`
  }
  const days = Math.floor(seconds / DAY)
  return `${String(days)}d ${pad2(Math.floor((seconds % DAY) / HOUR))}h`
}

/** Local wall clock, 24-hour: "11:06". */
export function formatClock(date: DateInput): string {
  const d = toDate(date)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Tracked time: "4h 12m", "1h 08m", "12m". */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / HOUR)
  const minutes = Math.floor((total % HOUR) / MINUTE)
  return hours > 0 ? `${String(hours)}h ${pad2(minutes)}m` : `${String(minutes)}m`
}

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

// Fixed English names: the UI language is English (SPEC section 4) and the runtime locale
// must not change what a test or a screenshot shows.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/**
 * Day separator label: "Today", "Yesterday", a weekday inside the last week ("Fri"),
 * then a date ("19 Sep", or "19 Sep 2025" in another year).
 */
export function formatDayLabel(date: DateInput, now: DateInput = new Date()): string {
  const d = toDate(date)
  const reference = toDate(now)
  const dayDiff = Math.round((startOfDay(reference) - startOfDay(d)) / (DAY * 1000))

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff > 1 && dayDiff < 7) return WEEKDAYS[d.getDay()] ?? ''

  const day = `${String(d.getDate())} ${MONTHS[d.getMonth()] ?? ''}`
  return d.getFullYear() === reference.getFullYear() ? day : `${day} ${String(d.getFullYear())}`
}
