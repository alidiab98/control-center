import { describe, expect, it } from 'vitest'
import { formatAge, formatClock, formatDayLabel, formatDuration } from './format.js'

const now = new Date('2026-09-19T11:06:00')

describe('formatAge', () => {
  it('reads minutes under an hour', () => {
    expect(formatAge(now, new Date('2026-09-19T11:04:00'))).toBe('2m')
    expect(formatAge(now, new Date('2026-09-19T10:25:00'))).toBe('41m')
  })

  it('pads minutes once hours appear', () => {
    expect(formatAge(now, new Date('2026-09-19T09:58:00'))).toBe('1h 08m')
  })

  it('switches to days past 24 hours', () => {
    expect(formatAge(now, new Date('2026-09-16T07:00:00'))).toBe('3d 04h')
  })

  it('clamps sub-minute and future dates to 0m', () => {
    expect(formatAge(now, new Date('2026-09-19T11:05:30'))).toBe('0m')
    expect(formatAge(now, new Date('2026-09-19T11:30:00'))).toBe('0m')
  })
})

describe('formatClock', () => {
  it('pads to a 24-hour wall clock', () => {
    expect(formatClock(new Date('2026-09-19T09:48:00'))).toBe('09:48')
    expect(formatClock(new Date('2026-09-19T14:20:00'))).toBe('14:20')
  })
})

describe('formatDuration', () => {
  it('formats tracked time', () => {
    expect(formatDuration(15_120)).toBe('4h 12m')
    expect(formatDuration(4080)).toBe('1h 08m')
    expect(formatDuration(720)).toBe('12m')
  })

  it('floors partial minutes and clamps negatives', () => {
    expect(formatDuration(59)).toBe('0m')
    expect(formatDuration(-10)).toBe('0m')
  })
})

describe('formatDayLabel', () => {
  it('names today and yesterday', () => {
    expect(formatDayLabel(new Date('2026-09-19T09:48:00'), now)).toBe('Today')
    expect(formatDayLabel(new Date('2026-09-18T23:59:00'), now)).toBe('Yesterday')
  })

  it('uses a weekday inside the last week', () => {
    expect(formatDayLabel(new Date('2026-09-14T12:00:00'), now)).toBe('Mon')
  })

  it('falls back to a date, with the year only when it differs', () => {
    expect(formatDayLabel(new Date('2026-08-30T12:00:00'), now)).toBe('30 Aug')
    expect(formatDayLabel(new Date('2025-09-19T12:00:00'), now)).toBe('19 Sep 2025')
  })
})
