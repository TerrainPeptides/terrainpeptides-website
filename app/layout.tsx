import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Terrain Peptides | Premium Research Peptides',
  description: 'Premium quality research peptides for scientific research. 99%+ purity, third-party tested, with certificates of analysis.',
  keywords: ['peptides', 'research peptides', 'BPC-157', 'TB500', 'GHK-Cu', 'laboratory research'],
}

export const viewport: Viewport = {
  themeColor: '#0A1628',
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
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
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
