import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { AboutTerrainSection } from '@/components/home/about-terrain-section'
import { CTASection } from '@/components/home/cta-section'
import { PartnerCTA } from '@/components/partner-cta'
import { getFeaturedProductsAsync } from '@/lib/data'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAsync()

  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutTerrainSection />
      <FeaturedProducts products={featuredProducts} />
      <CTASection />
      <PartnerCTA />
    </div>
  )
}
