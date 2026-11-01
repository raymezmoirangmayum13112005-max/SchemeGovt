import { schemeRepository } from './scheme-repository'
import type { AssistantRequest } from '@/lib/validation/schemas'
import { CitizenProfileSchema } from '@/lib/validation/schemas'
import { findSchemeMatches, getSchemeById } from './scheme-service'

function findQuestionScheme(question: string) {
  const normalized = question.toLocaleLowerCase()
  return schemeRepository
    .list()
    .find((scheme) => normalized.includes(scheme.id) || normalized.includes(scheme.shortName.toLocaleLowerCase()))
}

export function answerFromCatalogue(request: AssistantRequest): string {
  const scheme = (request.schemeId && getSchemeById(request.schemeId)) || findQuestionScheme(request.question)
  const question = request.question.toLocaleLowerCase()

  if (scheme) {
    const catalogListed = scheme.dataStatus === 'catalog-listed'
    const sourceLabel = catalogListed ? 'myScheme catalogue record' : 'official website'

    if (/document|paper|certificate|proof/.test(question)) {
      if (catalogListed && scheme.documents.length === 0) {
        return `The ${sourceLabel} does not list required documents for ${scheme.shortName}. This does not mean that no documents are required; please check the official record.`
      }
      if (catalogListed) {
        return `The ${sourceLabel} lists these documents for ${scheme.name}:\n${scheme.documents.map((doc) => `- ${doc.name}${doc.note ? ` (${doc.note})` : ''}`).join('\n')}\n\nThe listing may not reflect current requirements; confirm details with the responsible department.`
      }
      return `The demonstration catalogue lists these documents for ${scheme.shortName}:\n${scheme.documents.map((doc) => `- ${doc.name}${doc.note ? ` (${doc.note})` : ''}`).join('\n')}\n\nPlease confirm the current document requirements on the official website.`
    }

    if (/apply|application|procedure|step|register/.test(question)) {
      if (catalogListed && scheme.applicationSteps.length === 0) {
        return `The ${sourceLabel} does not provide application steps for ${scheme.shortName}. Please check the official record for current instructions.`
      }
      if (catalogListed) {
        return `The ${sourceLabel} lists these application steps for ${scheme.name}:\n${scheme.applicationSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nPlease confirm that these instructions are current with the responsible department.`
      }
      return `The demonstration catalogue lists these steps for ${scheme.shortName}:\n${scheme.applicationSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nPlease confirm the current procedure on the official website.`
    }

    if (/benefit|amount|cover|receive|support/.test(question)) {
      if (catalogListed && scheme.benefits.length === 0) {
        return `The ${sourceLabel} does not provide benefit details for ${scheme.shortName}. Please check the official record for current information.`
      }
      if (catalogListed) {
        return `The ${sourceLabel} describes these benefits for ${scheme.name}:\n${scheme.benefits.map((benefit) => `- ${benefit}`).join('\n')}\n\nThis catalogue listing does not independently verify current benefits; please confirm them with the responsible department.`
      }
      return `The demonstration catalogue describes these benefits for ${scheme.shortName}:\n${scheme.benefits.map((benefit) => `- ${benefit}`).join('\n')}\n\nThis information has not been verified. Please confirm current benefits on the official website.`
    }

    if (/eligib|who can|qualif|requirement/.test(question)) {
      if (catalogListed && scheme.eligibility.length === 0) {
        return `The ${sourceLabel} does not provide eligibility details for ${scheme.shortName}. Please check the official record or contact the responsible department.`
      }
      if (catalogListed) {
        return `The ${sourceLabel} lists these eligibility requirements for ${scheme.name}:\n${scheme.eligibility.map((criterion) => `- ${criterion}`).join('\n')}\n\nThis does not confirm eligibility; the responsible department makes the final decision.`
      }
      return `The demonstration catalogue lists these requirements for ${scheme.shortName}:\n${scheme.eligibility.map((criterion) => `- ${criterion}`).join('\n')}\n\nThis does not confirm eligibility; the relevant department makes the final decision.`
    }

    if (catalogListed) {
      return `${scheme.name}: ${scheme.description || 'The myScheme record does not provide a description.'}\n\nThis record was listed by myScheme; its requirements and current availability are not independently verified. The relevant department makes the final eligibility and approval decision.`
    }

    return `${scheme.shortName}: ${scheme.description}\n\nThe demonstration catalogue lists ${scheme.eligibility.length} eligibility requirements. Ask about eligibility, benefits, documents, or application steps for details. The relevant department makes the final decision.`
  }

  if (/hospital|health|treatment|medical/.test(question)) {
    const healthcareSchemes = schemeRepository.list({ category: 'healthcare' })
    if (healthcareSchemes.length) {
      return `The demonstration catalogue lists these schemes under healthcare:\n${healthcareSchemes.map((item) => `- ${item.shortName}: ${item.description}`).join('\n')}\n\nThe catalogue is unverified. Check the official scheme website for current details.`
    }
  }

  if (/website|how does this|how do i use/.test(question)) {
    return 'You can fill in the questionnaire at /eligibility, browse and filter schemes at /schemes, open a scheme for its listed requirements and application steps, and save schemes to your dashboard at /dashboard. The recommendations are indicative and use demonstration data.'
  }

  const profile = request.profile ? CitizenProfileSchema.safeParse(request.profile) : null
  if (profile?.success) {
    const matches = findSchemeMatches(profile.data).filter((match) => match.label !== 'may-not-meet').slice(0, 3)
    if (matches.length) {
      return `Based on the profile details you chose to share, these schemes may be relevant:\n${matches.map((match) => `- ${match.scheme.shortName}: ${match.label === 'likely' ? 'listed criteria appear to match' : 'more information is needed'}${match.missingInformation.length ? ` (${match.missingInformation.join('; ')})` : ''}`).join('\n')}\n\nThese are indicative matches using demonstration data, not an eligibility decision.`
    }
  }

  return `I can help explain the ${schemeRepository.list().length} schemes in the demonstration catalogue. Ask about a scheme by name, or ask about eligibility, benefits, documents, or application steps. I do not have verified information beyond the catalogue, so please check the official source for current details.`
}

export function getAssistantSystemInstructions() {
  return [
    'You are SchemeGovt, a helpful assistant explaining Indian government welfare schemes.',
    'Answer only from the provided scheme catalogue and user question. Do not add facts, eligibility rules, links, amounts, contacts, or deadlines that are absent from the catalogue.',
    'Some records are imported from the official myScheme catalogue, but catalogue listing is not independent verification of current eligibility or availability. Other records are demonstration data. Say which status applies when discussing facts.',
    'Use only source URLs included with the relevant catalogue record and include a source link in the answer.',
    'Never guarantee eligibility or approval. State that the relevant government department makes the final decision.',
    'Do not request or repeat Aadhaar numbers, bank details, phone numbers, or other identifying information.',
    'Use simple language. Reply in the requested language. If the requested language is Manipuri, use Meitei Mayek script where possible, preserve official English scheme names, and label the wording as an unreviewed translation.',
  ].join(' ')
}

export function getAssistantCatalogue(schemeId?: string, question?: string) {
  const selected = schemeId
    ? getSchemeById(schemeId)
    : question
      ? findQuestionScheme(question)
      : undefined
  const schemes = selected ? [selected] : schemeRepository.list()
  return schemes.map((scheme) => ({
    id: scheme.id,
    name: scheme.name,
    description: selected ? scheme.description : scheme.description.slice(0, 240),
    benefits: selected ? scheme.benefits : [],
    eligibility: selected ? scheme.eligibility : [],
    documents: selected ? scheme.documents : [],
    applicationSteps: selected ? scheme.applicationSteps : [],
    officialUrl: scheme.officialUrl,
    sourceUrl: scheme.sourceUrl,
    dataStatus: scheme.dataStatus,
    governmentLevel: scheme.governmentLevel,
    lastVerified: scheme.lastVerified,
    sourceCategories: scheme.sourceCategories,
  }))
}

export function getAssistantSources(request: AssistantRequest) {
  const selected = (request.schemeId && getSchemeById(request.schemeId)) || findQuestionScheme(request.question)
  const terms = request.question.toLocaleLowerCase().split(/[^\p{L}\p{N}-]+/u).filter((term) => term.length > 2)
  const schemes = selected
    ? [selected]
    : schemeRepository.list()
        .map((scheme) => ({
          scheme,
          score: terms.reduce((score, term) => {
            const text = `${scheme.name} ${scheme.description} ${scheme.ministry} ${scheme.sourceCategories?.join(' ') ?? ''}`.toLocaleLowerCase()
            return score + (text.includes(term) ? 1 : 0)
          }, 0),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ scheme }) => scheme)
  return schemes.map((scheme) => ({
    name: scheme.dataStatus === 'catalog-listed' ? `myScheme: ${scheme.name}` : scheme.shortName,
    url: scheme.officialSourceUrl ?? scheme.sourceUrl,
  }))
}
