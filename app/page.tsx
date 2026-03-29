import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { AboutTerrainSection, WhyTerrainTrustSection } from '@/components/home/about-terrain-section'
import { CTASection } from '@/components/home/cta-section'
import { getFeaturedProductsAsync } from '@/lib/data'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAsync()

  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutTerrainSection />
      <FeaturedProducts products={featuredProducts} />
      <WhyTerrainTrustSection />
      <CTASection />
    </div>
  )
}
