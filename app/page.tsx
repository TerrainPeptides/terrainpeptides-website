import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { AboutTerrainSection } from '@/components/home/about-terrain-section'
import { getFeaturedProductsAsync } from '@/lib/data'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAsync()

  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutTerrainSection />
      <FeaturedProducts products={featuredProducts} />
    </div>
  )
}
