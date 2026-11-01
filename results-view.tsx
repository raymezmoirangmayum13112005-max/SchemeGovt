'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertCircle, ClipboardList, Loader2, PencilLine, RotateCcw, Search, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoiceInput } from '@/components/voice-input'
import { Disclaimer } from '@/components/disclaimer'
import { MATCH_META } from '@/components/match-badge'
import { SchemeCard } from './scheme-card'
import { NEEDS } from '@/lib/profile-options'
import { STATES } from '@/lib/profile-options'
import { useAppState } from '@/lib/store'
import { useSchemeMatches } from '@/lib/use-scheme-matches'
import { SchemesResponseSchema } from '@/lib/validation/schemas'
import type { MatchLabel, Need, SchemeRecord } from '@/lib/types'

type MatchFilter = 'all' | MatchLabel

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-secondary',
      )}
    >
      {children}
    </button>
  )
}

export function ResultsView() {
  const state = useAppState()
  const [need, setNeed] = useState<Need | 'all'>('all')
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedState, setSelectedState] = useState('all')
  const [governmentLevel, setGovernmentLevel] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [schemes, setSchemes] = useState<SchemeRecord[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const profile = state?.profile ?? null
  const matchRequest = useSchemeMatches(profile)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (selectedState !== 'all') params.set('state', selectedState)
    if (need !== 'all') params.set('category', need)
    if (query.trim()) params.set('q', query.trim())
    if (governmentLevel !== 'all') params.set('level', governmentLevel)
    if (selectedDistrict !== 'all') params.set('district', selectedDistrict)
    setListLoading(true)
    setListError(null)

    fetch(`/api/schemes?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json()
        if (!response.ok) throw new Error('Unable to load schemes. Please try again.')
        const parsed = SchemesResponseSchema.safeParse(body)
        if (!parsed.success) {
          throw new Error('The server returned an invalid scheme list.')
        }
        setSchemes(parsed.data.schemes)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setListError(cause instanceof Error ? cause.message : 'Unable to load schemes. Please try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setListLoading(false)
      })

    return () => controller.abort()
  }, [selectedState, need, query, governmentLevel, selectedDistrict, retryCount])

  if (!state) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border bg-card" />
        ))}
      </div>
    )
  }

  const matches = matchRequest.matches
  const matchingIds = new Set(schemes.map((scheme) => scheme.id))
  const items = matches.length > 0
    ? matches
        .filter((match) => matchingIds.has(match.scheme.id))
        .filter((match) => matchFilter === 'all' || match.label === matchFilter)
        .map((match) => ({ scheme: match.scheme, match }))
    : schemes.map((scheme) => ({ scheme, match: undefined }))

  const counts = matches.length > 0 ? matches.reduce<Record<MatchLabel, number>>(
    (acc, m) => ({ ...acc, [m.label]: acc[m.label] + 1 }),
    { likely: 0, 'more-info': 0, 'may-not-meet': 0 },
  ) : undefined
  const loading = listLoading || matchRequest.loading

  return (
    <div className="flex flex-col gap-8">
      {profile && counts ? (
        <section
          aria-label="Summary"
          className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
        >
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-foreground">
              We found {counts.likely} scheme{counts.likely === 1 ? '' : 's'} likely relevant to you
            </p>
            <p className="text-sm text-muted-foreground">
              Based on your answers for {profile.district}, {profile.state}. {counts['more-info']} more need extra
              information to check.
            </p>
          </div>
          <Link href="/eligibility" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10')}>
            <PencilLine className="size-4" aria-hidden="true" />
            Edit my answers
          </Link>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-dashed border-teal/50 bg-accent/60 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 size-6 shrink-0 text-accent-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">You are browsing all schemes</p>
              <p className="text-sm text-muted-foreground">
                Answer a few questions to see which schemes may be relevant to you.
              </p>
            </div>
          </div>
          <Link href="/eligibility" className={cn(buttonVariants({ size: 'lg' }), 'h-10')}>
            Find My Schemes
          </Link>
        </section>
      )}

      <Disclaimer />

      <section aria-label="Filters" className="flex flex-col gap-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder="Search schemes by name or keyword"
            aria-label="Search schemes"
            className="h-12 rounded-xl border-2 pl-10 text-base"
          />
        </div>
        <VoiceInput
          onTranscript={(transcript) => setQuery(transcript.slice(0, 100))}
          label="Scheme search speech language"
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground" id="need-filter">Category</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-labelledby="need-filter">
            <Chip active={need === 'all'} onClick={() => setNeed('all')}>All</Chip>
            {NEEDS.map((n) => (
              <Chip key={n.value} active={need === n.value} onClick={() => setNeed(n.value)}>
                {n.label}
              </Chip>
            ))}
          </div>
        </div>
        {counts && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground" id="match-filter">Match</p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-labelledby="match-filter">
              <Chip active={matchFilter === 'all'} onClick={() => setMatchFilter('all')}>All</Chip>
              {(Object.keys(MATCH_META) as MatchLabel[]).map((l) => (
                <Chip key={l} active={matchFilter === l} onClick={() => setMatchFilter(l)}>
                  {MATCH_META[l].label} ({counts[l]})
                </Chip>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="state-filter" className="text-sm font-semibold text-foreground">
            State or union territory
          </label>
          <select
            id="state-filter"
            value={selectedState}
            onChange={(event) => {
              setSelectedState(event.target.value)
              if (event.target.value !== 'Manipur') setSelectedDistrict('all')
            }}
            className="h-11 w-full rounded-xl border-2 border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:max-w-sm"
          >
            <option value="all">All India</option>
            {STATES.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
          <div className="flex flex-col gap-2">
            <label htmlFor="level-filter" className="text-sm font-semibold text-foreground">
              Government level
            </label>
            <select
              id="level-filter"
              value={governmentLevel}
              onChange={(event) => setGovernmentLevel(event.target.value)}
              className="h-11 w-full rounded-xl border-2 border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <option value="all">All levels</option>
              <option value="state">State schemes</option>
              <option value="central">Central schemes</option>
            </select>
          </div>
          {selectedState === 'Manipur' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="district-filter" className="text-sm font-semibold text-foreground">
                Manipur district
              </label>
              <select
                id="district-filter"
                value={selectedDistrict}
                onChange={(event) => setSelectedDistrict(event.target.value)}
                className="h-11 w-full rounded-xl border-2 border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <option value="all">All districts</option>
                {MANIPUR_DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </div>
          )}
        </div>
        {selectedDistrict !== 'all' && (
          <p className="text-xs text-muted-foreground" role="note">
            The current catalogue does not specify district-level applicability. Results may be state-wide; confirm details with the official source.
          </p>
        )}
      </section>

      <p className="sr-only" aria-live="polite">
        Showing {items.length} schemes
      </p>

      {(listError || matchRequest.error) ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {listError ?? matchRequest.error}
          </p>
          <button
            type="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10')}
            onClick={() => {
              setRetryCount((count) => count + 1)
              matchRequest.retry()
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border bg-card text-muted-foreground" aria-live="polite" aria-busy="true">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Finding relevant schemes…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-14 text-center">
          <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-lg font-semibold">No schemes match these filters</p>
          <p className="max-w-md text-muted-foreground">Try a different category or clear your search.</p>
          <button
            type="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-2 h-10')}
            onClick={() => {
              setNeed('all')
              setMatchFilter('all')
              setQuery('')
              setSelectedState('all')
              setGovernmentLevel('all')
              setSelectedDistrict('all')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ scheme, match }) => (
            <li key={scheme.id}>
              <SchemeCard scheme={scheme} match={match} saved={state.saved.includes(scheme.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const MANIPUR_DISTRICTS = [
  'Bishnupur',
  'Chandel',
  'Churachandpur',
  'Imphal East',
  'Imphal West',
  'Jiribam',
  'Kakching',
  'Kamjong',
  'Kangpokpi',
  'Noney',
  'Pherzawl',
  'Senapati',
  'Tamenglong',
  'Tengnoupal',
  'Thoubal',
  'Ukhrul',
]
