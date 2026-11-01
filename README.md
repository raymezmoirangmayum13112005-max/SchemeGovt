# SchemeGovt

SchemeGovt is a Next.js App Router application that helps people explore welfare schemes, compare a questionnaire profile with listed criteria, and ask questions about scheme information.

## Run locally

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` to configure the optional assistant provider:

- `OPENAI_API_KEY` — server-only OpenAI API key. If omitted, the assistant uses a grounded fallback based on the local catalogue.
- `OPENAI_MODEL` — optional model name; defaults to `gpt-4o-mini`.

The assistant sends the question and limited questionnaire context to OpenAI only when `OPENAI_API_KEY` is configured. Social category, disability, gender, district, and direct identifiers are not sent. Scheme matching is processed in memory; profile data is not stored by the server. Existing questionnaire answers and saved items are stored in the user's browser local storage.

## API

- `GET /api/schemes?state=Manipur&category=education&level=state&district=Imphal%20West&q=scholarship` — filters by state, category, text, government level (`state` or `central`), and (where the source specifies it) district.
- `GET /api/schemes/[id]` — returns one scheme record, including listed criteria, documents, application steps, source URL, and demonstration-data status.
- `POST /api/schemes/match` — accepts a citizen profile and returns ranked matches with met, unmet, and missing criteria.
- `POST /api/assistant` — accepts `{ "question": "...", "language": "en", "schemeId": "pm-kisan", "profile": {} }` and returns an answer, its source (`ai` or `catalogue`), and relevant source links when identifiable.

Invalid requests return HTTP 400, an unknown scheme returns 404, and assistant provider failures return 502. Profiles are validated with Zod and are not logged or persisted by the API.

## Scheme catalogue and eligibility

The application retains its original 14 demonstration records in `lib/schemes-data.ts`. Manipur catalogue records are stored in `data/manipur-schemes.json`; the current import contains 27 State and 7 Central myScheme listings applicable to Manipur. It records only facts present in the myScheme detail responses. Empty document, benefit, or application fields mean the source did not supply those details; they do not mean that no requirements exist.

The primary source is the [myScheme portal](https://www.myscheme.gov.in/), including its [Manipur search results](https://www.myscheme.gov.in/search/state/all-states). The [Manipur Social Welfare Department](https://socialwelfare.mn.gov.in/en/) is an additional official reference. Imported records link back to their myScheme entry and show the catalogue refresh date. A catalogue refresh date is not an independent verification of eligibility, current availability, or application status. District applicability is not specified in the imported records, so district filters retain state-level records and display a reminder to confirm with the department.

Refresh the snapshot from myScheme's public structured endpoints with:

```bash
pnpm refresh:myscheme-manipur
```

The importer fetches State and Central results for Manipur, retrieves each detail sequentially with a one-second delay, and replaces the JSON snapshot only after the requests complete. It requires internet access but no API key. Review the resulting data and source links before deployment. `lib/server/scheme-repository.ts` adapts both catalogued and demonstration records and can later be replaced with a database adapter.

The scheme matcher only uses profile categories to identify potentially relevant imported records. It does not interpret unstructured official eligibility text as a confirmed match; those results are marked “more information needed.” Final eligibility and approval are determined by the relevant government department.

## Manipuri language and voice

English is the default interface language. The language selector persists the preference in browser local storage and sets the document language metadata. Noto Sans Meetei Mayek is loaded for Unicode Meitei Mayek text. Official myScheme records do not currently provide reviewed Meitei Mayek translations, so scheme names and descriptions remain in English and translation status is explicitly `pending-review`. The interface shows English wherever a reviewed Meitei Mayek string is not available; no translated scheme facts are presented as official.

Chat reply language and voice input/output language are separate from the visual interface language. Speech recognition and synthesis are detected in the browser at runtime. Manipuri speech is offered only when the browser reports a matching native recognition capability or an installed `mni` voice; English voices are never used as Manipuri voices. If unavailable, users can continue with text. Recognized speech is editable before submission. No speech provider API keys are used or exposed.

Matching is indicative only. A recommendation is not a determination of eligibility, and final eligibility and approval are determined by the relevant government department.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```
