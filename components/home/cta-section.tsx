import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Microscope } from 'lucide-react'

export function CTASection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border-2 border-navy/15 bg-gradient-to-br from-section-subtle via-white to-section-clinical p-10 text-center sm:p-14">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-navy text-white shadow-sm">
            <Microscope className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">
            Ready to Start Your Research?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground/80">
            Browse our complete catalog of premium research peptides with guaranteed purity, COA documentation, and fast shipping.
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-md bg-black px-8 text-white hover:bg-black/90"
            asChild
          >
            <Link href="/shop">
              Browse Catalog
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
