import { SCHEMES } from './schemes-data'
import type { CitizenProfile, MatchLabel, Scheme, SchemeMatch } from './types'

const LABEL_RANK: Record<MatchLabel, number> = { likely: 0, 'more-info': 1, 'may-not-meet': 2 }

export function matchScheme(scheme: Scheme, profile: CitizenProfile): SchemeMatch {
  const met: string[] = []
  const unknown: string[] = []
  const notMet: string[] = []

  for (const criterion of scheme.criteria) {
    const result = criterion.check(profile)
    if (result === 'met') met.push(criterion.label)
    else if (result === 'unknown') unknown.push(criterion.label)
    else notMet.push(criterion.label)
  }

  const label: MatchLabel = notMet.length > 0 ? 'may-not-meet' : unknown.length > 0 ? 'more-info' : 'likely'
  const needsOverlap = scheme.needs.filter((n) => profile.needs.includes(n))
  const total = scheme.criteria.length || 1
  const score = (met.length / total) * 100 + needsOverlap.length * 15 - notMet.length * 40

  return { scheme, label, met, unknown, notMet, needsOverlap, score }
}

export function matchSchemes(profile: CitizenProfile, schemes: Scheme[] = SCHEMES): SchemeMatch[] {
  return schemes
    .map((s) => matchScheme(s, profile))
    .sort((a, b) => LABEL_RANK[a.label] - LABEL_RANK[b.label] || b.score - a.score)
}
