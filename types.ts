export type Need =
  | 'education'
  | 'healthcare'
  | 'housing'
  | 'employment'
  | 'agriculture'
  | 'financial'
  | 'pension'
  | 'women-child'

export type AgeGroup = 'under-18' | '18-25' | '26-40' | '41-59' | '60-69' | '70-plus'

export type IncomeRange =
  | 'up-to-1l'
  | '1l-2.5l'
  | '2.5l-3l'
  | '3l-6l'
  | '6l-9l'
  | 'above-9l'

export type Occupation =
  | 'farmer'
  | 'student'
  | 'salaried'
  | 'self-employed'
  | 'artisan'
  | 'daily-wage'
  | 'unemployed'
  | 'homemaker'
  | 'retired'

export type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews' | 'prefer-not'
export type Disability = 'none' | 'below-40' | '40-79' | '80-plus' | 'prefer-not'
export type Gender = 'female' | 'male' | 'other' | 'prefer-not'
export type Residence = 'rural' | 'urban'
export type Housing = 'owns-pucca' | 'owns-kutcha' | 'rented' | 'no-house'
export type FamilySize = '1-2' | '3-4' | '5-6' | '7-plus'
export type YesNoUnsure = 'yes' | 'no' | 'unsure'

export type CitizenProfile = {
  state: string
  district: string
  ageGroup: AgeGroup
  income: IncomeRange
  occupation: Occupation
  ownsFarmland?: YesNoUnsure
  socialCategory?: SocialCategory
  disability?: Disability
  gender?: Gender
  residence: Residence
  housing: Housing
  familySize: FamilySize
  needs: Need[]
}

export type CriterionResult = 'met' | 'unknown' | 'not-met'

export type Criterion = {
  label: string
  check: (profile: CitizenProfile) => CriterionResult
}

export type SchemeDocument = {
  id: string
  name: string
  note?: string
}

export type SchemeFaq = {
  question: string
  answer: string
}

export type SchemeContact = {
  helpline?: string
  note: string
}

export type Scheme = {
  id: string
  name: string
  shortName: string
  ministry: string
  needs: Need[]
  description: string
  benefits: string[]
  eligibility: string[]
  criteria: Criterion[]
  documents: SchemeDocument[]
  applicationSteps: string[]
  officialUrl: string
  faqs: SchemeFaq[]
  contact: SchemeContact | null
  lastVerified: string | null
  dataStatus: 'demo' | 'verified' | 'catalog-listed'
}

export type SchemeRecord = Omit<Scheme, 'criteria'> & {
  category: Need
  stateApplicability: string[]
  minimumAge: number | null
  maximumAge: number | null
  minimumIncome: number | null
  maximumIncome: number | null
  occupationRequirements: Occupation[] | null
  eligibilityCriteria: string[]
  sourceUrl: string
  governmentLevel?: 'state' | 'central'
  sourceCategories?: string[]
  districts?: string[] | null
  nameManipuri?: string | null
  descriptionManipuri?: string | null
  translationStatus?: 'reviewed' | 'pending-review'
  verificationStatus?: 'demo' | 'verified' | 'catalog-listed' | 'pending-review'
  officialSourceUrl?: string
  applicationUrl?: string | null
}

export type MatchLabel = 'likely' | 'more-info' | 'may-not-meet'

export type SchemeMatch = {
  scheme: Scheme
  label: MatchLabel
  met: string[]
  unknown: string[]
  notMet: string[]
  needsOverlap: Need[]
  score: number
}

export type SchemeMatchResponse = Omit<SchemeMatch, 'scheme'> & {
  scheme: SchemeRecord
  missingInformation: string[]
  unmetCriteria: string[]
}

export type SchemeMatchDisplay = Omit<SchemeMatch, 'scheme'>
