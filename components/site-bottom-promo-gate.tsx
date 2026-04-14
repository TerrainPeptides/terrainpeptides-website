'use client'

import { usePathname } from 'next/navigation'
import { SiteBottomPromoSection } from '@/components/site-bottom-promo-section'

/** Storefront-only: admin uses its own shell; avoid newsletter CTA under the dashboard */
export function SiteBottomPromoGate() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <SiteBottomPromoSection />
}
