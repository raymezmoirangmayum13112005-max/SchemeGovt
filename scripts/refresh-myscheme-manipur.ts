import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const API = 'https://www.myscheme.gov.in/api/apisetu'
const ORIGIN = 'https://www.myscheme.gov.in'
const OUTPUT = path.join(process.cwd(), 'data', 'manipur-schemes.json')
const DELAY_MS = 1_000

type JsonRecord = Record<string, unknown>

type CatalogScheme = {
  id: string
  name: string
  nameManipuri: null
  description: string
  descriptionManipuri: null
  governmentLevel: 'state' | 'central'
  state: 'Manipur'
  department: string | null
  category: string[]
  eligibility: string[]
  benefits: string[]
  documentsRequired: string[]
  applicationProcess: string[]
  officialSourceUrl: string
  applicationUrl: string | null
  lastVerifiedAt: string
  verificationStatus: 'catalog-listed'
  translationStatus: 'pending-review'
  districts: null
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
  if (typeof value === 'string') {
    let decoded = value
    for (let pass = 0; pass < 3; pass += 1) {
      decoded = decoded
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
    }
    return decoded
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+>/g, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/\*\*/g, '')
      .trim()
  }
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' ')
  if (!isRecord(value)) return ''

  const ownText = typeof value.text === 'string' ? value.text : ''
  const nested = text(value.children)
  return [ownText, nested].filter(Boolean).join(' ').trim()
}

function lines(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*])\s*/, '').trim())
      .filter(Boolean)
  }
  if (!Array.isArray(value)) return []
  return value.map(text).flatMap((line) => line.split(/\r?\n/)).map((line) => line.trim()).filter(Boolean)
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function objectValue(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

function field(record: JsonRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key]
  }
  return undefined
}

function listingItems(payload: unknown): JsonRecord[] {
  const root = objectValue(payload)
  const data = objectValue(root.data)
  const hits = objectValue(data.hits)
  return asArray(hits.items).map((item) => objectValue(objectValue(item).fields))
}

async function requestJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      Origin: ORIGIN,
      Referer: `${ORIGIN}/`,
      'User-Agent': 'SchemeGovt public catalogue refresh/1.0',
    },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`myScheme returned HTTP ${response.status} for ${url}`)
  return response.json()
}

async function search(level: 'State' | 'Central'): Promise<JsonRecord[]> {
  const records: JsonRecord[] = []
  for (let from = 0; ; from += 100) {
    const params = new URLSearchParams({
      lang: 'en',
      q: JSON.stringify([
        { identifier: 'beneficiaryState', value: 'Manipur' },
        { identifier: 'level', value: level },
      ]),
      keyword: '',
      sort: 'multiple_sort',
      from: String(from),
      size: '100',
    })
    const page = listingItems(await requestJson(`${API}/search/schemes?${params}`))
    records.push(...page)
    if (page.length < 100) break
  }
  return records
}

function sourceUrl(slug: string): string {
  return `${ORIGIN}/schemes/${encodeURIComponent(slug)}`
}

async function detail(item: JsonRecord, level: 'State' | 'Central', refreshedAt: string): Promise<CatalogScheme> {
  const slug = String(field(item, 'slug', 'schemeSlug') ?? '')
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`myScheme returned an invalid scheme slug: ${slug}`)

  const payload = objectValue(await requestJson(`${API}/schemes?lang=en&slug=${encodeURIComponent(slug)}`))
  const data = objectValue(payload.data)
  const english = objectValue(data.en)
  const basic = objectValue(english.basicDetails)
  const content = objectValue(english.schemeContent)
  const eligibility = objectValue(english.eligibilityCriteria)
  const name = String(field(basic, 'schemeName', 'schemeShortTitle') ?? field(item, 'schemeName') ?? '').trim()
  if (!name) throw new Error(`myScheme returned no scheme name for ${slug}`)

  const process = asArray(english.applicationProcess)
  const applicationProcess = process.flatMap((entry) => {
    const value = objectValue(entry)
    return asArray(value.process).map(text).filter(Boolean)
  })
  const applications = process
    .map((entry) => objectValue(entry).url)
    .filter((url): url is string => typeof url === 'string' && /^https?:\/\//i.test(url))

  const categories = asArray(basic.schemeCategory)
    .map((category) => String(objectValue(category).label ?? '').trim())
    .filter(Boolean)
  const department = String(
    objectValue(basic.nodalDepartmentName).label ??
    objectValue(basic.nodalMinistryName).label ??
    '',
  ).trim()
  const description =
    text(content.detailedDescription_md) ||
    text(content.briefDescription ?? field(item, 'briefDescription'))
  const url = sourceUrl(slug)

  return {
    id: slug,
    name,
    nameManipuri: null,
    description,
    descriptionManipuri: null,
    governmentLevel: level === 'State' ? 'state' : 'central',
    state: 'Manipur',
    department: department || null,
    category: categories,
    eligibility: lines(text(eligibility.eligibilityDescription_md)),
    benefits: lines(content.benefits),
    documentsRequired: [],
    applicationProcess,
    officialSourceUrl: url,
    applicationUrl: applications[0] ?? null,
    lastVerifiedAt: refreshedAt,
    verificationStatus: 'catalog-listed',
    translationStatus: 'pending-review',
    districts: null,
  }
}

async function main() {
  const refreshedAt = new Date().toISOString().slice(0, 10)
  const listings = [
    ...(await search('State')).map((item) => ({ item, level: 'State' as const })),
    ...(await search('Central')).map((item) => ({ item, level: 'Central' as const })),
  ]
  const unique = new Map<string, (typeof listings)[number]>()
  for (const listing of listings) {
    const slug = String(field(listing.item, 'slug', 'schemeSlug') ?? '')
    if (slug) unique.set(slug, listing)
  }

  const schemes: CatalogScheme[] = []
  for (const [index, [slug, listing]] of [...unique.entries()].entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    process.stdout.write(`Importing ${index + 1}/${unique.size}: ${slug}\n`)
    schemes.push(await detail(listing.item, listing.level, refreshedAt))
  }

  await mkdir(path.dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, `${JSON.stringify(schemes, null, 2)}\n`, 'utf8')
  process.stdout.write(`Saved ${schemes.length} Manipur scheme records to ${OUTPUT}\n`)
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
