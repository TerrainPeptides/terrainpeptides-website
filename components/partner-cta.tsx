import Link from 'next/link'
import { ArrowRight, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PartnerCTA() {
  return (
    <section className="border-t border-border bg-section-subtle py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-primary/15 bg-section-clinical">
            <Handshake className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Partner program
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
            Partner With Terrain
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Join our research affiliate program and earn 10% commission on every sale you refer.
          </p>
          <Button className="mt-6 gap-2 rounded-md px-8" asChild>
            <Link href="/affiliates">
              View Partner Program
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
