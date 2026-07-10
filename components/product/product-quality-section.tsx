'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, FlaskConical, Microscope } from 'lucide-react'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'

interface ProductQualitySectionProps {
  product: Product
}

type QualityTab = 'potency' | 'purity' | 'stability' | 'sourcing'

const tabContent: Record<
  QualityTab,
  { label: string; badge: string; heading: string; body: string }
> = {
  potency: {
    label: 'Potency',
    badge: 'HPLC Analysis',
    heading: 'Verified Potency',
    body: 'Every vial is tested to confirm it contains exactly what the label says — down to the microgram.',
  },
  purity: {
    label: 'Purity',
    badge: 'Mass Spec',
    heading: '99%+ Purity Confirmed',
    body: 'Mass spectrometry verification ensures no unwanted byproducts or contaminants reach you.',
  },
  stability: {
    label: 'Stability',
    badge: 'Stability Testing',
    heading: 'Shelf-Stable Formula',
    body: 'Lyophilized to preserve integrity. Cold-pack shipping keeps compounds stable throughout transit.',
  },
  sourcing: {
    label: 'Sourcing',
    badge: 'GMP Facility',
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
  const resolvedSrc = resolveProductImageSrc(product)
  const imageSrc = resolvedSrc && !imageError ? resolvedSrc : null
  const tab = tabContent[activeTab]

  return (
    <section className="mt-16 overflow-hidden rounded-lg border border-border bg-section-subtle">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        <div className="relative flex min-h-[300px] items-center justify-center border-b border-border bg-section-clinical p-10 md:min-h-[460px] md:border-b-0 md:border-r">
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-md border border-clinical-teal/30 bg-white px-3 py-2 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-clinical-teal" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-navy">99%+ Purity</p>
              <p className="text-[0.6rem] text-muted-foreground">Verified by HPLC</p>
            </div>
          </div>

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={360}
              className="relative z-10 h-auto max-h-72 w-auto object-contain md:max-h-96"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-md border border-border bg-white">
              <FlaskConical className="h-16 w-16 text-primary/25" />
            </div>
          )}
        </div>

        <div className="px-6 py-8 md:px-10 lg:px-12 lg:py-12">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Quality assurance
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-navy sm:text-3xl">
            Quality you can verify,{' '}
            <span className="text-muted-foreground">not just trust</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Every batch is independently tested by accredited U.S. laboratories. We don&apos;t ask
            you to take our word for it — we give you the proof.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-b border-border pb-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold tabular-nums text-primary">{s.value}</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {(Object.keys(tabContent) as QualityTab[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-md border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  activeTab === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {tabContent[key].label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-border bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Microscope className="h-4 w-4 text-primary" aria-hidden />
              <p className="text-sm font-semibold text-navy">{tab.heading}</p>
              <span className="rounded-sm border border-primary/20 bg-section-clinical px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-primary">
                {tab.badge}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tab.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
