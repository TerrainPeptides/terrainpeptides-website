import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Shield, Truck } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: '99%+ Purity',
    description: 'All products undergo rigorous third-party HPLC testing.',
  },
  {
    icon: FileText,
    title: 'COA Included',
    description: 'Certificate of Analysis provided with every order.',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Discreet packaging with tracking on all orders.',
  },
]

export function CTASection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Features */}
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mt-16 rounded-2xl bg-[#0A1931] p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Start Your Research?
          </h2>
          <p className="mt-4 text-white/80">
            Browse our complete catalog of premium research peptides with guaranteed purity and fast shipping.
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="mt-8 bg-white text-[#0A1931] hover:bg-white/90"
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
