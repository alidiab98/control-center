import { useParams } from 'react-router-dom'

/** Placeholder until F2 builds the work folder client. */
export function TelegramPage() {
  const { chatId } = useParams()

  return (
    <section className="px-6 py-6">
      <h1 className="text-lg font-semibold text-text">Work folder</h1>
      <p className="mt-2 text-sm text-muted">
        {chatId === undefined
          ? 'The chat list and conversation arrive in F2.'
          : `Conversation for ${chatId} arrives in F2.`}
      </p>
    </section>
  )
}
