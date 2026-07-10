'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, Microscope } from 'lucide-react'

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

export function QualitySection() {
  const [activeTab, setActiveTab] = useState<QualityTab>('potency')
  const tab = tabContent[activeTab]

  return (
    <section className="border-y border-border bg-section-subtle py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border-2 border-navy/12 bg-white shadow-sm">
          <div className="grid items-stretch md:grid-cols-2">
            <div className="relative flex min-h-[320px] items-center justify-center border-b border-border bg-white p-8 sm:p-10 md:min-h-[480px] md:border-b-0 md:border-r">
              <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-md border border-clinical-teal/35 bg-white px-3 py-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-clinical-teal" />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-navy">99%+ Purity</p>
                  <p className="text-[0.7rem] font-medium text-foreground/65">Verified by HPLC</p>
                </div>
              </div>

              <Image
                src="/images/quality-vial.png"
                alt="Terrain GHK-Cu research peptide vial"
                width={340}
                height={420}
                className="relative z-10 h-auto max-h-[300px] w-auto object-contain sm:max-h-[360px] md:max-h-[400px]"
              />
            </div>

            <div className="px-6 py-8 md:px-10 lg:px-12 lg:py-12">
              <p className="clinical-eyebrow">
                Quality assurance
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-navy sm:text-3xl">
                Quality you can verify,{' '}
                <span className="text-foreground/55">not just trust</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/80">
                Every batch is independently tested by accredited U.S. laboratories. We don&apos;t
                ask you to take our word for it — we give you the proof.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-b border-border pb-7">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold tabular-nums text-navy">{s.value}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-navy/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(Object.keys(tabContent) as QualityTab[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`rounded-md border-2 px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                      activeTab === key
                        ? 'border-navy bg-navy text-white shadow-sm'
                        : 'border-border bg-white text-navy/70 hover:border-navy/25 hover:text-navy'
                    }`}
                  >
                    {tabContent[key].label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-md border-2 border-border bg-section-subtle p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Microscope className="h-4 w-4 text-navy" aria-hidden />
                  <p className="text-base font-semibold text-navy">{tab.heading}</p>
                  <span className="rounded-sm border border-navy/20 bg-white px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-navy/80">
                    {tab.badge}
                  </span>
                </div>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">{tab.body}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
