import { SCHEMES, getSchemeById } from '@/lib/schemes-data'
import type { Scheme } from '@/lib/types'
import { LANGUAGES, type LanguageCode } from './languages'

export { isLanguageCode } from './languages'

export const ASSISTANT_MODEL = 'openai/gpt-5.4-mini'

function describeScheme(s: Scheme) {
  return [
    `### ${s.name} (id: ${s.id})`,
    `Ministry: ${s.ministry}`,
    `Summary: ${s.description}`,
    `Benefits: ${s.benefits.join('; ')}`,
    `Listed eligibility: ${s.eligibility.join('; ')}`,
    `Documents: ${s.documents.map((d) => d.name + (d.note ? ` (${d.note})` : '')).join('; ')}`,
    `How to apply: ${s.applicationSteps.map((step, i) => `${i + 1}. ${step}`).join(' ')}`,
    `Official website: ${s.officialUrl}`,
    `Contact: ${s.contact?.note ?? 'Not available'}`,
    `Data status: ${s.dataStatus === 'demo' ? 'DEMONSTRATION DATA - not verified' : `Verified ${s.lastVerified}`}`,
  ].join('\n')
}

/**
 * Builds grounded instructions from the scheme catalogue. Swap SCHEMES for a
 * verified scheme database (or a retrieval tool) when moving to production.
 */
export function buildInstructions({ language, schemeId }: { language: LanguageCode; schemeId?: string }) {
  const focus = schemeId ? getSchemeById(schemeId) : undefined
  const languageLabel = LANGUAGES.find((l) => l.value === language)?.label ?? 'English'

  return `You are SchemeGovt, a friendly, patient assistant that helps Indian citizens understand government welfare schemes.

Rules you must always follow:
- Reply in ${languageLabel}. Use short sentences and simple, everyday words. Avoid jargon; explain any official term you must use.
- Only use facts from the SCHEME DATA below. If the answer is not in the data, say you do not know and suggest checking the official website or visiting a Common Service Centre (CSC) or the relevant district office.
- Never guarantee eligibility or approval. Use phrases like "you may be eligible" and remind users that the government department makes the final decision.
- Never invent website links, phone numbers, amounts, deadlines, or rules. Only share URLs that appear in the data.
- The scheme data is demonstration content that has not been verified. Mention this when giving specific amounts or rules.
- Do not ask for Aadhaar numbers, bank details, phone numbers, or other identifying information. If a user shares them, tell them not to share such details in chat.
- You can help users navigate this website: "/eligibility" (questionnaire), "/schemes" (recommendations), "/schemes/<id>" (scheme details and document checklist), "/dashboard" (saved schemes and progress).
- Keep answers focused. Write plain text without markdown headings, bold, or tables. For lists of documents or steps, put each item on its own line starting with "- " or "1. ".
${focus ? `\nThe user is currently asking about: ${focus.name} (id: ${focus.id}). Prioritise this scheme.\n` : ''}
SCHEME DATA:
${SCHEMES.map(describeScheme).join('\n\n')}`
}
