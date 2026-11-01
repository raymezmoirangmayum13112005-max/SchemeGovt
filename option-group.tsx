'use client'

import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Option } from '@/lib/profile-options'

type BaseProps<T extends string> = {
  legend: string
  description?: string
  options: Option<T>[]
  optional?: boolean
  error?: string
  columns?: 2 | 3
}

type SingleProps<T extends string> = BaseProps<T> & {
  multiple?: false
  value: T | undefined
  onChange: (value: T) => void
}

type MultiProps<T extends string> = BaseProps<T> & {
  multiple: true
  value: T[]
  onChange: (value: T[]) => void
}

export function OptionGroup<T extends string>(props: SingleProps<T> | MultiProps<T>) {
  const { legend, description, options, optional, error, columns = 2 } = props
  const name = useId()
  const errorId = `${name}-error`

  const isSelected = (v: T) => (props.multiple ? props.value.includes(v) : props.value === v)

  const handle = (v: T) => {
    if (props.multiple) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v])
    } else {
      props.onChange(v)
    }
  }

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1 flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
        {legend}
        {optional && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Optional
          </span>
        )}
      </legend>
      {description && <p className="-mt-2 text-sm text-muted-foreground">{description}</p>}
      <div className={cn('grid gap-2.5 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
        {options.map((option) => {
          const selected = isSelected(option.value)
          return (
            <label
              key={option.value}
              className={cn(
                'group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 transition-colors hover:border-teal/60 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
                selected ? 'border-teal bg-accent' : 'border-border',
              )}
            >
              <input
                type={props.multiple ? 'checkbox' : 'radio'}
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => handle(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center border-2 transition-colors',
                  props.multiple ? 'rounded-md' : 'rounded-full',
                  selected ? 'border-teal bg-teal text-teal-foreground' : 'border-input bg-card',
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{option.label}</span>
                {option.hint && <span className="text-sm text-muted-foreground">{option.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
