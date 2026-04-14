import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { AboutTerrainSection } from '@/components/home/about-terrain-section'
import { getFeaturedProductsAsync, getFaqs } from '@/lib/data'
import { FaqSection } from '@/components/home/faq-section'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAsync()
  const faqs = getFaqs()

  return (
    <div className="flex flex-col bg-white">
      <HeroSection />
      <AboutTerrainSection />
      <FeaturedProducts products={featuredProducts} />
      <FaqSection faqs={faqs} />
    </div>
  )
}
