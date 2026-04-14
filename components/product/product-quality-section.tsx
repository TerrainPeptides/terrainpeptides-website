'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, FlaskConical } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductQualitySectionProps {
  product: Product
}

type QualityTab = 'potency' | 'purity' | 'stability' | 'sourcing'

const tabContent: Record<
  QualityTab,
  { label: string; badge: string; badgeColor: string; heading: string; body: string }
> = {
  potency: {
    label: 'Potency',
    badge: 'HPLC Analysis',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    heading: 'Verified Potency',
    body: 'Every vial is tested to confirm it contains exactly what the label says — down to the microgram.',
  },
  purity: {
    label: 'Purity',
    badge: 'Mass Spec',
    badgeColor: 'bg-blue-100 text-blue-700',
    heading: '99%+ Purity Confirmed',
    body: 'Mass spectrometry verification ensures no unwanted byproducts or contaminants reach you.',
  },
  stability: {
    label: 'Stability',
    badge: 'Stability Testing',
    badgeColor: 'bg-purple-100 text-purple-700',
    heading: 'Shelf-Stable Formula',
    body: 'Lyophilized to preserve integrity. Cold-pack shipping keeps compounds stable throughout transit.',
  },
  sourcing: {
    label: 'Sourcing',
    badge: 'GMP Facility',
    badgeColor: 'bg-amber-100 text-amber-700',
    heading: 'US-Sourced & GMP-Compliant',
    body: 'Every compound originates from a GMP-compliant U.S. facility — verified from raw material to final batch.',
  },
}

const stats = [
  { value: '99%+', label: 'Purity Guaranteed' },
  { value: '5', label: 'Quality Checks' },
  { value: '100%', label: 'U.S. Verified' },
]

export function ProductQualitySection({ product }: ProductQualitySectionProps) {
  const [activeTab, setActiveTab] = useState<QualityTab>('potency')
  const [imageError, setImageError] = useState(false)
  const imageSrc = product.image_url && !imageError ? product.image_url : null
  const tab = tabContent[activeTab]

  return (
    <section className="mt-16 overflow-hidden rounded-3xl bg-[#F2F5F8]">
      <div className="grid items-center gap-0 md:grid-cols-2">
        {/* Left: Product image */}
        <div className="relative flex min-h-[320px] items-center justify-center bg-[#E8EDF3] p-10 md:min-h-[480px]">
          {/* Purity badge */}
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 shadow-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-[#0A1628]">99%+ Purity</p>
              <p className="text-[0.6rem] text-[#0A1628]/60">Verified by HPLC</p>
            </div>
          </div>

          {/* Circular glow behind vial */}
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl" aria-hidden />

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={360}
              className="relative z-10 h-auto max-h-72 w-auto object-contain drop-shadow-xl md:max-h-96"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full bg-white/60">
              <FlaskConical className="h-20 w-20 text-[#0A1628]/25" />
            </div>
          )}
        </div>

        {/* Right: Quality copy */}
        <div className="px-8 py-10 md:px-10 lg:px-14 lg:py-14">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#0A1628] sm:text-3xl lg:text-[1.9rem]">
            Quality you can verify,{' '}
            <span className="text-[#0A1628]/60">not just trust</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#0A1628]/65">
            Every batch is independently tested by accredited U.S. laboratories. We don&apos;t ask
            you to take our word for it — we give you the proof.
          </p>

          {/* Stats */}
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold text-[#0A1628]">{s.value}</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#0A1628]/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(Object.keys(tabContent) as QualityTab[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === key
                    ? 'border-[#0A1628] bg-[#0A1628] text-white shadow-sm'
                    : 'border-[#0A1628]/20 bg-white text-[#0A1628]/70 hover:border-[#0A1628]/40 hover:text-[#0A1628]'
                }`}
              >
                {tabContent[key].label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-5 rounded-2xl border border-[#0A1628]/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#0A1628]">{tab.heading}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#0A1628]/65">{tab.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
