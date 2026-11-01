import assert from 'node:assert/strict'
import test from 'node:test'
import { getDocumentLanguage, getInterfaceText, parseInterfaceLanguage } from '../lib/localization'
import { isLanguageCode } from '../lib/ai/languages'
import {
  getSpeechVoice,
  isMeiteiMayekText,
  supportsSpeechRecognition,
  supportsSpeechSynthesis,
} from '../lib/voice'

test('interface language preference maps to appropriate document language and defaults safely', () => {
  assert.equal(parseInterfaceLanguage('mni'), 'mni')
  assert.equal(parseInterfaceLanguage('unsupported'), 'en')
  assert.equal(getDocumentLanguage('mni'), 'mni-Mtei')
  assert.equal(getDocumentLanguage('en'), 'en')
  assert.match(getInterfaceText('mni', 'home'), /[\uabc0-\uabff]/u)
  assert.match(getInterfaceText('mni', 'dashboardTitle'), /[\uabc0-\uabff]/u)
  assert.match(getInterfaceText('mni', 'noSavedSchemes'), /[\uabc0-\uabff]/u)
  assert.equal(isLanguageCode('mni'), true)
})

test('dashboard interface labels have Meitei Mayek translations without English fallback', () => {
  const dashboardKeys = [
    'dashboardTitle',
    'dashboardProfileWelcome',
    'dashboardWelcome',
    'editAnswers',
    'startQuestionnaire',
    'askAssistant',
    'recommendedPanel',
    'seeAll',
    'retry',
    'checkingAnswers',
    'noCloseMatches',
    'noProfileYet',
    'savedPanel',
    'noSavedSchemes',
    'browseSchemes',
    'documentProgressPanel',
    'documentCount',
    'openScheme',
    'noDocumentProgress',
    'recentPanel',
    'noRecentSchemes',
    'haveQuestion',
    'assistantHelp',
    'openAssistant',
    'localStorageNotice',
    'clearData',
    'clearDataConfirmation',
    'loadingDashboard',
    'matchError',
    'save',
    'saved',
    'viewDetails',
    'matchExplanation',
    'educationCategory',
    'healthcareCategory',
    'housingCategory',
    'employmentCategory',
    'agricultureCategory',
    'financialCategory',
    'pensionCategory',
    'womenChildrenCategory',
  ] as const

  for (const key of dashboardKeys) {
    const translated = getInterfaceText('mni', key)
    assert.match(translated, /[\uabc0-\uabff]/u, `${key} should contain Meitei Mayek`)
    assert.notEqual(translated, getInterfaceText('en', key), `${key} should not fall back to English`)
  }
})

test('Meitei Mayek glyphs are in Unicode Meetei Mayek block', () => {
  assert.equal(isMeiteiMayekText('ꯃꯤꯇꯩ ꯃꯌꯦꯛ'), true)
  assert.equal(isMeiteiMayekText('Manipuri'), false)
})

test('voice detection reports absent browser APIs instead of assuming support', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  try {
    Reflect.deleteProperty(globalThis, 'window')
    assert.equal(await supportsSpeechRecognition('en'), false)
    assert.equal(await supportsSpeechRecognition('mni'), false)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
  }
})

test('Manipuri voice support is exposed only when the runtime confirms a matching locale', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const availableRecognition = class {
    static available = async ({ langs }: { langs: string[] }) => langs.includes('mni-IN') ? 'available' : 'unavailable'
  }
  const voices = [
    { name: 'English India', voiceURI: 'en-IN', lang: 'en-IN', localService: true, default: true },
    { name: 'Manipuri', voiceURI: 'mni-IN', lang: 'mni-IN', localService: true, default: false },
  ]

  try {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        SpeechRecognition: availableRecognition,
        speechSynthesis: { getVoices: () => voices },
      },
    })
    assert.equal(await supportsSpeechRecognition('mni'), true)
    assert.equal(supportsSpeechSynthesis('mni'), true)
    assert.equal(getSpeechVoice('mni')?.lang, 'mni-IN')

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { SpeechRecognition: class {}, speechSynthesis: { getVoices: () => [voices[0]] } },
    })
    assert.equal(await supportsSpeechRecognition('mni'), false)
    assert.equal(supportsSpeechSynthesis('mni'), false)
    assert.equal(getSpeechVoice('mni'), undefined)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
