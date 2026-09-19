/**
 * Fixture timestamps are relative to the moment the mock store is created, so the ages in the
 * design screenshots ("2m", "41m") are what the app actually renders, in every mode.
 */
export const minutesAgo = (now: Date, minutes: number): string =>
  new Date(now.getTime() - minutes * 60_000).toISOString()

export const hoursAgo = (now: Date, hours: number): string => minutesAgo(now, hours * 60)

export const daysAgo = (now: Date, days: number): string => minutesAgo(now, days * 24 * 60)

/** Same wall-clock time on an earlier day, used for the dev slot's "deployed 14:20". */
export function atTimeDaysAgo(now: Date, days: number, hour: number, minute: number): string {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}
