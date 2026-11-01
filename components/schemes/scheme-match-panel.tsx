'use client'

import Link from 'next/link'
import { AlertCircle, CircleCheck, CircleHelp, CircleX, ListChecks, RotateCcw } from 'lucide-react'
import { MatchBadge } from '@/components/match-badge'
import { useAppState } from '@/lib/store'
import { useSchemeMatches } from '@/lib/use-scheme-matches'

export function SchemeMatchPanel({ schemeId, eligibility }: { schemeId: string; eligibility: string[] }) {
  const state = useAppState()
  const { matches, loading, error, retry } = useSchemeMatches(state?.profile ?? null)
  const match = matches.find((candidate) => candidate.scheme.id === schemeId) ?? null

  return (
    <section aria-labelledby="eligibility" className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="eligibility" className="flex items-center gap-2.5 text-xl font-semibold text-primary">
          <ListChecks className="size-5 text-teal" aria-hidden="true" />
          Eligibility checklist
        </h2>
        {match && <MatchBadge label={match.label} />}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Listed requirements</h3>
        <ul className="flex flex-col gap-2">
          {eligibility.map((e) => (
            <li key={e} className="flex items-start gap-3 leading-relaxed">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {e}
            </li>
          ))}
        </ul>
      </div>

      {!state ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" aria-hidden="true" />
      ) : error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
          <button type="button" onClick={retry} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" aria-busy="true" />
      ) : match ? (
        <div className="flex flex-col gap-3 rounded-xl bg-muted/70 p-4">
          <h3 className="font-semibold text-foreground">Compared with your answers</h3>
          <ul className="flex flex-col gap-2.5">
            {match.met.map((m) => (
              <li key={m} className="flex items-start gap-2.5">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                <span>
                  <span className="font-medium">Matches: </span>
                  {m}
                </span>
              </li>
            ))}
            {match.notMet.map((m) => (
              <li key={m} className="flex items-start gap-2.5">
                <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                <span>
                  <span className="font-medium">May not match: </span>
                  {m}
                </span>
              </li>
            ))}
            {match.unknown.map((m) => (
              <li key={m} className="flex items-start gap-2.5">
                <CircleHelp className="mt-0.5 size-5 shrink-0 text-warning-foreground" aria-hidden="true" />
                <span>
                  <span className="font-medium">Not yet confirmed: </span>
                  {m}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            This comparison is indicative only. The department will confirm eligibility when you apply.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Answer a few questions to see how your situation compares with these requirements.
          </p>
          <Link href="/eligibility" className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Check my eligibility
          </Link>
        </div>
      )}
    </section>
  )
}
