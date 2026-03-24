import type { Product } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { productFromDbRow } from '@/lib/product-from-row'

export async function getProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const supabase = supabaseAdmin()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    if (error) return null
    return (data || []).map((row: Record<string, unknown>) => productFromDbRow(row))
  } catch {
    return null
  }
}
