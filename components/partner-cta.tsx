import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function PartnerCTA() {
  return (
    <section
      className="py-14 sm:py-16"
      style={{
        background:
          'linear-gradient(135deg, #060f1f 0%, #0A1931 40%, #132744 70%, #0A1931 100%)',
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          READY TO PARTNER WITH TERRAIN?
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Join our affiliate program and earn 10% commission on every sale you refer.
        </p>
        <Link
          href="/affiliates"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-[#0A1931] shadow-lg transition-opacity hover:opacity-90"
        >
          Become a Partner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
