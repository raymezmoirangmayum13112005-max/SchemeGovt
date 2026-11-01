import { FileCheck2, ListChecks, Route } from 'lucide-react'

const FEATURES = [
  {
    Icon: ListChecks,
    title: 'Eligibility matching',
    body: 'We compare your answers with each scheme’s listed criteria and show what matches, what is missing, and what still needs checking.',
  },
  {
    Icon: FileCheck2,
    title: 'Document guidance',
    body: 'See exactly which documents each scheme asks for, and tick them off as you collect them so nothing is forgotten.',
  },
  {
    Icon: Route,
    title: 'Application assistance',
    body: 'Follow simple step-by-step instructions and go straight to the official portal or office where you can apply.',
  },
]

export function FeatureCards() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 flex max-w-2xl flex-col gap-3">
        <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-primary text-balance">
          Help at every step of the way
        </h2>
        <p className="text-muted-foreground text-pretty">
          Government schemes can be hard to understand. SchemeGovt explains them in plain language.
        </p>
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
