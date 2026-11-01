import type { Metadata } from 'next'
import { EligibilityClient } from '@/components/eligibility/eligibility-client'

export const metadata: Metadata = {
  title: 'Check eligibility',
  description: 'Answer a few simple questions to find welfare schemes that may be relevant to you.',
}

export default function EligibilityPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary text-balance md:text-4xl">
          Find schemes for you
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Answer 5 short sections. There are no right or wrong answers.
        </p>
      </div>
      <EligibilityClient />
    </main>
  )
}
