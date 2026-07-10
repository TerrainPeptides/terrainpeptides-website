import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  PackageCheck,
  Microscope,
  Snowflake,
  BadgeCheck,
  Warehouse,
  ShieldCheck,
} from 'lucide-react'

const trustCards = [
  {
    icon: PackageCheck,
    title: 'Always in Stock',
    description:
      'Top peptides like BPC-157, GHK-Cu, and MT2 ready to ship. No backorders, no waiting.',
  },
  {
    icon: Microscope,
    title: 'Third-Party Tested',
    description:
      'Every batch HPLC and Mass Spec verified by US labs. Full COA included with every order.',
  },
  {
    icon: Snowflake,
    title: 'Safe & Protected Shipping',
    description:
      'Cold-pack shipping keeps peptides stable. Discreet packaging with full tracking on every order.',
  },
  {
    icon: BadgeCheck,
    title: '99%+ Purity Guaranteed',
    description:
      'Rigorous quality standards on every compound, every batch, no exceptions.',
  },
  {
    icon: Warehouse,
    title: 'USA Warehouse',
    description:
      'Ships domestically for fast, reliable delivery straight to your door.',
  },
  {
    icon: ShieldCheck,
    title: 'Shipment Protection',
    description:
      'Every order includes free shipment protection. Lost, damaged, or stolen packages reshipped at no cost.',
  },
] as const

const bullets = [
  'Third-party tested quality',
  'Fast & reliable shipping',
  'Research-grade compounds',
]

export function AboutTerrainSection() {
  return (
    <section className="bg-white pt-0">
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
          <div className="relative w-full">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-section-subtle shadow-sm sm:aspect-[4/5]">
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
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              About us
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-4xl">
              The Standard for Research Peptides
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              TerrainPeptides was built for researchers who refuse to compromise. Every compound is rigorously
              third-party tested, sourced from GMP-compliant facilities, and shipped from our USA warehouse —
              because your research demands nothing less.
            </p>
            <ul className="mt-8 space-y-3 text-base leading-relaxed text-muted-foreground">
              {bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-2.5 h-1 w-4 shrink-0 rounded-sm bg-clinical-teal"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button
                size="lg"
                className="rounded-md bg-black px-8 font-semibold text-white hover:bg-black/90"
                asChild
              >
                <Link href="/shop">
                  Browse Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-section-subtle pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Why researchers choose Terrain
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {trustCards.map((card) => (
              <div
                key={card.title}
                className="group flex flex-col rounded-md border border-border bg-white p-6 text-foreground shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-7"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-primary/15 bg-section-clinical transition-colors group-hover:border-primary/30">
                  <card.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-navy">{card.title}</h3>
                <p className="mt-2 text-sm leading-snug text-muted-foreground">
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
