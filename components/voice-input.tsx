'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getRecognitionConstructor,
  supportsSpeechRecognition,
  type SpeechRecognitionLike,
  type VoiceLanguage,
} from '@/lib/voice'

export function VoiceInput({
  onTranscript,
  label = 'Speech input language',
}: {
  onTranscript: (transcript: string) => void
  label?: string
}) {
  const [language, setLanguage] = useState<VoiceLanguage>('en')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const id = useId()

  useEffect(() => {
    let active = true
    setSupported(null)
    void supportsSpeechRecognition(language).then((value) => {
      if (active) setSupported(value)
    })
    return () => {
      active = false
    }
  }, [language])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  function startListening() {
    const Constructor = getRecognitionConstructor()
    if (!Constructor || supported !== true) {
      setMessage(language === 'mni'
        ? 'Manipuri speech recognition is not available in this browser. You can type in Meitei Mayek instead.'
        : 'Speech recognition is not available in this browser. You can type your message instead.')
      return
    }

    const recognition = new Constructor()
    recognition.lang = language === 'en' ? 'en-IN' : 'mni-IN'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => {
        const result = event.results[index]
        return result.isFinal ? result[0]?.transcript ?? '' : ''
      }).join(' ').trim()
      if (transcript) onTranscript(transcript)
    }
    recognition.onerror = (event) => {
      setListening(false)
      setMessage(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access was denied. Allow microphone access in your browser settings, or type your message.'
        : `Speech input failed (${event.error}). Please try again or type your message.`)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    setMessage('Listening. You can edit the recognized text before sending.')
    setListening(true)
    try {
      recognition.start()
    } catch {
      setListening(false)
      setMessage('Speech input could not start. Check microphone permissions or type your message.')
    }
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
    setMessage('Voice input stopped. You can edit the recognized text before sending.')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select
        id={id}
        value={language}
        onChange={(event) => {
          recognitionRef.current?.abort()
          setListening(false)
          setLanguage(event.target.value as VoiceLanguage)
          setMessage(null)
        }}
        className="h-10 rounded-lg border bg-card px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
      >
        <option value="en">English voice</option>
        <option value="mni">Manipuri voice</option>
      </select>
      {listening ? (
        <Button type="button" variant="outline" size="icon" aria-label="Stop voice input" onClick={stopListening}>
          <MicOff aria-hidden="true" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Start voice input"
          onClick={startListening}
          disabled={supported === null}
        >
          {supported === true ? <Mic aria-hidden="true" /> : language === 'mni' ? <MicOff aria-hidden="true" /> : <Loader2 className="animate-spin" aria-hidden="true" />}
        </Button>
      )}
      {supported !== true && (
        <span className="text-xs text-muted-foreground" role="status">
          {supported === null
            ? 'Checking speech recognition support…'
            : language === 'mni'
            ? 'Manipuri recognition is not supported here.'
            : 'Speech recognition is not supported here.'}
        </span>
      )}
      {message && <span className="w-full text-xs text-muted-foreground" role="status">{message}</span>}
    </div>
  )
}
