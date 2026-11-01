'use client'

import { useEffect, useState } from 'react'
import type { CitizenProfile, SchemeMatchResponse } from '@/lib/types'
import { SchemeMatchesResponseSchema } from '@/lib/validation/schemas'

export function useSchemeMatches(profile: CitizenProfile | null) {
  const [matches, setMatches] = useState<SchemeMatchResponse[]>([])
  const [loading, setLoading] = useState(Boolean(profile))
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const profileJson = profile ? JSON.stringify(profile) : ''

  useEffect(() => {
    if (!profileJson) {
      setMatches([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch('/api/schemes/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: profileJson,
      signal: controller.signal,
    })
      .then(async (response) => {
        const body: unknown = await response.json()
        if (!response.ok) {
          const message =
            typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
              ? body.error
              : 'Unable to load scheme matches.'
          throw new Error(message)
        }
        const parsed = SchemeMatchesResponseSchema.safeParse(body)
        if (!parsed.success) throw new Error('The server returned an invalid matching response.')
        setMatches(parsed.data.matches)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Unable to load scheme matches.')
        setMatches([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [profileJson, retryCount])

  return {
    matches,
    loading,
    error,
    retry: () => setRetryCount((count) => count + 1),
  }
}
