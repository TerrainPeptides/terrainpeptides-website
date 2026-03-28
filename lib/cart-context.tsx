'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { packageLineTotalCents } from './product-price'
import { getDefaultDosageVariantId } from './dosage-variants'
import { LEGACY_LOCAL_STORAGE_KEYS } from './legacy-brand-storage'
import type { Product, CartItem } from './types'

interface CartContextType {
  /** False until cart has been read from localStorage (avoids empty flash / wrong persist on reload). */
  isCartHydrated: boolean
  items: CartItem[]
  addItem: (product: Product, quantity?: number, dosage_variant_id?: string) => void
  removeItem: (productId: string, dosage_variant_id: string) => void
  updateQuantity: (productId: string, quantity: number, dosage_variant_id: string) => void
  clearCart: () => void
  totalItems: number
  subtotalCents: number
  discountCents: number
  totalCents: number
  referralCode: string | null
  setReferralCode: (code: string | null) => void
  discountPercent: number
  setDiscountPercent: (percent: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_CART = 'terrain-cart'
const LS_REFERRAL = 'terrain-referral'
const LS_DISCOUNT = 'terrain-discount'
function migrateLegacyCartKeys() {
  const pairs: [string, string][] = [
    [LEGACY_LOCAL_STORAGE_KEYS.cart, LS_CART],
    [LEGACY_LOCAL_STORAGE_KEYS.referral, LS_REFERRAL],
    [LEGACY_LOCAL_STORAGE_KEYS.discount, LS_DISCOUNT],
  ]
  for (const [oldKey, newKey] of pairs) {
    if (!localStorage.getItem(newKey)) {
      const v = localStorage.getItem(oldKey)
      if (v != null) localStorage.setItem(newKey, v)
    }
    localStorage.removeItem(oldKey)
  }
}

function normalizeSavedCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const o = entry as Record<string, unknown>
      const product = o.product as Product | undefined
      const quantity = Number(o.quantity)
      if (!product || !product.id || !Number.isFinite(quantity) || quantity < 1) return null
      const dosage_variant_id =
        typeof o.dosage_variant_id === 'string' && o.dosage_variant_id
          ? o.dosage_variant_id
          : getDefaultDosageVariantId(product)
      return { product, quantity, dosage_variant_id }
    })
    .filter((x): x is CartItem => x != null)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isCartHydrated, setIsCartHydrated] = useState(false)
  /** Prevents writing [] to localStorage before the initial restore commit is applied (reload bug). */
  const allowPersistRef = useRef(false)

  useEffect(() => {
    migrateLegacyCartKeys()
    const savedCart = localStorage.getItem(LS_CART)
    const savedCode = localStorage.getItem(LS_REFERRAL)
    const savedDiscount = localStorage.getItem(LS_DISCOUNT)

    let restored: CartItem[] = []
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        restored = normalizeSavedCartItems(parsed)
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
    setItems(restored)
    if (savedCode) setReferralCode(savedCode)
    if (savedDiscount) setDiscountPercent(Number(savedDiscount))
    allowPersistRef.current = true
    setIsCartHydrated(true)
  }, [])

  useEffect(() => {
    if (!isCartHydrated || !allowPersistRef.current) return
    localStorage.setItem(LS_CART, JSON.stringify(items))
  }, [items, isCartHydrated])

  useEffect(() => {
    if (isCartHydrated && referralCode) {
      localStorage.setItem(LS_REFERRAL, referralCode)
      localStorage.setItem(LS_DISCOUNT, String(discountPercent))
    }
  }, [referralCode, discountPercent, isCartHydrated])

  const addItem = (product: Product, quantity = 1, dosage_variant_id?: string) => {
    const vid = dosage_variant_id ?? getDefaultDosageVariantId(product)
    setItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.dosage_variant_id === vid
      )
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { product, quantity, dosage_variant_id: vid }]
    })
  }

  const removeItem = (productId: string, dosage_variant_id: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.dosage_variant_id === dosage_variant_id)
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, dosage_variant_id: string) => {
    if (quantity <= 0) {
      removeItem(productId, dosage_variant_id)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.dosage_variant_id === dosage_variant_id
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setReferralCode(null)
    setDiscountPercent(0)
    localStorage.removeItem(LS_CART)
    localStorage.removeItem(LS_REFERRAL)
    localStorage.removeItem(LS_DISCOUNT)
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.cart)
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.referral)
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.discount)
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalCents = items.reduce(
    (sum, item) =>
      sum + packageLineTotalCents(item.product, item.quantity, item.dosage_variant_id),
    0
  )
  const discountCents = Math.round(subtotalCents * (discountPercent / 100))
  const totalCents = subtotalCents - discountCents

  return (
    <CartContext.Provider
      value={{
        isCartHydrated,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalCents,
        discountCents,
        totalCents,
        referralCode,
        setReferralCode,
        discountPercent,
        setDiscountPercent,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
