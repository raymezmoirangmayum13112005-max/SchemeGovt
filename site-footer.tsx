'use client'

import Link from 'next/link'
import { useLocalization } from '@/lib/localization'

export function SiteFooter() {
  const { t, language } = useLocalization()
  return (
    <footer className={`mt-16 border-t bg-primary text-primary-foreground ${language === 'mni' ? 'font-meitei' : ''}`} lang={language === 'mni' ? 'mni-Mtei' : undefined}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold">SchemeGovt</p>
          <p className="text-sm text-primary-foreground/75 text-pretty">
            {t('footerDescription')}
          </p>
        </div>
        <nav aria-label={t('footerNavigation')} className="flex flex-col gap-2 text-sm">
          <Link href="/eligibility" className="hover:underline">{t('findMySchemes')}</Link>
          <Link href="/schemes" className="hover:underline">{t('browseSchemes')}</Link>
          <Link href="/dashboard" className="hover:underline">{t('dashboardTitle')}</Link>
          <Link href="/assistant" className="hover:underline">{t('assistant')}</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm text-primary-foreground/80">
          <p className="font-semibold text-primary-foreground">{t('important')}</p>
          <p className="text-pretty">{t('eligibilityDisclaimer')}</p>
          <p className="text-pretty">
            {t('catalogueDisclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
