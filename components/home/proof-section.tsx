'use client'

import Link from 'next/link'
import { FlaskConical, ShieldCheck, FileText } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

const CHECKS = [
  {
    icon: FlaskConical,
    label: 'Identity confirmed',
    sub: 'HPLC & mass spectrometry analysis',
  },
  {
    icon: ShieldCheck,
    label: 'Purity ≥ 99%',
    sub: 'Quantified, not estimated',
  },
  {
    icon: FileText,
    label: 'COA in every order',
    sub: 'Third-party — not self-reported',
  },
] as const

const BATCH = [
  { label: 'Sample batch', value: 'TRN-2407' },
  { label: 'Purity result', value: '99.6%' },
  { label: 'Lab verdict', value: 'Passed' },
] as const

export function ProofSection() {
  const reveal = useScrollReveal()

  return (
    <section ref={reveal.ref} className="bg-[#0e2e1d]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Left — headline */}
          <div
            className={cn(
              'transition-all duration-700 ease-out',
              reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/35">
              <span className="mr-2 inline-block h-px w-5 align-middle bg-white/35" />
              Verified every batch
            </p>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,3.75rem)] font-semibold leading-[1.04] tracking-tight text-white">
              Proof ships<br />in the box.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/50">
              Every order includes a Certificate of Analysis from an accredited third-party lab. Not on request. Not extra. Standard.
            </p>
            <Link
              href="/faq"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white hover:bg-white hover:text-[#0e2e1d]"
            >
              What&apos;s in a COA?
            </Link>
          </div>

          {/* Right — COA cards */}
          <div
            className={cn(
              'flex flex-col gap-3 transition-all delay-150 duration-700 ease-out',
              reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            {CHECKS.map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 sm:px-6 sm:py-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                  <check.icon className="h-[1.1rem] w-[1.1rem] text-white/70" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="text-[0.9rem] font-semibold text-white">{check.label}</p>
                  <p className="mt-0.5 text-[0.8rem] text-white/40">{check.sub}</p>
                </div>
                <div className="shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#209d50]/25">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" aria-hidden>
                      <path
                        d="M2 6.5l2.8 2.8 5.2-5.6"
                        stroke="#6ee7a0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

            {/* Batch data strip */}
            <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                Sample batch record
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/10">
                {BATCH.map((item) => (
                  <div key={item.label} className="pr-4 first:pl-0 [&:not(:first-child)]:pl-4">
                    <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/30">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-white/75">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
