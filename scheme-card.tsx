'use client'

import Link from 'next/link'
import { ArrowRight, Bookmark, BookmarkCheck, Building2, CircleCheck, CircleHelp, CircleX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { MatchBadge } from '@/components/match-badge'
import { DemoDataBadge } from '@/components/disclaimer'
import { actions } from '@/lib/store'
import type { Scheme, SchemeMatchDisplay, SchemeRecord } from '@/lib/types'
import type { Need } from '@/lib/types'
import { useLocalization } from '@/lib/localization'

const NEED_TRANSLATION_KEYS: Record<Need, Parameters<ReturnType<typeof useLocalization>['t']>[0]> = {
  education: 'educationCategory',
  healthcare: 'healthcareCategory',
  housing: 'housingCategory',
  employment: 'employmentCategory',
  agriculture: 'agricultureCategory',
  financial: 'financialCategory',
  pension: 'pensionCategory',
  'women-child': 'womenChildrenCategory',
}

export function SaveButton({ schemeId, saved, className }: { schemeId: string; saved: boolean; className?: string }) {
  const { t, language } = useLocalization()
  return (
    <button
      type="button"
      onClick={() => actions.toggleSaved(schemeId)}
      aria-pressed={saved}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-secondary',
        saved ? 'border-teal bg-accent text-accent-foreground' : 'bg-card text-foreground',
        language === 'mni' && 'font-meitei',
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {saved ? t('saved') : t('save')}
    </button>
  )
}

export function SchemeCard({
  scheme,
  match,
  saved,
}: {
  scheme: Scheme | SchemeRecord
  match?: SchemeMatchDisplay
  saved: boolean
}) {
  const { t, language } = useLocalization()
  return (
    <article className={cn('flex h-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md', language === 'mni' && 'font-meitei')} lang={language === 'mni' ? 'mni-Mtei' : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        {match && <MatchBadge label={match.label} />}
        {scheme.needs.slice(0, 2).map((n) => (
          <span key={n} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {t(NEED_TRANSLATION_KEYS[n])}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold leading-snug text-foreground text-balance">
          <Link href={`/schemes/${scheme.id}`} className="hover:text-primary hover:underline">
            {scheme.shortName}
          </Link>
        </h3>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {scheme.ministry}
        </p>
      </div>

      <p className="leading-relaxed text-foreground/85 text-pretty">{scheme.description}</p>

      {match && (
        <ul className="flex flex-col gap-1.5 rounded-xl bg-muted/70 p-3 text-sm" aria-label={t('matchExplanation')}>
          {match.met.slice(0, 2).map((m) => (
            <li key={m} className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span><span className="sr-only">{t('matches')} </span>{m}</span>
            </li>
          ))}
          {match.notMet.slice(0, 1).map((m) => (
            <li key={m} className="flex items-start gap-2">
              <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span><span className="sr-only">{t('doesNotMatch')} </span>{m}</span>
            </li>
          ))}
          {match.unknown.slice(0, 1).map((m) => (
            <li key={m} className="flex items-start gap-2">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden="true" />
              <span><span className="sr-only">{t('needsChecking')} </span>{m}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-1">
        <DemoDataBadge className="w-fit" dataStatus={scheme.dataStatus} />
        <div className="flex items-center gap-2">
          <Link href={`/schemes/${scheme.id}`} className={cn(buttonVariants({ size: 'lg' }), 'h-10 flex-1')}>
            {t('viewDetails')}
            <ArrowRight className="size-4" aria-hidden="true" />
            <span className="sr-only">{t('forScheme', { scheme: scheme.shortName })}</span>
          </Link>
          <SaveButton schemeId={scheme.id} saved={saved} />
        </div>
      </div>
    </article>
  )
}
