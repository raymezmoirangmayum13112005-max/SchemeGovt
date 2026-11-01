import { matchSchemes } from '@/lib/matching'
import type { CitizenProfile, SchemeMatchResponse } from '@/lib/types'
import { schemeRepository } from './scheme-repository'

export function findSchemeMatches(profile: CitizenProfile): SchemeMatchResponse[] {
  const records = new Map(schemeRepository.list().map((scheme) => [scheme.id, scheme]))

  const questionnaireMatches = matchSchemes(profile)
    .map((match) => {
      const scheme = records.get(match.scheme.id)
      if (!scheme) return null

      return {
        label: match.label,
        scheme,
        met: match.met,
        unknown: match.unknown,
        notMet: match.notMet,
        needsOverlap: match.needsOverlap,
        score: match.score,
        missingInformation: match.unknown,
        unmetCriteria: match.notMet,
      }
    })
    .filter((match): match is SchemeMatchResponse => match !== null)

  const stateMatches = profile.state.toLocaleLowerCase() === 'manipur'
    ? schemeRepository.getManipurCatalogSchemes()
        .map((scheme): SchemeMatchResponse | null => {
          const needsOverlap = scheme.needs.filter((need) => profile.needs.includes(need))
          if (!needsOverlap.length) return null
          const unknown = ['The catalogue criteria need to be reviewed against your circumstances.']
          return {
            label: 'more-info',
            scheme,
            met: [],
            unknown,
            notMet: [],
            needsOverlap,
            score: needsOverlap.length * 15,
            missingInformation: unknown,
            unmetCriteria: [],
          }
        })
        .filter((match): match is SchemeMatchResponse => match !== null)
    : []

  return [...questionnaireMatches, ...stateMatches]
}

export function getSchemeById(id: string) {
  return schemeRepository.getById(id)
}
