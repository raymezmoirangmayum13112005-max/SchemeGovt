'use client'

import Link from 'next/link'
import { AlertCircle, ArrowRight, Bookmark, Bot, Clock, FileCheck2, PencilLine, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { MatchBadge } from '@/components/match-badge'
import { Disclaimer } from '@/components/disclaimer'
import { schemeRepository } from '@/lib/server/scheme-repository'
import { actions, useAppState } from '@/lib/store'
import { useSchemeMatches } from '@/lib/use-scheme-matches'
import { useLocalization } from '@/lib/localization'
import type { Scheme, SchemeRecord } from '@/lib/types'

function Panel({
  id,
  title,
  Icon,
  action,
  children,
}: {
  id: string
  title: string
  Icon: typeof Bookmark
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-2.5 text-lg font-semibold text-primary">
          <Icon className="size-5 text-teal" aria-hidden="true" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Empty({ children, href, cta }: { children: React.ReactNode; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-4">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link href={href} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {cta}
      </Link>
    </div>
  )
}

function SchemeRow({ scheme, trailing }: { scheme: Scheme | SchemeRecord; trailing?: React.ReactNode }) {
  return (
    <li>
      <Link
        href={`/schemes/${scheme.id}`}
        className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:border-teal hover:bg-accent/50"
      >
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{scheme.shortName}</span>
          <span className="truncate text-sm text-muted-foreground">{scheme.ministry}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {trailing}
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
        </span>
      </Link>
    </li>
  )
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-teal" style={{ width: `${value}%` }} />
    </div>
  )
}

export function DashboardView() {
  const { t, language } = useLocalization()
  const state = useAppState()
  const profile = state?.profile ?? null
  const { matches, loading: matchesLoading, error: matchesError, retry } = useSchemeMatches(profile)
  const recommended = matches.filter((match) => match.label !== 'may-not-meet').slice(0, 4)

  if (!state) {
    return (
      <div className={cn('grid gap-6 md:grid-cols-2', language === 'mni' && 'font-meitei')} aria-busy="true" aria-label={t('loadingDashboard')} lang={language === 'mni' ? 'mni-Mtei' : undefined}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border bg-card" />
        ))}
      </div>
    )
  }

  const saved = state.saved.map((id) => schemeRepository.getById(id)).filter((s): s is SchemeRecord => Boolean(s))
  const recent = state.recent.map((id) => schemeRepository.getById(id)).filter((s): s is SchemeRecord => Boolean(s))
  const progress = Object.entries(state.collectedDocs)
    .map(([id, docs]) => {
      const scheme = schemeRepository.getById(id)
      if (!scheme || docs.length === 0) return null
      const done = scheme.documents.filter((d) => docs.includes(d.id)).length
      return { scheme, done, total: scheme.documents.length }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  return (
    <div className={cn('flex flex-col gap-8', language === 'mni' && 'font-meitei')} lang={language === 'mni' ? 'mni-Mtei' : undefined}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            {t('dashboardTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {profile
              ? t('dashboardProfileWelcome', { district: profile.district, state: profile.state })
              : t('dashboardWelcome')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/eligibility" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10')}>
            <PencilLine className="size-4" aria-hidden="true" />
            {profile ? t('editAnswers') : t('startQuestionnaire')}
          </Link>
          <Link href="/assistant" className={cn(buttonVariants({ size: 'lg' }), 'h-10')}>
            <Bot className="size-4" aria-hidden="true" />
            {t('askAssistant')}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          id="recommended"
          title={t('recommendedPanel')}
          Icon={Sparkles}
          action={
            profile && (
              <Link href="/schemes" className="text-sm font-semibold text-primary hover:underline">
                {t('seeAll')}
              </Link>
            )
          }
        >
          {matchesError ? (
            <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t('matchError')}
              </p>
              <button type="button" onClick={retry} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <RotateCcw className="size-4" aria-hidden="true" />
                {t('retry')}
              </button>
            </div>
          ) : matchesLoading ? (
            <div className="flex items-center gap-3 rounded-xl bg-muted p-5 text-sm text-muted-foreground" aria-busy="true">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              {t('checkingAnswers')}
            </div>
          ) : recommended.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recommended.map((m) => (
                <SchemeRow key={m.scheme.id} scheme={m.scheme} trailing={<MatchBadge label={m.label} className="hidden sm:inline-flex" />} />
              ))}
            </ul>
          ) : (
            <Empty href="/eligibility" cta={t('findSchemesCta')}>
              {profile
                ? t('noCloseMatches')
                : t('noProfileYet')}
            </Empty>
          )}
        </Panel>

        <Panel id="saved-schemes" title={t('savedPanel')} Icon={Bookmark}>
          {saved.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {saved.map((s) => (
                <SchemeRow key={s.id} scheme={s} />
              ))}
            </ul>
          ) : (
            <Empty href="/schemes" cta={t('browseSchemes')}>
              {t('noSavedSchemes')}
            </Empty>
          )}
        </Panel>

        <Panel id="document-progress" title={t('documentProgressPanel')} Icon={FileCheck2}>
          {progress.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {progress.map(({ scheme, done, total }) => {
                const pct = Math.round((done / total) * 100)
                return (
                  <li key={scheme.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/schemes/${scheme.id}`} className="font-medium hover:text-primary hover:underline">
                        {scheme.shortName}
                      </Link>
                      <span className="tabular-nums text-muted-foreground">
                        {t('documentCount', { done, total })}
                      </span>
                    </div>
                    <ProgressBar value={pct} label={t('documentProgressLabel', { scheme: scheme.shortName })} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty href="/schemes" cta={t('openScheme')}>
              {t('noDocumentProgress')}
            </Empty>
          )}
        </Panel>

        <Panel id="recently-viewed" title={t('recentPanel')} Icon={Clock}>
          {recent.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recent.map((s) => (
                <SchemeRow key={s.id} scheme={s} />
              ))}
            </ul>
          ) : (
            <Empty href="/schemes" cta={t('browseSchemes')}>
              {t('noRecentSchemes')}
            </Empty>
          )}
        </Panel>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t('haveQuestion')}</p>
            <p className="text-sm text-primary-foreground/80">
              {t('assistantHelp')}
            </p>
          </div>
        </div>
        <Link href="/assistant" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-10')}>
          {t('openAssistant')}
        </Link>
      </section>

      <Disclaimer />

      <div className="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('localStorageNotice')}
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('clearDataConfirmation'))) actions.clearAll()
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('clearData')}
        </button>
      </div>
    </div>
  )
}
