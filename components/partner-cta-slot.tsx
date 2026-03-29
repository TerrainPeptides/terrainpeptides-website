'use client'

import { usePathname } from 'next/navigation'
import { PartnerCTA } from '@/components/partner-cta'

export function PartnerCTASlot() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  if (pathname === '/affiliates' || pathname.startsWith('/affiliates/')) return null
  return <PartnerCTA />
}
