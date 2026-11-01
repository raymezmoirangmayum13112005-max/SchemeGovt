export type VoiceLanguage = 'en' | 'mni'

export function isMeiteiMayekText(value: string) {
  return /[\uabc0-\uabff]/u.test(value)
}

type RecognitionResultAlternative = { transcript: string }
type RecognitionResult = ArrayLike<RecognitionResultAlternative> & { isFinal: boolean }
type RecognitionResultList = ArrayLike<RecognitionResult>

export type RecognitionEventLike = Event & { results: RecognitionResultList }
type RecognitionErrorEventLike = Event & { error: string }

export type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionEventLike) => void) | null
  onerror: ((event: RecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = {
  new(): SpeechRecognitionLike
  available?: (options: { langs: string[]; processLocally: true }) => Promise<string>
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  const browser = window as SpeechWindow
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition
}

export async function supportsSpeechRecognition(language: VoiceLanguage): Promise<boolean> {
  const Constructor = getRecognitionConstructor()
  if (!Constructor) return false
  if (language === 'en') return true
  if (!Constructor.available) return false
  try {
    return await Constructor.available({ langs: ['mni-IN'], processLocally: true }) === 'available'
  } catch {
    return false
  }
}

export function getSpeechVoice(language: VoiceLanguage): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined
  const prefix = language === 'en' ? 'en' : 'mni'
  const voices = window.speechSynthesis.getVoices()
  return voices.find((voice) => {
    const locale = voice.lang.toLocaleLowerCase().replace('_', '-')
    return locale === prefix || locale.startsWith(`${prefix}-`)
  })
}

export function supportsSpeechSynthesis(language: VoiceLanguage): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  return getSpeechVoice(language) !== undefined
}
