import { z } from 'zod'

export const NeedSchema = z.enum([
  'education',
  'healthcare',
  'housing',
  'employment',
  'agriculture',
  'financial',
  'pension',
  'women-child',
])

export const CitizenProfileSchema = z.object({
  state: z.string().trim().min(1).max(80),
  district: z.string().trim().min(1).max(60).regex(/^[\p{L}\p{M}\d .'-]+$/u),
  ageGroup: z.enum(['under-18', '18-25', '26-40', '41-59', '60-69', '70-plus']),
  income: z.enum(['up-to-1l', '1l-2.5l', '2.5l-3l', '3l-6l', '6l-9l', 'above-9l']),
  occupation: z.enum([
    'farmer',
    'student',
    'salaried',
    'self-employed',
    'artisan',
    'daily-wage',
    'unemployed',
    'homemaker',
    'retired',
  ]),
  ownsFarmland: z.enum(['yes', 'no', 'unsure']).optional(),
  socialCategory: z.enum(['general', 'obc', 'sc', 'st', 'ews', 'prefer-not']).optional(),
  disability: z.enum(['none', 'below-40', '40-79', '80-plus', 'prefer-not']).optional(),
  gender: z.enum(['female', 'male', 'other', 'prefer-not']).optional(),
  residence: z.enum(['rural', 'urban']),
  housing: z.enum(['owns-pucca', 'owns-kutcha', 'rented', 'no-house']),
  familySize: z.enum(['1-2', '3-4', '5-6', '7-plus']),
  needs: z.array(NeedSchema).min(1).max(8),
}).strict()

export const SchemeQuerySchema = z.object({
  state: z.string().trim().min(1).max(80).optional(),
  category: NeedSchema.optional(),
  q: z.string().trim().max(100).optional(),
  governmentLevel: z.enum(['state', 'central']).optional(),
  district: z.string().trim().min(1).max(80).regex(/^[\p{L}\p{M}\d .'-]+$/u).optional(),
})

export const AssistantRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  profile: CitizenProfileSchema.partial().optional(),
  language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'mni']).default('en'),
  schemeId: z.string().trim().min(1).max(80).optional(),
}).strict()

export const SchemeRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  ministry: z.string(),
  needs: z.array(NeedSchema),
  description: z.string(),
  benefits: z.array(z.string()),
  eligibility: z.array(z.string()),
  documents: z.array(z.object({ id: z.string(), name: z.string(), note: z.string().optional() })),
  applicationSteps: z.array(z.string()),
  officialUrl: z.string().url(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  contact: z.object({ helpline: z.string().optional(), note: z.string() }).nullable(),
  lastVerified: z.string().nullable(),
  dataStatus: z.enum(['demo', 'verified', 'catalog-listed']),
  category: NeedSchema,
  stateApplicability: z.array(z.string()),
  minimumAge: z.number().nullable(),
  maximumAge: z.number().nullable(),
  minimumIncome: z.number().nullable(),
  maximumIncome: z.number().nullable(),
  occupationRequirements: z.array(z.enum([
    'farmer',
    'student',
    'salaried',
    'self-employed',
    'artisan',
    'daily-wage',
    'unemployed',
    'homemaker',
    'retired',
  ])).nullable(),
  eligibilityCriteria: z.array(z.string()),
  sourceUrl: z.string().url(),
  governmentLevel: z.enum(['state', 'central']).optional(),
  sourceCategories: z.array(z.string()).optional(),
  districts: z.array(z.string()).nullable().optional(),
  nameManipuri: z.string().nullable().optional(),
  descriptionManipuri: z.string().nullable().optional(),
  translationStatus: z.enum(['reviewed', 'pending-review']).optional(),
  verificationStatus: z.enum(['demo', 'verified', 'catalog-listed', 'pending-review']).optional(),
  officialSourceUrl: z.string().url().optional(),
  applicationUrl: z.string().url().nullable().optional(),
})

export const SchemesResponseSchema = z.object({ schemes: z.array(SchemeRecordSchema) })

export const SchemeMatchesResponseSchema = z.object({
  matches: z.array(z.object({
    scheme: SchemeRecordSchema,
    label: z.enum(['likely', 'more-info', 'may-not-meet']),
    met: z.array(z.string()),
    unknown: z.array(z.string()),
    notMet: z.array(z.string()),
    needsOverlap: z.array(NeedSchema),
    score: z.number(),
    missingInformation: z.array(z.string()),
    unmetCriteria: z.array(z.string()),
  })),
  disclaimer: z.string(),
})

export const AssistantResponseSchema = z.object({
  answer: z.string(),
  source: z.enum(['ai', 'catalogue']),
  sources: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
})

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>
