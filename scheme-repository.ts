import { SCHEMES } from '@/lib/schemes-data'
import MANIPUR_SCHEME_DATA from '@/data/manipur-schemes.json'
import type { Need, Scheme, SchemeRecord } from '@/lib/types'
import { z } from 'zod'

const ManipurCatalogEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameManipuri: z.string().nullable(),
  description: z.string(),
  descriptionManipuri: z.string().nullable(),
  governmentLevel: z.enum(['state', 'central']),
  state: z.literal('Manipur'),
  department: z.string().nullable(),
  category: z.array(z.string()),
  eligibility: z.array(z.string()),
  benefits: z.array(z.string()),
  documentsRequired: z.array(z.string()),
  applicationProcess: z.array(z.string()),
  officialSourceUrl: z.string().url(),
  applicationUrl: z.string().url().nullable(),
  lastVerifiedAt: z.string().date(),
  verificationStatus: z.literal('catalog-listed'),
  translationStatus: z.enum(['reviewed', 'pending-review']),
  districts: z.array(z.string()).nullable(),
}).strict()

type ManipurCatalogEntry = z.infer<typeof ManipurCatalogEntrySchema>
const MANIPUR_SCHEMES = z.array(ManipurCatalogEntrySchema).parse(MANIPUR_SCHEME_DATA)

const CATEGORY_NEEDS: Array<[RegExp, Need]> = [
  [/education|scholarship|learning/i, 'education'],
  [/health|wellness|medical/i, 'healthcare'],
  [/housing|shelter/i, 'housing'],
  [/employment|skill|entrepreneurship|business/i, 'employment'],
  [/agriculture|rural|environment/i, 'agriculture'],
  [/pension/i, 'pension'],
  [/women|child/i, 'women-child'],
  [/social welfare|financial|culture|transport|infrastructure/i, 'financial'],
]

function mapCategories(categories: string[]): Need[] {
  const needs = new Set<Need>()
  for (const category of categories) {
    const mapped = CATEGORY_NEEDS.find(([pattern]) => pattern.test(category))?.[1]
    if (mapped) needs.add(mapped)
  }
  return needs.size ? [...needs] : ['financial']
}

function toSchemeRecord(scheme: Scheme): SchemeRecord {
  const { criteria: _criteria, ...record } = scheme

  return {
    ...record,
    category: scheme.needs[0],
    stateApplicability: ['All India'],
    minimumAge: null,
    maximumAge: null,
    minimumIncome: null,
    maximumIncome: null,
    occupationRequirements: scheme.id === 'pm-kisan' ? ['farmer'] : null,
    eligibilityCriteria: scheme.eligibility,
    sourceUrl: scheme.officialUrl,
    governmentLevel: 'central',
    districts: null,
    verificationStatus: 'demo',
  }
}

function toManipurSchemeRecord(scheme: ManipurCatalogEntry): SchemeRecord {
  const needs = mapCategories(scheme.category)
  const officialUrl = scheme.applicationUrl ?? scheme.officialSourceUrl
  return {
    id: scheme.id,
    name: scheme.name,
    shortName: scheme.name,
    ministry: scheme.department ?? 'Department not listed',
    needs,
    description: scheme.description,
    benefits: scheme.benefits,
    eligibility: scheme.eligibility,
    documents: scheme.documentsRequired.map((name, index) => ({ id: `${scheme.id}-document-${index + 1}`, name })),
    applicationSteps: scheme.applicationProcess,
    officialUrl,
    faqs: [],
    contact: null,
    lastVerified: scheme.lastVerifiedAt,
    dataStatus: 'catalog-listed',
    category: needs[0],
    stateApplicability: [scheme.state],
    minimumAge: null,
    maximumAge: null,
    minimumIncome: null,
    maximumIncome: null,
    occupationRequirements: null,
    eligibilityCriteria: scheme.eligibility,
    sourceUrl: scheme.officialSourceUrl,
    governmentLevel: scheme.governmentLevel,
    sourceCategories: scheme.category,
    districts: scheme.districts,
    nameManipuri: scheme.nameManipuri,
    descriptionManipuri: scheme.descriptionManipuri,
    translationStatus: scheme.translationStatus,
    verificationStatus: scheme.verificationStatus,
    officialSourceUrl: scheme.officialSourceUrl,
    applicationUrl: scheme.applicationUrl,
  }
}

export class SchemeRepository {
  private readonly schemes: SchemeRecord[] = [
    ...SCHEMES.map(toSchemeRecord),
    ...MANIPUR_SCHEMES.map(toManipurSchemeRecord),
  ]

  list(filters: {
    state?: string
    category?: Need
    q?: string
    governmentLevel?: 'state' | 'central'
    district?: string
  } = {}): SchemeRecord[] {
    const query = filters.q?.toLocaleLowerCase()

    return this.schemes.filter((scheme) => {
      if (filters.category && !scheme.needs.includes(filters.category)) return false
      if (filters.governmentLevel && scheme.governmentLevel !== filters.governmentLevel) return false
      if (
        filters.state &&
        !scheme.stateApplicability.some(
          (state) => state.toLocaleLowerCase() === 'all india' || state.toLocaleLowerCase() === filters.state?.toLocaleLowerCase(),
        )
      ) {
        return false
      }
      if (
        filters.district &&
        scheme.districts?.length &&
        !scheme.districts.some((district) => district.toLocaleLowerCase() === filters.district?.toLocaleLowerCase())
      ) {
        return false
      }
      if (
        query &&
        !`${scheme.name} ${scheme.shortName} ${scheme.description} ${scheme.ministry} ${scheme.sourceCategories?.join(' ') ?? ''}`
          .toLocaleLowerCase()
          .includes(query)
      ) {
        return false
      }
      return true
    })
  }

  getById(id: string): SchemeRecord | undefined {
    return this.schemes.find((scheme) => scheme.id === id)
  }

  getMatchingScheme(id: string): Scheme | undefined {
    return SCHEMES.find((scheme) => scheme.id === id)
  }

  getManipurCatalogSchemes(): SchemeRecord[] {
    return this.schemes.filter((scheme) => scheme.dataStatus === 'catalog-listed')
  }
}

export const schemeRepository = new SchemeRepository()
