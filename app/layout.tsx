import type { Metadata, Viewport } from 'next'
import { Montserrat, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AgeVerification } from '@/components/age-verification'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/auth-provider'
import { SiteBottomPromoGate } from '@/components/site-bottom-promo-gate'
import { PromoPopup } from '@/components/promo-popup'
import { getSiteUrl } from '@/lib/site-url'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const siteDescription =
  'Premium quality research peptides for scientific research. 99%+ purity, third-party tested, with certificates of analysis.'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Terrain Peptides | Premium Research Peptides',
    template: '%s | Terrain Peptides',
  },
  description: siteDescription,
  keywords: ['peptides', 'research peptides', 'BPC-157', 'TB500', 'GHK-Cu', 'laboratory research'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getSiteUrl(),
    siteName: 'Terrain Peptides',
    title: 'Terrain Peptides | Premium Research Peptides',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terrain Peptides | Premium Research Peptides',
    description: siteDescription,
  },
}

export const viewport: Viewport = {
  themeColor: '#07140e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <AgeVerification />
            <Navbar />
            <main className="min-h-screen min-h-[100dvh]">{children}</main>
            <SiteBottomPromoGate />
            <PromoPopup />
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
