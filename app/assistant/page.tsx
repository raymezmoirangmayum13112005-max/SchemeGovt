import type { Metadata } from 'next'
import { ChatAssistant } from '@/components/assistant/chat-assistant'
import { getSchemeById } from '@/lib/schemes-data'

export const metadata: Metadata = {
  title: 'AI Assistant',
  description: 'Ask questions about welfare schemes, eligibility, documents, and how to apply in simple language.',
}

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ scheme?: string }>
}) {
  const { scheme } = await searchParams
  const focus = scheme ? getSchemeById(scheme) : undefined

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:py-10">
      <ChatAssistant
        key={focus?.id ?? 'general'}
        schemeId={focus?.id}
        schemeName={focus?.shortName}
      />
    </main>
  )
}
