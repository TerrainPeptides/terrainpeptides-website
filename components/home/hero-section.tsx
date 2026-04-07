import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-[#0A1931]">
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-36 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col text-left">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-[#0A1931] sm:text-5xl lg:text-6xl">
              Research-Grade Peptides.{' '}
              <span className="text-[#0A1931]/70">Trusted by Scientists.</span>
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-[#0A1931]/75 sm:text-xl">
              99%+ purity, third-party tested, shipped from our USA warehouse. The standard your research demands.
            </p>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="rounded-lg bg-[#0A1931] px-8 text-white shadow-lg hover:bg-[#0A1931]/90"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg border-[#0A1931]/20 text-[#0A1931] hover:bg-[#0A1931]/5"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[320px] items-center justify-center lg:min-h-[480px]">
            <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px]">
              <Image
                src="/images/home-hero-ghk-cu.png"
                alt="GHK-Cu peptide vial — Terrain Peptides"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
