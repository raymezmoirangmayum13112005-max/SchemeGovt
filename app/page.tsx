import { Hero } from '@/components/home/hero'
import { FeatureCards } from '@/components/home/feature-cards'
import { HowItWorks } from '@/components/home/how-it-works'
import { HomeCta } from '@/components/home/home-cta'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <HomeCta />
    </main>
  )
}
