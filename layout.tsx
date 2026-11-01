import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans, Noto_Sans_Meetei_Mayek } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LocalizationProvider } from '@/lib/localization'
import './globals.css'

const notoSans = Noto_Sans({
  subsets: ['latin', 'devanagari'],
  variable: '--font-noto-sans',
  display: 'swap',
})
const meiteiMayek = Noto_Sans_Meetei_Mayek({
  subsets: ['latin', 'meetei-mayek'],
  variable: '--font-meitei-mayek',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SchemeGovt – Your Welfare Scheme Assistant',
    template: '%s | SchemeGovt',
  },
  description:
    'SchemeGovt helps you discover government welfare schemes, understand requirements, prepare documents, and learn how to apply.',
  generator: 'v0.app',
  applicationName: 'SchemeGovt',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SchemeGovt',
    title: 'SchemeGovt – Your Welfare Scheme Assistant',
    description:
      'Discover government welfare schemes, understand requirements, prepare documents, and learn how to apply with SchemeGovt.',
  },
  twitter: {
    card: 'summary',
    title: 'SchemeGovt – Your Welfare Scheme Assistant',
    description:
      'Discover government welfare schemes, understand requirements, prepare documents, and learn how to apply.',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1f3a6b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${meiteiMayek.variable} bg-background`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <LocalizationProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LocalizationProvider>
      </body>
    </html>
  )
}
