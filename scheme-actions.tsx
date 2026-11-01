'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { SaveButton } from './scheme-card'
import { actions, useAppState } from '@/lib/store'

export function SchemeActions({ schemeId, officialUrl }: { schemeId: string; officialUrl: string }) {
  const state = useAppState()

  useEffect(() => {
    actions.markViewed(schemeId)
  }, [schemeId])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: 'lg' }), 'h-10 px-4')}
      >
        Official website
        <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <Link
        href={`/assistant?scheme=${schemeId}`}
        className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Ask about this scheme
      </Link>
      {state && <SaveButton schemeId={schemeId} saved={state.saved.includes(schemeId)} className="h-10" />}
    </div>
  )
}
