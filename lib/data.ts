import type { Product, FAQ, Vouch, ReferralCode, Order, OrderItem, ContactSubmission } from '@/lib/types'
import { seedProducts, seedVouches } from '@/lib/seed-data'
import { readPersistentStore, writePersistentStore } from '@/lib/persistent-store'
import { getProductsFromSupabase } from '@/lib/products-supabase'
import { mergeCatalogWithSeed } from '@/lib/catalog-merge'
import { enrichProductImages } from '@/lib/enrich-product-images'
import { productSlugMatches, normalizeProductSlug } from '@/lib/product-slug'
import { buildSiteStaticFaqs } from '@/lib/site-faqs'

// Back-compat exports for seed data
export const staticProducts: Product[] = seedProducts
export const staticVouches: Vouch[] = seedVouches

export const staticFaqs: FAQ[] = buildSiteStaticFaqs()

function fromStore(): Product[] {
  return [...readPersistentStore().products]
}

export function getProducts(): Product[] {
  return fromStore()
}

function filterVisible(products: Product[]): Product[] {
  return products.filter((p) => !(p as { hidden?: boolean }).hidden)
}

/** Seed defaults first; store overrides fields but keeps seed `hidden` unless store sets it. */
function buildCatalogFallback(seed: Product[], store: Product[]): Product[] {
  const bySlug = new Map<string, Product>()
  for (const p of seed) bySlug.set(p.slug, p)
  for (const p of store) {
    const existing = bySlug.get(p.slug)
    bySlug.set(
      p.slug,
      existing
        ? { ...existing, ...p, hidden: p.hidden !== undefined ? p.hidden : existing.hidden }
        : p
    )
  }
  return [...bySlug.values()]
}

export async function getProductsAsync(): Promise<Product[]> {
  const fromSupabase = await getProductsFromSupabase()
  const fromStoreProducts = fromStore()
  const catalogFallback = buildCatalogFallback(seedProducts, fromStoreProducts)
  const products =
    fromSupabase && fromSupabase.length > 0
      ? mergeCatalogWithSeed(fromSupabase, catalogFallback)
      : catalogFallback
  return enrichProductImages(filterVisible(products))
}

export function getFeaturedProducts(): Product[] {
  return readPersistentStore().products.filter((p) => p.featured && p.in_stock).slice(0, 6)
}

export async function getFeaturedProductsAsync(): Promise<Product[]> {
  const products = await getProductsAsync()
  return products.filter((p) => p.featured && p.in_stock).slice(0, 6)
}

export function getProductBySlug(slug: string): Product | null {
  return readPersistentStore().products.find((p) => p.slug === slug) ?? null
}

export async function getProductBySlugAsync(slug: string): Promise<Product | null> {
  const products = await getProductsAsync()
  const normalized = normalizeProductSlug(slug)
  return (
    products.find((p) => productSlugMatches(slug, p.slug) || p.slug === normalized) ?? null
  )
}

export function getProductById(id: string): Product | null {
  return readPersistentStore().products.find((p) => p.id === id) ?? null
}

export async function getProductByIdAsync(id: string): Promise<Product | null> {
  const products = await getProductsAsync()
  return products.find((p) => p.id === id) ?? null
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return readPersistentStore()
    .products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
}

export async function getRelatedProductsAsync(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProductsAsync()
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
}

export function getFaqs(): FAQ[] {
  return [...staticFaqs].sort((a, b) => a.sort_order - b.sort_order)
}

export function getApprovedVouches(limit = 4): Vouch[] {
  return readPersistentStore().vouches.filter((v) => v.approved).slice(0, limit)
}

export function getVouchesForProduct(productId: string): Vouch[] {
  return readPersistentStore().vouches.filter(
    (v) => v.approved && (v.product_id === productId || v.product_id === null)
  )
}

function withStore<T>(fn: (s: ReturnType<typeof readPersistentStore>) => T): T {
  const s = readPersistentStore()
  const result = fn(s)
  writePersistentStore(s)
  return result
}

export const store = {
  contact: {
    getAll: () => [...readPersistentStore().messages],
    add: (sub: Omit<ContactSubmission, 'id' | 'read' | 'created_at'>) => {
      return withStore((s) => {
        const row = { ...sub, id: `contact-${Date.now()}`, read: false, created_at: new Date().toISOString() }
        s.messages.push(row)
        return row
      })
    },
  },
  orders: {
    getAll: () => [...readPersistentStore().orders],
    getAllWithItems: () => {
      const s = readPersistentStore()
      return s.orders.map((o) => ({
        ...o,
        items: s.orderItems.filter((i) => i.order_id === o.id),
      }))
    },
    getByOrderNumberAndEmail: (orderNumber: string, email: string) => {
      const s = readPersistentStore()
      const order = s.orders.find((o) => o.order_number === orderNumber && o.email.toLowerCase() === email.toLowerCase())
      if (!order) return null
      const items = s.orderItems.filter((i) => i.order_id === order.id)
      return { ...order, items }
    },
    add: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]) => {
      return withStore((s) => {
        const id = `order-${Date.now()}`
        const created = new Date().toISOString()
        const newOrder = { ...order, id, created_at: created, updated_at: created }
        s.orders.push(newOrder)
        items.forEach((item) => {
          s.orderItems.push({ ...item, id: `oi-${Date.now()}-${Math.random().toString(36).slice(2)}`, order_id: id, created_at: created })
        })
        return newOrder
      })
    },
    updateById: (id: string, updates: Partial<Order>) => {
      return withStore((s) => {
        const order = s.orders.find((o) => o.id === id)
        if (order) Object.assign(order, updates, { updated_at: new Date().toISOString() })
      })
    },
    updateByStripeSessionId: (stripeSessionId: string, updates: Partial<Order>) => {
      return withStore((s) => {
        const order = s.orders.find((o) => o.stripe_session_id === stripeSessionId)
        if (order) Object.assign(order, updates, { updated_at: new Date().toISOString() })
      })
    },
  },
  referralCodes: {
    getAll: () => [...readPersistentStore().referralCodes],
    getByCode: (code: string) => readPersistentStore().referralCodes.find((r) => r.code === code.toUpperCase()),
    add: (code: Omit<ReferralCode, 'id' | 'current_uses' | 'created_at'>) => {
      return withStore((s) => {
        const row = { ...code, code: code.code.toUpperCase(), id: `ref-${Date.now()}`, current_uses: 0, created_at: new Date().toISOString() }
        s.referralCodes.push(row)
        return row
      })
    },
    incrementUsage: (code: string) => {
      return withStore((s) => {
        const r = s.referralCodes.find((x) => x.code === code)
        if (r) r.current_uses += 1
      })
    },
    update: (id: string, updates: Partial<ReferralCode>) => {
      return withStore((s) => {
        const r = s.referralCodes.find((x) => x.id === id)
        if (r) Object.assign(r, updates)
      })
    },
    delete: (id: string) => {
      return withStore((s) => {
        const i = s.referralCodes.findIndex((x) => x.id === id)
        if (i !== -1) s.referralCodes.splice(i, 1)
      })
    },
  },
  vouches: {
    getAll: () => [...readPersistentStore().vouches],
    add: (v: Omit<Vouch, 'id' | 'created_at'>) => {
      return withStore((s) => {
        const row = { ...v, id: `vouch-${Date.now()}`, created_at: new Date().toISOString() }
        s.vouches.push(row)
        return row
      })
    },
    update: (id: string, updates: Partial<Vouch>) => {
      return withStore((s) => {
        const v = s.vouches.find((x) => x.id === id)
        if (v) Object.assign(v, updates)
      })
    },
    delete: (id: string) => {
      return withStore((s) => {
        const i = s.vouches.findIndex((x) => x.id === id)
        if (i !== -1) s.vouches.splice(i, 1)
      })
    },
  },
  messages: {
    getAll: () => store.contact.getAll(),
    update: (id: string, updates: Partial<ContactSubmission>) => {
      return withStore((s) => {
        const m = s.messages.find((x) => x.id === id)
        if (m) Object.assign(m, updates)
      })
    },
    delete: (id: string) => {
      return withStore((s) => {
        const i = s.messages.findIndex((x) => x.id === id)
        if (i !== -1) s.messages.splice(i, 1)
      })
    },
  },
}
