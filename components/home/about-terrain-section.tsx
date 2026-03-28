import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const bullets = [
  'Third-party tested quality',
  'Fast & reliable shipping',
  'Research-grade compounds',
]

export function AboutTerrainSection() {
  return (
    <section className="bg-[#F3F4F6] py-16 sm:py-24 dark:bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm dark:border-border dark:bg-card">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center px-8 py-10 text-left font-sans sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-[#0A1931] dark:text-white sm:text-4xl lg:text-5xl">
                THE STANDARD FOR RESEARCH PEPTIDES
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[#0A1931]/75 dark:text-white/75 sm:text-xl">
                TerrainPeptides was built for researchers who refuse to compromise.
                Every compound is rigorously third-party tested, sourced from
                GMP-compliant facilities, and shipped from our USA warehouse —
                because your research demands nothing less.
              </p>
              <ul className="mt-8 space-y-3 text-lg leading-relaxed text-[#0A1931]/75 dark:text-white/75 sm:text-xl">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A1931]/70 dark:bg-white/70"
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
                    className="rounded-lg bg-[#0A1931] px-8 text-white shadow-lg hover:bg-[#0A1931]/90 dark:bg-[#0A1931] dark:hover:bg-[#0A1931]/90"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-full min-h-[280px] sm:min-h-[340px] md:min-h-[22rem]">
              <Image
                src="/images/terrain_bpc-157_cinematic_shot.png"
                alt="Terrain research peptide vials: BPC-157 and GHK-Cu on dark stone"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
