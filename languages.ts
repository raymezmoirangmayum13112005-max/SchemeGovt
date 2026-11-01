export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'mni', label: 'Manipuri (Meitei Mayek)' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['value']

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((l) => l.value === value)
}
