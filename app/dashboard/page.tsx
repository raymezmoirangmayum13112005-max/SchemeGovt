import type { Metadata } from 'next'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const metadata: Metadata = {
  title: 'My dashboard',
  description: 'Your recommended and saved schemes, document progress, and recently viewed schemes.',
}

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <DashboardView />
    </main>
  )
}
