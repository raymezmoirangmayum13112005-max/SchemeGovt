import { CircleCheck, CircleHelp, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchLabel } from '@/lib/types'
import { useLocalization } from '@/lib/localization'

export const MATCH_META: Record<MatchLabel, { label: string; className: string; Icon: typeof CircleCheck }> = {
  likely: {
    label: 'Likely relevant',
    className: 'bg-success/10 text-success border-success/25',
    Icon: CircleCheck,
  },
  'more-info': {
    label: 'More information needed',
    className: 'bg-warning text-warning-foreground border-warning-foreground/20',
    Icon: CircleHelp,
  },
  'may-not-meet': {
    label: 'May not meet listed criteria',
    className: 'bg-muted text-muted-foreground border-border',
    Icon: CircleAlert,
  },
}

export function MatchBadge({ label, className }: { label: MatchLabel; className?: string }) {
  const { t, language } = useLocalization()
  const meta = MATCH_META[label]
  const localizedLabel = label === 'likely'
    ? t('likelyRelevant')
    : label === 'more-info'
      ? t('moreInformationNeeded')
      : t('mayNotMeetCriteria')
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        meta.className,
        className,
        language === 'mni' && 'font-meitei',
      )}
      lang={language === 'mni' ? 'mni-Mtei' : undefined}
    >
      <meta.Icon className="size-3.5" aria-hidden="true" />
      {localizedLabel}
    </span>
  )
}
