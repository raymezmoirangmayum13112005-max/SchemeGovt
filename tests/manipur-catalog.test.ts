import assert from 'node:assert/strict'
import test from 'node:test'
import { getAssistantSources } from '../lib/server/assistant-service'
import { findSchemeMatches } from '../lib/server/scheme-service'
import { schemeRepository } from '../lib/server/scheme-repository'
import { AssistantRequestSchema, SchemeRecordSchema } from '../lib/validation/schemas'
import type { CitizenProfile } from '../lib/types'

test('catalog import contains 27 state and 7 central records with source and review metadata', () => {
  const stateSchemes = schemeRepository.list({ governmentLevel: 'state' })
  const centralCatalogSchemes = schemeRepository
    .getManipurCatalogSchemes()
    .filter((scheme) => scheme.governmentLevel === 'central')

  assert.equal(stateSchemes.length, 27)
  assert.equal(centralCatalogSchemes.length, 7)
  for (const scheme of schemeRepository.getManipurCatalogSchemes()) {
    assert.equal(scheme.dataStatus, 'catalog-listed')
    assert.equal(scheme.translationStatus, 'pending-review')
    assert.match(scheme.officialSourceUrl ?? '', /^https:\/\/www\.myscheme\.gov\.in\/schemes\//)
    assert.equal(SchemeRecordSchema.safeParse(scheme).success, true)
  }
})

test('Manipur questionnaire matches remain potentially relevant and do not infer eligibility', () => {
  const profile: CitizenProfile = {
    state: 'Manipur',
    district: 'Imphal West',
    ageGroup: '41-59',
    income: 'up-to-1l',
    occupation: 'homemaker',
    residence: 'urban',
    housing: 'rented',
    familySize: '3-4',
    needs: ['women-child'],
  }
  const match = findSchemeMatches(profile).find((candidate) => candidate.scheme.id === 'inyts')

  assert.ok(match)
  assert.equal(match.label, 'more-info')
  assert.deepEqual(match.met, [])
  assert.deepEqual(match.notMet, [])
  assert.match(match.missingInformation[0], /reviewed against your circumstances/i)
})

test('Manipur schemes support level, district, category, and text filters', () => {
  assert.equal(schemeRepository.list({ governmentLevel: 'state' }).length, 27)
  assert.equal(schemeRepository.list({ governmentLevel: 'central' }).filter((scheme) => scheme.dataStatus === 'catalog-listed').length, 7)
  assert.ok(schemeRepository.list({ state: 'Manipur', q: 'State Merit Scholarship' }).some((scheme) => scheme.id === 'smsm'))
  assert.ok(schemeRepository.list({ state: 'Manipur', category: 'education' }).some((scheme) => scheme.id === 'smsm'))
  assert.ok(schemeRepository.list({ state: 'Manipur', district: 'Imphal West' }).some((scheme) => scheme.id === 'cmat-spie'))
})

test('assistant responses can provide a direct official source for a selected Manipur scheme', () => {
  const request = AssistantRequestSchema.parse({
    question: 'Who can apply for IMA Nongthangleima Yaipha Tengbang Scheme?',
    schemeId: 'inyts',
  })

  assert.deepEqual(getAssistantSources(request), [{
    name: 'myScheme: IMA Nongthangleima Yaipha Tengbang Scheme',
    url: 'https://www.myscheme.gov.in/schemes/inyts',
  }])
})
