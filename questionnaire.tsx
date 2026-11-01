'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Lock, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OptionGroup } from './option-group'
import {
  AGE_GROUPS,
  DISABILITY_OPTIONS,
  FAMILY_SIZES,
  GENDERS,
  HOUSING_OPTIONS,
  INCOME_RANGES,
  NEEDS,
  OCCUPATIONS,
  RESIDENCES,
  SOCIAL_CATEGORIES,
  STATES,
  YES_NO_UNSURE,
} from '@/lib/profile-options'
import { actions } from '@/lib/store'
import type { CitizenProfile } from '@/lib/types'
import { CitizenProfileSchema } from '@/lib/validation/schemas'

type Draft = Partial<CitizenProfile> & { needs: CitizenProfile['needs'] }
type Errors = Partial<Record<keyof CitizenProfile, string>>

const STEPS = [
  { title: 'Where do you live?', description: 'Some schemes depend on your state or district.' },
  { title: 'About you', description: 'Sensitive questions are optional. Skip anything you prefer not to share.' },
  { title: 'Work and income', description: 'This helps us check income and occupation-based criteria.' },
  { title: 'Your household', description: 'Housing and family details for household-based schemes.' },
  { title: 'What help do you need?', description: 'Choose one or more areas. This helps us sort your results.' },
] as const

function validate(step: number, d: Draft): Errors {
  const e: Errors = {}
  if (step === 0) {
    if (!d.state) e.state = 'Please select your state or union territory.'
    if (!d.district?.trim()) e.district = 'Please enter your district.'
  }
  if (step === 1 && !d.ageGroup) e.ageGroup = 'Please choose your age group.'
  if (step === 2) {
    if (!d.occupation) e.occupation = 'Please choose what best describes your work.'
    if (!d.income) e.income = 'Please choose your household income range.'
  }
  if (step === 3) {
    if (!d.residence) e.residence = 'Please choose where you live.'
    if (!d.housing) e.housing = 'Please choose your housing situation.'
    if (!d.familySize) e.familySize = 'Please choose your family size.'
  }
  if (step === 4 && d.needs.length === 0) e.needs = 'Please choose at least one area.'
  return e
}

export function Questionnaire({ initial }: { initial?: CitizenProfile | null }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(initial ?? { needs: [] })
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const update = <K extends keyof CitizenProfile>(key: K, value: CitizenProfile[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const goTo = (next: number) => {
    setStep(next)
    setErrors({})
    requestAnimationFrame(() => {
      headingRef.current?.focus()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const next = async () => {
    const e = validate(step, draft)
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    if (step < STEPS.length - 1) {
      goTo(step + 1)
      return
    }
    const parsed = CitizenProfileSchema.safeParse({ ...draft, district: draft.district?.trim() })
    if (!parsed.success) {
      setSubmitError('Please review your answers and try again.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/schemes/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const result: unknown = await response.json()
      if (!response.ok) {
        const message =
          typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'We could not check your answers. Please try again.'
        throw new Error(message)
      }
      actions.setProfile(parsed.data)
      router.push('/schemes')
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'We could not check your answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100
  const current = STEPS[step]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-primary">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Questionnaire progress"
        >
          <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form
        className="flex flex-col gap-8 rounded-2xl border bg-card p-5 shadow-sm md:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          void next()
        }}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-primary outline-none">
            {current.title}
          </h2>
          <p className="text-muted-foreground">{current.description}</p>
        </div>

        {step === 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="state" className="text-base font-semibold">
                State or union territory
              </Label>
              <select
                id="state"
                value={draft.state ?? ''}
                onChange={(e) => update('state', e.target.value)}
                aria-invalid={!!errors.state}
                aria-describedby={errors.state ? 'state-error' : undefined}
                className="h-12 rounded-xl border-2 border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive"
              >
                <option value="" disabled>
                  Select your state
                </option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p id="state-error" role="alert" className="text-sm font-medium text-destructive">
                  {errors.state}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="district" className="text-base font-semibold">
                District
              </Label>
              <Input
                id="district"
                value={draft.district ?? ''}
                onChange={(e) => update('district', e.target.value)}
                placeholder="e.g. Nashik"
                autoComplete="address-level2"
                maxLength={60}
                aria-invalid={!!errors.district}
                aria-describedby={errors.district ? 'district-error' : undefined}
                className="h-12 rounded-xl border-2 px-3 text-base"
              />
              {errors.district && (
                <p id="district-error" role="alert" className="text-sm font-medium text-destructive">
                  {errors.district}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <OptionGroup
              legend="Your age group"
              options={AGE_GROUPS}
              value={draft.ageGroup}
              onChange={(v) => update('ageGroup', v)}
              error={errors.ageGroup}
              columns={3}
            />
            <OptionGroup
              legend="Gender"
              optional
              options={GENDERS}
              value={draft.gender}
              onChange={(v) => update('gender', v)}
            />
            <OptionGroup
              legend="Social category"
              description="Used only to check category-specific schemes such as scholarships."
              optional
              options={SOCIAL_CATEGORIES}
              value={draft.socialCategory}
              onChange={(v) => update('socialCategory', v)}
              columns={3}
            />
            <OptionGroup
              legend="Disability status"
              optional
              options={DISABILITY_OPTIONS}
              value={draft.disability}
              onChange={(v) => update('disability', v)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <OptionGroup
              legend="What best describes your work?"
              options={OCCUPATIONS}
              value={draft.occupation}
              onChange={(v) => update('occupation', v)}
              error={errors.occupation}
              columns={3}
            />
            {draft.occupation === 'farmer' && (
              <OptionGroup
                legend="Is cultivable land registered in your name?"
                options={YES_NO_UNSURE}
                value={draft.ownsFarmland}
                onChange={(v) => update('ownsFarmland', v)}
                columns={3}
              />
            )}
            <OptionGroup
              legend="Total yearly income of your household"
              description="An approximate range is fine."
              options={INCOME_RANGES}
              value={draft.income}
              onChange={(v) => update('income', v)}
              error={errors.income}
              columns={3}
            />
          </>
        )}

        {step === 3 && (
          <>
            <OptionGroup
              legend="Where do you live?"
              options={RESIDENCES}
              value={draft.residence}
              onChange={(v) => update('residence', v)}
              error={errors.residence}
            />
            <OptionGroup
              legend="Your housing situation"
              options={HOUSING_OPTIONS}
              value={draft.housing}
              onChange={(v) => update('housing', v)}
              error={errors.housing}
            />
            <OptionGroup
              legend="How many people live in your household?"
              options={FAMILY_SIZES}
              value={draft.familySize}
              onChange={(v) => update('familySize', v)}
              error={errors.familySize}
            />
          </>
        )}

        {step === 4 && (
          <OptionGroup
            multiple
            legend="Areas you need help with"
            description="Select all that apply."
            options={NEEDS}
            value={draft.needs}
            onChange={(v) => update('needs', v)}
            error={errors.needs}
          />
        )}

        {submitError && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 px-5 text-base"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Back
          </Button>
          <Button type="submit" size="lg" className="h-12 px-6 text-base" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Checking your answers…
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                <Search className="size-5" aria-hidden="true" />
                Show my schemes
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="size-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your answers are checked without being stored on our server and saved only on this device. You can clear them from your dashboard.
      </p>
    </div>
  )
}
