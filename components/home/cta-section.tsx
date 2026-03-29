import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-[#0A1931] p-10 text-center text-white sm:p-14">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Start Your Research?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Browse our complete catalog of premium research peptides with guaranteed purity, COA documentation, and fast shipping.
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="mt-8 bg-white px-8 text-[#0A1931] shadow-lg hover:bg-white/90"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
