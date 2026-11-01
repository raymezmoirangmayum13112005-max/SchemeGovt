import assert from 'node:assert/strict'
import test from 'node:test'
import { answerFromCatalogue } from '../lib/server/assistant-service'
import { AssistantRequestSchema } from '../lib/validation/schemas'
import { findSchemeMatches } from '../lib/server/scheme-service'
import { schemeRepository } from '../lib/server/scheme-repository'
import type { CitizenProfile } from '../lib/types'

const profile: CitizenProfile = {
  state: 'Maharashtra',
  district: 'Pune',
  ageGroup: '26-40',
  income: 'up-to-1l',
  occupation: 'farmer',
  ownsFarmland: 'yes',
  residence: 'rural',
  housing: 'owns-kutcha',
  familySize: '3-4',
  needs: ['agriculture'],
}

test('scheme matching returns explanations without executable criteria', () => {
  const match = findSchemeMatches(profile).find((candidate) => candidate.scheme.id === 'pm-kisan')

  assert.ok(match)
  assert.equal(match.label, 'more-info')
  assert.ok(match.met.includes('Works as a farmer'))
  assert.ok(match.missingInformation.length > 0)
  assert.deepEqual(match.unmetCriteria, match.notMet)
  assert.equal('criteria' in match.scheme, false)
  assert.equal(match.scheme.dataStatus, 'demo')
})

test('scheme repository filters category and search without mutating its catalogue', () => {
  const matches = schemeRepository.list({ category: 'agriculture', q: 'PM-KISAN' })

  assert.deepEqual(matches.map((scheme) => scheme.id), ['pm-kisan'])
  assert.equal(schemeRepository.list().length, 48)
})

test('assistant fallback answers only from the demonstration catalogue', () => {
  const request = AssistantRequestSchema.parse({
    question: 'How do I apply for PM-KISAN?',
    schemeId: 'pm-kisan',
  })
  const answer = answerFromCatalogue(request)

  assert.match(answer, /demonstration catalogue/i)
  assert.match(answer, /official PM-KISAN portal/i)
  assert.match(answer, /confirm the current procedure/i)
})
