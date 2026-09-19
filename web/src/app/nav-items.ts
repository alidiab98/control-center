import type { CounterState, NavCounters } from '@/api/index.js'

export type NavCounterKey = keyof NavCounters

export interface NavItem {
  label: string
  path: string
  /** Which live counter to show next to the label, if any. */
  counter?: NavCounterKey
  /** Counters that mean "someone is waiting for you" are amber. */
  tone?: 'attention' | 'muted'
}

/** The seven nav entries of SPEC section 8.1, in the order of the design. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Queue', path: '/', counter: 'queue', tone: 'attention' },
  { label: 'Agents board', path: '/agents', counter: 'agents' },
  { label: 'Tasks', path: '/tasks', counter: 'tasks' },
  { label: 'Telegram', path: '/telegram', counter: 'telegram', tone: 'attention' },
  { label: 'Deploy & logs', path: '/deploy' },
  { label: 'Search & memory', path: '/search' },
  { label: 'Reports', path: '/reports' },
]

export const counterFor = (counters: NavCounters, item: NavItem): CounterState | undefined =>
  item.counter === undefined ? undefined : counters[item.counter]
