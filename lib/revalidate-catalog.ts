import { revalidatePath } from 'next/cache'

/**
 * Bust Next.js Data Cache for catalog pages after admin product writes.
 * Without this, Vercel can keep serving stale prices from the last static render.
 */
export function revalidateProductCatalog(opts?: {
  productSlug?: string | null
  previousSlug?: string | null
}) {
  revalidatePath('/')
  revalidatePath('/shop')
  const slug = opts?.productSlug?.trim()
  const prev = opts?.previousSlug?.trim()
  if (slug) revalidatePath(`/product/${slug}`)
  if (prev && prev !== slug) revalidatePath(`/product/${prev}`)
}
