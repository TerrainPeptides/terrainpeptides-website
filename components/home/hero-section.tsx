import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Microscope, Truck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-[#0A1931]">
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-16 lg:px-8 lg:pb-40 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text and CTA */}
          <div className="flex flex-col text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#0A1931]/20 bg-[#0A1931]/5 px-4 py-1.5 text-sm text-[#0A1931]">
              <Shield className="h-4 w-4" />
              <span>99%+ Purity Guaranteed</span>
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-[#0A1931] sm:text-5xl lg:text-6xl">
              Premium Peptides You Can Trust
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-pretty text-lg text-[#0A1931]/80 sm:text-xl">
              Research-grade compounds. Third-party tested. Fast US shipping.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="rounded-lg bg-[#0A1931] text-white hover:bg-[#0A1931]/90"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg border-[#0A1931]/30 text-[#0A1931] hover:bg-[#0A1931]/5"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="mt-16 flex flex-wrap items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm text-[#0A1931]/70">
                <Microscope className="h-5 w-5" />
                <span>Lab Tested</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0A1931]/70">
                <Shield className="h-5 w-5" />
                <span>COA Included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0A1931]/70">
                <Truck className="h-5 w-5" />
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>

          {/* Right: Product image */}
          <div className="relative flex min-h-[320px] items-center justify-center rounded-xl bg-white lg:min-h-[480px]">
            <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px]">
              <Image
                src="/images/ghk-cu-vial.png"
                alt="GHK-Cu vial"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
