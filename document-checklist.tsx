'use client'

import { Check, FileText, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { actions, useAppState } from '@/lib/store'

export function DocumentChecklist({
  schemeId,
  documents,
}: {
  schemeId: string
  documents: { id: string; name: string; note?: string }[]
}) {
  const state = useAppState()

  const collected = state?.collectedDocs[schemeId] ?? []
  const done = documents.filter((d) => collected.includes(d.id)).length
  const total = documents.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <section aria-labelledby="documents" className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="documents" className="flex items-center gap-2.5 text-xl font-semibold text-primary">
          <FileText className="size-5 text-teal" aria-hidden="true" />
          Required documents
        </h2>
        <p className="text-sm text-muted-foreground">Tick each document once you have it ready.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Preparation progress</span>
          <span className="tabular-nums text-muted-foreground" aria-live="polite">
            {done} of {total} ready
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Document preparation progress"
        >
          <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {documents.map((doc) => {
          const checked = collected.includes(doc.id)
          return (
            <li key={doc.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
                  checked ? 'border-teal bg-accent' : 'border-border hover:border-teal/50',
                  !state && 'pointer-events-none opacity-60',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => actions.toggleDoc(schemeId, doc.id)}
                  disabled={!state}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2',
                    checked ? 'border-teal bg-teal text-teal-foreground' : 'border-input bg-card',
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex flex-col">
                  <span className={cn('font-medium', checked && 'text-accent-foreground')}>{doc.name}</span>
                  {doc.note && <span className="text-sm text-muted-foreground">{doc.note}</span>}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {total === 0 && (
        <p className="text-sm text-muted-foreground">
          The catalogue does not list required documents. Confirm the requirements with the official source.
        </p>
      )}

      {total > 0 && done === total && (
        <p className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-sm font-medium text-success">
          <PartyPopper className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          All documents ready. You can now follow the steps to apply.
        </p>
      )}
    </section>
  )
}
