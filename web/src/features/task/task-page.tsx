import { useParams } from 'react-router-dom'

/** Placeholder until F3 builds the task workspace. */
export function TaskPage() {
  const { key } = useParams()

  return (
    <section className="px-6 py-6">
      <h1 className="font-mono text-lg font-semibold text-text">{key ?? 'Task'}</h1>
      <p className="mt-2 text-sm text-muted">The task workspace arrives in F3.</p>
    </section>
  )
}
