import type { Metadata } from 'next'
import { ResultsView } from '@/components/schemes/results-view'

export const metadata: Metadata = {
  title: 'Recommended schemes',
  description: 'Welfare schemes that may be relevant to you, based on your answers.',
}

export default function SchemesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary text-balance md:text-4xl">
          Schemes for you
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Results are sorted by how closely each scheme&apos;s listed criteria match your answers.
        </p>
      </div>
      <ResultsView />
    </main>
  )
}
