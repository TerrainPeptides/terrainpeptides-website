import { HeroSection } from '@/components/home/hero-section'
// import { TerrainGuaranteeSection } from '@/components/home/terrain-guarantee-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { QualitySection } from '@/components/home/quality-section'
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
      <QualitySection />
      <FeaturedProducts products={allProducts} />
      {/* <TerrainGuaranteeSection /> */}
      <CTASection />
      <FaqSection faqs={faqs} />
    </div>
  )
}
