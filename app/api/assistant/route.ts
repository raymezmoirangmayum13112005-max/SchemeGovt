import { NextResponse } from 'next/server'
import {
  answerFromCatalogue,
  getAssistantCatalogue,
  getAssistantSources,
  getAssistantSystemInstructions,
} from '@/lib/server/assistant-service'
import { AssistantRequestSchema } from '@/lib/validation/schemas'
import { getSchemeById } from '@/lib/server/scheme-service'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = AssistantRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please enter a question of 1 to 2,000 characters.' },
      { status: 400 },
    )
  }

  if (parsed.data.schemeId && !getSchemeById(parsed.data.schemeId)) {
    return NextResponse.json({ error: 'Scheme not found.' }, { status: 404 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      answer: parsed.data.language === 'mni'
        ? `Manipuri (Meitei Mayek) responses are not available in offline mode. The catalogue's Manipuri translations are pending review.\n\n${answerFromCatalogue(parsed.data)}`
        : answerFromCatalogue(parsed.data),
      source: 'catalogue',
      sources: getAssistantSources(parsed.data),
    })
  }

  const profileContext = parsed.data.profile
    ? {
        state: parsed.data.profile.state,
        ageGroup: parsed.data.profile.ageGroup,
        income: parsed.data.profile.income,
        occupation: parsed.data.profile.occupation,
        residence: parsed.data.profile.residence,
        housing: parsed.data.profile.housing,
        familySize: parsed.data.profile.familySize,
        needs: parsed.data.profile.needs,
        ownsFarmland: parsed.data.profile.ownsFarmland,
      }
    : undefined

  let providerResponse: Response
  try {
    providerResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `${getAssistantSystemInstructions()}\nReply in language code "${parsed.data.language}". The following JSON is the only source of scheme facts:\n${JSON.stringify(getAssistantCatalogue(parsed.data.schemeId, parsed.data.question))}`,
          },
          {
            role: 'user',
            content: JSON.stringify({ question: parsed.data.question, profile: profileContext }),
          },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    return NextResponse.json({ error: 'The assistant service could not be reached. Please try again.' }, { status: 502 })
  }

  if (!providerResponse.ok) {
    return NextResponse.json({ error: 'The assistant service returned an error. Please try again.' }, { status: 502 })
  }

  const responseBody: unknown = await providerResponse.json().catch(() => null)
  const answer =
    typeof responseBody === 'object' &&
    responseBody !== null &&
    'choices' in responseBody &&
    Array.isArray(responseBody.choices) &&
    typeof responseBody.choices[0]?.message?.content === 'string'
      ? responseBody.choices[0].message.content.trim()
      : ''

  if (!answer) {
    return NextResponse.json({ error: 'The assistant service returned an empty answer. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({
    answer: parsed.data.language === 'mni'
      ? `Unreviewed Manipuri translation (not an official translation):\n${answer.slice(0, 4700)}`
      : answer.slice(0, 5000),
    source: 'ai',
    sources: getAssistantSources(parsed.data),
  })
}
