import Link from 'next/link'
import Image from 'next/image'
import { Outfit } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Warehouse, FileCheck, Truck } from 'lucide-react'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const trustCards = [
  {
    icon: Shield,
    title: '99%+ Purity Guaranteed',
    description: 'Every batch independently verified by third-party labs',
  },
  {
    icon: Warehouse,
    title: 'USA Warehouse',
    description: 'Ships domestically for fast, reliable delivery',
  },
  {
    icon: FileCheck,
    title: 'Third-Party Tested',
    description: 'Full Certificate of Analysis with every order',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Orders processed and shipped within 1-2 business days',
  },
] as const

const bullets = [
  'Third-party tested quality',
  'Fast & reliable shipping',
  'Research-grade compounds',
]

export function AboutTerrainSection() {
  return (
    <section className={`${outfit.className} bg-white pt-0`}>
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        {/* Two columns: image left (rounded), text right — white background, reference layout */}
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
          <div className="relative w-full">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-section-subtle shadow-[0_8px_40px_rgba(28,61,42,0.08)] sm:aspect-[4/5]">
              <Image
                src="/images/about-standard-ghk-cu-forest.png"
                alt="GHK-Cu research vial among moss and forest greenery"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col justify-center px-0 py-2 md:py-6 md:pl-2 lg:pl-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-foreground/45 sm:text-xs">
              About us
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              The Standard for Research Peptides
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-base font-normal leading-relaxed text-foreground/75 sm:text-lg">
              TerrainPeptides was built for researchers who refuse to compromise. Every compound is rigorously
              third-party tested, sourced from GMP-compliant facilities, and shipped from our USA warehouse —
              because your research demands nothing less.
            </p>
            <ul className="mt-8 space-y-3 text-base font-normal leading-relaxed text-foreground/75 sm:text-lg">
              {bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link href="/shop">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary bg-white px-8 font-semibold text-primary shadow-sm hover:bg-primary hover:text-primary-foreground"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-section-subtle pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why TerrainPeptides?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-foreground/60">
              We set the standard for quality, transparency, and reliability in research peptides.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {trustCards.map((card) => (
              <div
                key={card.title}
                className="group flex flex-col rounded-2xl border border-border bg-[#F4FAF5] p-8 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-9"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.06] transition-colors group-hover:bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <h3 className="text-lg font-bold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-snug text-foreground/70 sm:text-[0.9375rem]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
