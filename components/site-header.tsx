'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { HandHeart, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useLocalization } from '@/lib/localization'

const NAV = [
  { href: '/', label: 'home' },
  { href: '/eligibility', label: 'findSchemes' },
  { href: '/schemes', label: 'results' },
  { href: '/dashboard', label: 'dashboard' },
  { href: '/assistant', label: 'assistant' },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { language, setLanguage, translationStatus, t } = useLocalization()

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HandHeart className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold text-primary">SchemeGovt</span>
            <span className="text-xs text-muted-foreground">{t('tagline')}</span>
          </span>
        </Link>

        <nav aria-label={t('mainNavigation')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary',
                    isActive(item.href) && 'bg-secondary text-primary',
                  )}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <label className="sr-only" htmlFor="interface-language">{t('interfaceLanguage')}</label>
          <select
            id="interface-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'en' | 'mni')}
            className="h-9 w-[4.25rem] shrink-0 rounded-lg border bg-card px-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-ring sm:w-auto sm:max-w-36 sm:px-2 sm:text-sm"
          >
            <option value="en">English</option>
            <option value="mni">Manipuri (Meitei Mayek)</option>
          </select>
          <Link
            href="/eligibility"
            className={cn(buttonVariants({ size: 'lg' }), 'hidden h-10 px-4 sm:inline-flex')}
          >
            {t('findMySchemes')}
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border bg-card md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? t('closeMenu') : t('openMenu')}</span>
          </button>
        </div>
      </div>

      {translationStatus === 'pending-review' && (
        <p className="border-t bg-muted/50 px-4 py-2 text-center text-xs text-muted-foreground font-meitei" role="status" lang="mni-Mtei">
          {t('translationReviewNotice')}
        </p>
      )}

      {open && (
        <nav id="mobile-nav" aria-label={t('mobileNavigation')} className="border-t bg-card md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary',
                    isActive(item.href) && 'bg-secondary text-primary',
                  )}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
