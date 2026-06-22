import type { MetadataRoute } from 'next'
import { getProductsAsync } from '@/lib/data'
import { getSiteUrl } from '@/lib/site-url'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/affiliates', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/track', priority: 0.5, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const lastModified = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: path ? `${baseUrl}${path}` : baseUrl,
    lastModified,
    changeFrequency,
    priority,
  }))

  let productEntries: MetadataRoute.Sitemap = []
  try {
    const products = await getProductsAsync()
    productEntries = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    productEntries = []
  }

  return [...staticEntries, ...productEntries]
}
