import { HeroSection } from '@/components/home/hero-section'
import { StatsBar } from '@/components/home/stats-bar'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CustomerReviews } from '@/components/home/customer-reviews'
import { CTASection } from '@/components/home/cta-section'
import { getFeaturedProductsAsync, getApprovedVouches } from '@/lib/data'

export default async function HomePage() {
  const [featuredProducts, vouches] = await Promise.all([
    getFeaturedProductsAsync(),
    Promise.resolve(getApprovedVouches(4)),
  ])

  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsBar />
      <FeaturedProducts products={featuredProducts} />
      <CustomerReviews vouches={vouches} />
      <CTASection />
    </div>
  )
}
