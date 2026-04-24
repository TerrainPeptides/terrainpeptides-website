import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-white p-10 text-center shadow-sm sm:p-14">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to Start Your Research?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/70">
            Browse our complete catalog of premium research peptides with guaranteed purity, COA documentation, and fast shipping.
          </p>
          <Button
            size="lg"
            className="mt-8 px-8 shadow-lg"
            asChild
          >
            <Link href="/shop">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
