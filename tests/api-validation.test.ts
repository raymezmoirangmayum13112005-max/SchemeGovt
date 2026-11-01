import assert from 'node:assert/strict'
import test from 'node:test'
import { AssistantRequestSchema, CitizenProfileSchema, SchemeQuerySchema } from '../lib/validation/schemas'

const validProfile = {
  state: 'Maharashtra',
  district: 'Pune',
  ageGroup: '26-40',
  income: 'up-to-1l',
  occupation: 'farmer',
  residence: 'rural',
  housing: 'owns-kutcha',
  familySize: '3-4',
  needs: ['agriculture'],
}

test('citizen profile validation accepts questionnaire data and rejects unsafe fields', () => {
  assert.equal(CitizenProfileSchema.safeParse(validProfile).success, true)
  assert.equal(CitizenProfileSchema.safeParse({ ...validProfile, district: '<script>' }).success, false)
  assert.equal(CitizenProfileSchema.safeParse({ ...validProfile, aadhaar: '1234' }).success, false)
})

test('assistant request validation bounds input and rejects unknown properties', () => {
  assert.equal(AssistantRequestSchema.safeParse({ question: 'How do I apply?' }).success, true)
  assert.equal(AssistantRequestSchema.safeParse({ question: 'x'.repeat(2001) }).success, false)
  assert.equal(AssistantRequestSchema.safeParse({ question: 'Hello', unexpected: true }).success, false)
  assert.equal(AssistantRequestSchema.safeParse({ question: 'Hello', language: 'not-a-language' }).success, false)
  assert.equal(AssistantRequestSchema.safeParse({ question: 'Hello', language: 'mni' }).success, true)
})

test('scheme filters validate state, category, level, district, and query', () => {
  assert.equal(SchemeQuerySchema.safeParse({
    state: 'Manipur',
    category: 'education',
    governmentLevel: 'state',
    district: 'Imphal West',
    q: 'scholarship',
  }).success, true)
  assert.equal(SchemeQuerySchema.safeParse({ governmentLevel: 'unknown' }).success, false)
  assert.equal(SchemeQuerySchema.safeParse({ district: '<script>' }).success, false)
})
