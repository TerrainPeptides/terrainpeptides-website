import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { QualitySection } from '@/components/home/quality-section'
import { PriceGapSection } from '@/components/home/price-gap-section'
import { getProductsAsync, getFaqs } from '@/lib/data'
import { FaqSection } from '@/components/home/faq-section'
import { TrustStrip } from '@/components/home/trust-strip'
import { CTASection } from '@/components/home/cta-section'

/** Always read latest catalog prices from Supabase (not a stale build snapshot). */
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allProducts = await getProductsAsync()
  const faqs = getFaqs()

  return (
    <div className="flex flex-col bg-white font-sans">
      <HeroSection />
      <TrustStrip />
      <PriceGapSection products={allProducts} />
      <QualitySection />
      <FeaturedProducts products={allProducts} />
      <CTASection />
      <FaqSection faqs={faqs} />
    </div>
  )
}
