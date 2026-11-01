'use client'

import { useAppState } from '@/lib/store'
import { Questionnaire } from './questionnaire'

export function EligibilityClient() {
  const state = useAppState()
  if (!state) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-card" aria-hidden="true" />
  }
  return <Questionnaire initial={state.profile} />
}
