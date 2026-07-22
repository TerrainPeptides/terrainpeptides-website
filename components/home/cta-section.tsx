import Link from 'next/link'
import { Headphones, Microscope, FileCheck, ArrowUpRight } from 'lucide-react'

const PILLARS = [
  {
    icon: Headphones,
    title: 'Customer service comes first',
    body: 'Responsive email support for orders, COAs, and shipping. Real people. Real answers.',
  },
  {
    icon: Microscope,
    title: 'Lab quality, no theater',
    body: 'Precision sourcing, documented testing, and warehouse discipline — built for researchers who check the paperwork.',
  },
  {
    icon: FileCheck,
    title: '3rd-party verified COAs',
    body: 'Purity, identity, and potency confirmed by accredited laboratories. Label matches vial.',
  },
] as const

export function CTASection() {
  return (
    <section className="border-y border-white/10 bg-black py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/45">
              <span className="mr-2 inline-block h-px w-5 align-middle bg-white/45" />
              05 Difference
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
              What sets Terrain apart
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/70 transition hover:text-white"
          >
            Browse the catalog
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-9"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
                <pillar.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
