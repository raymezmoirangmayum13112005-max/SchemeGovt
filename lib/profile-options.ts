import type {
  AgeGroup,
  Disability,
  FamilySize,
  Gender,
  Housing,
  IncomeRange,
  Need,
  Occupation,
  Residence,
  SocialCategory,
  YesNoUnsure,
} from './types'

export type Option<T extends string> = { value: T; label: string; hint?: string }

export const STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const AGE_GROUPS: Option<AgeGroup>[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: '18-25', label: '18 – 25' },
  { value: '26-40', label: '26 – 40' },
  { value: '41-59', label: '41 – 59' },
  { value: '60-69', label: '60 – 69' },
  { value: '70-plus', label: '70 or above' },
]

export const AGE_RANGES: Record<AgeGroup, [number, number]> = {
  'under-18': [0, 17],
  '18-25': [18, 25],
  '26-40': [26, 40],
  '41-59': [41, 59],
  '60-69': [60, 69],
  '70-plus': [70, 120],
}

export const INCOME_RANGES: Option<IncomeRange>[] = [
  { value: 'up-to-1l', label: 'Up to ₹1 lakh' },
  { value: '1l-2.5l', label: '₹1 lakh – ₹2.5 lakh' },
  { value: '2.5l-3l', label: '₹2.5 lakh – ₹3 lakh' },
  { value: '3l-6l', label: '₹3 lakh – ₹6 lakh' },
  { value: '6l-9l', label: '₹6 lakh – ₹9 lakh' },
  { value: 'above-9l', label: 'Above ₹9 lakh' },
]

export const INCOME_BOUNDS: Record<IncomeRange, [number, number]> = {
  'up-to-1l': [0, 100000],
  '1l-2.5l': [100001, 250000],
  '2.5l-3l': [250001, 300000],
  '3l-6l': [300001, 600000],
  '6l-9l': [600001, 900000],
  'above-9l': [900001, Number.POSITIVE_INFINITY],
}

export const OCCUPATIONS: Option<Occupation>[] = [
  { value: 'farmer', label: 'Farmer', hint: 'Cultivator or farm owner' },
  { value: 'student', label: 'Student' },
  { value: 'salaried', label: 'Salaried employee' },
  { value: 'self-employed', label: 'Self-employed / small business' },
  { value: 'artisan', label: 'Artisan / craftsperson', hint: 'Carpenter, potter, tailor, etc.' },
  { value: 'daily-wage', label: 'Daily wage / unorganised worker' },
  { value: 'unemployed', label: 'Looking for work' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'retired', label: 'Retired' },
]

export const YES_NO_UNSURE: Option<YesNoUnsure>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
]

export const SOCIAL_CATEGORIES: Option<SocialCategory>[] = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'Scheduled Caste (SC)' },
  { value: 'st', label: 'Scheduled Tribe (ST)' },
  { value: 'ews', label: 'EWS' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

export const DISABILITY_OPTIONS: Option<Disability>[] = [
  { value: 'none', label: 'No disability' },
  { value: 'below-40', label: 'Yes, below 40%' },
  { value: '40-79', label: 'Yes, 40% – 79%' },
  { value: '80-plus', label: 'Yes, 80% or more' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

export const GENDERS: Option<Gender>[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

export const RESIDENCES: Option<Residence>[] = [
  { value: 'rural', label: 'Village (rural)' },
  { value: 'urban', label: 'Town or city (urban)' },
]

export const HOUSING_OPTIONS: Option<Housing>[] = [
  { value: 'owns-pucca', label: 'Own a pucca (permanent) house' },
  { value: 'owns-kutcha', label: 'Own a kutcha (temporary) house' },
  { value: 'rented', label: 'Live in a rented house' },
  { value: 'no-house', label: 'Do not have a house' },
]

export const FAMILY_SIZES: Option<FamilySize>[] = [
  { value: '1-2', label: '1 – 2 members' },
  { value: '3-4', label: '3 – 4 members' },
  { value: '5-6', label: '5 – 6 members' },
  { value: '7-plus', label: '7 or more' },
]

export const NEEDS: Option<Need>[] = [
  { value: 'education', label: 'Education', hint: 'Scholarships, fees' },
  { value: 'healthcare', label: 'Healthcare', hint: 'Treatment, insurance' },
  { value: 'housing', label: 'Housing', hint: 'Build or repair a home' },
  { value: 'employment', label: 'Employment', hint: 'Jobs, skills' },
  { value: 'agriculture', label: 'Agriculture', hint: 'Farm income support' },
  { value: 'financial', label: 'Financial help', hint: 'Loans, insurance' },
  { value: 'pension', label: 'Pension', hint: 'Old age, disability' },
  { value: 'women-child', label: 'Women & children', hint: 'Mother, girl child' },
]

export function labelFor<T extends string>(options: Option<T>[], value: T | undefined) {
  return options.find((o) => o.value === value)?.label ?? 'Not provided'
}
