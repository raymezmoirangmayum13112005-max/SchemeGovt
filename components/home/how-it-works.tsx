const STEPS = [
  {
    title: 'Tell us about yourself',
    body: 'Answer a few simple questions about your age, income, work, and household. Sensitive questions are optional.',
  },
  {
    title: 'Discover relevant schemes',
    body: 'See schemes that may suit you, with a clear label showing how well they match your answers.',
  },
  {
    title: 'Get application guidance',
    body: 'Prepare your documents, follow the steps, and apply on the official portal or at your local office.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-y bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="how-heading" className="mb-10 text-3xl font-bold tracking-tight text-primary text-balance">
          How it works
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
