import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="px-6 py-6">
      <h1 className="text-lg font-semibold text-text">Nothing here</h1>
      <p className="mt-2 text-sm text-muted">This address does not match any screen.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-attention underline">
        Back to the queue
      </Link>
    </section>
  )
}
