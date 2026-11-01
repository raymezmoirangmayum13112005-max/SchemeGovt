import { NextResponse } from 'next/server'
import { findSchemeMatches } from '@/lib/server/scheme-service'
import { CitizenProfileSchema } from '@/lib/validation/schemas'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = CitizenProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the profile fields and try again.', details: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
      { status: 400 },
    )
  }

  return NextResponse.json({
    matches: findSchemeMatches(parsed.data),
    disclaimer: 'These results are indicative only. Final eligibility and approval are determined by the relevant government department.',
  })
}
