export interface ProductDosageVariant {
  id: string
  label: string
  price_cents: number
}

/** Shop / catalog taxonomy (filters on /shop) */
export type ProductCategory =
  | 'fat-loss'
  | 'skin-collagen'
  | 'sleep'
  | 'cognitive'
  | 'performance'

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  description: string | null
  overview: string | null
  price_cents: number
  /** Multiple purchasable strengths; when set, pricing uses the selected variant. Order = display order; first is default. */
  dosage_variants?: ProductDosageVariant[] | null
  dosage: string | null
  purity: string | null
  molecular_weight: string | null
  sequence: string | null
  research_benefits: string[] | null
  research_studies: string | null
  in_stock: boolean
  stock_level: number | null
  featured: boolean
  image_url: string | null
  coa_url: string | null
  vial_count?: number
  hidden?: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  email: string
  /** Row `customer_email` when different from normalized `email` */
  customer_email?: string | null
  /** Set from checkout / Supabase `customer_name` when available */
  customer_name?: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'stripe' | 'crypto' | 'paypal' | string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  stripe_session_id: string | null
  crypto_address: string | null
  subtotal_cents: number
  discount_cents: number
  total_cents: number
  shipping_address: ShippingAddress | null
  tracking_number: string | null
  referral_code: string | null
  discount_code: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  /** Full `orders` row from the database (admin API). */
  full_record?: Record<string, unknown>
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  /** Unit price in cents (legacy admin UI). */
  price_cents: number
  /** Line total when provided by the admin API. */
  line_total_cents?: number
  created_at: string
  /** Raw `order_items` row for admin debugging. */
  full_item?: Record<string, unknown>
}

export interface ShippingAddress {
  name: string
  email?: string
  phone?: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  /** Checkout snapshot (cents), when stored with the address JSON */
  shipping_cents?: number
  tax_cents?: number
}

export interface Vouch {
  id: string
  author_name: string
  rating: number
  content: string
  product_id: string | null
  verified: boolean
  approved: boolean
  created_at: string
}

export interface ReferralCode {
  id: string
  code: string
  discount_percent: number
  max_uses: number | null
  current_uses: number
  active: boolean
  created_at: string
  expires_at: string | null
  owner_email?: string | null
  paid_commission_cents?: number
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  /** Matches `ProductDosageVariant.id`, or `DEFAULT_CART_VARIANT_ID` when product has no variants. */
  dosage_variant_id: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
