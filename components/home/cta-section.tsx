import { Headphones, Microscope, FileCheck } from 'lucide-react'

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
    <section className="border-b border-black/8 bg-[#f7f7f8] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="section-index">05 Difference</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-[2.5rem]">
            What sets Terrain apart
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="flex flex-col rounded-2xl border border-[#0e2e1d]/15 bg-white p-7 sm:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0e2e1d]/20 bg-[#0e2e1d]/6 text-[#0e2e1d]">
                <pillar.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-[1.05rem] font-semibold text-black">{pillar.title}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-black/55">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
