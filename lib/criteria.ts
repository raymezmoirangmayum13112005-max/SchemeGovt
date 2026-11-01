import { AGE_RANGES, INCOME_BOUNDS } from './profile-options'
import type { CitizenProfile, Criterion, CriterionResult, Occupation } from './types'

function rangeCheck(
  [low, high]: [number, number],
  min: number,
  max: number,
): CriterionResult {
  if (low >= min && high <= max) return 'met'
  if (high < min || low > max) return 'not-met'
  return 'unknown'
}

export function ageBetween(min: number, max: number, label?: string): Criterion {
  return {
    label: label ?? `Age between ${min} and ${max} years`,
    check: (p) => rangeCheck(AGE_RANGES[p.ageGroup], min, max),
  }
}

export function incomeAtMost(limit: number, label: string): Criterion {
  return {
    label,
    check: (p) => rangeCheck(INCOME_BOUNDS[p.income], 0, limit),
  }
}

export function occupationIn(occupations: Occupation[], label: string): Criterion {
  return {
    label,
    check: (p) => (occupations.includes(p.occupation) ? 'met' : 'not-met'),
  }
}

export function custom(
  label: string,
  check: (p: CitizenProfile) => CriterionResult,
): Criterion {
  return { label, check }
}

export function requiresVerification(label: string): Criterion {
  return { label, check: () => 'unknown' }
}
