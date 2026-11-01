'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  ExternalLink,
  Gift,
  ListOrdered,
  Loader2,
  Phone,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DemoDataBadge, Disclaimer } from '@/components/disclaimer'
import { SchemeMatchPanel } from '@/components/schemes/scheme-match-panel'
import { DocumentChecklist } from '@/components/schemes/document-checklist'
import { SchemeActions } from '@/components/schemes/scheme-actions'
import type { SchemeRecord } from '@/lib/types'
import { z } from 'zod'
import { SchemeRecordSchema } from '@/lib/validation/schemas'

function Section({
  id,
  title,
  Icon,
  children,
}: {
  id: string
  title: string
  Icon: typeof Gift
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <h2 id={id} className="flex items-center gap-2.5 text-xl font-semibold text-primary">
        <Icon className="size-5 text-teal" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

export function SchemeDetailClient({ id }: { id: string }) {
  const [scheme, setScheme] = useState<SchemeRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch(`/api/schemes/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json()
        if (!response.ok) {
          const message =
            typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
              ? body.error
              : 'Unable to load this scheme.'
          throw new Error(message)
        }
        const parsed = z.object({ scheme: SchemeRecordSchema }).safeParse(body)
        if (!parsed.success) {
          throw new Error('The server returned an invalid scheme.')
        }
        setScheme(parsed.data.scheme)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Unable to load this scheme.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id, retryCount])

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10" aria-busy="true" aria-label="Loading scheme details">
        <div className="mb-6 h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-40 animate-pulse rounded-2xl border bg-card" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-[32rem] animate-pulse rounded-2xl border bg-card" />
          <div className="h-72 animate-pulse rounded-2xl border bg-card" />
        </div>
      </main>
    )
  }

  if (error || !scheme) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-16">
        <p role="alert" className="flex items-start gap-2 text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {error ?? 'Scheme not found.'}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10')}
            onClick={() => setRetryCount((count) => count + 1)}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/schemes" className={cn(buttonVariants({ size: 'lg' }), 'h-10')}>
            Browse schemes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <Link
        href="/schemes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to schemes
      </Link>

      <header className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <DemoDataBadge dataStatus={scheme.dataStatus} />
          {scheme.governmentLevel && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {scheme.governmentLevel === 'state' ? 'Manipur state scheme' : 'Central scheme listed for Manipur'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="size-3.5" aria-hidden="true" />
            {scheme.dataStatus === 'catalog-listed' ? 'myScheme catalogue refreshed: ' : 'Last verified: '}
            {scheme.lastVerified ?? 'Not yet verified'}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary text-balance md:text-4xl">{scheme.name}</h1>
        {scheme.translationStatus === 'pending-review' && (
          <p className="text-sm text-muted-foreground">
            Meitei Mayek name and description are pending review. The official English scheme name is preserved.
          </p>
        )}
        <p className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          {scheme.ministry}
        </p>
        <p className="max-w-3xl text-lg leading-relaxed text-foreground/85 text-pretty">{scheme.description}</p>
        <SchemeActions schemeId={scheme.id} officialUrl={scheme.officialUrl} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Section id="benefits" title="Benefits" Icon={Gift}>
            {scheme.benefits.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {scheme.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">The official catalogue does not provide benefit details for this record.</p>
            )}
          </Section>

          {scheme.eligibility.length > 0 && (
            <SchemeMatchPanel schemeId={scheme.id} eligibility={scheme.eligibility} />
          )}

          <Section id="steps" title="How to apply" Icon={ListOrdered}>
            {scheme.applicationSteps.length > 0 ? (
              <ol className="flex flex-col gap-4">
                {scheme.applicationSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <p className="pt-1 leading-relaxed">
                      <span className="sr-only">Step {index + 1}: </span>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">The official catalogue does not provide application steps for this record.</p>
            )}
            {scheme.applicationUrl && (
              <a
                href={scheme.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: 'lg' }), 'mt-2 h-12 w-full text-base sm:w-fit sm:px-6')}
              >
                Open application resource
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <p className="text-sm text-muted-foreground">
              Official site: <span className="font-medium text-foreground">{new URL(scheme.officialUrl).hostname}</span>.
              Always check that you are on a genuine government website before entering personal details.
            </p>
            <p className="text-sm text-muted-foreground">
              Source: <a className="underline" href={scheme.officialSourceUrl ?? scheme.sourceUrl} target="_blank" rel="noopener noreferrer">
                {scheme.dataStatus === 'catalog-listed' ? 'myScheme official catalogue record' : 'official scheme website'}
              </a>.
              {scheme.applicationUrl && (
                <> Application link: <a className="underline" href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">open source</a>.</>
              )}
              {scheme.dataStatus === 'catalog-listed' && ' The catalogue listing date does not independently verify current eligibility or availability.'}
            </p>
          </Section>

          <section aria-labelledby="faqs" className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
            <h2 id="faqs" className="text-xl font-semibold text-primary">Frequently asked questions</h2>
            <Accordion>
              {scheme.faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="py-4 text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="pb-4 text-base leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <DocumentChecklist schemeId={scheme.id} documents={scheme.documents} />
          <Section id="contact" title="Contact & help" Icon={Phone}>
            {scheme.contact ? (
              <div className="flex flex-col gap-2 text-sm leading-relaxed">
                {scheme.contact.helpline && (
                  <p>Helpline: <span className="font-semibold">{scheme.contact.helpline}</span></p>
                )}
                <p className="text-muted-foreground">{scheme.contact.note}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Verified contact details are not available yet. Please use the official website.
              </p>
            )}
          </Section>
          <Disclaimer />
        </aside>
      </div>
    </main>
  )
}
