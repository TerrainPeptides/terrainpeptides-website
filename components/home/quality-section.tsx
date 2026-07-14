import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const STANDARDS = [
  {
    n: '01',
    title: 'Proven purity',
    body: 'Independently verified by accredited labs so identity and potency match the label — every batch.',
  },
  {
    n: '02',
    title: 'Precise dosage',
    body: 'Measured, sealed, and documented for reproducible research outcomes.',
  },
  {
    n: '03',
    title: 'Consistent quality',
    body: 'GMP-aligned sourcing and HPLC confirmation before compounds leave our warehouse.',
  },
  {
    n: '04',
    title: 'Research use only',
    body: 'Labeled and sold strictly for laboratory and analytical applications.',
  },
  {
    n: '05',
    title: 'Full documentation',
    body: 'Certificates of Analysis ship with every order — transparency as standard, not a request.',
  },
] as const

export function QualitySection() {
  return (
    <>
      <section className="border-b border-border bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div>
            <p className="section-index">01 Mission</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.1]">
              Where dedication meets <span className="orbit-accent">accuracy</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Independent researchers deserve a foundation they can rely on. Terrain delivers
              research-grade peptides with verified purity, precise dosing, and documentation you
              can open before you buy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-terrain">
                Shop all products
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full px-2 text-sm font-semibold text-ink/60 transition hover:text-terrain-deep"
              >
                Learn more
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-section-subtle">
            <div className="relative flex min-h-[320px] items-center justify-center bg-[#f0f3f1] p-10 sm:min-h-[400px]">
              <Image
                src="/images/quality-vial.png"
                alt="Terrain research peptide"
                width={280}
                height={360}
                className="h-auto max-h-[340px] w-auto object-contain"
              />
            </div>
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-white">
              {[
                { k: 'HPLC', v: 'Verified' },
                { k: 'Mass Spec', v: 'Confirmed' },
                { k: 'COA', v: 'Included' },
              ].map((cell) => (
                <div key={cell.k} className="px-3 py-4 text-center">
                  <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink/40">
                    {cell.k}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-ink sm:text-sm">{cell.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-section-subtle py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="section-index">02 Standards</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem]">
            Five things we get right, <span className="orbit-accent">every batch</span>
          </h2>

          <ol className="mt-12 overflow-hidden rounded-2xl border border-border bg-white">
            {STANDARDS.map((item, idx) => (
              <li
                key={item.n}
                className={`grid gap-3 px-5 py-7 sm:grid-cols-[4rem_minmax(0,12rem)_1fr] sm:items-start sm:gap-8 sm:px-8 ${
                  idx !== STANDARDS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span className="font-mono text-sm font-semibold text-terrain">{item.n}</span>
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
