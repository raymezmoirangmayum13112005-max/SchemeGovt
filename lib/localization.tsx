'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type InterfaceLanguage = 'en' | 'mni'

const STORAGE_KEY = 'schemegovt.interface-language'

const ENGLISH_MESSAGES = {
  home: 'Home',
  findSchemes: 'Find schemes',
  results: 'My results',
  dashboard: 'Dashboard',
  assistant: 'Ask SchemeGovt',
  tagline: 'Welfare Scheme Assistant',
  findMySchemes: 'Find My Schemes',
  translationReviewNotice: 'Meitei Mayek translations are pending native-speaker review.',
  interfaceLanguage: 'Interface language',
  mainNavigation: 'Main navigation',
  mobileNavigation: 'Mobile navigation',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  dashboardTitle: 'My dashboard',
  dashboardProfileWelcome: 'Showing schemes for your answers in {district}, {state}.',
  dashboardWelcome: 'Answer a few questions to get personalised recommendations.',
  editAnswers: 'Edit my answers',
  startQuestionnaire: 'Start questionnaire',
  askAssistant: 'Ask the assistant',
  recommendedPanel: 'Recommended for you',
  seeAll: 'See all',
  retry: 'Try again',
  checkingAnswers: 'Checking your answers…',
  noCloseMatches: 'No schemes matched your answers closely. Try updating your answers or browse all schemes.',
  noProfileYet: 'You have not answered the questionnaire yet.',
  findSchemesCta: 'Find My Schemes',
  savedPanel: 'Saved schemes',
  noSavedSchemes: 'Save schemes you are interested in to find them quickly here.',
  browseSchemes: 'Browse schemes',
  documentProgressPanel: 'Document progress',
  documentCount: '{done}/{total} documents',
  documentProgressLabel: '{scheme} document progress',
  openScheme: 'Open a scheme',
  noDocumentProgress: 'Open a scheme and tick the documents you have to track your preparation.',
  recentPanel: 'Recently viewed',
  noRecentSchemes: 'Schemes you open will appear here.',
  haveQuestion: 'Have a question?',
  assistantHelp: 'Ask about eligibility, documents, or how to apply in simple language.',
  openAssistant: 'Open assistant',
  localStorageNotice: 'Your answers and progress are stored only on this device.',
  clearData: 'Clear my data',
  clearDataConfirmation: 'Delete your answers, saved schemes, and progress from this device?',
  loadingDashboard: 'Loading dashboard',
  matchError: 'We could not load recommendations. Please try again.',
  likelyRelevant: 'Likely relevant',
  moreInformationNeeded: 'More information needed',
  mayNotMeetCriteria: 'May not meet listed criteria',
  educationCategory: 'Education',
  healthcareCategory: 'Healthcare',
  housingCategory: 'Housing',
  employmentCategory: 'Employment',
  agricultureCategory: 'Agriculture',
  financialCategory: 'Financial help',
  pensionCategory: 'Pension',
  womenChildrenCategory: 'Women & children',
  pleaseNote: 'Please note:',
  eligibilityDisclaimer: 'This tool provides informational guidance only. Final eligibility and approval are determined by the relevant government department.',
  demoDataBadge: 'Demo data · not verified',
  listedMySchemeBadge: 'Listed on myScheme · not independently verified',
  verifiedDataBadge: 'Verified source data',
  saved: 'Saved',
  save: 'Save',
  viewDetails: 'View details',
  matchExplanation: 'How your answers compare',
  matches: 'Matches:',
  doesNotMatch: 'Does not match:',
  needsChecking: 'Needs checking:',
  forScheme: 'for {scheme}',
  allSchemes: 'All schemes',
  footerDescription: 'A prototype assistant that helps citizens discover welfare schemes and prepare to apply.',
  footerNavigation: 'Footer navigation',
  important: 'Important',
  catalogueDisclaimer: 'Some records are demonstration data; others are listed on myScheme but are not independently verified. Always confirm current requirements with the official source or department.',
} as const

type MessageKey = keyof typeof ENGLISH_MESSAGES
type MessageValues = Record<string, string | number>

const MEITEI_MAYEK_MESSAGES: Record<MessageKey, string> = {
  home: 'ꯌꯨꯝ',
  findSchemes: 'ꯁ꯭ꯀꯤꯝ ꯀꯧꯕ',
  results: 'ꯑꯩꯒꯤ ꯐꯪꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ',
  dashboard: 'ꯑꯩꯒꯤ ꯗꯥꯁꯕꯣꯔꯗ',
  assistant: 'ꯁ꯭ꯀꯤꯝꯒꯤ ꯃꯔꯃꯗ ꯍꯪꯖꯕ',
  tagline: 'ꯋꯦꯂꯐꯦꯌꯔ ꯁ꯭ꯀꯤꯝ ꯃꯇꯦꯡ',
  findMySchemes: 'ꯑꯩꯒꯤ ꯁ꯭ꯀꯤꯝ ꯀꯧꯕ',
  translationReviewNotice: 'ꯃꯤꯇꯩ ꯃꯌꯦꯛ ꯂꯣꯟꯁꯤꯡ ꯑꯁꯤ ꯂꯣꯟꯒꯤ ꯈꯪꯕꯁꯤꯡꯅ ꯌꯦꯡꯁꯤꯅꯕ ꯂꯥꯛꯂꯤ꯫',
  interfaceLanguage: 'ꯃꯤꯌꯥꯝ ꯂꯣꯟ',
  mainNavigation: 'ꯃꯈꯥ ꯆꯠꯅꯕ ꯃꯇꯦꯡ',
  mobileNavigation: 'ꯃꯣꯕꯥꯏꯜ ꯃꯇꯦꯡ',
  openMenu: 'ꯃꯦꯅꯨ ꯍꯥꯡꯗꯣꯀꯎ',
  closeMenu: 'ꯃꯦꯅꯨ ꯂꯣꯠꯁꯤꯜꯂꯨ',
  dashboardTitle: 'ꯑꯩꯒꯤ ꯗꯥꯁꯕꯣꯔꯗ',
  dashboardProfileWelcome: '{district}, {state} ꯗꯒꯤ ꯅꯪꯅ ꯄꯤꯈꯤꯕ ꯄꯥꯎꯁꯤꯡꯒꯤ ꯃꯇꯨꯡ ꯏꯟꯅ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯎꯠꯂꯤ꯫',
  dashboardWelcome: 'ꯅꯪꯒꯤ ꯃꯔꯝꯗ ꯂꯥꯛꯄ ꯁ꯭ꯀꯤꯝ ꯄꯤꯅꯕ ꯑꯄꯤꯛꯄ ꯋꯥꯍꯪꯁꯤꯡ ꯄꯤꯌꯨ꯫',
  editAnswers: 'ꯑꯩꯒꯤ ꯄꯥꯎꯁꯤꯡ ꯁꯦꯝꯗꯣꯀꯄ',
  startQuestionnaire: 'ꯋꯥꯍꯪꯁꯤꯡ ꯍꯧꯗꯣꯀꯄ',
  askAssistant: 'ꯃꯇꯦꯡꯒꯤ ꯃꯔꯃꯗ ꯍꯪꯖꯕ',
  recommendedPanel: 'ꯅꯪꯒꯤꯗꯃꯛ ꯄꯥꯟꯈꯤꯕ',
  seeAll: 'ꯄꯨꯝꯅꯃꯛ ꯌꯦꯡꯕ',
  retry: 'ꯑꯃꯨꯛ ꯍꯣꯠꯅꯕ',
  checkingAnswers: 'ꯅꯪꯒꯤ ꯄꯥꯎꯁꯤꯡ ꯌꯦꯡꯂꯤ…',
  noCloseMatches: 'ꯅꯪꯒꯤ ꯄꯥꯎꯁꯤꯡꯒ ꯆꯥꯟꯅꯕ ꯁ꯭ꯀꯤꯝ ꯐꯪꯗꯦ꯫ ꯄꯥꯎꯁꯤꯡ ꯍꯣꯡꯗꯣꯀꯎ ꯅꯠꯔꯒ ꯁ꯭ꯀꯤꯝ ꯄꯨꯝꯅꯃꯛ ꯌꯦꯡꯎ꯫',
  noProfileYet: 'ꯅꯪꯅ ꯋꯥꯍꯪꯁꯤꯡ ꯄꯤꯈꯤꯗ꯭ꯔꯤ꯫',
  findSchemesCta: 'ꯑꯩꯒꯤ ꯁ꯭ꯀꯤꯝ ꯀꯧꯕ',
  savedPanel: 'ꯊꯝꯂꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ',
  noSavedSchemes: 'ꯅꯪꯅ ꯃꯤꯠꯌꯦꯡ ꯄꯤꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯊꯝꯃꯨ, ꯃꯇꯨꯡꯗ ꯐꯖꯅ ꯐꯪꯒꯅꯤ꯫',
  browseSchemes: 'ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯌꯦꯡꯕ',
  documentProgressPanel: 'ꯃꯊꯧ ꯇꯥꯕ ꯄꯥꯎꯆꯦꯁꯤꯡꯒꯤ ꯑꯋꯥꯡꯕ',
  documentCount: 'ꯄꯥꯎꯆꯦ {done}/{total}',
  documentProgressLabel: '{scheme} ꯄꯥꯎꯆꯦꯁꯤꯡ ꯁꯦꯝꯕꯒꯤ ꯑꯋꯥꯡꯕ',
  openScheme: 'ꯁ꯭ꯀꯤꯝ ꯑꯃ ꯍꯥꯡꯗꯣꯀꯎ',
  noDocumentProgress: 'ꯁ꯭ꯀꯤꯝ ꯑꯃ ꯍꯥꯡꯗꯣꯀꯎ ꯑꯃꯁꯨꯡ ꯅꯪꯒꯤ ꯁꯦꯝꯕꯁꯤꯡ ꯌꯦꯡꯅꯕ ꯃꯊꯧ ꯇꯥꯕ ꯄꯥꯎꯆꯦꯁꯤꯡ ꯇꯤꯀ ꯇꯧꯕꯤꯌꯨ꯫',
  recentPanel: 'ꯉꯥꯏꯔꯕ ꯃꯇꯃꯗ ꯌꯦꯡꯈꯤꯕ',
  noRecentSchemes: 'ꯅꯪꯅ ꯍꯥꯡꯗꯣꯀꯈꯤꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯃꯐꯝ ꯑꯁꯤꯗ ꯎꯠꯂꯒꯅꯤ꯫',
  haveQuestion: 'ꯅꯪꯅ ꯋꯥꯍꯪ ꯂꯩꯕ꯭ꯔꯥ?',
  assistantHelp: 'ꯁꯤꯌꯦꯜꯒꯤ ꯃꯇꯦꯡ, ꯃꯊꯧ ꯇꯥꯕ ꯄꯥꯎꯆꯦꯁꯤꯡ ꯅꯠꯔꯒ ꯀꯔꯝꯅ ꯑꯄꯥꯟꯕꯒꯦ ꯍꯪꯖꯕꯤꯌꯨ꯫',
  openAssistant: 'ꯃꯇꯦꯡ ꯍꯥꯡꯗꯣꯀꯎ',
  localStorageNotice: 'ꯅꯪꯒꯤ ꯄꯥꯎꯁꯤꯡ ꯑꯃꯁꯨꯡ ꯑꯋꯥꯡꯕ ꯃꯁꯤ ꯊꯕꯛ ꯑꯁꯤꯗꯒ ꯈꯛꯇ ꯊꯝꯂꯤ꯫',
  clearData: 'ꯑꯩꯒꯤ ꯗꯦꯇ ꯃꯥꯡꯍꯟꯕ',
  clearDataConfirmation: 'ꯅꯪꯒꯤ ꯄꯥꯎꯁꯤꯡ, ꯊꯝꯂꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯑꯃꯁꯨꯡ ꯑꯋꯥꯡꯕ ꯃꯁꯤ ꯗꯤꯚꯥꯏꯁ ꯑꯁꯤꯗꯒ ꯂꯣꯠꯁꯤꯟꯒꯅꯤꯕ꯭ꯔꯥ?',
  loadingDashboard: 'ꯗꯥꯁꯕꯣꯔꯗ ꯂꯣꯗ ꯇꯧꯔꯤ',
  matchError: 'ꯄꯥꯟꯈꯤꯕ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯂꯧꯗꯣꯀꯄ ꯉꯃꯗꯦ꯫ ꯑꯃꯨꯛ ꯍꯣꯠꯅꯕꯤꯌꯨ꯫',
  likelyRelevant: 'ꯆꯥꯟꯅꯕ ꯌꯥꯏ',
  moreInformationNeeded: 'ꯑꯍꯦꯟꯕ ꯄꯥꯎ ꯃꯊꯧ ꯇꯥꯏ',
  mayNotMeetCriteria: 'ꯃꯊꯧ ꯇꯥꯕ ꯃꯌꯥꯝ ꯆꯥꯟꯗꯕ ꯌꯥꯏ',
  educationCategory: 'ꯂꯃꯖꯕ',
  healthcareCategory: 'ꯑꯁꯦꯡꯕ ꯑꯃꯁꯨꯡ ꯑꯍꯦꯟꯕ ꯂꯥꯏꯐꯝ',
  housingCategory: 'ꯂꯩꯐꯝ',
  employmentCategory: 'ꯊꯕꯛ ꯑꯃꯁꯨꯡ ꯂꯥꯛꯄ ꯐꯪꯕ',
  agricultureCategory: 'ꯂꯩꯔꯝ ꯑꯃꯁꯨꯡ ꯂꯩꯔꯣꯝ',
  financialCategory: 'ꯑꯥꯔꯊꯤꯛ ꯃꯇꯦꯡ',
  pensionCategory: 'ꯄꯦꯟꯁꯟ',
  womenChildrenCategory: 'ꯅꯨꯄꯤ ꯑꯃꯁꯨꯡ ꯑꯉꯥꯡ',
  pleaseNote: 'ꯈꯪꯖꯤꯟꯕꯤꯌꯨ:',
  eligibilityDisclaimer: 'ꯃꯁꯤ ꯈꯪꯅꯕ ꯃꯇꯦꯡ ꯈꯛꯇꯅꯤ꯫ ꯑꯔꯣꯏꯕ ꯁꯤꯌꯦꯜ ꯑꯃꯁꯨꯡ ꯑꯃꯨꯛ ꯌꯥꯕ ꯑꯁꯤ ꯁ꯭ꯀꯤꯝ ꯂꯧꯔꯤꯕ ꯗꯤꯄꯥꯔꯠꯃꯦꯟꯠꯅ ꯂꯧꯔꯒꯅꯤ꯫',
  demoDataBadge: 'ꯗꯦꯃꯣ ꯗꯦꯇ · ꯌꯦꯡꯁꯤꯟꯗ꯭ꯔꯤ',
  listedMySchemeBadge: 'myScheme ꯗ ꯂꯩ · ꯈꯛꯇꯅ ꯌꯦꯡꯁꯤꯟꯗ꯭ꯔꯤ',
  verifiedDataBadge: 'ꯌꯦꯡꯁꯤꯟꯈꯤꯕ ꯗꯦꯇ',
  saved: 'ꯊꯝꯈ꯭ꯔꯦ',
  save: 'ꯊꯝꯕ',
  viewDetails: 'ꯃꯔꯃꯗ ꯌꯦꯡꯕ',
  matchExplanation: 'ꯅꯪꯒꯤ ꯄꯥꯎꯁꯤꯡ ꯀꯔꯝꯅ ꯆꯥꯟꯅꯕꯒꯦ',
  matches: 'ꯆꯥꯟꯅꯕ:',
  doesNotMatch: 'ꯆꯥꯟꯗꯕ:',
  needsChecking: 'ꯑꯃꯨꯛ ꯌꯦꯡꯒꯗꯕ:',
  forScheme: '{scheme} ꯒꯤꯗꯃꯛ',
  allSchemes: 'ꯁ꯭ꯀꯤꯝ ꯄꯨꯝꯅꯃꯛ',
  footerDescription: 'ꯃꯤꯌꯥꯝꯅ ꯋꯦꯂꯐꯦꯌꯔ ꯁ꯭ꯀꯤꯝꯁꯤꯡ ꯈꯪꯅꯕ ꯑꯃꯁꯨꯡ ꯑꯄꯥꯟꯕꯒꯤꯗꯃꯛ ꯁꯦꯝꯅꯕ ꯃꯇꯦꯡ ꯄꯤꯕ ꯄ꯭ꯔꯣꯇꯣꯇꯥꯏꯞ ꯑꯃꯅꯤ꯫',
  footerNavigation: 'ꯂꯝꯖꯤꯡꯕ ꯃꯇꯦꯡ',
  important: 'ꯃꯔꯨ ꯇꯥꯕ',
  catalogueDisclaimer: 'ꯃꯈꯜ ꯀꯌꯥ ꯗꯦꯃꯣ ꯗꯦꯇꯅꯤ; ꯑꯇꯩꯁꯤꯡ myScheme ꯗ ꯂꯩꯕ ꯌꯥꯏ ꯑꯗꯨꯕꯨ ꯃꯍꯥꯛ ꯑꯃꯨꯛ ꯌꯦꯡꯁꯤꯟꯗ꯭ꯔꯤ꯫ ꯑꯔꯣꯏꯕ ꯃꯊꯧ ꯇꯥꯕꯁꯤꯡ ꯑꯁꯤ ꯑꯣꯐꯤꯁꯤꯌꯦꯜ ꯁꯣꯔꯁ ꯅꯠꯔꯒ ꯗꯤꯄꯥꯔꯠꯃꯦꯟꯠꯇ ꯈꯪꯖꯤꯟꯕꯤꯌꯨ꯫',
}

export function getDocumentLanguage(language: InterfaceLanguage) {
  return language === 'mni' ? 'mni-Mtei' : 'en'
}

export function parseInterfaceLanguage(value: string | null): InterfaceLanguage {
  return value === 'mni' ? 'mni' : 'en'
}

export function getInterfaceText(language: InterfaceLanguage, key: MessageKey, values?: MessageValues) {
  const message = language === 'mni' ? MEITEI_MAYEK_MESSAGES[key] : ENGLISH_MESSAGES[key]
  return values
    ? message.replace(/\{([^}]+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder))
    : message
}

type LocalizationContextValue = {
  language: InterfaceLanguage
  setLanguage: (language: InterfaceLanguage) => void
  t: (key: MessageKey, values?: MessageValues) => string
  translationStatus: 'reviewed' | 'pending-review'
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null)

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<InterfaceLanguage>('en')
  const [preferenceLoaded, setPreferenceLoaded] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setLanguage(parseInterfaceLanguage(stored))
    setPreferenceLoaded(true)
  }, [])

  useEffect(() => {
    if (!preferenceLoaded) return
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = getDocumentLanguage(language)
    document.documentElement.dir = 'ltr'
  }, [language, preferenceLoaded])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey, values?: MessageValues) => getInterfaceText(language, key, values),
      translationStatus: language === 'mni' ? 'pending-review' as const : 'reviewed' as const,
    }),
    [language],
  )

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
}

export function useLocalization() {
  const value = useContext(LocalizationContext)
  if (!value) throw new Error('useLocalization must be used within LocalizationProvider.')
  return value
}
