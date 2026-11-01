import { NextResponse } from 'next/server'
import { getSchemeById } from '@/lib/server/scheme-service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid scheme ID.' }, { status: 400 })
  }

  const scheme = getSchemeById(id)
  if (!scheme) return NextResponse.json({ error: 'Scheme not found.' }, { status: 404 })

  return NextResponse.json({ scheme })
}
