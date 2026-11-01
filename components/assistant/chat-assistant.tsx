'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Bot, Languages, Loader2, RotateCcw, SendHorizontal, ShieldAlert, User, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VoiceInput } from '@/components/voice-input'
import { LANGUAGES, type LanguageCode } from '@/lib/ai/languages'
import { useAppState } from '@/lib/store'
import { AssistantResponseSchema } from '@/lib/validation/schemas'
import { getSpeechVoice, type VoiceLanguage } from '@/lib/voice'

const GENERAL_PROMPTS = [
  'Which schemes help with hospital costs?',
  'What documents do I usually need to apply?',
  'How do I apply for PM-KISAN?',
  'How does this website work?',
]

const MAX_LENGTH = 2000

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  sources?: { name: string; url: string }[]
}

export function ChatAssistant({ schemeId, schemeName }: { schemeId?: string; schemeName?: string }) {
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [lastQuestion, setLastQuestion] = useState('')
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('en')
  const [speechVoiceAvailable, setSpeechVoiceAvailable] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const profile = useAppState()?.profile
  const endRef = useRef<HTMLDivElement>(null)
  const speechRunRef = useRef(0)

  const prompts = schemeName
    ? [
        `Who can apply for ${schemeName}?`,
        `What documents do I need for ${schemeName}?`,
        `How do I apply for ${schemeName}, step by step?`,
        'Explain the benefits in simple words',
      ]
    : GENERAL_PROMPTS

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  useEffect(() => () => {
    speechRunRef.current += 1
    window.speechSynthesis?.cancel()
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechVoiceAvailable(false)
      return
    }
    const updateVoiceAvailability = () => setSpeechVoiceAvailable(Boolean(getSpeechVoice(voiceLanguage)))
    updateVoiceAvailability()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoiceAvailability)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoiceAvailability)
  }, [voiceLanguage])

  function speak(message: ChatMessage) {
    const voice = getSpeechVoice(voiceLanguage)
    if (!voice || !('speechSynthesis' in window)) {
      speechRunRef.current += 1
      window.speechSynthesis?.cancel()
      setSpeakingMessageId(null)
      setVoiceError(voiceLanguage === 'mni'
        ? 'No Manipuri speech voice is installed in this browser. The answer remains available as text.'
        : 'No English speech voice is available in this browser.')
      return
    }

    const playbackId = ++speechRunRef.current
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.onend = () => {
      if (speechRunRef.current === playbackId) setSpeakingMessageId(null)
    }
    utterance.onerror = (event) => {
      if (speechRunRef.current !== playbackId || event.error === 'canceled') return
      setSpeakingMessageId(null)
      setVoiceError('Speech playback failed. The answer remains available as text.')
    }
    setVoiceError(null)
    setSpeakingMessageId(message.id)
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeaking() {
    speechRunRef.current += 1
    window.speechSynthesis?.cancel()
    setSpeakingMessageId(null)
  }

  async function send(text: string, retrying = false) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    if (!retrying) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: trimmed }])
    }
    setLastQuestion(trimmed)
    setInput('')
    setError(null)
    setBusy(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language,
          schemeId,
          profile: profile
            ? {
                state: profile.state,
                ageGroup: profile.ageGroup,
                income: profile.income,
                occupation: profile.occupation,
                residence: profile.residence,
                housing: profile.housing,
                familySize: profile.familySize,
                needs: profile.needs,
                ownsFarmland: profile.ownsFarmland,
              }
            : undefined,
        }),
      })
      const result: unknown = await response.json()
      if (!response.ok) {
        const message =
          typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'We could not get an answer. Please try again.'
        throw new Error(message)
      }
      const parsed = AssistantResponseSchema.safeParse(result)
      if (!parsed.success) {
        throw new Error('The assistant returned an invalid answer. Please try again.')
      }
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: parsed.data.answer,
          sources: parsed.data.sources,
        },
      ])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sorry, something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary">Ask SchemeGovt</h1>
            <p className="text-sm text-muted-foreground">
              {schemeName ? `Questions about ${schemeName}` : 'Questions about schemes, documents, and applying'}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Languages className="size-4 text-muted-foreground" aria-hidden="true" />
          <span>Reply language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="h-10 rounded-lg border-2 bg-card px-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="size-4 text-muted-foreground" aria-hidden="true" />
          <span>Speech language</span>
          <select
            value={voiceLanguage}
            onChange={(event) => {
              setVoiceLanguage(event.target.value as VoiceLanguage)
              setVoiceError(null)
            }}
            className="h-10 rounded-lg border-2 bg-card px-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <option value="en">English</option>
            <option value="mni">Manipuri</option>
          </select>
        </label>
      </header>

      <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Answers are informational and may be based on catalogue listings that are not independently verified. Do not share Aadhaar, bank, or phone numbers in
          chat. Only non-identifying questionnaire details are used as context when available. Final eligibility is decided by the government department.
        </span>
      </p>
      {language === 'mni' && (
        <p role="note" className="text-xs text-muted-foreground">
          Manipuri replies are AI-generated and unreviewed, not official translations. Official scheme names remain in English.
        </p>
      )}
      {!speechVoiceAvailable && (
        <p role="status" className="text-xs text-muted-foreground">
          {voiceLanguage === 'mni'
            ? 'No native Manipuri speech voice is detected. Responses remain available as text.'
            : 'No English speech voice is detected in this browser.'}
        </p>
      )}

      <section
        aria-label="Conversation"
        aria-live="polite"
        className="flex min-h-[50dvh] flex-1 flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:p-5"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">Namaste! Welcome to SchemeGovt. How can I help you today?</p>
              <p className="text-muted-foreground">Tap a question below or type your own.</p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void send(p)}
                  className="rounded-xl border-2 bg-background p-3 text-left text-sm font-medium transition-colors hover:border-teal hover:bg-accent focus-visible:border-ring focus-visible:outline-none"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <li key={m.id} className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full',
                      isUser ? 'bg-teal text-teal-foreground' : 'bg-primary text-primary-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                  </span>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap',
                      isUser ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-muted text-foreground',
                    )}
                  >
                    <span className="sr-only">{isUser ? 'You said: ' : 'Assistant said: '}</span>
                    {m.text}
                    {!isUser && m.sources && m.sources.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-1 border-t border-border/70 pt-2 text-sm">
                        {m.sources.map((source) => (
                          <li key={source.url}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                              Source: {source.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakingMessageId === m.id ? stopSpeaking() : speak(m)}
                        aria-label={speakingMessageId === m.id ? 'Stop speaking response' : 'Read response aloud'}
                        className="mt-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {speakingMessageId === m.id ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
                        {speakingMessageId === m.id ? 'Stop speaking' : 'Read aloud'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
            {busy && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-4" aria-hidden="true" />
                </span>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Thinking...
              </li>
            )}
          </ul>
        )}

        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
            <Button variant="outline" size="sm" onClick={() => void send(lastQuestion, true)} disabled={busy || !lastQuestion}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}
        {voiceError && (
          <p role="status" className="text-sm text-muted-foreground">{voiceError}</p>
        )}
        <div ref={endRef} />
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
        className="sticky bottom-3 flex flex-col gap-2 rounded-2xl border-2 bg-card p-2 shadow-md focus-within:border-ring"
      >
        <VoiceInput onTranscript={(transcript) => setInput(transcript.slice(0, MAX_LENGTH))} />
        <div className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Type your question
        </label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              send(input)
            }
          }}
          rows={1}
          placeholder="Type your question..."
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="lg" className="h-11 px-4" disabled={!input.trim() || busy}>
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <SendHorizontal aria-hidden="true" />}
          <span className="sr-only sm:not-sr-only">{busy ? 'Sending' : 'Send'}</span>
        </Button>
        </div>
      </form>
    </div>
  )
}
