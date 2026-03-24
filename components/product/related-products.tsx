import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/types'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Related Products
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
