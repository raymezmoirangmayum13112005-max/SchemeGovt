import { NextRequest, NextResponse } from 'next/server'
import { SchemeQuerySchema } from '@/lib/validation/schemas'
import { schemeRepository } from '@/lib/server/scheme-repository'

export function GET(request: NextRequest) {
  const parsed = SchemeQuerySchema.safeParse({
    state: request.nextUrl.searchParams.get('state') ?? undefined,
    category: request.nextUrl.searchParams.get('category') ?? undefined,
    q: request.nextUrl.searchParams.get('q') ?? undefined,
    governmentLevel: request.nextUrl.searchParams.get('level') ?? undefined,
    district: request.nextUrl.searchParams.get('district') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid scheme filters.' }, { status: 400 })
  }

  return NextResponse.json({ schemes: schemeRepository.list(parsed.data) })
}
