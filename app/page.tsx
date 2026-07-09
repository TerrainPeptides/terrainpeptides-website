import { HeroSection } from '@/components/home/hero-section'
// import { TerrainGuaranteeSection } from '@/components/home/terrain-guarantee-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { QualitySection } from '@/components/home/quality-section'
import { getProductsAsync, getFaqs } from '@/lib/data'
import { FaqSection } from '@/components/home/faq-section'

/** Always read latest catalog prices from Supabase (not a stale build snapshot). */
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allProducts = await getProductsAsync()
  const faqs = getFaqs()

  return (
    <div className="flex flex-col bg-white font-sans">
      <HeroSection />
      <QualitySection />
      <FeaturedProducts products={allProducts} />
      {/* <TerrainGuaranteeSection /> */}
      <FaqSection faqs={faqs} />
    </div>
  )
}
