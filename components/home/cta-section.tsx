import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, FileText, Truck, Beaker } from 'lucide-react'

const valueProps = [
  {
    icon: Shield,
    title: '99%+ Purity Guaranteed',
    description: 'Every batch undergoes rigorous third-party HPLC testing to confirm 99%+ purity before shipping.',
  },
  {
    icon: FileText,
    title: 'COA With Every Order',
    description: 'A Certificate of Analysis is provided with every product so you can verify quality independently.',
  },
  {
    icon: Truck,
    title: 'Fast US Shipping',
    description: 'Orders ship within 1–2 business days from our USA warehouse with discreet packaging and tracking.',
  },
  {
    icon: Beaker,
    title: 'Research-Grade Standards',
    description: 'Our compounds meet the rigorous standards expected by research institutions and laboratories worldwide.',
  },
]

export function CTASection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Why TerrainPeptides */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why TerrainPeptides?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            We set the standard for quality, transparency, and reliability in research peptides.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop) => (
            <div key={prop.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A1931]/5">
                <prop.icon className="h-7 w-7 text-[#0A1931]" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {prop.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {prop.description}
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA Banner */}
        <div className="mt-20 overflow-hidden rounded-2xl bg-[#0A1931] p-10 text-center text-white sm:p-14">
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
