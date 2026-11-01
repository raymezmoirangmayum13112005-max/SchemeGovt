import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function HomeCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:p-10">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-2xl font-bold text-balance">Ready to see which schemes may help you?</h2>
          <p className="flex items-start gap-2 text-primary-foreground/80 text-pretty">
            <Lock className="mt-1 size-4 shrink-0" aria-hidden="true" />
            Your answers stay on this device. We do not ask for your name, Aadhaar, or phone number.
          </p>
        </div>
        <Link
          href="/eligibility"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'h-12 bg-teal px-6 text-base text-teal-foreground hover:bg-teal/90',
          )}
        >
          Find My Schemes
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
