export type ClassValue = string | false | null | undefined

/** Join class names. Small on purpose: no clsx/tailwind-merge dependency in this phase. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ')
}
