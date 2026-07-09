'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

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

export function QualitySection() {
  const [activeTab, setActiveTab] = useState<QualityTab>('potency')
  const tab = tabContent[activeTab]

  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#F2F5F8]">
          <div className="grid items-center md:grid-cols-2">

            {/* Left — vial image in a rounded card */}
            <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-[#E4EAF2] p-10 md:min-h-[500px]">
              {/* Purity badge */}
              <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 shadow-md">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#0A1628]">99%+ Purity</p>
                  <p className="text-[0.6rem] text-[#0A1628]/55">Verified by HPLC</p>
                </div>
              </div>

              {/* Soft glow behind vial */}
              <div
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl"
                aria-hidden
              />

              <Image
                src="/images/quality-vial.png"
                alt="Terrain GHK-Cu research peptide vial"
                width={340}
                height={420}
                className="relative z-10 h-auto max-h-[340px] w-auto rounded-2xl object-contain drop-shadow-2xl md:max-h-[420px]"
                priority
              />
            </div>

            {/* Right — quality copy */}
            <div className="px-8 py-10 md:px-10 lg:px-14 lg:py-14">
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#0A1628] sm:text-3xl lg:text-[2rem]">
                Quality you can verify,{' '}
                <span className="text-[#0A1628]/50">not just trust</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#0A1628]/60">
                Every batch is independently tested by accredited U.S. laboratories. We don&apos;t
                ask you to take our word for it — we give you the proof.
              </p>

              {/* Stats */}
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-b border-[#0A1628]/10 pb-7">
                {stats.map((s) => (
                  <div key={s.label}>
                <p className="text-xl font-extrabold text-[#0A1628]">{s.value}</p>
                <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-[#0A1628]/45">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="mt-6 flex flex-wrap gap-2">
                {(Object.keys(tabContent) as QualityTab[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      activeTab === key
                        ? 'border-[#0A1628] bg-[#0A1628] text-white shadow-sm'
                        : 'border-[#0A1628]/20 bg-white text-[#0A1628]/65 hover:border-[#0A1628]/40 hover:text-[#0A1628]'
                    }`}
                  >
                    {tabContent[key].label}
                  </button>
                ))}
              </div>

              {/* Tab content card */}
              <div className="mt-4 rounded-2xl border border-[#0A1628]/10 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[#0A1628]">{tab.heading}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#0A1628]/60">{tab.body}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
