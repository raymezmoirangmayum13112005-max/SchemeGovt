import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'

export function Hero() {
  return (
    <section className="border-b bg-card">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Free, private, and easy to use
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-primary text-balance md:text-5xl">
            Find Government Schemes You May Be Eligible For
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            Answer a few simple questions about yourself and your family. SchemeGovt&apos;s AI assistant suggests
            welfare schemes that may help you, explains who can apply, lists the documents you need, and shows you
            where to apply.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/eligibility" className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-6 text-base')}>
              Find My Schemes
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/assistant"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-6 text-base')}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Ask the assistant
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Takes about 3 minutes · No sign-up required</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border shadow-sm">
            <Image
              src="/images/hero-citizens.png"
              alt="A family receiving help at a community service centre"
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-4 right-4 rounded-xl border bg-card p-4 shadow-md sm:left-auto sm:right-6 sm:w-72">
            <p className="text-sm font-semibold text-primary">14 schemes in the demo catalogue</p>
            <p className="text-xs text-muted-foreground">Health, housing, farming, education, pensions and more</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-10">
        <Disclaimer />
      </div>
    </section>
  )
}
