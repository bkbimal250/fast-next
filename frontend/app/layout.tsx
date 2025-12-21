import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SPA Jobs Near Me - Find Spa Jobs in Your City | SPA Jobs Portal',
    template: '%s | SPA Jobs Portal'
  },
  description: 'Find the best spa jobs near you. Apply directly to spas without login. Browse thousands of spa jobs by location, salary, and experience. Search for therapist, masseuse, and spa manager positions.',
  keywords: ['spa jobs', 'spa therapist jobs', 'massage therapist jobs', 'spa manager jobs', 'beauty spa jobs', 'wellness jobs', 'spa jobs near me', 'spa careers', 'spa employment', 'spa hiring'],
  authors: [{ name: 'SPA Jobs Portal' }],
  creator: 'SPA Jobs Portal',
  publisher: 'SPA Jobs Portal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'SPA Jobs Portal',
    title: 'SPA Jobs Near Me - Find Spa Jobs in Your City',
    description: 'Find the best spa jobs near you. Apply directly to spas without login. Browse thousands of spa jobs by location, salary, and experience.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'SPA Jobs Portal - Find Your Dream Spa Job',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPA Jobs Near Me - Find Spa Jobs in Your City',
    description: 'Find the best spa jobs near you. Apply directly to spas without login.',
    images: [`${siteUrl}/og-image.jpg`],
    creator: '@spajobs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'Job Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#115e59" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
              },
              classNames: {
                success: 'bg-green-50 border-green-200',
                error: 'bg-red-50 border-red-200',
                warning: 'bg-yellow-50 border-yellow-200',
                info: 'bg-blue-50 border-blue-200',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

