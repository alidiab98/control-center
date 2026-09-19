export interface NotBuiltYetPageProps {
  title: string
  milestone: string
}

/** Every nav destination leads somewhere, even before its milestone starts. */
export function NotBuiltYetPage({ title, milestone }: NotBuiltYetPageProps) {
  return (
    <section className="px-6 py-6">
      <h1 className="text-lg font-semibold text-text">{title}</h1>
      <p className="mt-2 text-sm text-muted">Not built yet · planned for {milestone}.</p>
    </section>
  )
}
