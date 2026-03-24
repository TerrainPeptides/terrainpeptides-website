import fs from 'fs'
import path from 'path'

import type { ContactSubmission, Order, OrderItem, Product, ReferralCode, Vouch } from '@/lib/types'
import { seedProducts, seedVouches } from '@/lib/seed-data'

const GHK_CU_SLUG = 'ghk-cu'
function getGhkCuProduct(): Product {
  return seedProducts.find((p) => p.slug === GHK_CU_SLUG)!
}

const SELANK_SLUG = 'selank'
function getSelankProduct(): Product {
  return seedProducts.find((p) => p.slug === SELANK_SLUG)!
}

export interface DiscountCode {
  id: string
  code: string
  percent_off: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export interface PersistentStoreData {
  products: Product[]
  vouches: Vouch[]
  referralCodes: ReferralCode[]
  discountCodes: DiscountCode[]
  orders: Order[]
  orderItems: OrderItem[]
  messages: ContactSubmission[]
}

const STORE_FILE = path.join(process.cwd(), 'data', 'store.json')

function ensureSeed(): PersistentStoreData {
  return {
    products: [...seedProducts],
    vouches: [...seedVouches],
    referralCodes: [],
    discountCodes: [],
    orders: [],
    orderItems: [],
    messages: [],
  }
}

export function readPersistentStore(): PersistentStoreData {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true })
      const seed = ensureSeed()
      fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), 'utf8')
      return seed
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as PersistentStoreData
    const merged: PersistentStoreData = {
      ...ensureSeed(),
      ...parsed,
      products: parsed.products?.length ? parsed.products : ensureSeed().products,
      vouches: parsed.vouches?.length ? parsed.vouches : ensureSeed().vouches,
      referralCodes: parsed.referralCodes ?? [],
      discountCodes: parsed.discountCodes ?? [],
      orders: parsed.orders ?? [],
      orderItems: parsed.orderItems ?? [],
      messages: parsed.messages ?? [],
    }
    merged.products = merged.products.map((p) => ({
      ...p,
      vial_count: p.vial_count ?? 1,
      research_studies: p.research_studies ?? null,
      stock_level: p.stock_level ?? null,
    }))
    if (!merged.products.some((p) => p.slug === GHK_CU_SLUG)) {
      merged.products.push(getGhkCuProduct())
    }
    if (!merged.products.some((p) => p.slug === SELANK_SLUG)) {
      merged.products.push(getSelankProduct())
    }
    merged.orders = merged.orders.map((o) => ({
      ...o,
      discount_code: o.discount_code ?? null,
    }))
    return merged
  } catch {
    const seed = ensureSeed()
    try {
      fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true })
      fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), 'utf8')
    } catch {
      // ignore
    }
    return seed
  }
}

export function writePersistentStore(next: PersistentStoreData) {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true })
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2), 'utf8')
}

