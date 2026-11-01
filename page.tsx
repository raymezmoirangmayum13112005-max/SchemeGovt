import type { Metadata } from 'next'
import { SchemeDetailClient } from '@/components/schemes/scheme-detail-client'
import { schemeRepository } from '@/lib/server/scheme-repository'

export function generateStaticParams() {
  return schemeRepository.list().map((scheme) => ({ id: scheme.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const scheme = schemeRepository.getById(id)
  if (!scheme) return { title: 'Scheme not found' }
  return { title: scheme.shortName, description: scheme.description }
}

export default async function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SchemeDetailClient id={id} />
}
