'use client'

import { Info, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalization } from '@/lib/localization'

export const DISCLAIMER =
  'This tool provides informational guidance only. Final eligibility and approval are determined by the relevant government department.'

export function Disclaimer({ className }: { className?: string }) {
  const { t, language } = useLocalization()
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-warning-foreground/20 bg-warning p-4 text-sm text-warning-foreground',
        className,
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className={cn('text-pretty', language === 'mni' && 'font-meitei')} lang={language === 'mni' ? 'mni-Mtei' : undefined}>
        <strong className="font-semibold">{t('pleaseNote')} </strong>
        {t('eligibilityDisclaimer')}
      </p>
    </div>
  )
}

export function DemoDataBadge({
  className,
  dataStatus = 'demo',
}: {
  className?: string
  dataStatus?: 'demo' | 'verified' | 'catalog-listed'
}) {
  const { t, language } = useLocalization()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
        language === 'mni' && 'font-meitei',
      )}
      lang={language === 'mni' ? 'mni-Mtei' : undefined}
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      {dataStatus === 'catalog-listed'
        ? t('listedMySchemeBadge')
        : dataStatus === 'verified'
          ? t('verifiedDataBadge')
          : t('demoDataBadge')}
    </span>
  )
}
